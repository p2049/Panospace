import { db } from '@/firebase';
import { doc, getDoc, updateDoc, runTransaction, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

export const WalletService = {
    getWallet: async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                return userDoc.data().wallet || {
                    balance: 0,
                    lifetimeEarnings: 0,
                    lifetimeSpent: 0,
                    pendingPayout: 0,
                    currency: 'USD'
                };
            }
            return null;
        } catch (error) {
            console.error("Error fetching wallet:", error);
            throw error;
        }
    },

    /**
     * Add funds to a user's wallet (e.g. from a sale or deposit)
     */
    addFunds: async (userId, amount, type, description, relatedItemId = null, relatedItemType = null) => {
        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', userId);
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    throw new Error("User does not exist!");
                }

                const currentWallet = userDoc.data().wallet || {
                    balance: 0,
                    lifetimeEarnings: 0,
                    lifetimeSpent: 0,
                    pendingPayout: 0,
                    currency: 'USD'
                };

                const newBalance = (currentWallet.balance || 0) + amount;
                const newLifetimeEarnings = type === 'sale' || type === 'royalty'
                    ? (currentWallet.lifetimeEarnings || 0) + amount
                    : (currentWallet.lifetimeEarnings || 0);

                // Update User Wallet
                transaction.update(userRef, {
                    wallet: {
                        ...currentWallet,
                        balance: newBalance,
                        lifetimeEarnings: newLifetimeEarnings
                    }
                });

                // Create Transaction Record
                const transactionRef = doc(collection(db, 'transactions'));
                transaction.set(transactionRef, {
                    userId,
                    type, // 'sale', 'deposit', 'royalty', 'refund'
                    amount,
                    description,
                    relatedItemId,
                    relatedItemType,
                    createdAt: serverTimestamp()
                });
            });
            return true;
        } catch (error) {
            console.error("Error adding funds:", error);
            throw error;
        }
    },

    /**
     * Subtract funds from a user's wallet (e.g. purchase or withdrawal)
     */
    subtractFunds: async (userId, amount, type, description, relatedItemId = null, relatedItemType = null) => {
        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', userId);
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    throw new Error("User does not exist!");
                }

                const currentWallet = userDoc.data().wallet || {
                    balance: 0,
                    lifetimeEarnings: 0,
                    lifetimeSpent: 0,
                    pendingPayout: 0,
                    currency: 'USD'
                };

                if (currentWallet.balance < amount) {
                    throw new Error("Insufficient funds");
                }

                const newBalance = currentWallet.balance - amount;
                const newLifetimeSpent = type === 'purchase'
                    ? (currentWallet.lifetimeSpent || 0) + amount
                    : (currentWallet.lifetimeSpent || 0);

                // Update User Wallet
                transaction.update(userRef, {
                    wallet: {
                        ...currentWallet,
                        balance: newBalance,
                        lifetimeSpent: newLifetimeSpent
                    }
                });

                // Create Transaction Record
                const transactionRef = doc(collection(db, 'transactions'));
                transaction.set(transactionRef, {
                    userId,
                    type, // 'purchase', 'withdrawal', 'fee'
                    amount: -amount, // Store as negative for spending
                    description,
                    relatedItemId,
                    relatedItemType,
                    createdAt: serverTimestamp()
                });
            });
            return true;
        } catch (error) {
            console.error("Error subtracting funds:", error);
            throw error;
        }
    },

    /**
     * Process a purchase transaction (Primary Sale)
     * Splits: 100% to seller (minus potential platform fees if we add them later, currently 0 for primary)
     */
    processPrimaryPurchase: async (buyerId, sellerId, itemId, itemType, price, title) => {
        try {
            // 1. Deduct from Buyer
            await WalletService.subtractFunds(buyerId, price, 'purchase', `Purchased ${title}`, itemId, itemType);

            // 2. Add to Seller
            await WalletService.addFunds(sellerId, price, 'sale', `Sold ${title}`, itemId, itemType);

            return true;
        } catch (error) {
            console.error("Error processing primary purchase:", error);
            throw error;
        }
    },

    /**
     * Process a Resale transaction
     * Splits:
     * - Platform Fee: 10% (configurable)
     * - Artist Royalty: 5% (configurable)
     * - Seller: Remainder
     */
    processResale: async (buyerId, sellerId, originalArtistId, itemId, itemType, price, title) => {
        const PLATFORM_FEE_PERCENT = 0.10;
        const ARTIST_ROYALTY_PERCENT = 0.05;

        const platformFee = price * PLATFORM_FEE_PERCENT;
        const artistRoyalty = price * ARTIST_ROYALTY_PERCENT;
        const sellerNet = price - platformFee - artistRoyalty;

        try {
            // 1. Deduct full amount from Buyer
            await WalletService.subtractFunds(buyerId, price, 'purchase', `Purchased resale: ${title}`, itemId, itemType);

            // 2. Add Net to Seller
            await WalletService.addFunds(sellerId, sellerNet, 'sale', `Sold resale: ${title}`, itemId, itemType);

            // 3. Add Royalty to Original Artist
            if (originalArtistId && originalArtistId !== sellerId) {
                await WalletService.addFunds(originalArtistId, artistRoyalty, 'royalty', `Royalty from resale of ${title}`, itemId, itemType);
            }

            // 4. Platform Fee (Tracked in a system wallet or just deducted from circulation)
            // For now, we just don't pay it out to anyone, effectively burning it or keeping it in the system.
            // In a real app, we'd add it to a 'platform' user wallet.

            return true;
        } catch (error) {
            console.error("Error processing resale:", error);
            throw error;
        }
    },

    /**
     * Process a Commission Payment
     * Splits: 100% to seller (for now)
     */
    processCommissionPayment: async (buyerId, sellerId, commissionId, price, title) => {
        try {
            // 1. Deduct from Buyer
            await WalletService.subtractFunds(buyerId, price, 'purchase', `Commission Payment: ${title}`, commissionId, 'commission');

            // 2. Add to Seller
            await WalletService.addFunds(sellerId, price, 'sale', `Commission Earned: ${title}`, commissionId, 'commission');

            return true;
        } catch (error) {
            console.error("Error processing commission payment:", error);
            throw error;
        }
    },

    /**
     * Get transaction history for a user
     */
    getTransactions: async (userId) => {
        try {
            const q = query(
                collection(db, 'transactions'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(50)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    }
};
