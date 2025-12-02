/**
 * Pricing & Earnings Calculations
 * 
 * Centralized logic for print sizes, pricing, and profit splits.
 * Used by both frontend and Cloud Functions to ensure consistency.
 */

import type { PrintSize, Earnings } from '../../types';

/**
 * Print size database with base pricing
 * These are the default prices; users can set custom prices
 */
export const PRINT_SIZES: PrintSize[] = [
    {
        id: '5x7',
        label: '5x7"',
        price: 19.99,
        artistEarningsCents: 0,  // Calculated dynamically
        platformFeeCents: 0,
        baseCostCents: 800,
    },
    {
        id: '8x10',
        label: '8x10"',
        price: 24.99,
        artistEarningsCents: 0,
        platformFeeCents: 0,
        baseCostCents: 1200,
    },
    {
        id: '11x14',
        label: '11x14"',
        price: 34.99,
        artistEarningsCents: 0,
        platformFeeCents: 0,
        baseCostCents: 1800,
    },
    {
        id: '16x20',
        label: '16x20"',
        price: 49.99,
        artistEarningsCents: 0,
        platformFeeCents: 0,
        baseCostCents: 2800,
    },
    {
        id: '18x24',
        label: '18x24"',
        price: 59.99,
        artistEarningsCents: 0,
        platformFeeCents: 0,
        baseCostCents: 3500,
    },
    {
        id: '24x36',
        label: '24x36"',
        price: 89.99,
        artistEarningsCents: 0,
        platformFeeCents: 0,
        baseCostCents: 5500,
    },
];

/**
 * Estimated base costs for each size (what we pay Printful)
 * Used for profit calculations
 */
export const ESTIMATED_BASE_COSTS: Record<string, number> = {
    '5x7': 800,    // $8.00
    '8x10': 1200,  // $12.00
    '11x14': 1800, // $18.00
    '16x20': 2800, // $28.00
    '18x24': 3500, // $35.00
    '24x36': 5500, // $55.00
};

/**
 * Platform revenue split
 * Artist gets 60%, platform gets 40% of profit above base cost
 */
const ARTIST_SHARE = 0.6;
const PLATFORM_SHARE = 0.4;

/**
 * Calculate earnings split for a given retail price
 * 
 * @param retailPriceDollars - Retail price in dollars (e.g., 24.99)
 * @param sizeId - Print size ID (optional, for more accurate calculations)
 * @returns Earnings breakdown in cents
 * 
 * @example
 * const earnings = calculateEarnings(24.99, '8x10');
 * // Returns: { artistEarningsCents: 780, platformCutCents: 519, totalCents: 2499 }
 */
export function calculateEarnings(
    retailPriceDollars: number,
    sizeId?: string,
    isUltra: boolean = false
): Earnings {
    const totalCents = Math.round(retailPriceDollars * 100);

    // Get estimated base cost
    const baseCostCents = sizeId
        ? ESTIMATED_BASE_COSTS[sizeId] || 1500
        : 1500;  // Default fallback

    // Calculate profit above base cost
    const profitCents = Math.max(0, totalCents - baseCostCents);

    // Split profit between artist and platform
    // Ultra users get 75%, standard users get 60%
    const artistShare = isUltra ? 0.75 : ARTIST_SHARE;
    const platformShare = 1 - artistShare;

    const artistEarningsCents = Math.round(profitCents * artistShare);
    const platformCutCents = Math.round(profitCents * platformShare);

    return {
        artistEarningsCents,
        platformCutCents,
        totalCents,
    };
}

/**
 * Format price for display
 * 
 * @param price - Price as number or string
 * @returns Formatted price string (e.g., "$24.99")
 */
export function formatPrice(price: number | string | undefined | null): string {
    let numPrice = Number(price);
    if (isNaN(numPrice)) numPrice = 0;
    return `$${numPrice.toFixed(2)}`;
}

/**
 * Format price without dollar sign (for inputs)
 */
export function formatPriceNumber(price: number | string | undefined | null): string {
    let numPrice = Number(price);
    if (isNaN(numPrice)) numPrice = 0;
    return numPrice.toFixed(2);
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
    return cents / 100;
}

/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars: number): number {
    return Math.round(dollars * 100);
}

/**
 * Validate price is within acceptable range
 */
export function isValidPrice(price: number, sizeId?: string): boolean {
    if (price <= 0) return false;
    if (price > 1000) return false;  // Max $1000

    // Price must be above base cost
    if (sizeId) {
        const baseCostCents = ESTIMATED_BASE_COSTS[sizeId];
        if (baseCostCents && price * 100 < baseCostCents) {
            return false;
        }
    }

    return true;
}

/**
 * Get default print sizes (all available)
 */
export function getDefaultPrintSizes(): string[] {
    return PRINT_SIZES.map(size => size.id);
}

/**
 * Get print size by ID
 */
export function getPrintSizeById(id: string): PrintSize | undefined {
    return PRINT_SIZES.find(size => size.id === id);
}
