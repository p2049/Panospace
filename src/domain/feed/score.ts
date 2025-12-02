/**
 * Feed Ranking Algorithm
 *
 * Calculates post relevance scores based on user preferences and engagement.
 */

import type { Post, UserProfile } from '../../types';

/**
 * Calculate relevance score for a post given user context.
 * Supports both modern `UserProfile` (with `following`) and legacy `User` (with `followingIds`).
 */
export function calculatePostScore(post: Post, user: UserProfile): number {
    let score = 0;

    // 1. Recency score (0-100 points)
    const ageHours = (Date.now() - post.createdAt.toMillis()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 100 - ageHours);
    score += recencyScore;

    // 2. Following boost (+500 points)
    const follows = (Array.isArray((user as any).following) && (user as any).following) || (user as any).followingIds || [];
    if (Array.isArray(follows) && follows.includes(post.authorId)) {
        score += 500;
    }

    // 3. Discipline match (+200 points per matching tag)
    if ((user as any).disciplines?.main && Array.isArray(post.tags)) {
        const userDisciplines = (user as any).disciplines.main.map((d: string) => d.toLowerCase());
        const postTags = post.tags.map((t: string) => t.toLowerCase());
        const matchCount = userDisciplines.filter((discipline: string) =>
            postTags.some(tag => tag.includes(discipline) || discipline.includes(tag))
        ).length;
        score += matchCount * 200;
    }

    // 4. Engagement boost (up to +50 points)
    const likesScore = Math.min(20, (post.likeCount || 0) * 2);
    const commentsScore = Math.min(30, (post.commentCount || 0) * 5);
    score += likesScore + commentsScore;

    return score;
}

/**
 * Rank posts for a user's personalized feed.
 */
export function rankPostsForUser(posts: Post[], user: UserProfile): Post[] {
    return posts
        .map(post => ({
            ...post,
            _score: calculatePostScore(post, user),
        }))
        .sort((a, b) => (b._score || 0) - (a._score || 0));
}

/**
 * Get explanation for why a post was shown to the user.
 */
export function getScoreExplanation(post: Post, user: UserProfile): string[] {
    const reasons: string[] = [];

    // Following reason
    const follows = (Array.isArray((user as any).following) && (user as any).following) || (user as any).followingIds || [];
    if (Array.isArray(follows) && follows.includes(post.authorId)) {
        reasons.push(`You follow ${post.authorName}`);
    }

    // Discipline match reason
    if ((user as any).disciplines?.main && Array.isArray(post.tags)) {
        const userDisciplines = (user as any).disciplines.main.map((d: string) => d.toLowerCase());
        const postTags = post.tags.map((t: string) => t.toLowerCase());
        const matches = userDisciplines.filter((discipline: string) =>
            postTags.some(tag => tag.includes(discipline) || discipline.includes(tag))
        );
        if (matches.length > 0) {
            reasons.push(`Matches your interests: ${matches.join(', ')}`);
        }
    }

    // Recency reason
    const ageHours = (Date.now() - post.createdAt.toMillis()) / (1000 * 60 * 60);
    if (ageHours < 24) {
        reasons.push('Recent post');
    }

    // Engagement reason
    if ((post.likeCount || 0) > 10) {
        reasons.push('Popular post');
    }

    if (reasons.length === 0) {
        reasons.push('Recommended based on your activity');
    }

    return reasons;
}
