import { db } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export const InstitutionService = {
    /**
     * Find an institution by email domain
     * @param {string} email 
     * @returns {Promise<Object|null>} Institution object or null
     */
    findInstitutionByEmail: async (email) => {
        if (!email || !email.includes('@')) return null;
        const domain = email.split('@')[1].toLowerCase();

        try {
            // Query for institution that has this domain in its 'domains' array
            const q = query(
                collection(db, 'institutions'),
                where('domains', 'array-contains', domain)
            );

            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;

            // Return the first match (assuming domains are unique to one institution)
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error("Error finding institution:", error);
            return null;
        }
    },

    /**
     * Get institution details by ID
     */
    getInstitution: async (institutionId) => {
        try {
            const docRef = doc(db, 'institutions', institutionId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error fetching institution:", error);
            return null;
        }
    },

    /**
     * Link a user to an institution
     */
    joinInstitution: async (userId, institutionId) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                institutionId: institutionId,
                institutionJoinedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error joining institution:", error);
            throw error;
        }
    }
};
