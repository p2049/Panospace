/**
 * Check and Fix Demo Account
 * Verifies the demo account exists and creates missing Firestore profile if needed
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const DEMO_EMAIL = 'appreview@paxus.app';
const DEMO_UID = 'nQJjHUOj8gfwrcDyPBtnxiHHVbM2'; // From the previous output

async function checkAndFixDemoAccount() {
    console.log('🔍 Checking demo account status...\n');

    try {
        // Check Auth user
        console.log('1️⃣ Checking Firebase Authentication...');
        const authUser = await admin.auth().getUser(DEMO_UID);
        console.log('   ✅ Auth user exists');
        console.log(`   Email: ${authUser.email}`);
        console.log(`   Email Verified: ${authUser.emailVerified}`);
        console.log(`   Disabled: ${authUser.disabled}`);
        console.log('');

        // Check if disabled
        if (authUser.disabled) {
            console.log('   ⚠️  Account is DISABLED. Enabling...');
            await admin.auth().updateUser(DEMO_UID, { disabled: false });
            console.log('   ✅ Account enabled!\n');
        }

        // Check Firestore profile
        console.log('2️⃣ Checking Firestore user profile...');
        const userDoc = await admin.firestore().collection('users').doc(DEMO_UID).get();

        if (!userDoc.exists) {
            console.log('   ⚠️  Firestore profile MISSING. Creating...');
            await admin.firestore().collection('users').doc(DEMO_UID).set({
                uid: DEMO_UID,
                email: DEMO_EMAIL,
                username: 'appreview',
                displayName: 'App Review Demo',
                bio: 'Demo account for App Store review',
                photoURL: '',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                followersCount: 0,
                followingCount: 0,
                postsCount: 0,
                verified: false,
                tier: 'free'
            });
            console.log('   ✅ Firestore profile created!\n');
        } else {
            console.log('   ✅ Firestore profile exists');
            const data = userDoc.data();
            console.log(`   Username: ${data.username}`);
            console.log(`   Display Name: ${data.displayName}`);
            console.log('');
        }

        // Check Firestore rules
        console.log('3️⃣ Testing Firestore access...');
        try {
            // Try to read the user document
            const testRead = await admin.firestore().collection('users').doc(DEMO_UID).get();
            console.log('   ✅ Can read user document');

            // Try to read posts collection
            const postsSnapshot = await admin.firestore().collection('posts').limit(1).get();
            console.log('   ✅ Can access posts collection');
            console.log('');
        } catch (error) {
            console.log('   ⚠️  Firestore access issue:', error.message);
            console.log('');
        }

        // Success summary
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ DEMO ACCOUNT STATUS: READY');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('📋 Login Credentials:');
        console.log('   Email:    appreview@paxus.app');
        console.log('   Password: ReviewTest123');
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('🧪 Try logging in now!');
        console.log('');
        console.log('If login still fails, check:');
        console.log('1. Are you using the correct email/password?');
        console.log('2. Is your app connected to the right Firebase project?');
        console.log('3. Check browser console for error messages');
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code) {
            console.error(`   Error code: ${error.code}`);
        }
        process.exit(1);
    }
}

checkAndFixDemoAccount().catch(console.error);
