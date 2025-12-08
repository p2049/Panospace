/**
 * Boost Days Configuration
 * Daily/weekly themed highlights for posts
 */

export const BOOST_DAYS = {
    'sunset-day': {
        name: 'Sunset Day',
        type: 'aesthetic',
        tags: ['sunset', 'golden hour'],
        color: '#FF6B35',
        dayOfWeek: null // null = any day
    },
    'film-friday': {
        name: 'Shoot Film Friday',
        type: 'film',
        requiresFilm: true,
        color: '#7FFFD4',
        dayOfWeek: 5 // Friday
    },
    'national-park-day': {
        name: 'National Park Day',
        type: 'park',
        parkType: 'national',
        color: '#4A7C59',
        dayOfWeek: null
    },
    'bw-monday': {
        name: 'Black & White Monday',
        type: 'aesthetic',
        tags: ['black & white', 'black and white', 'bw'],
        color: '#888',
        dayOfWeek: 1 // Monday
    },
    'street-saturday': {
        name: 'Street Saturday',
        type: 'aesthetic',
        tags: ['street', 'urban'],
        color: '#FFD700',
        dayOfWeek: 6 // Saturday
    }
};

/**
 * Get active boost for today
 */
export function getTodaysBoost() {
    const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday

    for (const [key, boost] of Object.entries(BOOST_DAYS)) {
        if (boost.dayOfWeek === today) {
            return { id: key, ...boost };
        }
    }

    return null;
}

/**
 * Check if a post matches boost criteria
 */
export function matchesBoost(post, boost) {
    if (!boost) return false;

    if (boost.type === 'film' && boost.requiresFilm) {
        return post.filmMetadata?.isFilm === true;
    }

    if (boost.type === 'park' && boost.parkType) {
        return post.parkType === boost.parkType;
    }

    if (boost.type === 'aesthetic' && boost.tags) {
        const postTags = (post.tags || []).map(t => t.toLowerCase());
        return boost.tags.some(tag => postTags.includes(tag.toLowerCase()));
    }

    return false;
}
