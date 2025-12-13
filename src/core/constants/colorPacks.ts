export interface ColorOption {
    id: string;
    name: string;
    color: string;
    isPremium: boolean;
    isGradient?: boolean;
}

export const FREE_COLOR_PACK: ColorOption[] = [
    { id: 'brand-colors', name: 'Rainbow', color: 'brand', isPremium: false, isGradient: true }, // Special: multi-color stars
    { id: 'aurora-blue', name: 'Aurora Blue', color: '#7FDBFF', isPremium: false },
    { id: 'ion-blue', name: 'Ion Blue', color: '#1B82FF', isPremium: false },
    { id: 'nebula-pink', name: 'Nebula Pink', color: '#FFB7D5', isPremium: false },
    { id: 'solar-flare-pink', name: 'Solar Flare Pink', color: '#FF5C8A', isPremium: false },
    { id: 'cosmic-periwinkle', name: 'Cosmic Periwinkle', color: '#A7B6FF', isPremium: false },
    { id: 'deep-orbit-purple', name: 'Deep Orbit Purple', color: '#5A3FFF', isPremium: false },
    { id: 'ice-white', name: 'Ice White', color: '#F2F7FA', isPremium: false },
    { id: 'event-horizon-black', name: 'Event Horizon Black', color: '#000000', isPremium: false },
    { id: 'stellar-orange', name: 'Stellar Orange', color: '#FF914D', isPremium: false },
    { id: 'classic-mint', name: 'Classic Mint', color: '#7FFFD4', isPremium: false }
];

export const PREMIUM_COLOR_PACK: ColorOption[] = [
    { id: 'iridescent', name: 'Iridescent Spectrum', color: 'linear-gradient(135deg, #6EFFD8, #8F6EFF, #FF6E9A)', isPremium: true, isGradient: true }, // Special handling
    { id: 'dark-nebula-blue', name: 'Dark Nebula Blue', color: '#0A1A3A', isPremium: true },
    { id: 'void-purple', name: 'Void Purple', color: '#2A0E61', isPremium: true },
    { id: 'solar-gold', name: 'Solar Gold', color: '#D9B96E', isPremium: true },
    { id: 'cosmic-ice', name: 'Cosmic Ice', color: '#E6F8FF', isPremium: true },
    { id: 'aurora-mint', name: 'Aurora Mint', color: '#8CFFE9', isPremium: true }
];

export const ALL_COLORS: ColorOption[] = [...FREE_COLOR_PACK, ...PREMIUM_COLOR_PACK];

export const getColorById = (id: string | null | undefined): ColorOption | undefined =>
    ALL_COLORS.find(c => c.id === id) || FREE_COLOR_PACK.find(c => c.id === 'classic-mint');

// Helper to check if a color string matches a premium color
export const isPremiumColor = (colorValue: string): boolean => {
    const color = ALL_COLORS.find(c => c.color === colorValue);
    return color ? color.isPremium : false;
};
