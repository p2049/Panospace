import { db } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface Institution {
    id: string;
    name?: string;
    domains?: string[];
    [key: string]: any;
}

export const InstitutionService = {
    /**
     * Find an institution by email domain
     */
    findInstitutionByEmail: async (email: string): Promise<Institution | null> => {
        if (!email || !email.includes('@')) return null;
        const parts = email.split('@');
        if (parts.length < 2) return null;
        const part = parts[1];
        if (!part) return null;
        const domain = part.toLowerCase();
        if (!domain || !db) return null;

        try {
            // Query for institution that has this domain in its 'domains' array
            const q = query(
                collection(db, 'institutions'),
                where('domains', 'array-contains', domain)
            );

            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;

            // Return the first match (assuming domains are unique to one institution)
            const docSnap = snapshot.docs[0];
            if (!docSnap) return null; // Extra safety for TS

            return { id: docSnap.id, ...docSnap.data() } as Institution;
        } catch (error) {
            console.error("Error finding institution:", error);
            return null;
        }
    },

    /**
     * Get institution details by ID
     */
    getInstitution: async (institutionId: string): Promise<Institution | null> => {
        try {
            const docRef = doc(db, 'institutions', institutionId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Institution;
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
    joinInstitution: async (userId: string, institutionId: string): Promise<boolean> => {
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
