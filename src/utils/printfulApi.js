// src/utils/printfulApi.js
import {
    PRINT_SIZES as CONST_PRINT_SIZES,
    PRINT_TIERS,
    STICKER_SIZES,
    calculateTieredPricing,
    calculateStickerPricing
} from '../constants/printSizes';

export { PRINT_TIERS, STICKER_SIZES, calculateTieredPricing, calculateStickerPricing };

// Re-export PRINT_SIZES with the expected structure for legacy code if needed, 
// but mostly we want to use the new structure.
export const PRINT_SIZES = CONST_PRINT_SIZES.map(s => ({
    ...s,
    // Add ratio for helper functions if missing (assuming standard ratios for now)
    ratio: getRatioForSize(s.id)
}));

function getRatioForSize(id) {
    switch (id) {
        case '8x10': return 1.25;
        case '11x14': return 1.27;
        case '12x18': return 1.5;
        case '16x20': return 1.25;
        case '18x24': return 1.33; // 4:3
        case '24x36': return 1.5;
        default: return 1.5;
    }
}

// ---------------------------------------------------------------------------
// Helper: determine the closest aspect‑ratio category (returns the numeric ratio)
// ---------------------------------------------------------------------------
export const getAspectRatioCategory = (width, height) => {
    if (!width || !height) return 'unknown';
    const ratio = width / height;

    // Allow a small variance (±0.05) when matching standard ratios
    if (Math.abs(ratio - 1.0) < 0.05) return 1.0; // Square
    if (Math.abs(ratio - 1.25) < 0.05) return 1.25; // 5:4 (traditional)
    if (Math.abs(ratio - 1.33) < 0.05) return 1.33; // 4:3
    if (Math.abs(ratio - 1.5) < 0.05) return 1.5; // 3:2
    if (Math.abs(ratio - 1.78) < 0.05) return 1.78; // 16:9 (cinematic)

    // Portrait orientations (inverse ratios)
    if (Math.abs(ratio - 0.8) < 0.05) return 1.25; // 4:5 → treat as 5:4
    if (Math.abs(ratio - 0.75) < 0.05) return 1.33; // 3:4 → treat as 4:3
    if (Math.abs(ratio - 0.66) < 0.05) return 1.5; // 2:3 → treat as 3:2
    if (Math.abs(ratio - 0.56) < 0.05) return 1.78; // 9:16 → treat as 16:9

    return 'custom';
};

// ---------------------------------------------------------------------------
// Helper: get valid print sizes for an image (respecting minimal‑crop rule)
// ---------------------------------------------------------------------------
export const getValidSizesForImage = (width, height, allowCropped = false) => {
    if (allowCropped) return PRINT_SIZES;
    if (!width || !height) return PRINT_SIZES;

    const imageRatio = width / height;

    // Normalize portrait to landscape for comparison
    // PRINT_SIZES ratios are defined as width/height where width >= height (landscape/square)
    const isPortrait = imageRatio < 1;
    const normalizedImageRatio = isPortrait ? 1 / imageRatio : imageRatio;

    // Filter sizes where the aspect ratio difference is small (e.g., < 0.15)
    // This allows for some cropping but excludes sizes that would require significant cropping.
    // If no sizes match (unlikely given the range), we could fall back to all sizes or the closest one.
    const validSizes = PRINT_SIZES.filter(size => {
        const sizeRatio = size.ratio;
        const diff = Math.abs(sizeRatio - normalizedImageRatio);
        return diff < 0.15;
    });

    // If strict matching yields no results, return all sizes (let user crop)
    return validSizes.length > 0 ? validSizes : PRINT_SIZES;
};

// ---------------------------------------------------------------------------
// Utility: convert cents to dollars
// ---------------------------------------------------------------------------
export const centsToDollars = (cents) => Number((cents || 0) / 100);

// ---------------------------------------------------------------------------
// LEGACY: Calculate earnings (artist & platform) from a retail price
// NOTE: This is deprecated in favor of calculateTieredPricing
// ---------------------------------------------------------------------------
export const calculateEarnings = (priceDollars) => {
    // Fallback implementation for legacy calls
    // Assumes Economy tier for estimation
    const priceCents = Math.round(Number(priceDollars || 0) * 100);
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
        return { artistEarningsCents: 0, platformCutCents: 0 };
    }
    // Rough estimate based on new model (Artist gets ~20-30% of retail usually)
    const artistEarningsCents = Math.round(priceCents * 0.25);
    const platformCutCents = priceCents - artistEarningsCents;
    return { artistEarningsCents, platformCutCents };
};

// ---------------------------------------------------------------------------
// Mock Print‑On‑Demand integration (placeholder until real Printful API is wired)
// ---------------------------------------------------------------------------
export const mockPODIntegration = {
    async createProduct(imageUrl, title, selectedSizeIds, selectedPrices) {
        const productId = `mock_${Date.now()}`;
        const variants = selectedSizeIds.map((sizeId, idx) => ({
            sizeId,
            variantId: `${productId}_size_${sizeId}`,
            price: Number(selectedPrices[idx] || 0),
        }));
        return { productId, variants };
    },
};
