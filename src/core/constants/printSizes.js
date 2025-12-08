import { getPrintifyProducts, PRINT_TIERS, STICKER_PRODUCTS, calculatePrintifyEarnings, getRetailPrice } from '@/core/utils/printifyPricing';

export const PRINT_SIZES = getPrintifyProducts();
export { PRINT_TIERS };
export const STICKER_SIZES = STICKER_PRODUCTS;

export const calculateTieredPricing = (sizeId, tier, isUltra) => {
    const retailPrice = getRetailPrice(sizeId, tier);
    const earnings = calculatePrintifyEarnings(retailPrice, sizeId, isUltra);
    if (!earnings) return null;
    return {
        finalPrice: retailPrice,
        artistProfit: earnings.artistEarnings,
        platformProfit: earnings.platformEarnings,
        baseCost: earnings.baseCost,
        label: PRINT_SIZES.find(s => s.id === sizeId)?.label
    };
};

export const calculateStickerPricing = (stickerId) => {
    const sticker = STICKER_PRODUCTS.find(s => s.id === stickerId);
    if (!sticker) return null;
    const earnings = calculatePrintifyEarnings(sticker.price, stickerId);
    return {
        finalPrice: sticker.price,
        artistProfit: earnings.artistEarnings,
        platformProfit: earnings.platformEarnings,
        baseCost: earnings.baseCost,
        label: sticker.label
    };
};
