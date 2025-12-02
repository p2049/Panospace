import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getMagazineIssues } from '../services/magazineService';

/**
 * Hook to fetch a magazine and its issues
 * @param {string} magazineId - Magazine ID to fetch
 * @returns {object} { magazine, issues, loading, error, refetch }
 */
export const useMagazine = (magazineId) => {
    const [magazine, setMagazine] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        if (!magazineId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const magazineRef = doc(db, 'magazines', magazineId);
            const magazineSnap = await getDoc(magazineRef);

            if (magazineSnap.exists()) {
                setMagazine({ id: magazineSnap.id, ...magazineSnap.data() });

                // Fetch issues
                const fetchedIssues = await getMagazineIssues(magazineId);
                setIssues(fetchedIssues);
            } else {
                setError('Magazine not found');
            }
        } catch (err) {
            console.error('Error fetching magazine:', err);
            setError(err.message || 'Failed to load magazine');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [magazineId]);

    return { magazine, issues, loading, error, refetch };
};

export default useMagazine;
