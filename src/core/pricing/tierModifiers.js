/**
 * PANOSPACE TIER MODIFIERS
 * 
 * Logic for price adjustments based on product tiers (Economy vs Premium).
 */

import { PRINT_TIERS } from './productCatalog';

/**
 * Apply tier multiplier to a base value (cost or price)
 * @param {number} value - The base value
 * @param {string} tier - The tier (economy, premium, etc.)
 * @returns {number} The adjusted value
 */
export const applyTierMultiplier = (value, tier = PRINT_TIERS.ECONOMY) => {
    if (tier === PRINT_TIERS.PREMIUM) {
        return value * 1.5;
    }
    return value;
};

/**
 * Get the artist share percentage based on user tier
 * @param {boolean} isUltra - Is the user an Ultra member?
 * @returns {number} The artist share (0.0 to 1.0)
 */
export const getArtistShare = (isUltra = false) => {
    return isUltra ? 0.75 : 0.60;
};
