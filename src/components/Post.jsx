import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { FaCamera, FaInfoCircle, FaUserCircle, FaMapMarkerAlt, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import LikeButton from './LikeButton';
import FilmStripCarousel from './FilmStripCarousel';
import FilmStripPost from './FilmStripPost';
import SmartImage from './SmartImage';
import DateStampOverlay from './DateStampOverlay';
import SpaceCardBadge from './SpaceCardBadge';
import SoundTagBadge from './SoundTagBadge';
import { useUI } from '../context/UIContext';
import '../styles/Post.css';

import { formatExifForDisplay } from '../utils/exifUtils';
import { isNSFW, getUserNSFWPreference } from '../constants/nsfwTags';

const ExifDisplay = React.memo(({ exif }) => {
    const displayData = formatExifForDisplay(exif);
    if (!displayData) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '120px',
            left: '20px',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#ccc',
            fontSize: '0.8rem',
            maxWidth: '300px',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                <FaCamera /> Photography Data
            </div>
            {displayData.camera && <div><strong>Camera:</strong> {displayData.camera}</div>}
            {displayData.lens && <div><strong>Lens:</strong> {displayData.lens}</div>}
            <div style={{ display: 'flex', gap: '1rem' }}>
                {displayData.specs.map((spec, i) => (
                    <div key={i}>{spec}</div>
                ))}
            </div>
            {displayData.date && <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{displayData.date}</div>}
        </div>
    );
});

