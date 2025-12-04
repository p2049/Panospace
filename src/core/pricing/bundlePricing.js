/**
 * PANOSPACE BUNDLE PRICING
 * 
 * Logic for calculating discounted pricing for collections/bundles.
 */

import { getRetailPrice, calculateEarnings } from './basePricing';

export const BUNDLE_DISCOUNT_PERCENT = 15;
export const MIN_ARTIST_MARGIN_PERCENT = 15;
export const MIN_PLATFORM_MARGIN_PERCENT = 10;

const roundToTwo = (num) => Math.round(num * 100) / 100;

/**
 * Calculate bundle pricing for a collection
 * @param {Array} prints - Array of print objects with sizeId
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
            savingsPercent: 0,
            breakdown: []
        };
    }

    // Step 1: Calculate totals from individual prints
    let baseCollectionPrice = 0;
    let totalBaseCost = 0;
    let totalArtistSingle = 0;
    let totalPlatformSingle = 0;
    const breakdown = [];

    prints.forEach(print => {
        const retailPrice = getRetailPrice(print.sizeId, productTier);
        const pricing = calculateEarnings(retailPrice, print.sizeId);

        if (pricing) {
            baseCollectionPrice += retailPrice;
            totalBaseCost += pricing.baseCost;
            totalArtistSingle += pricing.artistEarnings;
            totalPlatformSingle += pricing.platformEarnings;
            breakdown.push({
                sizeId: print.sizeId,
                sizeLabel: print.sizeLabel,
                finalPrice: retailPrice,
                baseCost: pricing.baseCost,
                artistProfit: pricing.artistEarnings,
                platformProfit: pricing.platformEarnings
            });
        }
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
        breakdown
    };
};

/**
 * Calculate bundle pricing from collection items and referenced posts
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

    const artistMarginPercent = bundlePricing.totalBaseCost > 0
        ? (bundlePricing.artistBundleEarnings / bundlePricing.totalBaseCost) * 100
        : 0;
    const platformMarginPercent = bundlePricing.totalBaseCost > 0
        ? (bundlePricing.platformBundleEarnings / bundlePricing.totalBaseCost) * 100
        : 0;

    if (artistMarginPercent < MIN_ARTIST_MARGIN_PERCENT - 0.01) {
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
