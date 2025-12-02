import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    orderBy,
    arrayUnion,
    arrayRemove,
    limit
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook for managing user collections
 * @param {string} userId - User ID to fetch collections for
 */
export const useCollections = (userId) => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const collectionsQuery = query(
                collection(db, 'collections'),
                where('ownerId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(50) // 🚀 OPTIMIZATION: Prevent unbounded reads
            );
            const snapshot = await getDocs(collectionsQuery);
            const fetchedCollections = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCollections(fetchedCollections);
            setError(null);
        } catch (err) {
            console.error('Error fetching collections:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [userId]);

    return { collections, loading, error, refetch };
};

/**
 * Hook for creating and managing collections
 */
export const useCreateCollection = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createCollection = async (collectionData) => {
        try {
            setLoading(true);
            setError(null);

            const newCollection = {
                ...collectionData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                items: collectionData.items || [],
                postRefs: collectionData.postRefs || [],
                visibility: collectionData.visibility || 'public',
                // Preserve shopSettings as-is from collectionData
                shopSettings: collectionData.shopSettings || {
                    showInStore: false
                },
                // Preserve bundlePricing if provided
                bundlePricing: collectionData.bundlePricing || null,
                productTier: collectionData.productTier || 'economy'
            };

            const docRef = await addDoc(collection(db, 'collections'), newCollection);

            setLoading(false);
            return { id: docRef.id, ...newCollection };
        } catch (err) {
            console.error('Error creating collection:', err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const updateCollection = async (collectionId, updates) => {
        try {
            setLoading(true);
            setError(null);

            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(db, 'collections', collectionId), updateData);

            setLoading(false);
            return true;
        } catch (err) {
            console.error('Error updating collection:', err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const deleteCollection = async (collectionId) => {
        try {
            setLoading(true);
            setError(null);

            await deleteDoc(doc(db, 'collections', collectionId));

            setLoading(false);
            return true;
        } catch (err) {
            console.error('Error deleting collection:', err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const addPostToCollection = async (collectionId, postId) => {
        try {
            const collectionRef = doc(db, 'collections', collectionId);

            await updateDoc(collectionRef, {
                postRefs: arrayUnion(postId),
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (err) {
            console.error('Error adding post to collection:', err);
            throw err;
        }
    };

    const removePostFromCollection = async (collectionId, postId) => {
        try {
            const collectionRef = doc(db, 'collections', collectionId);

            await updateDoc(collectionRef, {
                postRefs: arrayRemove(postId),
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (err) {
            console.error('Error removing post from collection:', err);
            throw err;
        }
    };

    const removeItemFromCollection = async (collectionId, itemIndex) => {
        try {
            const collectionRef = doc(db, 'collections', collectionId);
            const collectionDoc = await getDoc(collectionRef);

            if (!collectionDoc.exists()) {
                throw new Error('Collection not found');
            }

            const currentItems = collectionDoc.data().items || [];
            const updatedItems = currentItems.filter((_, index) => index !== itemIndex);

            await updateDoc(collectionRef, {
                items: updatedItems,
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (err) {
            console.error('Error removing item from collection:', err);
            throw err;
        }
    };

    return {
        createCollection,
        updateCollection,
        deleteCollection,
        addPostToCollection,
        removePostFromCollection,
        removeItemFromCollection,
        loading,
        error
    };
};

/**
 * Hook to fetch a single collection by ID
 */
export const useCollection = (collectionId) => {
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        if (!collectionId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const collectionDoc = await getDoc(doc(db, 'collections', collectionId));

            if (collectionDoc.exists()) {
                setCollection({ id: collectionDoc.id, ...collectionDoc.data() });
            } else {
                setError('Collection not found');
            }
        } catch (err) {
            console.error('Error fetching collection:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [collectionId]);

    return { collection, loading, error, refetch };
};
