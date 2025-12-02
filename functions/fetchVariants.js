const axios = require('axios');

const API_KEY = 'AOs49jAebDspNIjMDGQN3ftq2AFur6TJEy3uTrIWoLTdwU40fmy5y79uceHQsqrX';

async function fetchProducts() {
    try {
        console.log('Fetching products...');
        // Search for "Enhanced Matte Paper Poster"
        const response = await axios.get('https://api.printful.com/products', {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        const products = response.data.result;
        const poster = products.find(p => p.title.includes('Enhanced Matte Paper Poster'));

        if (poster) {
            console.log(`Found Poster: ${poster.title} (ID: ${poster.id})`);

            // Fetch Variants
            const variantResponse = await axios.get(`https://api.printful.com/products/${poster.id}`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });

            const variants = variantResponse.data.result.variants;
            console.log('\nVariants:');
            variants.forEach(v => {
                console.log(`Size: ${v.size} | ID: ${v.id}`);
            });
        } else {
            console.log('Poster not found in search.');
            console.log('First 5 products:', products.slice(0, 5).map(p => p.title));
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

fetchProducts();
