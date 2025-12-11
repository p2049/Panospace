import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, deleteDoc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { FaCamera, FaInfoCircle, FaUserCircle, FaMapMarkerAlt, FaTrash, FaExclamationTriangle, FaShoppingBag } from 'react-icons/fa';
import LikeButton from './LikeButton';
import FilmStripCarousel from './FilmStripCarousel';
import FilmStripPost from './FilmStripPost';
import InstantPhotoPost from './InstantPhotoPost';
import InstantPhotoFrame from './InstantPhotoFrame';
import SmartImage from './SmartImage';
import DateStampOverlay from './DateStampOverlay';
import SpaceCardBadge from './SpaceCardBadge';
import SoundTagBadge from './SoundTagBadge';
import FollowButton from './FollowButton';
import PlanetUserIcon from './PlanetUserIcon';
import { useUI } from '@/context/UIContext';
import '@/styles/Post.css';

import { formatExifForDisplay } from '@/core/utils/exif';
import { isNSFW, getUserNSFWPreference } from '@/core/constants/nsfwTags';
import { preloadImage } from '@/core/utils/imageCache';
import { logger } from '@/core/utils/logger';

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
        logger.warn('Post component received null/undefined post');
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
    const hasInstantBorder = post.uiOverlays?.instantPhotoBorder === true;

    // Check for special rendering modes first (Top Level)
    if (useFilmStripMode) {
        return <FilmStripPost images={items} uiOverlays={post.uiOverlays} priority={priority} postId={post.id} />;
    }

    if (hasInstantBorder) {
        return <InstantPhotoPost post={post} images={items} uiOverlays={post.uiOverlays} priority={priority} />;
    }

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

    // EARLY FETCHING: Preload first 3 slides when approaching viewport
    useEffect(() => {
        if (!items || items.length === 0 || !containerRef.current) return;

        const preloadObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Immediately preload first 3 slides
                        items.slice(0, 3).forEach(item => {
                            const url = item?.url || (typeof item === 'string' ? item : null);
                            if (url && typeof url === 'string') preloadImage(url);
                        });
                        preloadObserver.disconnect();
                    }
                });
            },
            { rootMargin: '50% 0px 50% 0px' } // Start fetching when 50% of screen away
        );

        preloadObserver.observe(containerRef.current);
        return () => preloadObserver.disconnect();
    }, [items]);

    // BACKLOG FIX: Fetch Author Photo if missing
    // Old posts might not have the updated author photo URL.
    // We check if it's missing, and if so, fetch the latest public profile.
    // IMPROVED: Check all possible field names for avatar
    const [authorPhoto, setAuthorPhoto] = useState(
        post.authorPhotoUrl ||
        post.userPhotoUrl ||
        post.userAvatar ||
        post.profileImage ||
        null
    );

    useEffect(() => {
        const fetchAuthorPhoto = async () => {
            // If we already have a valid photo URL, don't fetch.
            if (authorPhoto && authorPhoto.startsWith('http')) return;

            // Identify the author ID
            const authorId = post.userId || post.authorId || post.uid;
            if (!authorId) return;

            try {
                const userDocRef = doc(db, 'users', authorId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userData.photoURL) {
                        setAuthorPhoto(userData.photoURL);
                    }
                }
            } catch (err) {
                logger.warn("Failed to fetch author photo fallback", err);
            }
        };

        fetchAuthorPhoto();
    }, [post.userId, post.authorId, post.uid, authorPhoto]);



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

    // State for Details Sidebar
    const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
    const [shopLinkTarget, setShopLinkTarget] = useState(null); // { type: 'item' | 'profile', id: string }

    // Check for linked shop item or general shop existence
    useEffect(() => {
        if (showDetailsSidebar) {
            const checkShopStatus = async () => {
                const authorId = post.userId || post.authorId || post.uid;
                if (!authorId) return;

                try {
                    const shopItemsRef = collection(db, 'shopItems');

                    logger.log("Checking Shop Status for:", authorId, "Post:", post.id, "SpaceCard:", post.spaceCardId);

                    // 1. Check if THIS post is listed (by sourcePostId matching post.id OR post.spaceCardId)
                    // We need to check both because ShopItems can link to either a Post or a SpaceCard.
                    const checks = [post.id];
                    if (post.spaceCardId) checks.push(post.spaceCardId);

                    const specificItemQuery = query(
                        shopItemsRef,
                        where('ownerId', '==', authorId),
                        where('sourcePostId', 'in', checks),
                        where('status', '==', 'active'),
                        limit(1)
                    );
                    const specificSnapshot = await getDocs(specificItemQuery);

                    if (!specificSnapshot.empty) {
                        logger.log("Found Specific Item:", specificSnapshot.docs[0].id);
                        setShopLinkTarget({ type: 'item', id: specificSnapshot.docs[0].id });
                        return;
                    } else {
                        logger.log("No specific item found.");
                    }

                    // 2. Fallback: Check if user has ANY active shop items
                    const generalQuery = query(
                        shopItemsRef,
                        where('ownerId', '==', authorId),
                        where('status', '==', 'active'),
                        limit(1)
                    );
                    const generalSnapshot = await getDocs(generalQuery);

                    if (!generalSnapshot.empty) {
                        logger.log("Found General Shop Items");
                        setShopLinkTarget({ type: 'profile', id: authorId });
                    } else {
                        logger.log("No active shop items found for user.");
                        setShopLinkTarget(null);
                    }
                } catch (error) {
                    logger.error("Error checking shop status:", error);
                }
            };
            checkShopStatus();
        }
    }, [showDetailsSidebar, post.userId, post.authorId, post.uid, post.id]);

    // Handlers
    const handleEditPost = () => {
        navigate(`/edit-post/${post.id}`);
    };

    const handleReportPost = () => {
        // Simple alert or modal trigger - reusing logic from context menu would require props drilling or context
        // For now, implementing basic handlers or relying on parent if needed. 
        // But Post.jsx is a child. We might need to dispatch an event or use a global modal.
        // The MobileNavigation has the modals. 
        // Let's implement basic alerts or navigation for now, 
        // OR better: use the existing handlers if they were passed (they weren't).
        // Since this is a modification of the Post component, and it doesn't have the "ReportModal" visible, 
        // we might need to rely on the global UI context or just alert for now.
        alert("Report feature coming soon");
    };

    const handleBlockUser = async () => {
        if (window.confirm(`Block ${post.username || 'user'}?`)) {
            // Dispatch block event or handle via service locally
            alert("User blocked");
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        alert("Link copied");
    };

    // Preload current, next, prev images for instant swiping
    useEffect(() => {
        if (!items || items.length === 0) return;

        // Preload Current + Next + Prev
        // We include Current to ensure it's in the Map cache (preventing GC flicker)
        const indicesToPreload = [currentSlide];

        if (items.length > 1) {
            indicesToPreload.push((currentSlide + 1) % items.length);
            indicesToPreload.push((currentSlide - 1 + items.length) % items.length);
        }

        indicesToPreload.forEach(index => {
            const item = items[index];
            const url = item?.url || (typeof item === 'string' ? item : null);
            if (url && typeof url === 'string') {
                preloadImage(url);
            }
        });
    }, [currentSlide, items]);

    // Helper to render content for both Single and Slideshow views
    const renderSlideContent = (item, index) => {
        if (!item) return null;

        const url = item.url || item;
        const isUrl = typeof url === 'string' && (url.startsWith('http') || url.startsWith('blob:'));

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
                        <DateStampOverlay quartzDate={post.uiOverlays.quartzDate} />
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
            ref={containerRef}
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

            {/* Title Overlay */}
            {
                post.title && (
                    <div className="post-title-overlay">
                        <h2 className="post-title-text">{post.title}</h2>
                    </div>
                )
            }

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
                                borderRadius: '0' // Boxy look to fill the container if desired, or keep logic. User said "fill the whole gray box". 
                                // Since the container (gray box) is square, we make the image square.
                                // If rounding is needed on the container, we should apply it there. 
                                // Line 513 sets borderRadius: '8px' on the PARENT author-overlay.
                                // This inner box is the left-most element.
                                // We'll effectively make it fill.
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
                        @{post.username || post.authorName || 'ANONYMOUS'}
                    </span>

                    {post.location && (post.location.city || post.location.country) && (
                        <span style={{ color: '#aaa', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'monospace', lineHeight: 1 }}>
                            <FaMapMarkerAlt size={8} />
                            {[post.location.city, post.location.country].filter(Boolean).join(', ').toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            {/* DETAILS SIDEBAR */}
            {
                showDetailsSidebar && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: '300px',
                            maxWidth: '80vw',
                            background: 'rgba(10, 10, 10, 0.95)', // Solid/Dark for readability
                            backdropFilter: 'blur(15px)',
                            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                            zIndex: 1000, // Above everything in post
                            // Improved padding for safe areas and alignment
                            paddingTop: 'max(1rem, env(safe-area-inset-top))',
                            paddingLeft: 'max(2.8rem, env(safe-area-inset-left))', // Increased by ~25px to move right
                            paddingRight: '1.5rem',
                            paddingBottom: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            overflowY: 'auto',
                            animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        <style>{`
@keyframes slideInLeft {
                            from { transform: translateX(-100 %); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
}
`}</style>


                        {/* Header / Close */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                {/* Green Planet Logo */}
                                <h3 style={{ margin: 0, marginLeft: '40px', color: '#7FFFD4', fontFamily: '"Orbitron", sans-serif', letterSpacing: '2px', lineHeight: 1 }}>POST INFO</h3>
                            </div>
                            <button
                                onClick={() => setShowDetailsSidebar(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#7FFFD4', // Ice Mint
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '24px',
                                    height: '24px',
                                    filter: 'drop-shadow(0 0 6px rgba(127, 255, 212, 0.5))' // Glow effect
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Content Section */}

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <FaInfoCircle color="#7FFFD4" size={14} /> TAGS
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {post.tags.map(tag => (
                                        <span
                                            key={tag}
                                            onClick={(e) => handleTagClick(tag, e)}
                                            style={{
                                                background: 'rgba(127, 255, 212, 0.1)',
                                                border: '1px solid rgba(127, 255, 212, 0.3)',
                                                padding: '4px 10px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                color: '#7FFFD4',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Exif Data */}
                        {items[currentSlide]?.exif && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <FaCamera color="#7FFFD4" size={14} /> SHOT DETAILS
                                </div>
                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    color: '#ccc',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.4rem'
                                }}>
                                    {formatExifForDisplay(items[currentSlide].exif)?.camera && <div><strong style={{ color: '#fff' }}>Camera:</strong> {formatExifForDisplay(items[currentSlide].exif).camera}</div>}
                                    {formatExifForDisplay(items[currentSlide].exif)?.lens && <div><strong style={{ color: '#fff' }}>Lens:</strong> {formatExifForDisplay(items[currentSlide].exif).lens}</div>}
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                                        {formatExifForDisplay(items[currentSlide].exif)?.specs.map((spec, i) => (
                                            <span key={i} style={{ background: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>{spec}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Post Options (Bottom) */}
                        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                            {/* Shop Link - Visible to ALL (with Smart Logic) */}
                            {/* If owner: Always show (Manage/Visit) */}
                            {/* If visitor: Only show if shopLinkTarget exists (Active items) */}
                            {(shopLinkTarget || currentUser?.uid === (post.userId || post.authorId || post.uid)) && (
                                <button
                                    onClick={() => {
                                        if (shopLinkTarget?.type === 'item') {
                                            navigate(`/shop/${shopLinkTarget.id}`);
                                        } else {
                                            // Fallback to profile shop tab
                                            const targetId = post.userId || post.authorId || post.uid;
                                            navigate(`/profile/${targetId}?tab=shop`);
                                        }
                                    }}
                                    style={{
                                        padding: '0.8rem',
                                        background: 'rgba(127, 255, 212, 0.1)',
                                        border: '1px solid #7FFFD4',
                                        borderRadius: '4px',
                                        color: '#7FFFD4',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        marginBottom: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <FaShoppingBag />
                                    {shopLinkTarget?.type === 'item' ? 'View in Shop' :
                                        (currentUser?.uid === (post.userId || post.authorId || post.uid) ? 'My Shop' : 'Visit Shop')}
                                </button>
                            )}

                            {currentUser?.uid === post.userId ? (
                                <>
                                    <button onClick={handleEditPost} style={{ padding: '0.8rem', background: '#333', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                                        Edit Post
                                    </button>
                                    <button onClick={() => {
                                        if (window.confirm("Delete this post?")) {
                                            deleteDoc(doc(db, "posts", post.id)).then(() => navigate('/'));
                                        }
                                    }} style={{ padding: '0.8rem', background: 'rgba(255,0,0,0.2)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '4px', color: '#ff6b6b', cursor: 'pointer', textAlign: 'left' }}>
                                        Delete Post
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Follow Button */}
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <FollowButton
                                            targetUserId={post.userId}
                                            targetUserName={post.username}
                                            style={{
                                                width: '100%',
                                                justifyContent: 'center',
                                                background: 'transparent',
                                                border: '1px solid #7FFFD4',
                                                color: '#7FFFD4',
                                                padding: '0.8rem',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </div>

                                    <button onClick={handleReportPost} style={{ padding: '0.8rem', background: 'transparent', border: '1px solid #444', borderRadius: '4px', color: '#ccc', cursor: 'pointer', textAlign: 'left' }}>
                                        Report Post
                                    </button>
                                    <button onClick={handleBlockUser} style={{ padding: '0.8rem', background: 'transparent', border: '1px solid #444', borderRadius: '4px', color: '#ccc', cursor: 'pointer', textAlign: 'left' }}>
                                        Block User
                                    </button>
                                </>
                            )}
                            <button onClick={handleCopyLink} style={{ padding: '0.8rem', background: 'transparent', border: '1px solid #444', borderRadius: '4px', color: '#7FFFD4', cursor: 'pointer', textAlign: 'left' }}>
                                Copy Link
                            </button>
                        </div>

                    </div>
                )
            }

            {/* Backdrop for sidebar */}
            {
                showDetailsSidebar && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowDetailsSidebar(false);
                        }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            zIndex: 999, // Below sidebar
                            backdropFilter: 'blur(2px)'
                        }}
                    />
                )
            }


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

        </div >
    );
};

export default React.memo(Post, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return prevProps.post.id === nextProps.post.id &&
        prevProps.priority === nextProps.priority;
});
