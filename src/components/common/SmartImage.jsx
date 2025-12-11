import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IMAGE_CONFIG } from '@/core/image/imageConfig';
import { getImageVariants, preloadImage, isImageCached } from '@/core/image/imageLoader';

/**
 * SmartImage Component
 * 
 * A performance-optimized image component that handles:
 * - Context-aware loading (thumbnails vs full res)
 * - Blur-up transitions
 * - Preloading and caching
 * - Layout stability
 */
const SmartImage = ({
    src,
    alt,
    context = 'feedThumbnail',
    className = '',
    onClick,
    style = {},
    fillContainer = false,
    priority: overridePriority // Optional override
}) => {
    const config = IMAGE_CONFIG[context] || IMAGE_CONFIG.feedThumbnail;
    const { lowResSrc, highResSrc } = useMemo(() => getImageVariants(src, context), [src, context]);

    // If we have it allowed in config OR it's eager, check cache immediately
    const isEager = config.priority >= 3 || overridePriority === 'high';
    const isCached = isImageCached(highResSrc);

    // Initial state: 0=loading, 1=low-res loaded, 2=high-res loaded
    // If cached or eager, we might jump to 2, but careful with hydration mismatches.
    const [loadState, setLoadState] = useState(isCached ? 2 : 0);
    const [isVisible, setIsVisible] = useState(isEager); // Eager = always visible logic

    const containerRef = useRef(null);

    // 1. Vision Observer (Lazy Load Trigger)
    useEffect(() => {
        if (isEager) return; // Always load if eager
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '50% 0px 50% 0px' } // Preload when close
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [isEager]);

    // 2. Load Logic
    useEffect(() => {
        if (!isVisible && !isEager) return;

        let valid = true;

        const loadHighRes = async () => {
            // Start high res load
            try {
                await preloadImage(highResSrc);
                if (valid) setLoadState(2);
            } catch (e) {
                // Fallback handled in loader
            }
        };

        if (config.useBlurPreview && !isCached) {
            // In a real blur-up, we'd load lowResSrc first. 
            // Since lowResSrc === highResSrc currently (no resize), we skip to high res.
            // But if we had a tiny thumb, we'd do:
            // setLoadState(1);
            loadHighRes();
        } else {
            loadHighRes();
        }

        return () => { valid = false; };
    }, [isVisible, isEager, highResSrc, config.useBlurPreview, isCached]);

    // 3. Preload Trigger (from Config)
    useEffect(() => {
        if (config.shouldPreload && !isImageCached(highResSrc)) {
            // Low priority preload if configured but not visible yet
            // This is handled by the parent mostly, but we can hint here.
        }
    }, [config.shouldPreload, highResSrc]);

    // Layout styles
    const containerStyle = {
        position: 'relative',
        overflow: 'hidden',
        width: fillContainer ? '100%' : 'auto',
        height: fillContainer ? '100%' : 'auto',
        backgroundColor: '#111', // Placeholder color
        ...style
    };

    const imgCommonStyle = {
        width: '100%',
        height: '100%',
        objectFit: fillContainer ? 'cover' : 'contain',
        transition: 'opacity 0.3s ease-out, filter 0.3s ease-out',
        willChange: 'opacity'
    };

    return (
        <div
            ref={containerRef}
            className={`smart-image-wrapper ${className}`}
            style={containerStyle}
            onClick={onClick}
        >
            {/* Low Res / Blur Layer */}
            {config.useBlurPreview && loadState < 2 && (
                <img
                    src={lowResSrc}
                    alt={alt}
                    style={{
                        ...imgCommonStyle,
                        position: 'absolute',
                        inset: 0,
                        opacity: loadState >= 1 ? 1 : 0,
                        filter: 'blur(20px)',
                        transform: 'scale(1.05)' // Hide blurred edges
                    }}
                />
            )}

            {/* High Res Layer */}
            {(isVisible || isEager) && (
                <img
                    src={highResSrc}
                    alt={alt}
                    loading={isEager ? "eager" : "lazy"}
                    decoding="async"
                    draggable="false"
                    style={{
                        ...imgCommonStyle,
                        opacity: loadState === 2 ? 1 : 0,
                        position: loadState === 2 ? 'relative' : 'absolute',
                        inset: 0
                    }}
                    onLoad={() => setLoadState(2)}
                />
            )}

            {/* Spinner / Pulse if loading and not blurred */}
            {loadState === 0 && !config.useBlurPreview && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#1a1a1a'
                }}>
                    <div className="loading-pulse-ring" />
                </div>
            )}
        </div>
    );
};

export default React.memo(SmartImage);
