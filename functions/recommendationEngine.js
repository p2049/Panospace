/**
 * Recommendation Engine for Panospace
 * 
 * Core scoring and ranking algorithms for personalized feeds
 */

const { getWeights } = require('./scoringWeights');

/**
 * Calculate tag affinity score between user preferences and post tags
 * @param {object} userTagWeights - User's tag preferences { tag: weight }
 * @param {string[]} postTags - Post's tags
 * @returns {number} - Affinity score (0-10)
 */
function calculateTagAffinity(userTagWeights = {}, postTags = []) {
    if (!postTags || postTags.length === 0) return 0;
    if (!userTagWeights || Object.keys(userTagWeights).length === 0) return 0;

    let totalAffinity = 0;
    let matchCount = 0;

    for (const tag of postTags) {
        if (userTagWeights[tag]) {
            totalAffinity += userTagWeights[tag];
            matchCount++;
        }
    }

    // Average affinity, capped at 10
    return matchCount > 0 ? Math.min(10, totalAffinity / matchCount) : 0;
}

/**
 * Calculate recency boost using exponential decay
 * @param {number} createdAt - Post creation timestamp (ms)
 * @param {number} now - Current timestamp (ms)
 * @param {number} halfLife - Half-life in days
 * @param {number} multiplier - Recency multiplier
 * @returns {number} - Recency boost score
 */
function calculateRecencyBoost(createdAt, now, halfLife, multiplier) {
    const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
    const decayFactor = Math.exp(-ageInDays / halfLife);
    return decayFactor * multiplier;
}

/**
 * Calculate diversity penalty based on recent author exposure
 * @param {string} authorId - Post author ID
 * @param {string[]} recentAuthors - Recently shown author IDs
 * @param {number} penaltyWeight - Penalty weight per occurrence
 * @returns {number} - Penalty score (negative)
 */
function calculateDiversityPenalty(authorId, recentAuthors = [], penaltyWeight) {
    const occurrences = recentAuthors.filter(id => id === authorId).length;
    return -occurrences * penaltyWeight;
}

/**
 * Score a post for a given user and context
 * @param {object} user - User document with preferences
 * @param {object} post - Post document
 * @param {object} context - Scoring context
 * @returns {number} - Final score (0-100)
 */
