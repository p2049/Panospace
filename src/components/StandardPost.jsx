import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaCamera } from 'react-icons/fa';
import LikeButton from './LikeButton';
import PostDetailsSidebar from './PostDetailsSidebar';
import SpaceCardBadge from './SpaceCardBadge';
import SoundTagBadge from './SoundTagBadge';
import PlanetUserIcon from './PlanetUserIcon';
import SmartImage from './SmartImage';
import DateStampOverlay from './DateStampOverlay';
import { renderCosmicUsername } from '@/utils/usernameRenderer';
import { getQuartzDateStyle } from '@/core/utils/quartzDateUtils';
import { formatExifForDisplay } from '@/core/utils/exif';
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
    handleAuthorClick,
    containerRef,
    currentSlide,
    setCurrentSlide,
    showNSFWContent,
    setShowNSFWContent,
    hasNSFWContent,
    showDetailsSidebar,
    setShowDetailsSidebar
}) => {
    const touchStartRef = useRef({ x: null, y: null });
    const touchEndRef = useRef({ x: null, y: null });

    // Touch handlers with refs to avoid re-renders
    const onTouchStart = useCallback((e) => {
        touchStartRef.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        };
        touchEndRef.current = { x: null, y: null };
    }, []);

    const onTouchMove = useCallback((e) => {
        touchEndRef.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        };
    }, []);

    const onTouchEnd = useCallback(() => {
        const start = touchStartRef.current;
        const end = touchEndRef.current;

        if (!start.x || !end.x) return;

        const distanceX = start.x - end.x;
        const distanceY = start.y - end.y;
        const minSwipeDistance = 50;

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
                    <SmartImage
                        src={url}
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
            className="post-ui--standard"
            style={{
                height: '100vh',
                width: '100vw',
                scrollSnapAlign: 'start',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#000',
                willChange: 'transform',
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
                            background: '#000',
                            position: 'relative'
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

                            {/* NSFW Warning Overlay */}
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
                    );
                })()
            ) : (
                /* MULTI-IMAGE CAROUSEL */
                <div
                    style={{
                        width: '100%',
                        height: '100%',
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
                            transform: `translateX(-${currentSlide * 100}%)`,
                            transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
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
                {post.soundTagId && (
                    <SoundTagBadge
                        hasSound={true}
                        label={post.soundTagTitle || 'SoundTag'}
                        onClick={(e) => {
                            e.stopPropagation();
                            alert("SoundTag Preview Coming Soon");
                        }}
                    />
                )}
            </div>



            {/* Author Info & Location - REDESIGNED */}
            <div
                className="author-overlay"
                style={{
                    position: 'absolute',
                    bottom: 'max(80px, calc(80px + env(safe-area-inset-bottom)))',
                    left: '20px',
                    display: 'flex',
                    alignItems: 'stretch', // Ensure equal height
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '8px',
                    zIndex: 10,
                    width: 'fit-content',
                    maxWidth: '300px',
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
                            <PlanetUserIcon size={28} color="#7FFFD4" />
                        </div>
                    )}
                    {/* Fallback */}
                    <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <PlanetUserIcon size={28} color="#7FFFD4" />
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

            {/* DETAILS SIDEBAR */}
            <PostDetailsSidebar
                isVisible={showDetailsSidebar}
                onClose={() => setShowDetailsSidebar(false)}
                post={post}
                items={items}
                currentSlide={currentSlide}
            />


            {/* Like Button & Slide Counter */}
            <div className="post-actions-container">
                {items.length > 1 && (
                    <div style={{
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontSize: '1rem',
                        fontWeight: '600',
                        fontFamily: '"Rajdhani", "SF Mono", "Monaco", monospace',
                        letterSpacing: '1px',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                        fontVariantNumeric: 'tabular-nums'
                    }}>
                        {currentSlide + 1}/{items.length}
                    </div>
                )}
                <LikeButton postId={post.id} enableRatings={true} showCount={false} />
            </div>

        </div >
    );
};

export default React.memo(StandardPost);
