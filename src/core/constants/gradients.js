/**
 * Profile Gradient System
 * Unlockable gradient themes for user profiles
 */

export const PROFILE_GRADIENTS = {
    'aurora-horizon': {
        id: 'aurora-horizon',
        name: 'Aurora Horizon',
        description: 'Blue to Pink Shift',
        background: 'linear-gradient(0deg, #7FDBFF, #FFB7D5, #FF5C8A)',
        topColor: '#FF5C8A',
        isDefault: true,
        unlockCondition: 'default'
    },
    'cosmic-sunset': {
        id: 'cosmic-sunset',
        name: 'Cosmic Sunset',
        description: 'Orange to Purple Fade',
        background: 'linear-gradient(0deg, #FF914D, #FF5C8A, #5A3FFF)',
        topColor: '#5A3FFF',
        isDefault: false,
        unlockCondition: 'free'
    },
    'nebula-dream': {
        id: 'nebula-dream',
        name: 'Nebula Dream',
        description: 'Pink to Deep Purple',
        background: 'linear-gradient(0deg, #FFB7D5, #A7B6FF, #5A3FFF)',
        topColor: '#5A3FFF',
        isDefault: false,
        unlockCondition: 'free'
    },
    'void-aurora': {
        id: 'void-aurora',
        name: 'Void Aurora',
        description: 'Purple to Ion Blue',
        background: 'linear-gradient(0deg, #1A0535, #7FDBFF, #1B82FF)',
        topColor: '#1B82FF',
        isDefault: false,
        unlockCondition: 'free'
    },
    'solar-drop': {
        id: 'solar-drop',
        name: 'Solar Drop',
        description: 'Flare to Cosmic Ice',
        background: 'linear-gradient(0deg, #FF5C8A, #FF914D, #E6F8FF)',
        topColor: '#E6F8FF',
        isDefault: false,
        unlockCondition: 'free'
    },
    'mint-nebula': {
        id: 'mint-nebula',
        name: 'Mint Nebula',
        description: 'Atmospheric Blue',
        background: 'linear-gradient(0deg, #AEE1FF, #62B6FF, #1B75D1)',
        topColor: '#1B75D1',
        isDefault: false,
        unlockCondition: 'free'
    },
    'night-sky': {
        id: 'night-sky',
        name: 'Night Sky',
        description: 'Deep Cosmic Blue',
        background: 'linear-gradient(0deg, #0A0F2D, #131A45, #1E275B)',
        topColor: '#1E275B',
        isDefault: false,
        unlockCondition: 'free'
    },
    // Gradients fading to black at the bottom using palette colors
    'aurora-blue-black': {
        id: 'aurora-blue-black',
        name: 'Aurora Blue → Black',
        description: 'Aurora Blue fading to black',
        background: 'linear-gradient(0deg, #000000, #7FDBFF)',
        topColor: '#7FDBFF',
        isDefault: false,
        unlockCondition: 'free'
    },
    'ion-blue-black': {
        id: 'ion-blue-black',
        name: 'Ion Blue → Black',
        description: 'Ion Blue fading to black',
        background: 'linear-gradient(0deg, #000000, #1B82FF)',
        topColor: '#1B82FF',
        isDefault: false,
        unlockCondition: 'free'
    },
    'nebula-pink-black': {
        id: 'nebula-pink-black',
        name: 'Nebula Pink → Black',
        description: 'Nebula Pink fading to black',
        background: 'linear-gradient(0deg, #000000, #FFB7D5)',
        topColor: '#FFB7D5',
        isDefault: false,
        unlockCondition: 'free'
    },
    'solar-flare-pink-black': {
        id: 'solar-flare-pink-black',
        name: 'Solar Flare Pink → Black',
        description: 'Solar Flare Pink fading to black',
        background: 'linear-gradient(0deg, #000000, #FF5C8A)',
        topColor: '#FF5C8A',
        isDefault: false,
        unlockCondition: 'free'
    },
    'cosmic-periwinkle-black': {
        id: 'cosmic-periwinkle-black',
        name: 'Cosmic Periwinkle → Black',
        description: 'Cosmic Periwinkle fading to black',
        background: 'linear-gradient(0deg, #000000, #A7B6FF)',
        topColor: '#A7B6FF',
        isDefault: false,
        unlockCondition: 'free'
    },
    'deep-orbit-purple-black': {
        id: 'deep-orbit-purple-black',
        name: 'Deep Orbit Purple → Black',
        description: 'Deep Orbit Purple fading to black',
        background: 'linear-gradient(0deg, #000000, #5A3FFF)',
        topColor: '#5A3FFF',
        isDefault: false,
        unlockCondition: 'free'
    },
    'stellar-orange-black': {
        id: 'stellar-orange-black',
        name: 'Stellar Orange → Black',
        description: 'Stellar Orange fading to black',
        background: 'linear-gradient(0deg, #FF914D, #000000)',
        topColor: '#FF914D',
        isDefault: false,
        unlockCondition: 'free'
    },
    'classic-mint-black': {
        id: 'classic-mint-black',
        name: 'Classic Mint → Black',
        description: 'Classic Mint fading to black',
        background: 'linear-gradient(0deg, #7FFFD4, #000000)',
        topColor: '#7FFFD4',
        isDefault: false,
        unlockCondition: 'free'
    }
};

/**
 * Get gradient by ID
 */
export const getGradient = (gradientId) => {
    return PROFILE_GRADIENTS[gradientId] || PROFILE_GRADIENTS['aurora-horizon'];
};

/**
 * Get gradient background CSS
 */
export const getGradientBackground = (gradientId) => {
    const gradient = getGradient(gradientId);
    return gradient.background;
};

/**
 * Get default gradient ID
 */
export const getDefaultGradientId = () => {
    return 'aurora-horizon';
};

/**
 * Get all unlocked gradients for a user
 */
export const getUnlockedGradients = (user) => {
    if (!user?.profileTheme?.unlockedGradients) {
        return ['aurora-horizon'];
    }
    return user.profileTheme.unlockedGradients;
};

/**
 * Get user's current gradient ID
 */
export const getCurrentGradientId = (user) => {
    if (!user?.profileTheme?.gradientId) {
        return 'aurora-horizon';
    }
    return user.profileTheme.gradientId;
};

/**
 * Check if gradient is unlocked for user
 */
export const isGradientUnlocked = (gradientId, user) => {
    const unlocked = getUnlockedGradients(user);
    return unlocked.includes(gradientId);
};
