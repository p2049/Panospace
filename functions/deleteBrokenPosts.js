// Admin script to delete broken posts from Firestore
const admin = require('firebase-admin');

// Initialize Firebase Admin with default credentials
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'panospace-7v4ucn',
        storageBucket: 'panospace-7v4ucn.firebasestorage.app'
    });
}

const db = admin.firestore();

// List of broken post IDs from console logs
const brokenPostIds = [
    'G1cdEnwEKqXE7cCrXHAR',
    '2qxnqFvABXDnZfAQR8Zp',
    'aY7di1vaDSXPsXyQKftr',
    '9cNBY7lDssANE9dbatoo',
    'bFDKwviqPz1wRZQQSuCx',
    'vRjKxicm4tfNvws6KwLW',
    'GvdKNinN8l6bGRTytmQp',
    'mAs2A3qfAdC6dMkNJW4L',
    'NScsQRPEmqRI6f5ICI1y',
    'wyr6HBSU6CaMurAYpsYb',
    'VT1GEVUZsTrY071eAqDE',
    'nqwluj6el01VJgUwkPjv',
    'aDgYf50by1ZDx1idvP5S',
    'v2YQsUcvWqRabYAs6i9f',
    '2CG7VCDnyO64pSo4Dzz1',
    'VgVpPa14kvFaxeLOMnFc',
    'CBrsp1wVBfWqhI7eQ3ch',
    '1QPjWzQJvVyKwDRe0F0r',
    'B8ZoWdSuVVIaBKheuvh1'
];

async function deleteBrokenPosts() {
    console.log(`🗑️  Starting deletion of ${brokenPostIds.length} broken posts...`);

    let deletedCount = 0;
    let notFoundCount = 0;

    for (const postId of brokenPostIds) {
        try {
            const postRef = db.collection('posts').doc(postId);
            const postDoc = await postRef.get();

            if (postDoc.exists) {
                await postRef.delete();
                console.log(`✅ Deleted post: ${postId}`);
                deletedCount++;
            } else {
                console.log(`⚠️  Post not found (already deleted?): ${postId}`);
                notFoundCount++;
            }
        } catch (error) {
            console.error(`❌ Error deleting post ${postId}:`, error.message);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Deleted: ${deletedCount}`);
    console.log(`   Not found: ${notFoundCount}`);
    console.log(`   Total processed: ${brokenPostIds.length}`);

    process.exit(0);
}

deleteBrokenPosts().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
