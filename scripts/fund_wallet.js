import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, setDoc, runTransaction } from 'firebase/firestore';
// dotenv dependency removed in favor of node --env-file


const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const UID = 'ycRf4K5fWSRnD34hW4G2l9Yla2H3';

async function fundWallet() {
    try {
        const userRef = doc(db, 'users', UID);

        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User does not exist!");
            }

            const currentWallet = userDoc.data().wallet || {
                balance: 0,
                lifetimeEarnings: 0,
                lifetimeSpent: 0
            };

            const newBalance = (currentWallet.balance || 0) + 100.00;

            transaction.update(userRef, {
                wallet: {
                    ...currentWallet,
                    balance: newBalance
                }
            });

            console.log(`Successfully added $100. New Balance: $${newBalance}`);
        });

    } catch (error) {
        console.error("Error funding wallet:", error);
    }
}

fundWallet();
