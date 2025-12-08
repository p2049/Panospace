/**
 * Pricing Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateEarnings, formatPrice, isValidPrice } from '@/domain/shop/pricing';

describe('calculateEarnings', () => {
    it('should calculate 60/40 split correctly', () => {
        const earnings = calculateEarnings(24.99, '8x10');

        expect(earnings.totalCents).toBe(2499);
        expect(earnings.artistEarningsCents).toBeGreaterThan(0);
        expect(earnings.platformCutCents).toBeGreaterThan(0);
        expect(earnings.artistEarningsCents + earnings.platformCutCents).toBeLessThanOrEqual(
            earnings.totalCents
        );
    });

    it('should handle different sizes', () => {
        const earnings1 = calculateEarnings(24.99, '8x10');
        const earnings2 = calculateEarnings(49.99, '16x20');

        expect(earnings2.artistEarningsCents).toBeGreaterThan(earnings1.artistEarningsCents);
    });

    it('should handle prices above base cost', () => {
        const earnings = calculateEarnings(100, '8x10');

        expect(earnings.artistEarningsCents).toBeGreaterThan(1000);
        expect(earnings.totalCents).toBe(10000);
    });
});

describe('formatPrice', () => {
    it('should format numbers correctly', () => {
        expect(formatPrice(24.99)).toBe('$24.99');
        expect(formatPrice(100)).toBe('$100.00');
        expect(formatPrice(0.99)).toBe('$0.99');
    });

    it('should handle undefined and null', () => {
        expect(formatPrice(undefined)).toBe('$0.00');
        expect(formatPrice(null)).toBe('$0.00');
    });

    it('should handle strings', () => {
        expect(formatPrice('24.99')).toBe('$24.99');
        expect(formatPrice('100')).toBe('$100.00');
    });

    it('should handle invalid values', () => {
        expect(formatPrice('invalid')).toBe('$0.00');
        expect(formatPrice(NaN)).toBe('$0.00');
    });
});

describe('isValidPrice', () => {
    it('should validate positive prices', () => {
        expect(isValidPrice(24.99)).toBe(true);
        expect(isValidPrice(100)).toBe(true);
    });

    it('should reject zero and negative', () => {
        expect(isValidPrice(0)).toBe(false);
        expect(isValidPrice(-10)).toBe(false);
    });

    it('should reject prices above max', () => {
        expect(isValidPrice(1001)).toBe(false);
    });

    it('should validate against base cost', () => {
        expect(isValidPrice(10, '8x10')).toBe(false); // Below base cost of ~$12
        expect(isValidPrice(20, '8x10')).toBe(true); // Above base cost
    });
});
