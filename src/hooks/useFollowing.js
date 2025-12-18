import { useState, useCallback, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, Timestamp, where, onSnapshot } from 'firebase/firestore';

export const useFollowing = (userId) => {
    const [followingList, setFollowingList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Subscribe to the list of users that the current user is following
    useEffect(() => {
        if (!userId) {
            setFollowingList([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const followsRef = collection(db, 'follows');
        const q = query(followsRef, where('followerId', '==', userId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const followedUserIds = snapshot.docs.map(doc => doc.data().followingId);
            setFollowingList(followedUserIds);
            setLoading(false);
        }, (err) => {
            console.error('Error in following list subscription:', err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    // Check if the current user is following a specific user
    const isFollowing = useCallback((targetUserId) => {
        return followingList.includes(targetUserId);
    }, [followingList]);

    return {
        followingList,
        loading,
        error,
        isFollowing
    };
};
