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

            // Humor Filter (New)
            showHumor: true,
            toggleShowHumor: () => {
                set((state) => ({ showHumor: !state.showHumor }));
            },

            // Page Defaults (Default to Social as requested)
            feedDefault: 'social',
            profileDefault: 'social',
            createDefault: 'social',
            searchDefault: 'social',
            ratingSystemDefault: 'smiley', // 'smiley' or 'stars'

            setFeedDefault: (page, value) => {
                set((state) => ({ [`${page}Default`]: value }));
                // If setting feed default, also update current feed to match if desired? 
                // Or just let it be the default for next reset. 
                // For now just set preference.
                if (page === 'feed') {
                    set({ currentFeed: value });
                }
            },

            setAllFeedDefaults: (value) => {
                set({
                    feedDefault: value,
                    profileDefault: value,
                    createDefault: value,
                    searchDefault: value,
                    currentFeed: value // Sync current feed too
                });
            },

            setRatingSystemDefault: (value) => {
                set({ ratingSystemDefault: value });
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
            },

            // View Mode (Session Only - 'image' | 'list')
            feedViewMode: 'image',
            setFeedViewMode: (mode) => set({ feedViewMode: mode })
        }),
        {
            name: 'panospace-feed-storage',
            partialize: (state) => ({
                currentFeed: state.currentFeed,
                hasSeenSwipeTooltip: state.hasSeenSwipeTooltip,
                followingOnly: state.followingOnly,
                customFeedEnabled: state.customFeedEnabled,
                activeCustomFeedId: state.activeCustomFeedId,
                activeCustomFeedName: state.activeCustomFeedName,
                feedDefault: state.feedDefault,
                profileDefault: state.profileDefault,
                createDefault: state.createDefault,
                searchDefault: state.searchDefault,
                ratingSystemDefault: state.ratingSystemDefault
            })
        }
    )
);
