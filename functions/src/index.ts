// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe using Firebase Functions config
// Set with: firebase functions:config:set stripe.secret="sk_test_your_key_here"
const stripeSecretKey = functions.config().stripe?.secret;
if (!stripeSecretKey) {
    console.error("❌ CRITICAL: Stripe secret key not configured! Run: firebase functions:config:set stripe.secret='your_key_here'");
}
const stripe = new Stripe(stripeSecretKey || "sk_test_placeholder", {
    apiVersion: "2023-10-16"
});

// Stub Printful functions (real implementation should use Printful SDK)
async function createPrintfulProduct(payload: any) {
    console.log("Stub: createPrintfulProduct called", payload);
    return { result: { id: `stub_product_${Date.now()}` } };
}

async function fulfillPrintfulOrder(payload: any) {
    console.log("Stub: fulfillPrintfulOrder called", payload);
    return { result: { id: `stub_order_${Date.now()}` } };
}

/** ---------------------------------------------------------------
 *  1️⃣ createCheckoutSession – callable from the client
 * --------------------------------------------------------------- */
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
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
    const shopData = shopDoc.data()!;
    const variant = shopData.variants.find((v: any) => v.size === size);
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
export const handleStripeWebhook = functions.https.onRequest(async (req: any, res: any) => {
    const sig = req.headers["stripe-signature"] as string | undefined;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;
    try {
        if (!sig) throw new Error("Missing Stripe signature");
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
        console.error("⚠️ Webhook signature verification failed.", err);
        res.status(400).send(`Webhook Error: ${err}`);
        return;
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata as any;
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
async function createPrintfulOrder(
    orderId: string,
    orderData: FirebaseFirestore.DocumentData,
    metadata: any
) {
    const shopDoc = await db.collection("shopItems").doc(orderData.shopItemId).get();
    if (!shopDoc.exists) throw new Error("Shop item missing for Printful order");
    const shop = shopDoc.data()!;
    const variant = shop.variants.find((v: any) => v.size === metadata.size);
    if (!variant) throw new Error("Variant not found for Printful order");
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
export const createPrintfulProductFn = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be signed in");
    }
    const { title, description, images, variants } = data;
    const payload = {
        name: title,
        description,
        thumbnail: images[0],
        files: images.map((url: string) => ({ url })),
        variants: variants.map((v: any) => ({ size: v.size, price: v.price, sku: v.sku })),
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
function generateSearchKeywords(text: string): string[] {
    if (!text || typeof text !== 'string') return [];

    const words = text
        .toLowerCase()
        .trim()
        .split(/[\s,._-]+/)
        .filter(word => word.length > 0);

    const keywords = new Set<string>();

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
export const onPostCreate = functions.firestore
    .document('posts/{postId}')
    .onCreate(async (snapshot, context) => {
        const post = snapshot.data() as any;

        // Generate search keywords
        const keywords = new Set<string>();

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
            post.tags.forEach((tag: string) => {
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
export const onUserCreate = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snapshot, context) => {
        const user = snapshot.data() as any;

        // Generate search keywords
        const keywords = new Set<string>();

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
            user.artTypes.forEach((type: string) => keywords.add(type.toLowerCase()));
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
export const regenerateSearchKeywords = functions.https.onCall(async (data, context) => {
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
        const keywords = new Set<string>();

        if (collectionName === 'posts') {
            // Post keywords
            if (data.title) generateSearchKeywords(data.title).forEach(k => keywords.add(k));
            if (data.authorName) generateSearchKeywords(data.authorName).forEach(k => keywords.add(k));
            if (data.tags) data.tags.forEach((tag: string) => {
                keywords.add(tag.toLowerCase());
                generateSearchKeywords(tag).forEach(k => keywords.add(k));
            });
            if (data.location) {
                if (data.location.city) generateSearchKeywords(data.location.city).forEach(k => keywords.add(k));
                if (data.location.state) generateSearchKeywords(data.location.state).forEach(k => keywords.add(k));
                if (data.location.country) generateSearchKeywords(data.location.country).forEach(k => keywords.add(k));
            }
        } else {
            // User keywords
            if (data.displayName) generateSearchKeywords(data.displayName).forEach(k => keywords.add(k));
            if (data.email) {
                const emailPrefix = data.email.split('@')[0];
                generateSearchKeywords(emailPrefix).forEach(k => keywords.add(k));
            }
            if (data.bio) generateSearchKeywords(data.bio).forEach(k => keywords.add(k));
            if (data.artTypes) data.artTypes.forEach((type: string) => keywords.add(type.toLowerCase()));
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

/** ---------------------------------------------------------------
 *  📸 MONTHLY PHOTO CONTEST – Runs 1st of each month at midnight UTC
 * --------------------------------------------------------------- */
export const selectMonthlyWinner = functions.pubsub
    .schedule('0 0 1 * *')
    .timeZone('UTC')
    .onRun(async (context) => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const monthLabel = lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        console.log(`🏆 Running monthly contest for ${monthLabel}`);

        // Query all posts from last month
        const postsSnapshot = await db.collection('posts')
            .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(lastMonth))
            .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(lastMonthEnd))
            .orderBy('createdAt', 'desc')
            .get();

        if (postsSnapshot.empty) {
            console.log('No posts found for contest period');
            return null;
        }

        // Find post with highest like count
        let winningPost: any = null;
        let maxLikes = -1;

        postsSnapshot.forEach(doc => {
            const data = doc.data();
            const likes = data.likeCount || 0;
            if (likes > maxLikes) {
                maxLikes = likes;
                winningPost = { id: doc.id, ...data };
            }
        });

        if (!winningPost || maxLikes === 0) {
            console.log('No valid winner (no likes)');
            return null;
        }

        console.log(`Winner: ${winningPost.title} by ${winningPost.authorName} with ${maxLikes} likes`);

        // Create winner entry
        const winnerData = {
            userId: winningPost.authorId,
            userName: winningPost.authorName,
            userPhoto: winningPost.authorPhoto || null,
            postId: winningPost.id,
            imageUrl: winningPost.imageUrl || winningPost.items?.[0]?.url || '',
            title: winningPost.title,
            likeCount: maxLikes,
            month: lastMonth.getMonth() + 1,
            year: lastMonth.getFullYear(),
            monthLabel: monthLabel,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            badgeAwarded: true
        };

        await db.collection('monthlyWinners').add(winnerData);

        // Award badge to user
        const userRef = db.collection('users').doc(winningPost.authorId);
        await userRef.update({
            badges: admin.firestore.FieldValue.arrayUnion({
                type: 'monthly_champion',
                monthLabel: monthLabel,
                awardedAt: admin.firestore.FieldValue.serverTimestamp()
            }),
            verified: true,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Monthly winner processed: ${winningPost.authorName}`);
        return { success: true, winner: winningPost.id };
    });
