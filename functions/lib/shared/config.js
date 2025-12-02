"use strict";
/**
 * Shared Configuration for Print Sizes and Pricing
 *
 * SINGLE SOURCE OF TRUTH for all print-related configuration
 * Used by both frontend and backend to ensure consistency
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRINT_SIZES = exports.ARTIST_CUT_PERCENTAGE = exports.PLATFORM_CUT_PERCENTAGE = void 0;
exports.getBaseCost = getBaseCost;
exports.calculateEarnings = calculateEarnings;
exports.calculateEarningsWithBaseCost = calculateEarningsWithBaseCost;
// Platform revenue split (40% to platform, 60% to artist)
exports.PLATFORM_CUT_PERCENTAGE = 0.40;
exports.ARTIST_CUT_PERCENTAGE = 0.60;
exports.PRINT_SIZES = [
    {
        id: '8x10',
        label: '8x10"',
        defaultPrice: 24.99,
        baseCostCents: 1200 // $12.00
    },
    {
        id: '11x14',
        label: '11x14"',
        defaultPrice: 34.99,
        baseCostCents: 1800 // $18.00
    },
    {
        id: '16x20',
        label: '16x20"',
        defaultPrice: 49.99,
        baseCostCents: 2800 // $28.00
    },
    {
        id: '18x24',
        label: '18x24"',
        defaultPrice: 59.99,
        baseCostCents: 3500 // $35.00
    },
    {
        id: '24x36',
        label: '24x36"',
        defaultPrice: 79.99,
        baseCostCents: 5500 // $55.00
    }
];
/**
 * Get base cost for a size
 */
function getBaseCost(sizeId) {
    const size = exports.PRINT_SIZES.find(s => s.id === sizeId);
    return size ? size.baseCostCents : 1500; // Default fallback
}
/**
 * Calculate earnings split from a retail price
 */
function calculateEarnings(retailPriceDollars) {
    const totalCents = Math.round(retailPriceDollars * 100);
    // For now, use a simple percentage split of total
    // More sophisticated: (retail - baseCost) * split + baseCost
    const platformCutCents = Math.round(totalCents * exports.PLATFORM_CUT_PERCENTAGE);
    const artistEarningsCents = totalCents - platformCutCents;
    return {
        artistEarningsCents,
        platformCutCents,
        totalCents,
        baseCostCents: 0 // Would need sizeId to calculate
    };
}
/**
 * Calculate earnings with base cost consideration
 */
function calculateEarningsWithBaseCost(retailPriceDollars, sizeId) {
    const totalCents = Math.round(retailPriceDollars * 100);
    const baseCostCents = getBaseCost(sizeId);
    const profitCents = Math.max(0, totalCents - baseCostCents);
    // Split profit between artist and platform
    const artistEarningsCents = Math.round(profitCents * exports.ARTIST_CUT_PERCENTAGE);
    const platformCutCents = Math.round(profitCents * exports.PLATFORM_CUT_PERCENTAGE);
    return {
        artistEarningsCents,
        platformCutCents,
        totalCents,
        baseCostCents,
        profitCents
    };
}
//# sourceMappingURL=config.js.map