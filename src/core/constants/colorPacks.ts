export interface ColorOption {
    id: string;
    name: string;
    color: string;
    isPremium: boolean;
    isGradient?: boolean;
}

// export const GLASS_COLOR = 'rgba(255, 255, 255, 0.3)'; // Removed
export const BRAND_COLORS = ['#FF914D', '#FF5C8A', '#FFB7D5', '#5A3FFF', '#A7B6FF', '#1B82FF', '#7FDBFF', '#7FFFD4'];
export const BRAND_RAINBOW = `conic-gradient(from 0deg, ${[...BRAND_COLORS, BRAND_COLORS[0]].join(', ')})`;

export const FREE_COLOR_PACK: ColorOption[] = [
    { id: 'transparent-border', name: 'Transparent', color: 'transparent', isPremium: false },
    { id: 'classic-mint', name: 'Classic Mint', color: '#7FFFD4', isPremium: false },

    { id: 'ice-white', name: 'Ice White', color: '#F2F7FA', isPremium: false },
    { id: 'event-horizon-black', name: 'Event Horizon Black', color: '#000000', isPremium: false },

    { id: 'aurora-blue', name: 'Aurora Blue', color: '#7FDBFF', isPremium: false },
    { id: 'ion-blue', name: 'Ion Blue', color: '#1B82FF', isPremium: false },

    { id: 'cosmic-periwinkle', name: 'Cosmic Periwinkle', color: '#A7B6FF', isPremium: false },
    { id: 'deep-orbit-purple', name: 'Deep Orbit Purple', color: '#5A3FFF', isPremium: false },

    { id: 'solar-flare-pink', name: 'Solar Flare Pink', color: '#FF5C8A', isPremium: false },
    { id: 'nebula-pink', name: 'Nebula Pink', color: '#FFB7D5', isPremium: false },
    { id: 'stellar-orange', name: 'Stellar Orange', color: '#FF914D', isPremium: false },

    { id: 'brand-colors', name: 'Rainbow', color: 'brand', isPremium: false, isGradient: true }, // Complex
];

export const PREMIUM_COLOR_PACK: ColorOption[] = [
    { id: 'iridescent', name: 'Iridescent Spectrum', color: 'linear-gradient(135deg, #6EFFD8, #8F6EFF, #FF6E9A)', isPremium: false, isGradient: true } // Special handling
];

export const ALL_COLORS: ColorOption[] = [...FREE_COLOR_PACK, ...PREMIUM_COLOR_PACK];

export const getColorById = (id: string | null | undefined): ColorOption | undefined =>
    ALL_COLORS.find(c => c.id === id) || FREE_COLOR_PACK.find(c => c.id === 'classic-mint');

// Helper to check if a color string matches a premium color
export const isPremiumColor = (colorValue: string): boolean => {
    const color = ALL_COLORS.find(c => c.color === colorValue);
    return color ? color.isPremium : false;
};

// Helper to check if a color string matches a brand/rainbow color
export const isBrandColor = (colorValue: string | null | undefined): boolean => {
    return colorValue === 'brand' || colorValue === BRAND_RAINBOW;
};
