// Custom hook for managing feed type (Art vs Social)
// Handles feed switching and persistence

import { useState, useEffect } from 'react';
import { FEED_CONFIG } from '../config/feedConfig';

const STORAGE_KEY = 'panospace_feed_type';

/**
 * Hook for managing current feed type
 * @returns {object} - { feedType, switchFeed, toggleFeed }
 */
export const useFeedType = () => {
    const [feedType, setFeedType] = useState(() => {
        // Load from localStorage or default to 'art'
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved || FEED_CONFIG.DEFAULT_ACCOUNT_TYPE;
        }
        return FEED_CONFIG.DEFAULT_ACCOUNT_TYPE;
    });

    // Persist to localStorage when changed
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, feedType);
        }
    }, [feedType]);

    /**
     * Switch to a specific feed type
     * @param {string} newType - 'art' or 'social'
     */
    const switchFeed = (newType) => {
        if (newType === 'art' || newType === 'social') {
            setFeedType(newType);
        }
    };

    /**
     * Toggle between art and social feeds
     */
    const toggleFeed = () => {
        const newType = feedType === 'art' ? 'social' : 'art';
        setFeedType(newType);
    };

    return {
        feedType,
        switchFeed,
        toggleFeed
    };
};
