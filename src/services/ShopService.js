// Shop Service - Handles shop setup, drafts, and publishing
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { canBypassShopSetup } from '../config/devConfig';

export const ShopService = {
    /**
     * Check if user has completed shop setup
     * @param {string} userId - User's UID
     * @param {string} userEmail - User's email (for bypass check)
     * @returns {Promise<{isComplete: boolean, canBypass: boolean, shopData: object}>}
     */
    async checkShopSetup(userId, userEmail = '') {
        try {
            // Check if user can bypass
            const canBypass = canBypassShopSetup(userId, userEmail);

            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.data();

            const shopSetup = userData?.shopSetup || {
                isComplete: false,
                acceptedTermsAt: null,
                acceptedCopyrightAt: null,
                shopName: '',
                bio: '',
                setupCompletedAt: null
            };

            return {
                isComplete: shopSetup.isComplete || false,
                canBypass,
                shopData: shopSetup
            };
        } catch (error) {
            console.error('Error checking shop setup:', error);
            throw error;
        }
    },

    /**
     * Complete shop setup for a user
     * @param {string} userId - User's UID
     * @param {object} shopData - Shop setup data
     * @returns {Promise<void>}
     */
    async completeShopSetup(userId, shopData) {
        try {
            const userRef = doc(db, 'users', userId);

            await updateDoc(userRef, {
                shopSetup: {
                    isComplete: true,
                    acceptedTermsAt: serverTimestamp(),
                    acceptedCopyrightAt: serverTimestamp(),
                    shopName: shopData.shopName || '',
                    bio: shopData.bio || '',
                    setupCompletedAt: serverTimestamp()
                }
            });

            console.log('Shop setup completed for user:', userId);
        } catch (error) {
            console.error('Error completing shop setup:', error);
            throw error;
        }
    },

    /**
     * Get all shop drafts for a user
     * @param {string} userId - User's UID
     * @returns {Promise<Array>} - Array of draft objects
     */
    async getDrafts(userId) {
        try {
            const draftsQuery = query(
                collection(db, 'shopDrafts'),
                where('userId', '==', userId),
                where('status', '==', 'draft')
            );

            const snapshot = await getDocs(draftsQuery);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching drafts:', error);
            throw error;
        }
    },

    /**
     * Create a shop draft
     * @param {object} draftData - Draft data
     * @returns {Promise<string>} - Draft ID
     */
    async createDraft(draftData) {
        try {
            const draftRef = await addDoc(collection(db, 'shopDrafts'), {
                userId: draftData.userId,
                postId: draftData.postId,
                itemId: draftData.itemId,
                imageUrl: draftData.imageUrl,
                title: draftData.title,
                productTier: draftData.productTier,
                customPrices: draftData.customPrices || {},
                status: 'draft',
                createdAt: serverTimestamp(),
                publishedAt: null,
                copyrightConfirmedAt: null
            });

            return draftRef.id;
        } catch (error) {
            console.error('Error creating draft:', error);
            throw error;
        }
    },

    /**
     * Publish a draft (moves it to published state)
     * @param {string} draftId - Draft ID
     * @param {string} userId - User's UID
     * @param {boolean} copyrightConfirmed - Whether user confirmed copyright ownership
     * @returns {Promise<void>}
     */
    async publishDraft(draftId, userId, copyrightConfirmed = false) {
        try {
            if (!copyrightConfirmed) {
                throw new Error('Copyright confirmation required to publish');
            }

            const draftRef = doc(db, 'shopDrafts', draftId);
            const draftDoc = await getDoc(draftRef);

            if (!draftDoc.exists()) {
                throw new Error('Draft not found');
            }

            const draftData = draftDoc.data();

            if (draftData.userId !== userId) {
                throw new Error('Unauthorized: Cannot publish another user\'s draft');
            }

            // Update draft status
            await updateDoc(draftRef, {
                status: 'published',
                publishedAt: serverTimestamp(),
                copyrightConfirmedAt: serverTimestamp()
            });

            // Update the associated post to mark shop as enabled
            const postRef = doc(db, 'posts', draftData.postId);
            await updateDoc(postRef, {
                shopEnabled: true,
                'shopProducts': draftData // Add product data to post
            });

            console.log('Draft published:', draftId);
        } catch (error) {
            console.error('Error publishing draft:', error);
            throw error;
        }
    },

    /**
     * Unpublish a product (moves it back to draft)
     * @param {string} draftId - Draft/Product ID
     * @param {string} userId - User's UID
     * @returns {Promise<void>}
     */
    async unpublishProduct(draftId, userId) {
        try {
            const draftRef = doc(db, 'shopDrafts', draftId);
            const draftDoc = await getDoc(draftRef);

            if (!draftDoc.exists()) {
                throw new Error('Product not found');
            }

            const draftData = draftDoc.data();

            if (draftData.userId !== userId) {
                throw new Error('Unauthorized: Cannot unpublish another user\'s product');
            }

            await updateDoc(draftRef, {
                status: 'draft',
                publishedAt: null
            });

            console.log('Product unpublished:', draftId);
        } catch (error) {
            console.error('Error unpublishing product:', error);
            throw error;
        }
    },

    /**
     * Delete a draft
     * @param {string} draftId - Draft ID
     * @param {string} userId - User's UID
     * @returns {Promise<void>}
     */
    async deleteDraft(draftId, userId) {
        try {
            const draftRef = doc(db, 'shopDrafts', draftId);
            const draftDoc = await getDoc(draftRef);

            if (!draftDoc.exists()) {
                throw new Error('Draft not found');
            }

            const draftData = draftDoc.data();

            if (draftData.userId !== userId) {
                throw new Error('Unauthorized: Cannot delete another user\'s draft');
            }

            await updateDoc(draftRef, {
                status: 'deleted',
                deletedAt: serverTimestamp()
            });

            console.log('Draft deleted:', draftId);
        } catch (error) {
            console.error('Error deleting draft:', error);
            throw error;
        }
    }
};
