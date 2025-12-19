import { isFeatureEnabled } from '@/config/featureFlags';

/**
 * Access Control Utility
 * Centralizes all logic for feature gating, subscription checks, and developer bypass.
 */

// Feature Keys for Permissions
export const ACCESS_FEATURES = {
    // Content Creation
    CREATE_COLLECTION: 'create_collection',
    CREATE_STUDIO: 'create_studio',
    CREATE_MUSEUM: 'create_museum',
    CREATE_MAGAZINE: 'create_magazine',

    // Limits
    UNLIMITED_UPLOADS: 'unlimited_uploads',
    HIGH_QUALITY_UPLOADS: 'high_quality_uploads',

    // Monetization
    SELL_PRODUCTS: 'sell_products',

    // UI
    PREMIUM_THEMES: 'premium_themes',
    PROFILE_EFFECTS: 'profile_effects',

    // Advanced
    ANALYTICS: 'analytics'
};

const IS_DEV_ENV = import.meta.env.DEV; // Vite provided
const BYPASS_ENABLED = import.meta.env.VITE_TESTER_BYPASS === 'true';

/**
 * Check if the current environment allows developer bypass.
 * STRICT: Only allowed in development environment on localhost.
 * (Vite's import.meta.env.DEV is true for `vite dev`, false for `vite build` + preview)
 */
export const isDevBypassActive = () => {
    // Blanket dev-mode bypass REMOVED for production safety.
    // Only allows bridge for explicit BYPASS_ENABLED flag on localhost.
    if (IS_DEV_ENV && BYPASS_ENABLED) {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return true;
        }
    }
    return false;
};

/**
 * Main Gatekeeper Function
 * @param {Object} userOrDoc - The User object (Auth or Firestore data). Must contain uid/isUltra etc.
 * @param {string} feature - One of ACCESS_FEATURES
 * @param {Object} [claims] - Optional custom claims object if available (for isTester)
 * @returns {boolean}
 */
export const canAccessFeature = (userOrDoc, feature, claims = {}) => {
    // 0. Safety Check
    if (!feature) {
        console.error('[AccessControl] No feature specified');
        return false;
    }

    // 1. Feature Flag Check (Global Kill Switch)
    // Map internal features to feature flags if needed
    // For now, we assume this function is called AFTER checking if the feature exists generally.

    // 2. Developer/Tester Bypass
    // A. Localhost Environment Bypass
    if (isDevBypassActive()) {
        return true;
    }

    // B. Custom Claim Bypass (Production Tester)
    if (claims?.isTester === true) {
        return true;
    }

    // C. Firestore Flag Bypass (Fallback if claims not passed but user doc has flag)
    // This allows manual overrides in Firestore for "beta testers" without Auth Claims logic
    if (userOrDoc?.isTester === true) {
        return true;
    }

    // 3. Standard Logic
    if (!userOrDoc) return false;

    // Normalize data (handle both Auth User and Firestore Doc shapes slightly)
    const isUltra = userOrDoc.isUltra || userOrDoc.isPro || false;
    const isPartner = userOrDoc.isPartner || userOrDoc.isAdmin || false;

    switch (feature) {
        // Basic Features (Free for now, but could be gated)
        case ACCESS_FEATURES.CREATE_COLLECTION:
            return true;

        // Premium Features
        case ACCESS_FEATURES.CREATE_STUDIO:
        case ACCESS_FEATURES.CREATE_MAGAZINE:
            return isUltra || isPartner;

        case ACCESS_FEATURES.CREATE_MUSEUM:
            return isPartner; // Partner exclusive

        case ACCESS_FEATURES.UNLIMITED_UPLOADS:
        case ACCESS_FEATURES.HIGH_QUALITY_UPLOADS:
            return isUltra || isPartner;

        case ACCESS_FEATURES.PREMIUM_THEMES:
        case ACCESS_FEATURES.PROFILE_EFFECTS:
            return isUltra || isPartner;

        default:
            return true;
    }
};

/**
 * Hook Helper to get claims asynchronously if needed, or check local state.
 * For now, simple export.
 */
