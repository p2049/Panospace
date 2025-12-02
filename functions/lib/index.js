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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateSearchKeywords = exports.onUserCreate = exports.onPostCreate = exports.createPrintfulProductFn = exports.handleStripeWebhook = exports.createCheckoutSession = void 0;
// functions/src/index.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
admin.initializeApp();
const db = admin.firestore();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" });
// Stub Printful functions (real implementation should use Printful SDK)
async function createPrintfulProduct(payload) {
    console.log("Stub: createPrintfulProduct called", payload);
    return { result: { id: `stub_product_${Date.now()}` } };
}
async function fulfillPrintfulOrder(payload) {
    console.log("Stub: fulfillPrintfulOrder called", payload);
    return { result: { id: `stub_order_${Date.now()}` } };
}
/** ---------------------------------------------------------------
 *  1️⃣ createCheckoutSession – callable from the client
 * --------------------------------------------------------------- */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be signed in");
    }
    const { shopItemId, size, quantity } = data;
    if (!shopItemId || !size || !quantity) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }
    const shopDoc = await db.collection("shopItems").doc(shopItemId).get();
    if (!shopDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Shop item not found");
    }
    const shopData = shopDoc.data();
    const variant = shopData.variants.find((v) => v.size === size);
    if (!variant) {
        throw new functions.https.HttpsError("invalid-argument", "Size not available");
    }
    const amount = variant.price; // cents
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: { name: shopData.title, description: shopData.description },
                    unit_amount: amount,
                },
                quantity,
            },
        ],
        mode: "payment",
        success_url: `${process.env.APP_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/checkout-cancel`,
        metadata: {
            shopItemId,
            size,
            quantity,
            artistUid: shopData.artistUid,
            platformCut: Math.round(amount * 0.5),
            artistCut: Math.round(amount * 0.5),
        },
    });
    await db.collection("orders").add({
        shopItemId,
        size,
        quantity,
        amount,
        status: "pending",
        stripeSessionId: session.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        buyerUid: context.auth.uid,
    });
    return { url: session.url };
});
/** ---------------------------------------------------------------
 *  2️⃣ Stripe webhook – verifies signature & triggers fulfillment
 * --------------------------------------------------------------- */
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        if (!sig)
            throw new Error("Missing Stripe signature");
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    }
    catch (err) {
        console.error("⚠️ Webhook signature verification failed.", err);
        res.status(400).send(`Webhook Error: ${err}`);
        return;
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const metadata = session.metadata;
        const orderSnap = await db
            .collection("orders")
            .where("stripeSessionId", "==", session.id)
            .limit(1)
            .get();
        if (!orderSnap.empty) {
            const orderRef = orderSnap.docs[0].ref;
            await orderRef.update({
                status: "paid",
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                stripePaymentIntent: session.payment_intent,
            });
            // Fire‑and‑forget fulfillment
            createPrintfulOrder(orderRef.id, orderSnap.docs[0].data(), metadata).catch(console.error);
        }
    }
    res.json({ received: true });
});
/** ---------------------------------------------------------------
 *  3️⃣ Helper – create Printful order after payment
 * --------------------------------------------------------------- */
async function createPrintfulOrder(orderId, orderData, metadata) {
    const shopDoc = await db.collection("shopItems").doc(orderData.shopItemId).get();
    if (!shopDoc.exists)
        throw new Error("Shop item missing for Printful order");
    const shop = shopDoc.data();
    const variant = shop.variants.find((v) => v.size === metadata.size);
    if (!variant)
        throw new Error("Variant not found for Printful order");
    const payload = {
        recipient: {
            name: "Buyer",
            address1: "123 Main St",
            city: "San Francisco",
            state_code: "CA",
            country_code: "US",
            zip: "94105",
        },
        items: [
            {
                product_id: shop.printfulProductId,
                variant_id: variant.printfulVariantId,
                quantity: Number(metadata.quantity),
            },
        ],
        external_id: orderId,
    };
    const result = await fulfillPrintfulOrder(payload);
    await db.collection("orders").doc(orderId).update({
        printfulOrderId: result.result.id,
        status: "fulfillment_requested",
    });
}
/** ---------------------------------------------------------------
 *  4️⃣ createPrintfulProductFn – callable from the client when adding a shop item
 * --------------------------------------------------------------- */
exports.createPrintfulProductFn = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be signed in");
    }
    const { title, description, images, variants } = data;
    const payload = {
        name: title,
        description,
        thumbnail: images[0],
        files: images.map((url) => ({ url })),
        variants: variants.map((v) => ({ size: v.size, price: v.price, sku: v.sku })),
    };
    const response = await createPrintfulProduct(payload);
    const productId = response.result.id;
    const shopRef = await db.collection("shopItems").add({
        title,
        description,
        images,
        variants,
        printfulProductId: productId,
        artistUid: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { shopItemId: shopRef.id };
});
/** ---------------------------------------------------------------
 *  🔍 SEARCH KEYWORD GENERATION FUNCTIONS
 * --------------------------------------------------------------- */
/**
 * Generate search keywords from text
 * Creates prefix-based keywords for Firestore array-contains search
 */
