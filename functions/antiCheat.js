const { db, admin } = require('./shared/admin');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * Calculate user integrity score for anti-cheat
 */
async function calculateUserIntegrityScore(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return 0;
        }

        const user = userDoc.data();
        const accountAge = (Date.now() - user.createdAt.toMillis()) / (1000 * 60 * 60 * 24); // days

        let score = 100;

        // Penalize new accounts
        if (accountAge < 3) {
            score -= 50;
        } else if (accountAge < 7) {
            score -= 25;
        }

        // Get user activity stats
        const likesSnapshot = await db.collection('likes')
            .where('userId', '==', userId)
            .get();
        const likesGiven = likesSnapshot.size;

        const postsSnapshot = await db.collection('posts')
            .where('authorId', '==', userId)
            .get();
        const postsCreated = postsSnapshot.size;

        // Penalize accounts that only like, never post
        if (likesGiven > 10 && postsCreated === 0) {
            score -= 30;
        }

        // Get recent likes (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentLikesSnapshot = await db.collection('likes')
            .where('userId', '==', userId)
            .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
            .get();
        const weeklyLikes = recentLikesSnapshot.size;

        // Penalize accounts with burst liking patterns
        if (weeklyLikes > 100 && postsCreated < 5) {
            score -= 40;
        }

        // Require minimum engagement
        if (weeklyLikes < 5) {
            score -= 20;
        }

        const finalScore = Math.max(0, Math.min(100, score));

        // Store integrity score
        await db.collection('userIntegrity').doc(userId).set({
            userId,
            likeIntegrityScore: finalScore,
            accountAge,
            totalLikesGiven: likesGiven,
            totalPostsCreated: postsCreated,
            weeklyLikesGiven: weeklyLikes,
            suspiciousActivity: finalScore < 50,
            lastUpdated: FieldValue.serverTimestamp()
        });

        return finalScore;
    } catch (error) {
        console.error('Error calculating integrity score:', error);
        return 0;
    }
}

/**
 * Filter valid likes for a post in a contest
 */
async function filterValidLikes(postId, contestId) {
    try {
        const likesSnapshot = await db.collection('likes')
            .where('postId', '==', postId)
            .get();

        let validCount = 0;

        for (const likeDoc of likesSnapshot.docs) {
            const like = likeDoc.data();
            const integrity = await calculateUserIntegrityScore(like.userId);

            // Only count likes from users with integrity score >= 50
            if (integrity >= 50) {
                validCount++;
            }
        }

        return validCount;
    } catch (error) {
        console.error('Error filtering valid likes:', error);
        return 0;
    }
}

/**
 * Detect suspicious activity patterns
 */
async function detectSuspiciousActivity(userId) {
    try {
        const integrityDoc = await db.collection('userIntegrity').doc(userId).get();
        if (!integrityDoc.exists) {
            await calculateUserIntegrityScore(userId);
            const updatedDoc = await db.collection('userIntegrity').doc(userId).get();
            return updatedDoc.data()?.suspiciousActivity || false;
        }

        return integrityDoc.data().suspiciousActivity || false;
    } catch (error) {
        console.error('Error detecting suspicious activity:', error);
        return true; // Err on side of caution
    }
}

module.exports = {
    calculateUserIntegrityScore,
    filterValidLikes,
    detectSuspiciousActivity
};
