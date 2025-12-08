import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { SpaceCardService } from '@/services/SpaceCardService';

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

    // Fetch user document
    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            // If we already have the user and it matches target, don't refetch
            if (user && user.id === userId) return;

            try {
                setLoading(true);
                let userData = null;

                try {
                    const userDoc = await getDoc(doc(db, 'users', userId));
                    if (userDoc.exists()) {
                        userData = { id: userDoc.id, ...userDoc.data() };
                    }
                } catch (e) {
                    console.warn('Error fetching user doc:', e);
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
                    // Reset data when user changes
                    setPosts([]);
                    setShopItems([]);
                    setSpaceCards([]);
                    setBadges([]);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                if (isMountedRef.current) setLoading(false);
            }
        };

        fetchUser();
    }, [userId, currentUser?.uid]);

    // Lazy load tab data
    useEffect(() => {
        const fetchTabData = async () => {
            if (!user || !userId || !isMountedRef.current) return;

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

                    console.log(`[useProfile] Fetched ${postsSnap.docs.length} raw posts for user ${userId}`);

                    if (isMountedRef.current) {
                        const filteredPosts = postsSnap.docs
                            .map(d => ({ id: d.id, ...d.data() }))
                            .filter(post => {
                                // 1. Filter by Type (Handle legacy posts)
                                const postType = post.type || 'art';
                                const matchesType = postType === feedType;

                                // 2. Filter showInProfile (TEMPORARILY DISABLED)
                                const notHidden = true; // post.showInProfile !== false;

                                if (!matchesType) console.log(`[useProfile] Filtered out post ${post.id}: wrong type (${postType} != ${feedType})`);
                                // if (!notHidden) console.log(`[useProfile] Filtered out post ${post.id}: hidden from profile`);

                                return matchesType && notHidden;
                            });

                        console.log(`[useProfile] Final posts count: ${filteredPosts.length}`);
                        setPosts(filteredPosts.slice(0, 20)); // Limit back to 20
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
                        setShopItems(shopSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                    }
                }

                // Cards
                if (activeTab === 'cards' && spaceCards.length === 0) {
                    const userCards = await SpaceCardService.getOwnedCards(userId);
                    if (isMountedRef.current) {
                        setSpaceCards(userCards);
                    }
                }
            } catch (err) {
                console.error(`Error fetching ${activeTab} data:`, err);
            }
        };

        fetchTabData();
    }, [activeTab, user, userId, feedType]);

    // Fetch badges separately since they are shown in header
    useEffect(() => {
        const fetchBadges = async () => {
            if (!user || !userId || badges.length > 0) return;
            try {
                const badgesQuery = query(
                    collection(db, 'users', userId, 'badges'),
                    orderBy('earnedAt', 'desc'),
                    limit(20)
                );
                const badgesSnap = await getDocs(badgesQuery);
                if (isMountedRef.current) {
                    setBadges(badgesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                }
            } catch (err) {
                console.error('Error fetching badges:', err);
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
                console.error('Error checking follow status:', error);
            }
        };

        checkFollowStatus();
    }, [userId, currentUser?.uid]);

    return {
        user,
        posts,
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
