/**
 * PANOSPACE PRICING ENGINE - MAIN EXPORT
 * 
 * Single source of truth for all pricing calculations.
 * All other files should import from here.
 */

// Product Catalog
export {
    PRINT_TIERS,
    PRINTIFY_PRODUCTS,
    STICKER_PRODUCTS,
    PRINT_SIZES,
    STICKER_SIZES,
    getPrintifyProducts
} from './productCatalog';

// Base Pricing
export {
    getPrintifyBasePrice,
    getRetailPrice,
    calculateEarnings,
    calculatePrintifyEarnings,
    calculateTieredPricing,
    calculateStickerPricing,
    getAspectRatioCategory,
    getValidSizesForImage
} from './basePricing';

// Tier Modifiers
export {
    applyTierMultiplier,
    getArtistShare
} from './tierModifiers';

// Bundle Pricing
export {
    BUNDLE_DISCOUNT_PERCENT,
    MIN_ARTIST_MARGIN_PERCENT,
    MIN_PLATFORM_MARGIN_PERCENT,
    calculateBundlePricing,
    calculateCollectionBundlePricing,
    validateBundlePricing
} from './bundlePricing';

// Printify Adapter
export {
    getPrintifyOptions,
    mapSizeToPrintify,
    createPrintifyProductPayload
} from './printifyAdapter';
