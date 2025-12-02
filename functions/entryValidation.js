const { db, admin } = require('./shared/admin');

/**
 * Validate contest entry
 */
async function validateEntry(postId, contestId) {
    try {
        const postDoc = await db.collection('posts').doc(postId).get();
        const contestDoc = await db.collection('contests').doc(contestId).get();

        if (!postDoc.exists) {
            return { valid: false, errors: ['Post not found'] };
        }

        if (!contestDoc.exists) {
            return { valid: false, errors: ['Contest not found'] };
        }

        const post = postDoc.data();
        const contest = contestDoc.data();
        const errors = [];

        // Check if post is original (not resold)
        if (contest.requireOriginalContent && post.isResold) {
            errors.push('Contest requires original content only');
        }

        // Check AI art restriction
        if (!contest.allowAIArt && post.isAIGenerated) {
            errors.push('AI-generated art not allowed in this contest');
        }

        // Check required tags
        if (contest.requiredTags && contest.requiredTags.length > 0) {
            const postTags = (post.tags || []).map(t => t.toLowerCase());
            const hasAllTags = contest.requiredTags.every(tag =>
                postTags.includes(tag.toLowerCase())
            );
            if (!hasAllTags) {
                errors.push(`Post must include tags: ${contest.requiredTags.join(', ')}`);
            }
        }

        // Check if post was created after contest start
        if (post.createdAt && contest.startAt) {
            if (post.createdAt.toMillis() < contest.startAt.toMillis()) {
                errors.push('Post must be created after contest start date');
            }
        }

        // Check if contest is still accepting entries
        if (contest.status === 'closed') {
            errors.push('Contest is closed');
        }

        return { valid: errors.length === 0, errors };
    } catch (error) {
        console.error('Error validating entry:', error);
        return { valid: false, errors: ['Validation error occurred'] };
    }
}

/**
 * Check if content is original (not resold)
 */
async function checkOriginalContent(postId) {
    try {
        const postDoc = await db.collection('posts').doc(postId).get();
        if (!postDoc.exists) {
            return false;
        }

        const post = postDoc.data();
        return !post.isResold && !post.previousOwnerId;
    } catch (error) {
        console.error('Error checking original content:', error);
        return false;
    }
}

/**
 * Check if post has required tags
 */
async function checkRequiredTags(postId, requiredTags) {
    try {
        const postDoc = await db.collection('posts').doc(postId).get();
        if (!postDoc.exists) {
            return false;
        }

        const post = postDoc.data();
        const postTags = (post.tags || []).map(t => t.toLowerCase());

        return requiredTags.every(tag => postTags.includes(tag.toLowerCase()));
    } catch (error) {
        console.error('Error checking required tags:', error);
        return false;
    }
}

/**
 * Check AI art restriction
 */
async function checkAIArtRestriction(postId, allowAIArt) {
    try {
        const postDoc = await db.collection('posts').doc(postId).get();
        if (!postDoc.exists) {
            return false;
        }

        const post = postDoc.data();

        // If AI art is allowed, always return true
        if (allowAIArt) {
            return true;
        }

        // If AI art is not allowed, check if post is AI-generated
        return !post.isAIGenerated;
    } catch (error) {
        console.error('Error checking AI art restriction:', error);
        return false;
    }
}

module.exports = {
    validateEntry,
    checkOriginalContent,
    checkRequiredTags,
    checkAIArtRestriction
};
