import { preloadImage } from './imageLoader';

/**
 * Preload all images belonging to a film slide.
 * A film slide might contain multiple images if it's a composite,
 * or typically just one main image in current implementation,
 * but this helper abstracts the "slide content" fetching.
 * 
 * @param {Array|Object} images - Array of image objects or a single image object.
 * @returns {Promise} Resolves when all images in the slide are cached.
 */
export const preloadFilmSlide = (images: any) => {
    if (!images) return Promise.resolve();

    const imageList = Array.isArray(images) ? images : [images];

    // Extract URLs from image objects or strings
    const urls = imageList
        .map(item => {
            if (typeof item === 'string') return item;
            return item?.url || item?.preview || null;
        })
        .filter(url => url && typeof url === 'string');

    if (urls.length === 0) return Promise.resolve();

    // Preload all valid URLs in parallel
    return Promise.all(urls.map(url => preloadImage(url)));
};
