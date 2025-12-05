// Quick script to check actual Firestore post color fields
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBxOCsE8kKqXvY6PqYxH9VqYqJxH9VqYqI",
    authDomain: "panospace-6c396.firebaseapp.com",
    projectId: "panospace-6c396",
    storageBucket: "panospace-6c396.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkPostColors() {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, limit(5));
    const snapshot = await getDocs(q);

    console.log('=== CHECKING POST COLOR FIELDS ===\n');

    snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Post ${index + 1} (ID: ${doc.id}):`);
        console.log('  dominantColor:', data.dominantColor);
        console.log('  dominantColorHex:', data.dominantColorHex);
        console.log('  colorHex:', data.colorHex);
        console.log('  avgColor:', data.avgColor);
        console.log('  avgColorHex:', data.avgColorHex);
        console.log('  palette:', data.palette);
        console.log('  color:', data.color);
        console.log('---\n');
    });
}

checkPostColors().catch(console.error);
