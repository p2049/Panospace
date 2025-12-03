/**
 * PANOSPACE PRINTIFY PRICING ENGINE
 * 
 * Centralized logic for Printify product definitions, pricing, and margins.
 * Replaces legacy Printful logic.
 */

// ============================================================================
// 1. PRINTIFY PRODUCT DEFINITIONS (Placeholders mimicking existing tiers)
// ============================================================================

export const PRINT_TIERS = {
    ECONOMY: 'economy',
    PREMIUM: 'premium',
    LIMITED: 'limited'
};

export const PRINTIFY_PRODUCTS = [
    {
        id: '5x7',
        label: '5" × 7"',
        tier: 'small',
        ratio: 1.4, // 7/5
        price: 12.00,
        baseCostCents: 500,
        printifyProviderId: 10, // Placeholder
        printifyBlueprintId: 1001 // Placeholder
    },
    {
        id: '8x10',
        label: '8" × 10"',
        tier: 'small',
        ratio: 1.25,
        price: 14.40,
        baseCostCents: 650,
        printifyProviderId: 10,
        printifyBlueprintId: 1002
    },
    {
        id: '11x14',
        label: '11" × 14"',
        tier: 'small',
        ratio: 1.27,
        price: 19.80,
        baseCostCents: 850,
        printifyProviderId: 10,
        printifyBlueprintId: 1003
    },
    {
        id: '12x18',
        label: '12" × 18"',
        tier: 'medium',
        ratio: 1.5,
        price: 25.20,
        baseCostCents: 1000,
        printifyProviderId: 10,
        printifyBlueprintId: 1004
    },
    {
        id: '16x20',
        label: '16" × 20"',
        tier: 'medium',
        ratio: 1.25,
        price: 28.80,
        baseCostCents: 1200,
        printifyProviderId: 10,
        printifyBlueprintId: 1005
    },
    {
        id: '18x24',
        label: '18" × 24"',
        tier: 'medium',
        ratio: 1.33,
        price: 37.80,
        baseCostCents: 1450,
        printifyProviderId: 10,
        printifyBlueprintId: 1006
    },
    {
        id: '24x36',
        label: '24" × 36"',
        tier: 'large',
        ratio: 1.5,
        price: 52.20,
        baseCostCents: 2200,
        printifyProviderId: 10,
        printifyBlueprintId: 1007
    },
    // Additional sizes from legacy config
    {
        id: '4x6',
        label: '4" × 6"',
        tier: 'small',
        ratio: 1.5,
        price: 14.99,
        baseCostCents: 800,
        printifyProviderId: 10,
        printifyBlueprintId: 1008
    },
    {
        id: '8x12',
        label: '8" × 12"',
        tier: 'small',
        ratio: 1.5,
        price: 26.99,
        baseCostCents: 1400,
        printifyProviderId: 10,
        printifyBlueprintId: 1009
    },
    {
        id: '20x30',
        label: '20" × 30"',
        tier: 'large',
        ratio: 1.5,
        price: 74.99,
        baseCostCents: 3200,
        printifyProviderId: 10,
        printifyBlueprintId: 1010
    },
    {
        id: '6x8',
        label: '6" × 8"',
        tier: 'small',
        ratio: 1.33,
        price: 19.99,
        baseCostCents: 1000,
        printifyProviderId: 10,
        printifyBlueprintId: 1011
    },
    {
        id: '9x12',
        label: '9" × 12"',
        tier: 'small',
        ratio: 1.33,
        price: 29.99,
        baseCostCents: 1500,
        printifyProviderId: 10,
        printifyBlueprintId: 1012
    },
    {
        id: '12x16',
        label: '12" × 16"',
        tier: 'medium',
        ratio: 1.33,
        price: 39.99,
        baseCostCents: 1900,
        printifyProviderId: 10,
        printifyBlueprintId: 1013
    },
    {
        id: '8x8',
        label: '8" × 8"',
        tier: 'small',
        ratio: 1.0,
        price: 22.99,
        baseCostCents: 1100,
        printifyProviderId: 10,
        printifyBlueprintId: 1014
    },
    {
        id: '10x10',
        label: '10" × 10"',
        tier: 'small',
        ratio: 1.0,
        price: 26.99,
        baseCostCents: 1300,
        printifyProviderId: 10,
        printifyBlueprintId: 1015
    },
    {
        id: '12x12',
        label: '12" × 12"',
        tier: 'medium',
        ratio: 1.0,
        price: 34.99,
        baseCostCents: 1700,
        printifyProviderId: 10,
        printifyBlueprintId: 1016
    },
    {
        id: '16x16',
        label: '16" × 16"',
        tier: 'medium',
        ratio: 1.0,
        price: 49.99,
        baseCostCents: 2300,
        printifyProviderId: 10,
        printifyBlueprintId: 1017
    },
    {
        id: '20x20',
        label: '20" × 20"',
        tier: 'large',
        ratio: 1.0,
        price: 64.99,
        baseCostCents: 3000,
        printifyProviderId: 10,
        printifyBlueprintId: 1018
    },
    {
        id: '8x14',
        label: '8" × 14"',
        tier: 'small',
        ratio: 1.78,
        price: 29.99,
        baseCostCents: 1500,
        printifyProviderId: 10,
        printifyBlueprintId: 1019
    },
    {
        id: '12x21',
        label: '12" × 21"',
        tier: 'medium',
        ratio: 1.78,
        price: 46.99,
        baseCostCents: 2100,
        printifyProviderId: 10,
        printifyBlueprintId: 1020
    },
    {
        id: '16x28',
        label: '16" × 28"',
        tier: 'large',
        ratio: 1.78,
        price: 64.99,
        baseCostCents: 2900,
        printifyProviderId: 10,
        printifyBlueprintId: 1021
    }
];

