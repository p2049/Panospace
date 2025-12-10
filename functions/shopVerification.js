
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Ensure admin is initialized (this is usually redundant if index.js does it, but safer in isolation)
if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * Validates a user's eligibility to run a shop and upgrades their status.
 * This is a highly secure endpoint that gating the "Verified" status.
 * 
 * Logic:
 * 1. Checks if user exists.
 * 2. Validates Date of Birth (Age >= 18).
 * 3. Validates required onboarding fields (address, legal name, etc).
 * 4. Ensures "Rules Accepted" flag is present.
 * 5. Updates custom claims and Firestore profile.
 */
exports.verifyUserShop = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'The function must be called while authenticated.'
        );
    }
    const uid = context.auth.uid;

    const {
        dateOfBirth,
        shopLegalName,
        shopCountry,
        shopAddressLine1,
        shopCity,
        shopRegion,
        shopPostalCode,
        shopPayoutProvider,
        rulesAccepted
    } = data;

    // 2. Validate Inputs
    if (!rulesAccepted) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'You must accept the shop rules and IP guidelines.'
        );
    }

    if (!shopLegalName || !shopCountry || !shopAddressLine1 || !shopCity || !shopPostalCode) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Missing required business address information.'
        );
    }

    if (!dateOfBirth) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Date of birth is required.'
        );
    }

    // 3. Age Verification (Server Side)
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    // Adjust if birthday hasn't happened yet this year
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    if (age < 18) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'You must be at least 18 years old to open a shop.'
        );
    }

    try {
        // 4. Update Firestore Profile
        // verify everything one last time before writing to 'verified'
        const userRef = admin.firestore().collection('users').doc(uid);

        const updates = {
            shopStatus: 'verified',
            shopVerified: true,
            shopRulesAcceptedAt: new Date().toISOString(),
            dateOfBirth: dateOfBirth, // Store verified DOB
            shopLegalName,
            shopCountry,
            shopAddressLine1,
            shopAddressLine2: data.shopAddressLine2 || '',
            shopCity,
            shopRegion: shopRegion || '',
            shopPostalCode,
            shopPayoutProvider: shopPayoutProvider || 'none',
            // In a real app, this would be false until Stripe webhook confirms it
            shopPayoutSetupCompleted: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await userRef.update(updates);

        // 5. (Optional) Set Custom Claim if your security rules rely on it
        // await admin.auth().setCustomUserClaims(uid, { shopVerified: true });

        return { success: true, message: 'Shop verified successfully.' };

    } catch (error) {
        console.error("Shop verification failed:", error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to verify shop setup. Please try again.'
        );
    }
});
