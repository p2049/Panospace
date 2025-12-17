import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { auth } from '@/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import AppLoading from '@/components/AppLoading';
import { migrateUserPosts } from '@/utils/postMigration';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const migrationRanRef = useRef(false);

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    function googleSignIn() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    useEffect(() => {
        // AuthContext: Setting up onAuthStateChanged listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // AuthContext: onAuthStateChanged fired
            setCurrentUser(user);
            setLoading(false);

            // Run one-time migration for user's posts
            if (user && !migrationRanRef.current) {
                migrationRanRef.current = true;
                // Run in background, don't await
                migrateUserPosts(user.uid).catch(err => {
                    console.error('[AuthContext] Post migration failed:', err);
                });
            }
        }, (error) => {
            console.error("AuthContext: Auth error", error);
            setLoading(false);
        });

        // Fallback: If Firebase doesn't respond in 3 seconds, stop loading
        const timeout = setTimeout(() => {
            setLoading((currentLoading) => {
                if (currentLoading) {
                    // AuthContext: Firebase auth timed out, forcing loading to false
                    return false;
                }
                return currentLoading;
            });
        }, 3000);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const value = {
        currentUser,
        loading,
        signup,
        login,
        logout,
        googleSignIn
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <AppLoading /> : children}
        </AuthContext.Provider>
    );
};

