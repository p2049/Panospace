/**
 * Global Image Cache to track loaded images and avoid re-decoding/flicker.
 * Lightweight singleton.
 */

const loadedImages = new Set<string>();

/**
 * Check if an image is already loaded/decoded
 */
export const isImageLoaded = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return loadedImages.has(url);
};

/**
 * Mark an image as loaded
 */
export const markImageLoaded = (url: string | null | undefined): void => {
    if (url) loadedImages.add(url);
};

/**
 * Preload an image URL
 * Uses new Image() to force browser download and decode
 */
export const preloadImage = (url: string | null | undefined): void => {
    if (!url || isImageLoaded(url)) return;

    // Trigger download
    const img = new Image();
    img.src = url;
    img.decode().then(() => {
        markImageLoaded(url);
    }).catch(() => {
        // Fallback for decode error or non-supporting browsers,
        // still mark as "attempted" or wait for onload?
        // Just rely on onload
    });

    img.onload = () => {
        markImageLoaded(url);
    };
};
