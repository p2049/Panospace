import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { UserProfile } from '@/types';

/**
 * Get personalized search filters for the Explore feed
 * based on the user's profile, activity, and preferences.
 */
export const getRecommendations = async (userId: string): Promise<any> => {
    if (!userId) return { coldStart: true };

    try {
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) return { coldStart: true };

        const userData = userSnap.data() as Partial<UserProfile>;
        const filters: any = {};
        let hasSignals = false;

        // 1. Art Disciplines / Tags
        // If user has selected art types, use them as base tags
        // Using 'artTypes' from legacy/data (not strictly in UserProfile type but might be there)
        const artTypes = (userData as any).artTypes;
        if (artTypes && Array.isArray(artTypes) && artTypes.length > 0) {
            // Pick up to 3 random art types to diversify the feed
            const shuffled = [...artTypes].sort(() => 0.5 - Math.random());
            filters.tags = shuffled.slice(0, 3);
            hasSignals = true;
        }

        // Check for other signals (placeholder for now, but logic is here)
        // if (userData.following && userData.following.length > 0) hasSignals = true;
        // if (userData.likedPosts && userData.likedPosts.length > 0) hasSignals = true;
        // if (userData.cameraSystem) hasSignals = true;

        // If no signals were found, mark as cold start
        if (!hasSignals) {
            return { coldStart: true };
        }

        return filters;
    } catch (error) {
        console.error("Error getting recommendations:", error);
        return { coldStart: true }; // Fallback to cold start on error
    }
};
