/**
 * ✅ SINGLE SOURCE OF TRUTH FOR PRINT SIZES & PRICING
 * Used across: CreatePost, Shop, Profile, Checkout
 * 
 * NOW REDIRECTS TO src/utils/printPricing.js
 */

import {
    PRINT_SIZES as SOURCE_SIZES,
    calculateEarnings as sourceCalc,
    getAspectRatioCategory as sourceGetRatio,
    getValidSizesForImage as sourceGetValidSizes
} from '../utils/printPricing';

// Platform revenue share
export const PLATFORM_CUT_PERCENTAGE = 0.50; // 50%
export const ARTIST_CUT_PERCENTAGE = 0.50;   // 50%

export const PRINT_SIZES = SOURCE_SIZES;

export const calculateEarnings = sourceCalc;

export const getAspectRatioCategory = sourceGetRatio;

export const getValidSizesForImage = sourceGetValidSizes;

export function getPrintSize(sizeId) {
    return PRINT_SIZES.find(s => s.id === sizeId);
}

export function formatCents(cents) {
    return `$${((cents || 0) / 100).toFixed(2)}`;
}

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
