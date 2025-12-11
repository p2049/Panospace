import React, { useMemo } from 'react';
import '@/styles/film-strip-post.css';
import DateStampOverlay from './DateStampOverlay';
import SmartImage from './SmartImage';

// Static sprockets renderer to avoid re-creation
const Sprockets = React.memo(() => (
    <div className="cyber-sprockets">
        {/* 8 holes per frame is standard for 35mm */}
        {[...Array(8)].map((_, i) => (
            <span key={i}></span>
        ))}
    </div>
));

const FilmFrameUnit = React.memo(({ item, index, priority, getStockName, getFrameNumber, getEdgeCode, uiOverlays, postId }) => {
    const [renderedSrc, setRenderedSrc] = React.useState(null);
    const itemUrl = item.url || item;
    const isUrl = typeof itemUrl === 'string' && (itemUrl.startsWith('http') || itemUrl.startsWith('blob:'));

    // Cache Key
    const cacheKey = `${postId}_slide_${index}`;

    React.useEffect(() => {
        // 1. Check Cache
        import('@/core/film/FilmSlideCache').then(({ FilmSlideCache }) => {
            const cached = FilmSlideCache.get(cacheKey);
            if (cached) {
                setRenderedSrc(cached);
                return;
            }

            // 2. Render if not cached & visible/near
            // We only render text/borders for images. Text fallbacks use HTML.
            if (isUrl && Math.abs(priority) <= 1 && !postId.toString().includes('preview')) { // Only render near items to save CPU, skip for preview
                import('@/core/film/FilmSlideRenderer').then(({ FilmSlideRenderer }) => {
                    FilmSlideRenderer.renderSlide({
                        postId,
                        slideIndex: index,
                        images: [itemUrl],
                        frameNumber: getFrameNumber(index),
                        edgeCode: getEdgeCode(index)
                    }).then(url => {
                        FilmSlideCache.set(cacheKey, url);
                        setRenderedSrc(url);
                    });
                });
            }
        });
    }, [cacheKey, isUrl, priority, itemUrl, getFrameNumber, getEdgeCode, postId, index]);

    // If we have a consolidated render, show that ONLY.
    if (renderedSrc) {
        return (
            <div className="cyber-frame-unit" style={{ background: '#000' }}>
                <SmartImage
                    src={renderedSrc}
                    alt={`Film Frame ${index + 1}`}
                    context="filmSlide"
                    priority={Math.abs(priority) <= 2 ? 'high' : 'normal'}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    fillContainer
                />
            </div>
        );
    }

    // Fallback: Dynamic HTML rendering (Original)
    return (
        <div className="cyber-frame-unit">
            {/* Top Film Edge */}
            <div className="cyber-track top">
                <span className="cyber-micro-text">{getStockName()}</span>
                <span className="cyber-frame-number">{getFrameNumber(index)}</span>
                <Sprockets />
            </div>

            {/* Main Content Area */}
            <div className="cyber-content-row">
                <div className="cyber-marker left">
                    <span className="vertical-text">{getFrameNumber(index)}</span>
                </div>

                <div className="cyber-image-container">
                    {isUrl ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <SmartImage
                                src={itemUrl}
                                alt={`Frame ${index + 1}`}
                                context="feedThumbnail"
                                className="cyber-image"
                                priority={Math.abs(priority) <= 2 ? 'high' : 'normal'}
                                objectFit="cover"
                                fillContainer={true}
                                style={{ width: '100%', height: '100%' }}
                            />
                            {uiOverlays?.quartzDate && (
                                <DateStampOverlay quartzDate={uiOverlays.quartzDate} />
                            )}
                        </div>
                    ) : (
                        <div className="cyber-text-fallback">
                            {item.content || item.text || (typeof item === 'string' ? item : 'VOID')}
                        </div>
                    )}
                </div>

                <div className="cyber-marker right">
                    <span className="vertical-text" style={{ opacity: 0 }}>END</span>
                </div>
            </div>

            {/* Bottom Film Edge */}
            <div className="cyber-track bottom">
                <span className="cyber-edge-code">{getEdgeCode(index)}</span>
                <Sprockets />
                {/* SVG Icon simplified/removed in fallback or kept as original */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'absolute', bottom: '8px', right: '16px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <use href="#filmPlanetIcon" />
                    </svg>
                    <span className="cyber-micro-text" style={{ position: 'static' }}>2025</span>
                </div>
            </div>
        </div>
    );
});

/**
 * FilmStripPost - Authentic 35mm Film Edition
 * Realistic film structure with authentic markings and subtle grain.
 */
const FilmStripPost = ({ images = [], uiOverlays = null, priority = 'normal', postId = 'preview' }) => {
    // Generate authentic frame numbers (like real film: 22A, 23, 24A, etc.)
    const getFrameNumber = (index) => {
        const frameNum = index + 1;
        return frameNum % 2 === 0 ? `${frameNum}` : `${frameNum}A`;
    };

    // Generate edge codes (authentic film marking system)
    const getEdgeCode = (index) => {
        return `K${(index + 100).toString()}`;
    };

    // Stock name - simple and clean
    const getStockName = () => 'PANOSPACE';

    // PRELOAD LOGIC: Film Strip is a continuous scroll, so we preload eagerly
    // Moved here from previous step 
    React.useEffect(() => {
        if (!images || images.length === 0) return;

        // 1. Immediate: Preload visible items
        const initialLoad = images.slice(0, 3);
        import('@/core/image/preloadFilmSlide').then(({ preloadFilmSlide }) => {
            preloadFilmSlide(initialLoad);
        });

    }, [images]);

    return (
        <div className="cyber-film-strip-wrapper">
            {/* Global Defs for Icons */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <radialGradient id="filmPlanetGrad" cx="40%" cy="40%">
                        <stop offset="0%" style={{ stopColor: '#7FFFD4', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#00CED1', stopOpacity: 1 }} />
                    </radialGradient>
                    <symbol id="filmPlanetIcon" viewBox="0 0 24 24">
                        <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />
                        <circle cx="12" cy="12" r="7" fill="url(#filmPlanetGrad)" opacity="0.95" />
                        <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)" strokeDasharray="0,8,20,100" />
                    </symbol>
                </defs>
            </svg>

            <div className="cyber-film-strip-scroll-container">
                {/* Film Leader (Start) */}
                <div className="cyber-leader">
                </div>

                {images.map((item, index) => (
                    <FilmFrameUnit
                        key={index}
                        item={item}
                        index={index}
                        priority={index} // Pass index as simple priority proxy
                        getStockName={getStockName}
                        getFrameNumber={getFrameNumber}
                        getEdgeCode={getEdgeCode}
                        uiOverlays={uiOverlays}
                        postId={postId}
                    />
                ))}

                {/* Film Trailer (End) */}
                <div className="cyber-leader trailer">
                </div>
            </div>
        </div>
    );
};

export default React.memo(FilmStripPost);