function scorePostForUser(user, post, context = {}) {
    const {
        feedType = 'DEFAULT',
        now = Date.now(),
        parkId = null,
        cityName = null,
        campusId = null,
        eventId = null,
        contestId = null,
        recentAuthors = []
    } = context;

    const weights = getWeights(feedType);
    let score = 0;

    // 1. Engagement signals (logarithmic scaling to prevent dominance)
    const likeCount = post.likeCount || 0;
    const saveCount = post.saveCount || 0;
    const commentCount = post.commentCount || 0;
    const printSaleCount = post.printSaleCount || 0;
    const viewCount = post.viewCount || 0;

    score += Math.log(1 + likeCount) * weights.likes;
    score += Math.log(1 + saveCount) * weights.saves;
    score += Math.log(1 + commentCount) * weights.comments;
    score += Math.log(1 + printSaleCount) * weights.printSales;
    score += Math.log(1 + viewCount) * weights.views;

    // 2. Recency boost (exponential decay)
    const recencyBoost = calculateRecencyBoost(
        post.createdAt || now,
        now,
        weights.recencyHalfLife,
        weights.recencyMultiplier
    );
    score += recencyBoost;

    // 3. Tag affinity (personalization)
    const userPrefs = user.preferences || {};
    const tagScore = calculateTagAffinity(userPrefs.tags || {}, post.tags || []);
    score += tagScore * weights.tagAffinity;

    // 4. Film preference match
    if (post.isFilm && post.filmType) {
        const userFilmTypes = userPrefs.filmTypes || [];
        if (userFilmTypes.includes(post.filmType)) {
            score += weights.filmMatch;
        }
    }

    // 5. Subject preference match
    if (post.subject) {
        const userSubjects = userPrefs.subjects || [];
        if (userSubjects.includes(post.subject)) {
            score += weights.subjectMatch;
        }
    }

    // 6. Social boost (following)
    const followedUsers = user.followedUsers || [];
    if (followedUsers.includes(post.authorId || post.uid)) {
        score += weights.followBoost;
    }

    // 7. Context matching
    let contextMatched = false;

    if (parkId && post.parkId === parkId) {
        score += weights.contextMatch;
        contextMatched = true;
    }

    if (cityName && post.cityName === cityName) {
        score += weights.contextMatch;
        contextMatched = true;
    }

    if (campusId && post.campusId === campusId) {
        score += weights.contextMatch;
        contextMatched = true;
    }

    if (eventId && post.eventId === eventId) {
        score += weights.contextMatch;
        contextMatched = true;
    }

    if (contestId && post.contestId === contestId) {
        score += weights.contextMatch;
        contextMatched = true;
    }

    // 8. Contest performance
    const contestWins = post.contestWins || 0;
    const contestEntries = post.contestEntries || 0;

    score += contestWins * weights.contestWin;
    score += contestEntries * weights.contestEntry;

    // 9. Diversity penalty (avoid showing same author repeatedly)
    const diversityPenalty = calculateDiversityPenalty(
        post.authorId || post.uid,
        recentAuthors,
        weights.diversityPenalty
    );
    score += diversityPenalty;

    // --- PHASE 2: PERSONALIZATION & MOMENTUM ---

    // 10. Date Stamp Preference Match
    if (post.dateStampStyle) {
        const stylePrefs = userPrefs.dateStampStyles || {};
        if (stylePrefs[post.dateStampStyle]) {
            // Logarithmic boost based on preference strength
            score += Math.log(1 + stylePrefs[post.dateStampStyle]) * weights.dateStampMatch;
        }
    }

    // 11. Signature Style Boost (PanoSpace Mint)
    if (post.dateStampStyle === 'panospace') {
        score += weights.signatureStyleBoost;
    }

    // 12. Context Momentum (Transient Boosts)
    const momentum = userPrefs.momentum || { tags: {}, parks: {}, cities: {} };
    const momentumWindow = 30 * 60 * 1000; // 30 minutes

    // Tag Momentum
    if (post.tags && Array.isArray(post.tags)) {
        let tagMomentumScore = 0;
        post.tags.forEach(tag => {
            const m = momentum.tags[tag];
            if (m && m.count > 0 && (now - m.lastInteraction < momentumWindow)) {
                tagMomentumScore += m.count;
            }
        });
        score += Math.min(20, tagMomentumScore * weights.momentumBoost); // Cap at 20
    }

    // Park Momentum
    if (post.parkId) {
        const m = momentum.parks[post.parkId];
        if (m && m.count > 0 && (now - m.lastInteraction < momentumWindow)) {
            score += Math.min(30, m.count * weights.parkMomentum);
        }
    }

    // City Affinity (Momentum)
    if (post.location && post.location.city) {
        const m = momentum.cities[post.location.city];
        if (m && m.count > 0 && (now - m.lastInteraction < momentumWindow)) {
            score += Math.min(20, m.count * weights.cityAffinity);
        }
    }

    // --- PHASE 3: MONETIZATION (ULTRA & BOOSTS) ---

    // 14. Ultra User Boost (Small, ethical boost)
    if (post.authorIsUltra) {
        score += weights.ultraBoost;
    }

    // 15. Paid Boosts (Exposure Credits)
    if (post.boostLevel && post.boostLevel > 0) {
        // Check if boost is active
        const expiresAt = post.boostExpiresAt ? (post.boostExpiresAt.toMillis ? post.boostExpiresAt.toMillis() : new Date(post.boostExpiresAt).getTime()) : 0;

        if (expiresAt > now) {
            // Apply boost based on level, capped to prevent dominance
            const boostScore = Math.min(50, post.boostLevel * weights.boostWeight);
            score += boostScore;
        }
    }

    // 13. Normalize and clamp (0-100)
    return Math.min(100, Math.max(0, score));
}

/**
 * Score multiple posts for a user
 * @param {object} user - User document
 * @param {object[]} posts - Array of post documents
 * @param {object} context - Scoring context
 * @returns {object[]} - Posts with scores added
 */
function scorePosts(user, posts, context = {}) {
    const recentAuthors = [];

    return posts.map((post, index) => {
        const score = scorePostForUser(user, post, {
            ...context,
            recentAuthors: recentAuthors.slice(Math.max(0, index - 10), index)
        });

        // Track author for diversity
        recentAuthors.push(post.authorId || post.uid);

        return {
            ...post,
            _score: score,
            _scoredAt: Date.now()
        };
    });
}

/**
 * Rank posts by score (descending)
 * @param {object[]} scoredPosts - Posts with _score field
 * @returns {object[]} - Sorted posts
 */
function rankPosts(scoredPosts) {
    return [...scoredPosts].sort((a, b) => (b._score || 0) - (a._score || 0));
}

module.exports = {
    scorePostForUser,
    scorePosts,
    rankPosts,
    calculateTagAffinity,
    calculateRecencyBoost,
    calculateDiversityPenalty
};
