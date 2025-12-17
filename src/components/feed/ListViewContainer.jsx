import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaRocket } from 'react-icons/fa';
import Post from '@/components/Post';

const ListViewContainer = ({ posts, initialIndex = 0, onIndexChange, renderPost, onRefresh }) => {
    const containerRef = useRef(null);
    const itemRefs = useRef({});
    const [scrolledToInitial, setScrolledToInitial] = useState(false);

    // Pull-to-refresh state
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const touchStartY = useRef(0);
    const isPulling = useRef(false);
    const PULL_THRESHOLD = 80;

    // Initial Scroll
    useEffect(() => {
        if (!scrolledToInitial && posts.length > 0 && itemRefs.current[initialIndex]) {
            itemRefs.current[initialIndex].scrollIntoView({ block: 'start' });
            setScrolledToInitial(true);
        }
    }, [initialIndex, posts, scrolledToInitial]);

    const handleScroll = () => {
        if (!containerRef.current) return;

        // Find the visible item
        // We look for the first item whose top is >= 0 relative to container (or close to it)
        const containerTop = containerRef.current.getBoundingClientRect().top;

        let foundIndex = -1;

        // Optimization: Binary search handles huge lists, but simple loop is fine for < 100 items visible
        // Actually, checking every item on scroll is heavy.
        // Let's use simple logic: loop through registered refs.

        const indices = Object.keys(itemRefs.current).map(Number).sort((a, b) => a - b);

        for (const idx of indices) {
            const el = itemRefs.current[idx];
            if (!el) continue;
            const rect = el.getBoundingClientRect();

            // If the element is mostly visible or just passed the top
            // Define active as: The item taking up the top of the viewport
            if (rect.bottom > containerTop + 50) {
                foundIndex = idx;
                break;
            }
        }

        if (foundIndex !== -1 && onIndexChange) {
            onIndexChange(foundIndex);
        }
    };

    // Pull-to-refresh touch handlers
    const handleTouchStart = useCallback((e) => {
        const container = containerRef.current;
        if (!container || isRefreshing) return;

        // Only activate when at the very top
        if (container.scrollTop <= 0) {
            touchStartY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    }, [isRefreshing]);

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
            setPullDistance(PULL_THRESHOLD);

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

    // Calculate rocket animation progress
    const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
    const rocketRotation = isRefreshing ? 0 : -45 + (pullProgress * 45);
    const rocketScale = 0.5 + (pullProgress * 0.5);

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            style={{
                height: '100vh',
                overflowY: 'auto',
                background: '#000',
                paddingTop: '60px', // Space for header/safe area
                paddingBottom: '100px', // Space for bottom nav
                boxSizing: 'border-box'
            }}
        >
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

            <style>
                {`
                    .list-view-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1rem;
                        padding: 1rem;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    @media (min-width: 1024px) {
                        .list-view-grid {
                            grid-template-columns: repeat(2, 1fr);
                            max-width: 1200px;
                        }
                    }
                `}
            </style>
            <div className="list-view-grid">
                {posts.map((post, index) => (
                    <div
                        key={post.id}
                        ref={el => itemRefs.current[index] = el}
                        data-index={index}
                        style={{ width: '100%' }}
                    >
                        {/* We use renderPost if provided, or default to Post with viewMode='list' */}
                        {renderPost ? renderPost(post, index, index === initialIndex) : (
                            <Post post={post} priority="normal" viewMode="list" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(ListViewContainer);

