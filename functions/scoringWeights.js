/**
 * Scoring weights configuration for Panospace recommendation engine
 * 
 * These weights control how different signals contribute to post ranking
 * Adjust these values to tune the recommendation algorithm
 */

export const SCORING_WEIGHTS = {
    // Default weights (baseline for all feeds)
    DEFAULT: {
        // Engagement signals (logarithmic scaling)
        likes: 2.0,              // Weight for like count
        saves: 3.0,              // Weight for save count (higher = more intent)
        comments: 1.5,           // Weight for comment count
        printSales: 4.0,         // Weight for print sales (highest intent)
        views: 0.5,              // Weight for view count (if tracked)

        // Recency signals
        recencyHalfLife: 7,      // Days for recency to decay by 50%
        recencyMultiplier: 10,   // Base multiplier for recency boost

        // Affinity signals
        tagAffinity: 5.0,        // Weight for tag matching
        filmMatch: 3.0,          // Bonus for matching film preference
        subjectMatch: 2.0,       // Bonus for matching subject preference

        // Social signals
        followBoost: 15,         // Bonus for posts from followed users

        // Context signals
        contextMatch: 20,        // Bonus for matching park/city/event context
        momentumBoost: 5.0,      // Bonus per streak count (Context Momentum)
        parkMomentum: 8.0,       // Bonus for park momentum
        cityAffinity: 6.0,       // Bonus for city affinity

        // Quality signals
        contestWin: 5,           // Bonus per contest win
        contestEntry: 1,         // Small bonus for contest participation
        signatureStyleBoost: 2.0,// Bonus for PanoSpace Signature Style (Mint Date Stamp)
        dateStampMatch: 3.0,     // Bonus for matching date stamp style preference

        // Diversity
        diversityPenalty: 0.1,    // Penalty for showing same author repeatedly

        // Monetization signals
        ultraBoost: 5.0,         // Small boost for Ultra users
        boostWeight: 10.0        // Base weight for paid boosts (multiplied by level)
    },

    // Home feed: Prioritize followed users and recent content
    HOME: {
        likes: 2.0,
        saves: 3.0,
        comments: 1.5,
        printSales: 4.0,
        views: 0.5,
        recencyHalfLife: 5,      // Faster decay (more recent focus)
        recencyMultiplier: 12,   // Higher recency weight
        tagAffinity: 4.0,        // Moderate tag matching
        filmMatch: 3.0,
        subjectMatch: 2.0,
        followBoost: 25,         // Much higher weight on following
        contextMatch: 15,
        contestWin: 5,
        contestEntry: 1,
        diversityPenalty: 0.15   // Encourage variety
    },

    // Explore feed: Prioritize discovery and quality
    EXPLORE: {
        likes: 3.0,              // Higher weight on engagement
        saves: 4.0,              // Higher weight on saves
        comments: 2.0,
        printSales: 5.0,         // Higher weight on commercial success
        views: 0.8,
        recencyHalfLife: 10,     // Slower decay (quality over recency)
        recencyMultiplier: 8,    // Lower recency weight
        tagAffinity: 8.0,        // Much higher tag matching for discovery
        filmMatch: 4.0,
        subjectMatch: 3.0,
        followBoost: 5,          // Lower weight on following (discover new)
        contextMatch: 10,
        contestWin: 8,           // Higher weight on award-winning content
        contestEntry: 2,
        signatureStyleBoost: 4.0,// Higher boost for signature style in Explore
        diversityPenalty: 0.2    // Strong diversity encouragement
    },

    // Park feed: Prioritize park-specific content
    PARK: {
        likes: 2.0,
        saves: 3.0,
        comments: 1.5,
        printSales: 3.0,
        views: 0.5,
        recencyHalfLife: 14,     // Slower decay (evergreen park content)
        recencyMultiplier: 6,
        tagAffinity: 3.0,
        filmMatch: 2.0,
        subjectMatch: 2.0,
        followBoost: 10,
        contextMatch: 40,        // Very high weight on park match
        contestWin: 6,
        contestEntry: 1,
        diversityPenalty: 0.1
    },

    // City feed: Prioritize city-specific content
    CITY: {
        likes: 2.0,
        saves: 3.0,
        comments: 1.5,
        printSales: 3.0,
        views: 0.5,
        recencyHalfLife: 14,
        recencyMultiplier: 6,
        tagAffinity: 3.0,
        filmMatch: 2.0,
        subjectMatch: 2.0,
        followBoost: 10,
        contextMatch: 40,        // Very high weight on city match
        contestWin: 6,
        contestEntry: 1,
        diversityPenalty: 0.1
    },

    // Campus feed: Prioritize campus-verified content
    CAMPUS: {
        likes: 2.5,
        saves: 3.5,
        comments: 2.0,
        printSales: 3.0,
        views: 0.5,
        recencyHalfLife: 7,
        recencyMultiplier: 10,
        tagAffinity: 4.0,
        filmMatch: 2.0,
        subjectMatch: 2.0,
        followBoost: 15,
        contextMatch: 35,        // High weight on campus match
        contestWin: 7,
        contestEntry: 2,
        diversityPenalty: 0.12
    },

    // Event/Contest feed: Prioritize event-specific content and recency
    EVENT: {
        likes: 3.0,
        saves: 4.0,
        comments: 2.5,
        printSales: 2.0,         // Lower weight (not primary for events)
        views: 1.0,
        recencyHalfLife: 3,      // Very fast decay (events are time-sensitive)
        recencyMultiplier: 15,   // Very high recency weight
        tagAffinity: 3.0,
        filmMatch: 2.0,
        subjectMatch: 2.0,
        followBoost: 8,
        contextMatch: 50,        // Highest weight on event match
        contestWin: 10,          // Very high weight on contest performance
        contestEntry: 3,
        diversityPenalty: 0.05   // Less diversity (show best entries)
    }
};

/**
 * Get weights for a specific feed type
 * @param {string} feedType - Feed type identifier
 * @returns {object} - Scoring weights
 */
export function getWeights(feedType) {
    return SCORING_WEIGHTS[feedType] || SCORING_WEIGHTS.DEFAULT;
}

/**
 * Tuning guide:
 * 
 * - Increase `likes/saves/comments` to favor popular content
 * - Increase `printSales` to favor commercially successful content
 * - Decrease `recencyHalfLife` to favor newer content
 * - Increase `recencyMultiplier` to boost recent posts more
 * - Increase `tagAffinity` to favor personalized content
 * - Increase `followBoost` to favor followed users
 * - Increase `contextMatch` to favor context-specific content
 * - Increase `diversityPenalty` to show more variety
 * 
 * All weights are multiplicative and can be decimal values
 */
