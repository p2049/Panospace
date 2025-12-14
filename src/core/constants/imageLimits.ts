/**
 * Centralized Image Size Limits
 * Single source of truth for all image upload size restrictions
 */

// Size limits in bytes
export const IMAGE_SIZE_LIMITS = {
    FREE_USER_MAX_BYTES: 20 * 1024 * 1024,      // 20MB for free users
    PREMIUM_USER_MAX_BYTES: 30 * 1024 * 1024,   // 30MB for premium users
    FIREBASE_HARD_LIMIT_BYTES: 30 * 1024 * 1024, // Firebase rules ceiling (30MB)
} as const;

// Size limits in MB for display purposes
export const IMAGE_SIZE_LIMITS_MB = {
    FREE_USER_MAX_MB: 20,
    PREMIUM_USER_MAX_MB: 30,
} as const;

// Scaling configuration
export const IMAGE_SCALING_CONFIG = {
    TARGET_SIZE_RATIO: 0.92,        // Scale to 92% of limit for safety margin
    MIN_QUALITY: 0.65,              // Minimum JPEG quality to preserve visuals
    QUALITY_STEP: 0.05,             // Quality reduction step during iteration
    MAX_SCALING_ATTEMPTS: 5,        // Max iterations to reach target size
    INITIAL_QUALITY: 0.92,          // Starting quality for JPEG export
} as const;

/**
 * Get the maximum allowed image size for a user tier
 * @param isPremium - Whether user has premium/Space Creator tier
 * @returns Maximum file size in bytes
 */
export const getMaxImageSize = (isPremium: boolean): number => {
    return isPremium
        ? IMAGE_SIZE_LIMITS.PREMIUM_USER_MAX_BYTES
        : IMAGE_SIZE_LIMITS.FREE_USER_MAX_BYTES;
};

/**
 * Get the maximum allowed image size for display
 * @param isPremium - Whether user has premium tier
 * @returns Maximum file size in MB
 */
export const getMaxImageSizeMB = (isPremium: boolean): number => {
    return isPremium
        ? IMAGE_SIZE_LIMITS_MB.PREMIUM_USER_MAX_MB
        : IMAGE_SIZE_LIMITS_MB.FREE_USER_MAX_MB;
};

/**
 * Format bytes to human-readable MB string
 * @param bytes - File size in bytes
 * @returns Formatted string like "24.6MB"
 */
export const formatFileSizeMB = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
};

/**
 * Check if a file exceeds the size limit for user tier
 * @param fileSize - File size in bytes
 * @param isPremium - Whether user has premium tier
 * @returns Object with validation result and details
 */
export const validateImageSize = (fileSize: number, isPremium: boolean): {
    isValid: boolean;
    exceededBy: number;
    limit: number;
    limitMB: number;
    actualMB: string;
} => {
    const limit = getMaxImageSize(isPremium);
    const limitMB = getMaxImageSizeMB(isPremium);
    const isValid = fileSize <= limit;
    const exceededBy = isValid ? 0 : fileSize - limit;
    const actualMB = formatFileSizeMB(fileSize);

    return { isValid, exceededBy, limit, limitMB, actualMB };
};
