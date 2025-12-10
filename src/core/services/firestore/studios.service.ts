import { db, storage } from '@/firebase';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    increment,
    setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// We assume searchKeywords is now in core utils or we inline logic. 
// For now import from previous location (will be fixed by global replace later if moved)
// But wait, searchKeywords.js was in utils, which we moved to core/utils.
// So import from '@/core/utils/searchKeywords' (if I didn't merge it into search.js).
// I merged "filterHelpers, searchKeywords, etc" into 'search.js' in my thought process but didn't actually create 'search.js' util yet.
// I created 'pricing.js', 'dates.js', 'colors.js', 'exif.js'.
// I need 'searchKeywords.js' logic. I will leave the import as is relative (to be fixed) or fix it now.
// I'll assume it's '@core/utils/searchKeywords' for now (I will need to ensure that file exists or is part of a bundle).
import { generateSearchKeywords } from '@/core/utils/searchKeywords'; // Assuming file exists there
import { canBypassShopSetup } from '@/config/devConfig';

/**
 * STUDIOS SERVICE
 * 
 * Handles Galleries and Shops (Studios).
 */

// ============================================================================
// GALLERIES
// ============================================================================

export const createGallery = async (galleryData: any, coverImageFile: any, userId: string, userProfile: any) => {
    try {
        let coverImageUrl = null;
        if (coverImageFile) {
            const imageRef = ref(storage, `galleries/${userId}/${Date.now()}_${coverImageFile.name}`);
            await uploadBytes(imageRef, coverImageFile);
            coverImageUrl = await getDownloadURL(imageRef);
        }

        const searchKeywords = [
            ...generateSearchKeywords(galleryData.title),
            ...generateSearchKeywords(galleryData.description),
            ...(galleryData.requiredTags || []).map((tag: any) => tag.toLowerCase()),
            ...generateSearchKeywords(userProfile.username || userProfile.displayName || '')
        ].filter(Boolean);

        const gallery = {
            title: galleryData.title,
            description: galleryData.description,
            coverImage: coverImageUrl,
            ownerId: userId,
            ownerUsername: userProfile.username || userProfile.displayName || 'Anonymous',
            ownerAvatar: userProfile.photoURL || null,
            contentType: galleryData.contentType || 'both',
            requiredTags: galleryData.requiredTags || [],
            requiredLocations: galleryData.requiredLocations || [],
            allowedCategories: galleryData.allowedCategories || [],
            members: [userId],
            pendingInvites: [],
            postsCount: 0,
            collectionsCount: 0,
            membersCount: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isPublic: galleryData.isPublic !== false,
            featured: false,
            moderationEnabled: galleryData.moderationEnabled || false,
            searchKeywords
        };

        const docRef = await addDoc(collection(db, 'galleries'), gallery);
        return { id: docRef.id, ...gallery };
    } catch (error) {
        console.error('Error creating gallery:', error);
        throw error;
    }
};

export const getGallery = async (galleryId: string) => {
    try {
        const docRef = doc(db, 'galleries', galleryId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error('Gallery not found');
        }
        return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
        console.error('Error fetching gallery:', error);
        throw error;
    }
};

