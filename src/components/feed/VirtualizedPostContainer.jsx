import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { FaRocket } from 'react-icons/fa';
import { PostPrefetchManager } from '@/core/prefetch/PostPrefetchManager';

/**
 * VirtualizedPostContainer
 * 
 * Renders a massive scrollable area but only mounts ~3 post components at a time.
 * Uses CSS translate3d for GPU-accelerated positioning.
 * Handles aggressive preloading of off-screen content.
 * Includes pull-to-refresh with rocket animation.
 */
const VirtualizedPostContainer = ({ posts, renderPost, initialIndex = 0, onRefresh, onIndexChange }) => {
    const containerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Pull-to-refresh state
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const touchStartY = useRef(0);
    const isPulling = useRef(false);
    const PULL_THRESHOLD = 80;

    // Handle Scroll & Index Calculation
    // Scroll Performance Optimization
    const scrollTimeoutRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let ticking = false;

        const handleScroll = () => {
            // 1. Index Calculation Update (Throttled via rAF)
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (container) {
                        const scrollTop = container.scrollTop;
                        const height = container.clientHeight; // Use actual container height for precision
                        const index = Math.round(scrollTop / height);

                        if (index !== currentIndex) {
                            setCurrentIndex(index);
                            if (onIndexChange) onIndexChange(index);
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }

            // 2. Interaction Lock (Debounced)
            // Disable pointer events on children while scrolling to prevent heavy hover calcs
            if (!container.classList.contains('is-scrolling-active')) {
                container.classList.add('is-scrolling-active');
            }

            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
                if (container) container.classList.remove('is-scrolling-active');
            }, 150);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });

        // Restore initial scroll position
        if (initialIndex > 0 && container.scrollTop === 0) {
            container.scrollTop = initialIndex * container.clientHeight;
        }

        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, [currentIndex, initialIndex]);



    // Pull-to-refresh touch handlers
    const handleTouchStart = useCallback((e) => {
        const container = containerRef.current;
        if (!container || isRefreshing) return;

        // Only activate when at the very top
        if (container.scrollTop === 0 && currentIndex === 0) {
            touchStartY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    }, [currentIndex, isRefreshing]);

    const handleTouchMove = useCallback((e) => {
        if (!isPulling.current || isRefreshing) return;

        const container = containerRef.current;
        if (!container || container.scrollTop > 0) {
            isPulling.current = false;
            setPullDistance(0);
            return;
        }

        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStartY.current;

        if (diff > 0) {
            // Apply resistance to pull
            const resistance = 0.4;
            const distance = Math.min(diff * resistance, PULL_THRESHOLD * 1.5);
            setPullDistance(distance);
        }
    }, [isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling.current) return;
        isPulling.current = false;

        if (pullDistance >= PULL_THRESHOLD && onRefresh && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(PULL_THRESHOLD); // Hold at threshold during refresh

            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh failed:', error);
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0);
        }
    }, [pullDistance, onRefresh, isRefreshing]);

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
    const totalHeight = `${posts.length * 100}dvh`;

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

    // Calculate rocket animation progress
    const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
    const rocketRotation = isRefreshing ? 0 : -45 + (pullProgress * 45); // -45deg to 0deg
    const rocketScale = 0.5 + (pullProgress * 0.5); // 0.5 to 1

    return (
        <div
            ref={containerRef}
            className="no-scrollbar"
            style={{
                height: '100dvh',
                width: '100vw',
                overflowY: 'scroll',
                scrollSnapType: pullDistance > 0 ? 'none' : 'y mandatory',
                position: 'relative',
                scrollBehavior: 'smooth',
                willChange: 'scroll-position'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            <style>{`
                .is-scrolling-active * {
                    pointer-events: none !important; 
                }
            `}</style>
            {/* Pull-to-Refresh Indicator - Rocket */}
            {(pullDistance > 0 || isRefreshing) && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        height: `${Math.max(pullDistance, isRefreshing ? PULL_THRESHOLD : 0)}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        transition: isRefreshing ? 'none' : 'height 0.1s ease-out'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <div
                            style={{
                                transform: `rotate(${rocketRotation}deg) scale(${rocketScale})`,
                                transition: isRefreshing ? 'none' : 'transform 0.1s ease-out',
                                animation: isRefreshing ? 'rocketLaunch 0.6s ease-in-out infinite' : 'none'
                            }}
                        >
                            <FaRocket size={32} color="#7FFFD4" />
                        </div>
                        {isRefreshing && (
                            <span style={{
                                fontSize: '0.7rem',
                                color: 'rgba(127, 255, 212, 0.8)',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Launching...
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Rocket animation keyframes */}
            <style>{`
                @keyframes rocketLaunch {
                    0%, 100% { 
                        transform: translateY(0) rotate(0deg) scale(1); 
                    }
                    25% { 
                        transform: translateY(-8px) rotate(-5deg) scale(1.1); 
                    }
                    50% { 
                        transform: translateY(-4px) rotate(0deg) scale(1.05); 
                    }
                    75% { 
                        transform: translateY(-6px) rotate(5deg) scale(1.08); 
                    }
                }
            `}</style>

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
                            height: '100dvh',
                            // GPU Acceleration:
                            transform: `translate3d(0, ${index * 100}dvh, 0)`,
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

