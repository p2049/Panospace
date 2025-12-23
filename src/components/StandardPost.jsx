import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaCamera } from 'react-icons/fa';
import LikeButton from './LikeButton';
import PostDetailsSidebar from './PostDetailsSidebar';
import SpaceCardBadge from './SpaceCardBadge';
import PlanetUserIcon from './PlanetUserIcon';
import SmartImage from './SmartImage';
import DateStampOverlay from './DateStampOverlay';
import { renderCosmicUsername } from '@/utils/usernameRenderer';
import { getQuartzDateStyle } from '@/core/utils/quartzDateUtils';
import { formatExifForDisplay } from '@/core/utils/exif';
import ZoomableImageWrapper from './ZoomableImageWrapper';
import '@/styles/Post.css';

// Wrappers and Helper Components

// Wrapper to handle dynamic resizing relative to container
// Uses the window size (since Post is 100vh/100vw) or containerRef if strictly passed
const QuartzDateWrapper = ({ quartzDate, imageWidth, imageHeight, containerRef }) => {
    // We use window size because Post is full viewport
    // But sticking to containerRef is safer if layout changes
    const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });

    useEffect(() => {
        const handleResize = () => {
            if (containerRef?.current) {
                setDimensions({
                    w: containerRef.current.clientWidth,
                    h: containerRef.current.clientHeight
                });
            } else {
                setDimensions({ w: window.innerWidth, h: window.innerHeight });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial

        return () => window.removeEventListener('resize', handleResize);
    }, [containerRef]);

    const style = useMemo(() => {
        return getQuartzDateStyle(dimensions.w, dimensions.h, imageWidth || dimensions.w, imageHeight || dimensions.h);
    }, [dimensions.w, dimensions.h, imageWidth, imageHeight]);

    return <DateStampOverlay quartzDate={quartzDate} style={style} />;
};

const StandardPost = ({
    post,
    items = [],
    priority = 'normal',
    authorPhoto,
    authorDefaultIconId,
    authorProfileTheme,
    handleAuthorClick,
    containerRef,
    currentSlide,
    setCurrentSlide,
    showNSFWContent,
    setShowNSFWContent,
    hasNSFWContent,
    showDetailsSidebar,
    setShowDetailsSidebar,
    isNested = false
}) => {
    const touchStartRef = useRef({ x: null, y: null, time: null });
    const touchEndRef = useRef({ x: null, y: null });
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Touch handlers with drag-to-follow and velocity tracking
    const onTouchStart = useCallback((e) => {
        touchStartRef.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY,
            time: Date.now()
        };
        touchEndRef.current = { x: null, y: null };
        setIsDragging(true);
    }, []);

    const onTouchMove = useCallback((e) => {
        if (!isDragging) return;

        const currentX = e.targetTouches[0].clientX;
        const currentY = e.targetTouches[0].clientY;

        touchEndRef.current = { x: currentX, y: currentY };

        const start = touchStartRef.current;
        if (!start.x) return;

        const deltaX = currentX - start.x;
        const deltaY = currentY - start.y;

        // Only track horizontal drag if it's more horizontal than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Full-width swipe like Instagram/TikTok
            let constrainedDrag = deltaX;

            // Apply resistance only when at boundaries (first/last slide)
            if ((currentSlide === 0 && deltaX > 0) ||
                (currentSlide === items.length - 1 && deltaX < 0)) {
                // At boundary - apply heavy resistance (rubber band effect)
                constrainedDrag = deltaX * 0.15;
            }

            setDragOffset(constrainedDrag);
        }
    }, [isDragging, currentSlide, items.length]);

    const onTouchEnd = useCallback(() => {
        const start = touchStartRef.current;
        const end = touchEndRef.current;

        setIsDragging(false);
        setDragOffset(0);

        if (!start.x || !end.x) return;

        const distanceX = start.x - end.x;
        const distanceY = start.y - end.y;
        const elapsed = Date.now() - (start.time || Date.now());

        // Calculate velocity (pixels per ms)
        const velocityX = Math.abs(distanceX) / Math.max(elapsed, 1);

        // Velocity-based threshold: quick flicks need less distance
        const isQuickFlick = velocityX > 0.5; // Fast swipe
        const minSwipeDistance = isQuickFlick ? 30 : 50;

        // Check if it's more horizontal than vertical
        const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

        if (isHorizontal) {
            const isLeftSwipe = distanceX > minSwipeDistance;
            const isRightSwipe = distanceX < -minSwipeDistance;

            if (isLeftSwipe && currentSlide < items.length - 1) {
                setCurrentSlide(prev => prev + 1);
            }
            if (isRightSwipe && currentSlide > 0) {
                setCurrentSlide(prev => prev - 1);
            }
        }
    }, [currentSlide, items.length, setCurrentSlide]);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % items.length);
    }, [items.length, setCurrentSlide]);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length, setCurrentSlide]);

    // Helper to render content for both Single and Slideshow views
    const renderSlideContent = (item, index) => {
        if (!item) return null;

        const url = item.url || item;
        const isUrl = typeof url === 'string' && (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:'));

        // --- STANDARD IMAGE RENDERING ---
        if (isUrl) {
            // Eager load current, next, and previous slides (handling wrapping)
            const len = items.length;
            const isNearby =
                index === currentSlide ||
                index === (currentSlide + 1) % len ||
                index === (currentSlide - 1 + len) % len;

            const imageContent = (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <ZoomableImageWrapper>
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <SmartImage
                                src={url}
                                thumbnailSrc={item.thumbnailUrl || item.thumbUrl || item.previewUrl}
                                alt={`Slide ${index + 1} `}
                                priority={index === 0 ? priority : 'low'}
                                eager={isNearby}
                                objectFit="contain" // Standard fit
                                style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                            />
                            {post.uiOverlays?.quartzDate && (
                                /* Use dynamic sizing to stick to image even in contain mode */
                                <QuartzDateWrapper
                                    quartzDate={post.uiOverlays.quartzDate}
                                    imageWidth={item.width}
                                    imageHeight={item.height}
                                    containerRef={containerRef}
                                />
                            )}
                        </div>
                    </ZoomableImageWrapper>
                </div>
            );

            return imageContent;
        }

        // --- TEXT/FALLBACK RENDERING ---
        return (
            <div style={{ color: '#fff', fontSize: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                {item.content || item.text || (typeof item === 'string' ? item : JSON.stringify(item))}
            </div>
        );
    };

    return (
        <div
            className={`post-ui--standard ${isNested ? 'is-nested' : ''}`}
            style={{
                height: isNested ? 'auto' : '100dvh',
                width: isNested ? '100%' : '100vw',
                minHeight: isNested ? '300px' : 'none',
                scrollSnapAlign: isNested ? 'none' : 'start',
                position: 'relative',
                overflow: isNested ? 'visible' : 'hidden',
                backgroundColor: isNested ? 'transparent' : '#000',
                willChange: isNested ? 'auto' : 'transform',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
            }}
            data-testid="post-item"
        >
            {items.length === 0 ? (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontSize: '1.2rem'
                }}>
                    No content available
                </div>
            ) : items.length === 1 ? (
                /* SINGLE IMAGE VIEW */
                (() => {
                    const item = items[0];
                    const aspectRatio = item.aspectRatio || (item.width && item.height ? item.width / item.height : null);
                    const isCinematic = post.atmosphereBackground === 'cinematic-gradient';

                    return (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isNested ? 'transparent' : '#000',
                            position: 'relative',
                            aspectRatio: isNested ? (aspectRatio || '1/1') : 'auto'
                        }}>
                            {/* Cinematic Gradient Layer */}
                            {isCinematic && (
                                <div style={{
                                    position: 'absolute',
                                    zIndex: 0,
                                    ...(aspectRatio ? {
                                        aspectRatio: `${aspectRatio}`,
                                        width: '100%',
                                        height: '100%',
                                        maxHeight: '100%',
                                        maxWidth: '100%'
                                    } : {
                                        inset: 0
                                    }),
                                    background: `radial-gradient(circle at center, ${post.gradientColor || '#1a4f3d'} 0%, #000000 90%)`
                                }} />
                            )}

                            {/* Render Image Content */}
                            <div style={{ zIndex: 1, width: '100%', height: '100%', flex: 1 }}>
                                {renderSlideContent(items[0], 0)}
                            </div>
                        </div>
                    );
                })()
            ) : (
                /* MULTI-IMAGE CAROUSEL */
                <div
                    style={{
                        width: '100%',
                        height: isNested ? 'auto' : '100%',
                        aspectRatio: isNested ? (items[0]?.aspectRatio || '1/1') : 'none',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Slides Container */}
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            height: '100%',
                            transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
                            // Smooth, cinematic transition
                            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            willChange: 'transform',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden'
                        }}
                    >
                        {items.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    flex: '0 0 100%',
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#000'
                                }}
                            >
                                {renderSlideContent(item, index)}
                            </div>
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    {currentSlide > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                            style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '2.5rem',
                                cursor: 'pointer',
                                zIndex: 20,
                                padding: '1rem',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                            }}
                        >
                            ‹
                        </button>
                    )}
                    {currentSlide < items.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '2.5rem',
                                cursor: 'pointer',
                                zIndex: 20,
                                padding: '1rem',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                            }}
                        >
                            ›
                        </button>
                    )}

                    {/* NSFW Warning Overlay for Carousel */}
                    {hasNSFWContent && !showNSFWContent && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowNSFWContent(true);
                            }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.95)',
                                backdropFilter: 'blur(20px)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 100,
                                padding: '2rem'
                            }}
                        >
                            <FaExclamationTriangle size={64} color="#ff6b6b" style={{ marginBottom: '1.5rem' }} />
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#fff' }}>Sensitive Content</h3>
                            <p style={{ color: '#aaa', marginBottom: '1.5rem', textAlign: 'center', maxWidth: '300px' }}>
                                This post may contain sensitive or mature material
                            </p>
                            <button style={{
                                padding: '0.75rem 1.5rem',
                                background: '#7FFFD4',
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}>
                                Tap to View
                            </button>
                        </div>
                    )}
                </div>
            )}
            {/* End of Items Ternary */}

            {/* Digital Goods Badges */}
            {!isNested && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: 20,
                    alignItems: 'flex-end'
                }}>
                    {post.spaceCardId && (
                        <SpaceCardBadge
                            type={post.isSpaceCardCreator ? 'creator' : 'owner'}
                            rarity={post.spaceCardRarity || 'Common'}
                        />
                    )}
                </div>
            )}



            {/* Author Info & Location - Hidden when nested */}
            {!isNested && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 'max(80px, calc(80px + env(safe-area-inset-bottom)))',
                        left: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                        zIndex: 10,
                        maxWidth: '300px'
                    }}
                >
                    <div
                        className="author-overlay"
                        style={{
                            display: 'flex',
                            alignItems: 'stretch', // Ensure equal height
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '8px',
                            width: 'fit-content',
                            border: '1px solid rgba(255,255,255,0.1)',
                            overflow: 'hidden' // For border radius
                        }}
                    >
                        {/* 1. Profile Picture Button (Left) */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAuthorClick();
                            }}
                            style={{
                                width: '40px', // Fixed square width
                                height: '40px', // Fixed square height
                                padding: '0', // Removing padding to fill the box
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255,255,255,0.05)',
                                borderRight: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer'
                            }}
                        >
                            {authorPhoto && authorPhoto.startsWith('http') ? (
                                <img
                                    src={authorPhoto}
                                    alt={post.username}
                                    style={{
                                        width: '100%', // Fill container
                                        height: '100%', // Fill container
                                        objectFit: 'cover',
                                        borderRadius: '0'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex'; // Flex to center icon
                                    }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <PlanetUserIcon
                                        size={28}
                                        color={authorProfileTheme?.usernameColor && !authorProfileTheme.usernameColor.includes('gradient') ? authorProfileTheme.usernameColor : '#7FFFD4'}
                                        icon={authorDefaultIconId || 'planet-head'}
                                        glow={authorProfileTheme?.textGlow}
                                    />
                                </div>
                            )}
                            {/* Fallback */}
                            <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <PlanetUserIcon
                                    size={28}
                                    color={authorProfileTheme?.usernameColor && !authorProfileTheme.usernameColor.includes('gradient') ? authorProfileTheme.usernameColor : '#7FFFD4'}
                                    icon={authorDefaultIconId || 'planet-head'}
                                    glow={authorProfileTheme?.textGlow}
                                />
                            </div>
                        </div>

                        {/* 2. Username Button (Right) */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDetailsSidebar(true);
                            }}
                            style={{
                                padding: '0.4rem 0.8rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: '2px',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{
                                color: '#7FFFD4',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                fontFamily: '"Rajdhani", monospace',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                lineHeight: 1
                            }}>
                                {renderCosmicUsername(post.username || post.authorName || 'ANONYMOUS')}
                            </span>
                        </div>
                    </div>

                    {/* Frame Counter Below Profile */}
                    {items.length > 1 && (
                        <div style={{
                            padding: '2px 6px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.85)',
                            fontFamily: '"Rajdhani", monospace',
                            fontWeight: '600',
                            letterSpacing: '1px',
                            marginLeft: '2px' // Align slightly with the profile box visual weight
                        }}>
                            {currentSlide + 1}/{items.length}
                        </div>
                    )}
                </div>
            )}

            {/* DETAILS SIDEBAR - Hidden when nested */}
            {!isNested && (
                <PostDetailsSidebar
                    isVisible={showDetailsSidebar}
                    onClose={() => setShowDetailsSidebar(false)}
                    post={post}
                    items={items}
                    currentSlide={currentSlide}
                />
            )}


            {/* Like Button & Slide Counter */}
            {!isNested && (
                <div className="post-actions-container">
                    <LikeButton postId={post.id} enableRatings={post.enableRatings} showCount={false} />
                </div>
            )}
        </div >
    );
};

export default React.memo(StandardPost);
