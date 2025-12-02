/**
 * Custom hook for personalized feeds in Panospace
 * 
 * Provides easy access to recommendation engine feeds with pagination
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter, doc, getDoc } from 'firebase/firestore';


/**
 * Hook for personalized feed
 * @param {string} feedType - Feed type ('HOME', 'EXPLORE', 'PARK', 'CITY', 'EVENT')
 * @param {object} contextData - Context data (parkId, cityName, eventId, etc.)
 * @param {string|null} feedAccountType - Filter by account type ('art', 'social', or null for all)
 * @returns {object} - Feed state and methods
 */
export const usePersonalizedFeed = (feedType = 'HOME', contextData = {}, feedAccountType = null) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const isMountedRef = useRef(true);
    const loadingRef = useRef(false);

    // Cloud Function reference
    const getPersonalizedFeedFn = httpsCallable(functions, 'getPersonalizedFeed');

    /**
     * Load feed (initial or load more)
     */
    const lastFetchedParamsRef = useRef('');

    // Load feed (initial or load more)
    const loadFeed = useCallback(async (isLoadMore = false) => {
        // Prevent concurrent loads
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            // TEMPORARY: Use client-side query directly until Cloud Functions are deployed
            // This eliminates CORS errors while maintaining full functionality
            const postsRef = collection(db, 'posts');

            // Build query - always get all posts, filter client-side for backward compatibility
            const q = query(postsRef, orderBy('createdAt', 'desc'), limit(20));

            const snapshot = await getDocs(q);

            if (!isMountedRef.current) return;

            // Filter and validate posts
            const validPosts = [];
            for (const postDoc of snapshot.docs) {
                const post = { id: postDoc.id, ...postDoc.data() };

                // Skip drafts
                if (post.status === 'draft') continue;

                // Verify post has valid image URLs
                const hasValidImages = post.images && post.images.length > 0 && post.images[0].url;
                if (!hasValidImages) continue;

                // COLLECTIONS SYSTEM: Check if post should appear in feed (OPTIMIZED)
                if (post.collectionId) {
                    // Post is in a collection - check denormalized postToFeed flag
                    if (post.collectionPostToFeed === false) {
                        continue; // Skip this post
                    }
                }

                // DUAL FEED FILTER: Filter by account type if specified
                // If post doesn't have authorAccountType, treat as 'art' (backward compatibility)
                if (feedAccountType) {
                    const postAccountType = post.authorAccountType || 'art';
                    if (postAccountType !== feedAccountType) {
                        continue; // Skip posts from other feed type
                    }
                }

                validPosts.push(post);
            }

            setPosts(prev => isLoadMore ? [...prev, ...validPosts] : validPosts);
            setHasMore(false); // Disable pagination for now
            setError(null);

        } catch (err) {
            console.error('Error loading feed:', err);
            if (isMountedRef.current) {
                setError(err.message || 'Failed to load feed');
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
                setRefreshing(false);
            }
            loadingRef.current = false;
        }
    }, [feedType, cursor, feedAccountType]); // Added feedAccountType to dependencies


    /**
     * Load more posts
     */
    const loadMore = useCallback(() => {
        if (!loading && hasMore && !loadingRef.current) {
            loadFeed(true);
        }
    }, [loading, hasMore, loadFeed]);

    /**
     * Refresh feed
     */
    const refresh = useCallback(() => {
        setRefreshing(true);
        setCursor(null);
        lastFetchedParamsRef.current = ''; // Reset to allow re-fetch
        loadFeed(false);
    }, [loadFeed]);

    // Initial load - only run once on mount
    const initializedRef = useRef(false);
    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            isMountedRef.current = true;
            loadFeed(false);
        }

        return () => {
            isMountedRef.current = false;
        };
    }, []); // Empty dependency array - only run once

    // Re-fetch when feedAccountType changes
    useEffect(() => {
        if (initializedRef.current && feedAccountType !== null) {
            // Reset and reload when feed type changes
            setCursor(null);
            setPosts([]);
            loadFeed(false);
        }
    }, [feedAccountType]); // Trigger when feedAccountType changes


    return {
        posts,
        loading,
        error,
        hasMore,
        refreshing,
        loadMore,
        refresh
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
