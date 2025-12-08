import { db } from '@/firebase';
import { doc, getDoc, getDocs, addDoc, updateDoc, collection, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { SpaceCardService } from './SpaceCardService';

export const SoundTagService = {
    /**
     * Create a new SoundTag
     */
    createSoundTag: async (soundTagData) => {
        try {
            const {
                artistId,
                title,
                audioUrl,
                price,
                requiresLicenseCard,
                requiredCardId,
                editionSize,
                collaborators,
                metadata
            } = soundTagData;

            if (!artistId || !title || !audioUrl) {
                throw new Error('Missing required SoundTag fields');
            }

            const soundTagDoc = {
                artistId,
                title,
                audioUrl,
                price: price || 0,
                requiresLicenseCard: requiresLicenseCard || false,
                requiredCardId: requiredCardId || null,
                editionSize: editionSize || null,
                collaborators: collaborators || [],
                metadata: metadata || {},
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                stats: {
                    totalLicenses: 0,
                    totalRevenue: 0
                }
            };

            const docRef = await addDoc(collection(db, 'soundtags'), soundTagDoc);
            return { id: docRef.id, ...soundTagDoc };
        } catch (error) {
            console.error('Error creating SoundTag:', error);
            throw error;
        }
    },

    /**
     * Get SoundTag by ID
     */
    getSoundTag: async (soundTagId) => {
        try {
            const docRef = doc(db, 'soundtags', soundTagId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting SoundTag:', error);
            throw error;
        }
    },

    /**
     * Get SoundTags created by an artist
     */
    getUserSoundTags: async (artistId) => {
        try {
            const q = query(
                collection(db, 'soundtags'),
                where('artistId', '==', artistId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching user SoundTags:', error);
            return [];
        }
    },

    /**
     * Check if user has license for a SoundTag
     * (Checks if they own the required SpaceCard if applicable)
     */
    checkLicense: async (userId, soundTagId) => {
        try {
            const soundTag = await SoundTagService.getSoundTag(soundTagId);
            if (!soundTag) return { authorized: false, error: 'Tag not found' };

            if (!soundTag.requiresLicenseCard) {
                return { authorized: true, soundTag };
            }

            if (soundTag.requiredCardId) {
                const userCards = await SpaceCardService.getUserSpaceCards(userId);
                const hasCard = userCards.some(card => card.id === soundTag.requiredCardId || card.spacecardId === soundTag.requiredCardId);
                return {
                    authorized: hasCard,
                    requiredCardId: soundTag.requiredCardId,
                    soundTag
                };
            }

            return { authorized: true, soundTag };
        } catch (error) {
            console.error('Error checking license:', error);
            return { authorized: false, error: error.message };
        }
    },

    /**
     * Acquire license for a SoundTag
     * (Placeholder for future purchase logic, currently just adds to user collection if free/unlocked)
     */
    licenseSoundTag: async (userId, soundTagId) => {
        try {
            const hasLicense = await SoundTagService.checkLicense(userId, soundTagId);
            if (!hasLicense) {
                throw new Error('User does not meet requirements to license this SoundTag');
            }

            // In future, this would create a license record in a 'user_licenses' collection
            // For now, we return success
            return true;
        } catch (error) {
            console.error('Error licensing SoundTag:', error);
            throw error;
        }
    }
};
