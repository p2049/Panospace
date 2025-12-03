// Re-export from the adapter to maintain compatibility
export * from '../constants/printSizes';
import { printifyApi } from '../services/printifyApi';

// Mock POD Integration (kept for compatibility but using Printify service)
export const mockPODIntegration = {
    async createProduct(imageUrl, title, selectedSizeIds, selectedPrices) {
        // Adapter to printifyApi.syncProduct
        const result = await printifyApi.syncProduct({ imageUrl, title, variants: selectedSizeIds });

        // Map result to match expected output if needed
        return {
            productId: result.printifyId,
            variants: selectedSizeIds.map((sizeId, idx) => ({
                sizeId,
                variantId: `${result.printifyId}_size_${sizeId}`,
                price: Number(selectedPrices[idx] || 0),
            }))
        };
    },
};
