// Migration script to update date format in existing posts
// Run this once to convert all old date formats from "MM.DD.YY" to "D M 'Y"

import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export const migrateDateFormats = async () => {
    console.log('Starting date format migration...');

    try {
        const postsRef = collection(db, 'posts');
        const snapshot = await getDocs(postsRef);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const postDoc of snapshot.docs) {
            const post = postDoc.data();

            // Check if post has uiOverlays with quartzDate
            if (post.uiOverlays?.quartzDate?.text) {
                const oldText = post.uiOverlays.quartzDate.text;

                // Check if it's in old format (contains periods)
                if (oldText.includes('.')) {
                    // Convert from "MM.DD.YY" to "D M 'Y"
                    const parts = oldText.split('.');
                    if (parts.length === 3) {
                        const month = parseInt(parts[0]);
                        const day = parseInt(parts[1]);
                        const year = parts[2];

                        // New format: D M 'Y (no leading zeros, spaces instead of periods)
                        const newText = `${day} ${month} '${year}`;

                        // Update the post
                        await updateDoc(doc(db, 'posts', postDoc.id), {
                            'uiOverlays.quartzDate.text': newText
                        });

                        updatedCount++;
                        console.log(`Updated post ${postDoc.id}: "${oldText}" → "${newText}"`);
                    }
                } else {
                    skippedCount++;
                }
            } else {
                skippedCount++;
            }
        }

        console.log(`Migration complete!`);
        console.log(`Updated: ${updatedCount} posts`);
        console.log(`Skipped: ${skippedCount} posts (no date stamp or already in new format)`);

        return { success: true, updated: updatedCount, skipped: skippedCount };
    } catch (error) {
        console.error('Migration failed:', error);
        return { success: false, error: error.message };
    }
};
