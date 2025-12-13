/**
 * Posts Domain Service
 * 
 * Handles all post-related data access and business logic.
 * Components should use this service instead of touching Firestore directly.
 */

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/firebase';
import type { Post, PostFormData, PostItem, CreatePostResult } from '@/types';
import { generateSearchKeywords } from '@/domain/search/keywords';
import { extractExifData } from './exif';
import { logger } from '@/core/utils/logger';
import { normalizePost } from '@/core/schemas/firestoreModels';

const POSTS_COLLECTION = 'posts';
const MAX_IMAGES_PER_POST = 10;

/**
 * Create a new post with multiple images
 */
export async function createPost(
    userId: string,
    userName: string,
    userPhotoURL: string | undefined,
    formData: PostFormData
): Promise<CreatePostResult> {
    if (formData.slides.length === 0) {
        throw new Error('At least one image is required');
    }

    if (formData.slides.length > MAX_IMAGES_PER_POST) {
        throw new Error(`Maximum ${MAX_IMAGES_PER_POST} images allowed per post`);
    }

    // Upload all images to Storage and extract EXIF
    const items: PostItem[] = await Promise.all(
        formData.slides.map(async (slide) => {
            const file = slide.file;
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `posts/${userId}/${fileName}`);

            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            // Extract EXIF data
            const exif = await extractExifData(file);

            return {
                type: 'image' as const,
                url,
                caption: slide.caption,
                exif,
                addToShop: slide.addToShop,
                printSizes: slide.printSizes,
                customPrices: slide.customPrices,
            };
        })
    );

    // Generate search keywords
    const searchKeywords = generateSearchKeywords({
        displayName: userName,
        title: formData.title,
        tags: formData.tags,
        location: formData.location,
    });

    // Check user tier for Ultra status
    const { getUserTier, USER_TIERS } = await import('@/core/services/firestore/monetization.service');
    const tier = await getUserTier(userId);
    const isUltra = tier === USER_TIERS.ULTRA;

    // Create post document
    const postData = {
        authorId: userId,
        authorName: userName,
        authorPhoto: userPhotoURL,
        title: formData.title,
        description: formData.description || '',
        items,
        tags: formData.tags,
        location: formData.location || { city: '', state: '', country: '' },
        imageUrl: items[0]?.url, // Legacy field for backwards compatibility
        searchKeywords,
        createdAt: serverTimestamp(),
        likeCount: 0,
        commentCount: 0,
        shopLinked: items.some(item => item.addToShop),
        authorIsUltra: isUltra, // Monetization flag
    };

    const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData);

    // We can use normalizePost here too if we fetched it, but constructing it manually is fine for the return
    // provided we match the shape.
    const post: Post = {
        ...postData,
        id: docRef.id,
        createdAt: Timestamp.now(),
        // Manual construction here is safe as we just created it with known data. 
        // But better to be typesafe.
    } as unknown as Post;

    // Shop items will be created by Cloud Function trigger
    // or can be created here via shopService.createFromPost(post)

    return { post, shopItems: [] };
}

/**
 * Get a single post by ID
 */
export async function getPostById(postId: string): Promise<Post | null> {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return normalizePost(docSnap);
}

/**
 * Get posts by author
 */
export async function getPostsByAuthor(
    authorId: string,
    limitCount: number = 20,
    startAfterDoc?: any
): Promise<Post[]> {
    let q = query(
        collection(db, POSTS_COLLECTION),
        where('authorId', '==', authorId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(normalizePost);
}

/**
 * Get recent posts for feed
 */
export async function getRecentPosts(
    limitCount: number = 10,
    startAfterDoc?: any
): Promise<{ posts: Post[]; lastDoc: any }> {
    let q = query(
        collection(db, POSTS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
    }

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(normalizePost);

    const lastDoc = snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1]
        : null;

    return { posts, lastDoc };
}

/**
 * Update post metadata
 */
export async function updatePost(
    postId: string,
    updates: {
        title?: string;
        description?: string;
        tags?: string[];
        location?: { city?: string; state?: string; country?: string };
    }
): Promise<void> {
    const docRef = doc(db, POSTS_COLLECTION, postId);

    // Regenerate search keywords if relevant fields changed
    let searchKeywords: string[] | undefined;
    if (updates.title || updates.tags || updates.location) {
        const postDoc = await getDoc(docRef);
        // Safely get data for keyword generation
        if (postDoc.exists()) {
            const currentPost = normalizePost(postDoc);
            searchKeywords = generateSearchKeywords({
                displayName: currentPost.authorName,
                title: updates.title || currentPost.title,
                tags: updates.tags || currentPost.tags,
                location: updates.location || currentPost.location,
            });
        }
    }

    await updateDoc(docRef, {
        ...updates,
        ...(searchKeywords && { searchKeywords }),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete a post and all associated images
 */
export async function deletePost(postId: string, userId: string): Promise<void> {
    const post = await getPostById(postId);

    if (!post) {
        throw new Error('Post not found');
    }

    if (post.authorId !== userId) {
        throw new Error('Unauthorized: You can only delete your own posts');
    }

    // Delete images from Storage
    const deletePromises = post.items
        .filter(item => item.type === 'image' && item.url)
        .map(item => {
            const imageRef = ref(storage, item.url!);
            return deleteObject(imageRef).catch(err => {
                logger.warn('Failed to delete image:', item.url, err);
            });
        });

    await Promise.all(deletePromises);

    // Delete post document
    await deleteDoc(doc(db, POSTS_COLLECTION, postId));
}

/**
 * Increment likes count
 */
export async function incrementLikes(postId: string): Promise<void> {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const postDoc = await getDoc(docRef);
    const currentCount = postDoc.data()?.likesCount || 0;

    await updateDoc(docRef, {
        likesCount: currentCount + 1,
    });
}

/**
 * Decrement likes count
 */
export async function decrementLikes(postId: string): Promise<void> {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const postDoc = await getDoc(docRef);
    const currentCount = postDoc.data()?.likesCount || 0;

    await updateDoc(docRef, {
        likesCount: Math.max(0, currentCount - 1),
    });
}
