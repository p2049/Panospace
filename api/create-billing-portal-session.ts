import Stripe from 'stripe';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16' as any,
});

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

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const customerId = userData?.stripeCustomerId;

        if (!customerId) {
            return res.status(400).json({ error: 'No Stripe customer ID found for this user.' });
        }

        const origin = req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5173';

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${origin}/settings`,
        });

        return res.status(200).json({ url: session.url });
    } catch (err: any) {
        console.error('Billing Portal Error:', err);
        return res.status(500).json({ error: err.message });
    }
}
