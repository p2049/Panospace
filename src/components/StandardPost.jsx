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
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
    const [width, setWidth] = useState(0);
    const carouselRef = useRef(null);

    // Track container width for pixel-perfect carousel movement
    useEffect(() => {
        if (!carouselRef.current) return;

        const updateWidth = () => {
            if (carouselRef.current) {
                setWidth(carouselRef.current.offsetWidth);
            }
        };

        const observer = new ResizeObserver(updateWidth);
        observer.observe(carouselRef.current);
        updateWidth();

        return () => observer.disconnect();
    }, []);

    // Navigation logic handled by drag or arrows
    const nextSlide = useCallback(() => {
        if (currentSlide < items.length - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    }, [items.length, currentSlide, setCurrentSlide]);

    const prevSlide = useCallback(() => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    }, [currentSlide, setCurrentSlide]);

    const handleDragEnd = (e, info) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        const currentWidth = width || window.innerWidth;

        // IG Style One-at-a-time snap:
        if (offset < -currentWidth * 0.2 || velocity < -500) {
            // Commit to next slide
            if (currentSlide < items.length - 1) {
                setCurrentSlide(prev => prev + 1);
            }
        } else if (offset > currentWidth * 0.2 || velocity > 500) {
            // Commit to prev slide
            if (currentSlide > 0) {
                setCurrentSlide(prev => prev - 1);
            }
        }
        // Snap back happens automatically because each slide's 'x' is determined by currentSlide
    };

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
                width: isNested ? '100%' : '100%',
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
                        overflow: 'hidden',
                        touchAction: 'pan-y pinch-zoom'
                    }}
                    ref={carouselRef}
                >
                    {/* Slides Container */}
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            drag="x"
                            dragDirectionLock
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            dragMomentum={false}
                            onDragEnd={handleDragEnd}
                            animate={{ x: (index - currentSlide) * width }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                mass: 0.8
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#000',
                                willChange: 'transform'
                            }}
                        >
                            {renderSlideContent(item, index)}
                        </motion.div>
                    ))}

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
                            <button style={{
                                color: '#7FFFD4',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                fontFamily: '"Rajdhani", monospace',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                lineHeight: 1,
                                background: 'none', // Ensure button looks like text
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}>
                                {renderCosmicUsername(post.username || post.authorName || 'ANONYMOUS')}
                            </button>
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
                    <LikeButton postId={post.id} enableRatings={post.enableRatings} showCount={true} />
                </div>
            )}
        </div >
    );
};

export default React.memo(StandardPost);
