import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Posts Service
 * Core logic for fetching, creating, and managing posts.
 */

// ============================================================================
// FETCH QUERIES
// ============================================================================

/**
 * Fetch published posts for a user (for profile/feed display)
 */
export const fetchPublishedPosts = async (userId: string, limitCount = 20) => {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount + 10)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((post: any) => post.status !== 'draft');
    } catch (error) {
        console.error('Error fetching published posts:', error);
        return [];
    }
};

/**
 * Fetch draft posts for a user
 */
export const fetchDrafts = async (userId: string) => {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('userId', '==', userId),
            where('status', '==', 'draft'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching drafts:', error);
        return [];
    }
};

/**
 * Fetch feed posts (published only)
 */
export const fetchFeedPosts = async (limitCount = 20) => {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            orderBy('createdAt', 'desc'),
            limit(limitCount + 5)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((post: any) => post.status !== 'draft');
    } catch (error) {
        console.error('Error fetching feed posts:', error);
        return [];
    }
};
