/**
 * HARD RESET UTILITY - Delete All Posts
 * 
 * This script will:
 * 1. Delete all documents from the 'posts' collection in Firestore
 * 2. Delete all documents from the 'shopItems' collection in Firestore
 * 3. Note: Storage files must be deleted manually via Firebase Console
 * 
 * WARNING: This is irreversible! Use with caution.
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'panospace-7v4ucn.appspot.com'
    });
}

const db = admin.firestore();

async function deleteCollection(collectionPath, batchSize = 100) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve, reject);
    });
}

async function deleteQueryBatch(query, resolve, reject) {
    try {
        const snapshot = await query.get();

        if (snapshot.size === 0) {
            resolve();
            return;
        }

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Deleted ${snapshot.size} documents`);

        // Recurse on the next batch
        process.nextTick(() => {
            deleteQueryBatch(query, resolve, reject);
        });
    } catch (error) {
        reject(error);
    }
}

async function hardReset() {
    console.log('🚨 HARD RESET - Deleting all posts and shop items...\n');

    try {
        // Delete all posts
        console.log('Deleting posts collection...');
        await deleteCollection('posts');
        console.log('✅ Posts collection deleted\n');

        // Delete all shop items
        console.log('Deleting shopItems collection...');
        await deleteCollection('shopItems');
        console.log('✅ Shop items collection deleted\n');

        console.log('🎉 Hard reset complete!');
        console.log('\n⚠️  IMPORTANT: You must manually delete the /posts folder in Firebase Storage:');
        console.log('   1. Go to Firebase Console > Storage');
        console.log('   2. Delete the /posts folder');
        console.log('   3. Create a new empty /posts folder');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during hard reset:', error);
        process.exit(1);
    }
}

// Run the hard reset
hardReset();
