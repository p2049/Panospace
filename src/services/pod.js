// Printful / Print-on-Demand Integration for PanoSpace
// Handles shop item creation, product setup, and checkout

import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Print sizes configuration
export const PRINT_SIZES = [
    { id: 'small', label: '8x10"', price: 19.99, description: 'Perfect for desk or shelf display' },
    { id: 'medium', label: '12x16"', price: 29.99, description: 'Great for small wall spaces' },
    { id: 'large', label: '18x24"', price: 39.99, description: 'Statement piece for larger walls' },
    { id: 'xlarge', label: '24x36"', price: 59.99, description: 'Gallery-quality large format' }
];

/**
 * Create a POD product for a shop item
 * @param {string} shopItemId - Firestore shop item ID
 * @param {string} imageUrl - URL of the image to print
 * @param {string} title - Product title
 * @param {string} description - Product description
 * @returns {Promise<Object>} - Result with productId and mode
 */
export const createPodProduct = async (shopItemId, imageUrl, title, description) => {
    try {
        const createProduct = httpsCallable(functions, 'createPodProduct');
        const result = await createProduct({
            shopItemId,
            imageUrl,
            title,
            description
        });

        return result.data;
    } catch (error) {
        console.error('Error creating POD product:', error);
        throw new Error(`Failed to create product: ${error.message}`);
    }
};

/**
 * Get checkout URL for a specific product variant
 * @param {string} productId - POD product ID
 * @param {string} variantId - Variant ID (size)
 * @returns {Promise<string>} - Checkout URL
 */
export const getCheckoutUrl = async (productId, variantId) => {
    try {
        const getUrl = httpsCallable(functions, 'getPrintfulCheckoutUrl');
        const result = await getUrl({
            productId,
            variantId
        });

        return result.data.checkoutUrl;
    } catch (error) {
        console.error('Error getting checkout URL:', error);
        // Return mock checkout URL as fallback
        return `https://panospace-checkout.com/product/${productId}/variant/${variantId}`;
    }
};

/**
 * Mock POD integration for development
 * Returns mock data without making actual API calls
 */
export const mockPODIntegration = {
    createProduct: async (shopItemId, imageUrl, title) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockProductId = `mock_${shopItemId}_${Date.now()}`;

        return {
            success: true,
            productId: mockProductId,
            mode: 'mock',
            variants: PRINT_SIZES.map(size => ({
                sizeId: size.id,
                variantId: `${mockProductId}_${size.id}`,
                price: size.price,
                label: size.label
            }))
        };
    },

    getCheckoutUrl: (productId, variantId) => {
        return `https://panospace-mock-checkout.com/product/${productId}/variant/${variantId}?utm_source=panospace`;
    },

    getProductStatus: async (productId) => {
        return {
            productId,
            status: 'active',
            variants: PRINT_SIZES.length,
            mode: 'mock'
        };
    }
};

/**
 * Calculate price with markup
 * @param {number} basePrice - Base print price
 * @param {number} markup - Markup percentage (0-100)
 * @returns {number} - Final price
 */
export const calculatePrice = (basePrice, markup = 30) => {
    return Math.round(basePrice * (1 + markup / 100) * 100) / 100;
};

/**
 * Validate image for printing
 * @param {string} imageUrl - Image URL to check
 * @param {number} minWidth - Minimum width in pixels
 * @param {number} minHeight - Minimum height in pixels
 * @returns {Promise<Object>} - Validation result
 */
export const validatePrintImage = async (imageUrl, minWidth = 2400, minHeight = 3000) => {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
            const result = {
                valid: img.width >= minWidth && img.height >= minHeight,
                width: img.width,
                height: img.height,
                aspectRatio: img.width / img.height
            };

            if (!result.valid) {
                result.message = `Image resolution too low. Minimum ${minWidth}x${minHeight}px required. Current: ${img.width}x${img.height}px`;
            } else {
                result.message = 'Image quality is suitable for printing';
            }

            resolve(result);
        };

        img.onerror = () => {
            resolve({
                valid: false,
                message: 'Failed to load image for validation'
            });
        };

        img.src = imageUrl;
    });
};

/**
 * Get recommended print sizes based on image dimensions
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @returns {Array} - Recommended print sizes
 */
export const getRecommendedSizes = (width, height) => {
    const aspectRatio = width / height;

    // Filter sizes based on image quality
    return PRINT_SIZES.filter(size => {
        const [sizeWidth, sizeHeight] = size.label.split('x').map(s => parseInt(s));
        const requiredPixels = sizeWidth * sizeHeight * 300 * 300 / (72 * 72); // 300 DPI
        const availablePixels = width * height;

        return availablePixels >= requiredPixels * 0.8; // Allow 20% tolerance
    });
};

export default {
    createPodProduct,
    getCheckoutUrl,
    mockPODIntegration,
    calculatePrice,
    validatePrintImage,
    getRecommendedSizes,
    PRINT_SIZES
};
