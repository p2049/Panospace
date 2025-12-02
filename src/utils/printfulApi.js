// Re-export from the new centralized pricing module
export {
    PRINT_SIZES,
    PRINT_TIERS,
    STICKER_SIZES,
    calculateTieredPricing,
    calculateStickerPricing,
    getValidSizesForImage,
    getAspectRatioCategory,
    centsToDollars,
    calculateEarnings
} from './printPricing';

// Mock POD Integration (kept for compatibility)
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
