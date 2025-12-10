import { PRINT_PRODUCTS, calculateEarnings, type ProductDefinition as PrintProduct } from '@/domain/shop/pricing';

// Re-export from single source of truth
export const PRINT_SIZES = PRINT_PRODUCTS;

// Adapter for calculatePrice to match old signature if needed, 
// or just use calculateEarnings logic
export const calculatePrice = (basePrice: number, markup: number = 30): number => {
    const price = basePrice * (1 + markup / 100);
    return Math.ceil(price * 100) / 100;
};

export interface PODProductResponse {
    id: string;
    status: string;
    products: any[];
}

export interface ShippingRate {
    id: string;
    name: string;
    price: number;
    days: string;
}

export interface OrderResponse {
    orderId: string;
    status: string;
    estimatedDelivery: string;
}

export const mockPODIntegration = {
    createProduct: async (designUrl: string, products: any[]): Promise<PODProductResponse> => {
        // Creating POD product with design
        return {
            id: `pod_${Date.now()}`,
            status: 'created',
            products: products.map(p => ({
                ...p,
                externalId: `ext_${p.variantId}_${Date.now()}`
            }))
        };
    },

    getShippingRates: async (address: any): Promise<ShippingRate[]> => {
        return [
            { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7' },
            { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3' }
        ];
    },

    submitOrder: async (orderData: any): Promise<OrderResponse> => {
        // Submitting POD order
        return {
            orderId: `ord_${Date.now()}`,
            status: 'processing',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
    }
};

// Helper to get print size details
export const getPrintSizeDetails = (sizeId: string): PrintProduct | undefined => {
    return PRINT_SIZES.find(s => s.id === sizeId);
};
