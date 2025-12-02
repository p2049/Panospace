// Dev Configuration for Shop Setup Bypass
// This allows developers to test shop functionality without completing full shop setup

export const DEV_CONFIG = {
    // Auto-bypass shop setup in development mode
    BYPASS_SHOP_SETUP: import.meta.env.DEV,

    // Whitelist specific user IDs or emails for shop setup bypass
    // Useful for testing in production-like environments
    BYPASS_SHOP_SETUP_USERS: [
        // Add test user IDs or emails here
        // Example: 'test@example.com', 'userId123'
    ],

    // Feature flags for gradual rollout
    FEATURES: {
        REQUIRE_SHOP_SETUP: true, // Set to false to disable shop setup requirement globally
        ENABLE_DRAFT_PUBLISH_FLOW: true,
        ENABLE_COPYRIGHT_CONFIRMATION: true
    }
};

/**
 * Check if a user can bypass shop setup requirements
 * @param {string} userId - User's UID
 * @param {string} userEmail - User's email
 * @returns {boolean} - True if user can bypass shop setup
 */
export const canBypassShopSetup = (userId, userEmail) => {
    // Check if shop setup requirement is globally disabled
    if (!DEV_CONFIG.FEATURES.REQUIRE_SHOP_SETUP) return true;

    // Check if in dev mode
    if (DEV_CONFIG.BYPASS_SHOP_SETUP) return true;

    // Check if user is in whitelist
    if (DEV_CONFIG.BYPASS_SHOP_SETUP_USERS.includes(userId)) return true;
    if (DEV_CONFIG.BYPASS_SHOP_SETUP_USERS.includes(userEmail)) return true;

    return false;
};
