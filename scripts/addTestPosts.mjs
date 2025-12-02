// Quick script to add test posts directly to Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config (same as in your app)
const firebaseConfig = {
    apiKey: "AIzaSyBnBrBp44WYvJpY7N5b5dPXHIRQ3FMJ2jU",
    authDomain: "panospace-7v4ucn.firebaseapp.com",
    projectId: "panospace-7v4ucn",
    storageBucket: "panospace-7v4ucn.firebasestorage.app",
    messagingSenderId: "418892086673",
    appId: "1:418892086673:web:58038b80f56ea6a4891a06"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestPosts() {
    const posts = [
        {
            userId: "test-user-1",
            username: "Test Artist",
            profileImage: "",
            title: "Beautiful Sunset",
            tags: ["landscape", "nature", "sunset"],
            location: { city: "San Francisco", state: "CA", country: "USA" },
            images: [{
                url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
                caption: "Golden hour magic",
                addToShop: false,
                printSizes: [],
                customPrices: {},
                exif: null
            }],
            searchKeywords: ["beautiful", "sunset", "test", "artist"],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            likeCount: 0,
            commentCount: 0,
            addToShop: false,
            shopLinked: false,
            items: [{
                type: 'image',
                url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
                caption: "Golden hour magic"
            }]
        },
        {
            userId: "test-user-2",
            username: "Photo Master",
            profileImage: "",
            title: "Mountain Vista",
            tags: ["mountain", "landscape", "adventure"],
            location: { city: "Denver", state: "CO", country: "USA" },
            images: [{
                url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
                caption: "Mountain peaks at dawn",
                addToShop: false,
                printSizes: [],
                customPrices: {},
                exif: null
            }],
            searchKeywords: ["mountain", "vista", "photo", "master"],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            likeCount: 5,
            commentCount: 2,
            addToShop: false,
            shopLinked: false,
            items: [{
                type: 'image',
                url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
                caption: "Mountain peaks at dawn"
            }]
        }
    ];

    for (const post of posts) {
        try {
            const docRef = await addDoc(collection(db, 'posts'), post);
            console.log('✅ Created post:', docRef.id);
        } catch (e) {
            console.error('❌ Error adding post:', e);
        }
    }

    console.log('\n✨ Done! Test posts created.');
    process.exit(0);
}

addTestPosts();
