import { useState, useEffect, useCallback } from 'react';
import { MagazineService } from '@/core/services/firestore/magazines.service';
import { logger } from '@/core/utils/logger';

export const useMagazines = (ownerId, ownerType = 'user') => {
    const [magazines, setMagazines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        if (!ownerId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { collection, query, where, getDocs, db } = await import('firebase/firestore');
            const q = query(
                collection(db, 'magazines'),
                where('ownerId', '==', ownerId),
                where('ownerType', '==', ownerType)
            );
            const snap = await getDocs(q);
            setMagazines(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [ownerId, ownerType]);

    useEffect(() => {
        refetch();
    }, [ownerId, refetch, ownerType]);

    return { magazines, loading, error, refetch };
};

export const useMagazine = (id) => {
    const [magazine, setMagazine] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        if (!id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await MagazineService.getById(id);
            const issueList = await MagazineService.getIssues(id);
            setMagazine(data);
            setIssues(issueList);
            setError(null);
        } catch (err) {
            logger.error('Error fetching magazine:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        refetch();
    }, [id, refetch]);

    return { magazine, issues, loading, error, refetch };
};
