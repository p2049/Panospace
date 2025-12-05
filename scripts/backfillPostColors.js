// Backfill dominant colors for existing posts
// Run: node scripts/backfillPostColors.js

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import { createCanvas, loadImage } from 'canvas';

const serviceAccount = JSON.parse(
    readFileSync('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Color extraction function (matching client-side logic)
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

async function extractDominantColor(imageUrl) {
    try {
        // Load image
        const img = await loadImage(imageUrl);

        // Create canvas
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');

        // Resize for performance
        const scale = Math.min(100 / img.width, 100 / img.height);
        const width = img.width * scale;
        const height = img.height * scale;

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        // Color buckets for quantization
        const colorMap = {};
        const skipPixels = 5;

        // Collect colors
        for (let i = 0; i < pixels.length; i += 4 * skipPixels) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            // Skip transparent pixels
            if (a < 125) continue;

            // Skip very dark or very light pixels
            const brightness = (r + g + b) / 3;
            if (brightness < 20 || brightness > 235) continue;

            // Quantize to reduce color variations
            const quantize = 30;
            const qr = Math.round(r / quantize) * quantize;
            const qg = Math.round(g / quantize) * quantize;
            const qb = Math.round(b / quantize) * quantize;

            const key = `${qr},${qg},${qb}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
        }

        // Find most common color
        let maxCount = 0;
        let dominantColor = null;

        for (const [color, count] of Object.entries(colorMap)) {
            if (count > maxCount) {
                maxCount = count;
                dominantColor = color;
            }
        }

        if (!dominantColor) {
            // Fallback to center pixel
            const centerX = Math.floor(width / 2);
            const centerY = Math.floor(height / 2);
            const centerIndex = (centerY * width + centerX) * 4;
            dominantColor = `${pixels[centerIndex]},${pixels[centerIndex + 1]},${pixels[centerIndex + 2]}`;
        }

        const [r, g, b] = dominantColor.split(',').map(Number);
        const hex = rgbToHex(r, g, b);

        return hex;
    } catch (error) {
        console.error('  ⚠️ Color extraction failed:', error.message);
        return null;
    }
}

async function backfillPostColors(dryRun = true, batchSize = 10) {
    try {
        console.log('🎨 Backfilling Post Colors');
        console.log('='.repeat(60));
        console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will update Firestore)'}`);
        console.log(`Batch size: ${batchSize} posts`);
        console.log('='.repeat(60) + '\n');

        // Get posts without dominantColor field
        const postsSnapshot = await db.collection('posts')
            .limit(batchSize)
            .get();

        console.log(`📊 Found ${postsSnapshot.size} posts to process\n`);

        let processed = 0;
        let succeeded = 0;
        let failed = 0;
        let skipped = 0;

        for (const doc of postsSnapshot.docs) {
            processed++;
            const data = doc.data();
            const postId = doc.id;

            console.log(`\n[${processed}/${postsSnapshot.size}] Processing post ${postId.substring(0, 10)}...`);

            // Check if already has color
            if (data.dominantColor) {
                console.log('  ⏭️ Already has dominantColor:', data.dominantColor);
                skipped++;
                continue;
            }

            // Get first image URL
            const imageUrl = data.imageUrls?.[0] || data.thumbnailUrls?.[0] || data.images?.[0]?.url;

            if (!imageUrl) {
                console.log('  ❌ No image URL found');
                failed++;
                continue;
            }

            console.log('  🖼️ Image URL:', imageUrl.substring(0, 60) + '...');

            // Extract color
            const dominantColor = await extractDominantColor(imageUrl);

            if (!dominantColor) {
                console.log('  ❌ Failed to extract color');
                failed++;
                continue;
            }

            console.log('  ✅ Extracted color:', dominantColor);

            // Update Firestore
            if (!dryRun) {
                await doc.ref.update({
                    dominantColor: dominantColor,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log('  💾 Saved to Firestore');
            } else {
                console.log('  💾 Would save to Firestore (dry run)');
            }

            succeeded++;

            // Rate limiting - wait 100ms between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total processed: ${processed}`);
        console.log(`✅ Succeeded: ${succeeded}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⏭️ Skipped (already has color): ${skipped}`);
        console.log('='.repeat(60));

        if (dryRun) {
            console.log('\n⚠️ This was a DRY RUN - no changes were made');
            console.log('To actually update Firestore, run:');
            console.log('  node scripts/backfillPostColors.js --live');
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
const batchSize = parseInt(args.find(arg => arg.startsWith('--batch='))?.split('=')[1]) || 10;

backfillPostColors(!isLive, batchSize);