export const STICKER_PRODUCTS = [
    {
        id: 'sticker_3x3',
        label: '3" × 3" Sticker',
        baseCost: 1.80,
        price: 3.50,
        printifyProviderId: 20,
        printifyBlueprintId: 2001
    },
    {
        id: 'sticker_4x4',
        label: '4" × 4" Sticker',
        baseCost: 2.20,
        price: 5.00,
        printifyProviderId: 20,
        printifyBlueprintId: 2002
    }
];

// ============================================================================
// 3. BUNDLE PRICING LOGIC
// ============================================================================

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
        const pricing = calculatePrintifyEarnings(retailPrice, print.sizeId);

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

// ============================================================================
// 4. EXPORTED HELPERS
// ============================================================================

/**
 * Get the base cost for a specific size and type (tier)
 * @param {string} sizeId - The ID of the size
 * @param {string} type - 'economy' or 'premium' (mapped to Printify providers/variants)
 * @returns {number} Base cost in dollars
 */
export const getPrintifyBasePrice = (sizeId, type = 'economy') => {
    const product = PRINTIFY_PRODUCTS.find(p => p.id === sizeId);
    if (!product) return 0;

    // For now, we use the same base cost, but in reality, 'premium' would map to a more expensive Printify provider
    // Adding a multiplier for premium to simulate higher base cost
    const baseCost = product.baseCostCents / 100;
    return type === 'premium' ? baseCost * 1.5 : baseCost;
};

/**
 * Get the retail price for a specific size and type
 * @param {string} sizeId - The ID of the size
 * @param {string} type - 'economy' or 'premium'
 * @returns {number} Retail price in dollars
 */
export const getRetailPrice = (sizeId, type = 'economy') => {
    const product = PRINTIFY_PRODUCTS.find(p => p.id === sizeId);
    if (!product) return 0;

    // Use existing pricing logic from legacy system
    // Economy: ~90% of Redbubble (simulated by our static price)
    // Premium: Higher markup
    return type === 'premium' ? product.price * 1.5 : product.price;
};

/**
 * Get all available Printify products/sizes
 * @returns {Array} List of products
 */
export const getPrintifyProducts = () => {
    return PRINTIFY_PRODUCTS;
};

/**
 * Get Printify options (providers, variants) - Placeholder
 * @returns {Object} Options
 */
