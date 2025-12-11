// Browser-based Color Backfill Tool
// This can be run from the browser console or as a page component

import { collection, getDocs, doc, updateDoc, query, where, limit } from 'firebase/firestore';
import { db } from '@/core/firebase';
import { extractDominantColor } from '@/core/utils/colors';
import { logger } from '@/core/utils/logger';

export class ColorBackfillTool {
    constructor() {
        this.processed = 0;
        this.succeeded = 0;
        this.failed = 0;
        this.skipped = 0;
        this.isRunning = false;
    }

    async backfillColors(batchSize = 10, onProgress = null) {
        if (this.isRunning) {
            logger.warn('⚠️ Backfill already running');
            return;
        }

        this.isRunning = true;
        this.processed = 0;
        this.succeeded = 0;
        this.failed = 0;
        this.skipped = 0;

        try {
            logger.log('🎨 Starting Color Backfill');
            logger.log('='.repeat(60));

            // Get posts without dominantColor
            const postsRef = collection(db, 'posts');
            const q = query(postsRef, limit(batchSize));
            const snapshot = await getDocs(q);

            logger.log(`📊 Found ${snapshot.size} posts to check\n`);

            for (const postDoc of snapshot.docs) {
                this.processed++;
                const data = postDoc.data();
                const postId = postDoc.id;

                const progress = {
                    current: this.processed,
                    total: snapshot.size,
                    postId,
                    status: 'processing'
                };

                logger.log(`\n[${this.processed}/${snapshot.size}] Processing ${postId.substring(0, 10)}...`);

                // Check if already has color
                if (data.dominantColor) {
                    logger.log('  ⏭️ Already has color:', data.dominantColor);
                    this.skipped++;
                    progress.status = 'skipped';
                    if (onProgress) onProgress(progress);
                    continue;
                }

                // Get first image URL
                const imageUrl = data.imageUrls?.[0] ||
                    data.thumbnailUrls?.[0] ||
                    data.images?.[0]?.url ||
                    data.images?.[0]?.thumbnailUrl;

                if (!imageUrl) {
                    logger.log('  ❌ No image URL found');
                    this.failed++;
                    progress.status = 'failed';
                    progress.error = 'No image URL';
                    if (onProgress) onProgress(progress);
                    continue;
                }

                logger.log('  🖼️ Extracting color from image...');

                try {
                    // Extract color using client-side function
                    const colorData = await extractDominantColor(imageUrl);
                    const dominantColor = colorData.hex;

                    logger.log('  ✅ Extracted color:', dominantColor);

                    // Update Firestore
                    const postRef = doc(db, 'posts', postId);
                    await updateDoc(postRef, {
                        dominantColor: dominantColor
                    });

                    logger.log('  💾 Saved to Firestore');
                    this.succeeded++;
                    progress.status = 'success';
                    progress.color = dominantColor;

                } catch (error) {
                    logger.error('  ❌ Failed:', error.message);
                    this.failed++;
                    progress.status = 'failed';
                    progress.error = error.message;
                }

                if (onProgress) onProgress(progress);

                // Rate limiting - wait 200ms between requests
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            logger.log('\n' + '='.repeat(60));
            logger.log('📊 BACKFILL COMPLETE');
            logger.log('='.repeat(60));
            logger.log(`Total processed: ${this.processed}`);
            logger.log(`✅ Succeeded: ${this.succeeded}`);
            logger.log(`❌ Failed: ${this.failed}`);
            logger.log(`⏭️ Skipped (already has color): ${this.skipped}`);
            logger.log('='.repeat(60));

            return {
                processed: this.processed,
                succeeded: this.succeeded,
                failed: this.failed,
                skipped: this.skipped
            };

        } catch (error) {
            logger.error('❌ Fatal error:', error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    getStats() {
        return {
            processed: this.processed,
            succeeded: this.succeeded,
            failed: this.failed,
            skipped: this.skipped,
            isRunning: this.isRunning
        };
    }
}

// Export singleton instance
export const colorBackfillTool = new ColorBackfillTool();

// Usage example:
// import { colorBackfillTool } from './utils/colorBackfillTool';
//
// // Run backfill with progress callback
// await colorBackfillTool.backfillColors(10, (progress) => {
//     console.log(`Progress: ${progress.current}/${progress.total}`, progress.status);
// });
