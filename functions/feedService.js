/**
 * Feed Service for Panospace
 * 
 * Provides personalized and contextual feeds using the recommendation engine
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { scorePosts, rankPosts } = require('./recommendationEngine');

// Initialize admin if not already done
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Get personalized feed for a user
 * @param {string} userId - User ID
 * @param {object} options - Feed options
 * @returns {Promise<object>} - Paginated feed results
 */
async function getPersonalizedFeed(userId, options = {}) {
    const {
        limit = 20,
        cursor = null,
        feedType = 'HOME',
        context = {}
    } = options;

    try {
        // 1. Fetch user document with preferences
        const userDoc = await db.collection('users').doc(userId).get();

        let user;
        if (!userDoc.exists) {
            console.log(`User ${userId} not found in Firestore, using default preferences`);
            user = { id: userId, preferences: {} };
        } else {
            user = {
                id: userId,
                ...userDoc.data()
            };
        }

        // 2. Build candidate query based on feed type and context
        let query = db.collection('posts');

        // Filter by moderation status (only show active posts)
        // query = query.where('moderationStatus', '!=', 'removed');
        // FIX: Removed query filter because legacy posts lack this field.
        // We will filter in memory instead.

        // Apply context filters
        if (context.parkId) {
            query = query.where('parkId', '==', context.parkId);
        } else if (context.cityName) {
            query = query.where('cityName', '==', context.cityName);
        } else if (context.campusId) {
            query = query.where('campusId', '==', context.campusId);
        } else if (context.eventId) {
            query = query.where('eventId', '==', context.eventId);
        } else if (context.contestId) {
            query = query.where('contestId', '==', context.contestId);
        }

        // Order by creation date (most recent first)
        query = query.orderBy('createdAt', 'desc');

        // Apply cursor for pagination
        if (cursor) {
            const cursorDoc = await db.collection('posts').doc(cursor).get();
            if (cursorDoc.exists) {
                query = query.startAfter(cursorDoc);
            }
        }

        // Fetch more candidates than needed for scoring
        const candidateLimit = Math.min(limit * 5, 100);
        query = query.limit(candidateLimit);

        let snapshot = await query.get();

        if (snapshot.empty) {
            // FALLBACK LOGIC: If context query returns empty on initial load (no cursor),
            // fallback to global recent posts to ensure feed is never empty.
            if (!cursor) {
                console.log('Feed candidate set empty, falling back to global recent posts');

                // Create a new query for global recent posts
                let fallbackQuery = db.collection('posts')
                    // .where('moderationStatus', '!=', 'removed') // Removed for legacy support
                    .orderBy('createdAt', 'desc')
                    .limit(limit);

                const fallbackSnapshot = await fallbackQuery.get();

                if (fallbackSnapshot.empty) {
                    return {
                        posts: [],
                        cursor: null,
                        hasMore: false
                    };
                }

                // Use fallback snapshot
                snapshot = fallbackSnapshot;
            } else {
                return {
                    posts: [],
                    cursor: null,
                    hasMore: false
                };
            }
        }

        // 3. Convert to post objects
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).filter(post => post.moderationStatus !== 'removed' && post.status !== 'draft'); // Handle missing field as active

        // 4. Score all candidates
        const scoredPosts = scorePosts(user, posts, {
            feedType,
            now: Date.now(),
            ...context
        });

        // 5. Rank by score
        const rankedPosts = rankPosts(scoredPosts);

        // 6. Return top N results
        let results = rankedPosts.slice(0, limit);

        // FINAL SAFETY FALLBACK: If personalization filtered everything out, return raw posts
        if (results.length === 0 && posts.length > 0 && !cursor) {
            console.log('Personalization returned 0 results, falling back to raw candidates');
            results = posts.slice(0, limit);
        }

        const lastPost = results[results.length - 1];

        return {
            posts: results,
            cursor: lastPost?.id || null,
            hasMore: rankedPosts.length > limit || (results.length > 0 && posts.length > results.length)
        };

    } catch (error) {
        console.error('Error in getPersonalizedFeed:', error);
        throw error;
    }
}

/**
 * Get explore feed (broader discovery)
 * @param {string} userId - User ID
 * @param {object} options - Feed options
 * @returns {Promise<object>} - Paginated feed results
 */
async function getExploreFeed(userId, options = {}) {
    return getPersonalizedFeed(userId, {
        ...options,
        feedType: 'EXPLORE'
    });
}

/**
 * Get park-specific feed
 * @param {string} userId - User ID
 * @param {string} parkId - Park ID
 * @param {object} options - Feed options
 * @returns {Promise<object>} - Paginated feed results
 */
async function getParkFeed(userId, parkId, options = {}) {
    return getPersonalizedFeed(userId, {
        ...options,
        feedType: 'PARK',
        context: { parkId }
    });
}

/**
 * Get city-specific feed
 * @param {string} userId - User ID
 * @param {string} cityName - City name
 * @param {object} options - Feed options
 * @returns {Promise<object>} - Paginated feed results
 */
async function getCityFeed(userId, cityName, options = {}) {
    return getPersonalizedFeed(userId, {
        ...options,
        feedType: 'CITY',
        context: { cityName }
    });
}

/**
 * Get event-specific feed
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @param {object} options - Feed options
 * @returns {Promise<object>} - Paginated feed results
 */
async function getEventFeed(userId, eventId, options = {}) {
    return getPersonalizedFeed(userId, {
        ...options,
        feedType: 'EVENT',
        context: { eventId }
    });
}

// Export Cloud Functions
exports.getPersonalizedFeed = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated'
        );
    }

    const { feedType, limit, cursor, contextData } = data;

    try {
        return await getPersonalizedFeed(context.auth.uid, {
            feedType: feedType || 'HOME',
            limit: limit || 20,
            cursor: cursor || null,
            context: contextData || {}
        });
    } catch (error) {
        console.error('Error in getPersonalizedFeed function:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

exports.getExploreFeed = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { limit, cursor } = data;

    try {
        return await getExploreFeed(context.auth.uid, { limit, cursor });
    } catch (error) {
        console.error('Error in getExploreFeed function:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

exports.getParkFeed = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { parkId, limit, cursor } = data;

    if (!parkId) {
        throw new functions.https.HttpsError('invalid-argument', 'parkId is required');
    }

    try {
        return await getParkFeed(context.auth.uid, parkId, { limit, cursor });
    } catch (error) {
        console.error('Error in getParkFeed function:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

exports.getCityFeed = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { cityName, limit, cursor } = data;

    if (!cityName) {
        throw new functions.https.HttpsError('invalid-argument', 'cityName is required');
    }

    try {
        return await getCityFeed(context.auth.uid, cityName, { limit, cursor });
    } catch (error) {
        console.error('Error in getCityFeed function:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

exports.getEventFeed = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { eventId, limit, cursor } = data;

    if (!eventId) {
        throw new functions.https.HttpsError('invalid-argument', 'eventId is required');
    }

    try {
        return await getEventFeed(context.auth.uid, eventId, { limit, cursor });
    } catch (error) {
        console.error('Error in getEventFeed function:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

module.exports = {
    getPersonalizedFeed,
    getExploreFeed,
    getParkFeed,
    getCityFeed,
    getEventFeed
};