const Post = ({ post, priority = 'normal' }) => {
    const { currentUser } = useAuth();
    const { setActivePost } = useUI();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [showInfo, setShowInfo] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const touchStartRef = useRef({ x: null, y: null });
    const touchEndRef = useRef({ x: null, y: null });

    // STABILITY: Early return if post is null/undefined
    if (!post) {
        console.warn('Post component received null/undefined post');
        return null;
    }

    // NSFW Content Detection
    const hasNSFWContent = useMemo(() => {
        return isNSFW(post?.tags);
    }, [post?.tags]);

    const userPrefersNSFW = getUserNSFWPreference();
    const [showNSFWContent, setShowNSFWContent] = useState(userPrefersNSFW);

    // Memoize items to prevent recalculation
    const items = useMemo(() => {
        let itemsList = post.images || post.items || post.slides || [];

        if (itemsList.length === 0) {
            const fallbackUrl = post?.images?.[0]?.url || post.imageUrl || post.shopImageUrl || '';
            if (fallbackUrl) {
                itemsList = [{ type: 'image', url: fallbackUrl }];
            }
        }

        return itemsList;
    }, [post]);

    const currentItem = items[currentSlide] || items[0] || {};
    const useFilmStripMode = post.uiOverlays?.sprocketBorder === true;

    // Intersection Observer to track active post
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActivePost(post);
                    }
                });
            },
            { threshold: 0.6 }
        );

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [post.id, setActivePost]); // Only depend on post.id

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
    }, [currentSlide, items.length]);

    const handleDelete = useCallback(async () => {
        if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
            try {
                await deleteDoc(doc(db, 'posts', post.id));
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post.");
            }
        }
    }, [post.id]);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % items.length);
    }, [items.length]);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);

    const handleAuthorClick = useCallback(() => {
        navigate(`/profile/${post.userId || post.authorId}`);
    }, [navigate, post.userId, post.authorId]);

    const handleTagClick = useCallback((tag, e) => {
        e.stopPropagation();
        navigate(`/search?tags=${tag}`);
    }, [navigate]);

    return (
        <div
            ref={containerRef}
            style={{
                height: '100vh',
                width: '100vw',
                scrollSnapAlign: 'start',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#000',
                // Prevent layout shift
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
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative' }}>
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
                    {items[0].url || (typeof items[0] === 'string' && items[0].match(/^http/)) ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <SmartImage
                                src={items[0].url || items[0]}
                                alt="Post content"
                                priority={priority}
                                objectFit="contain"
                                style={{ width: '100%', height: '100%' }}
                            />
                            {post.uiOverlays?.quartzDate && (
                                <DateStampOverlay quartzDate={post.uiOverlays.quartzDate} />
                            )}
                        </div>
                    ) : (
                        <div style={{ color: '#fff', fontSize: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                            {items[0].content || items[0].text || (typeof items[0] === 'string' ? items[0] : JSON.stringify(items[0]))}
                        </div>
                    )}
                </div>
            ) : useFilmStripMode ? (
                /* FILM STRIP MODE */
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FilmStripPost images={items} uiOverlays={post.uiOverlays} priority={priority} />
                </div>
            ) : (
                /* MULTI-IMAGE SLIDESHOW */
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#000',
                        touchAction: 'pan-y'
                    }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {items[currentSlide].url || (typeof items[currentSlide] === 'string' && items[currentSlide].match(/^http/)) ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <SmartImage
                                src={items[currentSlide].url || items[currentSlide]}
                                alt={`Slide ${currentSlide + 1}`}
                                priority={priority}
                                objectFit="contain"
                                style={{ width: '100%', height: '100%' }}
                            />
                            {post.uiOverlays?.quartzDate && (
                                <DateStampOverlay quartzDate={post.uiOverlays.quartzDate} />
                            )}
                        </div>
                    ) : (
                        <div style={{ color: '#fff', fontSize: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                            {items[currentSlide].content || items[currentSlide].text || (typeof items[currentSlide] === 'string' ? items[currentSlide] : JSON.stringify(items[currentSlide]))}
                        </div>
                    )}

                    {/* Navigation arrows */}
                    {items.length > 1 && (
                        <>
                            {currentSlide > 0 && (
                                <button
                                    onClick={prevSlide}
                                    style={{
                                        position: 'absolute',
                                        left: '20px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '3rem',
                                        fontWeight: '300',
                                        cursor: 'pointer',
                                        zIndex: 15,
                                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                                        transition: 'all 0.2s ease',
                                        padding: '0',
                                        width: 'auto',
                                        height: 'auto'
                                    }}
                                >
                                    ‹
                                </button>
                            )}
                            {currentSlide < items.length - 1 && (
                                <button
                                    onClick={nextSlide}
                                    style={{
                                        position: 'absolute',
                                        right: '20px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '3rem',
                                        fontWeight: '300',
                                        cursor: 'pointer',
                                        zIndex: 15,
                                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                                        transition: 'all 0.2s ease',
                                        padding: '0',
                                        width: 'auto',
                                        height: 'auto'
                                    }}
                                >
                                    ›
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}

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

            {/* Title Overlay */}
            {post.title && (
                <div className="post-title-overlay">
                    <h2 className="post-title-text">{post.title}</h2>
                </div>
            )}

            {/* Info Toggle Button */}
            {(currentItem?.exif || (post.tags && post.tags.length > 0)) && (
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '220px',
                        background: '#000',
                        color: showInfo ? 'rgba(127, 255, 212, 0.9)' : 'rgba(127, 255, 212, 0.3)',
                        border: `2px solid ${showInfo ? 'rgba(127, 255, 212, 0.9)' : 'rgba(127, 255, 212, 0.3)'}`,
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 20,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        fontFamily: '"Orbitron", "Courier New", monospace',
                        fontStyle: 'normal',
                        boxShadow: showInfo ? '0 0 12px rgba(127, 255, 212, 0.6)' : '0 2px 8px rgba(0, 0, 0, 0.5)',
                        transition: 'all 0.2s'
                    }}
                >
                    i
                </button>
            )}

            {/* Info Display Overlay */}
            {showInfo && (
                <div style={{
                    position: 'absolute',
                    bottom: '120px',
                    left: '20px',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ccc',
                    fontSize: '0.8rem',
                    maxWidth: '300px',
                    zIndex: 15,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    {currentItem?.exif && <ExifDisplay exif={currentItem.exif} />}

                    {post.tags && post.tags.length > 0 && (
                        <div style={{ borderTop: currentItem?.exif ? '1px solid #333' : 'none', paddingTop: currentItem?.exif ? '0.75rem' : '0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                <FaInfoCircle /> Tags
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {post.tags.map(tag => (
                                    <span
                                        key={tag}
                                        onClick={(e) => handleTagClick(tag, e)}
                                        style={{
                                            background: 'rgba(127, 255, 212, 0.2)',
                                            border: '1px solid rgba(127, 255, 212, 0.3)',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            color: '#7FFFD4',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Phase 4: Social Chip */}
                    {(post.type === 'social') && (
                        <div style={{ padding: '0.75rem 0 0', borderTop: '1px solid #333' }}>
                            <span
                                className="social-tag-chip"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/search", { state: { forceSocialMode: true } });
                                }}
                                style={{
                                    display: 'inline-block',
                                    padding: '2px 8px',
                                    fontSize: '0.65rem',
                                    borderRadius: '6px',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    opacity: 0.85,
                                    background: 'rgba(255, 107, 157, 0.15)',
                                    border: '1px solid #FF6B9D',
                                    color: '#FF6B9D',
                                }}
                            >
                                👥 social
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Author Info & Location */}
            <div
                className="author-overlay"
                style={{
                    position: 'absolute',
                    bottom: 'max(80px, calc(80px + env(safe-area-inset-bottom)))',
                    left: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.1rem',
                    padding: '0.2rem 0.5rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '4px',
                    borderLeft: '2px solid #7FFFD4',
                    zIndex: 10,
                    cursor: 'pointer',
                    width: 'fit-content',
                    maxWidth: '200px',
                    transition: 'transform 0.2s ease'
                }}
                onClick={handleAuthorClick}
            >
                <span style={{
                    color: '#7FFFD4',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    fontFamily: '"Rajdhani", monospace',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    textShadow: '0 0 8px rgba(127, 255, 212, 0.3)'
                }}>
                    @{post.username || post.authorName || 'ANONYMOUS'}
                </span>

                {post.location && (post.location.city || post.location.country) && (
                    <span style={{ color: '#aaa', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'monospace' }}>
                        <FaMapMarkerAlt size={8} />
                        {[post.location.city, post.location.country].filter(Boolean).join(', ').toUpperCase()}
                    </span>
                )}
            </div>

            {/* Like Button & Slide Counter */}
            <div className="post-actions-container">
                {items.length > 1 && !useFilmStripMode && (
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
                <LikeButton postId={post.id} />
            </div>

        </div>
    );
};

export default React.memo(Post, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return prevProps.post.id === nextProps.post.id &&
        prevProps.priority === nextProps.priority;
});
