// Feed Configuration - Single feed system (Art only)

export const FEED_CONFIG = {
    // Feature flags
    ENABLE_DUAL_FEEDS: true,
    ENABLE_LINKED_ACCOUNTS: true,

    // Default account type
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
    return true;
};

/**
 * Get feed label for display
 * @param {string} feedType 
 * @returns {string}
 */
export const getFeedLabel = (feedType) => {
    return FEED_CONFIG.FEED_LABELS[feedType] || FEED_CONFIG.FEED_LABELS.art;
};
