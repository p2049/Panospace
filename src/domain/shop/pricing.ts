/**
 * ✅ PANOSPACE PRICING ENGINE
 * 
 * Single Source of Truth for:
 * - Product Catalog & Definitions
 * - Dynamic Pricing Logic
 * - Revenue Sharing (Artist vs Platform)
 * - Bundle Calculations
 * - Printify/Printful Mapping
 */

// ============================================================================
// 1. TYPES E DEFINITIONS
// ============================================================================

export type ProductTier = 'economy' | 'premium' | 'limited' | 'small' | 'medium' | 'large';
export type ProductType = 'print' | 'sticker' | 'magazine' | 'album' | 'yearbook' | 'digital';

export interface ProductDefinition {
    id: string;
    label: string;
    type: ProductType;
    tier: ProductTier;
    ratio: number;
    baseCostCents: number;
    suggestedRetailPrice: number;
    printifyProviderId?: number;
    printifyBlueprintId?: number;
    dimensions?: { width: number; height: number; unit: 'in' | 'cm' };
}

export interface PricingResult {
    finalPrice: number;
    artistProfit: number;
    platformProfit: number;
    baseCost: number;
    artistShare: number;
    label?: string;
}

export interface BundlePricingResult {
    baseCollectionPrice: number;
    bundleDiscountPercent: number;
    finalBundlePrice: number;
    totalBaseCost: number;
    artistBundleEarnings: number;
    platformBundleEarnings: number;
    totalPrintCount: number;
    savingsAmount: number;
    savingsPercent: number;
    breakdown: BundleBreakdownItem[];
}

export interface BundleBreakdownItem {
    sizeId: string;
    sizeLabel: string;
    finalPrice: number;
    baseCost: number;
    artistProfit: number;
    platformProfit: number;
}

// ============================================================================
// 2. CONSTANTS
// ============================================================================

export const PRINT_TIERS = {
    ECONOMY: 'economy',
    PREMIUM: 'premium',
    LIMITED: 'limited'
};

export const MONETIZATION_CONFIG = {
    CURRENCY: 'usd',
    MIN_TRANSACTION_AMOUNT_CENTS: 50,
};

// ============================================================================
// 3. PRODUCT CATALOG
// ============================================================================

export const PRINT_PRODUCTS: ProductDefinition[] = [
    {
        id: '4x6',
        label: '4" × 6"',
        type: 'print',
        tier: 'small',
        ratio: 1.5,
        baseCostCents: 500,
        suggestedRetailPrice: 8.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1008,
        dimensions: { width: 4, height: 6, unit: 'in' }
    },
    {
        id: '5x7',
        label: '5" × 7"',
        type: 'print',
        tier: 'small',
        ratio: 1.4,
        baseCostCents: 500,
        suggestedRetailPrice: 11.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1001,
        dimensions: { width: 5, height: 7, unit: 'in' }
    },
    {
        id: '6x8',
        label: '6" × 8"',
        type: 'print',
        tier: 'small',
        ratio: 1.33,
        baseCostCents: 600,
        suggestedRetailPrice: 14.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1011,
        dimensions: { width: 6, height: 8, unit: 'in' }
    },
    {
        id: '8x8',
        label: '8" × 8"',
        type: 'print',
        tier: 'small',
        ratio: 1.0,
        baseCostCents: 600,
        suggestedRetailPrice: 16.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1014,
        dimensions: { width: 8, height: 8, unit: 'in' }
    },
    {
        id: '8x10',
        label: '8" × 10"',
        type: 'print',
        tier: 'small',
        ratio: 1.25,
        baseCostCents: 650,
        suggestedRetailPrice: 18.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1002,
        dimensions: { width: 8, height: 10, unit: 'in' }
    },
    {
        id: '8x12',
        label: '8" × 12"',
        type: 'print',
        tier: 'small',
        ratio: 1.5,
        baseCostCents: 700,
        suggestedRetailPrice: 21.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1009,
        dimensions: { width: 8, height: 12, unit: 'in' }
    },
    {
        id: '10x10',
        label: '10" × 10"',
        type: 'print',
        tier: 'small',
        ratio: 1.0,
        baseCostCents: 750,
        suggestedRetailPrice: 22.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1015,
        dimensions: { width: 10, height: 10, unit: 'in' }
    },
    {
        id: '11x14',
        label: '11" × 14"',
        type: 'print',
        tier: 'medium',
        ratio: 1.27,
        baseCostCents: 850,
        suggestedRetailPrice: 26.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1003,
        dimensions: { width: 11, height: 14, unit: 'in' }
    },
    {
        id: '12x12',
        label: '12" × 12"',
        type: 'print',
        tier: 'medium',
        ratio: 1.0,
        baseCostCents: 900,
        suggestedRetailPrice: 25.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1016,
        dimensions: { width: 12, height: 12, unit: 'in' }
    },
    {
        id: '12x16',
        label: '12" × 16"',
        type: 'print',
        tier: 'medium',
        ratio: 1.33,
        baseCostCents: 900,
        suggestedRetailPrice: 28.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1013,
        dimensions: { width: 12, height: 16, unit: 'in' }
    },
    {
        id: '12x18',
        label: '12" × 18"',
        type: 'print',
        tier: 'medium',
        ratio: 1.5,
        baseCostCents: 1000,
        suggestedRetailPrice: 29.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1004,
        dimensions: { width: 12, height: 18, unit: 'in' }
    },
    {
        id: '16x16',
        label: '16" × 16"',
        type: 'print',
        tier: 'medium',
        ratio: 1.0,
        baseCostCents: 1200,
        suggestedRetailPrice: 34.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1017,
        dimensions: { width: 16, height: 16, unit: 'in' }
    },
    {
        id: '16x20',
        label: '16" × 20"',
        type: 'print',
        tier: 'medium',
        ratio: 1.25,
        baseCostCents: 1200,
        suggestedRetailPrice: 39.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1005,
        dimensions: { width: 16, height: 20, unit: 'in' }
    },
    {
        id: '18x24',
        label: '18" × 24"',
        type: 'print',
        tier: 'large',
        ratio: 1.33,
        baseCostCents: 1450,
        suggestedRetailPrice: 49.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1006,
        dimensions: { width: 18, height: 24, unit: 'in' }
    },
    {
        id: '20x20',
        label: '20" × 20"',
        type: 'print',
        tier: 'large',
        ratio: 1.0,
        baseCostCents: 1600,
        suggestedRetailPrice: 44.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1018,
        dimensions: { width: 20, height: 20, unit: 'in' }
    },
    {
        id: '20x30',
        label: '20" × 30"',
        type: 'print',
        tier: 'large',
        ratio: 1.5,
        baseCostCents: 2000,
        suggestedRetailPrice: 54.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1010,
        dimensions: { width: 20, height: 30, unit: 'in' }
    },
    {
        id: '24x36',
        label: '24" × 36"',
        type: 'print',
        tier: 'large',
        ratio: 1.5,
        baseCostCents: 2200,
        suggestedRetailPrice: 69.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1007,
        dimensions: { width: 24, height: 36, unit: 'in' }
    }
];

