/**
 * Calculate trending score for posts
 * Priority order:
 * 1. Posts from today with highest star ratings (average * count)
 * 2. Posts from today with highest likes (for regular smiley posts)
 * 3. If no posts from today, fall back to week
 * 4. If no posts from week, fall back to month
 * 5. If no posts from month, fall back to year
 * 6. Ultimate fallback: all time
 */

import type { Post } from '@/types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const MS_PER_MONTH = 30 * MS_PER_DAY;
const MS_PER_YEAR = 365 * MS_PER_DAY;

// Extended Post type for legacy fields that might exist at root
type TrendingPost = Partial<Post> & {
    exif?: any;
    // Accessing starRatings from Post (added to types)
};

/**
 * Get the date from a post (EXIF date or createdAt)
 */
const getPostDate = (post: TrendingPost): Date => {
    if (post.exif?.dateTimeOriginal) {
        return new Date(post.exif.dateTimeOriginal);
    }
    // Firestore Timestamp check
    if (post.createdAt && typeof (post.createdAt as any).toDate === 'function') {
        return (post.createdAt as any).toDate();
    }
    if (post.createdAt) {
        // Assume it's a date or string if not a timestamp object
        return new Date(post.createdAt as any);
    }
    return new Date(0);
};

/**
 * Calculate trending score for a post
 * Star-rated posts get priority based on (average rating * rating count)
 * Regular posts get score based on like count
 */
const calculateTrendingScore = (post: TrendingPost): number => {
    const hasStarRating = post.starRatings && Object.keys(post.starRatings).length > 0;

    if (hasStarRating && post.starRatings) {
        // Calculate average star rating
        const ratings = Object.values(post.starRatings);
        const sum = ratings.reduce((acc, val) => acc + val, 0);
        const average = sum / ratings.length;
        const count = ratings.length;

        // Score = average * count (gives weight to both quality and quantity)
        return average * count * 100; // Multiply by 100 to give star posts higher priority
    } else {
        // Regular smiley posts - use like count
        return post.likeCount || 0;
    }
};

/**
 * Filter posts by time period
 */
const filterPostsByTimePeriod = (posts: TrendingPost[], maxAgeMs: number): TrendingPost[] => {
    const now = Date.now();
    return posts.filter(post => {
        const postDate = getPostDate(post);
        const age = now - postDate.getTime();
        return age <= maxAgeMs; // Note: age can be negative if clocks differ slightly or future date, logic holds as long as age <= max
    });
};

interface TrendingResult {
    posts: TrendingPost[];
    period: string;
}

/**
 * Sort posts by trending algorithm with fallback time periods
 * Returns sorted posts with the time period used
 */
export const sortPostsByTrending = (posts: TrendingPost[]): TrendingResult => {
    if (!posts || posts.length === 0) {
        return { posts: [], period: 'none' };
    }

    // Try each time period in order
    const periods = [
        { name: 'day', ms: MS_PER_DAY },
        { name: 'week', ms: MS_PER_WEEK },
        { name: 'month', ms: MS_PER_MONTH },
        { name: 'year', ms: MS_PER_YEAR },
        { name: 'all-time', ms: Infinity }
    ];

    for (const period of periods) {
        const filtered = filterPostsByTimePeriod(posts, period.ms);

        if (filtered.length > 0) {
            // Sort by trending score (highest first)
            const sorted = filtered.sort((a, b) => {
                const scoreA = calculateTrendingScore(a);
                const scoreB = calculateTrendingScore(b);
                return scoreB - scoreA;
            });

            return { posts: sorted, period: period.name };
        }
    }

    // Fallback: return all posts sorted by score (effectively all-time)
    const sorted = posts.sort((a, b) => {
        const scoreA = calculateTrendingScore(a);
        const scoreB = calculateTrendingScore(b);
        return scoreB - scoreA;
    });

    return { posts: sorted, period: 'all-time' };
};

/**
 * Get trending posts with tag filtering and time-based fallback
 */
export const getTrendingPosts = (allPosts: TrendingPost[], selectedTags: string[] = []): TrendingResult => {
    // If tags are selected, filter first
    let posts = allPosts;

    if (selectedTags.length > 0) {
        posts = allPosts.filter(post => {
            const postTags = (post.tags || []).map(t => t.toLowerCase());
            return selectedTags.every(tag => postTags.includes(tag.toLowerCase()));
        });
    }

    // Apply trending sort with fallback
    return sortPostsByTrending(posts);
};
