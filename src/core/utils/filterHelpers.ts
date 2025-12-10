/**
 * Filter Helpers
 * 
 * Centralized filtering logic for visible content across Feed, Search, and other views.
 * Handles blocked users and following-only filtering.
 */

/**
 * Filter items to exclude blocked users
 */
export const filterBlockedUsers = <T extends Record<string, any>>(
    items: T[],
    blockedUsers: Set<string>,
    userIdField: string = 'userId'
): T[] => {
    if (!blockedUsers || blockedUsers.size === 0) return items;

    return items.filter(item => {
        // Check both userId and authorId fields (posts can have both)
        const userId = item[userIdField] || item.userId || item.authorId || item.ownerId;
        return !blockedUsers.has(userId);
    });
};

/**
 * Filter items to show only content from followed users
 */
export const filterFollowingOnly = <T extends Record<string, any>>(
    items: T[],
    followingList: Set<string> | string[] | null | undefined,
    userIdField: string = 'userId'
): T[] => {
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
 */
export const filterVisibleItems = <T extends Record<string, any>>(
    items: T[],
    blockedUsers: Set<string>,
    followingOnly: boolean = false,
    followingList: Set<string> | string[] | null = null,
    userIdField: string = 'userId'
): T[] => {
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
 */
export const filterVisiblePosts = <T extends { authorId?: string; userId?: string }>(
    posts: T[],
    blockedUsers: Set<string>,
    followingOnly: boolean = false,
    followingList: Set<string> | string[] | null = null
): T[] => {
    if (!posts || posts.length === 0) return [];

    let filtered = posts;

    // Filter blocked users - check both userId and authorId
    if (blockedUsers && blockedUsers.size > 0) {
        filtered = filtered.filter(post =>
            (!post.authorId || !blockedUsers.has(post.authorId)) &&
            (!post.userId || !blockedUsers.has(post.userId))
        );
    }

    // Filter to following-only
    if (followingOnly && followingList) {
        const followingSet = followingList instanceof Set ? followingList : new Set(followingList);
        filtered = filtered.filter(post => {
            const userId = post.authorId || post.userId;
            return userId ? followingSet.has(userId) : false;
        });
    }

    return filtered;
};

/**
 * Filter users (excludes blocked users and current user)
 */
export const filterVisibleUsers = <T extends { id: string }>(
    users: T[],
    blockedUsers: Set<string>,
    currentUserId: string | null = null
): T[] => {
    if (!users || users.length === 0) return [];

    return users.filter(user => {
        // Exclude blocked users
        if (blockedUsers && blockedUsers.has(user.id)) return false;

        // Exclude current user
        if (currentUserId && user.id === currentUserId) return false;

        return true;
    });
};
