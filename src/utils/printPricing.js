/**
 * PANOSPACE PRINT PRICING SYSTEM (Printify-Ready)
 * 
 * Single source of truth for all print pricing, sizes, tiers, and bundle logic.
 * Replaces: constants/printSizes.js, utils/bundlePricing.js, utils/printfulApi.js logic
 */

// ============================================================================
// 1. CONSTANTS & CONFIGURATION
// ============================================================================

export const PRINT_TIERS = {
    ECONOMY: 'economy',
    PREMIUM: 'premium',
    LIMITED: 'limited' // Added for completeness if used elsewhere
};

// Bundle Configuration
export const BUNDLE_DISCOUNT_PERCENT = 15;
export const MIN_ARTIST_MARGIN_PERCENT = 15;
export const MIN_PLATFORM_MARGIN_PERCENT = 10;

// ============================================================================
// 2. DATA DEFINITIONS (Sizes, Costs, Ratios)
// ============================================================================

export const PRINT_SIZES = [
    {
        id: '5x7',
        label: '5" × 7"',
        tier: 'small',
        ratio: 1.4, // 7/5
        price: 12.00,
        baseCostCents: 500,
        economy: {
            baseCost: 5.00, // Estimated based on 8x10 ratio
            redbubblePrice: 12.00
        },
        premium: {
            baseCost: 8.00,
            redbubblePrice: 18.00
        }
    },
    {
        id: '8x10',
        label: '8" × 10"',
        tier: 'small',
        ratio: 1.25,
        price: 14.40,
        baseCostCents: 650,
        economy: {
            baseCost: 6.50,
            redbubblePrice: 16.00
        },
        premium: {
            baseCost: 10.50,
            redbubblePrice: 24.00
        }
    },
    {
        id: '11x14',
        label: '11" × 14"',
        tier: 'small',
        ratio: 1.27,
        price: 19.80,
        baseCostCents: 850,
        economy: {
            baseCost: 8.50,
            redbubblePrice: 22.00
        },
        premium: {
            baseCost: 14.00,
            redbubblePrice: 32.00
        }
    },
    {
        id: '12x18', // Added from printfulApi.js logic
        label: '12" × 18"',
        tier: 'medium',
        ratio: 1.5,
        price: 25.20,
        baseCostCents: 1000,
        economy: {
            baseCost: 10.00,
            redbubblePrice: 28.00
        },
        premium: {
            baseCost: 18.00,
            redbubblePrice: 40.00
        }
    },
    {
        id: '16x20',
        label: '16" × 20"',
        tier: 'medium',
        ratio: 1.25,
        price: 28.80,
        baseCostCents: 1200,
        economy: {
            baseCost: 12.00,
            redbubblePrice: 32.00
        },
        premium: {
            baseCost: 22.00,
            redbubblePrice: 48.00
        }
    },
    {
        id: '18x24',
        label: '18" × 24"',
        tier: 'medium',
        ratio: 1.33,
        price: 37.80,
        baseCostCents: 1450,
        economy: {
            baseCost: 14.50,
            redbubblePrice: 42.00
        },
        premium: {
            baseCost: 28.00,
            redbubblePrice: 65.00
        }
    },
    {
        id: '24x36',
        label: '24" × 36"',
        tier: 'large',
        ratio: 1.5,
        price: 52.20,
        baseCostCents: 2200,
        economy: {
            baseCost: 22.00,
            redbubblePrice: 58.00
        },
        premium: {
            baseCost: 42.00,
            redbubblePrice: 95.00
        }
    },
    // Merged from config/printSizes.js
    {
        id: '4x6',
        label: '4" × 6"',
        tier: 'small',
        ratio: 1.5,
        price: 14.99,
        baseCostCents: 800,
        economy: { baseCost: 8.00, redbubblePrice: 16.65 },
        premium: { baseCost: 12.00, redbubblePrice: 24.00 }
    },
    {
        id: '8x12',
        label: '8" × 12"',
        tier: 'small',
        ratio: 1.5,
        price: 26.99,
        baseCostCents: 1400,
        economy: { baseCost: 14.00, redbubblePrice: 29.99 },
        premium: { baseCost: 18.00, redbubblePrice: 39.99 }
    },
    {
        id: '20x30',
        label: '20" × 30"',
        tier: 'large',
        ratio: 1.5,
        price: 74.99,
        baseCostCents: 3200,
        economy: { baseCost: 32.00, redbubblePrice: 83.32 },
        premium: { baseCost: 48.00, redbubblePrice: 110.00 }
    },
    {
        id: '6x8',
        label: '6" × 8"',
        tier: 'small',
        ratio: 1.33,
        price: 19.99,
        baseCostCents: 1000,
        economy: { baseCost: 10.00, redbubblePrice: 22.21 },
        premium: { baseCost: 15.00, redbubblePrice: 30.00 }
    },
    {
        id: '9x12',
        label: '9" × 12"',
        tier: 'small',
        ratio: 1.33,
        price: 29.99,
        baseCostCents: 1500,
        economy: { baseCost: 15.00, redbubblePrice: 33.32 },
        premium: { baseCost: 20.00, redbubblePrice: 45.00 }
    },
    {
        id: '12x16',
        label: '12" × 16"',
        tier: 'medium',
        ratio: 1.33,
        price: 39.99,
        baseCostCents: 1900,
        economy: { baseCost: 19.00, redbubblePrice: 44.43 },
        premium: { baseCost: 28.00, redbubblePrice: 60.00 }
    },
    {
        id: '8x8',
        label: '8" × 8"',
        tier: 'small',
        ratio: 1.0,
        price: 22.99,
        baseCostCents: 1100,
        economy: { baseCost: 11.00, redbubblePrice: 25.54 },
        premium: { baseCost: 16.00, redbubblePrice: 35.00 }
    },
    {
        id: '10x10',
        label: '10" × 10"',
        tier: 'small',
        ratio: 1.0,
        price: 26.99,
        baseCostCents: 1300,
        economy: { baseCost: 13.00, redbubblePrice: 29.99 },
        premium: { baseCost: 19.00, redbubblePrice: 40.00 }
    },
    {
        id: '12x12',
        label: '12" × 12"',
        tier: 'medium',
        ratio: 1.0,
        price: 34.99,
        baseCostCents: 1700,
        economy: { baseCost: 17.00, redbubblePrice: 38.88 },
        premium: { baseCost: 25.00, redbubblePrice: 55.00 }
    },
    {
        id: '16x16',
        label: '16" × 16"',
        tier: 'medium',
        ratio: 1.0,
        price: 49.99,
        baseCostCents: 2300,
        economy: { baseCost: 23.00, redbubblePrice: 55.54 },
        premium: { baseCost: 34.00, redbubblePrice: 75.00 }
    },
    {
        id: '20x20',
        label: '20" × 20"',
        tier: 'large',
        ratio: 1.0,
        price: 64.99,
        baseCostCents: 3000,
        economy: { baseCost: 30.00, redbubblePrice: 72.21 },
        premium: { baseCost: 45.00, redbubblePrice: 95.00 }
    },
    {
        id: '8x14',
        label: '8" × 14"',
        tier: 'small',
        ratio: 1.78,
        price: 29.99,
        baseCostCents: 1500,
        economy: { baseCost: 15.00, redbubblePrice: 33.32 },
        premium: { baseCost: 22.00, redbubblePrice: 45.00 }
    },
    {
        id: '12x21',
        label: '12" × 21"',
        tier: 'medium',
        ratio: 1.78,
        price: 46.99,
        baseCostCents: 2100,
        economy: { baseCost: 21.00, redbubblePrice: 52.21 },
        premium: { baseCost: 31.00, redbubblePrice: 70.00 }
    },
    {
        id: '16x28',
        label: '16" × 28"',
        tier: 'large',
        ratio: 1.78,
        price: 64.99,
        baseCostCents: 2900,
        economy: { baseCost: 29.00, redbubblePrice: 72.21 },
        premium: { baseCost: 43.00, redbubblePrice: 95.00 }
    }
];

