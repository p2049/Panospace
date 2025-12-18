import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { Readable } from 'stream';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error: any) {
        console.error('Firebase admin initialization error', error.stack);
    }
}

const db = admin.firestore();

// Helper to get raw body as buffer for Stripe signature verification
async function getRawBody(readable: Readable): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is missing');
        return res.status(500).json({ error: 'Webhook secret is not configured' });
    }

    const buf = await getRawBody(req);
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Webhook event type:', event.type);

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            if (!userId) {
                console.error(`[Webhook] CRITICAL: No userId found in session metadata. Session ID: ${session.id}`);
                return res.status(400).json({ error: 'Missing userId in metadata' });
            }

            console.log(`[Webhook] Processing successful checkout for user: ${userId}`);

            // 2. Safe User Document Writes (Idempotent)
            // Use set() with merge: true to ensure success even if doc doesn't exist
            await db.collection('users').doc(userId).set({
                isPro: true,
                isSpaceCreator: true, // "Space Creator" is the new name for Pro/Ultra
                isUltra: true, // Maintain backwards compatibility
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                subscriptionStatus: 'active',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

            console.log(`[Webhook] User ${userId} successfully upgraded to Space Creator (Idempotent)`);
        } else {
            // 3. Event Handling Scope (Minimal)
            console.log(`[Webhook] Ignoring unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (err: any) {
        console.error('[Webhook] Error handling event:', err);
        // Do NOT fail the webhook for internal errors if we can avoid it, but logging is critical
        return res.status(500).json({ error: 'Webhook handler internal error' });
    }
}
