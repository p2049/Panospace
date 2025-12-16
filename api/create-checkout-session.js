import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const origin = req.headers.origin || 'https://panospace.vercel.app';

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [
                {
                    price: process.env.STRIPE_SPACE_CREATOR_PRICE_ID,
                    quantity: 1,
                },
            ],
            // Success/Cancel URLs
            success_url: `${origin}/upgrade/success`,
            cancel_url: `${origin}/upgrade/cancel`,
        });

        return res.status(200).json({ url: session.url });
    } catch (err) {
        console.error('Stripe Checkout Error:', err);
        return res.status(500).json({ error: err.message });
    }
}
