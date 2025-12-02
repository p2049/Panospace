import { db, storage } from '../firebase';
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
    increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Gallery Service
 * Handles all gallery-related operations including creation, updates,
 * member management, and content addition
 */

// Create a new gallery (Premium users only)
export const createGallery = async (galleryData, coverImageFile, userId, userProfile) => {
    try {
        // Upload cover image if provided
        let coverImageUrl = null;
        if (coverImageFile) {
            const imageRef = ref(storage, `galleries/${userId}/${Date.now()}_${coverImageFile.name}`);
            await uploadBytes(imageRef, coverImageFile);
            coverImageUrl = await getDownloadURL(imageRef);
        }

        // Build search keywords
        const searchKeywords = [
            ...galleryData.title.toLowerCase().split(' '),
            ...galleryData.description.toLowerCase().split(' '),
            ...(galleryData.requiredTags || []).map(tag => tag.toLowerCase()),
            (userProfile.username || userProfile.displayName || '').toLowerCase()
        ].filter(Boolean);

        const gallery = {
            title: galleryData.title,
            description: galleryData.description,
            coverImage: coverImageUrl,

            // Owner info
            ownerId: userId,
            ownerUsername: userProfile.username || userProfile.displayName || 'Anonymous',
            ownerAvatar: userProfile.photoURL || null,

            // Settings
            contentType: galleryData.contentType || 'both', // 'posts', 'collections', 'both'

            // Criteria
            requiredTags: galleryData.requiredTags || [],
            requiredLocations: galleryData.requiredLocations || [],
            allowedCategories: galleryData.allowedCategories || [],

            // Members (owner is automatically a member)
            members: [userId],
            pendingInvites: [],

            // Stats
            postsCount: 0,
            collectionsCount: 0,
            membersCount: 1,

            // Metadata
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isPublic: galleryData.isPublic !== false, // Default to public
            featured: false,
            moderationEnabled: galleryData.moderationEnabled || false,

            // Search
            searchKeywords
        };

        const docRef = await addDoc(collection(db, 'galleries'), gallery);
        return { id: docRef.id, ...gallery };
    } catch (error) {
        console.error('Error creating gallery:', error);
        throw error;
    }
};

// Get gallery by ID
export const getGallery = async (galleryId) => {
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

// Update gallery
export const updateGallery = async (galleryId, updates) => {
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

// Delete gallery
export const deleteGallery = async (galleryId) => {
    try {
        const docRef = doc(db, 'galleries', galleryId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting gallery:', error);
        throw error;
    }
};

// Invite members to gallery
export const inviteMembers = async (galleryId, userIds, invitedBy) => {
    try {
        const galleryRef = doc(db, 'galleries', galleryId);

        // Add to pending invites
        await updateDoc(galleryRef, {
            pendingInvites: arrayUnion(...userIds),
            updatedAt: serverTimestamp()
        });

        // Create invite documents
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

// Accept gallery invitation
export const acceptInvitation = async (galleryId, userId) => {
    try {
        const galleryRef = doc(db, 'galleries', galleryId);

        // Add user to members, remove from pending
        await updateDoc(galleryRef, {
            members: arrayUnion(userId),
            pendingInvites: arrayRemove(userId),
            membersCount: increment(1),
            updatedAt: serverTimestamp()
        });

        // Update invite status
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

// Decline gallery invitation
export const declineInvitation = async (galleryId, userId) => {
    try {
        const galleryRef = doc(db, 'galleries', galleryId);

        // Remove from pending invites
        await updateDoc(galleryRef, {
            pendingInvites: arrayRemove(userId),
            updatedAt: serverTimestamp()
        });

        // Update invite status
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

// Add post to gallery
export const addPostToGallery = async (galleryId, postId, userId) => {
    try {
        const postsRef = collection(db, 'galleries', galleryId, 'posts');
        await addDoc(postsRef, {
            postId,
            addedBy: userId,
            addedAt: serverTimestamp(),
            approved: true // Auto-approve for now, can add moderation later
        });

        // Update gallery post count
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

// Add collection to gallery
export const addCollectionToGallery = async (galleryId, collectionId, userId) => {
    try {
        const collectionsRef = collection(db, 'galleries', galleryId, 'collections');
        await addDoc(collectionsRef, {
            collectionId,
            addedBy: userId,
            addedAt: serverTimestamp(),
            approved: true
        });

        // Update gallery collection count
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

// Get galleries where user is owner
export const getUserGalleries = async (userId) => {
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

// Get galleries where user is a member
export const getMemberGalleries = async (userId) => {
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

// Get gallery posts
export const getGalleryPosts = async (galleryId) => {
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

// Get gallery collections
export const getGalleryCollections = async (galleryId) => {
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

// Check if content meets gallery criteria
export const validateContentForGallery = (gallery, content) => {
    // Check required tags
    if (gallery.requiredTags && gallery.requiredTags.length > 0) {
        const hasAllTags = gallery.requiredTags.every(tag =>
            content.tags && content.tags.includes(tag)
        );
        if (!hasAllTags) {
            return { valid: false, reason: 'Missing required tags' };
        }
    }

    // Check required locations
    if (gallery.requiredLocations && gallery.requiredLocations.length > 0) {
        const locationString = `${content.location?.city || ''} ${content.location?.state || ''} ${content.location?.country || ''}`.toLowerCase();
        const hasLocation = gallery.requiredLocations.some(loc =>
            locationString.includes(loc.toLowerCase())
        );
        if (!hasLocation) {
            return { valid: false, reason: 'Does not match required location' };
        }
    }

    return { valid: true };
};
