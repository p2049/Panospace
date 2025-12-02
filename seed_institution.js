import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
// dotenv dependency removed in favor of node --env-file

// Load env vars from .env file (using node --env-file=.env)
// No need for dotenv.config() if running with --env-file

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedInstitution() {
    try {
        // Check if it already exists
        const q = query(collection(db, 'institutions'), where('name', '==', 'Panospace University'));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            console.log("Panospace University already exists.");
            return;
        }

        await addDoc(collection(db, 'institutions'), {
            name: 'Panospace University',
            domains: ['pano.edu', 'test.edu'], // Added test.edu for easier testing if needed
            subscriptionStatus: 'active',
            primaryColor: '#003A2D',
            coverImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80', // Generic campus image
            logoUrl: '', // Use default icon
            features: ['yearbook', 'critique', 'events'],
            createdAt: new Date()
        });

        console.log("Created Panospace University (pano.edu)");
    } catch (error) {
        console.error("Error seeding institution:", error);
    }
}

seedInstitution();
