import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Users Service
 * Core logic for user profile management.
 */

const DEFAULT_ACCOUNT_TYPE = 'art';

/**
 * Get user's account type
 */
export const getAccountType = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            return DEFAULT_ACCOUNT_TYPE;
        }

        const userData = userDoc.data();
        return userData?.accountType || DEFAULT_ACCOUNT_TYPE;
    } catch (error) {
        console.error('Error getting account type:', error);
        return DEFAULT_ACCOUNT_TYPE;
    }
};

/**
 * Set user's account type
 */
export const setAccountType = async (userId, accountType) => {
    try {
        if (accountType !== 'art' && accountType !== 'social') {
            throw new Error('Invalid account type. Must be "art" or "social"');
        }

        await updateDoc(doc(db, 'users', userId), {
            accountType
        });

        console.log(`Account type updated to ${accountType} for user ${userId}`);
    } catch (error) {
        console.error('Error setting account type:', error);
        throw error;
    }
};

export const AccountTypeService = {
    getAccountType,
    setAccountType
};
