/**
 * NSFW Content Tags
 * Tags that indicate sensitive or mature content
 */

export const NSFW_TAGS = [
    'nsfw',
    'explicit',
    'mature',
    'gore',
    'violence',
    'sensitive',
    'adult',
    '18+',
    'nudity',
    'sexual'
];

/**
 * Check if post has NSFW content based on tags
 * @param {Array} tags - Array of tag strings
 * @returns {boolean} - True if post contains NSFW tags
 */
export const isNSFW = (tags) => {
    if (!tags || !Array.isArray(tags)) return false;

    return tags.some(tag => {
        const normalizedTag = tag.toLowerCase().trim();
        return NSFW_TAGS.includes(normalizedTag);
    });
};

/**
 * Get user preference for showing NSFW content
 * @returns {boolean} - True if user wants to see NSFW content
 */
export const getUserNSFWPreference = () => {
    try {
        const pref = localStorage.getItem('showNSFW');
        return pref === 'true';
    } catch (e) {
        return false; // Default to hiding NSFW
    }
};

/**
 * Set user preference for showing NSFW content
 * @param {boolean} show - Whether to show NSFW content
 */
export const setUserNSFWPreference = (show) => {
    try {
        localStorage.setItem('showNSFW', show.toString());
    } catch (e) {
        console.error('Failed to save NSFW preference:', e);
    }
};

export default { NSFW_TAGS, isNSFW, getUserNSFWPreference, setUserNSFWPreference };
