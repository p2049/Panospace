"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPostDelete = exports.onPostUpdate = exports.onPostCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const keywords_1 = require("./shared/keywords");
const config_1 = require("./shared/config");
// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Trigger: When a post is created
 * Actions:
 * - Generate search keywords if missing
 * - Create shop items for images marked addToShop
 * - Index in Algolia (if enabled)
 */
exports.onPostCreate = functions.firestore
    .document('posts/{postId}')
    .onCreate(async (snapshot, context) => {
    const postId = context.params.postId;
    const postData = snapshot.data();
    try {
        // Generate search keywords if not already present
        if (!postData.searchKeywords || postData.searchKeywords.length === 0) {
            const keywords = (0, keywords_1.generatePostSearchKeywords)({
                title: postData.title,
                authorName: postData.authorName,
                tags: postData.tags || [],
                location: postData.location,
            });
            await snapshot.ref.update({ searchKeywords: keywords });
        }
        // Create shop items for images marked for shop
        const shopItems = (postData.items || []).filter((item) => item.type === 'image' && item.addToShop && item.url);
        for (const item of shopItems) {
            // Build printSizes array with proper pricing
            const printSizes = (item.printSizes || []).map((sizeId) => {
                var _a;
                // Find the size config
                const sizeConfig = config_1.PRINT_SIZES.find(s => s.id === sizeId);
                if (!sizeConfig) {
                    console.warn(`Unknown size ID: ${sizeId}`);
                    return null;
                }
                // Use custom price if provided, otherwise default
                const customPrice = (_a = item.customPrices) === null || _a === void 0 ? void 0 : _a[sizeId];
                const retailPrice = customPrice || sizeConfig.defaultPrice;
                // Calculate earnings split
                const earnings = (0, config_1.calculateEarningsWithBaseCost)(retailPrice, sizeId);
                return {
                    id: sizeId,
                    label: sizeConfig.label,
                    price: Number(retailPrice.toFixed(2)),
                    artistEarningsCents: earnings.artistEarningsCents,
                    platformFeeCents: earnings.platformCutCents,
                    baseCostCents: earnings.baseCostCents
                };
            }).filter((size) => size !== null);
            if (printSizes.length > 0) {
                await db.collection('shopItems').add({
                    authorId: postData.authorId,
                    authorName: postData.authorName,
                    postRef: postId,
                    imageUrl: item.url,
                    title: postData.title,
                    description: postData.description || '',
                    tags: postData.tags || [],
                    printSizes,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }
        console.log(`Post ${postId} processed successfully`);
    }
    catch (error) {
        console.error(`Error processing post ${postId}:`, error);
        throw error;
    }
});
/**
 * Trigger: When a post is updated
 * Actions:
 * - Regenerate search keywords
 * - Update Algolia index
 */
exports.onPostUpdate = functions.firestore
    .document('posts/{postId}')
    .onUpdate(async (change, context) => {
    const postId = context.params.postId;
    const newData = change.after.data();
    const oldData = change.before.data();
    // Only regenerate keywords if relevant fields changed
    if (newData.title !== oldData.title ||
        JSON.stringify(newData.tags) !== JSON.stringify(oldData.tags) ||
        JSON.stringify(newData.location) !== JSON.stringify(oldData.location)) {
        const keywords = (0, keywords_1.generatePostSearchKeywords)({
            title: newData.title,
            authorName: newData.authorName,
            tags: newData.tags || [],
            location: newData.location,
        });
        await change.after.ref.update({
            searchKeywords: keywords,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
});
/**
 * Trigger: When a post is deleted
 * Actions:
 * - Delete associated shop items
 * - Remove from Algolia index
 */
exports.onPostDelete = functions.firestore
    .document('posts/{postId}')
    .onDelete(async (snapshot, context) => {
    const postId = context.params.postId;
    // Delete associated shop items
    const shopItemsQuery = await db
        .collection('shopItems')
        .where('postRef', '==', postId)
        .get();
    const deletePromises = shopItemsQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log(`Deleted post ${postId} and ${shopItemsQuery.size} shop items`);
});
//# sourceMappingURL=posts.js.map