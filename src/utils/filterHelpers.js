/**
 * Filter Helpers
 * 
 * Centralized filtering logic for visible content across Feed, Search, and other views.
 * Handles blocked users and following-only filtering.
 */

/**
 * Filter items to exclude blocked users
 * @param {Array} items - Array of items (posts, users, galleries, etc.)
 * @param {Set} blockedUsers - Set of blocked user IDs
 * @param {string} userIdField - Field name containing the user ID (default: 'userId', can be 'authorId', 'ownerId', etc.)
 * @returns {Array} Filtered items
 */
export const filterBlockedUsers = (items, blockedUsers, userIdField = 'userId') => {
    if (!blockedUsers || blockedUsers.size === 0) return items;

    return items.filter(item => {
        // Check both userId and authorId fields (posts can have both)
        const userId = item[userIdField] || item.userId || item.authorId || item.ownerId;
        return !blockedUsers.has(userId);
    });
};

/**
 * Filter items to show only content from followed users
 * @param {Array} items - Array of items
 * @param {Set|Array} followingList - Set or Array of followed user IDs
 * @param {string} userIdField - Field name containing the user ID
 * @returns {Array} Filtered items
 */
export const filterFollowingOnly = (items, followingList, userIdField = 'userId') => {
    if (!followingList || (Array.isArray(followingList) && followingList.length === 0) || (followingList instanceof Set && followingList.size === 0)) {
        return items;
    }

    const followingSet = followingList instanceof Set ? followingList : new Set(followingList);

    return items.filter(item => {
        const userId = item[userIdField] || item.userId || item.authorId || item.ownerId;
        return followingSet.has(userId);
    });
};

/**
 * Combined filter for visible items
 * Filters out blocked users and optionally filters to following-only
 * 
 * @param {Array} items - Array of items to filter
 * @param {Set} blockedUsers - Set of blocked user IDs
 * @param {boolean} followingOnly - Whether to show only followed users
 * @param {Set|Array} followingList - Set or Array of followed user IDs
 * @param {string} userIdField - Field name containing the user ID (default: 'userId')
 * @returns {Array} Filtered items
 */
export const filterVisibleItems = (items, blockedUsers, followingOnly = false, followingList = null, userIdField = 'userId') => {
    if (!items || items.length === 0) return [];

    let filtered = items;

    // First, filter out blocked users
    filtered = filterBlockedUsers(filtered, blockedUsers, userIdField);

    // Then, optionally filter to following-only
    if (followingOnly && followingList) {
        filtered = filterFollowingOnly(filtered, followingList, userIdField);
    }

    return filtered;
};

/**
 * Filter posts specifically (handles both userId and authorId)
 * @param {Array} posts - Array of posts
 * @param {Set} blockedUsers - Set of blocked user IDs
 * @param {boolean} followingOnly - Whether to show only followed users
 * @param {Set|Array} followingList - Set or Array of followed user IDs
 * @returns {Array} Filtered posts
 */
export const filterVisiblePosts = (posts, blockedUsers, followingOnly = false, followingList = null) => {
    if (!posts || posts.length === 0) return [];

    let filtered = posts;

    // Filter blocked users - check both userId and authorId
    if (blockedUsers && blockedUsers.size > 0) {
        filtered = filtered.filter(post =>
            !blockedUsers.has(post.authorId) && !blockedUsers.has(post.userId)
        );
    }

    // Filter to following-only
    if (followingOnly && followingList) {
        const followingSet = followingList instanceof Set ? followingList : new Set(followingList);
        filtered = filtered.filter(post => {
            const userId = post.authorId || post.userId;
            return followingSet.has(userId);
        });
    }

    return filtered;
};

/**
 * Filter users (excludes blocked users and current user)
 * @param {Array} users - Array of users
 * @param {Set} blockedUsers - Set of blocked user IDs
 * @param {string} currentUserId - Current user's ID to exclude from results
 * @returns {Array} Filtered users
 */
export const filterVisibleUsers = (users, blockedUsers, currentUserId = null) => {
    if (!users || users.length === 0) return [];

    return users.filter(user => {
        // Exclude blocked users
        if (blockedUsers && blockedUsers.has(user.id)) return false;

        // Exclude current user
        if (currentUserId && user.id === currentUserId) return false;

        return true;
    });
};
