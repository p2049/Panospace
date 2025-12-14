/**
 * PHASE 2 — FOOLPROOF RESPONSIVE LAYOUT ENGINE
 * 
 * Centralized logic for handling window size, orientation, device class,
 * safe zones, and dynamic layout configuration.
 */

export type DeviceClass = 'phone' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface SafeZones {
    top: string;
    bottom: string;
    left: string;
    right: string;
}

export interface LayoutConfig {
    // Structural
    containerWidth: string;
    paddingX: string;
    paddingY: string;

    // Header / Banner
    headerHeight: string;
    bannerHeight: string;
    bannerPaddingTop: string;

    // Grid
    gridColumns: number;
    gridGap: string;

    // Navigation
    navPosition: 'bottom' | 'side' | 'top';
    navHeight: string;

    // Typography
    baseFontSize: string;
    headingScale: number;

    // Specific Components
    profile: {
        avatarSize: string;
        avatarBorderWidth: string;
        usernameSize: string;
        statsRowGap: string;
        actionButtonSize: string;
    };

    createPost: {
        previewHeight: string;
        controlsOrientation: 'vertical' | 'horizontal';
    };
}

// Breakpoints
const BREAKPOINTS = {
    TABLET: 768,
    DESKTOP: 1024,
    WIDE: 1440
};

// Safe Zone Defaults (CSS env variables fallback)
const SAFE_ZONES: SafeZones = {
    top: 'max(0px, env(safe-area-inset-top))',
    bottom: 'max(0px, env(safe-area-inset-bottom))',
    left: 'max(0px, env(safe-area-inset-left))',
    right: 'max(0px, env(safe-area-inset-right))'
};

/**
 * Get device class based on dimensions
 */
export function getDeviceClass(width: number, height: number): DeviceClass {
    if (width >= BREAKPOINTS.DESKTOP) return 'desktop';
    if (width >= BREAKPOINTS.TABLET) return 'tablet';
    return 'phone';
}

/**
 * Get orientation based on dimensions
 */
export function getOrientation(width: number, height: number): Orientation {
    return width > height ? 'landscape' : 'portrait';
}

/**
 * Get layout configuration for a specific screen/context
 */
export function layoutForScreen(width: number, height: number, screen: string = 'default'): LayoutConfig {
    const device = getDeviceClass(width, height);
    const orientation = getOrientation(width, height);

    // Base configuration
    const config: LayoutConfig = {
        containerWidth: '100%',
        paddingX: '1rem',
        paddingY: '1rem',
        headerHeight: '60px',
        bannerHeight: 'auto', // Dynamic content usually
        bannerPaddingTop: SAFE_ZONES.top,
        gridColumns: 1,
        gridGap: '1px',
        navPosition: 'bottom',
        navHeight: '60px',
        baseFontSize: '16px',
        headingScale: 1.0,
        profile: {
            avatarSize: '90px',
            avatarBorderWidth: '3px',
            usernameSize: '1.5rem',
            statsRowGap: '1rem',
            actionButtonSize: '40px'
        },
        createPost: {
            previewHeight: '400px',
            controlsOrientation: 'vertical'
        }
    };

    // --- DEVICE SPECIFIC OVERRIDES ---

    if (device === 'phone') {
        config.containerWidth = '100%';
        config.paddingX = '1rem';
        config.gridColumns = orientation === 'landscape' ? 2 : 1;

        config.profile.avatarSize = '75px';
        config.profile.usernameSize = '1.5rem';

        // Navigation Spacing (Bottom Bar)
        config.navHeight = 'calc(60px + env(safe-area-inset-bottom))';
    }
    else if (device === 'tablet') {
        config.containerWidth = orientation === 'portrait' ? '90%' : '80%';
        config.paddingX = '2rem';
        config.gridColumns = orientation === 'landscape' ? 3 : 2;
        config.navPosition = 'side'; // Or top depending on design
        config.profile.avatarSize = '100px';
        config.profile.usernameSize = '2rem';
    }
    else if (device === 'desktop') {
        config.containerWidth = '1200px'; // Max width
        config.paddingX = '2rem';
        config.gridColumns = 4;
        config.navPosition = 'side'; // Sidebar usually
        config.headerHeight = '80px';

        config.profile.avatarSize = '120px';
        config.profile.usernameSize = '2.5rem';
    }

    // --- SCREEN SPECIFIC OVERRIDES ---

    switch (screen) {
        case 'profile':
            // Profile specific layout tweaks
            if (device === 'phone') {
                config.gridColumns = 4; // Dense grid for visual impact
                config.gridGap = '2px'; // Tighter gap for grid
                config.paddingX = '2px'; // Maximize width for images
            } else {
                config.gridGap = '1rem'; // Standard gap for larger screens
            }
            if (device === 'desktop') {
                config.bannerHeight = '300px';
            }
            break;

        case 'create_collection':
            if (orientation === 'landscape' && device === 'phone') {
                // Fix for landscape phone modal height issues
                config.createPost.previewHeight = '100%';
                config.createPost.controlsOrientation = 'horizontal';
                config.paddingY = '0.5rem';
            }
            break;

        case 'create_post':
            // Ensure canvas has room
            if (device === 'phone') {
                config.paddingX = '0'; // Full width for editing
            }
            break;
    }

    return config;
}

/**
 * Helper to get CSS value for specific spacing
 * Uses safe zones ensuring content doesn't overlap notch
 */
export function getSafeSpacing(side: keyof SafeZones, additionalParams: string = '0px'): string {
    return `calc(${SAFE_ZONES[side]} + ${additionalParams})`;
}
