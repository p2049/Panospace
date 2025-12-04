/**
 * LEGACY COMPATIBILITY LAYER
 * 
 * Re-exports from the canonical pricing engine.
 * This file exists for backward compatibility only.
 * New code should import from '@/core/pricing' instead.
 */

export {
    BUNDLE_DISCOUNT_PERCENT,
    MIN_ARTIST_MARGIN_PERCENT,
    MIN_PLATFORM_MARGIN_PERCENT,
    calculateBundlePricing,
    calculateCollectionBundlePricing,
    validateBundlePricing
} from '../core/pricing';
