/**
 * PANOSPACE DESIGN SYSTEM — COLORS
 * Single source of truth for all application colors.
 */

export const COLORS = {
    // Base Colors
    black: '#050505',
    graphite: '#0f0f0f',
    darkGray: '#161616',
    midGray: '#1f1f1f',
    lightGray: '#2a2a2a',
    borderGray: '#333333',
    white: '#ffffff',
    transparent: 'transparent',

    // Accents
    iceMint: '#7FFFD4', // Signature color
    iceMintHover: '#5FDDBB', // Secondary accent
    iceMintDark: '#1B75D1', // Darker variation for gradients
    gold: '#FFD700',
    goldDark: '#FFA500',

    // Status
    success: '#7FFFD4',
    error: '#FF4D4D',
    warning: '#FFD93D',
    info: '#6C5CE7',

    // Text - Logic driven
    text: {
        primary: '#ffffff',
        secondary: '#a1a1a1',
        tertiary: '#777777',
        disabled: '#555555',
        label: 'rgba(127, 255, 212, 0.8)',
    },

    // Backgrounds - Glassmorphism
    glass: {
        bg: 'rgba(20, 20, 20, 0.6)',
        border: 'rgba(255, 255, 255, 0.1)',
        input: 'rgba(0, 0, 0, 0.3)',
    }
} as const;

/**
 * GRADIENT SYSTEM
 * Centralized gradient definitions for profiles and UI.
 */
export const GRADIENTS = {
    // Core Brand Gradients
    primary: 'linear-gradient(135deg, #7FFFD4 0%, #4ECDC4 100%)',
    chrome: 'linear-gradient(180deg, #fff 0%, #ddd 50%, #fff 100%)',
    holographic: 'linear-gradient(135deg, #7FFFD4 0%, #4CC9F0 50%, #7FFFD4 100%)',

    // Profile Themes
    themes: {
        'aurora-horizon': {
            id: 'aurora-horizon',
            name: 'Aurora Horizon',
            description: 'Blue to Pink Shift',
            background: 'linear-gradient(0deg, #7FDBFF, #FFB7D5, #FF5C8A)',
            topColor: '#FF5C8A', // Used for status bar blending or text contrast
            navColor: '#FF5C8A', // Color for icons like hamburger/planet
        },
        'cosmic-sunset': {
            id: 'cosmic-sunset',
            name: 'Cosmic Sunset',
            description: 'Orange to Purple Fade',
            background: 'linear-gradient(0deg, #FF914D, #FF5C8A, #5A3FFF)',
            topColor: '#5A3FFF',
            navColor: '#5A3FFF',
        },
        'nebula-dream': {
            id: 'nebula-dream',
            name: 'Nebula Dream',
            description: 'Pink to Deep Purple',
            background: 'linear-gradient(0deg, #FFB7D5, #A7B6FF, #5A3FFF)',
            topColor: '#5A3FFF',
            navColor: '#5A3FFF',
        },
        'void-aurora': {
            id: 'void-aurora',
            name: 'Void Aurora',
            description: 'Purple to Ion Blue',
            background: 'linear-gradient(0deg, #1A0535, #7FDBFF, #1B82FF)',
            topColor: '#1B82FF',
            navColor: '#1B82FF',
        },
        'solar-drop': {
            id: 'solar-drop',
            name: 'Solar Drop',
            description: 'Flare to Cosmic Ice',
            background: 'linear-gradient(0deg, #FF5C8A, #FF914D, #E6F8FF)',
            topColor: '#E6F8FF',
            navColor: '#E6F8FF',
        },
        'mint-nebula': {
            id: 'mint-nebula',
            name: 'Mint Nebula',
            description: 'Atmospheric Blue',
            background: 'linear-gradient(0deg, #AEE1FF, #62B6FF, #1B75D1)',
            topColor: '#1B75D1',
            navColor: '#1B75D1',
        },
        'night-sky': {
            id: 'night-sky',
            name: 'Night Sky',
            description: 'Deep Cosmic Blue',
            background: 'linear-gradient(0deg, #0A0F2D, #131A45, #1E275B)',
            topColor: '#1E275B',
            navColor: '#1E275B',
        },

        // Fades to Black (Optimized for Dark Mode)
        'aurora-blue-black': {
            id: 'aurora-blue-black',
            name: 'Aurora Blue → Black',
            background: 'linear-gradient(0deg, #000000, #7FDBFF)',
            topColor: '#7FDBFF',
            navColor: '#7FDBFF',
        },
        'ion-blue-black': {
            id: 'ion-blue-black',
            name: 'Ion Blue → Black',
            background: 'linear-gradient(0deg, #000000, #1B82FF)',
            topColor: '#1B82FF',
            navColor: '#1B82FF',
        },
        'nebula-pink-black': {
            id: 'nebula-pink-black',
            name: 'Nebula Pink → Black',
            background: 'linear-gradient(0deg, #000000, #FFB7D5)',
            topColor: '#FFB7D5',
            navColor: '#FFB7D5',
        },
        'solar-flare-pink-black': {
            id: 'solar-flare-pink-black',
            name: 'Solar Flare Pink → Black',
            background: 'linear-gradient(0deg, #000000, #FF5C8A)',
            topColor: '#FF5C8A',
            navColor: '#FF5C8A',
        },
        'cosmic-periwinkle-black': {
            id: 'cosmic-periwinkle-black',
            name: 'Cosmic Periwinkle → Black',
            background: 'linear-gradient(0deg, #000000, #A7B6FF)',
            topColor: '#A7B6FF',
            navColor: '#A7B6FF',
        },
        'deep-orbit-purple-black': {
            id: 'deep-orbit-purple-black',
            name: 'Deep Orbit Purple → Black',
            background: 'linear-gradient(0deg, #000000, #5A3FFF)',
            topColor: '#5A3FFF',
            navColor: '#5A3FFF',
        },
        'stellar-orange-black': {
            id: 'stellar-orange-black',
            name: 'Stellar Orange → Black',
            background: 'linear-gradient(0deg, #FF914D, #000000)',
            topColor: '#FF914D',
            navColor: '#FF914D',
        },
        'classic-mint-black': {
            id: 'classic-mint-black',
            name: 'Classic Mint → Black',
            background: 'linear-gradient(0deg, #7FFFD4, #000000)',
            topColor: '#7FFFD4',
            navColor: '#7FFFD4',
        }
    }
} as const;

/**
 * Accessor for getting a gradient by ID safely
 */
export const getThemeGradient = (id: string | null | undefined) => {
    if (!id || !GRADIENTS.themes[id as keyof typeof GRADIENTS.themes]) {
        return GRADIENTS.themes['aurora-horizon'];
    }
    return GRADIENTS.themes[id as keyof typeof GRADIENTS.themes];
};

/**
 * Helper to get just the CSS background string
 */
export const getGradientCss = (id: string | null | undefined) => {
    return getThemeGradient(id).background;
};
