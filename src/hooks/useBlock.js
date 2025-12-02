import { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp, collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useBlock = () => {
    const { currentUser } = useAuth();
    const [blockedUsers, setBlockedUsers] = useState(new Set());
    const [loading, setLoading] = useState(true);

    // Load blocked users for the current user
    useEffect(() => {
        if (!currentUser) {
            setBlockedUsers(new Set());
            setLoading(false);
            return;
        }

        const fetchBlockedUsers = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'users', currentUser.uid, 'blockedUsers'));
                const blocked = new Set(snapshot.docs.map(doc => doc.id));
                setBlockedUsers(blocked);
            } catch (error) {
                console.error('Error fetching blocked users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlockedUsers();
    }, [currentUser?.uid]);

    const blockUser = async (userId, userName = 'Unknown') => {
        if (!currentUser) throw new Error('Must be logged in to block users');
        if (userId === currentUser.uid) throw new Error('Cannot block yourself');

        try {
            await setDoc(doc(db, 'users', currentUser.uid, 'blockedUsers', userId), {
                blockedAt: serverTimestamp(),
                userId: userId,
                userName: userName
            });
            // Update local state
            setBlockedUsers(prev => new Set(prev).add(userId));
            return true;
        } catch (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
    };

    const unblockUser = async (userId) => {
        if (!currentUser) throw new Error('Must be logged in to unblock users');

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'blockedUsers', userId));
            // Update local state
            setBlockedUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
            return true;
        } catch (error) {
            console.error('Error unblocking user:', error);
            throw error;
        }
    };

    const isBlocked = (userId) => {
        return blockedUsers.has(userId);
    };

    return {
        blockedUsers, // Set of user IDs
        blockUser,
        unblockUser,
        isBlocked,
        loading
    };
};
