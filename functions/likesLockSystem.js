const { db, admin } = require('./shared/admin');
const { FieldValue } = require('firebase-admin/firestore');
const { onCall } = require('firebase-functions/v2/https');

/**
 * Get the start of the current week (Monday 00:00:00 UTC)
 */
function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday
    d.setUTCDate(diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}

/**
 * Get document ID for weekly likes tracking
 */
function getWeeklyLikesDocId(userId, weekStart = null) {
    const week = weekStart || getWeekStart();
    return `${userId}_${week.getTime()}`;
}

/**
 * Track a weekly like for a user (callable function)
 */
exports.trackWeeklyLike = onCall(async (request) => {
    const userId = request.auth?.uid || request.data.userId;

    if (!userId) {
        throw new Error('User ID required');
    }

    try {
        const weekStart = getWeekStart();
        const docId = getWeeklyLikesDocId(userId, weekStart);
        const docRef = db.collection('weeklyLikes').doc(docId);

        const doc = await docRef.get();

        if (!doc.exists) {
            await docRef.set({
                userId,
                weekStartTimestamp: admin.firestore.Timestamp.fromDate(weekStart),
                likeCount: 1,
                lastUpdated: FieldValue.serverTimestamp(),
                isQualified: false
            });
        } else {
            const currentCount = doc.data().likeCount || 0;
            const newCount = currentCount + 1;

            await docRef.update({
                likeCount: newCount,
                lastUpdated: FieldValue.serverTimestamp(),
                isQualified: newCount >= 5
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error tracking weekly like:', error);
        throw error;
    }
});

/**
 * Check if user is qualified (callable function)
 */
exports.checkLikeQualification = onCall(async (request) => {
    const userId = request.auth?.uid || request.data.userId;

    if (!userId) {
        throw new Error('User ID required');
    }

    try {
        const weekStart = getWeekStart();
        const docId = getWeeklyLikesDocId(userId, weekStart);
        const doc = await db.collection('weeklyLikes').doc(docId).get();

        if (!doc.exists) {
            return {
                isQualified: false,
                likeCount: 0,
                weekStart: weekStart.toISOString()
            };
        }

        const data = doc.data();
        return {
            isQualified: data.isQualified || false,
            likeCount: data.likeCount || 0,
            weekStart: weekStart.toISOString()
        };
    } catch (error) {
        console.error('Error checking qualification:', error);
        return {
            isQualified: false,
            likeCount: 0,
            weekStart: getWeekStart().toISOString()
        };
    }
});

/**
 * Get weekly like stats (callable function)
 */
exports.getWeeklyLikeStats = onCall(async (request) => {
    const userId = request.auth?.uid || request.data.userId;

    if (!userId) {
        throw new Error('User ID required');
    }

    try {
        const weekStart = getWeekStart();
        const docId = getWeeklyLikesDocId(userId, weekStart);
        const doc = await db.collection('weeklyLikes').doc(docId).get();

        if (!doc.exists) {
            return {
                userId,
                weekStart: weekStart.toISOString(),
                likeCount: 0,
                isQualified: false,
                remainingLikes: 5
            };
        }

        const data = doc.data();
        const likeCount = data.likeCount || 0;

        return {
            userId,
            weekStart: weekStart.toISOString(),
            likeCount,
            isQualified: likeCount >= 5,
            remainingLikes: Math.max(0, 5 - likeCount)
        };
    } catch (error) {
        console.error('Error getting weekly stats:', error);
        throw error;
    }
});

/**
 * Decrement weekly like count (callable function)
 */
exports.decrementWeeklyLike = onCall(async (request) => {
    const userId = request.auth?.uid || request.data.userId;

    if (!userId) {
        throw new Error('User ID required');
    }

    try {
        const weekStart = getWeekStart();
        const docId = getWeeklyLikesDocId(userId, weekStart);
        const docRef = db.collection('weeklyLikes').doc(docId);

        const doc = await docRef.get();
        if (!doc.exists) return { success: true };

        const currentCount = doc.data().likeCount || 0;
        const newCount = Math.max(0, currentCount - 1);

        await docRef.update({
            likeCount: newCount,
            lastUpdated: FieldValue.serverTimestamp(),
            isQualified: newCount >= 5
        });

        return { success: true };
    } catch (error) {
        console.error('Error decrementing weekly like:', error);
        throw error;
    }
});

