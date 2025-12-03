/**
 * ✅ SINGLE SOURCE OF TRUTH FOR PRINT SIZES & PRICING
 * Used across: CreatePost, Shop, Profile, Checkout
 * 
 * NOW REDIRECTS TO src/utils/printPricing.js
 */

import {
    getPrintifyProducts,
    calculatePrintifyEarnings,
    getAspectRatioCategory as sourceGetRatio,
    getValidSizesForImage as sourceGetValidSizes
} from '../utils/printifyPricing';

const SOURCE_SIZES = getPrintifyProducts();
const sourceCalc = (retailPrice, sizeId, isUltra) => {
    const res = calculatePrintifyEarnings(retailPrice, sizeId, isUltra);
    return {
        artistEarningsCents: Math.round(res.artistEarnings * 100),
        platformCutCents: Math.round(res.platformEarnings * 100),
        totalCents: Math.round(retailPrice * 100)
    };
};

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

import { printifyApi } from '../services/printifyApi';

export const mockPrintfulAPI = {
    async createProduct(imageUrl, title, sizes) {
        console.log('[Adapter] Creating Printify product via mockPrintfulAPI:', { imageUrl, title, sizes });
        const result = await printifyApi.syncProduct({ imageUrl, title, variants: sizes.map(s => s.id) });
        return {
            productId: result.printifyId,
            syncVariantIds: sizes.map(s => `mock_var_${s.id}_${Date.now()}`)
        };
    },

    async createOrder(variantId, quantity, shippingAddress) {
        console.log('[Adapter] Creating Printify order via mockPrintfulAPI:', { variantId, quantity });
        const result = await printifyApi.submitOrder({ variantId, quantity, address: shippingAddress });
        return {
            orderId: result.orderId,
            status: result.status,
            estimatedShippingDays: 7
        };
    }
};
