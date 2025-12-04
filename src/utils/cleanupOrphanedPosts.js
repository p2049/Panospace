import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

/**
 * Cleanup utility to delete posts whose images no longer exist in Storage
 * 🔒 OPTIMIZED: Now uses batch processing to avoid expensive full collection scans
 */
export const cleanupOrphanedPosts = async (batchSize = 100) => {
    console.log('🧹 Starting orphaned posts cleanup...');

    let deletedCount = 0;
    let checkedCount = 0;
    const errors = [];
    let lastDoc = null;
    let hasMore = true;

    while (hasMore) {
        // 🔒 SAFETY: Process in batches to avoid reading entire collection
        // WHY: At 100k posts, reading all at once = 100k reads = $6
        // With batches: Only reads what's needed, can be stopped/resumed
        const postsRef = collection(db, 'posts');
        let q = query(
            postsRef,
            orderBy('createdAt', 'desc'),
            limit(batchSize)
        );

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            hasMore = false;
            break;
        }

        for (const postDoc of snapshot.docs) {
            checkedCount++;
            const post = postDoc.data();

            // Get the primary image URL
            const imageUrl = post.images?.[0]?.url || post.imageUrl || post.downloadURL;

            if (!imageUrl) {
                console.log(`🗑️  Post ${postDoc.id} has no image URL, deleting...`);
                await deleteDoc(doc(db, 'posts', postDoc.id));
                deletedCount++;
                continue;
            }

            try {
                // Extract the storage path from the URL
                const urlObj = new URL(imageUrl);
                const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);

                if (!pathMatch) {
                    console.log(`⚠️  Could not parse storage path for post ${postDoc.id}`);
                    if (imageUrl.includes('firebasestorage.googleapis.com')) {
                        console.log(`🗑️  Deleting post ${postDoc.id} with malformed Firebase URL`);
                        await deleteDoc(doc(db, 'posts', postDoc.id));
                        deletedCount++;
                    }
                    continue;
                }

                const storagePath = decodeURIComponent(pathMatch[1]);
                const storageRef = ref(storage, storagePath);

                try {
                    await getDownloadURL(storageRef);
                    console.log(`✅ Post ${postDoc.id} - image exists`);
                } catch (storageError) {
                    if (storageError.code === 'storage/object-not-found') {
                        console.log(`🗑️  Deleting orphaned post ${postDoc.id} - image not found`);
                        await deleteDoc(doc(db, 'posts', postDoc.id));
                        deletedCount++;
                    } else {
                        throw storageError;
                    }
                }
            } catch (error) {
                console.error(`❌ Error processing post ${postDoc.id}:`, error);
                errors.push({ postId: postDoc.id, error: error.message });
            }
        }

        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        console.log(`📊 Progress: Checked ${checkedCount} posts, deleted ${deletedCount}`);
    }

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   Posts checked: ${checkedCount}`);
    console.log(`   Posts deleted: ${deletedCount}`);
    console.log(`   Errors: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\n❌ Errors encountered:');
        errors.forEach(e => console.log(`   - Post ${e.postId}: ${e.error}`));
    }

    return {
        checked: checkedCount,
        deleted: deletedCount,
        errors
    };
};

/**
 * Cleanup shop items whose images don't exist in Storage
 * 🔒 OPTIMIZED: Batch processing
 */
