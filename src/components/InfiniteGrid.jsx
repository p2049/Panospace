import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Grid } from 'react-window';

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
    const [columnCount, setColumnCount] = useState(() => {
        if (typeof columns === 'number') return columns;
        return columns.desktop || 3;
    });
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Calculate columns based on width
    useEffect(() => {
        if (typeof columns === 'number') {
            setColumnCount(columns);
            return;
        }

        const updateWidth = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                setContainerWidth(width);
                if (width < 640) setColumnCount(columns.mobile || 1);
                else if (width < 1024) setColumnCount(columns.tablet || 2);
                else setColumnCount(columns.desktop || 3);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [columns.mobile, columns.tablet, columns.desktop]);

    const rowCount = Math.ceil(items.length / columnCount);
    const itemWidth = containerWidth ? (containerWidth - (columnCount - 1) * 24) / columnCount : 0;

    // Parse aspect ratio
    const [ratioW, ratioH] = itemAspectRatio.split('/').map(Number);
    const itemHeight = itemWidth * (ratioH / ratioW);

    // Cell renderer for react-window
    const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * columnCount + columnIndex;
        if (index >= items.length) return null;

        const item = items[index];

        // Add gap to style
        const adjustedStyle = {
            ...style,
            left: Number(style.left) + columnIndex * 0, // Injected by Grid
            top: Number(style.top) + rowIndex * 0,
            padding: `0 ${columnIndex === columnCount - 1 ? 0 : 24}px ${24}px 0`,
            boxSizing: 'border-box'
        };

        return (
            <div style={adjustedStyle}>
                {renderItem(item, index)}
            </div>
        );
    }, [items, columnCount, renderItem]);

    if (!containerWidth) return <div ref={containerRef} className="w-full h-full" />;

    return (
        <div ref={containerRef} className={`w-full ${className}`}>
            <Grid
                columnCount={columnCount}
                columnWidth={itemWidth + (columnCount > 1 ? 24 / (columnCount - 1) : 0)} // Approximation
                height={window.innerHeight} // Use virtualized height or fixed
                rowCount={rowCount}
                rowHeight={itemHeight + 24}
                width={containerWidth}
                onScroll={({ verticalScrollDirection, scrollOffset, scrollUpdateWasRequested }) => {
                    if (!scrollUpdateWasRequested &&
                        verticalScrollDirection === 'backward' &&
                        hasMore && !loading) {
                        // Check if near bottom
                        const totalHeight = rowCount * (itemHeight + 24);
                        if (scrollOffset + window.innerHeight > totalHeight - 500) {
                            onLoadMore?.();
                        }
                    }
                }}
            >
                {Cell}
            </Grid>
        </div>
    );
};

export default InfiniteGrid;
