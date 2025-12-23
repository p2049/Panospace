import { preloadImage } from '../image/imageLoader';
import { preloadFilmSlide } from '../image/preloadFilmSlide';

// Track prefetched posts to avoid redundant processing
const prefetchedPostIds = new Set<string>();

export const PostPrefetchManager = {
    /**
     * Checks if a post has already been queued for prefetching.
     */
    isPrefetched: (postId: string): boolean => {
        return prefetchedPostIds.has(postId);
    },

    /**
     * Marks a post as prefetched.
     */
    markPrefetched: (postId: string): void => {
        prefetchedPostIds.add(postId);
    },

    /**
     * Preloads all critical assets for a post (images, avatar, film slides).
     * Runs asynchronously using idle time if available.
     * 
     * @param post The post object to prefetch
     */
    preloadPost: async (post: any): Promise<void> => {
        if (!post || !post.id || prefetchedPostIds.has(post.id)) {
            return;
        }

        // Mark immediately to prevent double-scheduling
        prefetchedPostIds.add(post.id);

        const runPreload = async () => {
            try {
                // 1. Gather all image URLs
                const urlsToLoad: string[] = [];

                // Items/Slides/Images array (handles multi-slide and film strips)
                const items = post.items || post.images || post.slides || [];

                // If it has items, determine how many to preload
                if (Array.isArray(items) && items.length > 0) {
                    // Mobile optimization: prefetch fewer images on mobile
                    const isMobile = typeof window !== 'undefined' &&
                        (window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
                    const prefetchCount = isMobile ? 2 : 5;

                    items.slice(0, prefetchCount).forEach((item: any) => {
                        if (typeof item === 'string') {
                            urlsToLoad.push(item);
                        } else if (item) {
                            // Handle varied object structures
                            if (item.url) urlsToLoad.push(item.url);
                            if (item.preview) urlsToLoad.push(item.preview);
                            // Film UI sometimes nests images or uses 'content' for text... we only care about URLs.
                        }
                    });
                } else {
                    // Fallback to single image fields
                    if (post.imageUrl) urlsToLoad.push(post.imageUrl);
                    if (post.shopImageUrl) urlsToLoad.push(post.shopImageUrl);
                }

                // Author Avatar
                const authorPhoto = post.authorPhotoUrl || post.userPhotoUrl || post.userAvatar || post.profileImage;
                if (authorPhoto && typeof authorPhoto === 'string') {
                    urlsToLoad.push(authorPhoto);
                }

                // Filter out empty or non-string
                const validUrls = urlsToLoad.filter(u => u && typeof u === 'string' && u.startsWith('http'));

                // 2. Execute Preload
                // preloadFilmSlide is a wrapper around Promise.all(preloadImage)
                if (validUrls.length > 0) {
                    await preloadFilmSlide(validUrls);
                }

            } catch (err) {
                console.warn(`[Prefetch] Failed for post ${post.id}`, err);
            }
        };

        // Schedule execution: Use requestIdleCallback if available for non-blocking perf
        if (typeof window !== 'undefined' && (window as any).requestIdleCallback) {
            (window as any).requestIdleCallback(() => runPreload(), { timeout: 2000 });
        } else {
            // Fallback for Safari / other envs
            setTimeout(runPreload, 0);
        }
    }
};
