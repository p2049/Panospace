import { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export const useParks = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Get all posts for a specific park
     * @param {string} parkId - The park ID to filter by
     * @returns {Promise<Array>} Array of post documents
     */
    const getParkPosts = async (parkId) => {
        if (!parkId) return [];

        setLoading(true);
        setError(null);

        try {
            const postsRef = collection(db, 'posts');
            const q = query(
                postsRef,
                where('parkId', '==', parkId),
                orderBy('createdAt', 'desc'),
                limit(100)
            );

            const snapshot = await getDocs(q);
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return posts;
        } catch (err) {
            console.error('Error fetching park posts:', err);
            setError(err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get all posts that have any park association
     * @returns {Promise<Array>} Array of post documents
     */
    const getAllParkPosts = async () => {
        setLoading(true);
        setError(null);

        try {
            const postsRef = collection(db, 'posts');
            const q = query(
                postsRef,
                where('parkId', '!=', null),
                orderBy('parkId'),
                orderBy('createdAt', 'desc'),
                limit(100)
            );

            const snapshot = await getDocs(q);
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return posts;
        } catch (err) {
            console.error('Error fetching all park posts:', err);
            setError(err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        getParkPosts,
        getAllParkPosts,
        loading,
        error
    };
};
