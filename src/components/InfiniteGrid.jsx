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
    onLoadMore = () => { },
    hasMore = false,
    loading = false,
    itemData: externalItemData = null
}) => {
    const [columnCount, setColumnCount] = useState(() => {
        if (typeof columns === 'number') return columns;
        return (columns && columns.desktop) || 3;
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
    }, [columns]);

    const rowCount = Math.ceil(items.length / (columnCount || 1));
    const effectiveColumnCount = columnCount || 1;

    // Total gap width is (columns - 1) * 24px
    const totalGapWidth = (effectiveColumnCount - 1) * 24;
    const itemWidth = containerWidth ? (containerWidth - totalGapWidth) / effectiveColumnCount : 0;

    // Parse aspect ratio
    const [ratioW, ratioH] = (itemAspectRatio || '1/1').split('/').map(Number);
    const itemHeight = itemWidth * (ratioH / ratioW);

    // Cell renderer for react-window
    const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * effectiveColumnCount + columnIndex;
        if (index >= items.length) return null;

        const item = items[index];

        const adjustedStyle = {
            ...style,
            paddingRight: columnIndex === effectiveColumnCount - 1 ? 0 : 24,
            paddingBottom: rowIndex === rowCount - 1 ? 0 : 24,
            boxSizing: 'border-box'
        };

        return (
            <div style={adjustedStyle}>
                {renderItem ? renderItem(item, index) : null}
            </div>
        );
    }, [items, effectiveColumnCount, renderItem, rowCount]);

    const gridData = useMemo(() => ({
        items,
        columnCount: effectiveColumnCount,
        renderItem,
        externalData: externalItemData
    }), [items, effectiveColumnCount, renderItem, externalItemData]);

    if (!containerWidth) return <div ref={containerRef} className="w-full h-full" />;

    return (
        <div ref={containerRef} className={`w-full ${className}`} style={{ minHeight: '400px' }}>
            <Grid
                columnCount={effectiveColumnCount}
                columnWidth={itemWidth + 24}
                height={window.innerHeight} // Use virtualized height or fixed
                rowCount={rowCount}
                rowHeight={itemHeight + 24}
                width={containerWidth}
                style={{}}
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
