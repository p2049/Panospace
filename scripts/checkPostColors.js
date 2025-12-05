// Check actual color fields in Firestore posts
// Run: node scripts/checkPostColors.js

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
    readFileSync('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkPostColors() {
    try {
        console.log('🔍 Checking Firestore posts for color fields...\n');

        const postsSnapshot = await db.collection('posts')
            .limit(10)
            .get();

        console.log(`Found ${postsSnapshot.size} posts\n`);
        console.log('='.repeat(60));

        postsSnapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`\n📸 Post ${index + 1} (ID: ${doc.id.substring(0, 10)}...)`);
            console.log('-'.repeat(60));

            // Check specific color fields
            const colorFields = {
                'dominantColor': data.dominantColor,
                'dominantColorHex': data.dominantColorHex,
                'colorHex': data.colorHex,
                'avgColor': data.avgColor,
                'avgColorHex': data.avgColorHex,
                'palette': data.palette,
                'color': data.color
            };

            let hasAnyColor = false;
            for (const [field, value] of Object.entries(colorFields)) {
                if (value !== undefined) {
                    console.log(`  ✅ ${field}:`, JSON.stringify(value));
                    hasAnyColor = true;
                }
            }

            if (!hasAnyColor) {
                console.log('  ❌ NO COLOR FIELDS FOUND');
            }

            // Also check for any other fields containing 'color'
            const allColorFields = Object.keys(data).filter(key =>
                key.toLowerCase().includes('color')
            );

            if (allColorFields.length > 0) {
                console.log('\n  Other color-related fields:');
                allColorFields.forEach(field => {
                    if (!colorFields[field]) {
                        console.log(`    ${field}:`, JSON.stringify(data[field]));
                    }
                });
            }
        });

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ DONE - Check the output above');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkPostColors();
