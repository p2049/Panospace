import { useState, useCallback, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, Timestamp, where } from 'firebase/firestore';

export const useFollowing = (userId) => {
    const [followingList, setFollowingList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch the list of users that the current user is following
    const fetchFollowing = useCallback(async () => {
        if (!userId) {
            setFollowingList([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const followsRef = collection(db, 'follows');
            const q = query(followsRef, where('followerId', '==', userId));
            const snapshot = await getDocs(q);

            const followedUserIds = snapshot.docs.map(doc => doc.data().followingId);
            setFollowingList(followedUserIds);
        } catch (err) {
            console.error('Error fetching following list:', err);
            setError(err);
            setFollowingList([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Check if the current user is following a specific user
    const isFollowing = useCallback((targetUserId) => {
        return followingList.includes(targetUserId);
    }, [followingList]);

    // Auto-fetch following list when userId changes
    useEffect(() => {
        fetchFollowing();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]); // Only depend on userId, not fetchFollowing

    return {
        followingList,
        loading,
        error,
        fetchFollowing,
        isFollowing
    };
};
