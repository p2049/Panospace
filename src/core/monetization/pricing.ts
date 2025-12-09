/**
 * 💸 PANOSPACE MONETIZATION CORE
 * 
 * Single Source of Truth for:
 * - Product Catalog (Printify, Printful, Internal)
 * - Pricing Logic & Revenue Splits
 * - Stripe Configuration Standards
 * - Cart Persistence Utilities
 */

import { PrintSize } from "@/core/types";

// ============================================================================
// 1. CONSTANTS & CONFIGURATION
// ============================================================================

export const MONETIZATION_CONFIG = {
    STRIPE_API_VERSION: '2023-10-16', // Enforce real, recent version
    CURRENCY: 'usd',
    MIN_TRANSACTION_AMOUNT_CENTS: 50,
};

export type ProductType = 'print' | 'sticker' | 'magazine' | 'album' | 'yearbook' | 'digital';

export interface ProductDefinition {
    id: string;
    label: string;
    type: ProductType;
    tier: 'economy' | 'premium' | 'limited' | 'small' | 'medium' | 'large';
    ratio: number; // Aspect ratio
    baseCostCents: number; // Cost in cents (integer) to avoid float issues
    suggestedRetailPrice: number; // Float in dollars (legacy support)
    printifyProviderId?: number;
    printifyBlueprintId?: number;
    dimensions?: { width: number; height: number; unit: 'in' | 'cm' };
}

// ============================================================================
// 2. PRODUCT CATALOG
// ============================================================================

// --- PRINTS (Core Product) ---
export const PRINT_PRODUCTS: ProductDefinition[] = [
    {
        id: '5x7',
        label: '5" × 7"',
        type: 'print',
        tier: 'small',
        ratio: 1.4,
        baseCostCents: 500,
        suggestedRetailPrice: 12.00,
        printifyProviderId: 10,
        printifyBlueprintId: 1001,
        dimensions: { width: 5, height: 7, unit: 'in' }
    },
    {
        id: '8x10',
        label: '8" × 10"',
        type: 'print',
        tier: 'small',
        ratio: 1.25,
        baseCostCents: 650,
        suggestedRetailPrice: 14.40,
        printifyProviderId: 10,
        printifyBlueprintId: 1002,
        dimensions: { width: 8, height: 10, unit: 'in' }
    },
    {
        id: '11x14',
        label: '11" × 14"',
        type: 'print',
        tier: 'small',
        ratio: 1.27,
        baseCostCents: 850,
        suggestedRetailPrice: 19.80,
        printifyProviderId: 10,
        printifyBlueprintId: 1003,
        dimensions: { width: 11, height: 14, unit: 'in' }
    },
    {
        id: '12x18',
        label: '12" × 18"',
        type: 'print',
        tier: 'medium',
        ratio: 1.5,
        baseCostCents: 1000,
        suggestedRetailPrice: 25.20,
        printifyProviderId: 10,
        printifyBlueprintId: 1004,
        dimensions: { width: 12, height: 18, unit: 'in' }
    },
    {
        id: '16x20',
        label: '16" × 20"',
        type: 'print',
        tier: 'medium',
        ratio: 1.25,
        baseCostCents: 1200,
        suggestedRetailPrice: 28.80,
        printifyProviderId: 10,
        printifyBlueprintId: 1005,
        dimensions: { width: 16, height: 20, unit: 'in' }
    },
    {
        id: '18x24',
        label: '18" × 24"',
        type: 'print',
        tier: 'medium',
        ratio: 1.33,
        baseCostCents: 1450,
        suggestedRetailPrice: 37.80,
        printifyProviderId: 10,
        printifyBlueprintId: 1006,
        dimensions: { width: 18, height: 24, unit: 'in' }
    },
    {
        id: '24x36',
        label: '24" × 36"',
        type: 'print',
        tier: 'large',
        ratio: 1.5,
        baseCostCents: 2200,
        suggestedRetailPrice: 52.20,
        printifyProviderId: 10,
        printifyBlueprintId: 1007,
        dimensions: { width: 24, height: 36, unit: 'in' }
    },
    // Common additional sizes
    {
        id: '4x6',
        label: '4" × 6"',
        type: 'print',
        tier: 'small',
        ratio: 1.5,
        baseCostCents: 800,
        suggestedRetailPrice: 14.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1008,
        dimensions: { width: 4, height: 6, unit: 'in' }
    },
    {
        id: '20x30',
        label: '20" × 30"',
        type: 'print',
        tier: 'large',
        ratio: 1.5,
        baseCostCents: 3200,
        suggestedRetailPrice: 74.99,
        printifyProviderId: 10,
        printifyBlueprintId: 1010,
        dimensions: { width: 20, height: 30, unit: 'in' }
    }
];

