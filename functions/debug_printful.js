require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.PRINTFUL_API_KEY;

async function checkEverything() {
    try {
        console.log('🔍 Checking Stores...');
        const storeRes = await axios.get('https://api.printful.com/stores', {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        const stores = storeRes.data.result;
        console.log(`   Found ${stores.length} stores.`);
        if (stores.length > 0) {
            console.log(`   Store ID: ${stores[0].id} (${stores[0].name})`);

            console.log('\n🔍 Checking Store Products...');
            const prodRes = await axios.get('https://api.printful.com/store/products', {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'X-PF-Store-Id': stores[0].id
                }
            });
            console.log(`   Found ${prodRes.data.result.length} products in store.`);
        }

        console.log('\n🔍 Checking Product Templates...');
        // Templates don't need a store ID usually, but let's see
        const templateRes = await axios.get('https://api.printful.com/product-templates', {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        console.log(`   Found ${templateRes.data.result.items.length} templates.`);

        if (templateRes.data.result.items.length > 0) {
            console.log('   (You created a Template, but you need to "Add to Store"!)');
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

checkEverything();
