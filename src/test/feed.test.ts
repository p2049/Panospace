/**
 * Feed Ranking Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePostScore, rankPostsForUser } from '../domain/feed/score';
import type { Post, UserProfile } from '../types';
import { Timestamp } from 'firebase/firestore';

const mockUser: UserProfile = {
    uid: 'user1',
    email: 'test@example.com',
    displayName: 'Test User',
    accountType: 'artist',
    disciplines: {
        main: ['Photography', 'Digital Art'],
        niches: {},
    },
    following: ['author2'],
    searchKeywords: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
};

const mockPost1: Post = {
    id: 'post1',
    authorId: 'author1',
    authorName: 'Author 1',
    title: 'Landscape Photo',
    description: '',
    items: [],
    tags: ['landscape', 'photography'],
    location: {},
    searchKeywords: [],
    createdAt: Timestamp.fromMillis(Date.now() - 1000 * 60 * 60), // 1 hour ago
    likeCount: 10,
    commentCount: 2,
    shopLinked: false,
};

const mockPost2: Post = {
    id: 'post2',
    authorId: 'author2', // Followed author
    authorName: 'Author 2',
    title: 'Portrait',
    description: '',
    items: [],
    tags: ['portrait'],
    location: {},
    searchKeywords: [],
    createdAt: Timestamp.fromMillis(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    likeCount: 5,
    commentCount: 1,
    shopLinked: false,
};

describe('calculatePostScore', () => {
    it('should give higher score to recent posts', () => {
        const recentPost = { ...mockPost1, createdAt: Timestamp.now() };
        const oldPost = { ...mockPost1, createdAt: Timestamp.fromMillis(Date.now() - 1000 * 60 * 60 * 48) };

        const recentScore = calculatePostScore(recentPost, mockUser);
        const oldScore = calculatePostScore(oldPost, mockUser);

        expect(recentScore).toBeGreaterThan(oldScore);
    });

    it('should boost posts from followed authors', () => {
        // Remove discipline match interference - use non-matching tags
        const followedPost = { ...mockPost2, tags: ['portrait', 'studio'] }; // author2 is followed
        const unfollowedPost = { ...mockPost1, tags: ['abstract', 'minimal'] }; // author1 is not followed, no discipline match

        const followedScore = calculatePostScore(followedPost, mockUser);
        const unfollowedScore = calculatePostScore(unfollowedPost, mockUser);

        expect(followedScore).toBeGreaterThan(unfollowedScore + 400); // Following boost is +500
    });

    it('should boost posts matching user disciplines', () => {
        const matchingPost = {
            ...mockPost1,
            tags: ['photography', 'landscape'],
        };
        const nonMatchingPost = {
            ...mockPost1,
            tags: ['sculpture', 'installation'],
        };

        const matchingScore = calculatePostScore(matchingPost, mockUser);
        const nonMatchingScore = calculatePostScore(nonMatchingPost, mockUser);

        expect(matchingScore).toBeGreaterThan(nonMatchingScore);
    });

    it('should boost popular posts', () => {
        const popularPost = { ...mockPost1, likeCount: 50, commentCount: 20 };
        const unpopularPost = { ...mockPost1, likeCount: 0, commentCount: 0 };

        const popularScore = calculatePostScore(popularPost, mockUser);
        const unpopularScore = calculatePostScore(unpopularPost, mockUser);

        expect(popularScore).toBeGreaterThan(unpopularScore);
    });
});

describe('rankPostsForUser', () => {
    it('should sort posts by score descending', () => {
        const posts = [mockPost1, mockPost2];
        const ranked = rankPostsForUser(posts, mockUser);

        // mockPost2 should rank higher (followed author)
        expect(ranked[0]!.id).toBe('post2');
        expect(ranked[0]!._score).toBeGreaterThan(ranked[1]!._score || 0);
    });

    it('should attach scores to posts', () => {
        const posts = [mockPost1];
        const ranked = rankPostsForUser(posts, mockUser);

        expect(ranked[0]!._score).toBeDefined();
        expect(typeof ranked[0]!._score).toBe('number');
    });
});
