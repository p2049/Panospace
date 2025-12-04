import React, { useState, useEffect, useRef, useCallback } from 'react';
import DateStampOverlay from './DateStampOverlay';

// Polyfill for Safari and unsupported browsers
const safeRequestIdleCallback =
    typeof window !== 'undefined' && window.requestIdleCallback ||
    function (cb) {
        return setTimeout(() => cb({ timeRemaining: () => 1 }), 1);
    };

// --- Global Scroll State Management ---
// We track scrolling globally to pause L2 loading during active scrolls
let isScrolling = false;
let scrollTimeout = null;
const listeners = new Set();

const updateScrollState = (scrolling) => {
    isScrolling = scrolling;
    listeners.forEach(listener => listener(scrolling));
};

if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
        if (!isScrolling) updateScrollState(true);

        if (scrollTimeout) clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(() => {
            updateScrollState(false);
        }, 150); // 150ms debounce for scroll end
    }, { passive: true });
}

// --- Priority Queue for L2 Loading ---
// Simple FIFO queue processed only when idle
const loadQueue = [];
let queueProcessorRunning = false;

const processQueue = (deadline) => {
    while (deadline.timeRemaining() > 1 && loadQueue.length > 0 && !isScrolling) {
        const task = loadQueue.shift();
        task();
    }

    if (loadQueue.length > 0) {
        if (!isScrolling) {
            safeRequestIdleCallback(processQueue);
        } else {
            // Check back later if scrolling
            setTimeout(() => {
                safeRequestIdleCallback(processQueue);
            }, 200);
        }
    } else {
        queueProcessorRunning = false;
    }
};

const enqueueL2Load = (callback) => {
    loadQueue.push(callback);
    if (!queueProcessorRunning) {
        queueProcessorRunning = true;
        safeRequestIdleCallback(processQueue);
    }
};

// --- SmartImage Component ---
const SmartImage = ({
    src,
    previewSrc,
    thumbnailSrc,
    alt,
    className,
    style,
    aspectRatio = '1/1', // Default to square for grids
    priority = 'normal',
    objectFit = 'cover', // How image fills container
    showDateStamp = false,
    dateStampStyle = 'panospace',
    date = null,
    keepLoaded = false // NEW: Prevent unloading for film strips
}) => {
    const containerRef = useRef(null);

    // Level 0: Tiny placeholder (always available if passed)
    // Level 1: Preview (medium res)
    // Level 2: Full res
    const [loadLevel, setLoadLevel] = useState(0);
    const [isL2Loaded, setIsL2Loaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false); // Strictly in viewport

    // L0 is always the starting point
    const currentSrc = isL2Loaded ? src : (loadLevel >= 1 && previewSrc ? previewSrc : thumbnailSrc);

    useEffect(() => {
        if (!containerRef.current) return;

        // Observer for "Near Viewport" (Windowed Virtualization & L1 Loading)
        // Root margin 100vh = 1 screen above/below
        const virtualizerObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Entered virtual window -> Load L1
                        setLoadLevel(prev => Math.max(prev, 1));
                    } else {
                        // Left virtual window -> Unload L1/L2 (Memory Management)
                        // Revert to L0 to save memory (unless keepLoaded is true)
                        if (!keepLoaded) {
                            setLoadLevel(0);
                            setIsL2Loaded(false);
                        }
                    }
                });
            },
            { rootMargin: '100% 0px 100% 0px' }
        );

        // Observer for "Strictly Visible" (L2 Priority Queue)
        const visibilityObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    setIsVisible(entry.isIntersecting);
                });
            },
            { rootMargin: '0px', threshold: 0.1 }
        );

        virtualizerObserver.observe(containerRef.current);
        visibilityObserver.observe(containerRef.current);

        return () => {
            virtualizerObserver.disconnect();
            visibilityObserver.disconnect();
        };
    }, []);

    // Handle L2 Loading Logic
    useEffect(() => {
        if (isVisible && loadLevel >= 1 && !isL2Loaded) {
            // If visible and L1 is ready, queue L2 load
            // But only if not currently scrolling (handled by queue processor)

            const loadL2 = () => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    // Only update if still mounted and visible/near
                    if (containerRef.current) {
                        setIsL2Loaded(true);
                        setLoadLevel(2);
                    }
                };
            };

            if (priority === 'high') {
                // Bypass queue for high priority
                loadL2();
            } else {
                enqueueL2Load(loadL2);
            }
        }
    }, [isVisible, loadLevel, isL2Loaded, src, priority]);

    // Dynamic styles for transitions
    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: objectFit,
        transition: 'opacity 0.3s ease-out, filter 0.3s ease-out',
        opacity: loadLevel > 0 ? 1 : 0.5,
        filter: isL2Loaded ? 'blur(0)' : (loadLevel === 1 ? 'blur(4px)' : 'blur(10px)'),
        willChange: 'opacity, filter',
        ...style
    };

    // Container style - only apply aspectRatio if not overridden by parent
    const containerStyle = {
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a', // Dark placeholder background
        width: '100%',
        height: '100%'
    };

    // Only apply aspectRatio if no explicit width/height in style
    if (!style?.width && !style?.height && !style?.position) {
        containerStyle.aspectRatio = aspectRatio;
    }

    return (
        <div
            ref={containerRef}
            className={`smart-image-container ${className || ''}`}
            style={containerStyle}
        >
            {/* Render image only if within virtual window (Level >= 1) or if we have a thumbnail */}
            {(loadLevel > 0 || thumbnailSrc) && (
                <img
                    src={currentSrc || src} // Fallback to src if others missing
                    alt={alt}
                    style={imageStyle}
                    loading="lazy"
                    decoding="async"
                    onLoad={(e) => {
                        // Ensure blur clears on load (especially important for iPhone)
                        if (e.target.src === src) {
                            setIsL2Loaded(true);
                            setLoadLevel(2);
                        }
                    }}
                />
            )}

            {/* Fallback/Loading State if no image data yet */}
            {loadLevel === 0 && !thumbnailSrc && (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#333'
                }}>
                    <div className="loading-pulse" style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #1a1a1a 0%, #222 50%, #1a1a1a 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'pulse 1.5s infinite'
                    }} />
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
            {/* Date Stamp Overlay */}
            {showDateStamp && isVisible && (
                <DateStampOverlay date={date} styleName={dateStampStyle} />
            )}
        </div>
    );
};

export default React.memo(SmartImage);
