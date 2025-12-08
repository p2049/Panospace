/**
 * Generate Search Keywords for Firestore Prefix-Based Search
 * 
 * Creates an array of lowercase keywords and prefixes from text input.
 * Used for searchable collections (posts, users, etc.)
 * 
 * Example:
 * "San Francisco" => ["san", "sa", "francisco", "fr", "fra", "fran", ...]
 * 
 * This enables prefix-based search in Firestore using array-contains queries.
 */

/**
 * Generate search keywords from a text string
 * @param {string} text - Input text to generate keywords from
 * @returns {string[]} - Array of lowercase keywords and prefixes
 */
export const generateSearchKeywords = (text) => {
    if (!text || typeof text !== 'string') return [];

    // Split by spaces and common separators
    const words = text
        .toLowerCase()
        .trim()
        .split(/[\s,._-]+/)
        .filter(word => word.length > 0);

    const keywords = new Set();

    words.forEach(word => {
        // Add the full word
        keywords.add(word);

        // Add prefixes (minimum 2 characters)
        for (let i = 2; i <= word.length; i++) {
            keywords.add(word.substring(0, i));
        }
    });

    return Array.from(keywords);
};

/**
 * Generate search keywords for user profiles
 * @param {Object} user - User object with displayName, bio, etc.
 * @returns {string[]} - Combined keywords from all searchable fields
 */
export const generateUserSearchKeywords = (user) => {
    const keywords = new Set();

    // Add keywords from displayName
    if (user.displayName) {
        generateSearchKeywords(user.displayName).forEach(k => keywords.add(k));
    }

    // Add keywords from email (before @)
    if (user.email) {
        const emailPrefix = user.email.split('@')[0];
        generateSearchKeywords(emailPrefix).forEach(k => keywords.add(k));
    }

    // Add keywords from bio
    if (user.bio) {
        generateSearchKeywords(user.bio).forEach(k => keywords.add(k));
    }

    // Add art types as exact matches
    if (user.artTypes && Array.isArray(user.artTypes)) {
        user.artTypes.forEach(type => keywords.add(type.toLowerCase()));
    }

    return Array.from(keywords);
};

/**
 * Generate search keywords for posts
 * @param {Object} post - Post object with title, tags, location, etc.
 * @returns {string[]} - Combined keywords from all searchable fields
 */
export const generatePostSearchKeywords = (post) => {
    const keywords = new Set();

    // Add keywords from title
    if (post.title) {
        generateSearchKeywords(post.title).forEach(k => keywords.add(k));
    }

    // Add keywords from author name
    if (post.authorName) {
        generateSearchKeywords(post.authorName).forEach(k => keywords.add(k));
    }

    // Add tags as both exact matches and with prefixes
    if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
            const tagLower = tag.toLowerCase();
            keywords.add(tagLower);
            // Add prefixes for tags
            generateSearchKeywords(tagLower).forEach(k => keywords.add(k));
        });
    }

    // Add location keywords
    if (post.location) {
        if (post.location.city) {
            generateSearchKeywords(post.location.city).forEach(k => keywords.add(k));
        }
        if (post.location.state) {
            generateSearchKeywords(post.location.state).forEach(k => keywords.add(k));
        }
        if (post.location.country) {
            generateSearchKeywords(post.location.country).forEach(k => keywords.add(k));
        }
    }

    return Array.from(keywords);
};

export default {
    generateSearchKeywords,
    generateUserSearchKeywords,
    generatePostSearchKeywords
};
