/**
 * LEGACY COMPATIBILITY LAYER
 * 
 * Re-exports from the canonical pricing engine.
 * This file exists for backward compatibility only.
 * New code should import from '@/core/pricing' instead.
 */

export * from '@/core/constants/printSizes';
import { createPrintifyProductPayload } from '@/core/core/pricing';

// Mock POD Integration (kept for compatibility but using canonical pricing)
export const mockPODIntegration = {
    async createProduct(imageUrl, title, selectedSizeIds, selectedPrices) {
        // Use the canonical pricing adapter
        const payload = createPrintifyProductPayload({
            imageUrl,
            title,
            sizeIds: selectedSizeIds,
            prices: selectedPrices
        });

        // Return mock result for now
        return {
            productId: `mock_${Date.now()}`,
            variants: payload.variants.map((v, idx) => ({
                sizeId: v.sizeId,
                variantId: `variant_${v.sizeId}_${idx}`,
                price: v.price,
            }))
        };
    },
};
