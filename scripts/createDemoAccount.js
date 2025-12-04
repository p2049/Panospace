/**
 * Create Demo Account for App Store Review
 * 
 * This script creates the required demo account for App Store reviewers.
 * Email: appreview@paxus.app
 * Password: ReviewTest123
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
let serviceAccount;
try {
    // Try to load service account from multiple possible locations
    const possiblePaths = [
        join(__dirname, '..', 'serviceAccountKey.json'),
        join(__dirname, '..', 'firebase-adminsdk.json'),
        join(__dirname, 'serviceAccountKey.json')
    ];

    for (const path of possiblePaths) {
        try {
            serviceAccount = JSON.parse(readFileSync(path, 'utf8'));
            console.log(`✅ Found service account key at: ${path}`);
            break;
        } catch (err) {
            // Continue to next path
        }
    }

    if (!serviceAccount) {
        throw new Error('Service account key not found');
    }
} catch (error) {
    console.error('❌ Error: Could not find Firebase service account key.');
    console.error('');
    console.error('📋 To fix this:');
    console.error('1. Go to Firebase Console: https://console.firebase.google.com');
    console.error('2. Select your PanoSpace project');
    console.error('3. Go to Project Settings → Service Accounts');
    console.error('4. Click "Generate New Private Key"');
    console.error('5. Save the file as "serviceAccountKey.json" in the project root');
    console.error('');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const DEMO_EMAIL = 'appreview@paxus.app';
const DEMO_PASSWORD = 'ReviewTest123';

async function createDemoAccount() {
    console.log('🚀 Creating App Store Demo Account...\n');

    try {
        // Check if user already exists
        try {
            const existingUser = await admin.auth().getUserByEmail(DEMO_EMAIL);
            console.log('⚠️  User already exists!');
            console.log(`   UID: ${existingUser.uid}`);
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Created: ${existingUser.metadata.creationTime}`);
            console.log('');

            const readline = await import('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise((resolve) => {
                rl.question('Do you want to delete and recreate this account? (yes/no): ', resolve);
            });
            rl.close();

            if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                console.log('🗑️  Deleting existing user...');
                await admin.auth().deleteUser(existingUser.uid);

                // Also delete Firestore user document if it exists
                try {
                    await admin.firestore().collection('users').doc(existingUser.uid).delete();
                    console.log('✅ Deleted Firestore user document');
                } catch (err) {
                    // Document might not exist, that's okay
                }

                console.log('✅ Existing user deleted\n');
            } else {
                console.log('✅ Keeping existing account. You can use it as-is!');
                console.log('');
                printCredentials();
                process.exit(0);
            }
        } catch (error) {
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
            // User doesn't exist, continue with creation
        }

        // Create the user
        console.log('👤 Creating new user account...');
        const userRecord = await admin.auth().createUser({
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
            emailVerified: true, // Mark as verified for easier testing
            displayName: 'App Review Demo'
        });

        console.log('✅ User account created successfully!');
        console.log(`   UID: ${userRecord.uid}`);
        console.log('');

        // Create Firestore user profile
        console.log('📝 Creating Firestore user profile...');
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
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

        console.log('✅ Firestore profile created\n');

        // Success message
        console.log('🎉 Demo account setup complete!\n');
        printCredentials();
        printNextSteps();

    } catch (error) {
        console.error('❌ Error creating demo account:', error.message);
        if (error.code) {
            console.error(`   Error code: ${error.code}`);
        }
        process.exit(1);
    }
}

function printCredentials() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 DEMO ACCOUNT CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('   Email:    appreview@paxus.app');
    console.log('   Password: ReviewTest123');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
}

function printNextSteps() {
    console.log('📌 NEXT STEPS:');
    console.log('');
    console.log('1. ✅ Test the account by logging in to your app');
    console.log('2. ✅ Create a test post');
    console.log('3. ✅ Try searching, commenting, and liking');
    console.log('4. ✅ Verify all features work correctly');
    console.log('');
    console.log('5. 🚀 Add these credentials to App Store Connect:');
    console.log('   - Go to your app submission');
    console.log('   - Add demo account info in "App Review Information"');
    console.log('   - Include any special instructions if needed');
    console.log('');
    console.log('✨ You\'re now ready for App Store submission!');
    console.log('');
}

// Run the script
createDemoAccount().catch(console.error);
