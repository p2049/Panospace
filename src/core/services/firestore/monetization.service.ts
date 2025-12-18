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
    orderBy
} from 'firebase/firestore';
import { db } from '@/firebase';

import { logger } from '@/core/utils/logger';

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
 */
export const getUserTier = async (userId: string) => {
    if (!userId) return USER_TIERS.FREE;

    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return USER_TIERS.FREE;

        const data = userDoc.data();

        // Partner check is primary (Admin/Staff)
        if (data.isPartner || data.isAdmin) return USER_TIERS.PARTNER;
        // Ultra check
        if (data.isUltra || data.isPro) return USER_TIERS.ULTRA;

        return USER_TIERS.FREE;
    } catch (error) {
        logger.error("Error getting user tier:", error);
        return USER_TIERS.FREE;
    }
};

/**
 * Subscribe user to Space Creator (formerly Ultra)
 * Cost: $5.00 / month
 */
export const subscribeToUltra = async (userId: string) => {
    const PRICE = 5.00;

    try {
        // Dynamic import to avoid circular dependency
        // Assuming WalletService will be moved or is accessible via alias
        const { WalletService } = await import('@/services/WalletService');

        await WalletService.subtractFunds(
            userId,
            PRICE,
            'purchase',
            'Space Creator Subscription (1 Month)',
            'subscription_monthly',
            'subscription'
        );

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isUltra: true,
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
 */
export const purchaseBoost = async (userId: string, postId: string, level = 1) => {
    const boostConfig = (BOOST_LEVELS as any)[level] || BOOST_LEVELS[1];
    const priceInDollars = boostConfig.priceCents / 100;

    try {
        const { WalletService } = await import('@/services/WalletService');
        await WalletService.subtractFunds(
            userId,
            priceInDollars,
            'purchase',
            `Boosted post (${boostConfig.label})`,
            postId,
            'boost'
        );

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
 */
export const createCommission = async (editorId: string, buyerId: string, rawFileUrl: string, price: number, instructions = '') => {
    try {
        const commissionData = {
            editorId,
            buyerId,
            rawFileUrl,
            price,
            instructions,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'commissions'), commissionData);

        const { WalletService } = await import('@/services/WalletService');
        await WalletService.processCommissionPayment(buyerId, editorId, docRef.id, price, 'Commission Payment');

        return { id: docRef.id, ...commissionData };
    } catch (error) {
        console.error("Error creating commission:", error);
        throw error;
    }
};

/**
 * Get commissions for a user
 */
export const getCommissions = async (userId: string, role = 'editor') => {
    try {
        const q = query(
            collection(db, 'commissions'),
            where(role === 'editor' ? 'editorId' : 'buyerId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        logger.error("Error getting commissions:", error);
        return [];
    }
};

/**
 * Create a Digital Museum (Partner Feature)
 */
export const createMuseum = async (partnerId: string, museumData: any) => {
    try {
        const tier = await getUserTier(partnerId);
        if (tier !== USER_TIERS.PARTNER) throw new Error("Only partners can create museums");

        const data = {
            ...museumData,
            ownerId: partnerId,
            createdAt: serverTimestamp(),
            type: museumData.type || PARTNER_TYPES.CITY
        };

        const docRef = await addDoc(collection(db, 'museums'), data);
        return { id: docRef.id, ...data };
    } catch (error) {
        logger.error("Error creating museum:", error);
        throw error;
    }
};

/**
 * Get Sponsored Cards (Ads)
 */
export const getSponsoredCards = async (limitCount = 1) => {
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
