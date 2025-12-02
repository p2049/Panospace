// Quick Firestore Test
// Run this in your browser console (F12 -> Console tab)

// Test 1: Check if you're authenticated
console.log('Current user:', auth.currentUser);

// Test 2: Try to read posts
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

async function testFirestore() {
    try {
        console.log('Testing Firestore connection...');
        const postsRef = collection(db, 'posts');
        const snapshot = await getDocs(postsRef);
        console.log('Posts found:', snapshot.size);
        snapshot.forEach(doc => {
            console.log('Post:', doc.id, doc.data());
        });
    } catch (error) {
        console.error('Firestore error:', error);
    }
}

testFirestore();
