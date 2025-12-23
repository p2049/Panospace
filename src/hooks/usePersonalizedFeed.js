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

export const usePersonalizedFeed = ({
    feedType = 'HOME',
    options = {},
    feedFilters = {},
    customFeedEnabled = false,
    activeCustomFeedId = null,
    prioritizeFollowing = false
} = {}) => {
    // defaults
    const {
        scope = 'global',
        content = 'both',
        postType = 'both' // 'visual', 'text' ('ping'), 'both'
    } = feedFilters;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const lastDocRef = useRef(null);
    const { currentUser } = useAuth();
    const { followingList: rawFollowingList, loading: followingLoading } = useFollowing(currentUser?.uid);
    const followingList = Array.isArray(rawFollowingList) ? rawFollowingList : [];

    // Humor Filter State (Legacy Store - should move to filters if possible, but keep for now)
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

    // Reset state when filters change
    useEffect(() => {
        setPosts([]);
        lastDocRef.current = null;
        setHasMore(true);
        setError(null);
    }, [feedType, JSON.stringify(options), scope, content, postType, customFeedEnabled, activeCustomFeedId, prioritizeFollowing]);

    const fetchPosts = useCallback(async (isRefresh = false) => {
        // Prevent multiple simultaneous fetches unless it's a forced refresh
        if (loading && !isRefresh) return;

        // DEBUG: Trace execution
        logger.log('Feed: fetchPosts called', { scope, content, postType, loading, followingLoading });

        // Wait for dependencies
        if (customFeedEnabled && (configLoading || !customFeedConfig)) {
            return;
        }

        // Strict dependency check for Following feed only
        if (scope === 'following' && followingLoading && !customFeedEnabled) {
            return;
        }

        try {
            setLoading(true);
            if (isRefresh) {
                setRefreshing(true);
                setError(null);
            }

            // FILTER LOGIC - robust handling for 'all' and 'both' aliases
            const isFollowing = scope === 'following';
            const isAllScope = scope === 'all';

            const isAllContent = content === 'all' || content === 'both';
            const allowArt = isAllContent || content === 'art';
            const allowSocial = isAllContent || content === 'social';

            const isAllPostType = postType === 'all' || postType === 'both';
            const allowVisual = isAllPostType || postType === 'visual';
            const allowPing = isAllPostType || postType === 'text';

            // Safety check: if nothing allowed, return empty
            if ((!allowArt && !allowSocial) || (!allowVisual && !allowPing)) {
                logger.warn('Feed: No content or post types allowed', { scope, content, postType });
                setPosts([]);
                setHasMore(false);
                setLoading(false);
                return;
            }

            // Mobile optimization: smaller batch sizes for faster first paint
            const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
            let limitSize = isFollowing ? (isMobile ? 20 : 50) : (isMobile ? 30 : 100);
            let constraints = [];

            // 1. STRATEGY: Following
            const useFollowingQuery = isFollowing && currentUser && !customFeedEnabled;

            if (useFollowingQuery) {
                const authorIds = [...followingList.slice(0, 29), currentUser.uid];
                if (followingList.length > 0 || currentUser) {
                    constraints = [
                        where('authorId', 'in', authorIds),
                        orderBy('createdAt', 'desc'),
                        limit(limitSize)
                    ];
                } else {
                    constraints = [orderBy('createdAt', 'desc'), limit(limitSize)];
                }
                logger.log('Feed: Strategy FOLLOWING');
            }
            // 2. STRATEGY: Custom Feed
            else if (customFeedEnabled && customFeedConfig) {
                constraints = [orderBy('createdAt', 'desc'), limit(limitSize)];
                if (customFeedConfig.tags?.length > 0) {
                    constraints.unshift(where('tags', 'array-contains-any', customFeedConfig.tags.slice(0, 10)));
                }
                logger.log('Feed: Strategy CUSTOM');
            }
            // 3. STRATEGY: Global (Art/Social/Both)
            else {
                constraints = [orderBy('createdAt', 'desc'), limit(limitSize)];

                // Apply Feed Type Filters (Park/City/Event)
                if (feedType === 'PARK' && options.parkId) constraints.unshift(where('parkId', '==', options.parkId));
                else if (feedType === 'CITY' && options.cityName) constraints.unshift(where('city', '==', options.cityName));
                else if (feedType === 'EVENT' && options.eventId) constraints.unshift(where('eventId', '==', options.eventId));

                // Apply Content Filter (Firestore)
                // REMOVED STRICT FIRESTORE FILTER for HOME FEED to support legacy data.
                // We will filter Art/Social in memory instead.

                // Only keep strict social query if explicitly requested and NOT allowing both/art
                // But as per user request, we remove Firestore filters for type entirely for global.

                // Apply Post Type Filter (Firestore)
                /* Removed for backward compatibility */

                logger.log('Feed: Strategy GLOBAL (Permissive)');
            }

            // Pagination
            if (!isRefresh && lastDocRef.current) {
                constraints.push(startAfter(lastDocRef.current));
            }

            // Execute Query
            const postsRef = collection(db, 'posts');
            const q = query(postsRef, ...constraints);

            // Timeout Protection
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Feed request timed out')), 15000)
            );

            let snapshot;
            try {
                snapshot = (await Promise.race([getDocs(q), timeoutPromise]));
            } catch (err) {
                logger.error('Feed: Primary query failed', err);
                const fallbackQ = query(postsRef, orderBy('createdAt', 'desc'), limit(limitSize));
                snapshot = await getDocs(fallbackQ);
            }

            // Process Data & Backfill Defaults
            let newPosts = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // BACKFILL DEFAULTS for legacy posts match new system
                    postType: data.postType || 'visual',
                    type: data.type || (data.postType === 'text' ? 'social' : 'art')
                };
            });

            // LOG COUNTS
            logger.log('Feed Stats:', {
                raw: snapshot.size,
                contentFilter: content,
                postTypeFilter: postType
            });

            // ---------------------------------------------------------
            // Memory Post-Filtering (Refining results)
            // ---------------------------------------------------------

            // 1. Content Type (Art/Social/All)
            if (!isAllContent) {
                if (content === 'social') newPosts = newPosts.filter(p => p.type === 'social');
                else if (content === 'art') newPosts = newPosts.filter(p => p.type === 'art');
            }

            // 2. Post Type (Visual/Ping/All) - Memory filter is safest
            if (!isAllPostType) {
                if (postType === 'text') {
                    newPosts = newPosts.filter(p => p.postType === 'text');
                } else if (postType === 'visual') {
                    newPosts = newPosts.filter(p => p.postType !== 'text');
                }
            }

            logger.log('Feed Stats:', {
                visible: newPosts.length,
                types: newPosts.slice(0, 3).map(p => ({ id: p.id, t: p.type, pt: p.postType }))
            });

            // 3. Humor Filter (Global)
            if (!showHumor && !customFeedEnabled) {
                newPosts = newPosts.filter(p => !p.isHumor);
            }

            // 4. Custom Feed Advanced Filters (simplified)
            if (customFeedEnabled && customFeedConfig) {
                // ... (keep existing custom feed logic if needed, or simplified)
                // Re-implement basic one to ensuring it's not broken
                if (customFeedConfig.humorSetting === 'hide') newPosts = newPosts.filter(p => !p.isHumor);
                else if (customFeedConfig.humorSetting === 'only') newPosts = newPosts.filter(p => p.isHumor);

                if (!customFeedConfig.includeGlobal && followingList.length > 0) {
                    newPosts = newPosts.filter(p => followingList.includes(p.userId) || followingList.includes(p.authorId));
                }
            }

            // 5. Hybrid Sorting (Followed First) - Only if in 'all' or 'global' scope
            if (prioritizeFollowing && (isAllScope || scope === 'global') && followingList.length > 0) {
                const followingSet = new Set(followingList);
                const followed = [];
                const others = [];

                newPosts.forEach(p => {
                    const uid = p.authorId || p.userId;
                    if (uid && (followingSet.has(uid) || uid === currentUser?.uid)) {
                        followed.push(p);
                    } else {
                        others.push(p);
                    }
                });

                newPosts = [...followed, ...others];
                logger.log('Feed: Hybrid Sort Applied', { followed: followed.length, others: others.length });
            }

            // 6. Following Logic clean up
            if (isFollowing && !customFeedEnabled && !useFollowingQuery) {
                // Fallback if query wasn't used? Unlikely with above logic.
            }

            // Update State
            if (isRefresh) {
                setPosts(newPosts);
            } else {
                setPosts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = newPosts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNew];
                });
            }

            // Update Pagination Refs
            if (snapshot.docs.length > 0) {
                lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
            }

            setHasMore(snapshot.docs.length >= limitSize);

        } catch (err) {
            logger.error('Feed error:', err);
            // permission-denied check?
            if (err?.code === 'permission-denied') setPosts([]);
            setError(err.message || 'Failed to load feed');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [scope, content, postType, feedType, JSON.stringify(options), followingList, followingLoading, currentUser, customFeedEnabled, customFeedConfig, configLoading, showHumor, prioritizeFollowing]);

    // Initial fetch on mount or when filters change
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

