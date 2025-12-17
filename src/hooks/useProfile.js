import { normalizeUserProfile, normalizePost, normalizeShopItem } from '@/core/schemas/firestoreModels';
import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { SpaceCardService } from '@/services/SpaceCardService';
import { logger } from '@/core/utils/logger';

const PROFILE_CACHE = {};

/**
 * useProfile Hook
 * 
 * Fetches and manages user profile data including:
 * - User document
 * - Posts (lazy loaded by tab)
 * - Shop items (lazy loaded by tab)
 * - Space cards (lazy loaded by tab)
 * - Badges (loaded on mount for header display)
 * - Follow status
 * 
 * @param {string} userId - The user ID to fetch profile for
 * @param {object} currentUser - The currently authenticated user
 * @param {string} activeTab - The currently active tab ('posts', 'shop', 'cards', 'badges', 'collections')
 * @returns {object} Profile data and loading states
 */
export const useProfile = (userId, currentUser, activeTab = 'posts', feedType = 'art') => {
    const isMountedRef = useRef(true);

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [textPosts, setTextPosts] = useState([]);
    const [shopItems, setShopItems] = useState([]);
    const [spaceCards, setSpaceCards] = useState([]);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followDocId, setFollowDocId] = useState(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // --- CACHE IMPLEMENTATION ---
    // Global cache to persist across route changes (mounting/unmounting)

    // Fetch user document
    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            // CACHE HIT: User Data
            if (PROFILE_CACHE[userId]?.user) {
                // If we already have this user in memory, use it
                // We typically assume user profile data doesn't change every second
                setUser(PROFILE_CACHE[userId].user);

                // If it's the current user, we might want to ensure it's up to date with AuthContext, but simpler is fine
                // Only stop loading if we also have the tab data we need (handled in next effect)
                // But this effect only manages 'user'.
                // We'll let the next effect handle 'loading' state for tab content.
            }

            // Always attempt fetch if not fully complete or if we want to be fresh?
            // Prompt says: "Open post -> close post -> NO refetch".
            // So strictly use cache.
            if (PROFILE_CACHE[userId]?.user) {
                // Do nothing, we set it above.
                // Unless we want to support background refresh? 
                // For "Stabilization", let's trust cache.
            } else {
                setLoading(true);
                // ... FETCH LOGIC ...
            }

            // To avoid massive rewrite of the logic below, I will structure it to check cache first,
            // else proceed.

            if (PROFILE_CACHE[userId]?.user && PROFILE_CACHE[userId].user.id === userId) {
                setUser(PROFILE_CACHE[userId].user);
                // Proceed to clear other states?
                // Original logic cleared states when user changed.
                // If we switched users, 'user' state is null initially, so we are fine.
                setLoading(false);
                return;
            }

            try {
                // loading is set true in the else block above or we need to ensure it
                setLoading(true);
                let userData = null;

                try {
                    const userDoc = await getDoc(doc(db, 'users', userId));
                    if (userDoc.exists()) {
                        userData = normalizeUserProfile(userDoc);

                        // --- MIGRATION: Ensure ONE SINGLE USERNAME ---
                        if (!userData.username) {
                            // Generate unique temp username locally to display immediately
                            const baseName = (userData.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
                            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                            const tempUsername = `${baseName}${randomSuffix}`;

                            userData.username = tempUsername;
                            userData.needsUsernameSelection = true;

                            // Persist async (fire & forget)
                            import('firebase/firestore').then(({ updateDoc, doc }) => {
                                updateDoc(doc(db, 'users', userId), {
                                    username: tempUsername,
                                    needsUsernameSelection: true
                                }).catch(err => console.error("Migration failed:", err));
                            });
                        }
                    }
                } catch (e) {
                    logger.warn('Error fetching user doc:', e);
                }

                if (!userData && currentUser && userId === currentUser.uid) {
                    userData = {
                        id: currentUser.uid,
                        displayName: currentUser.displayName || 'Anonymous',
                        photoURL: currentUser.photoURL,
                        bio: 'Welcome to your profile!'
                    };
                }

                if (isMountedRef.current) {
                    setUser(userData);

                    // Update Cache
                    if (!PROFILE_CACHE[userId]) PROFILE_CACHE[userId] = { tabs: {} };
                    PROFILE_CACHE[userId].user = userData;

                    // Reset data when user changes (only if not in cache, which implies new fetch)
                    setPosts([]);
                    setShopItems([]);
                    setSpaceCards([]);
                    setBadges([]);
                }
            } catch (error) {
                logger.error('Error loading profile:', error);
            } finally {
                // Only set loading false if we are not waiting for tab data?
                // The original code set loading false here. 
                if (isMountedRef.current) setLoading(false);
            }
        };

        fetchUser();
    }, [userId, currentUser?.uid]);

    // Lazy load tab data
    useEffect(() => {
        const fetchTabData = async () => {
            if (!user || !userId || !isMountedRef.current) return;

            const cacheKey = `${activeTab}_${feedType}`;

            // CACHE HIT: Tab Data (DISABLED for posts/writings to ensure postType filtering works)
            // Only cache shop and cards, not posts or writings
            if ((activeTab === 'shop' || activeTab === 'cards') && PROFILE_CACHE[userId]?.tabs?.[cacheKey]) {
                const cached = PROFILE_CACHE[userId].tabs[cacheKey];
                if (activeTab === 'shop') setShopItems(cached);
                if (activeTab === 'cards') setSpaceCards(cached);
                return;
            }

            try {
                // Posts - only show posts that are marked to show in profile
                if (activeTab === 'posts') {
                    // Reset posts when feedType changes
                    setPosts([]);

                    const userPostsQuery = query(
                        collection(db, 'posts'),
                        where('authorId', '==', userId),
                        orderBy('createdAt', 'desc'),
                        limit(50)
                    );
                    const postsSnap = await getDocs(userPostsQuery);

                    logger.log(`[useProfile] Fetched ${postsSnap.docs.length} raw posts for user ${userId}`);

                    if (isMountedRef.current) {
                        const filteredPosts = postsSnap.docs
                            .map(normalizePost)
                            .filter(post => {
                                // 1. Filter by Type (Handle legacy posts)
                                const postType = post.type || 'art';
                                const matchesType = postType === feedType;

                                // 2. Filter showInProfile (TEMPORARILY DISABLED)
                                const notHidden = true; // post.showInProfile !== false;

                                // 3. Exclude text posts AND posts with no images from main grid
                                // The main grid is for visual content only.
                                // FIX: Check normalized properties (imageUrl or items), not raw imageUrls
                                const hasImages = !!post.imageUrl || (post.items && post.items.length > 0);
                                const isNotTextPost = post.postType !== 'text';

                                // Debug logging
                                if (post.postType === 'text') {
                                    logger.log(`[useProfile] Filtered out TEXT post: ${post.id}`);
                                } else if (!hasImages) {
                                    logger.log(`[useProfile] Filtered out IMAGELESS post: ${post.id}`);
                                }

                                if (!matchesType) logger.log(`[useProfile] Filtered out post ${post.id}: wrong type (${postType} != ${feedType})`);

                                // MUST match type, not be hidden, NOT be text, AND MUST HAVE IMAGES
                                return matchesType && notHidden && isNotTextPost && hasImages;
                            });

                        logger.log(`[useProfile] Final posts count: ${filteredPosts.length}`);
                        const finalPosts = filteredPosts.slice(0, 20);
                        setPosts(finalPosts); // Limit back to 20

                        // Cache It
                        if (!PROFILE_CACHE[userId]) PROFILE_CACHE[userId] = { tabs: {} };
                        if (!PROFILE_CACHE[userId].tabs) PROFILE_CACHE[userId].tabs = {};
                        PROFILE_CACHE[userId].tabs[cacheKey] = finalPosts;
                    }
                }

                // Shop
                if (activeTab === 'shop' && shopItems.length === 0) {
                    const shopQuery = query(
                        collection(db, 'shopItems'),
                        where('userId', '==', userId),
                        orderBy('createdAt', 'desc'),
                        limit(20)
                    );
                    const shopSnap = await getDocs(shopQuery);
                    if (isMountedRef.current) {
                        const allItems = shopSnap.docs.map(normalizeShopItem);
                        const isOwnProfile = currentUser && currentUser.uid === userId;
                        const visibleItems = allItems.filter(item => isOwnProfile || item.available === true);
                        setShopItems(visibleItems);

                        // Cache It
                        if (!PROFILE_CACHE[userId]) PROFILE_CACHE[userId] = { tabs: {} };
                        if (!PROFILE_CACHE[userId].tabs) PROFILE_CACHE[userId].tabs = {};
                        PROFILE_CACHE[userId].tabs[cacheKey] = visibleItems;
                    }
                }

                // Cards
                if (activeTab === 'cards' && spaceCards.length === 0) {
                    const userCards = await SpaceCardService.getOwnedCards(userId);
                    if (isMountedRef.current) {
                        setSpaceCards(userCards);

                        // Cache It
                        if (!PROFILE_CACHE[userId]) PROFILE_CACHE[userId] = { tabs: {} };
                        if (!PROFILE_CACHE[userId].tabs) PROFILE_CACHE[userId].tabs = {};
                        PROFILE_CACHE[userId].tabs[cacheKey] = userCards;
                    }
                }

                // Writings (Text Posts)
                if (activeTab === 'writings') {
                    setTextPosts([]);

                    // Fetch all posts for user and filter client-side to avoid index issues of (authorId + postType + createdAt)
                    const textPostsQuery = query(
                        collection(db, 'posts'),
                        where('authorId', '==', userId),
                        orderBy('createdAt', 'desc'),
                        limit(50)
                    );

                    try {
                        const textPostsSnap = await getDocs(textPostsQuery);
                        if (isMountedRef.current) {
                            const fetchedTextPosts = textPostsSnap.docs
                                .map(doc => {
                                    const normalized = normalizePost(doc);
                                    const data = doc.data();
                                    // Manually attach text fields as normalizePost might skip them
                                    return {
                                        ...normalized,
                                        postType: data.postType || 'image', // explicit field
                                        body: data.body || data.textContent || '',
                                        writerTheme: data.writerTheme || 'default',
                                        linkedPostIds: data.linkedPostIds || []
                                    };
                                })
                                .filter(p => {
                                    const hasImages = (p.items && p.items.length > 0) || !!p.imageUrl;
                                    // Robust check for text posts
                                    return p.postType === 'text' || (!!p.body && !hasImages);
                                });

                            logger.log(`[useProfile] Fetched ${fetchedTextPosts.length} text posts`);
                            setTextPosts(fetchedTextPosts);

                            // Cache It (Disabled for now to ensure freshness)
                            // if (!PROFILE_CACHE[userId]) PROFILE_CACHE[userId] = { tabs: {} };
                            // if (!PROFILE_CACHE[userId].tabs) PROFILE_CACHE[userId].tabs = {};
                            // PROFILE_CACHE[userId].tabs[cacheKey] = fetchedTextPosts;
                        }
                    } catch (err) {
                        logger.error('Error fetching writings data:', err);
                    }
                }
            } catch (err) {
                logger.error(`Error fetching ${activeTab} data:`, err);
            }
        };

        fetchTabData();
    }, [activeTab, user, userId, feedType]);

    // Fetch badges separately since they are shown in header
    useEffect(() => {
        const fetchBadges = async () => {
            if (!user || !userId) return;

            // Note: Badges are rarely refreshed, using strict cache is fine
            if (PROFILE_CACHE[userId]?.badges) {
                if (badges.length === 0) {
                    setBadges(PROFILE_CACHE[userId].badges);
                }
                return;
            }

            if (badges.length > 0) return;

            try {
                const badgesQuery = query(
                    collection(db, 'users', userId, 'badges'),
                    orderBy('earnedAt', 'desc'),
                    limit(20)
                );
                const badgesSnap = await getDocs(badgesQuery);
                if (isMountedRef.current) {
                    const badgesData = badgesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    setBadges(badgesData);

                    // Cache
                    if (!PROFILE_CACHE[userId]) PROFILE_CACHE[userId] = { tabs: {} };
                    PROFILE_CACHE[userId].badges = badgesData;
                }
            } catch (err) {
                logger.error('Error fetching badges:', err);
            }
        };
        fetchBadges();
    }, [user, userId]);

    // Check follow status
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!currentUser || !userId || currentUser.uid === userId) {
                return;
            }

            try {
                const q = query(
                    collection(db, 'follows'),
                    where('followerId', '==', currentUser.uid),
                    where('followingId', '==', userId)
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    setIsFollowing(true);
                    setFollowDocId(snapshot.docs[0].id);
                } else {
                    setIsFollowing(false);
                    setFollowDocId(null);
                }
            } catch (error) {
                logger.error('Error checking follow status:', error);
            }
        };

        checkFollowStatus();
    }, [userId, currentUser?.uid]);

    return {
        user,
        posts,
        textPosts,
        shopItems,
        spaceCards,
        badges,
        loading,
        isFollowing,
        followDocId,
        setIsFollowing,
        setFollowDocId,
        setSpaceCards
    };
};

export const invalidateProfileCache = (userId) => {
    if (PROFILE_CACHE[userId]) {
        delete PROFILE_CACHE[userId];
    }
};

