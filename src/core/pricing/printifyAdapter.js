/**
 * PANOSPACE PRINTIFY ADAPTER
 * 
 * Adapter for Printify API integration.
 * Maps our internal pricing to Printify's provider/blueprint system.
 */

import { PRINTIFY_PRODUCTS, STICKER_PRODUCTS } from './productCatalog';

/**
 * Get Printify options (providers, variants) - Placeholder
 * @returns {Object} Options
 */
export const getPrintifyOptions = () => {
    return {
        providers: [
            { id: 10, title: 'Printify Standard Provider' },
            { id: 20, title: 'Printify Sticker Provider' }
        ],
        shipping: 'standard'
    };
};

/**
 * Map a size ID to Printify provider and blueprint IDs
 * @param {string} sizeId - The size ID
 * @returns {Object} Provider and blueprint IDs
 */
export const mapSizeToPrintify = (sizeId) => {
    const product = PRINTIFY_PRODUCTS.find(p => p.id === sizeId);
    if (!product) {
        return {
            providerId: null,
            blueprintId: null,
            error: 'Product not found'
        };
    }

    return {
        providerId: product.printifyProviderId,
        blueprintId: product.printifyBlueprintId,
        sizeLabel: product.label
    };
};

/**
 * Create a Printify product payload
 * @param {Object} params - Product parameters
 * @returns {Object} Printify API payload
 */
export const createPrintifyProductPayload = ({ imageUrl, title, sizeIds, prices }) => {
    const variants = sizeIds.map((sizeId, idx) => {
        const mapping = mapSizeToPrintify(sizeId);
        return {
            sizeId,
            providerId: mapping.providerId,
            blueprintId: mapping.blueprintId,
            price: prices[idx] || 0,
            enabled: true
        };
    });

    return {
        title,
        imageUrl,
        variants,
        visible: true
    };
};
