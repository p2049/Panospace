import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { PostPrefetchManager } from '@/core/prefetch/PostPrefetchManager';

/**
 * VirtualizedPostContainer
 * 
 * Renders a massive scrollable area but only mounts ~3 post components at a time.
 * Uses CSS translate3d for GPU-accelerated positioning.
 * Handles aggressive preloading of off-screen content.
 */
const VirtualizedPostContainer = ({ posts, renderPost, initialIndex = 0 }) => {
    const containerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Handle Scroll & Index Calculation
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (container) {
                        const scrollTop = container.scrollTop;
                        const height = window.innerHeight;
                        const index = Math.round(scrollTop / height);

                        if (index !== currentIndex) {
                            setCurrentIndex(index);
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });

        // Restore initial scroll position
        if (initialIndex > 0 && container.scrollTop === 0) {
            container.scrollTop = initialIndex * window.innerHeight;
        }

        return () => container.removeEventListener('scroll', handleScroll);
    }, [currentIndex, initialIndex]);

    // PRELOADER: Aggressively fetch next/prev post content
    useEffect(() => {
        // Window: Preload Next 2 posts, Prev 1 post
        // We prioritize Next 1 -> Prev 1 -> Next 2
        const nextPost = posts[currentIndex + 1];
        const prevPost = posts[currentIndex - 1];
        const nextNextPost = posts[currentIndex + 2];

        if (nextPost) PostPrefetchManager.preloadPost(nextPost);
        if (prevPost) PostPrefetchManager.preloadPost(prevPost);

        const timer = setTimeout(() => {
            if (nextNextPost) PostPrefetchManager.preloadPost(nextNextPost);
        }, 1000); // Delay slightly to prioritize immediate neighbors

        return () => clearTimeout(timer);

    }, [currentIndex, posts]);

    // Calculate total scroll height
    const totalHeight = `${posts.length * 100}vh`;

    // Determine render window
    // We render [current - 1, current, current + 1]
    // And keeping them mounted allows for smooth swipe gestures.
    // Adding 'buffer' if needed, but 3 is minimal and safe.
    const visibleIndices = useMemo(() => {
        const indices = [];
        const buffer = 1; // 1 above, 1 below
        for (let i = currentIndex - buffer; i <= currentIndex + buffer; i++) {
            if (i >= 0 && i < posts.length) {
                indices.push(i);
            }
        }
        return indices;
    }, [currentIndex, posts.length]);

    return (
        <div
            ref={containerRef}
            className="no-scrollbar"
            style={{
                height: '100vh',
                width: '100vw',
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
                position: 'relative',
                scrollBehavior: 'smooth',
                willChange: 'scroll-position'
            }}
        >
            {/* Phantom Spacer for Scrollbar */}
            <div style={{ height: totalHeight, width: '1px', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />

            {/* Rendered Items */}
            {visibleIndices.map(index => {
                const post = posts[index];
                const isCurrent = index === currentIndex;

                return (
                    <div
                        key={post.id} // Stable key ensures component reuse if possible, or correct unmount
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100vh',
                            // GPU Acceleration:
                            transform: `translate3d(0, ${index * 100}vh, 0)`,
                            willChange: 'transform',
                            // Snap formatting to ensure native snap catches this absolute box
                            scrollSnapAlign: 'start',
                            scrollSnapStop: 'always',
                            // Accessibility / Visibility optimization
                            visibility: 'visible',
                            pointerEvents: 'auto'
                        }}
                    >
                        {renderPost(post, index, isCurrent)}
                    </div>
                );
            })}
        </div>
    );
};

export default React.memo(VirtualizedPostContainer);
