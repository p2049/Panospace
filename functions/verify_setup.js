const axios = require('axios');

const PROJECT_ID = 'panospace-7v4ucn';
const REGION = 'us-central1';
const BASE_URL = `http://127.0.0.1:5001/${PROJECT_ID}/${REGION}`;

async function runTests() {
    console.log('🧪 Starting Integration Tests...\n');

    // 1. Test Printful Connection
    try {
        console.log('1️⃣  Testing Printful API Connection...');
        const printfulRes = await axios.post(`${BASE_URL}/testPrintfulConnection`, {
            data: {} // onCall expects this wrapper
        });

        if (printfulRes.data.result.success) {
            console.log('✅ Printful Connection Successful!');
            console.log(`   Store Name: ${printfulRes.data.result.store.name}`);
        } else {
            console.error('❌ Printful Connection Failed:', printfulRes.data.result);
        }
    } catch (error) {
        console.error('❌ Printful Test Error:', error.response?.data || error.message);
    }

    console.log('\n-----------------------------------\n');

    // 2. Test Stripe Checkout Session
    try {
        console.log('2️⃣  Testing Stripe Checkout Session Creation...');
        const stripeRes = await axios.post(`${BASE_URL}/createCheckoutSession`, {
            data: {
                postId: 'test_post_123',
                size: 'medium',
                imageUrl: 'https://via.placeholder.com/300',
                title: 'Test Art Print'
            }
        });

        if (stripeRes.data.result.sessionId) {
            console.log('✅ Stripe Session Created!');
            console.log(`   Session ID: ${stripeRes.data.result.sessionId}`);
        } else {
            console.error('❌ Stripe Session Failed:', stripeRes.data.result);
        }
    } catch (error) {
        console.error('❌ Stripe Test Error:', error.response?.data || error.message);
    }
}

runTests();
