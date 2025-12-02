import { db } from '../firebase';
import { doc, getDoc, getDocs, addDoc, updateDoc, collection, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';

export const PanoDexService = {
    /**
     * Create a new PanoDex entry
     */
    createEntry: async (entryData) => {
        try {
            const {
                type,
                title,
                imageUrl,
                description,
                unlockType,
                relatedCardId,
                requirements
            } = entryData;

            if (!type || !title) {
                throw new Error('Missing required PanoDex entry fields');
            }

            const entryDoc = {
                type, // 'location', 'challenge', 'audio', 'landmark', 'style'
                title,
                imageUrl: imageUrl || null,
                description: description || '',
                unlockType: unlockType || 'visit', // 'visit', 'photo', 'audio', 'challenge'
                relatedCardId: relatedCardId || null,
                requirements: requirements || [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                stats: {
                    totalUnlocked: 0
                }
            };

            const docRef = await addDoc(collection(db, 'panodex_entries'), entryDoc);
            return { id: docRef.id, ...entryDoc };
        } catch (error) {
            console.error('Error creating PanoDex entry:', error);
            throw error;
        }
    },

    /**
     * Get PanoDex entry by ID
     */
    getEntry: async (entryId) => {
        try {
            const docRef = doc(db, 'panodex_entries', entryId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting PanoDex entry:', error);
            throw error;
        }
    },

    /**
     * Get all PanoDex entries (for browsing)
     */
    getAllEntries: async () => {
        try {
            const q = query(
                collection(db, 'panodex_entries'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching PanoDex entries:', error);
            return [];
        }
    },

    /**
     * Get user's unlocked entries
     * (Placeholder: assumes a 'user_panodex' collection will exist or stored in user profile)
     */
    getUserEntries: async (userId) => {
        try {
            // This would query a 'user_panodex' collection in a full implementation
            // For now returning empty array as placeholder
            return [];
        } catch (error) {
            console.error('Error fetching user PanoDex entries:', error);
            return [];
        }
    },

    /**
     * Unlock a PanoDex entry
     */
    unlockEntry: async (userId, entryId, proof = {}) => {
        try {
            const entry = await PanoDexService.getEntry(entryId);
            if (!entry) throw new Error('Entry not found');

            // Validate requirements (placeholder logic)
            const canUnlock = await PanoDexService.checkRequirements(userId, entry, proof);
            if (!canUnlock) {
                throw new Error('Requirements not met');
            }

            // Create unlock record (placeholder)
            // await addDoc(collection(db, 'user_panodex'), { userId, entryId, unlockedAt: serverTimestamp() });

            return true;
        } catch (error) {
            console.error('Error unlocking entry:', error);
            throw error;
        }
    },

    /**
     * Check if user meets requirements to unlock
     */
    checkRequirements: async (userId, entry, proof) => {
        // Placeholder validation logic
        return true;
    }
};
