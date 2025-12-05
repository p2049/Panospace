// Check actual color fields in Firestore posts
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkPostColors() {
    try {
        const postsSnapshot = await db.collection('posts')
            .limit(5)
            .get();

        console.log('=== CHECKING POST COLOR FIELDS ===\n');
        console.log(`Found ${postsSnapshot.size} posts\n`);

        postsSnapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`\n📸 Post ${index + 1} (ID: ${doc.id}):`);
            console.log('  dominantColor:', data.dominantColor || '(not set)');
            console.log('  dominantColorHex:', data.dominantColorHex || '(not set)');
            console.log('  colorHex:', data.colorHex || '(not set)');
            console.log('  avgColor:', data.avgColor || '(not set)');
            console.log('  avgColorHex:', data.avgColorHex || '(not set)');
            console.log('  palette:', data.palette || '(not set)');
            console.log('  color:', data.color || '(not set)');

            // Show ALL fields that contain 'color' in the name
            const colorFields = Object.keys(data).filter(key =>
                key.toLowerCase().includes('color')
            );
            if (colorFields.length > 0) {
                console.log('\n  All color-related fields found:');
                colorFields.forEach(field => {
                    console.log(`    ${field}:`, data[field]);
                });
            }
        });

        console.log('\n\n=== DONE ===');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkPostColors();
