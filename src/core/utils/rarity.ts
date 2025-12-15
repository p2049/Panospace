/**
 * PANOSPACE RARITY SYSTEM
 * 
 * Single source of truth for rarity tier definitions.
 * Visual styles are in /styles/rarity-system.css
 * 
 * RARITY TIERS (Low → High):
 * 1. COMMON   - Ice Mint
 * 2. RARE     - Brand Blue  
 * 3. SUPER    - Brand Purple
 * 4. ULTRA    - Solar Pink
 * 5. GALACTIC - Iridescent Gradient
 */

export type RarityTier = 'Common' | 'Rare' | 'Super' | 'Ultra' | 'Galactic';

export interface RarityConfig {
    cssClass: string;
    badgeClass: string;
    textClass: string;
    glowClass: string;
    colorVar: string;
    colorHex: string;
    weight: number;
    hasGlow: boolean;
    hasAnimation: boolean;
    isIridescent: boolean;
}

/**
 * Rarity configurations using CSS variable tokens
 * No hardcoded colors - all reference design tokens from index.css
 */
export const RARITY_CONFIG: Record<RarityTier, RarityConfig> = {
    Common: {
        cssClass: 'rarity-common',
        badgeClass: 'rarity-badge-common',
        textClass: 'rarity-text-common',
        glowClass: 'rarity-glow-common',
        colorVar: 'var(--brand-mint)',
        colorHex: '#7FFFD4',
        weight: 60,
        hasGlow: false,
        hasAnimation: false,
        isIridescent: false
    },
    Rare: {
        cssClass: 'rarity-rare',
        badgeClass: 'rarity-badge-rare',
        textClass: 'rarity-text-rare',
        glowClass: 'rarity-glow-rare',
        colorVar: 'var(--brand-blue)',
        colorHex: '#4CC9F0',
        weight: 25,
        hasGlow: true,
        hasAnimation: false,
        isIridescent: false
    },
    Super: {
        cssClass: 'rarity-super',
        badgeClass: 'rarity-badge-super',
        textClass: 'rarity-text-super',
        glowClass: 'rarity-glow-super',
        colorVar: 'var(--brand-purple)',
        colorHex: '#6C5CE7',
        weight: 10,
        hasGlow: true,
        hasAnimation: false,
        isIridescent: false
    },
    Ultra: {
        cssClass: 'rarity-ultra',
        badgeClass: 'rarity-badge-ultra',
        textClass: 'rarity-text-ultra',
        glowClass: 'rarity-glow-ultra',
        colorVar: 'var(--brand-pink)',
        colorHex: '#FF6B9D', // Solar Flare Pink
        weight: 3,
        hasGlow: true,
        hasAnimation: true,
        isIridescent: false
    },
    Galactic: {
        cssClass: 'rarity-galactic',
        badgeClass: 'rarity-badge-galactic',
        textClass: 'rarity-text-galactic',
        glowClass: 'rarity-glow-galactic',
        colorVar: 'var(--gradient-iridescent)',
        colorHex: '#e0b3ff',
        weight: 2,
        hasGlow: true,
        hasAnimation: true,
        isIridescent: true
    }
};

/**
 * Get the CSS class for a rarity tier (border styling)
 */
export function getRarityClass(rarity: RarityTier | string): string {
    const config = RARITY_CONFIG[rarity as RarityTier];
    return config?.cssClass || 'rarity-common';
}

/**
 * Get the badge CSS class for a rarity tier
 */
export function getRarityBadgeClass(rarity: RarityTier | string): string {
    const config = RARITY_CONFIG[rarity as RarityTier];
    return config?.badgeClass || 'rarity-badge-common';
}

/**
 * Get the text CSS class for a rarity tier
 */
export function getRarityTextClass(rarity: RarityTier | string): string {
    const config = RARITY_CONFIG[rarity as RarityTier];
    return config?.textClass || 'rarity-text-common';
}

/**
 * Get the glow CSS class for a rarity tier
 */
export function getRarityGlowClass(rarity: RarityTier | string): string {
    const config = RARITY_CONFIG[rarity as RarityTier];
    return config?.glowClass || 'rarity-glow-common';
}

/**
 * Get full rarity config
 */
export function getRarityConfig(rarity: RarityTier | string): RarityConfig {
    return RARITY_CONFIG[rarity as RarityTier] || RARITY_CONFIG.Common;
}

/**
 * Check if a rarity tier has animation
 */
export function rarityHasAnimation(rarity: RarityTier | string): boolean {
    const config = RARITY_CONFIG[rarity as RarityTier];
    return config?.hasAnimation || false;
}

/**
 * Check if a rarity tier is iridescent (Galactic)
 */
export function rarityIsIridescent(rarity: RarityTier | string): boolean {
    const config = RARITY_CONFIG[rarity as RarityTier];
    return config?.isIridescent || false;
}

/**
 * Get all rarity tiers in order (low to high)
 */
export const RARITY_ORDER: RarityTier[] = ['Common', 'Rare', 'Super', 'Ultra', 'Galactic'];

/**
 * Compare two rarities (returns -1, 0, or 1)
 */
export function compareRarity(a: RarityTier | string, b: RarityTier | string): number {
    const indexA = RARITY_ORDER.indexOf(a as RarityTier);
    const indexB = RARITY_ORDER.indexOf(b as RarityTier);
    if (indexA < indexB) return -1;
    if (indexA > indexB) return 1;
    return 0;
}
