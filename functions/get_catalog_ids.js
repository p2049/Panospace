require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const API_KEY = process.env.PRINTFUL_API_KEY;

async function getCatalogIds() {
    try {
        console.log('Fetching Catalog IDs for Enhanced Matte Paper Poster...');
        const response = await axios.get('https://api.printful.com/products/1', {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        const variants = response.data.result.variants;

        const output = [];
        output.push('FOUND VARIANTS:');

        // Print ALL variants
        variants.forEach(v => {
            output.push(`SIZE: ${v.size} | ID: ${v.id} | Price: ${v.price}`);
        });

        const result = output.join('\n');
        console.log(result);
        fs.writeFileSync('variants.txt', result);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

getCatalogIds();
