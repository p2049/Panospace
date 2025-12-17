import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/context/ToastContext';

/**
 * ZoomableImageWrapper
 * 
 * Handles native-feeling zoom interactions for both Desktop and Mobile.
 * 
 * Mobile: Pinch-to-zoom, Pan
 * Desktop: Click-to-activate, Scroll-to-zoom, Drag-to-pan
 */
const ZoomableImageWrapper = ({ children, onZoomChange, className, style }) => {
    const { showToast } = useToast();

    // State
    const [isActive, setIsActive] = useState(false); // Desktop only
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    // Refs for gesture calculations
    const containerRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const lastPositionRef = useRef({ x: 0, y: 0 });
    const initialPinchDistanceRef = useRef(null);
    const initialScaleRef = useRef(1);
    const isPinchingRef = useRef(false);

    // Constants
    const MIN_SCALE = 1;
    const MAX_SCALE = 5;
    const ZOOM_SPEED = 0.001; // For wheel

    // Feedback
    const hasShownFeedbackRef = useRef(false);

    // Notify parent of zoom state (to disable external swipes/scrolls)
    useEffect(() => {
        if (onZoomChange) {
            onZoomChange(scale > 1 || isActive);
        }
    }, [scale, isActive, onZoomChange]);

    // Reset on unmount or content change
    useEffect(() => {
        return () => {
            if (onZoomChange) onZoomChange(false);
        };
    }, []);

    // Hover state for keyboard activation
    const isHoveringRef = useRef(false);

    // --- DESKTOP HANDLERS ---

    const handleDesktopClick = (e) => {
        // Click no longer activates zoom (User request: 'z' key only)
        // We still consume click if we were dragging or active to prevent navigation
        if (isActive) {
            e.stopPropagation();
        }
    };

    const handleMouseEnter = () => {
        isHoveringRef.current = true;
    };

    const handleMouseLeave = () => {
        isHoveringRef.current = false;
        handleMouseUp();
    };

    // Keyboard Listener for 'Z' activation
    useEffect(() => {
        const handleKeyDownToggle = (e) => {
            // Ignore if typing in input
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) {
                return;
            }

            if (e.key.toLowerCase() === 'z') {
                if (isHoveringRef.current) {
                    setIsActive(prev => {
                        const nextState = !prev;
                        if (nextState) {
                            if (!hasShownFeedbackRef.current) {
                                showToast("Scroll to zoom • Drag to pan • 'Z' to exit");
                                hasShownFeedbackRef.current = true;
                            }
                        } else {
                            // Reset on deactivate
                            setScale(1);
                            setPosition({ x: 0, y: 0 });
                        }
                        return nextState;
                    });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDownToggle);
        return () => window.removeEventListener('keydown', handleKeyDownToggle);
    }, []);

    const handleWheel = useCallback((e) => {
        if (!isActive) return;

        e.preventDefault();
        e.stopPropagation();

        const delta = -e.deltaY * ZOOM_SPEED;
        const newScale = Math.min(Math.max(MIN_SCALE, scale + delta * 500), MAX_SCALE); // 500 factor for sensitivity

        setScale(newScale);

        // If zoomed out completely, reset position and deactivate
        if (newScale === MIN_SCALE) {
            setPosition({ x: 0, y: 0 });
            setIsActive(false);
        }
    }, [isActive, scale]);

    const handleMouseDown = (e) => {
        if (!isActive || scale <= 1) return;

        e.preventDefault(); // Prevent text selection
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        lastPositionRef.current = { ...position };
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        e.preventDefault();

        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        // Calculate boundaries to keep image within view
        // (Simplified: allow free pan for now, or clamping?)
        // Let's allow free pan but clamped slightly? 
        // Better: Clamping based on zoomed dimensions is robust but complex. 
        // For now, simple pan is sufficient for "native feel" if not overly restrictive.

        setPosition({
            x: lastPositionRef.current.x + deltaX,
            y: lastPositionRef.current.y + deltaY
        });
    }, [isDragging]);

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Global listeners for Desktop Exit (Esc, Click Outside)
    useEffect(() => {
        if (!isActive) return;

        const handleGlobalClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                // Click outside
                setIsActive(false);
                setScale(1);
                setPosition({ x: 0, y: 0 });
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsActive(false);
                setScale(1);
                setPosition({ x: 0, y: 0 });
            }
        };

        document.addEventListener('mousedown', handleGlobalClick);
        document.addEventListener('keydown', handleKeyDown);

        // Add non-passive wheel listener to prevent page scroll
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
            document.removeEventListener('keydown', handleKeyDown);
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [isActive, handleWheel]);


    // --- MOBILE HANDLERS ---

    const getDistance = (touches) => {
        return Math.hypot(
            touches[0].clientX - touches[1].clientX,
            touches[0].clientY - touches[1].clientY
        );
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            // Start Pinch
            e.stopPropagation(); // Stop feed swipe
            isPinchingRef.current = true;
            initialPinchDistanceRef.current = getDistance(e.touches);
            initialScaleRef.current = scale;
        } else if (e.touches.length === 1 && scale > 1) {
            // Start Pan
            e.stopPropagation();
            setIsDragging(true);
            dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            lastPositionRef.current = { ...position };
        }
    };

    const handleTouchMove = (e) => {
        if (isPinchingRef.current && e.touches.length === 2) {
            e.preventDefault();
            e.stopPropagation();

            const currentDistance = getDistance(e.touches);
            if (initialPinchDistanceRef.current > 0) {
                const ratio = currentDistance / initialPinchDistanceRef.current;
                const newScale = Math.min(Math.max(MIN_SCALE, initialScaleRef.current * ratio), MAX_SCALE);
                setScale(newScale);
            }
        } else if (isDragging && e.touches.length === 1 && scale > 1) {
            e.preventDefault(); // Stop Scroll
            e.stopPropagation(); // Stop Swipe

            const deltaX = e.touches[0].clientX - dragStartRef.current.x;
            const deltaY = e.touches[0].clientY - dragStartRef.current.y;

            setPosition({
                x: lastPositionRef.current.x + deltaX,
                y: lastPositionRef.current.y + deltaY
            });
        }
    };

    const handleTouchEnd = (e) => {
        // If pinch ended
        if (e.touches.length < 2) {
            isPinchingRef.current = false;
        }
        // If pan ended
        if (e.touches.length === 0) {
            setIsDragging(false);

            // Snap back if scale < 1 (bounce back)
            if (scale < 1) {
                setScale(1);
                setPosition({ x: 0, y: 0 });
            }
        }
    };

    // Effect for Mobile event listeners (passive: false for touchmove to prevent scroll)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Determine if we should treat this as a zoom interaction target
        const onTouchStartInternal = (e) => handleTouchStart(e);
        const onTouchMoveInternal = (e) => handleTouchMove(e);
        const onTouchEndInternal = (e) => handleTouchEnd(e);

        // We attach these directly to manage passivity
        container.addEventListener('touchstart', onTouchStartInternal, { passive: false });
        container.addEventListener('touchmove', onTouchMoveInternal, { passive: false });
        container.addEventListener('touchend', onTouchEndInternal, { passive: false });
        // Also cancel
        container.addEventListener('touchcancel', onTouchEndInternal, { passive: false });

        return () => {
            container.removeEventListener('touchstart', onTouchStartInternal);
            container.removeEventListener('touchmove', onTouchMoveInternal);
            container.removeEventListener('touchend', onTouchEndInternal);
            container.removeEventListener('touchcancel', onTouchEndInternal);
        };
    }, [scale, isDragging]); // Re-bind when state critical to flow changes (or use refs inside)


    return (
        <div
            ref={containerRef}
            className={`zoom-wrapper ${className || ''}`}
            onClick={handleDesktopClick}
            onMouseEnter={handleMouseEnter}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
                touchAction: isActive || scale > 1 ? 'none' : 'pan-x pan-y', // Allow scroll when not zoomed, block browser pinch
                cursor: isActive ? (isDragging ? 'grabbing' : 'zoom-out') : 'auto',
                overflow: 'hidden',
                width: '100%',
                height: '100%',
                ...style
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                    transformOrigin: 'center',
                    transition: isDragging || isPinchingRef.current ? 'none' : 'transform 0.2s ease-out',
                    willChange: 'transform',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default ZoomableImageWrapper;
