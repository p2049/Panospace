/**
 * Custom hook for personalized feeds in Panospace
 * 
 * Provides easy access to recommendation engine feeds with pagination
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter, doc, getDoc } from 'firebase/firestore';

export const usePersonalizedFeed = (feedType = 'HOME', options = {}, showSocialPosts = false) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const lastDocRef = useRef(null);

    // Reset state when feed type changes
    useEffect(() => {
        setPosts([]);
        lastDocRef.current = null;
        setHasMore(true);
        setError(null);
    }, [feedType, JSON.stringify(options), showSocialPosts]);

    const fetchPosts = useCallback(async (isRefresh = false) => {
        // Prevent multiple simultaneous fetches unless it's a forced refresh
        if (loading && !isRefresh) return;

        try {
            setLoading(true);
            if (isRefresh) {
                setRefreshing(true);
                setError(null);
            }

            let constraints = [
                orderBy('createdAt', 'desc'),
                limit(5)
            ];

            // Apply filters based on feedType
            if (feedType === 'PARK' && options.parkId) {
                constraints.unshift(where('parkId', '==', options.parkId));
            } else if (feedType === 'CITY' && options.cityName) {
                constraints.unshift(where('city', '==', options.cityName));
            } else if (feedType === 'EVENT' && options.eventId) {
                constraints.unshift(where('eventId', '==', options.eventId));
            } else if (feedType === 'EXPLORE') {
                // Explore might differ, but for now just recent
            }

            // Social vs Art filter
            if (showSocialPosts) {
                constraints.unshift(where('type', '==', 'social'));
            } else {
                // strict Art filter
                constraints.unshift(where('type', '==', 'art'));
            }

            // Pagination
            if (!isRefresh && lastDocRef.current) {
                constraints.push(startAfter(lastDocRef.current));
            }

            const q = query(collection(db, 'posts'), ...constraints);
            const snapshot = await getDocs(q);

            const newPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (isRefresh) {
                setPosts(newPosts);
            } else {
                setPosts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = newPosts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNew];
                });
            }

            if (snapshot.docs.length > 0) {
                lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
                setHasMore(snapshot.docs.length >= 5);
            } else {
                setHasMore(false);
            }

        } catch (err) {
            console.error('Error fetching feed:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [feedType, JSON.stringify(options), showSocialPosts]);

    // Initial load
    useEffect(() => {
        fetchPosts(true);
    }, [fetchPosts]);

    return {
        posts,
        loading,
        error,
        hasMore,
        refreshing,
        loadMore: () => fetchPosts(false),
        refresh: () => fetchPosts(true)
    };
};

/**
 * Hook for explore feed (convenience wrapper)
 */
export const useExploreFeed = () => {
    return usePersonalizedFeed('EXPLORE');
};

/**
 * Hook for park feed
 * @param {string} parkId - Park ID
 */
export const useParkFeed = (parkId) => {
    return usePersonalizedFeed('PARK', { parkId });
};

/**
 * Hook for city feed
 * @param {string} cityName - City name
 */
export const useCityFeed = (cityName) => {
    return usePersonalizedFeed('CITY', { cityName });
};

/**
 * Hook for event feed
 * @param {string} eventId - Event ID
 */
export const useEventFeed = (eventId) => {
    return usePersonalizedFeed('EVENT', { eventId });
};

/**
 * Hook for preference learning (track engagement)
 */
export const usePreferenceLearning = () => {
    const onPostLikedFn = httpsCallable(functions, 'onPostLiked');
    const onPostSavedFn = httpsCallable(functions, 'onPostSaved');
    const onPrintPurchasedFn = httpsCallable(functions, 'onPrintPurchased');

    const trackLike = useCallback(async (postId) => {
        try {
            await onPostLikedFn({ postId });
        } catch (error) {
            console.error('Error tracking like:', error);
        }
    }, []);

    const trackSave = useCallback(async (postId) => {
        try {
            await onPostSavedFn({ postId });
        } catch (error) {
            console.error('Error tracking save:', error);
        }
    }, []);

    const trackPurchase = useCallback(async (postId) => {
        try {
            await onPrintPurchasedFn({ postId });
        } catch (error) {
            console.error('Error tracking purchase:', error);
        }
    }, []);

    return {
        trackLike,
        trackSave,
        trackPurchase
    };
};
