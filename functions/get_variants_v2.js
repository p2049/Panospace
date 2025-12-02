require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.PRINTFUL_API_KEY;

async function getStores() {
    try {
        console.log('Fetching Stores...');
        const response = await axios.get('https://api.printful.com/stores', {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        const stores = response.data.result;
        console.log('✅ Stores Found:', stores);

        if (stores.length > 0) {
            const storeId = stores[0].id;
            console.log(`\n👉 USING STORE ID: ${storeId}`);
            await getProducts(storeId);
        }
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function getProducts(storeId) {
    try {
        // Note: We must pass X-PF-Store-Id header for Personal Access Tokens
        const response = await axios.get('https://api.printful.com/store/products', {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'X-PF-Store-Id': storeId
            }
        });

        const products = response.data.result;
        console.log(`\n📦 Found ${products.length} products.`);

        for (const product of products) {
            console.log(`\nProduct: ${product.name} (ID: ${product.id})`);
            const variantRes = await axios.get(`https://api.printful.com/store/products/${product.id}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'X-PF-Store-Id': storeId
                }
            });

            variantRes.data.result.sync_variants.forEach(v => {
                console.log(`   - ${v.name}: ID ${v.id} (Price: ${v.retail_price})`);
            });
        }
    } catch (error) {
        console.error('❌ Product Error:', error.response?.data || error.message);
    }
}

getStores();
