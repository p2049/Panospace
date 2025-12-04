/**
 * LEGACY COMPATIBILITY LAYER
 * 
 * Re-exports from the canonical pricing engine.
 * This file exists for backward compatibility only.
 * New code should import from '@/core/pricing' instead.
 */

export {
    PRINT_TIERS,
    PRINTIFY_PRODUCTS,
    STICKER_PRODUCTS,
    PRINT_SIZES,
    STICKER_SIZES,
    getPrintifyProducts,
    getPrintifyBasePrice,
    getRetailPrice,
    calculateEarnings,
    calculatePrintifyEarnings,
    calculateTieredPricing,
    calculateStickerPricing,
    getAspectRatioCategory,
    getValidSizesForImage,
    BUNDLE_DISCOUNT_PERCENT,
    MIN_ARTIST_MARGIN_PERCENT,
    MIN_PLATFORM_MARGIN_PERCENT,
    calculateBundlePricing,
    calculateCollectionBundlePricing,
    validateBundlePricing,
    getPrintifyOptions
} from '../core/pricing';
