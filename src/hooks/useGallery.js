import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getGallery } from '../services/galleryService';

/**
 * Hook to fetch a single gallery by ID
 * @param {string} galleryId - Gallery ID to fetch
 * @returns {object} { gallery, loading, error, refetch }
 */
export const useGallery = (galleryId) => {
    const [gallery, setGallery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        if (!galleryId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const galleryData = await getGallery(galleryId);
            setGallery(galleryData);
        } catch (err) {
            console.error('Error fetching gallery:', err);
            setError(err.message || 'Failed to load gallery');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [galleryId]);

    return { gallery, loading, error, refetch };
};

export default useGallery;