export const useExploreFeed = () => usePersonalizedFeed({ feedType: 'EXPLORE' });
export const useParkFeed = (parkId) => usePersonalizedFeed({ feedType: 'PARK', options: { parkId } });
export const useCityFeed = (cityName) => usePersonalizedFeed({ feedType: 'CITY', options: { cityName } });
export const useEventFeed = (eventId) => usePersonalizedFeed({ feedType: 'EVENT', options: { eventId } });

export const usePreferenceLearning = () => {
    // ... keep existing implementation ...
    const onPostLikedFn = httpsCallable(functions, 'onPostLiked');
    const onPostSavedFn = httpsCallable(functions, 'onPostSaved');
    const onPrintPurchasedFn = httpsCallable(functions, 'onPrintPurchased');

    const trackLike = useCallback(async (postId) => {
        try { await onPostLikedFn({ postId }); } catch (e) { logger.warn('Track failed', e); }
    }, []);

    const trackSave = useCallback(async (postId) => {
        try { await onPostSavedFn({ postId }); } catch (e) { logger.warn('Track failed', e); }
    }, []);

    const trackPurchase = useCallback(async (postId) => {
        try { await onPrintPurchasedFn({ postId }); } catch (e) { logger.warn('Track failed', e); }
    }, []);

    return { trackLike, trackSave, trackPurchase };
};
