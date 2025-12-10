/**
 * Monthly Themes Configuration
 * Rotating seasonal themes for each month
 */

import type { Post } from '@/types';

export interface MonthlyTheme {
    name: string;
    tags?: string[];
    requiresFilm?: boolean;
    color: string;
    description: string;
}

export const MONTHLY_THEMES: Record<number, MonthlyTheme> = {
    1: {
        name: 'Winter Wonderland',
        tags: ['snow', 'winter', 'cold'],
        color: '#B4D7E8',
        description: 'Capture the beauty of winter landscapes and snowy scenes'
    },
    2: {
        name: 'Love & Red',
        tags: ['red', 'love', 'valentine'],
        color: '#FF6B9D',
        description: 'Celebrate love and the color red'
    },
    3: {
        name: 'Spring Awakening',
        tags: ['spring', 'flowers', 'bloom'],
        color: '#98D8C8',
        description: 'New life, fresh blooms, and spring colors'
    },
    4: {
        name: 'Film Month',
        requiresFilm: true,
        color: '#7FFFD4',
        description: 'Dedicated to analog film photography'
    },
    5: {
        name: 'Urban Exploration',
        tags: ['urban', 'city', 'street'],
        color: '#FFD700',
        description: 'Explore cities and urban landscapes'
    },
    6: {
        name: 'Summer Vibes',
        tags: ['summer', 'beach', 'sun'],
        color: '#FFA500',
        description: 'Bright, sunny, and warm summer photography'
    },
    7: {
        name: 'Golden Hour',
        tags: ['golden hour', 'sunset', 'sunrise'],
        color: '#FF6B35',
        description: 'Capture the magic of golden hour light'
    },
    8: {
        name: 'Nature & Wildlife',
        tags: ['nature', 'wildlife', 'animals'],
        color: '#4A7C59',
        description: 'Celebrate the natural world'
    },
    9: {
        name: 'Back to School',
        tags: ['campus', 'education', 'autumn'],
        color: '#8B4513',
        description: 'Campus life and autumn colors'
    },
    10: {
        name: 'Spooky Season',
        tags: ['halloween', 'autumn', 'dark'],
        color: '#FF4500',
        description: 'Dark, moody, and atmospheric photography'
    },
    11: {
        name: 'Gratitude & Harvest',
        tags: ['autumn', 'harvest', 'thanksgiving'],
        color: '#D2691E',
        description: 'Autumn harvest and warm tones'
    },
    12: {
        name: 'Holiday Magic',
        tags: ['holiday', 'winter', 'lights'],
        color: '#DC143C',
        description: 'Holiday lights and winter celebrations'
    }
};

export interface CurrentTheme extends MonthlyTheme {
    month: number;
}

/**
 * Get current month's theme
 */
export function getCurrentTheme(): CurrentTheme {
    const month = new Date().getMonth() + 1; // 1-12
    const theme = MONTHLY_THEMES[month] || MONTHLY_THEMES[1]!;
    return { month, ...theme };
}

/**
 * Check if post matches monthly theme
 */
export function matchesMonthlyTheme(post: Partial<Post>, theme: MonthlyTheme | null): boolean {
    if (!theme) return false;

    if (theme.requiresFilm) {
        return post.filmMetadata?.isFilm === true;
    }

    if (theme.tags) {
        const postTags = (post.tags || []).map(t => t.toLowerCase());
        return theme.tags.some(tag => postTags.includes(tag.toLowerCase()));
    }

    return false;
}
