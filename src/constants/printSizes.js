// ✅ TIERED PRICING MODEL - Economy vs Premium
// 
// Pricing Rules:
// ECONOMY:
// - Final Price = 90% of Redbubble price
// - Artist Profit = 25% of Printify base cost
// - Platform Profit = Remainder
//
// PREMIUM:
// - Artist Profit = 25% of Printify base cost
// - Premium Markup = (Base + ArtistProfit) * 1.7
// - Final Price = MAX(Premium Markup, 90% of Redbubble Premium)
// - Platform Profit = Remainder

export const PRINT_TIERS = {
    ECONOMY: 'economy',
    PREMIUM: 'premium'
};

export const PRINT_SIZES = [
    {
        id: '8x10',
        label: '8" × 10"',
        tier: 'small',
        // Economy Data (Standard Paper)
        economy: {
            baseCost: 6.50,      // Printify/Printful est.
            redbubblePrice: 16.00
        },
        // Premium Data (Giclée / Fine Art)
        premium: {
            baseCost: 10.50,
            redbubblePrice: 24.00
        }
    },
    {
        id: '11x14',
        label: '11" × 14"',
        tier: 'small',
        economy: {
            baseCost: 8.50,
            redbubblePrice: 22.00
        },
        premium: {
            baseCost: 14.00,
            redbubblePrice: 32.00
        }
    },
    {
        id: '16x20',
        label: '16" × 20"',
        tier: 'medium',
        economy: {
            baseCost: 12.00,
            redbubblePrice: 32.00
        },
        premium: {
            baseCost: 22.00,
            redbubblePrice: 48.00
        }
    },
    {
        id: '18x24',
        label: '18" × 24"',
        tier: 'medium',
        economy: {
            baseCost: 14.50,
            redbubblePrice: 42.00
        },
        premium: {
            baseCost: 28.00,
            redbubblePrice: 65.00
        }
    },
    {
        id: '24x36',
        label: '24" × 36"',
        tier: 'large',
        economy: {
            baseCost: 22.00,
            redbubblePrice: 58.00
        },
        premium: {
            baseCost: 42.00,
            redbubblePrice: 95.00
        }
    }
];

export const STICKER_SIZES = [
    {
        id: 'sticker_3x3',
        label: '3" × 3" Sticker',
        baseCost: 1.80,
        redbubblePrice: 3.50
    },
    {
        id: 'sticker_4x4',
        label: '4" × 4" Sticker',
        baseCost: 2.20,
        redbubblePrice: 5.00
    }
];

/**
 * Calculate pricing breakdown for a specific size and tier
 * @param {string} sizeId - The ID of the size (e.g., '8x10')
 * @param {string} tier - 'economy' or 'premium'
 * @returns {object} Pricing breakdown
 */
export const calculateTieredPricing = (sizeId, tier = PRINT_TIERS.ECONOMY, isUltra = false) => {
    const sizeDef = PRINT_SIZES.find(s => s.id === sizeId);
    if (!sizeDef) return null;

    const data = sizeDef[tier];
    if (!data) return null;

    const baseCost = data.baseCost;

    // Standard markup for pricing calculation (keeps retail price consistent)
    const standardMarkup = baseCost * 0.25;

    let finalPrice = 0;

    if (tier === PRINT_TIERS.ECONOMY) {
        // Economy Rule: 90% of Redbubble
        finalPrice = data.redbubblePrice * 0.90;
    } else {
        // Premium Rule: (Base + StandardMarkup) * 1.7 OR 90% of RB Premium
        const markupPrice = (baseCost + standardMarkup) * 1.7;
        const rbCompPrice = data.redbubblePrice * 0.90;
        finalPrice = Math.max(markupPrice, rbCompPrice);
    }

    // Profit Split Logic
    const totalProfit = Math.max(0, finalPrice - baseCost);
    const artistShare = isUltra ? 0.75 : 0.60; // 75% for Ultra, 60% for Standard

    const artistProfit = totalProfit * artistShare;
    const platformProfit = totalProfit * (1 - artistShare);

    return {
        sizeId,
        label: sizeDef.label,
        tier,
        baseCost,
        finalPrice,
        artistProfit,
        platformProfit,
        redbubblePrice: data.redbubblePrice,
        savings: data.redbubblePrice - finalPrice
    };
};

/**
 * Calculate pricing for stickers (Economy logic only)
 */
export const calculateStickerPricing = (stickerId) => {
    const stickerDef = STICKER_SIZES.find(s => s.id === stickerId);
    if (!stickerDef) return null;

    const baseCost = stickerDef.baseCost;
    const artistProfit = baseCost * 0.25;
    const finalPrice = stickerDef.redbubblePrice * 0.90;
    const platformProfit = finalPrice - (baseCost + artistProfit);

    // Only return if profitable
    if (platformProfit < 0.10) return null;

    return {
        id: stickerId,
        label: stickerDef.label,
        tier: 'sticker',
        baseCost,
        finalPrice,
        artistProfit,
        platformProfit,
        redbubblePrice: stickerDef.redbubblePrice
    };
};

// Legacy compatibility wrapper
export const calculateEarnings = (retailPrice, baseCost = 0) => {
    // This is just a fallback for old code calling this function directly
    // New code should use calculateTieredPricing
    return {
        artistEarnings: 0,
        platformEarnings: 0,
        artistEarningsCents: 0,
        platformCutCents: 0
    };
};

// Helper to get all valid sizes for an image (simple aspect ratio check)
export const getValidSizesForImage = (width, height) => {
    if (!width || !height) return PRINT_SIZES;
    // For now, return all sizes to avoid blocking users. 
    // Real implementation would check aspect ratio overlap.
    return PRINT_SIZES;
};

