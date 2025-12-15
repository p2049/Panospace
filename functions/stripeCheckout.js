const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

// Initialize Stripe Key
// Config: firebase functions:config:set stripe.secret="sk_test_..."
const stripeSecretKey = functions.config().stripe ? functions.config().stripe.secret : "sk_test_placeholder";
const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
const db = admin.firestore();

/**
 * createCartCheckoutSession
 * Handles multiple items from the Shopping Cart
 */
exports.createCartCheckoutSession = functions.https.onCall(async (data, context) => {
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be signed in");
    }

    const { cartItems } = data; // Array of { id, selectedSize, quantity }
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "Cart is empty.");
    }

    // 2. Validate Items & Build Line Items
    const line_items = [];
    const metadataDetails = []; // To store breakdown for order record

    // Helper to get shop item data safely
    // OPTIMIZATION: In a real app, use getAll() or batch get
    for (const item of cartItems) {
        const docRef = db.collection('shopItems').doc(item.id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            throw new functions.https.HttpsError("not-found", `Item not found: ${item.title}`);
        }

        const shopData = docSnap.data();

        // Find variant/price for the specific size
        // Logic should match frontend: 
        // 1. Look in printSizes array
        // 2. Fallback to calculating from base logic if dynamic pricing (complex in JS function without importing shared logic)

        // Simplified: Trust the price for now, but verify it's reasonably close (or re-calculate if we port pricing logic)
        // BETTER: Retrieve price from stored printSizes in database
        const sizeConfig = (shopData.printSizes || []).find(s => s.id === item.selectedSize);

        if (!sizeConfig) {
            throw new functions.https.HttpsError("invalid-argument", `Size ${item.selectedSize} no longer available for ${shopData.title}`);
        }

        const unitAmount = Math.round(Number(sizeConfig.price) * 100); // cents

        line_items.push({
            price_data: {
                currency: "usd",
                product_data: {
                    name: `${shopData.title} (${sizeConfig.label})`,
                    description: shopData.description ? shopData.description.substring(0, 100) : "Fine Art Print",
                    images: shopData.images && shopData.images.length > 0 ? [shopData.images[0]] : [shopData.imageUrl],
                    metadata: {
                        shopItemId: item.id,
                        size: item.selectedSize,
                        artistUid: shopData.userId || shopData.artistUid
                    }
                },
                unit_amount: unitAmount,
            },
            quantity: item.quantity,
        });

        metadataDetails.push({
            shopItemId: item.id,
            size: item.selectedSize,
            quantity: item.quantity,
            price: unitAmount,
            title: shopData.title,
            artistId: shopData.userId || shopData.artistUid
        });
    }

    // 3. Create Session
    const origin = process.env.APP_URL || "http://localhost:5173"; // Fallback for dev

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
        metadata: {
            // Stripe metadata has a 500 char limit per key. 
            // We can't store full cart details here if it's large.
            // We'll store the Order ID instead.
            buyerUid: context.auth.uid,
            isCartCheckout: "true",
            itemCount: cartItems.length
        },
    });

    // 4. Create Pending Order Record(s) in Firestore
    // We can create one "Master Order" or multiple "Line Item Orders".
    // For individual artist fulfillment, separate line items usually work best, grouped by Order ID.

    // We will create one Order Group for the buyer
    const orderRef = await db.collection("orders").add({
        buyerUid: context.auth.uid,
        stripeSessionId: session.id,
        status: "pending", // paid, fulfillment_requested, shipped
        amountTotal: session.amount_total,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        items: metadataDetails,
        type: 'cart_checkout'
    });

    return { url: session.url };
});

/**
 * createSingleCheckoutSession (Legacy Support / Direct Buy)
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    // Re-use logic or redirect to cart flow? 
    // For now, keep it simple for backward compat
    return exports.createCartCheckoutSession.run({
        cartItems: [{
            id: data.postId || data.shopItemId,
            selectedSize: data.size,
            quantity: data.quantity || 1
        }]
    }, context);
});

/**
 * createCreatorSubscriptionCheckout
 * Handles subscription upgrade for Space Creator
 */
exports.createCreatorSubscriptionCheckout = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be signed in");
    }

    const origin = process.env.APP_URL || "http://localhost:5173";

    // Create a new Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: "price_1QTMYmF3FCQ1N5YCG7qMv3w8", // Make sure this price ID exists in your Stripe dashboard
                quantity: 1,
            },
        ],
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
        cancel_url: `${origin}/profile/me`,
        metadata: {
            firebaseUid: context.auth.uid,
            type: "creator_upgrade"
        },
    });

    return { url: session.url };
});
