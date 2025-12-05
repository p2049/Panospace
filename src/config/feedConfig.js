// Feed Configuration - Feature flags and settings for dual feed system
// Controls Art Feed vs Social Feed functionality

export const FEED_CONFIG = {
    // Feature flags
    ENABLE_DUAL_FEEDS: true, // ✅ ENABLED - Fixed with fade transition
    ENABLE_LINKED_ACCOUNTS: false, // Phase 2 feature - link art + social accounts

    // Default account type for existing users (migration safe)
    DEFAULT_ACCOUNT_TYPE: 'art',

    // Feed types
    FEED_TYPES: {
        ART: 'art',
        SOCIAL: 'social'
    },

    // Feed labels for UI
    FEED_LABELS: {
        art: '🎨 Art Feed',
        social: '👥 Social Feed'
    }
};

/**
 * Check if dual feeds are enabled
 * @returns {boolean}
 */
export const isDualFeedsEnabled = () => {
    return FEED_CONFIG.ENABLE_DUAL_FEEDS;
};

/**
 * Get feed label for display
 * @param {string} feedType - 'art' or 'social'
 * @returns {string}
 */
export const getFeedLabel = (feedType) => {
    return FEED_CONFIG.FEED_LABELS[feedType] || FEED_CONFIG.FEED_LABELS.art;
};
