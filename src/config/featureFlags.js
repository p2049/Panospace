/**
 * Feature Flags Configuration
 * Controls which features are enabled/disabled in the app
 * Set to false to hide unfinished or non-functional features
 */

export const FEATURE_FLAGS = {
    // Core Features (Always Enabled)
    FEED: true,
    SEARCH: true,
    PROFILE: true,
    CREATE_POST: true,
    COMMENTS: true,
    LIKES: true,
    FOLLOW: true,

    // Monetization Features
    WALLET: true, // Wallet exists and works
    BOOSTS: false, // Boost system not fully implemented
    COMMISSIONS: false, // Commission system placeholder
    SHOP: true, // Shop feature incomplete

    // SpaceCards
    SPACECARDS_CREATE: true, // Card creation works
    SPACECARDS_MARKETPLACE: false, // Marketplace not fully functional
    SPACECARDS_TRADING: false, // Trading not implemented

    // Collections & Galleries
    COLLECTIONS: true, // Collections work
    GALLERIES: true, // Galleries work
    MUSEUMS: true, // Museums work
    MAGAZINES: true, // Magazines work

    // Social Features
    MESSAGING: false, // Not implemented
    NOTIFICATIONS: false, // Not fully implemented
    GROUPS: false, // Not implemented

    // Premium Features
    ULTRA_PRO: false, // Ultra Pro not fully implemented
    VERIFIED_BADGES: false, // Verification not implemented

    // Events & Contests
    EVENTS: true, // Events work
    CONTESTS: true, // Contests work
    CHALLENGES: false, // Challenges not implemented

    // Advanced Features
    ANALYTICS: false, // Analytics not implemented
    INSIGHTS: false, // Insights not implemented
    STUDIO: false, // Studio pages not implemented

    // Experimental
    AI_DETECTION: false, // AI detection placeholder
    COLOR_SEARCH: true, // Color search implemented
    ADVANCED_FILTERS: true, // Advanced filters work
};

/**
 * Check if a feature is enabled
 * @param {string} featureName - Name of the feature from FEATURE_FLAGS
 * @returns {boolean} - Whether the feature is enabled
 */
export const isFeatureEnabled = (featureName) => {
    return FEATURE_FLAGS[featureName] === true;
};

/**
 * Get all enabled features
 * @returns {string[]} - Array of enabled feature names
 */
export const getEnabledFeatures = () => {
    return Object.keys(FEATURE_FLAGS).filter(key => FEATURE_FLAGS[key] === true);
};

/**
 * Get all disabled features
 * @returns {string[]} - Array of disabled feature names
 */
export const getDisabledFeatures = () => {
    return Object.keys(FEATURE_FLAGS).filter(key => FEATURE_FLAGS[key] === false);
};

export default FEATURE_FLAGS;
