/**
 * Shop System Unit Tests
 * Tests size filtering, normalization, and pricing calculations
 */

import { describe, it, expect } from '@jest/globals';

// Mock PRINT_SIZES from printfulApi
const PRINT_SIZES = [
    { id: '8x10', label: '8" × 10"', price: 15 },
    { id: '11x14', label: '11" × 14"', price: 25 },
    { id: '16x20', label: '16" × 20"', price: 35 },
    { id: '18x24', label: '18" × 24"', price: 45 },
    { id: '24x36', label: '24" × 36"', price: 65 }
];

// Shop helper functions (extracted from components for testing)
export function normalizePrintSizes(printSizes) {
    const validSizeIds = PRINT_SIZES.map(s => s.id);
    return (printSizes || []).filter(size => validSizeIds.includes(size.id))
        .map(size => {
            const configSize = PRINT_SIZES.find(s => s.id === size.id);
            return {
                ...size,
                label: configSize?.label || size.label
            };
        });
}

export function calculateMinPrice(printSizes) {
    if (!printSizes || printSizes.length === 0) return 0;
    return Math.min(...printSizes.map(s => s.price));
}

export function calculateArtistEarnings(price, platformCut = 0.40) {
    return price * (1 - platformCut);
}

export function filterShopItems(shopItems) {
    return shopItems.filter(item => {
        const validSizes = normalizePrintSizes(item.printSizes);
        return validSizes.length > 0;
    }).map(item => ({
        ...item,
        printSizes: normalizePrintSizes(item.printSizes)
    }));
}

describe('Shop System - Size Normalization', () => {
    it('should filter out invalid print sizes', () => {
        const input = [
            { id: '8x10', price: 15, label: '8x10"' },
            { id: '5x7', price: 10, label: '5x7"' }, // Invalid
            { id: '11x14', price: 25, label: '11x14"' },
            { id: 'custom-size', price: 50, label: 'Custom' } // Invalid
        ];

        const result = normalizePrintSizes(input);

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('8x10');
        expect(result[1].id).toBe('11x14');
    });

    it('should keep all valid sizes', () => {
        const input = [
            { id: '8x10', price: 15 },
            { id: '11x14', price: 25 },
            { id: '16x20', price: 35 },
            { id: '18x24', price: 45 },
            { id: '24x36', price: 65 }
        ];

        const result = normalizePrintSizes(input);

        expect(result).toHaveLength(5);
    });

    it('should handle empty array', () => {
        const result = normalizePrintSizes([]);
        expect(result).toHaveLength(0);
    });

    it('should handle null/undefined', () => {
        expect(normalizePrintSizes(null)).toHaveLength(0);
        expect(normalizePrintSizes(undefined)).toHaveLength(0);
    });

    it('should normalize labels from config', () => {
        const input = [
            { id: '8x10', price: 15, label: 'Wrong Label' }
        ];

        const result = normalizePrintSizes(input);

        expect(result[0].label).toBe('8" × 10"');
    });
});

describe('Shop System - Price Calculations', () => {
    it('should calculate minimum price correctly', () => {
        const sizes = [
            { id: '8x10', price: 15 },
            { id: '11x14', price: 25 },
            { id: '24x36', price: 65 }
        ];

        const minPrice = calculateMinPrice(sizes);
        expect(minPrice).toBe(15);
    });

    it('should handle single size', () => {
        const sizes = [{ id: '8x10', price: 15 }];
        expect(calculateMinPrice(sizes)).toBe(15);
    });

    it('should return 0 for empty array', () => {
        expect(calculateMinPrice([])).toBe(0);
        expect(calculateMinPrice(null)).toBe(0);
    });

    it('should calculate 60/40 split correctly', () => {
        const price = 100;
        const artistEarnings = calculateArtistEarnings(price, 0.40);

        expect(artistEarnings).toBe(60); // Artist gets 60%
    });

    it('should handle decimal prices', () => {
        const price = 45.99;
        const artistEarnings = calculateArtistEarnings(price, 0.40);

        expect(artistEarnings).toBeCloseTo(27.59, 2);
    });
});

describe('Shop System - Item Filtering', () => {
    it('should filter out items with no valid sizes', () => {
        const items = [
            {
                id: 'item1',
                title: 'Valid Item',
                printSizes: [
                    { id: '8x10', price: 15 },
                    { id: '11x14', price: 25 }
                ]
            },
            {
                id: 'item2',
                title: 'Invalid Item',
                printSizes: [
                    { id: 'invalid-size', price: 10 },
                    { id: 'another-invalid', price: 20 }
                ]
            },
            {
                id: 'item3',
                title: 'Mixed Item',
                printSizes: [
                    { id: '16x20', price: 35 },
                    { id: 'invalid', price: 15 }
                ]
            }
        ];

        const filtered = filterShopItems(items);

        expect(filtered).toHaveLength(2); // item1 and item3
        expect(filtered[0].id).toBe('item1');
        expect(filtered[0].printSizes).toHaveLength(2);
        expect(filtered[1].id).toBe('item3');
        expect(filtered[1].printSizes).toHaveLength(1); // Only valid size
    });

    it('should normalize sizes in filtered items', () => {
        const items = [
            {
                id: 'item1',
                printSizes: [
                    { id: '8x10', price: 15, label: 'Old Label' }
                ]
            }
        ];

        const filtered = filterShopItems(items);

        expect(filtered[0].printSizes[0].label).toBe('8" × 10"');
    });
});

describe('Shop System - Edge Cases', () => {
    it('should handle items with empty printSizes array', () => {
        const items = [
            { id: 'item1', printSizes: [] }
        ];

        const filtered = filterShopItems(items);
        expect(filtered).toHaveLength(0);
    });

    it('should handle items with null printSizes', () => {
        const items = [
            { id: 'item1', printSizes: null }
        ];

        const filtered = filterShopItems(items);
        expect(filtered).toHaveLength(0);
    });

    it('should preserve other item properties', () => {
        const items = [
            {
                id: 'item1',
                title: 'Test Item',
                description: 'Test Description',
                imageUrl: 'https://example.com/image.jpg',
                authorId: 'user123',
                printSizes: [{ id: '8x10', price: 15 }]
            }
        ];

        const filtered = filterShopItems(items);

        expect(filtered[0].title).toBe('Test Item');
        expect(filtered[0].description).toBe('Test Description');
        expect(filtered[0].imageUrl).toBe('https://example.com/image.jpg');
        expect(filtered[0].authorId).toBe('user123');
    });
});

describe('Shop System - Regression Tests', () => {
    it('should not allow sizes not in PRINT_SIZES config', () => {
        // This prevents legacy/invalid sizes from breaking the shop
        const legacySizes = [
            { id: '4x6', price: 8 },
            { id: '5x7', price: 10 },
            { id: '12x18', price: 30 }
        ];

        const result = normalizePrintSizes(legacySizes);
        expect(result).toHaveLength(0);
    });

    it('should handle duplicate size IDs', () => {
        const duplicates = [
            { id: '8x10', price: 15 },
            { id: '8x10', price: 20 } // Duplicate
        ];

        const result = normalizePrintSizes(duplicates);
        // Both should pass through (normalization doesn't dedupe)
        expect(result).toHaveLength(2);
    });
});
