/**
 * PANOSPACE COLLECTION BUNDLE PRICING SYSTEM
 * 
 * Collections (bundles) are automatically priced based on the sum of individual print prices.
 * Bundle pricing ALWAYS provides a discount compared to buying prints separately.
 * Margins for both artist and platform are guaranteed to stay positive.
 * 
 * Pricing Model:
 * 1. Calculate base collection price = sum of all individual print final prices
 * 2. Apply bundle discount (default 15%)
 * 3. Ensure minimum margins for artist (15%) and platform (10%)
 * 4. If margins would go negative, reduce discount to maintain minimums
 */

import { calculateTieredPricing } from './printfulApi';

// Configuration constants
export const BUNDLE_DISCOUNT_PERCENT = 15; // Default bundle discount
export const MIN_ARTIST_MARGIN_PERCENT = 15; // Minimum artist margin on base cost
export const MIN_PLATFORM_MARGIN_PERCENT = 10; // Minimum platform margin on base cost

/**
 * Round to 2 decimal places
 */
const roundToTwo = (num) => Math.round(num * 100) / 100;

/**
 * Calculate bundle pricing for a collection
 * 
 * @param {Array} prints - Array of print objects with size info
 * @param {string} productTier - 'economy' or 'premium'
 * @returns {Object} Bundle pricing breakdown
 */
export const calculateBundlePricing = (prints, productTier = 'economy') => {
    if (!prints || prints.length === 0) {
        return {
            baseCollectionPrice: 0,
            bundleDiscountPercent: 0,
            finalBundlePrice: 0,
            totalBaseCost: 0,
            artistBundleEarnings: 0,
            platformBundleEarnings: 0,
            totalPrintCount: 0,
            savingsAmount: 0,
            savingsPercent: 0
        };
    }

    // Step 1: Calculate totals from individual prints
    let baseCollectionPrice = 0;
    let totalBaseCost = 0;
    let totalArtistSingle = 0;
    let totalPlatformSingle = 0;

    prints.forEach(print => {
        const pricing = calculateTieredPricing(print.sizeId, productTier);

        baseCollectionPrice += pricing.finalPrice;
        totalBaseCost += pricing.baseCost;
        totalArtistSingle += pricing.artistProfit;
        totalPlatformSingle += pricing.platformProfit;
    });

    // Round base totals
    baseCollectionPrice = roundToTwo(baseCollectionPrice);
    totalBaseCost = roundToTwo(totalBaseCost);
    totalArtistSingle = roundToTwo(totalArtistSingle);
    totalPlatformSingle = roundToTwo(totalPlatformSingle);

    // Step 2: Calculate target bundle price with discount
    let effectiveDiscountPercent = BUNDLE_DISCOUNT_PERCENT;
    let targetBundlePrice = roundToTwo(
        baseCollectionPrice * (1 - effectiveDiscountPercent / 100)
    );

    // Step 3: Calculate initial earnings distribution
    let artistBundleEarnings = totalArtistSingle;
    let platformBundleEarnings = targetBundlePrice - totalBaseCost - artistBundleEarnings;

    // Step 4: Ensure minimum margins
    const minArtistEarnings = roundToTwo(totalBaseCost * MIN_ARTIST_MARGIN_PERCENT / 100);
    const minPlatformEarnings = roundToTwo(totalBaseCost * MIN_PLATFORM_MARGIN_PERCENT / 100);

    // If margins are too low, adjust the discount
    if (platformBundleEarnings < minPlatformEarnings || artistBundleEarnings < minArtistEarnings) {
        // Calculate minimum bundle price needed to maintain margins
        const minBundlePrice = totalBaseCost + minArtistEarnings + minPlatformEarnings;

        if (minBundlePrice >= baseCollectionPrice) {
            // Can't offer discount while maintaining margins
            effectiveDiscountPercent = 0;
            targetBundlePrice = baseCollectionPrice;
            artistBundleEarnings = totalArtistSingle;
            platformBundleEarnings = totalPlatformSingle;
        } else {
            // Reduce discount to maintain margins
            targetBundlePrice = minBundlePrice;
            effectiveDiscountPercent = roundToTwo(
                ((baseCollectionPrice - targetBundlePrice) / baseCollectionPrice) * 100
            );
            artistBundleEarnings = minArtistEarnings;
            platformBundleEarnings = minPlatformEarnings;
        }
    }

    // Final rounding
    const finalBundlePrice = roundToTwo(targetBundlePrice);
    artistBundleEarnings = roundToTwo(artistBundleEarnings);
    platformBundleEarnings = roundToTwo(platformBundleEarnings);

    // Calculate savings
    const savingsAmount = roundToTwo(baseCollectionPrice - finalBundlePrice);
    const savingsPercent = baseCollectionPrice > 0
        ? roundToTwo((savingsAmount / baseCollectionPrice) * 100)
        : 0;

    return {
        baseCollectionPrice,
        bundleDiscountPercent: effectiveDiscountPercent,
        finalBundlePrice,
        totalBaseCost,
        artistBundleEarnings,
        platformBundleEarnings,
        totalPrintCount: prints.length,
        savingsAmount,
        savingsPercent,
        // Breakdown for display
        breakdown: prints.map(print => {
            const pricing = calculateTieredPricing(print.sizeId, productTier);
            return {
                sizeId: print.sizeId,
                sizeLabel: print.sizeLabel,
                finalPrice: pricing.finalPrice,
                baseCost: pricing.baseCost,
                artistProfit: pricing.artistProfit,
                platformProfit: pricing.platformProfit
            };
        })
    };
};

