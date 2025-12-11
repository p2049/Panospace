/**
 * Global Image Cache to track loaded images and avoid re-decoding/flicker.
 * Lightweight singleton.
 */

const loadedImages = new Map<string, HTMLImageElement | true>();

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
    if (url) loadedImages.set(url, true);
};

/**
 * Preload an image URL
 * Uses new Image() to force browser download and decode
 * Stores the image strictly in memory to prevent GC during transitions
 */
export const preloadImage = (url: string | null | undefined): void => {
    if (!url || isImageLoaded(url)) return;

    // Trigger download & Store Reference
    const img = new Image();
    img.decoding = 'async';
    img.src = url;

    // Store in cache immediately
    loadedImages.set(url, img);

    img.decode().then(() => {
        // Decoded successfully, keep in cache
    }).catch(() => {
        // Fallback or error, but we keep the reference if it loads eventually via onload
    });

    img.onload = () => {
        // Validated load
    };
};
