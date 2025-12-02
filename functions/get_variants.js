require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.PRINTFUL_API_KEY;

async function getVariants() {
    if (!API_KEY) {
        console.log('No API Key found.');
        return;
    }

    try {
        console.log('Fetching Sync Products...');
        // 1. Get all "Sync Products" (products created in the store)
        const productsRes = await axios.get('https://api.printful.com/store/products', {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        const products = productsRes.data.result;
        console.log(`Found ${products.length} products.`);

        if (products.length === 0) {
            console.log('⚠️ You have not created any products in your Printful Dashboard yet.');
            console.log('Please go to https://www.printful.com/dashboard/store/products and create a "Poster" product.');
            return;
        }

        // 2. For each product, get its variants
        for (const product of products) {
            console.log(`\nProduct: ${product.name} (ID: ${product.id})`);

            const variantRes = await axios.get(`https://api.printful.com/store/products/${product.id}`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });

            const variants = variantRes.data.result.sync_variants;
            variants.forEach(v => {
                console.log(`   - Size/Name: ${v.name}`);
                console.log(`     Variant ID: ${v.id}  <-- THIS IS WHAT WE NEED`);
                console.log(`     Retail Price: ${v.retail_price}`);
            });
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

getVariants();