export const STICKER_PRODUCTS: ProductDefinition[] = [
    {
        id: 'sticker_3x3',
        label: '3" × 3" Sticker',
        type: 'sticker',
        tier: 'small',
        ratio: 1.0,
        baseCostCents: 180,
        suggestedRetailPrice: 3.99,
        printifyProviderId: 20,
        printifyBlueprintId: 2001,
        dimensions: { width: 3, height: 3, unit: 'in' }
    },
    {
        id: 'sticker_4x4',
        label: '4" × 4" Sticker',
        type: 'sticker',
        tier: 'small',
        ratio: 1.0,
        baseCostCents: 220,
        suggestedRetailPrice: 5.99,
        printifyProviderId: 20,
        printifyBlueprintId: 2002,
        dimensions: { width: 4, height: 4, unit: 'in' }
    }
];

// Merged Catalog
export const CATALOG: Record<string, ProductDefinition> = [
    ...PRINT_PRODUCTS,
    ...STICKER_PRODUCTS
].reduce((acc, product) => {
    acc[product.id] = product;
    return acc;
}, {} as Record<string, ProductDefinition>);

// Aliases for compatibility
export const PRINT_SIZES = PRINT_PRODUCTS;
export const STICKER_SIZES = STICKER_PRODUCTS;

// ============================================================================
// 4. CORE PRICING LOGIC
// ============================================================================

/**
 * Get available products (Alias for legacy code)
 */
export const getPrintifyProducts = () => PRINT_PRODUCTS;

/**
 * Determine artist share based on retail price
 * TIERED SYSTEM:
 * < $20: 20%
 * $20 - $49: 25%
 * $50 - $99: 30%
 * >= $100: 35%
 */
export const getArtistShare = (retailPrice: number): number => {
    if (retailPrice < 20) return 0.20;
    if (retailPrice < 50) return 0.25;
    if (retailPrice < 100) return 0.30;
    return 0.35;
};

/**
 * Round to nearest .99
 */
const roundTo99 = (value: number): number => {
    return Math.floor(value) + 0.99;
};

/**
 * Apply Premium/Limited Multipliers
 */
export const applyTierMultiplier = (value: number, tier: string = 'economy'): number => {
    if (tier === 'premium') {
        return roundTo99(value * 1.3);
    }
    return value;
};

/**
 * Calculate simple revenue share for a single item
 */
