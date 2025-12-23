import React, { memo, useState, useRef, useEffect } from 'react';

/**
 * GridImage - Lightweight image component optimized for grid/thumbnail views
 * Uses native lazy loading + minimal intersection observer for mobile performance
 */
const GridImage = memo(({
    src,
    alt = '',
    className = '',
    style = {},
    aspectRatio = '1/1',
    objectFit = 'cover'
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);

    // Use intersection observer with small margin for mobile
    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                // Small rootMargin for mobile - only load when close to viewport
                rootMargin: '50px',
                threshold: 0
            }
        );

        observer.observe(imgRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={imgRef}
            className={`grid-image-container ${className}`}
            style={{
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#111',
                aspectRatio,
                width: '100%',
                ...style
            }}
        >
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit,
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.2s ease-out',
                        position: 'absolute',
                        top: 0,
                        left: 0
                    }}
                />
            )}

            {/* Skeleton while loading */}
            {!isLoaded && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, #1a1a1a 0%, #252525 50%, #1a1a1a 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'gridPulse 1.2s ease-in-out infinite'
                    }}
                />
            )}

            <style>{`
                @keyframes gridPulse {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
});

GridImage.displayName = 'GridImage';

export default GridImage;