// --- STICKERS ---
export const STICKER_PRODUCTS: ProductDefinition[] = [
    {
        id: 'sticker_3x3',
        label: '3" × 3" Sticker',
        type: 'sticker',
        tier: 'small',
        ratio: 1.0,
        baseCostCents: 180,
        suggestedRetailPrice: 3.50,
        printifyProviderId: 20,
        printifyBlueprintId: 2001,
        dimensions: { width: 3, height: 3, unit: 'in' }
    },
    {
        id: 'sticker_4x4',
        label: '4" × 4" Sticker',
        type: 'sticker',
        tier: 'small',
        ratio: 1.0,
        baseCostCents: 220,
        suggestedRetailPrice: 5.00,
        printifyProviderId: 20,
        printifyBlueprintId: 2002,
        dimensions: { width: 4, height: 4, unit: 'in' }
    }
];

// --- FUTURE PRODUCTS (Magazines, Albums, Yearbooks) ---
export const PUBLICATION_PRODUCTS: ProductDefinition[] = [
    {
        id: 'magazine_standard_a4',
        label: 'Standard A4 Magazine',
        type: 'magazine',
        tier: 'premium',
        ratio: 1.41,
        baseCostCents: 1200, // Placeholder
        suggestedRetailPrice: 25.00,
        dimensions: { width: 210, height: 297, unit: 'cm' } // Roughly
    },
    {
        id: 'album_hardcover_10x10',
        label: 'Hardcover Album 10x10',
        type: 'album',
        tier: 'limited',
        ratio: 1.0,
        baseCostCents: 4500,
        suggestedRetailPrice: 85.00,
        dimensions: { width: 10, height: 10, unit: 'in' }
    }
];

// Unified Catalog
export const CATALOG: Record<string, ProductDefinition> = [
    ...PRINT_PRODUCTS,
    ...STICKER_PRODUCTS,
    ...PUBLICATION_PRODUCTS
].reduce((acc, product) => {
    acc[product.id] = product;
    return acc;
}, {} as Record<string, ProductDefinition>);


// ============================================================================
// 3. REVENUE & EARNINGS LOGIC
// ============================================================================

export interface EarningsBreakdown {
    baseCostCents: number;
    retailPriceCents: number;
    platformFeeCents: number;
    creatorProfitCents: number;
    platformFeePercent: number;
    creatorProfitPercent: number;
}

/**
 * Standardized Revenue Share Calculation
 */
export const calculateRevenueShare = (
    retailPriceCents: number,
    baseCostCents: number,
    isUltraUser: boolean = false
): EarningsBreakdown => {
    // 1. Calculate Gross Profit
    const grossProfitCents = Math.max(0, retailPriceCents - baseCostCents);

    // 2. Determine Split Rates
    // Standard: 60% to Creator, 40% to Platform (of profit)
    // Ultra: 75% to Creator, 25% to Platform (of profit)
    const creatorRate = isUltraUser ? 0.75 : 0.60;
    const platformRate = 1.0 - creatorRate;

    // 3. Calculate Shares
    const creatorProfitCents = Math.round(grossProfitCents * creatorRate);
    const platformFeeCents = grossProfitCents - creatorProfitCents; // Remainder ensures checksum

    return {
        baseCostCents,
        retailPriceCents,
        platformFeeCents,
        creatorProfitCents,
        platformFeePercent: Number((platformRate * 100).toFixed(1)),
        creatorProfitPercent: Number((creatorRate * 100).toFixed(1))
    };
};

/**
 * Get Pricing and Earnings for a specific product definition
 */
export const getProductPricing = (productId: string, retailPriceDollars: number, isUltraUser: boolean = false) => {
    const product = CATALOG[productId];
    if (!product) {
        throw new Error(`Product ID ${productId} not found in catalog.`);
    }

    const retailCents = Math.round(retailPriceDollars * 100);
    return calculateRevenueShare(retailCents, product.baseCostCents, isUltraUser);
};


// ============================================================================
// 4. CHECKOUT STATE PERSISTENCE
// ============================================================================

const CART_STORAGE_KEY = 'panospace_cart_v1';

export const saveCartState = (cartItems: any[]) => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
                timestamp: Date.now(),
                items: cartItems
            }));
        }
    } catch (e) {
        console.error('Failed to save cart state:', e);
    }
};

export const loadCartState = (): any[] | null => {
    try {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem(CART_STORAGE_KEY);
            if (!data) return null;

            const parsed = JSON.parse(data);
            // Optional: Check expiration (e.g., 24 hours)
            if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(CART_STORAGE_KEY);
                return null;
            }
            return parsed.items;
        }
    } catch (e) {
        console.error('Failed to load cart state:', e);
    }
    return null;
};

// ============================================================================
// 5. HELPER UTILITIES
// ============================================================================

export const getPrintifyProducts = () => PRINT_PRODUCTS;

export const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: MONETIZATION_CONFIG.CURRENCY
    }).format(cents / 100);
};

export const isValidTransaction = (amountCents: number) => {
    return amountCents >= MONETIZATION_CONFIG.MIN_TRANSACTION_AMOUNT_CENTS;
};
