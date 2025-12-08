import React, { createContext, useContext, useState, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const UserCacheContext = createContext();

export const useUserCache = () => {
    return useContext(UserCacheContext);
};

export const UserCacheProvider = ({ children }) => {
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState({});

    /**
     * Fetch a user by ID, checking cache first
     */
    const fetchUser = useCallback(async (userId) => {
        if (!userId) return null;

        // Return from cache if available
        if (users[userId]) {
            return users[userId];
        }

        // If already loading, wait for it (basic prevention, could be improved with promises)
        if (loading[userId]) {
            // For now, just let the duplicate request happen or return null
            // Ideally we'd return the pending promise
            return null;
        }

        setLoading(prev => ({ ...prev, [userId]: true }));

        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = { id: userDoc.id, ...userDoc.data() };
                setUsers(prev => ({ ...prev, [userId]: userData }));
                return userData;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return null;
        } finally {
            setLoading(prev => ({ ...prev, [userId]: false }));
        }
    }, [users, loading]);

    /**
     * Manually cache a user (e.g. from search results or auth)
     */
    const cacheUser = useCallback((user) => {
        if (!user || !user.id) return;
        setUsers(prev => {
            // Only update if not exists or if we want to force update (optional)
            if (!prev[user.id]) {
                return { ...prev, [user.id]: user };
            }
            return prev;
        });
    }, []);

    const value = {
        users,
        fetchUser,
        cacheUser
    };

    return (
        <UserCacheContext.Provider value={value}>
            {children}
        </UserCacheContext.Provider>
    );
};
