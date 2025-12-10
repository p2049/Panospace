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

import { isImageLoaded, markImageLoaded } from '@/core/utils/imageCache';

// --- SmartImage Component ---
const SmartImage = ({
    src,
    previewSrc,
    thumbnailSrc,
    alt,
    className,
    style,
    aspectRatio = '1/1',
    priority = 'normal',
    eager = false, // NEW: Force eager loading (bypass observers)
    objectFit = 'cover',
    showDateStamp = false,
    dateStampStyle = 'panospace',
    date = null,
    keepLoaded = false
}) => {
    const containerRef = useRef(null);

    // Initial state: If cached or eager, start at Level 2 (Full Res) logic immediately
    const initialState = (eager || isImageLoaded(src)) ? 2 : 0;
    const initialL2 = (eager || isImageLoaded(src));

    const [loadLevel, setLoadLevel] = useState(initialState);
    const [isL2Loaded, setIsL2Loaded] = useState(initialL2);
    const [isVisible, setIsVisible] = useState(eager); // Eager = always visible effectively

    const currentSrc = isL2Loaded ? src : (loadLevel >= 1 && previewSrc ? previewSrc : thumbnailSrc);

    // Observers
    useEffect(() => {
        if (!containerRef.current || eager) return; // Skip observers if eager

        const virtualizerObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setLoadLevel(prev => Math.max(prev, 1));
                    } else if (!keepLoaded && !isImageLoaded(src)) {
                        // Only unload if NOT cached and NOT keepLoaded
                        setLoadLevel(0);
                        setIsL2Loaded(false);
                    }
                });
            },
            { rootMargin: '100% 0px 100% 0px' }
        );

        const visibilityObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setIsVisible(true);
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
    }, [eager, keepLoaded, src]);

    // Handle L2 Loading
    useEffect(() => {
        if (isL2Loaded) {
            markImageLoaded(src); // Ensure cache is marked
            return;
        }

        // Trigger load if: Eager OR (Visible AND Level >= 1)
        const shouldLoad = eager || (isVisible && loadLevel >= 1);

        if (shouldLoad) {
            const loadL2 = () => {
                const img = new Image();
                img.src = src;
                img.decode().then(() => {
                    if (containerRef.current) {
                        setIsL2Loaded(true);
                        setLoadLevel(2);
                        markImageLoaded(src);
                    }
                }).catch(() => {
                    // Fallback to normal load
                    img.onload = () => {
                        if (containerRef.current) {
                            setIsL2Loaded(true);
                            setLoadLevel(2);
                            markImageLoaded(src);
                        }
                    };
                });
            };

            if (priority === 'high' || eager) {
                loadL2();
            } else {
                enqueueL2Load(loadL2);
            }
        }
    }, [isVisible, loadLevel, isL2Loaded, src, priority, eager]);

    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: objectFit,
        transition: 'opacity 0.3s ease-out, filter 0.3s ease-out',
        opacity: loadLevel > 0 ? 1 : 0.5,
        // If cached/eager, no blur. Else blur.
        filter: isL2Loaded ? 'blur(0)' : (loadLevel === 1 ? 'blur(4px)' : 'blur(10px)'),
        willChange: 'opacity, filter',
        ...style
    };

    const containerStyle = {
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        width: '100%',
        height: aspectRatio === 'auto' ? 'auto' : '100%'
    };

    if (!style?.width && !style?.height && !style?.position) {
        containerStyle.aspectRatio = aspectRatio;
    }

    return (
        <div
            ref={containerRef}
            className={`smart-image-container ${className || ''}`}
            style={containerStyle}
        >
            {(loadLevel > 0 || thumbnailSrc || eager) && (
                <img
                    src={currentSrc || src}
                    alt={alt}
                    style={imageStyle}
                    loading={eager ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={(e) => {
                        if (e.target.src === src) {
                            setIsL2Loaded(true);
                            setLoadLevel(2);
                            markImageLoaded(src);
                        }
                    }}
                />
            )}

            {/* Loading Indicator only if strictly NOT loaded and lazy */}
            {loadLevel === 0 && !thumbnailSrc && !eager && (
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

            {showDateStamp && (isVisible || eager) && (
                <DateStampOverlay date={date} styleName={dateStampStyle} />
            )}
        </div>
    );
};

export default React.memo(SmartImage);