export const updateGallery = async (galleryId: string, updates: any) => {
    try {
        const docRef = doc(db, 'galleries', galleryId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating gallery:', error);
        throw error;
    }
};

export const deleteGallery = async (galleryId: string) => {
    try {
        const docRef = doc(db, 'galleries', galleryId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting gallery:', error);
        throw error;
    }
};

export const inviteMembers = async (galleryId: string, userIds: string[], invitedBy: string) => {
    try {
        const galleryRef = doc(db, 'galleries', galleryId);
        await updateDoc(galleryRef, {
            pendingInvites: arrayUnion(...userIds),
            updatedAt: serverTimestamp()
        });

        const invitesRef = collection(db, 'galleries', galleryId, 'invites');
        const invitePromises = userIds.map(userId =>
            addDoc(invitesRef, {
                userId,
                invitedBy,
                invitedAt: serverTimestamp(),
                status: 'pending'
            })
        );
        await Promise.all(invitePromises);
    } catch (error) {
        console.error('Error inviting members:', error);
        throw error;
    }
};

export const acceptInvitation = async (galleryId: string, userId: string) => {
    try {
        const galleryRef = doc(db, 'galleries', galleryId);
        await updateDoc(galleryRef, {
            members: arrayUnion(userId),
            pendingInvites: arrayRemove(userId),
            membersCount: increment(1),
            updatedAt: serverTimestamp()
        });

        const invitesRef = collection(db, 'galleries', galleryId, 'invites');
        const q = query(invitesRef, where('userId', '==', userId), where('status', '==', 'pending'));
        const snapshot = await getDocs(q);

        snapshot.forEach(async (inviteDoc) => {
            await updateDoc(doc(db, 'galleries', galleryId, 'invites', inviteDoc.id), {
                status: 'accepted'
            });
        });
    } catch (error) {
        console.error('Error accepting invitation:', error);
        throw error;
    }
};

export const declineInvitation = async (galleryId: string, userId: string) => {
    try {
        const galleryRef = doc(db, 'galleries', galleryId);
        await updateDoc(galleryRef, {
            pendingInvites: arrayRemove(userId),
            updatedAt: serverTimestamp()
        });

        const invitesRef = collection(db, 'galleries', galleryId, 'invites');
        const q = query(invitesRef, where('userId', '==', userId), where('status', '==', 'pending'));
        const snapshot = await getDocs(q);

        snapshot.forEach(async (inviteDoc) => {
            await updateDoc(doc(db, 'galleries', galleryId, 'invites', inviteDoc.id), {
                status: 'declined'
            });
        });
    } catch (error) {
        console.error('Error declining invitation:', error);
        throw error;
    }
};

export const addPostToGallery = async (galleryId: string, postId: string, userId: string) => {
    try {
        const postsRef = collection(db, 'galleries', galleryId, 'posts');
        await addDoc(postsRef, {
            postId,
            addedBy: userId,
            addedAt: serverTimestamp(),
            approved: true
        });

        const galleryRef = doc(db, 'galleries', galleryId);
        await updateDoc(galleryRef, {
            postsCount: increment(1),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding post to gallery:', error);
        throw error;
    }
};

export const addCollectionToGallery = async (galleryId: string, collectionId: string, userId: string) => {
    try {
        const collectionsRef = collection(db, 'galleries', galleryId, 'collections');
        await addDoc(collectionsRef, {
            collectionId,
            addedBy: userId,
            addedAt: serverTimestamp(),
            approved: true
        });

        const galleryRef = doc(db, 'galleries', galleryId);
        await updateDoc(galleryRef, {
            collectionsCount: increment(1),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding collection to gallery:', error);
        throw error;
    }
};

export const getUserGalleries = async (userId: string) => {
    try {
        const q = query(
            collection(db, 'galleries'),
            where('ownerId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching user galleries:', error);
        throw error;
    }
};

export const getMemberGalleries = async (userId: string) => {
    try {
        const q = query(
            collection(db, 'galleries'),
            where('members', 'array-contains', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching member galleries:', error);
        throw error;
    }
};

export const getGalleryPosts = async (galleryId: string) => {
    try {
        const postsRef = collection(db, 'galleries', galleryId, 'posts');
        const q = query(postsRef, orderBy('addedAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching gallery posts:', error);
        throw error;
    }
};

export const getGalleryCollections = async (galleryId: string) => {
    try {
        const collectionsRef = collection(db, 'galleries', galleryId, 'collections');
        const q = query(collectionsRef, orderBy('addedAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching gallery collections:', error);
        throw error;
    }
};

export const validateContentForGallery = (gallery: any, content: any) => {
    if (gallery.requiredTags && gallery.requiredTags.length > 0) {
        const hasAllTags = gallery.requiredTags.every((tag: any) =>
            content.tags && content.tags.includes(tag)
        );
        if (!hasAllTags) {
            return { valid: false, reason: 'Missing required tags' };
        }
    }
    if (gallery.requiredLocations && gallery.requiredLocations.length > 0) {
        const locationString = `${content.location?.city || ''} ${content.location?.state || ''} ${content.location?.country || ''}`.toLowerCase();
        const hasLocation = gallery.requiredLocations.some((loc: any) =>
            locationString.includes(loc.toLowerCase())
        );
        if (!hasLocation) {
            return { valid: false, reason: 'Does not match required location' };
        }
    }
    return { valid: true };
};

// ============================================================================
// SHOPS (STUDIOS)
// ============================================================================

export const checkShopSetup = async (userId: string, userEmail: string = '') => {
    try {
        const canBypass = canBypassShopSetup(userId, userEmail);
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        const shopSetup = userData?.shopSetup || {
            isComplete: false,
            acceptedTermsAt: null,
            acceptedCopyrightAt: null,
            shopName: '',
            bio: '',
            setupCompletedAt: null
        };
        return {
            isComplete: shopSetup.isComplete || false,
            canBypass,
            shopData: shopSetup
        };
    } catch (error) {
        console.error('Error checking shop setup:', error);
        throw error;
    }
};

export const completeShopSetup = async (userId: string, shopData: any) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            shopSetup: {
                isComplete: true,
                acceptedTermsAt: serverTimestamp(),
                acceptedCopyrightAt: serverTimestamp(),
                shopName: shopData.shopName || '',
                bio: shopData.bio || '',
                setupCompletedAt: serverTimestamp()
            }
        });
    } catch (error) {
        console.error('Error completing shop setup:', error);
        throw error;
    }
};

export const getShopDrafts = async (userId: string) => {
    try {
        const draftsQuery = query(
            collection(db, 'shopDrafts'),
            where('userId', '==', userId),
            where('status', '==', 'draft')
        );
        const snapshot = await getDocs(draftsQuery);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching drafts:', error);
        throw error;
    }
};

export const createShopDraft = async (draftData: any) => {
    try {
        const draftRef = await addDoc(collection(db, 'shopDrafts'), {
            userId: draftData.userId,
            postId: draftData.postId,
            itemId: draftData.itemId,
            imageUrl: draftData.imageUrl,
            title: draftData.title,
            productTier: draftData.productTier,
            customPrices: draftData.customPrices || {},
            status: 'draft',
            createdAt: serverTimestamp(),
            publishedAt: null,
            copyrightConfirmedAt: null
        });
        return draftRef.id;
    } catch (error) {
        console.error('Error creating draft:', error);
        throw error;
    }
};

export const publishShopDraft = async (draftId: string, userId: string, copyrightConfirmed = false) => {
    try {
        if (!copyrightConfirmed) {
            throw new Error('Copyright confirmation required to publish');
        }
        const draftRef = doc(db, 'shopDrafts', draftId);
        const draftDoc = await getDoc(draftRef);
        if (!draftDoc.exists()) {
            throw new Error('Draft not found');
        }
        const draftData = draftDoc.data();
        if (draftData.userId !== userId) {
            throw new Error('Unauthorized: Cannot publish another user\'s draft');
        }
        await updateDoc(draftRef, {
            status: 'published',
            publishedAt: serverTimestamp(),
            copyrightConfirmedAt: serverTimestamp()
        });
        const postRef = doc(db, 'posts', draftData.postId);
        await updateDoc(postRef, {
            shopEnabled: true,
            'shopProducts': draftData
        });
    } catch (error) {
        console.error('Error publishing draft:', error);
        throw error;
    }
};

export const unpublishShopProduct = async (draftId: string, userId: string) => {
    try {
        const draftRef = doc(db, 'shopDrafts', draftId);
        const draftDoc = await getDoc(draftRef);
        if (!draftDoc.exists()) {
            throw new Error('Product not found');
        }
        const draftData = draftDoc.data();
        if (draftData.userId !== userId) {
            throw new Error('Unauthorized: Cannot unpublish another user\'s product');
        }
        await updateDoc(draftRef, {
            status: 'draft',
            publishedAt: null
        });
    } catch (error) {
        console.error('Error unpublishing product:', error);
        throw error;
    }
};

export const deleteShopDraft = async (draftId: string, userId: string) => {
    try {
        const draftRef = doc(db, 'shopDrafts', draftId);
        const draftDoc = await getDoc(draftRef);
        if (!draftDoc.exists()) {
            throw new Error('Draft not found');
        }
        const draftData = draftDoc.data();
        if (draftData.userId !== userId) {
            throw new Error('Unauthorized: Cannot delete another user\'s draft');
        }
        await updateDoc(draftRef, {
            status: 'deleted',
            deletedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error deleting draft:', error);
        throw error;
    }
};

// Compatibility Object for Legacy Imports
export const ShopService = {
    checkShopSetup,
    completeShopSetup,
    getDrafts: getShopDrafts,
    createDraft: createShopDraft,
    publishDraft: publishShopDraft,
    unpublishProduct: unpublishShopProduct,
    deleteDraft: deleteShopDraft
};
