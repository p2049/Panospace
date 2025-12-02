"use strict";
/**
 * Shared Keyword Generation
 *
 * This mirrors the frontend logic to ensure consistency.
 * Used by Cloud Functions for automatic keyword generation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUserSearchKeywords = generateUserSearchKeywords;
exports.generatePostSearchKeywords = generatePostSearchKeywords;
function generateKeywords(text) {
    if (!text)
        return [];
    const words = text.toLowerCase().split(/[\s,]+/).filter(w => w.length > 0);
    const keywords = new Set();
    words.forEach(word => {
        keywords.add(word);
        for (let i = 2; i <= word.length; i++) {
            keywords.add(word.substring(0, i));
        }
    });
    return Array.from(keywords);
}
function generateUserSearchKeywords(user) {
    const keywords = new Set();
    if (user.displayName) {
        generateKeywords(user.displayName).forEach(k => keywords.add(k));
    }
    if (user.username) {
        generateKeywords(user.username).forEach(k => keywords.add(k));
    }
    if (user.bio) {
        generateKeywords(user.bio).forEach(k => keywords.add(k));
    }
    if (user.email) {
        const emailPrefix = user.email.split('@')[0];
        generateKeywords(emailPrefix).forEach(k => keywords.add(k));
    }
    return Array.from(keywords);
}
function generatePostSearchKeywords(post) {
    const keywords = new Set();
    if (post.title) {
        generateKeywords(post.title).forEach(k => keywords.add(k));
    }
    if (post.authorName) {
        generateKeywords(post.authorName).forEach(k => keywords.add(k));
    }
    if (post.tags) {
        post.tags.forEach(tag => {
            const lowerTag = tag.toLowerCase();
            keywords.add(lowerTag);
            generateKeywords(lowerTag).forEach(k => keywords.add(k));
        });
    }
    if (post.location) {
        const { city, state, country } = post.location;
        if (city)
            generateKeywords(city).forEach(k => keywords.add(k));
        if (state)
            generateKeywords(state).forEach(k => keywords.add(k));
        if (country)
            generateKeywords(country).forEach(k => keywords.add(k));
    }
    return Array.from(keywords);
}
//# sourceMappingURL=keywords.js.map