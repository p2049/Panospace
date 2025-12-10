/**
 * Boost Days Configuration
 * Daily/weekly themed highlights for posts
 */

import type { Post } from '@/types';

export interface BoostConfig {
    name: string;
    type: 'aesthetic' | 'film' | 'park';
    requiresFilm?: boolean;
    parkType?: string;
    tags?: string[];
    color: string;
    dayOfWeek: number | null; // 0-6, or null for any day
}

export const BOOST_DAYS: Record<string, BoostConfig> = {
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

export interface TodaysBoost extends BoostConfig {
    id: string;
}

/**
 * Get active boost for today
 */
export function getTodaysBoost(): TodaysBoost | null {
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
export function matchesBoost(post: Partial<Post>, boost: BoostConfig | null): boolean {
    if (!boost) return false;

    if (boost.type === 'film' && boost.requiresFilm) {
        // filmMetadata is in Post type
        return post.filmMetadata?.isFilm === true;
    }

    if (boost.type === 'park' && boost.parkType) {
        // parkType might be missing from strict Post type, cast post to any
        return (post as any).parkType === boost.parkType;
    }

    if (boost.type === 'aesthetic' && boost.tags) {
        const postTags = (post.tags || []).map(t => t.toLowerCase());
        return boost.tags.some(tag => postTags.includes(tag.toLowerCase()));
    }

    return false;
}
