import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { FaCamera, FaInfoCircle, FaUserCircle, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
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

const ExifDisplay = ({ exif }) => {
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
};

const Post = ({ post }) => {
    const { currentUser } = useAuth();
    const { setActivePost } = useUI(); // Use global UI context
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [showInfo, setShowInfo] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Intersection Observer to track active post
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActivePost(post); // Set this post as active when visible
                    }
                });
            },
            { threshold: 0.6 } // 60% visibility required
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [post, setActivePost]);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [touchStartY, setTouchStartY] = useState(null);
    const [touchEndY, setTouchEndY] = useState(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
        setTouchEndY(null);
        setTouchStartY(e.targetTouches[0].clientY);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
        setTouchEndY(e.targetTouches[0].clientY);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distanceX = touchStart - touchEnd;
        const distanceY = touchStartY - touchEndY;

        // Check if it's more horizontal than vertical
        const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

        if (isHorizontal) {
            const isLeftSwipe = distanceX > minSwipeDistance;
            const isRightSwipe = distanceX < -minSwipeDistance;

            if (isLeftSwipe) {
                nextSlide();
            }
            if (isRightSwipe) {
                prevSlide();
            }
        }
    };

    // Handle legacy 'slides' vs new 'items' vs current 'images' structure
    let items = post.images || post.items || post.slides || [];

    // If no items exist but we have an imageUrl or shopImageUrl, create a single item
    if (items.length === 0) {
        const fallbackUrl = post?.images?.[0]?.url || post.imageUrl || post.shopImageUrl || '';
        if (fallbackUrl) {
            items = [{ type: 'image', url: fallbackUrl }];
        }
    }

    const currentItem = items[currentSlide] || items[0] || {}; // Use currentSlide for EXIF

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
            try {
                await deleteDoc(doc(db, 'posts', post.id));
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post.");
            }
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
    };

    const postContainerStyle = {
        height: '100vh',
        width: '100vw',
        scrollSnapAlign: 'start',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeIn 0.4s ease-out',
        marginBottom: '10px',
        backgroundColor: '#000'
    };

    const authorOverlayStyle = {
        position: 'absolute',
        bottom: 'max(80px, calc(80px + env(safe-area-inset-bottom)))', // Higher positioning for mobile visibility
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.1rem', // Tighter gap
        padding: '0.2rem 0.5rem', // Tighter padding
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        borderRadius: '4px',
        borderLeft: '2px solid #7FFFD4',
        zIndex: 10,
        cursor: 'pointer',
        width: 'fit-content', // Hug content
        maxWidth: '200px'
    };

    // Check if this post should use Film Strip Mode
    const useFilmStripMode = post.uiOverlays?.sprocketBorder === true;

    return (
        <div ref={containerRef} style={postContainerStyle} data-testid="post-item">
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
                /* SINGLE IMAGE VIEW - NO FILM STRIP */
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative' }}>
                    {items[0].url || (typeof items[0] === 'string' && items[0].match(/^http/)) ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <img
                                src={items[0].url || items[0]}
                                alt="Post content"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    display: 'block'
                                }}
                            />
                            {/* Date Stamp Overlay - positioned relative to image */}
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
                /* FILM STRIP MODE - Real PNG overlay */
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FilmStripPost images={items} uiOverlays={post.uiOverlays} />
                </div>
            ) : (
                /* REGULAR MULTI-IMAGE - Full-screen slides */
                <div
                    style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', touchAction: 'pan-y' }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >


                    {/* Current slide image */}
                    {items[currentSlide].url || (typeof items[currentSlide] === 'string' && items[currentSlide].match(/^http/)) ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <img
                                src={items[currentSlide].url || items[currentSlide]}
                                alt={`Slide ${currentSlide + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    display: 'block'
                                }}
                            />
                            {/* Date Stamp Overlay - positioned relative to image */}
                            {post.uiOverlays?.quartzDate && (
                                <DateStampOverlay quartzDate={post.uiOverlays.quartzDate} />
                            )}
                        </div>
                    ) : (
                        <div style={{ color: '#fff', fontSize: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                            {items[currentSlide].content || items[currentSlide].text || (typeof items[currentSlide] === 'string' ? items[currentSlide] : JSON.stringify(items[currentSlide]))}
                        </div>
                    )}

                    {/* Navigation arrows - Futuristic hexagonal design */}
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
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 15,
                                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                                        transition: 'all 0.2s ease',
                                        padding: '0',
                                        width: 'auto',
                                        height: 'auto'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
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
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 15,
                                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                                        transition: 'all 0.2s ease',
                                        padding: '0',
                                        width: 'auto',
                                        height: 'auto'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
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

            {/* Title & Tags Overlay - To the right of planet icon on left side */}
            {(post.title || (post.tags && post.tags.length > 0)) && (
                <div className="post-title-overlay">
                    {post.title && <h2 className="post-title-text">{post.title}</h2>}
                    {post.tags && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {post.tags.map(tag => (
                                <span key={tag} style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Info Toggle Button (for EXIF) - Next to username, green aesthetic */}
            {currentItem?.exif && (
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '220px',
                        background: '#000',
                        color: 'rgba(127, 255, 212, 0.3)',
                        border: '2px solid rgba(127, 255, 212, 0.3)',
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

            {/* EXIF Display Overlay */}
            {showInfo && currentItem?.exif && <ExifDisplay exif={currentItem.exif} />}

            {/* Author Info & Location */}
            <div
                className="author-overlay"
                style={authorOverlayStyle}
                onClick={() => navigate(`/profile/${post.userId || post.authorId}`)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
                {/* Minimal Username Display */}
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

            {/* Like Button & Slide Counter - Swapped with info button */}
            <div className="post-actions-container">
                {/* Slide Counter - Minimal design */}
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

export default React.memo(Post);
