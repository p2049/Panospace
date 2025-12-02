/**
 * ✅ SINGLE SOURCE OF TRUTH FOR PRINT SIZES & PRICING
 * Used across: CreatePost, Shop, Profile, Checkout
 */

// Platform revenue share
export const PLATFORM_CUT_PERCENTAGE = 0.50; // 50%
export const ARTIST_CUT_PERCENTAGE = 0.50;   // 50%

/**
 * Approved print sizes with base costs from Printful
 * DO NOT ADD SIZES THAT PRINTFUL DOES NOT SUPPORT
 */
export const PRINT_SIZES = [
    // 3:2 Ratio (Standard DSLR)
    {
        id: '4x6',
        label: '4x6"',
        price: 14.99,
        baseCostCents: 800,
        dimensions: { width: 4, height: 6, unit: 'inches' },
        ratio: 1.5
    },
    {
        id: '8x12',
        label: '8x12"',
        price: 26.99,
        baseCostCents: 1400,
        dimensions: { width: 8, height: 12, unit: 'inches' },
        ratio: 1.5
    },
    {
        id: '12x18',
        label: '12x18"',
        price: 42.99,
        baseCostCents: 2000,
        dimensions: { width: 12, height: 18, unit: 'inches' },
        ratio: 1.5
    },
    {
        id: '20x30',
        label: '20x30"',
        price: 74.99,
        baseCostCents: 3200,
        dimensions: { width: 20, height: 30, unit: 'inches' },
        ratio: 1.5
    },
    {
        id: '24x36',
        label: '24x36"',
        price: 79.99,
        baseCostCents: 3500,
        dimensions: { width: 24, height: 36, unit: 'inches' },
        ratio: 1.5
    },

    // 4:3 Ratio (Micro 4/3, Phones)
    {
        id: '6x8',
        label: '6x8"',
        price: 19.99,
        baseCostCents: 1000,
        dimensions: { width: 6, height: 8, unit: 'inches' },
        ratio: 1.33
    },
    {
        id: '9x12',
        label: '9x12"',
        price: 29.99,
        baseCostCents: 1500,
        dimensions: { width: 9, height: 12, unit: 'inches' },
        ratio: 1.33
    },
    {
        id: '12x16',
        label: '12x16"',
        price: 39.99,
        baseCostCents: 1900,
        dimensions: { width: 12, height: 16, unit: 'inches' },
        ratio: 1.33
    },
    {
        id: '18x24',
        label: '18x24"',
        price: 59.99,
        baseCostCents: 2800,
        dimensions: { width: 18, height: 24, unit: 'inches' },
        ratio: 1.33
    },

    // 1:1 Ratio (Square)
    {
        id: '8x8',
        label: '8x8"',
        price: 22.99,
        baseCostCents: 1100,
        dimensions: { width: 8, height: 8, unit: 'inches' },
        ratio: 1.0
    },
    {
        id: '10x10',
        label: '10x10"',
        price: 26.99,
        baseCostCents: 1300,
        dimensions: { width: 10, height: 10, unit: 'inches' },
        ratio: 1.0
    },
    {
        id: '12x12',
        label: '12x12"',
        price: 34.99,
        baseCostCents: 1700,
        dimensions: { width: 12, height: 12, unit: 'inches' },
        ratio: 1.0
    },
    {
        id: '16x16',
        label: '16x16"',
        price: 49.99,
        baseCostCents: 2300,
        dimensions: { width: 16, height: 16, unit: 'inches' },
        ratio: 1.0
    },
    {
        id: '20x20',
        label: '20x20"',
        price: 64.99,
        baseCostCents: 3000,
        dimensions: { width: 20, height: 20, unit: 'inches' },
        ratio: 1.0
    },

    // 16:9 Ratio (Cinematic)
    {
        id: '8x14',
        label: '8x14"',
        price: 29.99,
        baseCostCents: 1500,
        dimensions: { width: 8, height: 14, unit: 'inches' },
        ratio: 1.78
    },
    {
        id: '12x21',
        label: '12x21"',
        price: 46.99,
        baseCostCents: 2100,
        dimensions: { width: 12, height: 21, unit: 'inches' },
        ratio: 1.78
    },
    {
        id: '16x28',
        label: '16x28"',
        price: 64.99,
        baseCostCents: 2900,
        dimensions: { width: 16, height: 28, unit: 'inches' },
        ratio: 1.78
    },

    // 5:4 Ratio (Traditional)
    {
        id: '8x10',
        label: '8x10"',
        price: 24.99,
        baseCostCents: 1200,
        dimensions: { width: 8, height: 10, unit: 'inches' },
        ratio: 1.25
    },
    {
        id: '11x14',
        label: '11x14"',
        price: 34.99,
        baseCostCents: 1600,
        dimensions: { width: 11, height: 14, unit: 'inches' },
        ratio: 1.27
    },
    {
        id: '16x20',
        label: '16x20"',
        price: 49.99,
        baseCostCents: 2200,
        dimensions: { width: 16, height: 20, unit: 'inches' },
        ratio: 1.25
    }
];

