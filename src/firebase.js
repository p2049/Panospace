import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAnalytics, isSupported } from "firebase/analytics";
import { logger } from "@/core/utils/logger";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics (Client-side only)
export let analytics = null;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    }).catch((err) => {
        logger.warn("Firebase Analytics not supported in this environment:", err.message);
    });
}

// Emulator Configuration
// CRITICAL: Only connect emulators if explicitly enabled via environment variables.
// This prevents accidental connection to non-running emulators which causes network errors.
if (typeof window !== "undefined" && window.location.hostname === "localhost") {

    // Auth Emulator
    if (import.meta.env.VITE_USE_AUTH_EMULATOR === 'true') {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
        logger.log("✓ Connected to Auth Emulator");
    }

    // Firestore Emulator
    if (import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true') {
        connectFirestoreEmulator(db, "localhost", 8080);
        logger.log("✓ Connected to Firestore Emulator");
    }

    // Storage Emulator
    if (import.meta.env.VITE_USE_STORAGE_EMULATOR === 'true') {
        connectStorageEmulator(storage, "localhost", 9199);
        logger.log("✓ Connected to Storage Emulator");
    }

    // Functions Emulator
    if (import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true') {
        connectFunctionsEmulator(functions, "localhost", 5001);
        logger.log("✓ Connected to Functions Emulator");
    }
}

export default app;
