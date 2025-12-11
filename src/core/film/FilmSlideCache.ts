/**
 * FilmSlideCache
 * 
 * Stores pre-rendered blobs of film slides to avoid repeated canvas operations.
 * Keys are typically `${postId}_${slideIndex}`.
 */
const slideCache = new Map<string, string>();

export const FilmSlideCache = {
    get: (key: string): string | undefined => {
        return slideCache.get(key);
    },

    set: (key: string, url: string): void => {
        slideCache.set(key, url);
        // Simple eviction validation could go here, 
        // but likely the browser manages blob URLs or we clean up on unmount.
        // ideally we would revokeObjectURL when evicting.
    },

    has: (key: string): boolean => {
        return slideCache.has(key);
    },

    clear: () => {
        slideCache.forEach(url => URL.revokeObjectURL(url));
        slideCache.clear();
    }
};