export const cleanupOrphanedShopItems = async (batchSize = 100) => {
    console.log('🧹 Starting orphaned shop items cleanup...');

    let deletedCount = 0;
    let checkedCount = 0;
    let lastDoc = null;
    let hasMore = true;

    while (hasMore) {
        const shopRef = collection(db, 'shopItems');
        let q = query(
            shopRef,
            orderBy('createdAt', 'desc'),
            limit(batchSize)
        );

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            hasMore = false;
            break;
        }

        for (const itemDoc of snapshot.docs) {
            checkedCount++;
            const item = itemDoc.data();
            const imageUrl = item.imageUrl;

            if (!imageUrl) {
                console.log(`🗑️  Shop item ${itemDoc.id} has no image URL, deleting...`);
                await deleteDoc(doc(db, 'shopItems', itemDoc.id));
                deletedCount++;
                continue;
            }

            try {
                const urlObj = new URL(imageUrl);
                const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
                if (!pathMatch) {
                    if (imageUrl.includes('firebasestorage.googleapis.com')) {
                        console.log(`🗑️  Deleting shop item ${itemDoc.id} with malformed Firebase URL`);
                        await deleteDoc(doc(db, 'shopItems', itemDoc.id));
                        deletedCount++;
                    }
                    continue;
                }

                const storagePath = decodeURIComponent(pathMatch[1]);
                const storageRef = ref(storage, storagePath);

                try {
                    await getDownloadURL(storageRef);
                    console.log(`✅ Shop item ${itemDoc.id} - image exists`);
                } catch (storageError) {
                    if (storageError.code === 'storage/object-not-found') {
                        console.log(`🗑️  Deleting orphaned shop item ${itemDoc.id}`);
                        await deleteDoc(doc(db, 'shopItems', itemDoc.id));
                        deletedCount++;
                    }
                }
            } catch (error) {
                console.error(`❌ Error processing shop item ${itemDoc.id}:`, error);
            }
        }

        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        console.log(`📊 Progress: Checked ${checkedCount} shop items, deleted ${deletedCount}`);
    }

    console.log(`\n📊 Shop Cleanup Summary:`);
    console.log(`   Items checked: ${checkedCount}`);
    console.log(`   Items deleted: ${deletedCount}`);

    return { checked: checkedCount, deleted: deletedCount };
};

/**
 * Cleanup user profile images that don't exist in Storage
 * 🔒 OPTIMIZED: Batch processing
 */
export const cleanupOrphanedUserImages = async (batchSize = 100) => {
    console.log('🧹 Starting orphaned user images cleanup...');

    let updatedCount = 0;
    let checkedCount = 0;
    const errors = [];
    let lastDoc = null;
    let hasMore = true;

    while (hasMore) {
        const usersRef = collection(db, 'users');
        let q = query(
            usersRef,
            orderBy('createdAt', 'desc'),
            limit(batchSize)
        );

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            hasMore = false;
            break;
        }

        for (const userDoc of snapshot.docs) {
            checkedCount++;
            const user = userDoc.data();
            const photoURL = user.photoURL;

            if (!photoURL) continue;

            try {
                // Check if it's a Firebase Storage URL
                if (!photoURL.includes('firebasestorage.googleapis.com')) {
                    continue; // Skip external URLs (e.g. Google Auth default images)
                }

                const urlObj = new URL(photoURL);
                const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);

                if (!pathMatch) {
                    if (photoURL.includes('firebasestorage.googleapis.com')) {
                        console.log(`🗑️  Removing malformed photo URL for user ${userDoc.id}`);
                        await updateDoc(doc(db, 'users', userDoc.id), {
                            photoURL: ''
                        });
                        updatedCount++;
                    }
                    continue;
                }

                const storagePath = decodeURIComponent(pathMatch[1]);
                const storageRef = ref(storage, storagePath);

                try {
                    await getDownloadURL(storageRef);
                    console.log(`✅ User ${userDoc.id} - photo exists`);
                } catch (storageError) {
                    if (storageError.code === 'storage/object-not-found') {
                        console.log(`🗑️  Removing orphaned photo for user ${userDoc.id}`);
                        await updateDoc(doc(db, 'users', userDoc.id), {
                            photoURL: ''
                        });
                        updatedCount++;
                    } else {
                        throw storageError;
                    }
                }
            } catch (error) {
                console.error(`❌ Error processing user ${userDoc.id}:`, error);
                errors.push({ userId: userDoc.id, error: error.message });
            }
        }

        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        console.log(`📊 Progress: Checked ${checkedCount} users, updated ${updatedCount}`);
    }

    console.log(`\n📊 User Cleanup Summary:`);
    console.log(`   Users checked: ${checkedCount}`);
    console.log(`   Users updated: ${updatedCount}`);

    return {
        checked: checkedCount,
        updated: updatedCount,
        errors
    };
};
