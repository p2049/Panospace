/**
 * PANOSPACE BASE PRICING
 * 
 * Core functions for calculating individual product prices, costs, and earnings.
 */

import { PRINTIFY_PRODUCTS, STICKER_PRODUCTS } from './productCatalog';
import { applyTierMultiplier, getArtistShare } from './tierModifiers';

/**
 * Get the base cost for a specific size and type (tier)
 * @param {string} sizeId - The ID of the size
 * @param {string} type - 'economy' or 'premium'
 * @returns {number} Base cost in dollars
 */
export const getPrintifyBasePrice = (sizeId, type = 'economy') => {
    const product = PRINTIFY_PRODUCTS.find(p => p.id === sizeId);
    if (!product) return 0;

    const baseCost = product.baseCostCents / 100;
    return applyTierMultiplier(baseCost, type);
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

    return applyTierMultiplier(product.price, type);
};

/**
 * Calculate earnings for a given retail price
 * @param {number} retailPrice - Retail price in dollars
 * @param {string} sizeId - Size ID
 * @param {boolean} isUltra - Is user Ultra member
 * @returns {Object} Earnings breakdown
 */
export const calculateEarnings = (retailPrice, sizeId, isUltra = false) => {
    const product = PRINTIFY_PRODUCTS.find(p => p.id === sizeId);
    const baseCost = product ? product.baseCostCents / 100 : 15.00; // Default fallback

    const profit = Math.max(0, retailPrice - baseCost);
    const artistShare = getArtistShare(isUltra);

    return {
        artistEarnings: profit * artistShare,
        platformEarnings: profit * (1 - artistShare),
        baseCost: baseCost,
        retailPrice: retailPrice
    };
};

// Alias for backward compatibility
export const calculatePrintifyEarnings = calculateEarnings;

export const calculateTieredPricing = (sizeId, tier = 'economy', isUltra = false) => {
    const retailPrice = getRetailPrice(sizeId, tier);
    const earnings = calculateEarnings(retailPrice, sizeId, isUltra);
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

// Helper for aspect ratio
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
