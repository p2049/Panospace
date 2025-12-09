/**
 * Feed Store - Zustand store for managing feed state
 * Locked to Art Only
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const TOOLTIP_KEY = 'panospace_feed_swipe_tooltip_shown';

export const useFeedStore = create(
    persist(
        (set, get) => ({
            // Current feed type - default to art
            currentFeed: 'art',

            // Following only mode
            followingOnly: false,

            // Switch to specific feed
            switchToFeed: (feedType) => {
                set({ currentFeed: feedType });
            },

            // Toggle between feeds
            toggleFeed: () => {
                const current = get().currentFeed;
                const next = current === 'art' ? 'social' : 'art';
                set({ currentFeed: next });
            },

            // Toggle following only
            toggleFollowingOnly: () => {
                set((state) => ({ followingOnly: !state.followingOnly }));
            },

            // Set following only
            setFollowingOnly: (value) => {
                set({ followingOnly: value });
            },

            // Custom Feed State
            customFeedEnabled: false,
            activeCustomFeedId: null,
            activeCustomFeedName: null,

            toggleCustomFeed: () => {
                set((state) => ({ customFeedEnabled: !state.customFeedEnabled }));
            },

            setCustomFeedEnabled: (enabled) => {
                set({ customFeedEnabled: enabled });
            },

            setActiveCustomFeed: (id, name) => {
                set({ activeCustomFeedId: id, activeCustomFeedName: name });
            },

            // Mark tooltip as seen
            markTooltipSeen: () => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem(TOOLTIP_KEY, 'true');
                }
                set({ hasSeenSwipeTooltip: true });
            },

            // Reset tooltip
            resetTooltip: () => {
                set({ hasSeenSwipeTooltip: false });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(TOOLTIP_KEY);
                }
            }
        }),
        {
            name: 'panospace-feed-storage',
            partialize: (state) => ({
                currentFeed: state.currentFeed,
                hasSeenSwipeTooltip: state.hasSeenSwipeTooltip,
                followingOnly: state.followingOnly,
                customFeedEnabled: state.customFeedEnabled,
                activeCustomFeedId: state.activeCustomFeedId,
                activeCustomFeedName: state.activeCustomFeedName
            })
        }
    )
);
