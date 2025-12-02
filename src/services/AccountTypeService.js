// Account Type Service - Manages user account types (Art vs Social)
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FEED_CONFIG } from '../config/feedConfig';

export const AccountTypeService = {
    /**
     * Get user's account type
     * @param {string} userId - User's UID
     * @returns {Promise<string>} - 'art' or 'social'
     */
    async getAccountType(userId) {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (!userDoc.exists()) {
                return FEED_CONFIG.DEFAULT_ACCOUNT_TYPE;
            }

            const userData = userDoc.data();
            return userData?.accountType || FEED_CONFIG.DEFAULT_ACCOUNT_TYPE;
        } catch (error) {
            console.error('Error getting account type:', error);
            return FEED_CONFIG.DEFAULT_ACCOUNT_TYPE;
        }
    },

    /**
     * Set user's account type
     * @param {string} userId - User's UID
     * @param {string} accountType - 'art' or 'social'
     * @returns {Promise<void>}
     */
    async setAccountType(userId, accountType) {
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
    },

    /**
     * Link two accounts together (Phase 2 feature)
     * @param {string} userId1 - First user ID
     * @param {string} userId2 - Second user ID
     * @returns {Promise<void>}
     */
    async linkAccounts(userId1, userId2) {
        if (!FEED_CONFIG.ENABLE_LINKED_ACCOUNTS) {
            throw new Error('Linked accounts feature is not enabled');
        }

        // Phase 2 implementation
        throw new Error('Linked accounts not yet implemented');
    }
};
