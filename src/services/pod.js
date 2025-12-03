import { getPrintifyProducts, calculatePrintifyEarnings } from '../utils/printifyPricing';

// Re-export from single source of truth
export const PRINT_SIZES = getPrintifyProducts();

// Adapter for calculatePrice to match old signature if needed, 
// or just use calculateEarnings logic
export const calculatePrice = (basePrice, markup = 30) => {
    // This seems to be a different calculation than calculateEarnings.
    // The original code was:
    // const price = basePrice * (1 + markup / 100);
    // return Math.ceil(price * 100) / 100;

    // We should keep this utility if it's used for something else, 
    // or replace it if it's redundant.
    // Given "replace duplicated logic", and this seems generic, I'll keep it but comment it.
    const price = basePrice * (1 + markup / 100);
    return Math.ceil(price * 100) / 100;
};

export const mockPODIntegration = {
    createProduct: async (designUrl, products) => {
        console.log('Creating POD product with design:', designUrl);
        return {
            id: `pod_${Date.now()}`,
            status: 'created',
            products: products.map(p => ({
                ...p,
                externalId: `ext_${p.variantId}_${Date.now()}`
            }))
        };
    },

    getShippingRates: async (address) => {
        return [
            { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7' },
            { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3' }
        ];
    },

    submitOrder: async (orderData) => {
        console.log('Submitting POD order:', orderData);
        return {
            orderId: `ord_${Date.now()}`,
            status: 'processing',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
    }
};

// Helper to get print size details
export const getPrintSizeDetails = (sizeId) => {
    return PRINT_SIZES.find(s => s.id === sizeId);
};
