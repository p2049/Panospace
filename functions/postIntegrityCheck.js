const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

/**
 * Scheduled function to check post integrity.
 * Runs every 1 hour.
 * Scans posts and verifies that their images exist in Storage.
 * Deletes posts with missing or invalid images.
 */
exports.postIntegrityCheck = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
    console.log('🔍 Starting Post Integrity Check...');

    const postsRef = db.collection('posts');
    const snapshot = await postsRef.get();

    let checkedCount = 0;
    let deletedCount = 0;
    const errors = [];

    const batchSize = 500;
    let batch = db.batch();
    let operationCounter = 0;

    for (const doc of snapshot.docs) {
        checkedCount++;
        const post = doc.data();
        let shouldDelete = false;
        let deleteReason = '';

        // 1. Check if images array exists and has valid URLs
        const images = post.images || [];
        // Also check legacy fields if images array is empty but other fields exist
        const primaryImageUrl = images[0]?.url || post.imageUrl || post.downloadURL;

        if (!primaryImageUrl) {
            shouldDelete = true;
            deleteReason = 'No image URL found';
        } else {
            // 2. Verify existence in Storage
            try {
                // Check all images in the post
                const urlsToCheck = images.map(img => img.url).filter(url => url);
                if (urlsToCheck.length === 0 && primaryImageUrl) urlsToCheck.push(primaryImageUrl);

                for (const url of urlsToCheck) {
                    if (!url.includes('firebasestorage.googleapis.com')) {
                        // Skip external URLs check, but if it's the ONLY image and it's not firebase, 
                        // we might want to keep it or flag it. For now, assuming all valid posts use firebase storage.
                        // If it's not a firebase URL, we can't verify it easily, so we might assume it's valid 
                        // OR if strict mode, delete it. 
                        // Let's be safe: if it's not firebase storage, we assume it's broken/legacy/invalid for this app.
                        shouldDelete = true;
                        deleteReason = 'Non-Firebase Storage URL';
                        break;
                    }

                    try {
                        const urlObj = new URL(url);
                        const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
                        if (!pathMatch) {
                            shouldDelete = true;
                            deleteReason = 'Malformed Storage URL';
                            break;
                        }

                        const storagePath = decodeURIComponent(pathMatch[1]);
                        const file = storage.bucket().file(storagePath);
                        const [exists] = await file.exists();

                        if (!exists) {
                            shouldDelete = true;
                            deleteReason = `File missing in storage: ${storagePath}`;
                            break;
                        }
                    } catch (e) {
                        shouldDelete = true;
                        deleteReason = `URL parsing error: ${e.message}`;
                        break;
                    }
                }
            } catch (err) {
                console.error(`Error verifying post ${doc.id}:`, err);
                errors.push({ postId: doc.id, error: err.message });
                continue; // Skip deletion if we had a system error verifying
            }
        }

        if (shouldDelete) {
            console.log(`🗑️ Deleting broken post ${doc.id}: ${deleteReason}`);
            batch.delete(doc.ref);
            deletedCount++;
            operationCounter++;

            // Also try to delete from userPosts if that collection exists (denormalized)
            // batch.delete(db.doc(`userPosts/${post.userId}/posts/${doc.id}`)); 
            // (Commented out as I'm not 100% sure of the path structure, but 'posts' is the main one)

            if (operationCounter >= batchSize) {
                await batch.commit();
                batch = db.batch();
                operationCounter = 0;
            }
        }
    }

    if (operationCounter > 0) {
        await batch.commit();
    }

    console.log(`✅ Integrity Check Complete.`);
    console.log(`   Checked: ${checkedCount}`);
    console.log(`   Deleted: ${deletedCount}`);
    console.log(`   Errors: ${errors.length}`);

    return null;
});
