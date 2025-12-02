/**
 * Profile Gradient System
 * Unlockable gradient themes for user profiles
 */

export const PROFILE_GRADIENTS = {
    'green-default': {
        id: 'green-default',
        name: 'Mint Gradient',
        description: 'Default Panospace gradient',
        background: 'linear-gradient(135deg, rgba(0,20,15,0.95) 0%, rgba(0,40,30,0.95) 50%, rgba(0,0,0,0.95) 100%)',
        isDefault: true,
        unlockCondition: 'default'
    },
    'blue-mint': {
        id: 'blue-mint',
        name: 'Ocean Breeze',
        description: 'Cool blue tones',
        background: 'linear-gradient(135deg, rgba(0,15,30,0.95) 0%, rgba(0,30,50,0.95) 50%, rgba(0,0,0,0.95) 100%)',
        isDefault: false,
        unlockCondition: 'achievement' // Future: unlock via achievements
    },
    'orange-sunset': {
        id: 'orange-sunset',
        name: 'Golden Hour',
        description: 'Warm sunset gradient',
        background: 'linear-gradient(135deg, rgba(30,15,0,0.95) 0%, rgba(50,25,0,0.95) 50%, rgba(0,0,0,0.95) 100%)',
        isDefault: false,
        unlockCondition: 'achievement'
    },
    'purple-night': {
        id: 'purple-night',
        name: 'Twilight',
        description: 'Deep purple night',
        background: 'linear-gradient(135deg, rgba(20,0,30,0.95) 0%, rgba(35,0,50,0.95) 50%, rgba(0,0,0,0.95) 100%)',
        isDefault: false,
        unlockCondition: 'achievement'
    },
    'grey-steel': {
        id: 'grey-steel',
        name: 'Steel',
        description: 'Monochrome elegance',
        background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(30,30,30,0.95) 50%, rgba(0,0,0,0.95) 100%)',
        isDefault: false,
        unlockCondition: 'achievement'
    }
};

/**
 * Get gradient by ID
 */
export const getGradient = (gradientId) => {
    return PROFILE_GRADIENTS[gradientId] || PROFILE_GRADIENTS['green-default'];
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
    return 'green-default';
};

/**
 * Get all unlocked gradients for a user
 */
export const getUnlockedGradients = (user) => {
    if (!user?.profileTheme?.unlockedGradients) {
        return ['green-default'];
    }
    return user.profileTheme.unlockedGradients;
};

/**
 * Get user's current gradient ID
 */
export const getCurrentGradientId = (user) => {
    if (!user?.profileTheme?.gradientId) {
        return 'green-default';
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
