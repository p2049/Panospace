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
            // Feed Content Type ('art' | 'social' | 'all')
            feedContentType: 'all',

            // Feed Scope ('following' | 'global' | 'all')
            feedScope: 'global',

            // Current feed type - DEPRECATED (kept for compat) - maps to feedContentType
            currentFeed: 'art',

            // Following only mode - DEPRECATED (kept for compat) - maps to feedScope
            followingOnly: false,

            // Switch content type
            setFeedContentType: (type) => {
                set({ feedContentType: type, currentFeed: type === 'all' ? 'art' : type });
            },

            // Switch scope
            setFeedScope: (scope) => {
                set({ feedScope: scope, followingOnly: scope === 'following' });
            },

            // Legacy Switch method
            switchToFeed: (feedType) => {
                set({ feedContentType: feedType, currentFeed: feedType });
            },

            // Toggle between feeds (Art/Social) - rotates Art -> Social
            // Toggle between feeds (Art/Social) - rotates Art -> Social
            toggleFeed: () => {
                const current = get().feedContentType;
                // If social, go to art. Otherwise (art or all), go to social.
                const next = current === 'social' ? 'art' : 'social';
                set({
                    feedContentType: next,
                    currentFeed: next
                });
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
            feedDefault: 'all',
            profileDefault: 'all',
            createDefault: 'all',
            searchDefault: 'all',
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
                set({ followingOnly: value, feedScope: value ? 'following' : 'global' });
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
                    localStow
                }
            },

            // View Mode (Session Only - 'image' | 'list')
            feedViewMode: 'image',
            setFeedViewMode: (mode) => {
                const state = get();
                if (mode === 'image' && state.listFilter === 'text') {
                    set({ feedViewMode: mode, listFilter: 'visual' });
                } else {
                    set({ feedViewMode: mode });
                }
            },

            animationsEnabled: true,
            toggleAnimations: () => {
                set((state) => ({ animationsEnabled: !state.animationsEnabled }));
            },
            setAnimationsEnabled: (enabled) => {
                set({ animationsEnabled: enabled });
            },

            // List View Filter (Session Only - 'all' | 'visual' | 'text')
            listFilter: 'all',
            setListFilter: (filter) => set({ listFilter: filter })
        }),
        {
            name: 'panospace-feed-storage',
            partialize: (state) => ({
                currentFeed: state.currentFeed,
                feedContentType: state.feedContentType,
                feedScope: state.feedScope,
                hasSeenSwipeTooltip: state.hasSeenSwipeTooltip,
                followingOnly: state.followingOnly,
                customFeedEnabled: state.customFeedEnabled,
                activeCustomFeedId: state.activeCustomFeedId,
                activeCustomFeedName: state.activeCustomFeedName,
                feedDefault: state.feedDefault,
                profileDefault: state.profileDefault,
                createDefault: state.createDefault,
                searchDefault: state.searchDefault,
                ratingSystemDefault: state.ratingSystemDefault,
                listFilter: state.listFilter,
                animationsEnabled: state.animationsEnabled
            })
        }
    )
);