export const calculateEarnings = (retailPrice: number, sizeId: string, isUltra: boolean = false) => {
    const product = CATALOG[sizeId];
    // Fallback if product missing (safe defaults)
    const baseCost = product ? product.baseCostCents / 100 : 10.00;

    const profit = Math.max(0, retailPrice - baseCost);
    const artistShare = getArtistShare(retailPrice);

    return {
        artistEarnings: profit * artistShare,
        platformEarnings: profit * (1 - artistShare),
        baseCost: baseCost,
        retailPrice: retailPrice,
        artistSharePercent: artistShare
    };
};

/**
 * Compatibility wrapper for Printify Adapter
 */
export const calculatePrintifyEarnings = calculateEarnings;

/**
 * Full pricing breakdown for UI
 */
export const calculateTieredPricing = (sizeId: string, tier: string = 'economy', isUltra: boolean = false): PricingResult | null => {
    const product = CATALOG[sizeId];
    if (!product) return null;

    const retailPrice = applyTierMultiplier(product.suggestedRetailPrice, tier);
    const earnings = calculateEarnings(retailPrice, sizeId, isUltra);

    return {
        finalPrice: retailPrice,
        artistProfit: earnings.artistEarnings,
        platformProfit: earnings.platformEarnings,
        baseCost: earnings.baseCost,
        artistShare: earnings.artistSharePercent,
        label: product.label
    };
};

export const calculateStickerPricing = (stickerId: string): PricingResult | null => {
    const sticker = STICKER_PRODUCTS.find(s => s.id === stickerId);
    if (!sticker) return null;

    const retailPrice = sticker.suggestedRetailPrice;
    const baseCost = sticker.baseCostCents / 100;
    const profit = Math.max(0, retailPrice - baseCost);
    const artistShare = getArtistShare(retailPrice);

    return {
        finalPrice: retailPrice,
        artistProfit: profit * artistShare,
        platformProfit: profit * (1 - artistShare),
        baseCost: baseCost,
        artistShare: artistShare,
        label: sticker.label
    };
};

// ============================================================================
// 5. BUNDLE LOGIC
// ============================================================================

export const BUNDLE_DISCOUNT_PERCENT = 15;
export const MIN_ARTIST_MARGIN_PERCENT = 15;
export const MIN_PLATFORM_MARGIN_PERCENT = 10;

const roundToTwo = (num: number) => Math.round(num * 100) / 100;

/**
 * Calculate logic for Collection Bundles
 */
