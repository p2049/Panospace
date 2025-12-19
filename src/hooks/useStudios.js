import { useState, useEffect, useCallback } from 'react';
import { StudioService } from '@/core/services/firestore/studios.service';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/core/utils/logger';

export const useStudios = (userId) => {
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            // We need a list method in StudioService
            const q = StudioService.getUserStudios ? await StudioService.getUserStudios(userId) : [];
            setStudios(q);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        refetch();
    }, [userId, refetch]);

    return { studios, loading, error, refetch };
};

export const useStudio = (id) => {
    const [studio, setStudio] = useState(null);
    const [members, setMembers] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        if (!id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await StudioService.getById(id);
            const memberList = await StudioService.getMembers(id);
            const itemList = await StudioService.getItems(id);
            setStudio(data);
            setMembers(memberList);
            setItems(itemList);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        refetch();
    }, [id, refetch]);

    return { studio, members, items, loading, error, refetch };
};

export const useStudioActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    const createStudio = async (data, coverImage) => {
        setLoading(true);
        try {
            return await StudioService.create(data, coverImage, currentUser.uid, currentUser);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (studioId, postId) => {
        try {
            await StudioService.addItem(studioId, {
                postId,
                addedBy: currentUser.uid,
                orderIndex: Date.now()
            });
        } catch (err) {
            logger.error('Error adding item to studio:', err);
            throw err;
        }
    };

    return { createStudio, addItem, loading, error };
};
