import type { PrintSize, Earnings } from '../../types';
import {
    PRINT_SIZES as JS_PRINT_SIZES,
    ESTIMATED_BASE_COSTS as JS_COSTS,
    calculateEarnings as jsCalculateEarnings
} from '../../utils/printPricing';

// Re-export values from the single source of truth (JS file)
// We cast to 'any' first to avoid TS errors, then to the correct type
export const PRINT_SIZES: PrintSize[] = JS_PRINT_SIZES as any;

export const ESTIMATED_BASE_COSTS: Record<string, number> = JS_COSTS;

/**
 * Calculate earnings for a given retail price
 * Wraps the JS implementation
 */
export function calculateEarnings(retailPriceDollars: number, sizeId?: string, isUltra: boolean = false): Earnings {
    // The JS function signature is (retailPrice, sizeIdOrBaseCost, isUltra)
    // We pass sizeId as the second argument
    const result = (jsCalculateEarnings as any)(retailPriceDollars, sizeId, isUltra);

    return {
        artistEarningsCents: result.artistEarningsCents,
        platformCutCents: result.platformCutCents,
        totalCents: result.totalCents
    };
}

export function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

export function isValidPrice(price: number): boolean {
    return price > 0 && Number.isFinite(price);
}
