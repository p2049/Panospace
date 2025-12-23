import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import AppLoading from '@/components/AppLoading';
import { migrateUserPosts } from '@/utils/postMigration';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [customClaims, setCustomClaims] = useState({});
    const [isUltra, setIsUltra] = useState(false);
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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                try {
                    // Get Custom Claims
                    const tokenResult = await user.getIdTokenResult();
                    const claims = tokenResult.claims || {};
                    setCustomClaims(claims);

                    // Fetch Firestore Profile
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.exists() ? userSnap.data() : {};

                    // Set Ultra status based on claims or Firestore
                    setIsUltra(claims.isUltra || userData.isUltra || userData.subscriptionStatus === 'active' || false);

                } catch (e) {
                    console.error("AuthContext: Error resolving user status", e);
                }

                // Run post migration (background)
                if (!migrationRanRef.current) {
                    migrationRanRef.current = true;
                    migrateUserPosts(user.uid).catch(err => {
                        console.error('[AuthContext] Post migration failed:', err);
                    });
                }
            } else {
                setCustomClaims({});
                setIsUltra(false);
            }

            setLoading(false);
        }, (error) => {
            console.error("AuthContext: Auth error", error);
            setLoading(false);
        });

        // Fallback timeout
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 3000);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const value = {
        currentUser,
        customClaims,
        isUltra,
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
