import { useState, useEffect, useCallback } from 'react';
import { MuseumService } from '@/core/services/firestore/museums.service';
import { logger } from '@/core/utils/logger';

export const useMuseums = (ownerId) => {
    const [museums, setMuseums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        if (!ownerId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            // Assuming listByOwner exists or we query manually
            // We'll add listByOwner to MuseumService if needed, but for now query here
            const { collection, query, where, getDocs, db } = await import('firebase/firestore');
            const q = query(collection(db, 'museums'), where('ownerId', '==', ownerId));
            const snap = await getDocs(q);
            setMuseums(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [ownerId]);

    useEffect(() => {
        refetch();
    }, [ownerId, refetch]);

    return { museums, loading, error, refetch };
};

export const useMuseum = (id) => {
    const [museum, setMuseum] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        if (!id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await MuseumService.getById(id);
            const sectionList = await MuseumService.getSections(id);
            setMuseum(data);
            setSections(sectionList);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        refetch();
    }, [id, refetch]);

    return { museum, sections, loading, error, refetch };
};
