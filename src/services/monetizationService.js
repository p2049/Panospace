import {
    doc,
    updateDoc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Monetization Service
 * Handles PanoSpace Ultra, Boosts, Commissions, and Partner Tiers.
 */

export const USER_TIERS = {
    FREE: 'free',
    ULTRA: 'ultra',
    PARTNER: 'partner'
};

export const PARTNER_TYPES = {
    CITY: 'city',
    CAMPUS: 'campus',
    PARK: 'park'
};

export const BOOST_LEVELS = {
    1: { label: 'Standard Boost', multiplier: 1.2, durationHours: 12, priceCents: 99 },
    2: { label: 'Super Boost', multiplier: 1.5, durationHours: 24, priceCents: 299 },
    3: { label: 'Mega Boost', multiplier: 2.0, durationHours: 24, priceCents: 499 }
};

/**
 * Get the monetization tier of a user
 * @param {string} userId 
 * @returns {Promise<string>} 'free', 'ultra', or 'partner'
 */
export const getUserTier = async (userId) => {
    if (!userId) return USER_TIERS.FREE;
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return USER_TIERS.FREE;

        const data = userDoc.data();
        if (data.isPartner) return USER_TIERS.PARTNER;
        if (data.isUltra) return USER_TIERS.ULTRA;
        return USER_TIERS.FREE;
    } catch (error) {
        console.error("Error getting user tier:", error);
        return USER_TIERS.FREE;
    }
};

/**
 * Subscribe user to Space Creator (formerly Ultra)
 * Cost: $5.00 / month
 * @param {string} userId 
 */
export const subscribeToUltra = async (userId) => {
    const PRICE = 5.00;

    try {
        // 1. Deduct funds from user wallet
        // Dynamic import to avoid circular dependency
        const { WalletService } = await import('./WalletService');

        await WalletService.subtractFunds(
            userId,
            PRICE,
            'purchase',
            'Space Creator Subscription (1 Month)',
            'subscription_monthly',
            'subscription'
        );

        // 2. Activate Subscription
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isUltra: true, // Keeping internal flag as isUltra for compatibility
            subscriptionStatus: 'active',
            subscriptionPlan: 'space_creator_monthly',
            subscriptionUpdatedAt: serverTimestamp(),
            subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
        });
        return { success: true };
    } catch (error) {
        console.error("Error subscribing to Space Creator:", error);
        throw error;
    }
};

/**
 * Purchase a boost for a post
 * @param {string} userId - The user purchasing the boost
 * @param {string} postId - The post to boost
 * @param {number} level - 1, 2, or 3
 */
export const purchaseBoost = async (userId, postId, level = 1) => {
    const boostConfig = BOOST_LEVELS[level];
    if (!boostConfig) throw new Error("Invalid boost level");

    const priceInDollars = boostConfig.priceCents / 100;

    try {
        // 1. Deduct funds from user wallet
        const { WalletService } = await import('./WalletService');
        await WalletService.subtractFunds(
            userId,
            priceInDollars,
            'purchase',
            `Boosted post (${boostConfig.label})`,
            postId,
            'boost'
        );

        // 2. Update post with boost data
        const postRef = doc(db, 'posts', postId);

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + boostConfig.durationHours);

        await updateDoc(postRef, {
            boostLevel: level,
            boostMultiplier: boostConfig.multiplier,
            boostExpiresAt: expiresAt,
            isBoosted: true,
            boostedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Error purchasing boost:", error);
        throw error;
    }
};

/**
 * Create a commission request
 * @param {string} editorId 
 * @param {string} buyerId 
 * @param {string} rawFileUrl 
 * @param {number} price 
 * @param {string} instructions 
 */
export const createCommission = async (editorId, buyerId, rawFileUrl, price, instructions = '') => {
    try {
        // 1. Create the commission document first
        const commissionData = {
            editorId,
            buyerId,
            rawFileUrl,
            price,
            instructions,
            status: 'pending', // Paid, waiting for editor to accept/start
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'commissions'), commissionData);

        // 2. Process Payment
        // We import WalletService dynamically to avoid circular dependencies if any
        const { default: WalletService } = await import('./WalletService');
        await WalletService.processCommissionPayment(buyerId, editorId, price, docRef.id);

        return { id: docRef.id, ...commissionData };
    } catch (error) {
        console.error("Error creating commission:", error);
        throw error;
    }
};

/**
 * Get commissions for a user
 * @param {string} userId 
 * @param {string} role 'editor' or 'buyer'
 */
export const getCommissions = async (userId, role = 'editor') => {
    try {
        const q = query(
            collection(db, 'commissions'),
            where(role === 'editor' ? 'editorId' : 'buyerId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting commissions:", error);
        return [];
    }
};

/**
 * Create a Digital Museum (Partner Feature)
 * @param {string} partnerId 
 * @param {object} museumData 
 */
export const createMuseum = async (partnerId, museumData) => {
    try {
        // Verify partner status first
        const tier = await getUserTier(partnerId);
        if (tier !== USER_TIERS.PARTNER) throw new Error("Only partners can create museums");

        const data = {
            ...museumData,
            ownerId: partnerId,
            createdAt: serverTimestamp(),
            type: museumData.type || PARTNER_TYPES.CITY // Default to city
        };

        const docRef = await addDoc(collection(db, 'museums'), data);
        return { id: docRef.id, ...data };
    } catch (error) {
        console.error("Error creating museum:", error);
        throw error;
    }
};

/**
 * Get Sponsored Cards (Ads)
 * @param {number} limitCount 
 */
export const getSponsoredCards = async (limitCount = 1) => {
    // In a real system, this would fetch from an 'ads' collection based on targeting
    // For now, return a mock ad
    return [{
        id: 'sponsored_mock_1',
        type: 'sponsored',
        title: 'Upgrade to Ultra',
        description: 'Unlock exclusive features, contests, and more with PanoSpace Ultra.',
        imageUrl: 'https://placehold.co/600x400/000000/FFFFFF/png?text=PanoSpace+Ultra',
        ctaLink: '/ultra',
        ctaText: 'Learn More'
    }];
};
