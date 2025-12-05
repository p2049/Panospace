// Simpler backfill script - marks posts for color extraction
// Run: node scripts/markPostsForColorExtraction.js

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
    readFileSync('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function markPostsForColorExtraction(dryRun = true, batchSize = 100) {
    try {
        console.log('🎨 Marking Posts for Color Extraction');
        console.log('='.repeat(60));
        console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will update Firestore)'}`);
        console.log(`Batch size: ${batchSize} posts`);
        console.log('='.repeat(60) + '\n');

        // Get posts without dominantColor field
        const postsSnapshot = await db.collection('posts')
            .limit(batchSize)
            .get();

        console.log(`📊 Found ${postsSnapshot.size} posts total\n`);

        let processed = 0;
        let needsColor = 0;
        let hasColor = 0;
        let noImages = 0;

        const batch = db.batch();
        let batchCount = 0;
        const MAX_BATCH = 500; // Firestore batch limit

        for (const doc of postsSnapshot.docs) {
            processed++;
            const data = doc.data();
            const postId = doc.id;

            // Check if already has color
            if (data.dominantColor) {
                hasColor++;
                if (processed <= 10) {
                    console.log(`✅ Post ${postId.substring(0, 10)}... already has color: ${data.dominantColor}`);
                }
                continue;
            }

            // Check if has images
            const hasImages = data.imageUrls?.length > 0 ||
                data.thumbnailUrls?.length > 0 ||
                data.images?.length > 0;

            if (!hasImages) {
                noImages++;
                console.log(`⏭️ Post ${postId.substring(0, 10)}... has no images, skipping`);
                continue;
            }

            needsColor++;
            console.log(`🎨 Post ${postId.substring(0, 10)}... needs color extraction`);

            if (!dryRun) {
                // Add a flag to mark this post needs color extraction
                // A separate process/function can pick these up and process them
                batch.update(doc.ref, {
                    needsColorExtraction: true,
                    colorExtractionMarkedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                batchCount++;

                // Commit batch if we hit the limit
                if (batchCount >= MAX_BATCH) {
                    await batch.commit();
                    console.log(`\n💾 Committed batch of ${batchCount} updates\n`);
                    batchCount = 0;
                }
            }
        }

        // Commit remaining batch
        if (!dryRun && batchCount > 0) {
            await batch.commit();
            console.log(`\n💾 Committed final batch of ${batchCount} updates\n`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total processed: ${processed}`);
        console.log(`✅ Already has color: ${hasColor}`);
        console.log(`🎨 Needs color: ${needsColor}`);
        console.log(`⏭️ No images (skipped): ${noImages}`);
        console.log('='.repeat(60));

        if (dryRun) {
            console.log('\n⚠️ This was a DRY RUN - no changes were made');
            console.log('To actually mark posts, run:');
            console.log('  node scripts/markPostsForColorExtraction.js --live');
        } else {
            console.log(`\n✅ Marked ${needsColor} posts for color extraction`);
            console.log('\nNext steps:');
            console.log('1. Create a Cloud Function to process posts with needsColorExtraction=true');
            console.log('2. Or use the browser-based backfill tool (see below)');
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isLive = args.includes('--live');
const batchSize = parseInt(args.find(arg => arg.startsWith('--batch='))?.split('=')[1]) || 100;

markPostsForColorExtraction(!isLive, batchSize);
