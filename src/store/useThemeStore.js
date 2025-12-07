/**
 * Theme Store - Manages accent color theming
 * Locked to Art mode
 */

import { create } from 'zustand';

// Color definitions (Art only)
const ART_THEME = {
    name: 'art',
    accentColor: '#7FFFD4',      // Mint green
    secondaryColor: '#4CC9F0',    // Cyan
    glowColor: 'rgba(127, 255, 212, 0.18)',
    glowColorStrong: 'rgba(127, 255, 212, 0.4)',
    borderColor: 'rgba(127, 255, 212, 0.2)',
    gradientStart: '#7FFFD4',
    gradientEnd: '#4CC9F0'
};

export const useThemeStore = create((set) => ({
    // Current theme
    theme: 'art',

    // Current colors
    ...ART_THEME,

    // Switch theme (No-op or reset to art)
    setTheme: (themeName) => {
        // Enforce art theme regardless of input
        set({ theme: 'art', ...ART_THEME });

        // Update CSS variables if needed (though they should be default)
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            root.style.setProperty('--accent-color', ART_THEME.accentColor);
            root.style.setProperty('--accent-secondary', ART_THEME.secondaryColor);
            root.style.setProperty('--accent-glow', ART_THEME.glowColor);
            root.style.setProperty('--accent-glow-strong', ART_THEME.glowColorStrong);
            root.style.setProperty('--accent-border', ART_THEME.borderColor);
            root.style.setProperty('--accent-gradient-start', ART_THEME.gradientStart);
            root.style.setProperty('--accent-gradient-end', ART_THEME.gradientEnd);

            // Remove social theme class if present
            document.body.classList.remove('social-theme');
        }
    },

    // Get current theme colors
    getColors: () => {
        return ART_THEME;
    }
}));

// Helper hook to get theme colors
export const useThemeColors = () => {
    return ART_THEME;
};
