/**
 * Backfill Script: Add 'type' field to existing posts
 * 
 * This script updates all posts that don't have a 'type' field
 * and sets them to 'art' (the default).
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key
const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function backfillPostTypes() {
    console.log('🚀 Starting post type backfill...\n');

    try {
        // Get all posts
        const postsRef = db.collection('posts');
        const snapshot = await postsRef.get();

        console.log(`📊 Found ${snapshot.size} total posts\n`);

        let updatedCount = 0;
        let alreadyHadType = 0;
        let batch = db.batch();
        let batchCount = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();

            // Check if post already has a type field
            if (data.type) {
                alreadyHadType++;
                continue;
            }

            // Set type to 'art' for all existing posts (default)
            batch.update(doc.ref, { type: 'art' });
            updatedCount++;
            batchCount++;

            // Firestore batch limit is 500 operations
            if (batchCount >= 500) {
                await batch.commit();
                console.log(`✅ Committed batch of ${batchCount} updates`);
                batch = db.batch();
                batchCount = 0;
            }
        }

        // Commit remaining updates
        if (batchCount > 0) {
            await batch.commit();
            console.log(`✅ Committed final batch of ${batchCount} updates`);
        }

        console.log('\n📈 Backfill Summary:');
        console.log(`   Total posts: ${snapshot.size}`);
        console.log(`   Updated: ${updatedCount}`);
        console.log(`   Already had type: ${alreadyHadType}`);
        console.log('\n✅ Backfill complete!');

    } catch (error) {
        console.error('❌ Error during backfill:', error);
        throw error;
    } finally {
        // Clean up
        await admin.app().delete();
    }
}

// Run the backfill
backfillPostTypes()
    .then(() => {
        console.log('\n🎉 Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
