// Utility functions for fetching posts by status
// Utility functions for fetching posts by status

import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Fetch published posts for a user (for profile/feed display)
 * Handles legacy posts (missing status) by filtering in memory
 */
export const fetchPublishedPosts = async (userId, limitCount = 20) => {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount + 10) // Fetch extra to account for drafts
        );

        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(post => post.status !== 'draft');
    } catch (error) {
        console.error('Error fetching published posts:', error);
        return [];
    }
};

/**
 * Fetch draft posts for a user (for draft picker)
 */
export const fetchDrafts = async (userId) => {
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
 * Fetch all posts for feed (published only)
 * Handles legacy posts by filtering in memory
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
            .filter(post => post.status !== 'draft');
    } catch (error) {
        console.error('Error fetching feed posts:', error);
        return [];
    }
};
