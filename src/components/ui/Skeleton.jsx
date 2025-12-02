import React from 'react';

/**
 * Base Skeleton Component
 * Renders a shimmering placeholder
 */
export const Skeleton = ({
    width,
    height,
    borderRadius = '4px',
    style = {},
    className = ''
}) => {
    return (
        <div
            className={className}
            style={{
                width: width,
                height: height,
                borderRadius: borderRadius,
                background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                ...style
            }}
        >
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

/**
 * Skeleton for text lines
 */
export const SkeletonText = ({ lines = 1, height = '1rem', gap = '0.5rem', width = '100%' }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap }}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={i === lines - 1 && lines > 1 ? '70%' : width}
                    height={height}
                />
            ))}
        </div>
    );
};

/**
 * Skeleton for a standard card (Image + Title + Subtitle)
 */
export const SkeletonCard = ({ aspectRatio = '1/1' }) => {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <Skeleton width="100%" style={{ aspectRatio }} borderRadius="0" />
            <div style={{ padding: '1rem' }}>
                <SkeletonText lines={2} />
            </div>
        </div>
    );
};

/**
 * Skeleton for a grid of cards
 */
export const SkeletonGrid = ({ count = 8, aspectRatio = '1/1', columns = 'repeat(auto-fill, minmax(200px, 1fr))' }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: columns,
            gap: '1.5rem'
        }}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} aspectRatio={aspectRatio} />
            ))}
        </div>
    );
};

/**
 * Full Page Skeleton
 * Header + Content Grid
 */
export const PageSkeleton = ({ title = true }) => {
    return (
        <div className="ps-page">
            {/* Header Skeleton */}
            <div className="ps-sticky-header-padded" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Skeleton width="32px" height="32px" borderRadius="50%" />
                {title && <Skeleton width="200px" height="32px" />}
            </div>

            {/* Content Skeleton */}
            <div className="ps-container-1200">
                <div style={{ marginBottom: '2rem' }}>
                    <SkeletonText lines={1} width="40%" height="2rem" />
                    <div style={{ marginTop: '1rem' }}>
                        <SkeletonText lines={2} width="60%" />
                    </div>
                </div>

                <SkeletonGrid count={8} />
            </div>
        </div>
    );
};

export default Skeleton;
