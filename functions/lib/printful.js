"use strict";
/**
 * Printful Integration Cloud Functions
 *
 * Handles:
 * - Creating Printful products from shop items
 * - Fulfilling orders via Printful API
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncPrintfulOrder = exports.createPodProduct = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const db = admin.firestore();
// Printful API configuration
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY || ((_a = functions.config().printful) === null || _a === void 0 ? void 0 : _a.api_key) || '';
const PRINTFUL_BASE_URL = 'https://api.printful.com';
// Printful product IDs for different print types
// These should match your actual Printful catalog
const PRINTFUL_PRODUCT_IDS = {
    '8x10': 1, // Example: Fine Art Print 8x10
    '11x14': 2,
    '16x20': 3,
    '18x24': 4,
    '24x36': 5
};
/**
 * Callable Function: Create a Printful product from a shop item
 */
exports.createPodProduct = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { shopItemId } = data;
    if (!shopItemId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing shopItemId');
    }
    try {
        // Fetch shop item
        const shopItemDoc = await db.collection('shopItems').doc(shopItemId).get();
        if (!shopItemDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Shop item not found');
        }
        const shopItem = shopItemDoc.data();
        // Create Printful product
        // Note: This is a simplified version. Real implementation would:
        // 1. Upload image to Printful
        // 2. Create product with variants for each size
        // 3. Store Printful product ID on shop item
        console.log(`Would create Printful product for shop item ${shopItemId}`);
        console.log(`Image URL: ${shopItem.imageUrl}`);
        console.log(`Sizes: ${JSON.stringify(shopItem.printSizes)}`);
        // For now, return mock success
        // Real implementation would call Printful API here
        return {
            success: true,
            printfulProductId: `mock_${Date.now()}`,
            message: 'Product creation not yet implemented'
        };
    }
    catch (error) {
        console.error('Error creating Printful product:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
/**
 * Callable Function: Sync order to Printful for fulfillment
 */
exports.syncPrintfulOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { orderId } = data;
    if (!orderId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing orderId');
    }
    try {
        // Fetch order
        const orderDoc = await db.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Order not found');
        }
        const order = orderDoc.data();
        // Create Printful order
        // Real implementation would:
        // 1. Prepare order data with recipient address
        // 2. Call Printful API to create order
        // 3. Update order document with Printful order ID
        // 4. Printful will then ship the product
        console.log(`Would create Printful order for ${orderId}`);
        console.log(`Size: ${order.sizeId}, Image: ${order.imageUrl}`);
        // Mock response
        return {
            success: true,
            printfulOrderId: `mock_order_${Date.now()}`,
            message: 'Printful order creation not yet implemented'
        };
    }
    catch (error) {
        console.error('Error syncing Printful order:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
/**
 * Helper: Call Printful API
 */
async function callPrintfulAPI(endpoint, method = 'GET', data) {
    var _a;
    if (!PRINTFUL_API_KEY) {
        throw new Error('Printful API key not configured');
    }
    try {
        const response = await (0, axios_1.default)({
            method,
            url: `${PRINTFUL_BASE_URL}/${endpoint}`,
            headers: {
                'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data
        });
        return response.data;
    }
    catch (error) {
        console.error('Printful API error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
}
//# sourceMappingURL=printful.js.map