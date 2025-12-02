/**
 * Search Keywords Generation
 * 
 * Generates searchable keywords from various text fields.
 * Used for Firestore array-contains queries.
 */

/**
 * Generate search keywords from text
 * Creates all prefixes for fuzzy matching (min 2 chars)
 * 
 * @example
 * generateKeywords("John Doe") 
 * // Returns: ["jo", "joh", "john", "do", "doe"]
 */
export function generateKeywords(text: string): string[] {
    if (!text) return [];

    const words = text.toLowerCase().split(/[\s,]+/).filter(w => w.length > 0);
    const keywords = new Set<string>();

    words.forEach(word => {
        // Add full word
        keywords.add(word);

        // Add prefixes (min 2 chars for performance)
        for (let i = 2; i <= word.length; i++) {
            keywords.add(word.substring(0, i));
        }
    });

    return Array.from(keywords);
}

/**
 * Generate search keywords for a user
 */
export function generateUserSearchKeywords(user: {
    displayName?: string;
    username?: string;
    bio?: string;
    email?: string;
    artTypes?: string[];
}): string[] {
    const keywords = new Set<string>();

    // Name keywords
    if (user.displayName) {
        generateKeywords(user.displayName).forEach(k => keywords.add(k));
    }

    if (user.username) {
        generateKeywords(user.username).forEach(k => keywords.add(k));
    }

    // Bio keywords
    if (user.bio) {
        generateKeywords(user.bio).forEach(k => keywords.add(k));
    }

    // Email prefix (before @)
    if (user.email) {
        const emailPrefix = (user.email as string).split('@')[0] || '';
        if (emailPrefix) {
            generateKeywords(emailPrefix).forEach(k => keywords.add(k));
        }
    }

    // Art types
    if (user.artTypes) {
        user.artTypes.forEach(type => {
            keywords.add(type.toLowerCase());
            generateKeywords(type).forEach(k => keywords.add(k));
        });
    }

    return Array.from(keywords);
}

/**
 * Generate search keywords for a post
 */
export function generatePostSearchKeywords(post: {
    title?: string;
    authorName?: string;
    tags?: string[];
    location?: {
        city?: string;
        state?: string;
        country?: string;
    };
}): string[] {
    const keywords = new Set<string>();

    // Title keywords
    if (post.title) {
        generateKeywords(post.title).forEach(k => keywords.add(k));
    }

    // Author name keywords
    if (post.authorName) {
        generateKeywords(post.authorName).forEach(k => keywords.add(k));
    }

    // Tags (exact match + prefixes)
    if (post.tags) {
        post.tags.forEach(tag => {
            const lowerTag = tag.toLowerCase();
            keywords.add(lowerTag);
            generateKeywords(lowerTag).forEach(k => keywords.add(k));
        });
    }

    // Location keywords
    if (post.location) {
        const { city, state, country } = post.location;

        if (city) {
            generateKeywords(city).forEach(k => keywords.add(k));
        }
        if (state) {
            generateKeywords(state).forEach(k => keywords.add(k));
        }
        if (country) {
            generateKeywords(country).forEach(k => keywords.add(k));
        }
    }

    return Array.from(keywords);
}

/**
 * General keyword generator (for any object)
 */
export function generateSearchKeywords(data: {
    displayName?: string;
    title?: string;
    tags?: string[];
    location?: {
        city?: string;
        state?: string;
        country?: string;
    };
}): string[] {
    const keywords = new Set<string>();

    if (data.displayName) {
        generateKeywords(data.displayName).forEach(k => keywords.add(k));
    }

    if (data.title) {
        generateKeywords(data.title).forEach(k => keywords.add(k));
    }

    if (data.tags) {
        data.tags.forEach(tag => {
            const lowerTag = tag.toLowerCase();
            keywords.add(lowerTag);
            generateKeywords(lowerTag).forEach(k => keywords.add(k));
        });
    }

    if (data.location) {
        const { city, state, country } = data.location;
        if (city) generateKeywords(city).forEach(k => keywords.add(k));
        if (state) generateKeywords(state).forEach(k => keywords.add(k));
        if (country) generateKeywords(country).forEach(k => keywords.add(k));
    }

    return Array.from(keywords);
}
