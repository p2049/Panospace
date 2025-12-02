import React, { useState, useEffect, useRef, useMemo } from 'react';

const InfiniteGrid = ({
    items = [],
    renderItem,
    itemAspectRatio = '1/1',
    columns = { mobile: 1, tablet: 2, desktop: 3 },
    batchSize = 20,
    gap = '1.5rem',
    className = '',
    onLoadMore = null, // 🚀 OPTIMIZATION: Support server-side pagination
    hasMore = false,
    loading = false
}) => {
    const [visibleCount, setVisibleCount] = useState(batchSize);
    const sentinelRef = useRef(null);

    // Reset visible count when items array changes (new search/filter)
    useEffect(() => {
        if (!onLoadMore) {
            setVisibleCount(batchSize);
        }
    }, [items, batchSize, onLoadMore]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (onLoadMore) {
                    // Server-side pagination
                    if (hasMore && !loading) {
                        onLoadMore();
                    }
                } else if (visibleCount < items.length) {
                    // Client-side pagination
                    setVisibleCount(prev => Math.min(prev + batchSize, items.length));
                }
            }
        }, {
            rootMargin: '400px', // Load more before reaching bottom
            threshold: 0.1
        });

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [visibleCount, items.length, batchSize, onLoadMore, hasMore, loading]);

    const visibleItems = useMemo(() => {
        if (onLoadMore) return items; // Show all items if server-side pagination
        return items.slice(0, visibleCount);
    }, [items, visibleCount, onLoadMore]);

    // Responsive grid columns style
    // We'll use CSS variables for columns to handle responsiveness via media queries in style tag

    return (
        <div className={`infinite-grid-container ${className}`}>
            <div className="infinite-grid">
                {visibleItems.map((item, index) => (
                    <div key={item.id || index} className="grid-item">
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>

            {/* Sentinel for Intersection Observer */}
            <div ref={sentinelRef} style={{ height: '20px', width: '100%' }} />

            {/* Loading Spinner (only show if more items exist) */}
            {(loading || (onLoadMore ? hasMore : visibleCount < items.length)) && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    <div className="loading-spinner" />
                </div>
            )}

            <style>{`
                .infinite-grid {
                    display: grid;
                    gap: ${gap};
                    grid-template-columns: repeat(${columns.mobile || 1}, 1fr);
                }

                @media (min-width: 640px) {
                    .infinite-grid {
                        grid-template-columns: repeat(${columns.tablet || 2}, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .infinite-grid {
                        grid-template-columns: repeat(${columns.desktop || 3}, 1fr);
                    }
                }

                .loading-spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid rgba(127, 255, 212, 0.1);
                    border-top: 3px solid var(--ice-mint);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default React.memo(InfiniteGrid);
