import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Get personalized search filters for the Explore feed
 * based on the user's profile, activity, and preferences.
 * 
 * @param {string} userId - The current user's ID
 * @returns {Promise<Object>} - A set of filters to pass to useSearch
 */
export const getRecommendations = async (userId) => {
    if (!userId) return { coldStart: true };

    try {
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) return { coldStart: true };

        const userData = userSnap.data();
        const filters = {};
        let hasSignals = false;

        // 1. Art Disciplines / Tags
        // If user has selected art types, use them as base tags
        if (userData.artTypes && userData.artTypes.length > 0) {
            // Pick up to 3 random art types to diversify the feed
            const shuffled = [...userData.artTypes].sort(() => 0.5 - Math.random());
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
