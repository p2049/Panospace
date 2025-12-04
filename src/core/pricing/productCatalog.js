/**
 * PANOSPACE PRODUCT CATALOG
 * 
 * Centralized definition of all physical products available for sale.
 * Includes dimensions, base costs, and provider mappings.
 */

export const PRINT_TIERS = {
    ECONOMY: 'economy',
    PREMIUM: 'premium',
    LIMITED: 'limited'
};

export const PRINTIFY_PRODUCTS = [
    {
        id: '5x7',
        label: '5" × 7"',
        tier: 'small',
        ratio: 1.4, // 7/5
        price: 12.00,
        baseCostCents: 500,
        printifyProviderId: 10, // Placeholder
        printifyBlueprintId: 1001 // Placeholder
    },
    {
        id: '8x10',
        label: '8" × 10"',
        tier: 'small',
        ratio: 1.25,
        price: 14.40,
        baseCostCents: 650,
        printifyProviderId: 10,
        printifyBlueprintId: 1002
    },
    {
        id: '11x14',
        label: '11" × 14"',
        tier: 'small',
        ratio: 1.27,
        price: 19.80,
        baseCostCents: 850,
        printifyProviderId: 10,
        printifyBlueprintId: 1003
    },
    {
        id: '12x18',
        label: '12" × 18"',
        tier: 'medium',
        ratio: 1.5,
        price: 25.20,
        baseCostCents: 1000,
        printifyProviderId: 10,
        printifyBlueprintId: 1004
    },
    {
        id: '16x20',
        label: '16" × 20"',
        tier: 'medium',
        ratio: 1.25,
        price: 28.80,
        baseCostCents: 1200,
        printifyProviderId: 10,
        printifyBlueprintId: 1005
    },
    {
        id: '18x24',
        label: '18" × 24"',
        tier: 'medium',
        ratio: 1.33,
        price: 37.80,
        baseCostCents: 1450,
        printifyProviderId: 10,
        printifyBlueprintId: 1006
    },
    {
        id: '24x36',
        label: '24" × 36"',
        tier: 'large',
        ratio: 1.5,
        price: 52.20,
        baseCostCents: 2200,
        printifyProviderId: 10,
        printifyBlueprintId: 1007
    },
    // Additional sizes from legacy config
    {
        id: '4x6',
        label: '4" × 6"',
        tier: 'small',
        ratio: 1.5,
        price: 14.99,
        baseCostCents: 800,
        printifyProviderId: 10,
        printifyBlueprintId: 1008
    },
    {
        id: '8x12',
        label: '8" × 12"',
        tier: 'small',
        ratio: 1.5,
        price: 26.99,
        baseCostCents: 1400,
        printifyProviderId: 10,
        printifyBlueprintId: 1009
    },
    {
        id: '20x30',
        label: '20" × 30"',
        tier: 'large',
        ratio: 1.5,
        price: 74.99,
        baseCostCents: 3200,
        printifyProviderId: 10,
        printifyBlueprintId: 1010
    },
    {
        id: '6x8',
        label: '6" × 8"',
        tier: 'small',
        ratio: 1.33,
        price: 19.99,
        baseCostCents: 1000,
        printifyProviderId: 10,
        printifyBlueprintId: 1011
    },
    {
        id: '9x12',
        label: '9" × 12"',
        tier: 'small',
        ratio: 1.33,
        price: 29.99,
        baseCostCents: 1500,
        printifyProviderId: 10,
        printifyBlueprintId: 1012
    },
    {
        id: '12x16',
        label: '12" × 16"',
        tier: 'medium',
        ratio: 1.33,
        price: 39.99,
        baseCostCents: 1900,
        printifyProviderId: 10,
        printifyBlueprintId: 1013
    },
    {
        id: '8x8',
        label: '8" × 8"',
        tier: 'small',
        ratio: 1.0,
        price: 22.99,
        baseCostCents: 1100,
        printifyProviderId: 10,
        printifyBlueprintId: 1014
    },
    {
        id: '10x10',
        label: '10" × 10"',
        tier: 'small',
        ratio: 1.0,
        price: 26.99,
        baseCostCents: 1300,
        printifyProviderId: 10,
        printifyBlueprintId: 1015
    },
    {
        id: '12x12',
        label: '12" × 12"',
        tier: 'medium',
        ratio: 1.0,
        price: 34.99,
        baseCostCents: 1700,
        printifyProviderId: 10,
        printifyBlueprintId: 1016
    },
    {
        id: '16x16',
        label: '16" × 16"',
        tier: 'medium',
        ratio: 1.0,
        price: 49.99,
        baseCostCents: 2300,
        printifyProviderId: 10,
        printifyBlueprintId: 1017
    },
    {
        id: '20x20',
        label: '20" × 20"',
        tier: 'large',
        ratio: 1.0,
        price: 64.99,
        baseCostCents: 3000,
        printifyProviderId: 10,
        printifyBlueprintId: 1018
    },
    {
        id: '8x14',
        label: '8" × 14"',
        tier: 'small',
        ratio: 1.78,
        price: 29.99,
        baseCostCents: 1500,
        printifyProviderId: 10,
        printifyBlueprintId: 1019
    },
    {
        id: '12x21',
        label: '12" × 21"',
        tier: 'medium',
        ratio: 1.78,
        price: 46.99,
        baseCostCents: 2100,
        printifyProviderId: 10,
        printifyBlueprintId: 1020
    },
    {
        id: '16x28',
        label: '16" × 28"',
        tier: 'large',
        ratio: 1.78,
        price: 64.99,
        baseCostCents: 2900,
        printifyProviderId: 10,
        printifyBlueprintId: 1021
    }
];

export const STICKER_PRODUCTS = [
    {
        id: 'sticker_3x3',
        label: '3" × 3" Sticker',
        baseCost: 1.80,
        price: 3.50,
        printifyProviderId: 20,
        printifyBlueprintId: 2001
    },
    {
        id: 'sticker_4x4',
        label: '4" × 4" Sticker',
        baseCost: 2.20,
        price: 5.00,
        printifyProviderId: 20,
        printifyBlueprintId: 2002
    }
];

// Compatibility alias
export const PRINT_SIZES = PRINTIFY_PRODUCTS;
export const STICKER_SIZES = STICKER_PRODUCTS;

/**
 * Get all available Printify products/sizes
 * @returns {Array} List of products
 */
export const getPrintifyProducts = () => {
    return PRINTIFY_PRODUCTS;
};
