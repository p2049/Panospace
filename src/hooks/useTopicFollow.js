import { db } from '@/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, increment } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to manage following a Topic.
 * 
 * @param {string} canonicalSlug - The strict canonical tag slug (e.g., 'film+nikon').
 * @param {string[]} tags - Array of tags for metadata creation if needed.
 */
export const useTopicFollow = (canonicalSlug, tags) => {
    const { currentUser } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followerCount, setFollowerCount] = useState(0);

    // Initial Load: Check user settings
    useEffect(() => {
        if (!currentUser || !canonicalSlug) {
            setLoading(false);
            return;
        }

        const checkFollowState = async () => {
            try {
                // 1. Check User State
                const userRef = doc(db, 'userSettings', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    const topics = data.followedTopics || [];
                    setIsFollowing(topics.includes(canonicalSlug));
                }

                // 2. Get Public Metadata (Follower Count)
                const topicRef = doc(db, 'topics', canonicalSlug);
                const topicSnap = await getDoc(topicRef);

                if (topicSnap.exists()) {
                    setFollowerCount(topicSnap.data().followerCount || 0);
                } else {
                    setFollowerCount(0);
                }
            } catch (err) {
                console.error("Error loading topic state:", err);
            } finally {
                setLoading(false);
            }
        };

        checkFollowState();
    }, [currentUser, canonicalSlug]);

    // Action: Toggle Follow
    const toggleFollow = async () => {
        if (!currentUser) return; // Should prompt login in UI

        // OPTIMISTIC UPDATE
        const prevState = isFollowing;
        const prevCount = followerCount;

        setIsFollowing(!prevState);
        setFollowerCount(prev => prevState ? prev - 1 : prev + 1);

        try {
            const userRef = doc(db, 'userSettings', currentUser.uid);
            const topicRef = doc(db, 'topics', canonicalSlug);

            if (!prevState) {
                // FOLLOW
                await updateDoc(userRef, {
                    followedTopics: arrayUnion(canonicalSlug)
                });

                // Lazy Create Topic Metadata if not exists, then increment
                // Note: increment works even if field doesn't exist, but document must exist
                // Ideally this happens via Cloud Function, but simpler for MVP directly
                // We'll try to setMerge first to ensure doc exists.
                await setDoc(topicRef, {
                    tags: tags,
                    lastActivity: new Date()
                }, { merge: true });

                await updateDoc(topicRef, {
                    followerCount: increment(1)
                });
            } else {
                // UNFOLLOW
                await updateDoc(userRef, {
                    followedTopics: arrayRemove(canonicalSlug)
                });

                await updateDoc(topicRef, {
                    followerCount: increment(-1)
                });
            }
        } catch (err) {
            console.error("Follow toggle failed:", err);
            // Revert on failure
            setIsFollowing(prevState);
            setFollowerCount(prevCount);
        }
    };

    return { isFollowing, followerCount, toggleFollow, loading };
};