/**
 * Calculate bundle pricing from collection items and referenced posts
 * Used when a collection has both manually uploaded images and posts added
 * 
 * @param {Array} items - Collection items (manually uploaded images)
 * @param {Array} posts - Referenced posts with their images
 * @param {string} productTier - 'economy' or 'premium'
 * @param {string} defaultSizeId - Default size for items without size specified
 * @returns {Object} Bundle pricing breakdown
 */
export const calculateCollectionBundlePricing = (items = [], posts = [], productTier = 'economy', defaultSizeId = '8x10') => {
    const prints = [];

    // Add prints from collection items (manually uploaded images)
    items.forEach((item, index) => {
        prints.push({
            sizeId: item.sizeId || defaultSizeId,
            sizeLabel: item.sizeLabel || defaultSizeId,
            source: 'collection-item',
            index
        });
    });

    // Add prints from referenced posts
    posts.forEach(post => {
        if (post.images && Array.isArray(post.images)) {
            post.images.forEach((image, index) => {
                prints.push({
                    sizeId: image.sizeId || post.defaultSizeId || defaultSizeId,
                    sizeLabel: image.sizeLabel || post.defaultSizeId || defaultSizeId,
                    source: 'post',
                    postId: post.id,
                    index
                });
            });
        }
    });

    return calculateBundlePricing(prints, productTier);
};

/**
 * Validate bundle pricing to ensure it makes economic sense
 * 
 * @param {Object} bundlePricing - Bundle pricing object
 * @returns {Object} Validation result with isValid and errors array
 */
export const validateBundlePricing = (bundlePricing) => {
    const errors = [];

    if (bundlePricing.finalBundlePrice <= bundlePricing.totalBaseCost) {
        errors.push('Bundle price must be greater than total base cost');
    }

    if (bundlePricing.artistBundleEarnings < 0) {
        errors.push('Artist earnings cannot be negative');
    }

    if (bundlePricing.platformBundleEarnings < 0) {
        errors.push('Platform earnings cannot be negative');
    }

    if (bundlePricing.finalBundlePrice > bundlePricing.baseCollectionPrice) {
        errors.push('Bundle price should not exceed individual prices sum');
    }

    const artistMarginPercent = (bundlePricing.artistBundleEarnings / bundlePricing.totalBaseCost) * 100;
    const platformMarginPercent = (bundlePricing.platformBundleEarnings / bundlePricing.totalBaseCost) * 100;

    if (artistMarginPercent < MIN_ARTIST_MARGIN_PERCENT - 0.01) { // Allow tiny rounding error
        errors.push(`Artist margin (${artistMarginPercent.toFixed(2)}%) below minimum (${MIN_ARTIST_MARGIN_PERCENT}%)`);
    }

    if (platformMarginPercent < MIN_PLATFORM_MARGIN_PERCENT - 0.01) {
        errors.push(`Platform margin (${platformMarginPercent.toFixed(2)}%) below minimum (${MIN_PLATFORM_MARGIN_PERCENT}%)`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings: []
    };
};
