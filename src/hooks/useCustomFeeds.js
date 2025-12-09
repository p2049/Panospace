import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useFeedStore } from '@/core/store/useFeedStore';

export const useCustomFeeds = () => {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const { activeCustomFeedId, setCustomFeedEnabled, setActiveCustomFeed, customFeedEnabled } = useFeedStore();

    useEffect(() => {
        if (!currentUser) {
            setFeeds([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const feedsRef = collection(db, 'users', currentUser.uid, 'customFeeds');
        const q = query(feedsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const feedList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFeeds(feedList);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching custom feeds:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Validation helper
    // If exact active feed is deleted, disable custom feed mode
    useEffect(() => {
        if (customFeedEnabled && activeCustomFeedId && !loading) {
            const exists = feeds.find(f => f.id === activeCustomFeedId);
            if (!exists && feeds.length > 0) {
                // Switch to first available or disable
                // Let's just disable to be safe
                setCustomFeedEnabled(false);
                setActiveCustomFeed(null, null);
            } else if (!exists && feeds.length === 0) {
                setCustomFeedEnabled(false);
                setActiveCustomFeed(null, null);
            }
        }
    }, [feeds, activeCustomFeedId, customFeedEnabled, loading, setCustomFeedEnabled, setActiveCustomFeed]);

    const createFeed = async (feedData) => {
        if (!currentUser) return;
        try {
            const feedsRef = collection(db, 'users', currentUser.uid, 'customFeeds');
            await addDoc(feedsRef, {
                ...feedData,
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error creating feed:", err);
            throw err;
        }
    };

    const updateFeed = async (feedId, feedData) => {
        if (!currentUser) return;
        try {
            const feedRef = doc(db, 'users', currentUser.uid, 'customFeeds', feedId);
            await updateDoc(feedRef, {
                ...feedData,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error updating feed:", err);
            throw err;
        }
    };

    const deleteFeed = async (feedId) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'customFeeds', feedId));
        } catch (err) {
            console.error("Error deleting feed:", err);
            throw err;
        }
    };

    return {
        feeds,
        loading,
        error,
        createFeed,
        updateFeed,
        deleteFeed
    };
};
