// Custom hook for managing feed type (Art only)
// Locked to 'art' mode

/**
 * Hook for managing current feed type
 * @returns {object} - { feedType: 'art', switchFeed: no-op, toggleFeed: no-op }
 */
export const useFeedType = () => {
    return {
        feedType: 'art',
        switchFeed: () => { },
        toggleFeed: () => { }
    };
};
