require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.PRINTFUL_API_KEY;
const STORE_ID = '17260325'; // Hardcoded from previous finding

async function forceCheck() {
    console.log(`🔍 Force Checking Store ID: ${STORE_ID}`);

    try {
        // 1. Check Sync Products (The main one we need)
        const response = await axios.get('https://api.printful.com/store/products', {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'X-PF-Store-Id': STORE_ID
            },
            params: {
                limit: 20,
                offset: 0
            }
        });

        const products = response.data.result;
        console.log(`📦 Products Found: ${products.length}`);

        if (products.length > 0) {
            products.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));

            // Get variants for the first product
            const firstId = products[0].id;
            console.log(`\n🔎 Fetching variants for Product ID: ${firstId}`);

            const variantRes = await axios.get(`https://api.printful.com/store/products/${firstId}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'X-PF-Store-Id': STORE_ID
                }
            });

            console.log('✅ VARIANTS FOUND:');
            variantRes.data.result.sync_variants.forEach(v => {
                console.log(`   SIZE: ${v.name} | ID: ${v.id}`);
            });
        } else {
            console.log('❌ Still seeing 0 products.');
            console.log('   Possible reasons:');
            console.log('   1. Product is in "Draft" status?');
            console.log('   2. Product was added to a DIFFERENT store?');
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

forceCheck();
