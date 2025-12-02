require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const API_KEY = process.env.PRINTFUL_API_KEY;

async function findStickers() {
    try {
        console.log('Searching for Kiss-Cut Stickers...');

        // Get all products
        const response = await axios.get('https://api.printful.com/products', {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        const products = response.data.result;

        // Find sticker products
        const stickers = products.filter(p =>
            p.type.toLowerCase().includes('sticker') ||
            p.title.toLowerCase().includes('sticker')
        );

        console.log(`Found ${stickers.length} sticker products:`);
        stickers.forEach(s => {
            console.log(`  - ${s.title} (ID: ${s.id})`);
        });

        // Get variants for Kiss-Cut Stickers (usually product ID 12)
        console.log('\nFetching Kiss-Cut Sticker variants...');
        const variantRes = await axios.get('https://api.printful.com/products/12', {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        const variants = variantRes.data.result.variants;
        const output = ['KISS-CUT STICKER VARIANTS:'];

        variants.forEach(v => {
            output.push(`SIZE: ${v.size} | ID: ${v.id} | Price: ${v.price}`);
        });

        const result = output.join('\n');
        console.log('\n' + result);
        fs.writeFileSync('sticker_variants.txt', result);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

findStickers();
