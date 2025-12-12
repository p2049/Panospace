// Script to run cleanup of orphaned posts
// Run with: node scripts/runCleanup.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// Firebase config - using the same config as the app
const firebaseConfig = {
    apiKey: "AIzaSyCSQsWG8zdGGAT3BXUjuOh75IO2OO3af5c",
    authDomain: "panospace-7v4ucn.firebaseapp.com",
    projectId: "panospace-7v4ucn",
    storageBucket: "panospace-7v4ucn.appspot.com",
    messagingSenderId: "832100282894",
    appId: "1:832100282894:web:371c454407d68d5ef3425f",
    measurementId: "G-XXSZBBYJWL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function cleanupOrphanedPosts() {
    console.log('🧹 Starting orphaned posts cleanup...');

    const postsRef = collection(db, 'posts');
    const snapshot = await getDocs(postsRef);

    let deletedCount = 0;
    let checkedCount = 0;
    const errors = [];

    for (const postDoc of snapshot.docs) {
        checkedCount++;
        const post = postDoc.data();

        // Get the primary image URL
        const imageUrl = post.images?.[0]?.url || post.imageUrl || post.downloadURL;

        if (!imageUrl) {
            console.log(`🗑️  Post ${postDoc.id} has no image URL, deleting...`);
            await deleteDoc(doc(db, 'posts', postDoc.id));
            deletedCount++;
            continue;
        }

        try {
            // Extract the storage path from the URL
            const urlObj = new URL(imageUrl);
            const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);

            if (!pathMatch) {
                console.log(`⚠️  Could not parse storage path for post ${postDoc.id}`);
                if (imageUrl.includes('firebasestorage.googleapis.com')) {
                    console.log(`🗑️  Deleting post ${postDoc.id} with malformed Firebase URL`);
                    await deleteDoc(doc(db, 'posts', postDoc.id));
                    deletedCount++;
                }
                continue;
            }

            const storagePath = decodeURIComponent(pathMatch[1]);
            const storageRef = ref(storage, storagePath);

            // Try to get the download URL - if it fails, the file doesn't exist
            try {
                await getDownloadURL(storageRef);
                console.log(`✅ Post ${postDoc.id} - image exists`);
            } catch (storageError) {
                if (storageError.code === 'storage/object-not-found') {
                    console.log(`🗑️  Deleting orphaned post ${postDoc.id} - image not found in storage`);
                    await deleteDoc(doc(db, 'posts', postDoc.id));
                    deletedCount++;
                } else {
                    throw storageError;
                }
            }
        } catch (error) {
            console.error(`❌ Error processing post ${postDoc.id}:`, error);
            errors.push({ postId: postDoc.id, error: error.message });
        }
    }

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   Posts checked: ${checkedCount}`);
    console.log(`   Posts deleted: ${deletedCount}`);
    console.log(`   Errors: ${errors.length}`);

    return { checked: checkedCount, deleted: deletedCount, errors };
}

// Run the cleanup
cleanupOrphanedPosts()
    .then(result => {
        console.log('\n✅ Cleanup complete!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Cleanup failed:', error);
        process.exit(1);
    });