function generateSearchKeywords(text) {
    if (!text || typeof text !== 'string')
        return [];
    const words = text
        .toLowerCase()
        .trim()
        .split(/[\s,._-]+/)
        .filter(word => word.length > 0);
    const keywords = new Set();
    words.forEach(word => {
        // Add full word
        keywords.add(word);
        // Add prefixes (minimum 2 characters)
        for (let i = 2; i <= word.length; i++) {
            keywords.add(word.substring(0, i));
        }
    });
    return Array.from(keywords);
}
/**
 * Auto-generate search keywords when a new post is created
 * Triggers: onCreate for posts collection
 */
exports.onPostCreate = functions.firestore
    .document('posts/{postId}')
    .onCreate(async (snapshot, context) => {
    const post = snapshot.data();
    // Generate search keywords
    const keywords = new Set();
    // From title
    if (post.title) {
        generateSearchKeywords(post.title).forEach(k => keywords.add(k));
    }
    // From author name
    if (post.authorName) {
        generateSearchKeywords(post.authorName).forEach(k => keywords.add(k));
    }
    // From tags
    if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
            const tagLower = tag.toLowerCase();
            keywords.add(tagLower);
            generateSearchKeywords(tagLower).forEach(k => keywords.add(k));
        });
    }
    // From location
    if (post.location) {
        if (post.location.city) {
            generateSearchKeywords(post.location.city).forEach(k => keywords.add(k));
        }
        if (post.location.state) {
            generateSearchKeywords(post.location.state).forEach(k => keywords.add(k));
        }
        if (post.location.country) {
            generateSearchKeywords(post.location.country).forEach(k => keywords.add(k));
        }
    }
    // Update post with search keywords if not already present
    if (!post.searchKeywords || post.searchKeywords.length === 0) {
        await snapshot.ref.update({
            searchKeywords: Array.from(keywords)
        });
        console.log(`Generated ${keywords.size} search keywords for post ${context.params.postId}`);
    }
});
/**
 * Auto-generate search keywords when a new user is created
 * Triggers: onCreate for users collection
 */
exports.onUserCreate = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snapshot, context) => {
    const user = snapshot.data();
    // Generate search keywords
    const keywords = new Set();
    // From displayName
    if (user.displayName) {
        generateSearchKeywords(user.displayName).forEach(k => keywords.add(k));
    }
    // From email (before @)
    if (user.email) {
        const emailPrefix = user.email.split('@')[0];
        generateSearchKeywords(emailPrefix).forEach(k => keywords.add(k));
    }
    // From bio
    if (user.bio) {
        generateSearchKeywords(user.bio).forEach(k => keywords.add(k));
    }
    // From art types
    if (user.artTypes && Array.isArray(user.artTypes)) {
        user.artTypes.forEach((type) => keywords.add(type.toLowerCase()));
    }
    // Update user with search keywords if not already present
    if (!user.searchKeywords || user.searchKeywords.length === 0) {
        await snapshot.ref.update({
            searchKeywords: Array.from(keywords)
        });
        console.log(`Generated ${keywords.size} search keywords for user ${context.params.userId}`);
    }
});
/**
 * Callable function to regenerate search keywords for existing documents
 * Use this to backfill search keywords for posts/users created before this function
 */
exports.regenerateSearchKeywords = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be signed in");
    }
    const { collection: collectionName, limit: limitCount } = data;
    if (!['posts', 'users'].includes(collectionName)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid collection name");
    }
    const limit = limitCount || 100;
    const collectionRef = db.collection(collectionName);
    // Get documents without searchKeywords
    const snapshot = await collectionRef
        .where('searchKeywords', '==', null)
        .limit(limit)
        .get();
    const batch = db.batch();
    let count = 0;
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const keywords = new Set();
        if (collectionName === 'posts') {
            // Post keywords
            if (data.title)
                generateSearchKeywords(data.title).forEach(k => keywords.add(k));
            if (data.authorName)
                generateSearchKeywords(data.authorName).forEach(k => keywords.add(k));
            if (data.tags)
                data.tags.forEach((tag) => {
                    keywords.add(tag.toLowerCase());
                    generateSearchKeywords(tag).forEach(k => keywords.add(k));
                });
            if (data.location) {
                if (data.location.city)
                    generateSearchKeywords(data.location.city).forEach(k => keywords.add(k));
                if (data.location.state)
                    generateSearchKeywords(data.location.state).forEach(k => keywords.add(k));
                if (data.location.country)
                    generateSearchKeywords(data.location.country).forEach(k => keywords.add(k));
            }
        }
        else {
            // User keywords
            if (data.displayName)
                generateSearchKeywords(data.displayName).forEach(k => keywords.add(k));
            if (data.email) {
                const emailPrefix = data.email.split('@')[0];
                generateSearchKeywords(emailPrefix).forEach(k => keywords.add(k));
            }
            if (data.bio)
                generateSearchKeywords(data.bio).forEach(k => keywords.add(k));
            if (data.artTypes)
                data.artTypes.forEach((type) => keywords.add(type.toLowerCase()));
        }
        batch.update(doc.ref, { searchKeywords: Array.from(keywords) });
        count++;
    });
    await batch.commit();
    return {
        success: true,
        processed: count,
        hasMore: snapshot.docs.length === limit
    };
});
//# sourceMappingURL=index.js.map