import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16' as any,
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { priceId, userId, customerId } = req.body;
    const finalPriceId = priceId || process.env.STRIPE_SPACE_CREATOR_PRICE_ID;

    console.log('Incoming POST body:', req.body);

    if (!finalPriceId || !userId) {
        return res.status(400).json({ error: 'Missing priceId (or environment variable) or userId' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is missing');
    }

    try {
        const origin = req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            ...(customerId && { customer: customerId }),
            payment_method_types: ['card'],
            line_items: [
                {
                    price: finalPriceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: userId,
            },
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/ultra`,
        });

        console.log('Stripe session creation success:', session.id);

        return res.status(200).json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return res.status(500).json({ error: err.message });
    }
}