export const STICKER_SIZES = [
    {
        id: 'sticker_3x3',
        label: '3" × 3" Sticker',
        baseCost: 1.80,
        redbubblePrice: 3.50
    },
    {
        id: 'sticker_4x4',
        label: '4" × 4" Sticker',
        baseCost: 2.20,
        redbubblePrice: 5.00
    }
];

// ============================================================================
// 3. CORE PRICING LOGIC
// ============================================================================

/**
 * Calculate pricing breakdown for a specific size and tier
 * @param {string} sizeId - The ID of the size (e.g., '8x10')
 * @param {string} tier - 'economy' or 'premium'
 * @param {boolean} isUltra - Whether the creator is an Ultra member
 * @returns {object|null} Pricing breakdown
 */
export const calculateTieredPricing = (sizeId, tier = PRINT_TIERS.ECONOMY, isUltra = false) => {
    const sizeDef = PRINT_SIZES.find(s => s.id === sizeId);
    if (!sizeDef) return null;

    const data = sizeDef[tier] || sizeDef[PRINT_TIERS.ECONOMY]; // Fallback
    if (!data) return null;

    const baseCost = data.baseCost;

    // Standard markup for pricing calculation (keeps retail price consistent)
    const standardMarkup = baseCost * 0.25;

    let finalPrice = 0;

    if (tier === PRINT_TIERS.ECONOMY) {
        // Economy Rule: 90% of Redbubble
        finalPrice = data.redbubblePrice * 0.90;
    } else {
        // Premium Rule: (Base + StandardMarkup) * 1.7 OR 90% of RB Premium
        const markupPrice = (baseCost + standardMarkup) * 1.7;
        const rbCompPrice = data.redbubblePrice * 0.90;
        finalPrice = Math.max(markupPrice, rbCompPrice);
    }

    // Profit Split Logic
    const totalProfit = Math.max(0, finalPrice - baseCost);
    const artistShare = isUltra ? 0.75 : 0.60; // 75% for Ultra, 60% for Standard

    const artistProfit = totalProfit * artistShare;
    const platformProfit = totalProfit * (1 - artistShare);

    return {
        sizeId,
        label: sizeDef.label,
        tier,
        baseCost,
        finalPrice,
        artistProfit,
        platformProfit,
        redbubblePrice: data.redbubblePrice,
        savings: data.redbubblePrice - finalPrice
    };
};

