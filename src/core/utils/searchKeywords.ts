/**
 * Generate Search Keywords for Firestore Prefix-Based Search
 * 
 * Creates an array of lowercase keywords and prefixes from text input.
 * Used for searchable collections (posts, users, etc.)
 */

import type { UserProfile, Post } from '@/types';

/**
 * Generate search keywords from a text string
 */
export const generateSearchKeywords = (text: string | null | undefined): string[] => {
    if (!text || typeof text !== 'string') return [];

    // Split by spaces and common separators
    const words = text
        .toLowerCase()
        .trim()
        .split(/[\s,._-]+/)
        .filter(word => word.length > 0);

    const keywords = new Set<string>();

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
 */
export const generateUserSearchKeywords = (user: Partial<UserProfile>): string[] => {
    const keywords = new Set<string>();

    // Add keywords from displayName
    if (user.displayName) {
        generateSearchKeywords(user.displayName).forEach(k => keywords.add(k));
    }

    // Add keywords from username
    if ((user as any).username) {
        generateSearchKeywords((user as any).username).forEach(k => keywords.add(k));
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
    // Note: UserProfile might not have artTypes in strict type, but legacy might.
    // Casting to any for flexible access if needed, or assume UserProfile is up to date.
    // UserProfile in types/index.ts DOES NOT have artTypes! It has 'disciplines'.
    // Legacy users might have artTypes. 
    const u = user as any;
    if (u.artTypes && Array.isArray(u.artTypes)) {
        u.artTypes.forEach((type: string) => keywords.add(type.toLowerCase()));
    }

    return Array.from(keywords);
};

/**
 * Generate search keywords for posts
 */
export const generatePostSearchKeywords = (post: Partial<Post>): string[] => {
    const keywords = new Set<string>();

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
