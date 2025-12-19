import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { auth, db } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
    const [isAdmin, setIsAdmin] = useState(false);
    const [isUltra, setIsUltra] = useState(false);
    const [isGodMode, setIsGodMode] = useState(false);
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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                try {
                    // 1. Get Custom Claims (Production standard)
                    const tokenResult = await user.getIdTokenResult();
                    const claims = tokenResult.claims || {};
                    setCustomClaims(claims);

                    // 2. Fetch Firestore Profile for supplemental role info
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);

                    let userData = userSnap.exists() ? userSnap.data() : {};

                    // 3. GOD MODE / FOUNDER: Auto-provision for specific email
                    // ONLY for the specific founder account.
                    if (user.email === 'founder@panospaceapp.com') {
                        try {
                            await setDoc(userRef, {
                                role: 'founder',
                                isAdmin: true,
                                isUltra: true,
                                isGodMode: true,
                                subscriptionStatus: 'active',
                                email: user.email,
                                uid: user.uid,
                                updatedAt: serverTimestamp(),
                                createdAt: userData.createdAt || serverTimestamp()
                            }, { merge: true });

                            // Re-fetch or assign locally
                            userData = { ...userData, isAdmin: true, isUltra: true, isGodMode: true, role: 'founder' };
                            console.log("[Auth] Founder account recognized and provisioned.");
                        } catch (e) {
                            console.warn("[Auth] Founder Doc creation failed (likely permissions):", e);
                        }
                    }

                    // 4. Set reactive state based on Claims OR Firestore (Source of Truth)
                    // No global DEV/localhost bypasses here.
                    setIsAdmin(claims.isAdmin || userData.isAdmin || userData.role === 'founder' || userData.role === 'admin' || false);
                    setIsUltra(claims.isUltra || userData.isUltra || userData.subscriptionStatus === 'active' || false);
                    setIsGodMode(userData.isGodMode || userData.role === 'founder' || false);

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
                setIsAdmin(false);
                setIsUltra(false);
                setIsGodMode(false);
            }

            setLoading(false);
        }, (error) => {
            console.error("AuthContext: Auth error", error);
            setLoading(false);
        });

        // Fallback: If Firebase doesn't respond in 3 seconds, stop loading
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
        isAdmin,
        isUltra,
        isGodMode,
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
