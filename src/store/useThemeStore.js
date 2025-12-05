/**
 * Theme Store - Manages accent color theming for Art vs Social modes
 * Automatically switches colors based on current feed
 */

import { create } from 'zustand';

// Color definitions
const THEMES = {
    art: {
        name: 'art',
        accentColor: '#7FFFD4',      // Mint green
        secondaryColor: '#4CC9F0',    // Cyan
        glowColor: 'rgba(127, 255, 212, 0.18)',
        glowColorStrong: 'rgba(127, 255, 212, 0.4)',
        borderColor: 'rgba(127, 255, 212, 0.2)',
        gradientStart: '#7FFFD4',
        gradientEnd: '#4CC9F0'
    },
    social: {
        name: 'social',
        accentColor: '#00A4FF',       // Primary blue
        secondaryColor: '#33B9FF',    // Secondary/hover blue
        glowColor: 'rgba(0, 164, 255, 0.18)',
        glowColorStrong: 'rgba(0, 164, 255, 0.4)',
        borderColor: 'rgba(0, 164, 255, 0.2)',
        gradientStart: '#00A4FF',
        gradientEnd: '#33B9FF'
    }
};

export const useThemeStore = create((set) => ({
    // Current theme
    theme: 'art',

    // Current colors (default to art)
    ...THEMES.art,

    // Switch theme
    setTheme: (themeName) => {
        const newTheme = THEMES[themeName] || THEMES.art;
        set({ theme: themeName, ...newTheme });

        // Update CSS variables
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            root.style.setProperty('--accent-color', newTheme.accentColor);
            root.style.setProperty('--accent-secondary', newTheme.secondaryColor);
            root.style.setProperty('--accent-glow', newTheme.glowColor);
            root.style.setProperty('--accent-glow-strong', newTheme.glowColorStrong);
            root.style.setProperty('--accent-border', newTheme.borderColor);
            root.style.setProperty('--accent-gradient-start', newTheme.gradientStart);
            root.style.setProperty('--accent-gradient-end', newTheme.gradientEnd);
        }
    },

    // Get current theme colors
    getColors: () => {
        const state = useThemeStore.getState();
        return {
            accentColor: state.accentColor,
            secondaryColor: state.secondaryColor,
            glowColor: state.glowColor,
            glowColorStrong: state.glowColorStrong,
            borderColor: state.borderColor,
            gradientStart: state.gradientStart,
            gradientEnd: state.gradientEnd
        };
    }
}));

// Helper hook to get theme colors
export const useThemeColors = () => {
    const colors = useThemeStore((state) => ({
        accentColor: state.accentColor,
        secondaryColor: state.secondaryColor,
        glowColor: state.glowColor,
        glowColorStrong: state.glowColorStrong,
        borderColor: state.borderColor,
        gradientStart: state.gradientStart,
        gradientEnd: state.gradientEnd
    }));
    return colors;
};
