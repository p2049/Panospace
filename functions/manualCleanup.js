const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

/**
 * Callable function to manually trigger cleanup of broken posts
 * Can be called from the AdminCleanup page
 */
exports.manualCleanupBrokenPosts = functions.https.onCall(async (data, context) => {
    // 🔐 SECURITY: Auth check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    // 🔐 SECURITY: Admin check (optional - remove if any user can trigger cleanup)
    // Uncomment these lines if you want admin-only access:
    // const userDoc = await db.collection('users').doc(context.auth.uid).get();
    // if (!userDoc.exists || userDoc.data().role !== 'admin') {
    //     throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    // }

    console.log('🧹 Manual cleanup triggered by user:', context.auth.uid);

    const postsRef = db.collection('posts');
    const snapshot = await postsRef.get();

    let checkedCount = 0;
    let deletedCount = 0;
    const errors = [];
    const deletedPosts = [];

    for (const postDoc of snapshot.docs) {
        checkedCount++;
        const post = postDoc.data();
        let shouldDelete = false;
        let deleteReason = '';

        // Get the primary image URL
        const imageUrl = post.images?.[0]?.url || post.imageUrl || post.downloadURL;

        if (!imageUrl) {
            shouldDelete = true;
            deleteReason = 'No image URL';
        } else {
            try {
                // Check if it's a Firebase Storage URL
                if (!imageUrl.includes('firebasestorage.googleapis.com')) {
                    shouldDelete = true;
                    deleteReason = 'Non-Firebase Storage URL';
                } else {
                    // Extract storage path and check existence
                    const urlObj = new URL(imageUrl);
                    const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);

                    if (!pathMatch) {
                        shouldDelete = true;
                        deleteReason = 'Malformed Storage URL';
                    } else {
                        const storagePath = decodeURIComponent(pathMatch[1]);
                        const file = storage.bucket().file(storagePath);
                        const [exists] = await file.exists();

                        if (!exists) {
                            shouldDelete = true;
                            deleteReason = 'File not found in storage';
                        }
                    }
                }
            } catch (err) {
                console.error(`Error checking post ${postDoc.id}:`, err);
                errors.push({ postId: postDoc.id, error: err.message });
            }
        }

        if (shouldDelete) {
            console.log(`🗑️ Deleting post ${postDoc.id}: ${deleteReason}`);
            try {
                await postDoc.ref.delete();
                deletedCount++;
                deletedPosts.push({ id: postDoc.id, reason: deleteReason });
            } catch (deleteErr) {
                console.error(`Error deleting post ${postDoc.id}:`, deleteErr);
                errors.push({ postId: postDoc.id, error: deleteErr.message });
            }
        }
    }

    console.log(`✅ Cleanup complete. Checked: ${checkedCount}, Deleted: ${deletedCount}`);

    return {
        success: true,
        checked: checkedCount,
        deleted: deletedCount,
        deletedPosts,
        errors
    };
});
