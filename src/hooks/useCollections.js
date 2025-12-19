import { useState, useEffect, useCallback } from 'react';
import { CollectionService } from '@/core/services/firestore/collections.service';
import { logger } from '@/core/utils/logger';

const COLLECTIONS_CACHE = {};
const SINGLE_COLLECTION_CACHE = {};

/**
 * Hook for managing user collections list
 */
export const useCollections = (userId) => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const fetchedCollections = await CollectionService.listByOwner(userId);
            COLLECTIONS_CACHE[userId] = fetchedCollections;
            setCollections(fetchedCollections);
            setError(null);
        } catch (err) {
            logger.error('Error fetching collections:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId && COLLECTIONS_CACHE[userId]) {
            setCollections(COLLECTIONS_CACHE[userId]);
            setLoading(false);
        } else {
            refetch();
        }
    }, [userId, refetch]);

    return { collections, loading, error, refetch };
};

/**
 * Hook for creating and managing a single collection
 */
export const useCreateCollection = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createCollection = async (data, coverImage) => {
        setLoading(true);
        try {
            const result = await CollectionService.create(data, coverImage);
            if (data.ownerId) delete COLLECTIONS_CACHE[data.ownerId];
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateCollection = async (id, updates) => {
        setLoading(true);
        try {
            await CollectionService.update(id, updates);
            delete SINGLE_COLLECTION_CACHE[id];
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteCollection = async (id) => {
        setLoading(true);
        try {
            await CollectionService.delete(id);
            delete SINGLE_COLLECTION_CACHE[id];
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addPostToCollection = async (collectionId, postId) => {
        try {
            await CollectionService.addItem(collectionId, {
                postId,
                addedBy: 'current_user', // This should be passed from caller or handle inside
                orderIndex: Date.now()
            });
            delete SINGLE_COLLECTION_CACHE[collectionId];
        } catch (err) {
            logger.error('Error adding post to collection:', err);
            throw err;
        }
    };

    return {
        createCollection,
        updateCollection,
        deleteCollection,
        addPostToCollection,
        loading,
        error
    };
};

/**
 * Hook to fetch a single collection by ID including its items
 */
export const useCollection = (id) => {
    const [collection, setCollection] = useState(null);
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
            const data = await CollectionService.getById(id);
            const fetchedItems = await CollectionService.getItems(id);

            const result = { ...data, items: fetchedItems }; // Merge for legacy compatibility in UI
            setCollection(result);
            setItems(fetchedItems);

            SINGLE_COLLECTION_CACHE[id] = result;
            setError(null);
        } catch (err) {
            logger.error('Error fetching collection:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id && SINGLE_COLLECTION_CACHE[id]) {
            setCollection(SINGLE_COLLECTION_CACHE[id]);
            setItems(SINGLE_COLLECTION_CACHE[id].items || []);
            setLoading(false);
        } else {
            refetch();
        }
    }, [id, refetch]);

    return { collection, items, loading, error, refetch };
};
