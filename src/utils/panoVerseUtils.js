/**
 * PanoVerse Utilities
 * Rarity calculation, value scoring, and card management
 */

/**
 * Calculate rarity based on edition size and value score
 */
export function calculateRarity(editionSize, valueScore = 0) {
    if (editionSize === 1) return 'legendary';
    if (editionSize <= 3) return 'ultra';
    if (editionSize <= 10) return 'rare';
    if (editionSize <= 50) return 'common';
    return 'common';
}

/**
 * Calculate dynamic value score for a card
 */
export function calculateValueScore(card) {
    return (
        (card.likesCountSnapshot || 0) * 2 +
        (card.eventWinsCount || 0) * 25 +
        (card.packInclusionsCount || 0) * 5 +
        (card.collectorsCount || 0) * 3
    );
}

/**
 * Calculate dynamic market value for a PanoVerse card
 * @param {object} card - Card data
 * @returns {number} - Market value in cents
 */
export function calculateMarketValue(card) {
    const baseValue = 1000; // $10.00 base
    const engagementScore = calculateValueScore(card);

    const rarityMultipliers = {
        'legendary': 10.0,
        'ultra': 5.0,
        'rare': 2.5,
        'common': 1.0
    };

    const rarityMultiplier = rarityMultipliers[card.rarityLevel] || 1.0;
    const printSaleBonus = (card.printSaleCount || 0) * 100; // $1 per sale

    return Math.floor(baseValue + (engagementScore * rarityMultiplier) + printSaleBonus);
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity) {
    const colors = {
        'legendary': '#FFD700', // Gold
        'ultra': '#FF00FF',     // Magenta
        'rare': '#3498DB',      // Blue
        'common': '#95A5A6'     // Gray
    };
    return colors[rarity?.toLowerCase()] || colors.common;
}

/**
 * Get category tags from post metadata
 */
export function getCategoryTags(post) {
    const categories = [];

    if (post.parkId) categories.push('park');
    if (post.location?.city) categories.push('city');
    if (post.filmMetadata?.isFilm) categories.push('film');

    // Check tags for animals/nature
    const tags = (post.tags || []).map(t => t.toLowerCase());
    const animalKeywords = ['animal', 'wildlife', 'bird', 'deer', 'bear', 'fox', 'wolf'];
    const natureKeywords = ['nature', 'landscape', 'mountain', 'forest', 'ocean', 'lake'];

    if (tags.some(tag => animalKeywords.some(kw => tag.includes(kw)))) {
        categories.push('animal');
    }
    if (tags.some(tag => natureKeywords.some(kw => tag.includes(kw)))) {
        categories.push('nature');
    }

    return categories;
}

/**
 * Get DEX key from post metadata
 */
export function getDEXKey(type, post) {
    switch (type) {
        case 'park':
            return post.parkId;
        case 'city':
            return post.location?.city?.toLowerCase().replace(/\s+/g, '-');
        case 'film':
            return post.filmMetadata?.stock?.toLowerCase().replace(/\s+/g, '');
        case 'aesthetic':
            return post.tags?.[0]?.toLowerCase().replace(/\s+/g, '-');
        default:
            return null;
    }
}

/**
 * Format edition text (e.g., "1 of 10")
 */
export function formatEdition(soldCount, editionSize) {
    return `${soldCount + 1} of ${editionSize}`;
}

/**
 * Check if edition is sold out
 */
export function isSoldOut(soldCount, editionSize) {
    return soldCount >= editionSize;
}
