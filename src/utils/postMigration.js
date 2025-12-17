// src/utils/postMigration.js
// Utility to migrate old posts to have proper postType field

import { db } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { logger } from '@/core/utils/logger';

/**
 * Migrates old posts to have proper postType field
 * - Posts with `body` content get postType: 'text'
 * - Posts with images but no postType get postType: 'image'
 * 
 * @param {string} userId - The user ID to migrate posts for
 * @returns {Promise<{migrated: number, errors: number}>}
 */
export const migrateUserPosts = async (userId) => {
    if (!userId) {
        logger.error('[PostMigration] No userId provided');
        return { migrated: 0, errors: 0 };
    }

    logger.log(`[PostMigration] Starting migration for user: ${userId}`);

    let migrated = 0;
    let errors = 0;

    try {
        // Fetch all posts by this user
        const postsQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', userId)
        );

        const snapshot = await getDocs(postsQuery);

        if (snapshot.empty) {
            // Try with userId field (newer posts)
            const postsQuery2 = query(
                collection(db, 'posts'),
                where('userId', '==', userId)
            );
            const snapshot2 = await getDocs(postsQuery2);

            if (snapshot2.empty) {
                logger.log('[PostMigration] No posts found for user');
                return { migrated: 0, errors: 0 };
            }

            // Process these posts
            for (const docSnap of snapshot2.docs) {
                const result = await migratePost(docSnap);
                if (result === 'migrated') migrated++;
                else if (result === 'error') errors++;
            }
        } else {
            // Process posts from first query
            for (const docSnap of snapshot.docs) {
                const result = await migratePost(docSnap);
                if (result === 'migrated') migrated++;
                else if (result === 'error') errors++;
            }
        }

        logger.log(`[PostMigration] Complete. Migrated: ${migrated}, Errors: ${errors}`);
        return { migrated, errors };
    } catch (error) {
        logger.error('[PostMigration] Migration failed:', error);
        return { migrated, errors: errors + 1 };
    }
};

/**
 * Migrate a single post document
 */
const migratePost = async (docSnap) => {
    const data = docSnap.data();
    const postId = docSnap.id;

    // Skip if already has correct postType
    if (data.postType === 'text' || data.postType === 'image') {
        return 'skipped';
    }

    try {
        let newPostType = 'image'; // Default for legacy posts

        // Determine if this is a text post
        // Text posts have body content and typically no images
        if (data.body && typeof data.body === 'string' && data.body.trim().length > 0) {
            newPostType = 'text';
        } else if (data.textContent && typeof data.textContent === 'string') {
            newPostType = 'text';
        }

        // Also check if it has no images - likely a text post
        const hasImages = (data.imageUrls && data.imageUrls.length > 0) ||
            (data.images && data.images.length > 0);

        if (!hasImages && !data.body) {
            // No images and no body - skip this weird post
            logger.warn(`[PostMigration] Post ${postId} has no images or body, skipping`);
            return 'skipped';
        }

        // Update the post
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            postType: newPostType
        });

        logger.log(`[PostMigration] Updated post ${postId} to postType: ${newPostType}`);
        return 'migrated';
    } catch (error) {
        logger.error(`[PostMigration] Failed to migrate post ${postId}:`, error);
        return 'error';
    }
};

/**
 * One-time migration for all posts (admin use)
 * This should be run carefully as it affects all posts in the database
 */
export const migrateAllPosts = async () => {
    logger.log('[PostMigration] Starting FULL migration of all posts...');

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    try {
        // Fetch posts without postType or with old postType values
        const postsQuery = query(collection(db, 'posts'));
        const snapshot = await getDocs(postsQuery);

        logger.log(`[PostMigration] Found ${snapshot.docs.length} total posts`);

        // Use batched writes for efficiency (max 500 per batch)
        const batches = [];
        let currentBatch = writeBatch(db);
        let batchCount = 0;

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();

            // Skip if already has correct postType
            if (data.postType === 'text' || data.postType === 'image') {
                skipped++;
                continue;
            }

            let newPostType = 'image';

            // Determine if text post
            if (data.body && typeof data.body === 'string' && data.body.trim().length > 0) {
                newPostType = 'text';
            } else if (data.textContent && typeof data.textContent === 'string') {
                newPostType = 'text';
            }

            const postRef = doc(db, 'posts', docSnap.id);
            currentBatch.update(postRef, { postType: newPostType });
            batchCount++;
            migrated++;

            // Firestore batch limit is 500
            if (batchCount >= 500) {
                batches.push(currentBatch);
                currentBatch = writeBatch(db);
                batchCount = 0;
            }
        }

        // Add remaining batch
        if (batchCount > 0) {
            batches.push(currentBatch);
        }

        // Commit all batches
        for (let i = 0; i < batches.length; i++) {
            await batches[i].commit();
            logger.log(`[PostMigration] Committed batch ${i + 1}/${batches.length}`);
        }

        logger.log(`[PostMigration] FULL migration complete. Migrated: ${migrated}, Skipped: ${skipped}, Errors: ${errors}`);
        return { migrated, skipped, errors };
    } catch (error) {
        logger.error('[PostMigration] Full migration failed:', error);
        return { migrated, skipped, errors: errors + 1 };
    }
};
