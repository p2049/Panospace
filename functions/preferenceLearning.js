/**
 * Preference Learning System for Panospace
 * 
 * Passively learns user preferences based on engagement actions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Action weight multipliers
 * Higher weights = stronger signal of preference
 */
const ACTION_WEIGHTS = {
    like: 0.1,       // Light signal
    save: 0.3,       // Medium signal (more intent)
    purchase: 0.5,   // Strong signal (highest intent)
    view: 0.05,      // Very light signal
    comment: 0.15,   // Light-medium signal
    share: 0.2       // Medium signal
};

/**
 * Update user preferences based on engagement with a post
 * @param {string} userId - User ID
 * @param {string} postId - Post ID
 * @param {string} action - Action type ('like', 'save', 'purchase', 'view', 'comment', 'share')
 */
async function updateUserPreferences(userId, postId, action) {
    try {
        // Fetch post document
        const postDoc = await db.collection('posts').doc(postId).get();

        if (!postDoc.exists) {
            console.warn(`Post ${postId} not found`);
            return;
        }

        const post = postDoc.data();

        // Fetch user document
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.warn(`User ${userId} not found`);
            return;
        }

        const user = userDoc.data();

        // Initialize preferences if not exists
        const preferences = user.preferences || {
            tags: {},
            filmTypes: [],
            subjects: [],
            parks: [],
            cities: [],
            aesthetics: []
        };

        // Get action weight
        const weight = ACTION_WEIGHTS[action] || 0.1;

        // 1. Update tag preferences
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => {
                if (tag) {
                    preferences.tags[tag] = (preferences.tags[tag] || 0) + weight;
                }
            });
        }

        // 2. Update film type preferences
        if (post.isFilm && post.filmType) {
            if (!preferences.filmTypes.includes(post.filmType)) {
                preferences.filmTypes.push(post.filmType);
            }
        }

        // 3. Update subject preferences
        if (post.subject) {
            if (!preferences.subjects.includes(post.subject)) {
                preferences.subjects.push(post.subject);
            }
        }

        // 4. Update park preferences
        if (post.parkId) {
            if (!preferences.parks.includes(post.parkId)) {
                preferences.parks.push(post.parkId);
            }
        }

        // 5. Update Date Stamp Style preferences (Micro-preference)
        if (post.dateStampStyle) {
            preferences.dateStampStyles = preferences.dateStampStyles || {};
            preferences.dateStampStyles[post.dateStampStyle] = (preferences.dateStampStyles[post.dateStampStyle] || 0) + weight;
        }

        // 6. Context Momentum (Transient Boosts)
        // We track recent interactions to boost similar content temporarily
        const now = Date.now();
        preferences.momentum = preferences.momentum || { tags: {}, parks: {}, cities: {} };

        // Helper to update momentum
        const updateMomentum = (type, key) => {
            if (!key) return;
            const current = preferences.momentum[type][key] || { count: 0, lastInteraction: 0 };

            // Reset if streak is broken (e.g. > 30 mins gap)
            if (now - current.lastInteraction > 30 * 60 * 1000) {
                current.count = 0;
            }

            preferences.momentum[type][key] = {
                count: current.count + 1,
                lastInteraction: now
            };
        };

        // Update Tag Momentum
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => updateMomentum('tags', tag));
        }

        // Update Park Momentum
        if (post.parkId) {
            updateMomentum('parks', post.parkId);
        }

        // Update City Momentum (City Affinity)
        if (post.location && post.location.city) {
            updateMomentum('cities', post.location.city);
        }

        // 5. Update city preferences
        if (post.cityName) {
            if (!preferences.cities.includes(post.cityName)) {
                preferences.cities.push(post.cityName);
            }
        }

        // 6. Update aesthetic preferences (if available)
        if (post.aesthetic) {
            if (!preferences.aesthetics.includes(post.aesthetic)) {
                preferences.aesthetics.push(post.aesthetic);
            }
        }

        // 7. Normalize tag weights (keep top 100, decay others)
        const tagEntries = Object.entries(preferences.tags);
        tagEntries.sort((a, b) => b[1] - a[1]);

        // Keep only top 100 tags
        preferences.tags = Object.fromEntries(tagEntries.slice(0, 100));

        // Apply decay to prevent old preferences from dominating
        Object.keys(preferences.tags).forEach(tag => {
            preferences.tags[tag] *= 0.99; // 1% decay per update
        });

        // 8. Limit array sizes to prevent unbounded growth
        preferences.filmTypes = preferences.filmTypes.slice(0, 20);
        preferences.subjects = preferences.subjects.slice(0, 30);
        preferences.parks = preferences.parks.slice(0, 50);
        preferences.cities = preferences.cities.slice(0, 50);
        preferences.aesthetics = preferences.aesthetics.slice(0, 20);

        // 9. Update engagement history
        const engagementHistory = user.engagementHistory || {
            likedPosts: [],
            savedPosts: [],
            purchasedPrints: [],
            viewedPosts: [],
            commentedPosts: [],
            sharedPosts: []
        };

        // Add to appropriate history array
        const historyKey = `${action}${action === 'like' ? 'd' : action === 'save' ? 'd' : action === 'purchase' ? 'd' : action === 'view' ? 'ed' : action === 'comment' ? 'ed' : 'd'}Posts`;

        if (engagementHistory[historyKey]) {
            // Add to front, keep last 100
            engagementHistory[historyKey] = [postId, ...engagementHistory[historyKey]].slice(0, 100);
        }

        // 10. Update Firestore
        await userRef.update({
            preferences,
            engagementHistory,
            preferencesUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Updated preferences for user ${userId} based on ${action} action on post ${postId}`);

    } catch (error) {
        console.error('Error updating user preferences:', error);
        throw error;
    }
}

/**
 * Increment engagement count on post
 * @param {string} postId - Post ID
 * @param {string} metric - Metric to increment ('likeCount', 'saveCount', etc.)
 */
async function incrementPostEngagement(postId, metric) {
    try {
        const postRef = db.collection('posts').doc(postId);
        await postRef.update({
            [metric]: admin.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error(`Error incrementing ${metric} for post ${postId}:`, error);
    }
}

/**
 * Decrement engagement count on post
 * @param {string} postId - Post ID
 * @param {string} metric - Metric to decrement
 */
async function decrementPostEngagement(postId, metric) {
    try {
        const postRef = db.collection('posts').doc(postId);
        await postRef.update({
            [metric]: admin.firestore.FieldValue.increment(-1)
        });
    } catch (error) {
        console.error(`Error decrementing ${metric} for post ${postId}:`, error);
    }
}

// Cloud Function: Update preferences on like
exports.onPostLiked = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { postId } = data;

    if (!postId) {
        throw new functions.https.HttpsError('invalid-argument', 'postId is required');
    }

    try {
        await Promise.all([
            updateUserPreferences(context.auth.uid, postId, 'like'),
            incrementPostEngagement(postId, 'likeCount')
        ]);

        return { success: true };
    } catch (error) {
        console.error('Error in onPostLiked:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Cloud Function: Update preferences on save
exports.onPostSaved = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { postId } = data;

    if (!postId) {
        throw new functions.https.HttpsError('invalid-argument', 'postId is required');
    }

    try {
        await Promise.all([
            updateUserPreferences(context.auth.uid, postId, 'save'),
            incrementPostEngagement(postId, 'saveCount')
        ]);

        return { success: true };
    } catch (error) {
        console.error('Error in onPostSaved:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Cloud Function: Update preferences on purchase
exports.onPrintPurchased = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { postId } = data;

    if (!postId) {
        throw new functions.https.HttpsError('invalid-argument', 'postId is required');
    }

    try {
        await Promise.all([
            updateUserPreferences(context.auth.uid, postId, 'purchase'),
            incrementPostEngagement(postId, 'printSaleCount')
        ]);

        return { success: true };
    } catch (error) {
        console.error('Error in onPrintPurchased:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

module.exports = {
    updateUserPreferences,
    incrementPostEngagement,
    decrementPostEngagement
};
