"use strict";
/**
 * Stripe & Payment Cloud Functions
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOrderCreate = exports.stripeWebhook = exports.createCheckoutSession = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-11-17.clover',
});
const db = admin.firestore();
// Estimated base costs (mirrored from frontend)
const ESTIMATED_BASE_COSTS = {
    '5x7': 800,
    '8x10': 1200,
    '11x14': 1800,
    '16x20': 2800,
    '18x24': 3500,
    '24x36': 5500,
};
/**
 * Callable Function: Create a Stripe Checkout session
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    // Auth check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { shopItemId, sizeId, origin } = data;
    if (!shopItemId || !sizeId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
    }
    try {
        // Fetch shop item
        const shopItemDoc = await db.collection('shopItems').doc(shopItemId).get();
        if (!shopItemDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Shop item not found');
        }
        const shopItem = shopItemDoc.data();
        // Find size configuration
        const sizeConfig = (shopItem.printSizes || []).find((s) => s.id === sizeId);
        if (!sizeConfig) {
            throw new functions.https.HttpsError('not-found', 'Print size not found');
        }
        // Calculate price in cents
        const unitAmountCents = Math.round(Number(sizeConfig.price) * 100);
        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: unitAmountCents,
                        product_data: {
                            name: `${sizeConfig.label} Print - ${shopItem.title}`,
                            images: [shopItem.imageUrl],
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/shop/${shopItemId}`,
            metadata: {
                userId: context.auth.uid,
                authorId: shopItem.authorId,
                shopItemId,
                sizeId,
                imageUrl: shopItem.imageUrl,
            },
        });
        return { url: session.url, sessionId: session.id };
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
/**
 * Webhook: Handle Stripe payment events
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('Stripe webhook secret not configured');
        res.status(500).send('Webhook secret not configured');
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { shopItemId, sizeId, userId, authorId, imageUrl } = session.metadata || {};
        if (!shopItemId || !sizeId || !userId || !authorId) {
            console.error('Missing metadata in webhook event');
            res.status(400).send('Missing metadata');
            return;
        }
        try {
            // Calculate earnings split
            const baseCostCents = ESTIMATED_BASE_COSTS[sizeId] || 1500;
            const totalCents = session.amount_total || 0;
            const profitCents = Math.max(0, totalCents - baseCostCents);
            const artistEarningsCents = Math.round(profitCents * 0.6);
            const platformCutCents = Math.round(profitCents * 0.4);
            // Create order document
            await db.collection('orders').add({
                userId,
                authorId,
                shopItemId,
                sizeId,
                imageUrl,
                stripeSessionId: session.id,
                stripeTotalCents: totalCents,
                artistEarningsCents,
                platformCutCents,
                status: 'paid',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Order created for session ${session.id}`);
        }
        catch (error) {
            console.error('Error creating order:', error);
            res.status(500).send('Error creating order');
            return;
        }
    }
    res.json({ received: true });
});
/**
 * Trigger: When an order is created (after payment)
 * Actions: Create Printful order for fulfillment
 */
exports.onOrderCreate = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snapshot, context) => {
    const orderId = context.params.orderId;
    const orderData = snapshot.data();
    // Only process paid orders
    if (orderData.status !== 'paid') {
        return;
    }
    console.log(`Processing order ${orderId} for Printful fulfillment`);
    // Printful integration would go here
    // See functions/src/printful.ts
});
//# sourceMappingURL=stripe.js.map