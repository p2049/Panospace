/**
 * Shared Configuration for Print Sizes and Pricing
 * 
 * SINGLE SOURCE OF TRUTH for all print-related configuration
 * Used by both frontend and backend to ensure consistency
 */

// Platform revenue split (40% to platform, 60% to artist)
export const PLATFORM_CUT_PERCENTAGE = 0.40;
export const ARTIST_CUT_PERCENTAGE = 0.60;

/**
 * Print Sizes Configuration
 * These must match your actual Printful/POD catalog
 */
export interface PrintSizeConfig {
    id: string;
    label: string;
    defaultPrice: number; // Retail price in dollars
    baseCostCents: number; // POD cost in cents
}

export const PRINT_SIZES: PrintSizeConfig[] = [
    {
        id: '8x10',
        label: '8x10"',
        defaultPrice: 24.99,
        baseCostCents: 1200 // $12.00
    },
    {
        id: '11x14',
        label: '11x14"',
        defaultPrice: 34.99,
        baseCostCents: 1800 // $18.00
    },
    {
        id: '16x20',
        label: '16x20"',
        defaultPrice: 49.99,
        baseCostCents: 2800 // $28.00
    },
    {
        id: '18x24',
        label: '18x24"',
        defaultPrice: 59.99,
        baseCostCents: 3500 // $35.00
    },
    {
        id: '24x36',
        label: '24x36"',
        defaultPrice: 79.99,
        baseCostCents: 5500 // $55.00
    }
];

/**
 * Get base cost for a size
 */
export function getBaseCost(sizeId: string): number {
    const size = PRINT_SIZES.find(s => s.id === sizeId);
    return size ? size.baseCostCents : 1500; // Default fallback
}

/**
 * Calculate earnings split from a retail price
 */
export function calculateEarnings(retailPriceDollars: number): {
    artistEarningsCents: number;
    platformCutCents: number;
    totalCents: number;
    baseCostCents: number;
} {
    const totalCents = Math.round(retailPriceDollars * 100);

    // For now, use a simple percentage split of total
    // More sophisticated: (retail - baseCost) * split + baseCost
    const platformCutCents = Math.round(totalCents * PLATFORM_CUT_PERCENTAGE);
    const artistEarningsCents = totalCents - platformCutCents;

    return {
        artistEarningsCents,
        platformCutCents,
        totalCents,
        baseCostCents: 0 // Would need sizeId to calculate
    };
}

/**
 * Calculate earnings with base cost consideration
 */
export function calculateEarningsWithBaseCost(
    retailPriceDollars: number,
    sizeId: string
): {
    artistEarningsCents: number;
    platformCutCents: number;
    totalCents: number;
    baseCostCents: number;
    profitCents: number;
} {
    const totalCents = Math.round(retailPriceDollars * 100);
    const baseCostCents = getBaseCost(sizeId);
    const profitCents = Math.max(0, totalCents - baseCostCents);

    // Split profit between artist and platform
    const artistEarningsCents = Math.round(profitCents * ARTIST_CUT_PERCENTAGE);
    const platformCutCents = Math.round(profitCents * PLATFORM_CUT_PERCENTAGE);

    return {
        artistEarningsCents,
        platformCutCents,
        totalCents,
        baseCostCents,
        profitCents
    };
}
