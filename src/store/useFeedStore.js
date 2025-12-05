/**
 * Feed Store - Zustand store for managing feed state
 * Handles current feed type, switching, and persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FEED_CONFIG } from '../config/feedConfig';

const TOOLTIP_KEY = 'panospace_feed_swipe_tooltip_shown';

export const useFeedStore = create(
    persist(
        (set, get) => ({
            // Current feed type
            currentFeed: FEED_CONFIG.DEFAULT_ACCOUNT_TYPE,

            // Tooltip state
            hasSeenSwipeTooltip: typeof window !== 'undefined'
                ? localStorage.getItem(TOOLTIP_KEY) === 'true'
                : false,

            // Switch to specific feed
            switchToFeed: (feedType) => {
                if (feedType === 'art' || feedType === 'social') {
                    set({ currentFeed: feedType });
                }
            },

            // Toggle between feeds
            toggleFeed: () => {
                const { currentFeed } = get();
                const newFeed = currentFeed === 'art' ? 'social' : 'art';
                set({ currentFeed: newFeed });
            },

            // Mark tooltip as seen
            markTooltipSeen: () => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem(TOOLTIP_KEY, 'true');
                }
                set({ hasSeenSwipeTooltip: true });
            },

            // Reset tooltip (for testing)
            resetTooltip: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(TOOLTIP_KEY);
                }
                set({ hasSeenSwipeTooltip: false });
            }
        }),
        {
            name: 'panospace-feed-storage',
            partialize: (state) => ({ currentFeed: state.currentFeed })
        }
    )
);
