import { IMAGE_CONFIG } from './imageConfig';

const CACHE_LIMIT = 100;
const imageCache = new Map();
const activeRequests = new Map();

/**
 * Get variants for an image source based on context.
 * In a real implementation, this would append query params for a fast resizing service.
 */
export const getImageVariants = (src: any, context: any) => {
    // Placeholder for backend resize logic
    // For now, return the original source as both low and high res 
    // unless a specific thumbnail convention exists.
    return {
        lowResSrc: src,
        highResSrc: src
    };
};

/**
 * Preload an image with caching and request deduping.
 * Uses async decoding to prevent main thread blocking.
 */
export const preloadImage = (src: any) => {
    if (!src) return Promise.resolve();
    if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));
    if (activeRequests.has(src)) return activeRequests.get(src);

    const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;

        const handleLoad = () => {
            if (imageCache.size >= CACHE_LIMIT) {
                const firstKey = imageCache.keys().next().value;
                imageCache.delete(firstKey);
            }
            imageCache.set(src, img);
            activeRequests.delete(src);
            resolve(img);
        };

        const handleError = (err: any) => {
            activeRequests.delete(src);
            // Don't reject aggressively to prevent UI crashes, just resolve empty
            console.warn('Failed to preload image:', src);
            resolve(null);
        };

        img.decode()
            .then(handleLoad)
            .catch(() => {
                // Fallback to onload if decode fails
                img.onload = handleLoad;
                img.onerror = handleError;
            });
    });

    activeRequests.set(src, promise);
    return promise;
};

/**
 * Preload multiple variants if needed
 */
export const preloadImageVariants = ({ lowResSrc, highResSrc }: any) => {
    return Promise.all([
        preloadImage(lowResSrc),
        preloadImage(highResSrc)
    ]);
};

export const isImageCached = (src: any) => imageCache.has(src);
