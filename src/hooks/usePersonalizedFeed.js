/**
 * Custom hook for personalized feeds in Panospace
 * 
 * Provides easy access to recommendation engine feeds with pagination
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@/firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useFollowing } from '@/hooks/useFollowing';
import { logger } from '@/core/utils/logger';
import { useFeedStore } from '@/core/store/useFeedStore';

export const usePersonalizedFeed = (feedType = 'HOME', options = {}, showSocialPosts = false, followingOnly = false, customFeedEnabled = false, activeCustomFeedId = null) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const lastDocRef = useRef(null);
    const { currentUser } = useAuth();
    const { followingList: rawFollowingList, loading: followingLoading } = useFollowing(currentUser?.uid);
    // Safety: ensure array
    const followingList = Array.isArray(rawFollowingList) ? rawFollowingList : [];

    // Humor Filter State
    const { showHumor } = useFeedStore();


    // Custom Feed State
    const [customFeedConfig, setCustomFeedConfig] = useState(null);
    const [configLoading, setConfigLoading] = useState(false);

    // Fetch Custom Feed Config
    useEffect(() => {
        const loadConfig = async () => {
            if (customFeedEnabled && activeCustomFeedId && currentUser) {
                setConfigLoading(true);
                try {
                    const docRef = doc(db, 'users', currentUser.uid, 'customFeeds', activeCustomFeedId);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        setCustomFeedConfig(snap.data());
                    } else {
                        setCustomFeedConfig(null);
                    }
                } catch (e) {
                    logger.error("Error loading feed config", e);
                } finally {
                    setConfigLoading(false);
                }
            } else {
                setCustomFeedConfig(null);
            }
        };
        loadConfig();
    }, [customFeedEnabled, activeCustomFeedId, currentUser]);

    // Reset state when feed type changes
    useEffect(() => {
        setPosts([]);
        lastDocRef.current = null;
        setHasMore(true);
        setError(null);
    }, [feedType, JSON.stringify(options), showSocialPosts, followingOnly, customFeedEnabled, activeCustomFeedId]);

    const fetchPosts = useCallback(async (isRefresh = false) => {
        // Prevent multiple simultaneous fetches unless it's a forced refresh
        if (loading && !isRefresh) return;

        // Wait for dependencies
        if (customFeedEnabled && (configLoading || !customFeedConfig)) return;
        if (followingOnly && followingLoading && !customFeedEnabled) return;

        try {
            setLoading(true);
            if (isRefresh) {
                setRefreshing(true);
                setError(null);
            }

            let limitSize = followingOnly ? 50 : 15;
            let constraints = [];

            // Determination of Query Strategy
            const useFollowingQuery = followingOnly && currentUser && !customFeedEnabled;

            if (useFollowingQuery) {
                // 1. STRATEGY: Following List Query (Uses existing index on authorId + createdAt)
                // Combine followingList and currentUser.uid, limit to 30 for Firestore IN limit
                const authorIds = [...followingList.slice(0, 29), currentUser.uid];

                if (followingList.length > 0 || currentUser) {
                    constraints = [
                        where('authorId', 'in', authorIds),
                        orderBy('createdAt', 'desc'),
                        limit(limitSize)
                    ];
                } else {
                    // Fallback if truly no one is followed and no currentUser (shouldn't happen with auth)
                    constraints = [
                        orderBy('createdAt', 'desc'),
                        limit(limitSize)
                    ];
                }
                logger.log('Feed: Using Following Query Strategy', { authorCount: authorIds.length });
            } else if (customFeedEnabled && customFeedConfig) {
                // 2. STRATEGY: Custom Feed Logic
                constraints = [
                    orderBy('createdAt', 'desc'),
                    limit(limitSize)
                ];
                // 1. Tags Filter (Firestore)
                if (customFeedConfig.tags && customFeedConfig.tags.length > 0) {
                    constraints.unshift(where('tags', 'array-contains-any', customFeedConfig.tags.slice(0, 10)));
                }
                logger.log('Feed: Using Custom Query Strategy');
            } else {
                // 3. STRATEGY: Standard Global Logic
                constraints = [
                    orderBy('createdAt', 'desc'),
                    limit(limitSize)
                ];

                // Apply filters based on feedType
                if (feedType === 'PARK' && options.parkId) {
                    constraints.unshift(where('parkId', '==', options.parkId));
                } else if (feedType === 'CITY' && options.cityName) {
                    constraints.unshift(where('city', '==', options.cityName));
                } else if (feedType === 'EVENT' && options.eventId) {
                    constraints.unshift(where('eventId', '==', options.eventId));
                }

                if (showSocialPosts) {
                    constraints.unshift(where('type', '==', 'social'));
                } else {
                    constraints.unshift(where('type', '==', 'art'));
                }
                logger.log('Feed: Using Standard Global Query Strategy');
            }

            // Pagination
            if (!isRefresh && lastDocRef.current) {
                constraints.push(startAfter(lastDocRef.current));
            }

            const q = query(collection(db, 'posts'), ...constraints);

            // 🛡️ SAFETY: Add timeout to prevent eternal loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Feed request timed out')), 15000)
            );

            const snapshot = await Promise.race([
                getDocs(q),
                timeoutPromise
            ]);

            let newPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // ---------------------------------------------------------
            // Filter Logic (Common + Custom)
            // ---------------------------------------------------------

            // 1. Filter Own Posts (Commented out as we now prioritize showing own posts in Added)
            // if (!followingOnly) {
            //    newPosts = newPosts.filter(p => p.userId !== currentUser.uid && p.authorId !== currentUser.uid);
            // }

            // 1.1 Post-query Filtering for Following mode (Filter by Type in memory since we used authorId index)
            if (useFollowingQuery) {
                if (showSocialPosts) {
                    newPosts = newPosts.filter(p => p.type === 'social');
                } else {
                    newPosts = newPosts.filter(p => p.type === 'art');
                }
            }

            // ---------------------------------------------------------
            // Filter Logic (Common + Custom)
            // ---------------------------------------------------------

            // 1. Filter Own Posts (Common)
            //    newPosts = newPosts.filter(p => p.userId !== currentUser.uid && p.authorId !== currentUser.uid);
            // }

            // 1.5 Humor Logic (Global vs Custom)
            let applyGlobalHumorFilter = !showHumor;

            // 2. Custom Feed Advanced Filters
            if (customFeedEnabled && customFeedConfig) {

                // Override Global Humor Filter if Custom Feed has explicit setting
                if (customFeedConfig.humorSetting) {
                    applyGlobalHumorFilter = false; // Custom feed takes control

                    if (customFeedConfig.humorSetting === 'hide') {
                        newPosts = newPosts.filter(p => !p.isHumor);
                    } else if (customFeedConfig.humorSetting === 'only') {
                        newPosts = newPosts.filter(p => p.isHumor);
                    }
                    // 'any' falls through (shows everything)
                }

                // Filter: Source (Global / Following)
                if (!customFeedConfig.includeGlobal) {
                    // Must be in following list
                    if (followingList && followingList.length > 0) {
                        newPosts = newPosts.filter(p => followingList.includes(p.userId) || followingList.includes(p.authorId));
                    } else {
                        newPosts = [];
                    }
                }

                if (customFeedConfig.orientation && customFeedConfig.orientation !== 'any') {
                    newPosts = newPosts.filter(p => {
                        const ratio = p.imageDetails?.aspectRatio || 1;
                        if (customFeedConfig.orientation === 'portrait') return ratio < 1;
                        if (customFeedConfig.orientation === 'landscape') return ratio > 1;
                        return true;
                    });
                }

                // Filter: Content Type (Text vs Image)
                if (customFeedConfig.contentType && customFeedConfig.contentType !== 'any') {
                    if (customFeedConfig.contentType === 'text') {
                        // Only Text Posts
                        newPosts = newPosts.filter(p => p.postType === 'text');
                    } else if (customFeedConfig.contentType === 'image') {
                        // Only Image Posts (exclude text)
                        // Note: Legacy image posts might not have postType, but they definitely aren't 'text'
                        newPosts = newPosts.filter(p => p.postType !== 'text');
                    }
                }

                // Filter: Locations
                if (customFeedConfig.locations && customFeedConfig.locations.length > 0) {
                    newPosts = newPosts.filter(p => {
                        if (!p.locationName && !p.city && !p.state && !p.country) return false;
                        const locString = `${p.locationName} ${p.city} ${p.state} ${p.country}`.toLowerCase();
                        return customFeedConfig.locations.some(l => locString.includes(l.toLowerCase()));
                    });
                }
            }

            // Apply Global Humor Filter (if not overridden)
            if (applyGlobalHumorFilter) {
                newPosts = newPosts.filter(p => !p.isHumor);
            }
            // 3. Standard Following Only Filter
            else if (followingOnly && currentUser) {
                if (followingList.length > 0) {

                    // USER REQUEST: Show your own posts in feed when on following
                    // We simply add currentUser.uid to the inclusion check
                    newPosts = newPosts.filter(p =>
                        followingList.includes(p.userId) ||
                        followingList.includes(p.authorId) ||
                        p.userId === currentUser.uid || // Explicitly include self
                        p.authorId === currentUser.uid  // Explicitly include self
                    );
                } else {
                    // If following no one, but want to see own posts?
                    // Usually "Following Only" implies you must follow someone.
                    // But if it's "your feed", you might expect your own posts.
                    // Let's at least show own posts if following list is empty but filter is active.
                    newPosts = newPosts.filter(p =>
                        p.userId === currentUser.uid ||
                        p.authorId === currentUser.uid
                    );
                }
            }

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
                setHasMore(snapshot.docs.length >= limitSize);
            } else {
                setHasMore(false);
            }

        } catch (err) {
            if (err.code === 'permission-denied') {
                logger.warn('Feed permission denied, resolving to empty state');
                setPosts([]);
                setError(null);
            } else {
                logger.error('Error fetching feed:', err);
                setError(err.message);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [feedType, JSON.stringify(options), showSocialPosts, followingOnly, followingList, followingLoading, currentUser, customFeedEnabled, customFeedConfig, configLoading]);

    // Initial load
    useEffect(() => {
        if (!followingLoading && !configLoading) {
            fetchPosts(true);
        }
    }, [fetchPosts, followingLoading, configLoading]);

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
            // Suppress CORS/internal errors in dev to prevent console noise
            logger.warn('Engagement tracking failed (non-critical):', error.message);
        }
    }, []);

    const trackSave = useCallback(async (postId) => {
        try {
            await onPostSavedFn({ postId });
        } catch (error) {
            logger.error('Error tracking save:', error);
        }
    }, []);

    const trackPurchase = useCallback(async (postId) => {
        try {
            await onPrintPurchasedFn({ postId });
        } catch (error) {
            logger.error('Error tracking purchase:', error);
        }
    }, []);

    return {
        trackLike,
        trackSave,
        trackPurchase
    };
};
