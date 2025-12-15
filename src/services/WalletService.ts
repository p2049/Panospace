import { db } from '@/firebase';
import {
    doc,
    getDoc,
    runTransaction,
    collection,
    serverTimestamp,
    query,
    where,
    orderBy,
    getDocs,
    limit,
    Timestamp,
    type DocumentData,
    type Transaction as FirestoreTransaction
} from 'firebase/firestore';

export interface Wallet {
    balance: number;
    lifetimeEarnings: number;
    lifetimeSpent: number;
    pendingPayout: number;
    currency: string;
}

export interface WalletTransaction {
    id: string;
    userId: string;
    type: 'sale' | 'purchase' | 'deposit' | 'withdrawal' | 'royalty' | 'fee' | 'refund' | 'commission';
    amount: number;
    description: string;
    relatedItemId?: string | null;
    relatedItemType?: string | null;
    createdAt: Date;
}

export const WalletService = {
    getWallet: async (userId: string): Promise<Wallet> => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                return (data.wallet as Wallet) || {
                    balance: 0,
                    lifetimeEarnings: 0,
                    lifetimeSpent: 0,
                    pendingPayout: 0,
                    currency: 'USD'
                };
            }
            // Return default wallet for non-existent users (or handle as error depending on logic)
            return {
                balance: 0,
                lifetimeEarnings: 0,
                lifetimeSpent: 0,
                pendingPayout: 0,
                currency: 'USD'
            };
        } catch (error) {
            console.error("Error fetching wallet:", error);
            throw error;
        }
    },

    /**
     * Add funds to a user's wallet (e.g. from a sale or deposit)
     */
    addFunds: async (userId: string, amount: number, type: 'sale' | 'deposit' | 'royalty' | 'refund' | 'commission', description: string, relatedItemId: string | null = null, relatedItemType: string | null = null): Promise<boolean> => {
        try {
            await runTransaction(db, async (transaction: FirestoreTransaction) => {
                const userRef = doc(db, 'users', userId);
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    throw new Error("User does not exist!");
                }

                const userData = userDoc.data();
                const currentWallet: Wallet = (userData.wallet as Wallet) || {
                    balance: 0,
                    lifetimeEarnings: 0,
                    lifetimeSpent: 0,
                    pendingPayout: 0,
                    currency: 'USD'
                };

                const newBalance = (currentWallet.balance || 0) + amount;
                const newLifetimeEarnings = type === 'sale' || type === 'royalty' || type === 'commission'
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
                    type,
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
    subtractFunds: async (userId: string, amount: number, type: 'purchase' | 'withdrawal' | 'fee', description: string, relatedItemId: string | null = null, relatedItemType: string | null = null): Promise<boolean> => {
        try {
            await runTransaction(db, async (transaction: FirestoreTransaction) => {
                const userRef = doc(db, 'users', userId);
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    throw new Error("User does not exist!");
                }

                const userData = userDoc.data();
                const currentWallet: Wallet = (userData.wallet as Wallet) || {
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
                    type,
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
    processPrimaryPurchase: async (buyerId: string, sellerId: string, itemId: string, itemType: string, price: number, title: string): Promise<boolean> => {
        try {
            // 1. Deduct from Buyer - REMOVED for Earnings Ledger Refactor
            // We no longer track spending in the wallet, only earnings.
            // await WalletService.subtractFunds(buyerId, price, 'purchase', `Purchased ${title}`, itemId, itemType);

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
    processResale: async (buyerId: string, sellerId: string, originalArtistId: string, itemId: string, itemType: string, price: number, title: string): Promise<boolean> => {
        const PLATFORM_FEE_PERCENT = 0.10;
        const ARTIST_ROYALTY_PERCENT = 0.05;

        const platformFee = price * PLATFORM_FEE_PERCENT;
        const artistRoyalty = price * ARTIST_ROYALTY_PERCENT;
        const sellerNet = price - platformFee - artistRoyalty;

        try {
            // 1. Deduct full amount from Buyer - REMOVED
            // await WalletService.subtractFunds(buyerId, price, 'purchase', `Purchased resale: ${title}`, itemId, itemType);

            // 2. Add Net to Seller
            await WalletService.addFunds(sellerId, sellerNet, 'sale', `Sold resale: ${title}`, itemId, itemType);

            // 3. Add Royalty to Original Artist
            if (originalArtistId && originalArtistId !== sellerId) {
                await WalletService.addFunds(originalArtistId, artistRoyalty, 'royalty', `Royalty from resale of ${title}`, itemId, itemType);
            }

            // 4. Platform Fee - Tracked internally (not implemented in this ledger)

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
    processCommissionPayment: async (buyerId: string, sellerId: string, commissionId: string, price: number, title: string): Promise<boolean> => {
        try {
            // 1. Deduct from Buyer - REMOVED
            // await WalletService.subtractFunds(buyerId, price, 'purchase', `Commission Payment: ${title}`, commissionId, 'commission');

            // 2. Add to Seller
            await WalletService.addFunds(sellerId, price, 'commission', `Commission Earned: ${title}`, commissionId, 'commission');

            return true;
        } catch (error) {
            console.error("Error processing commission payment:", error);
            throw error;
        }
    },

    /**
     * Get transaction history for a user
     */
    getTransactions: async (userId: string): Promise<WalletTransaction[]> => {
        try {
            const q = query(
                collection(db, 'transactions'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(50)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate()
                } as WalletTransaction;
            });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    }
};
