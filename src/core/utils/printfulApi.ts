/**
 * LEGACY COMPATIBILITY LAYER
 * 
 * Re-exports from the canonical pricing engine.
 * This file exists for backward compatibility only.
 * New code should import from '@/core/pricing' instead.
 */

export * from '@/domain/shop/pricing';
import { CATALOG } from '@/domain/shop/pricing';

// Mock POD Integration (kept for compatibility but using canonical pricing)
export const mockPODIntegration = {
    async createProduct(imageUrl: string, title: string, selectedSizeIds: string[], selectedPrices: Record<string, number> | any) {
        // Use the canonical pricing adapter
        const payload = {
            imageUrl,
            title,
            sizeIds: selectedSizeIds,
            prices: selectedPrices,
            variants: selectedSizeIds.map(id => ({
                sizeId: id,
                printifyId: CATALOG[id]?.printifyBlueprintId
            }))
        };

        // Return mock result for now
        return {
            productId: `mock_${Date.now()}`,
            variants: payload.variants.map((v, idx) => ({
                sizeId: v.sizeId,
                variantId: `variant_${v.sizeId}_${idx}`,
                // @ts-ignore - 'price' might not be on v directly if it came from selectedPrices logic not fully mapped
                price: (selectedPrices && selectedPrices[v.sizeId]) || 0,
            }))
        };
    },
};