export const getPrintifyOptions = () => {
    return {
        providers: [
            { id: 10, title: 'Printify Standard Provider' },
            { id: 20, title: 'Printify Sticker Provider' }
        ],
        shipping: 'standard'
    };
};

/**
 * Calculate earnings for a given retail price
 * @param {number} retailPrice - Retail price in dollars
 * @param {string} sizeId - Size ID
 * @param {boolean} isUltra - Is user Ultra member
 * @returns {Object} Earnings breakdown
 */
export const calculatePrintifyEarnings = (retailPrice, sizeId, isUltra = false) => {
    const product = PRINTIFY_PRODUCTS.find(p => p.id === sizeId);
    const baseCost = product ? product.baseCostCents / 100 : 15.00; // Default fallback

    const profit = Math.max(0, retailPrice - baseCost);
    const artistShare = isUltra ? 0.75 : 0.60;

    return {
        artistEarnings: profit * artistShare,
        platformEarnings: profit * (1 - artistShare),
        baseCost: baseCost,
        retailPrice: retailPrice
    };
};

// Helper for aspect ratio (kept from legacy for utility)
export const getAspectRatioCategory = (width, height) => {
    if (!width || !height) return 'unknown';
    const ratio = width / height;

    if (Math.abs(ratio - 1.0) < 0.05) return 1.0;
    if (Math.abs(ratio - 1.25) < 0.05) return 1.25;
    if (Math.abs(ratio - 1.33) < 0.05) return 1.33;
    if (Math.abs(ratio - 1.4) < 0.05) return 1.4;
    if (Math.abs(ratio - 1.5) < 0.05) return 1.5;
    if (Math.abs(ratio - 1.78) < 0.05) return 1.78;

    // Portrait
    if (Math.abs(ratio - 0.8) < 0.05) return 1.25;
    if (Math.abs(ratio - 0.75) < 0.05) return 1.33;
    if (Math.abs(ratio - 0.71) < 0.05) return 1.4;
    if (Math.abs(ratio - 0.66) < 0.05) return 1.5;
    if (Math.abs(ratio - 0.56) < 0.05) return 1.78;

    return 'custom';
};

export const getValidSizesForImage = (width, height, allowCropped = false) => {
    if (allowCropped) return PRINTIFY_PRODUCTS;
    if (!width || !height) return PRINTIFY_PRODUCTS;

    const imageRatio = width / height;
    const isPortrait = imageRatio < 1;
    const normalizedImageRatio = isPortrait ? 1 / imageRatio : imageRatio;

    const validSizes = PRINTIFY_PRODUCTS.filter(size => {
        const sizeRatio = size.ratio;
        const diff = Math.abs(sizeRatio - normalizedImageRatio);
        return diff < 0.15;
    });

    return validSizes.length > 0 ? validSizes : PRINTIFY_PRODUCTS;
};

// ============================================================================
// 5. COMPATIBILITY EXPORTS (Added for backward compatibility)
// ============================================================================

export const PRINT_SIZES = PRINTIFY_PRODUCTS;
export const STICKER_SIZES = STICKER_PRODUCTS;

export const calculateEarnings = calculatePrintifyEarnings;

export const calculateTieredPricing = (sizeId, tier = 'economy', isUltra = false) => {
    const retailPrice = getRetailPrice(sizeId, tier);
    const earnings = calculatePrintifyEarnings(retailPrice, sizeId, isUltra);
    return {
        finalPrice: retailPrice,
        artistProfit: earnings.artistEarnings,
        platformProfit: earnings.platformEarnings,
        baseCost: earnings.baseCost
    };
};

export const calculateStickerPricing = (stickerId) => {
    const sticker = STICKER_PRODUCTS.find(s => s.id === stickerId);
    if (!sticker) return null;

    // Simple sticker pricing logic
    const retailPrice = sticker.price;
    const baseCost = sticker.baseCost;
    const profit = Math.max(0, retailPrice - baseCost);
    const artistShare = 0.60; // Fixed share for stickers for now

    return {
        finalPrice: retailPrice,
        artistProfit: profit * artistShare,
        platformProfit: profit * (1 - artistShare),
        baseCost: baseCost
    };
};