/**
 * Calculate earnings breakdown for a given retail price
 * 
 * @param {number} retailPrice - Price in dollars
 * @param {number} baseCostCents - POD base cost in cents
 * @returns {Object} Breakdown: artist, platform, total profit
 */
export function calculateEarnings(retailPrice, baseCostCents = 0) {
    const retailCents = Math.round(Number(retailPrice || 0) * 100);

    if (!Number.isFinite(retailCents) || retailCents <= 0) {
        return {
            retailCents: 0,
            baseCostCents: 0,
            totalProfitCents: 0,
            artistEarningsCents: 0,
            platformCutCents: 0,
            artistCutPercentage: 50,
            platformCutPercentage: 50
        };
    }

    const totalProfitCents = retailCents - baseCostCents;
    const artistEarningsCents = Math.round(totalProfitCents * ARTIST_CUT_PERCENTAGE);
    const platformCutCents = totalProfitCents - artistEarningsCents;

    return {
        retailCents,
        baseCostCents,
        totalProfitCents,
        artistEarningsCents,
        platformCutCents,
        artistCutPercentage: 50,
        platformCutPercentage: 50
    };
}

/**
 * Get print size by ID
 */
export function getPrintSize(sizeId) {
    return PRINT_SIZES.find(s => s.id === sizeId);
}

/**
 * Format cents to dollar string
 */
export function formatCents(cents) {
    return `$${((cents || 0) / 100).toFixed(2)}`;
}

/**
 * Mock Printful integration (replace with real API later)
 */
export const mockPrintfulAPI = {
    async createProduct(imageUrl, title, sizes) {
        console.log('[MOCK] Creating Printful product:', { imageUrl, title, sizes });
        return {
            productId: `mock_prod_${Date.now()}`,
            syncVariantIds: sizes.map(s => `mock_var_${s.id}_${Date.now()}`)
        };
    },

    async createOrder(variantId, quantity, shippingAddress) {
        console.log('[MOCK] Creating Printful order:', { variantId, quantity });
        return {
            orderId: `mock_order_${Date.now()}`,
            status: 'pending',
            estimatedShippingDays: 7
        };
    }
};

/**
 * Helper to determine the closest aspect ratio category
 */
export function getAspectRatioCategory(width, height) {
    if (!width || !height) return 'unknown';
    const ratio = width / height;

    // Define thresholds (allow some variance)
    if (Math.abs(ratio - 1.0) < 0.05) return 1.0;   // Square
    if (Math.abs(ratio - 1.25) < 0.05) return 1.25; // 5:4
    if (Math.abs(ratio - 1.33) < 0.05) return 1.33; // 4:3
    if (Math.abs(ratio - 1.5) < 0.05) return 1.5;   // 3:2
    if (Math.abs(ratio - 1.78) < 0.05) return 1.78; // 16:9

    // Handle portrait orientations (inverse ratios)
    if (Math.abs(ratio - 0.8) < 0.05) return 1.25;  // 4:5
    if (Math.abs(ratio - 0.75) < 0.05) return 1.33; // 3:4
    if (Math.abs(ratio - 0.66) < 0.05) return 1.5;  // 2:3
    if (Math.abs(ratio - 0.56) < 0.05) return 1.78; // 9:16

    return 'custom';
}

/**
 * Helper to get valid sizes for a given image dimensions
 */
export function getValidSizesForImage(width, height, allowCropped = false) {
    if (allowCropped) return PRINT_SIZES;

    const categoryRatio = getAspectRatioCategory(width, height);
    if (categoryRatio === 'custom' || categoryRatio === 'unknown') {
        // If custom/unknown, return all sizes to avoid blocking the user
        return PRINT_SIZES;
    }

    return PRINT_SIZES.filter(size => {
        // Check if size ratio matches the category ratio
        const sizeRatio = size.ratio;
        return Math.abs(sizeRatio - categoryRatio) < 0.1; // Loose matching
    });
}