/**
 * Calculate pricing for stickers (Economy logic only)
 */
export const calculateStickerPricing = (stickerId) => {
    const stickerDef = STICKER_SIZES.find(s => s.id === stickerId);
    if (!stickerDef) return null;

    const baseCost = stickerDef.baseCost;
    const artistProfit = baseCost * 0.25;
    const finalPrice = stickerDef.redbubblePrice * 0.90;
    const platformProfit = finalPrice - (baseCost + artistProfit);

    // Only return if profitable
    if (platformProfit < 0.10) return null;

    return {
        id: stickerId,
        label: stickerDef.label,
        tier: 'sticker',
        baseCost,
        finalPrice,
        artistProfit,
        platformProfit,
        redbubblePrice: stickerDef.redbubblePrice
    };
};

// ============================================================================
// 4. BUNDLE PRICING LOGIC
// ============================================================================

const roundToTwo = (num) => Math.round(num * 100) / 100;

/**
 * Calculate bundle pricing for a collection
 * @param {Array} prints - Array of print objects with sizeId
 * @param {string} productTier - 'economy' or 'premium'
 * @returns {Object} Bundle pricing breakdown
 */
export const calculateBundlePricing = (prints, productTier = PRINT_TIERS.ECONOMY) => {
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
        const pricing = calculateTieredPricing(print.sizeId, productTier);
        if (pricing) {
            baseCollectionPrice += pricing.finalPrice;
            totalBaseCost += pricing.baseCost;
            totalArtistSingle += pricing.artistProfit;
            totalPlatformSingle += pricing.platformProfit;
            breakdown.push({
                sizeId: print.sizeId,
                sizeLabel: pricing.label,
                finalPrice: pricing.finalPrice,
                baseCost: pricing.baseCost,
                artistProfit: pricing.artistProfit,
                platformProfit: pricing.platformProfit
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
export const calculateCollectionBundlePricing = (items = [], posts = [], productTier = PRINT_TIERS.ECONOMY, defaultSizeId = '8x10') => {
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

    const artistMarginPercent = (bundlePricing.artistBundleEarnings / bundlePricing.totalBaseCost) * 100;
    const platformMarginPercent = (bundlePricing.platformBundleEarnings / bundlePricing.totalBaseCost) * 100;

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

// ============================================================================
// 5. UTILITY FUNCTIONS (Helpers, Converters, Legacy)
// ============================================================================

export const getAvailablePrintSizes = () => PRINT_SIZES;

export const getBasePriceForSize = (sizeId, tier = PRINT_TIERS.ECONOMY) => {
    const size = PRINT_SIZES.find(s => s.id === sizeId);
    return size && size[tier] ? size[tier].baseCost : 0;
};

// Alias for calculateTieredPricing to match requested API
export const calculateCreatorEarnings = (sizeId, tier, isUltra) => {
    return calculateTieredPricing(sizeId, tier, isUltra);
};

// Alias for calculateBundlePricing to match requested API
export const calculateBundlePrice = (prints, tier) => {
    return calculateBundlePricing(prints, tier);
};

export const getTierBasePrices = (sizeId) => {
    const size = PRINT_SIZES.find(s => s.id === sizeId);
    if (!size) return null;
    return {
        economy: size.economy.baseCost,
        premium: size.premium.baseCost
    };
};

export const applyPrintifyMargins = (baseCost) => {
    // Placeholder for future Printify margin logic
    return baseCost * 1.25;
};

export const centsToDollars = (cents) => Number((cents || 0) / 100);
export const dollarsToCents = (dollars) => Math.round(dollars * 100);

/**
 * Calculate earnings split for a given retail price
 * Supports legacy (price, baseCost) and new (price, sizeId, isUltra) signatures
 */
export const calculateEarnings = (retailPrice, sizeIdOrBaseCost = null, isUltra = false) => {
    const totalCents = Math.round(Number(retailPrice || 0) * 100);
    let baseCostCents = 1500; // Default fallback

    if (typeof sizeIdOrBaseCost === 'number') {
        // Legacy: second arg is baseCost in dollars
        baseCostCents = Math.round(sizeIdOrBaseCost * 100);
    } else if (typeof sizeIdOrBaseCost === 'string') {
        // New: second arg is sizeId
        const size = PRINT_SIZES.find(s => s.id === sizeIdOrBaseCost);
        if (size) {
            if (size.baseCostCents) {
                baseCostCents = size.baseCostCents;
            } else if (size.economy && size.economy.baseCost) {
                baseCostCents = Math.round(size.economy.baseCost * 100);
            }
        }
    }

    const profitCents = Math.max(0, totalCents - baseCostCents);
    const artistShare = isUltra ? 0.75 : 0.60;
    const platformShare = 1 - artistShare;

    const artistEarningsCents = Math.round(profitCents * artistShare);
    const platformCutCents = Math.round(profitCents * platformShare);

    return {
        artistEarningsCents,
        platformCutCents,
        totalCents,
        // Legacy compatibility
        artistEarnings: artistEarningsCents / 100,
        platformEarnings: platformCutCents / 100
    };
};

// Aspect Ratio Helpers
export const getAspectRatioCategory = (width, height) => {
    if (!width || !height) return 'unknown';
    const ratio = width / height;

    if (Math.abs(ratio - 1.0) < 0.05) return 1.0;
    if (Math.abs(ratio - 1.25) < 0.05) return 1.25;
    if (Math.abs(ratio - 1.33) < 0.05) return 1.33;
    if (Math.abs(ratio - 1.4) < 0.05) return 1.4; // 5x7
    if (Math.abs(ratio - 1.5) < 0.05) return 1.5;
    if (Math.abs(ratio - 1.78) < 0.05) return 1.78;

    // Portrait
    if (Math.abs(ratio - 0.8) < 0.05) return 1.25;
    if (Math.abs(ratio - 0.75) < 0.05) return 1.33;
    if (Math.abs(ratio - 0.71) < 0.05) return 1.4; // 7x5
    if (Math.abs(ratio - 0.66) < 0.05) return 1.5;
    if (Math.abs(ratio - 0.56) < 0.05) return 1.78;

    return 'custom';
};

export const getValidSizesForImage = (width, height, allowCropped = false) => {
    if (allowCropped) return PRINT_SIZES;
    if (!width || !height) return PRINT_SIZES;

    const imageRatio = width / height;
    const isPortrait = imageRatio < 1;
    const normalizedImageRatio = isPortrait ? 1 / imageRatio : imageRatio;

    const validSizes = PRINT_SIZES.filter(size => {
        const sizeRatio = size.ratio;
        const diff = Math.abs(sizeRatio - normalizedImageRatio);
        return diff < 0.15;
    });

    return validSizes.length > 0 ? validSizes : PRINT_SIZES;
};

export const ESTIMATED_BASE_COSTS = PRINT_SIZES.reduce((acc, size) => {
    acc[size.id] = size.baseCostCents;
    return acc;
}, {});
