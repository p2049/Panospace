require('dotenv').config(); // Load .env file
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

async function testDirect() {
    console.log('🧪 Testing Credentials & Logic Directly...\n');

    // 1. Test Printful
    console.log('1️⃣  Testing Printful API Key...');
    if (!PRINTFUL_API_KEY) {
        console.error('❌ No Printful API Key found in environment.');
    } else {
        try {
            const response = await axios.get('https://api.printful.com/store', {
                headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
            });
            console.log('✅ Printful Connection Successful!');
            console.log(`   Store: ${response.data.result.name}`);
        } catch (error) {
            console.error('❌ Printful Error:', error.response?.data || error.message);
        }
    }

    console.log('\n-----------------------------------\n');

    // 2. Test Stripe
    console.log('2️⃣  Testing Stripe Secret Key...');
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('❌ No Stripe Secret Key found in environment.');
    } else {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Test Print',
                        },
                        unit_amount: 2000,
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: 'http://localhost:5173/success',
                cancel_url: 'http://localhost:5173/cancel',
            });
            console.log('✅ Stripe Session Created!');
            console.log(`   Session ID: ${session.id}`);
        } catch (error) {
            console.error('❌ Stripe Error:', error.message);
        }
    }
}

testDirect();
