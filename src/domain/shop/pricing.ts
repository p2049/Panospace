/**
 * LEGACY COMPATIBILITY LAYER
 * 
 * Re-exports from the canonical pricing engine.
 * This file exists for backward compatibility only.
 * New code should import from '@/core/pricing' instead.
 */

import type { PrintSize, Earnings } from '../../types';
import {
    getPrintifyProducts,
    calculatePrintifyEarnings
} from '../../core/pricing';

// Re-export values from the single source of truth
export const PRINT_SIZES: PrintSize[] = getPrintifyProducts() as any;

export const ESTIMATED_BASE_COSTS: Record<string, number> = getPrintifyProducts().reduce((acc, p) => {
    acc[p.id] = p.baseCostCents;
    return acc;
}, {} as Record<string, number>);

/**
 * Calculate earnings for a given retail price
 * Wraps the JS implementation
 */
export function calculateEarnings(retailPriceDollars: number, sizeId?: string, isUltra: boolean = false): Earnings {
    // The JS function signature is (retailPrice, sizeId, isUltra)
    const result = calculatePrintifyEarnings(retailPriceDollars, sizeId || '8x10', isUltra) as {
        artistEarnings: number;
        platformEarnings: number;
        baseCost: number;
        retailPrice: number;
    };

    return {
        artistEarningsCents: Math.round(result.artistEarnings * 100),
        platformCutCents: Math.round(result.platformEarnings * 100),
        totalCents: Math.round(retailPriceDollars * 100)
    };
}

export function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

export function isValidPrice(price: number): boolean {
    return price > 0 && Number.isFinite(price);
}