export const calculateBundlePricing = (prints: any[], productTier: string = 'economy'): BundlePricingResult => {
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

    // A. Aggregation
    let baseCollectionPrice = 0;
    let totalBaseCost = 0;
    let totalArtistSingle = 0;
    let totalPlatformSingle = 0;
    const breakdown: BundleBreakdownItem[] = [];

    prints.forEach(print => {
        const product = CATALOG[print.sizeId];
        if (product) {
            const retailPrice = applyTierMultiplier(product.suggestedRetailPrice, productTier);
            const earnings = calculateEarnings(retailPrice, print.sizeId);

            baseCollectionPrice += retailPrice;
            totalBaseCost += earnings.baseCost;
            totalArtistSingle += earnings.artistEarnings;
            totalPlatformSingle += earnings.platformEarnings;

            breakdown.push({
                sizeId: print.sizeId,
                sizeLabel: product.label,
                finalPrice: retailPrice,
                baseCost: earnings.baseCost,
                artistProfit: earnings.artistEarnings,
                platformProfit: earnings.platformEarnings
            });
        }
    });

    // Formatting
    baseCollectionPrice = roundToTwo(baseCollectionPrice);
    totalBaseCost = roundToTwo(totalBaseCost);
    totalArtistSingle = roundToTwo(totalArtistSingle);
    totalPlatformSingle = roundToTwo(totalPlatformSingle);

    // B. Discount Logic
    let effectiveDiscountPercent = BUNDLE_DISCOUNT_PERCENT;
    let targetBundlePrice = roundToTwo(baseCollectionPrice * (1 - effectiveDiscountPercent / 100));

    // C. Earnings Split
    let artistBundleEarnings = totalArtistSingle;
    let platformBundleEarnings = targetBundlePrice - totalBaseCost - artistBundleEarnings;

    // D. Safety Checks (Margins)
    const minArtistEarnings = roundToTwo(totalBaseCost * MIN_ARTIST_MARGIN_PERCENT / 100);
    const minPlatformEarnings = roundToTwo(totalBaseCost * MIN_PLATFORM_MARGIN_PERCENT / 100);

    if (platformBundleEarnings < minPlatformEarnings || artistBundleEarnings < minArtistEarnings) {
        // Recalculate if margins are violated
        const minBundlePrice = totalBaseCost + minArtistEarnings + minPlatformEarnings;

        if (minBundlePrice >= baseCollectionPrice) {
            // Cannot discount safely
            effectiveDiscountPercent = 0;
            targetBundlePrice = baseCollectionPrice;
            artistBundleEarnings = totalArtistSingle;
            platformBundleEarnings = totalPlatformSingle;
        } else {
            // Adjust to minimum safe price
            targetBundlePrice = minBundlePrice;
            effectiveDiscountPercent = roundToTwo(((baseCollectionPrice - targetBundlePrice) / baseCollectionPrice) * 100);
            artistBundleEarnings = minArtistEarnings;
            platformBundleEarnings = minPlatformEarnings;
        }
    }

    const finalBundlePrice = roundToTwo(targetBundlePrice);
    artistBundleEarnings = roundToTwo(artistBundleEarnings);
    platformBundleEarnings = roundToTwo(platformBundleEarnings);
    const savingsAmount = roundToTwo(baseCollectionPrice - finalBundlePrice);
    const savingsPercent = baseCollectionPrice > 0 ? roundToTwo((savingsAmount / baseCollectionPrice) * 100) : 0;

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
 * Helper to validate bundle pricing
 */
export const validateBundlePricing = (bundlePricing: BundlePricingResult) => {
    const errors: string[] = [];
    if (bundlePricing.finalBundlePrice <= bundlePricing.totalBaseCost) errors.push('Bundled price below cost');
    if (bundlePricing.artistBundleEarnings < 0) errors.push('Negative artist earnings');

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Adapter for Collection Builder
 */
export const calculateCollectionBundlePricing = (items: any[] = [], posts: any[] = [], productTier: string = 'economy', defaultSizeId: string = '8x10') => {
    const prints: any[] = [];
    items.forEach((item, index) => {
        prints.push({
            sizeId: item.sizeId || defaultSizeId,
            sizeLabel: item.sizeLabel || defaultSizeId,
            source: 'collection-item',
            index
        });
    });
    posts.forEach(post => {
        if (post.images && Array.isArray(post.images)) {
            post.images.forEach((image: any, index: number) => {
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

// ============================================================================
// 6. UTILS & HELPERS
// ============================================================================

/**
 * Map Internal Size ID to Printify Provider/Blueprints
 */
export const mapSizeToPrintify = (sizeId: string) => {
    const product = CATALOG[sizeId];
    if (!product) {
        return { providerId: null, blueprintId: null, error: 'Product not found' };
    }
    return {
        providerId: product.printifyProviderId,
        blueprintId: product.printifyBlueprintId,
        sizeLabel: product.label
    };
};

/**
 * Helper: Format Currency
 */
export const formatPrice = (price: any): string => {
    const num = Number(price || 0);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

export const formatPriceInput = (price: any): string => {
    const num = Number(price || 0);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
};

// Aspect Ratio Helper
export const getAspectRatioCategory = (width: number, height: number): number | 'custom' => {
    if (!width || !height) return 'custom';
    const ratio = width / height;

    // Standard Ratios with slight tolerance
    if (Math.abs(ratio - 1.0) < 0.05) return 1.0;
    if (Math.abs(ratio - 1.25) < 0.05) return 1.25;
    if (Math.abs(ratio - 1.33) < 0.05) return 1.33;
    if (Math.abs(ratio - 1.4) < 0.05) return 1.4;
    if (Math.abs(ratio - 1.5) < 0.05) return 1.5;

    // Portrait Ratios
    if (Math.abs(ratio - 0.8) < 0.05) return 1.25;
    if (Math.abs(ratio - 0.75) < 0.05) return 1.33;
    if (Math.abs(ratio - 0.66) < 0.05) return 1.5;

    return 'custom';
};

/**
 * Filter valid sizes for a given image
 */
export const getValidSizesForImage = (width: number, height: number, allowCropped: boolean = false): ProductDefinition[] => {
    if (allowCropped || !width || !height) return PRINT_PRODUCTS;

    const imageRatio = width / height;
    const isPortrait = imageRatio < 1;
    const normalizedImageRatio = isPortrait ? 1 / imageRatio : imageRatio;

    const validSizes = PRINT_PRODUCTS.filter(size => {
        const diff = Math.abs(size.ratio - normalizedImageRatio);
        return diff < 0.15; // 15% tolerance
    });

    return validSizes.length > 0 ? validSizes : PRINT_PRODUCTS;
};

// Base Price Accessor
export const getPrintifyBasePrice = (sizeId: string): number => {
    const product = CATALOG[sizeId];
    return product ? product.baseCostCents / 100 : 0;
};

export const getRetailPrice = (sizeId: string, type: string = 'economy'): number => {
    const product = CATALOG[sizeId];
    if (!product) return 0;
    return applyTierMultiplier(product.suggestedRetailPrice, type);
};
