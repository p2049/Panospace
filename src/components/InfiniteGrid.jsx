import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as ReactWindowNamespace from 'react-window';

const ReactWindow = ReactWindowNamespace.default || ReactWindowNamespace;
const Grid = ReactWindow.FixedSizeGrid || ReactWindowNamespace.FixedSizeGrid;

const InfiniteGrid = ({
    items = [],
    renderItem,
    itemAspectRatio = '1/1',
    columns = { mobile: 1, tablet: 2, desktop: 3 },
    batchSize = 20,
    gap = '1.5rem',
    className = '',
    onLoadMore = null,
    hasMore = false,
    loading = false
}) => {
    const [visibleCount, setVisibleCount] = useState(batchSize);
    const [containerWidth, setContainerWidth] = useState(0);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const containerRef = useRef(null);
    const sentinelRef = useRef(null);

    // Calculate responsive column count based on window width
    const columnCount = useMemo(() => {
        if (typeof window === 'undefined') return columns.mobile || 1;
        const width = window.innerWidth;
        if (width >= 1024) return columns.desktop || 3;
        if (width >= 640) return columns.tablet || 2;
        return columns.mobile || 1;
    }, [columns]);

    // Parse gap value (convert rem/px to pixels)
    const gapPixels = useMemo(() => {
        const gapStr = gap.toString();
        if (gapStr.includes('rem')) {
            const remValue = parseFloat(gapStr);
            const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            return remValue * fontSize;
        }
        return parseFloat(gapStr) || 24;
    }, [gap]);

    // Calculate item dimensions
    const columnWidth = useMemo(() => {
        if (!containerWidth) return 0;
        const totalGap = gapPixels * (columnCount - 1);
        return (containerWidth - totalGap) / columnCount;
    }, [containerWidth, columnCount, gapPixels]);

    const rowHeight = useMemo(() => {
        if (!columnWidth) return 0;
        // Parse aspect ratio (e.g., "1/1", "16/9")
        const ratio = itemAspectRatio.toString();
        if (ratio.includes('/')) {
            const [w, h] = ratio.split('/').map(Number);
            return (columnWidth * h) / w;
        }
        return columnWidth; // Default to square
    }, [columnWidth, itemAspectRatio]);

    // Reset visible count when items array changes
    useEffect(() => {
        if (!onLoadMore) {
            setVisibleCount(batchSize);
        }
    }, [items, batchSize, onLoadMore]);

    // Measure container width
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
            setWindowHeight(window.innerHeight);
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (onLoadMore) {
                    if (hasMore && !loading) {
                        onLoadMore();
                    }
                } else if (visibleCount < items.length) {
                    setVisibleCount(prev => Math.min(prev + batchSize, items.length));
                }
            }
        }, {
            rootMargin: '400px',
            threshold: 0.1
        });

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [visibleCount, items.length, batchSize, onLoadMore, hasMore, loading]);

    const visibleItems = useMemo(() => {
        if (onLoadMore) return items;
        return items.slice(0, visibleCount);
    }, [items, visibleCount, onLoadMore]);

    const rowCount = Math.ceil(visibleItems.length / columnCount);

    // Cell renderer for react-window
    const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * columnCount + columnIndex;
        if (index >= visibleItems.length) return null;

        const item = visibleItems[index];

        // Adjust style to include gap
        const adjustedStyle = {
            ...style,
            left: style.left + (columnIndex * gapPixels),
            top: style.top + (rowIndex * gapPixels),
            width: columnWidth,
            height: rowHeight
        };

        return (
            <div key={item.id || index} style={adjustedStyle}>
                {renderItem(item, index)}
            </div>
        );
    }, [visibleItems, columnCount, columnWidth, rowHeight, gapPixels, renderItem]);

    // Calculate total height for virtualized grid
    const gridHeight = useMemo(() => {
        const totalRowHeight = rowCount * rowHeight;
        const totalGapHeight = Math.max(0, rowCount - 1) * gapPixels;
        return totalRowHeight + totalGapHeight;
    }, [rowCount, rowHeight, gapPixels]);

    // Use window height or calculated height, whichever is smaller
    const displayHeight = Math.min(windowHeight - 200, gridHeight);

    if (!containerWidth || !columnWidth || !rowHeight) {
        return (
            <div ref={containerRef} className={`infinite-grid-container ${className}`}>
                <div style={{ height: '400px' }} />
            </div>
        );
    }

    // Fallback to CSS Grid if react-window failed to load
    if (!Grid) {
        return (
            <div ref={containerRef} className={`infinite-grid-container ${className}`}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                    gap: gap,
                    width: '100%'
                }}>
                    {visibleItems.map((item, index) => (
                        <div key={item.id || index}>
                            {renderItem(item, index)}
                        </div>
                    ))}
                </div>
                <div ref={sentinelRef} style={{ height: '20px', width: '100%' }} />
                {(loading || (onLoadMore ? hasMore : visibleCount < items.length)) && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                        <div className="loading-spinner" />
                    </div>
                )}
                <style>{`
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
    }

    return (
        <div ref={containerRef} className={`infinite-grid-container ${className}`}>
            <Grid
                columnCount={columnCount}
                columnWidth={columnWidth + gapPixels}
                height={displayHeight}
                rowCount={rowCount}
                rowHeight={rowHeight + gapPixels}
                width={containerWidth}
                overscanRowCount={2}
                style={{
                    overflowX: 'hidden',
                    overflowY: 'auto'
                }}
            >
                {Cell}
            </Grid>

            {/* Sentinel for Intersection Observer */}
            <div ref={sentinelRef} style={{ height: '20px', width: '100%' }} />

            {/* Loading Spinner */}
            {(loading || (onLoadMore ? hasMore : visibleCount < items.length)) && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    <div className="loading-spinner" />
                </div>
            )}

            <style>{`
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
