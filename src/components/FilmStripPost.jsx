import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import '@/styles/film-strip-post.css';
import DateStampOverlay from './DateStampOverlay';
import SmartImage from './SmartImage';
import LikeButton from './LikeButton';
import PlanetUserIcon from './PlanetUserIcon';
import PostDetailsSidebar from './PostDetailsSidebar';
import { renderCosmicUsername } from '@/utils/usernameRenderer';
import { FaMapMarkerAlt } from 'react-icons/fa';

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
    const [renderedSrc, setRenderedSrc] = useState(null);
    const itemUrl = item.url || item;
    const isUrl = typeof itemUrl === 'string' && (itemUrl.startsWith('http') || itemUrl.startsWith('blob:'));

    // Cache Key
    const cacheKey = `${postId}_slide_${index}`;

    useEffect(() => {
        // 1. Check Cache
        import('@/core/film/FilmSlideCache').then(({ FilmSlideCache }) => {
            const cached = FilmSlideCache.get(cacheKey);
            if (cached) {
                setRenderedSrc(cached);
                return;
            }

            // 2. Render if not cached & visible/near
            if (isUrl && Math.abs(priority) <= 1 && !postId.toString().includes('preview')) {
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

    return (
        <div className="cyber-frame-unit">
            <div className="cyber-track top">
                <span className="cyber-micro-text">{getStockName()}</span>
                <span className="cyber-frame-number">{getFrameNumber(index)}</span>
                <Sprockets />
            </div>

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

            <div className="cyber-track bottom">
                <span className="cyber-edge-code">{getEdgeCode(index)}</span>
                <Sprockets />
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
 */
const FilmStripPost = ({ post, images = [], uiOverlays = null, priority = 'normal', postId = 'preview' }) => {
    const navigate = useNavigate();
    const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
    const [authorPhoto, setAuthorPhoto] = useState(
        post?.authorPhotoUrl || post?.userPhotoUrl || post?.photoURL || null
    );

    // Fetch author photo if missing
    useEffect(() => {
        if (authorPhoto || !post?.userId) return;
        const fetchAuthorPhoto = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', post.userId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setAuthorPhoto(data.photoURL || data.avatarUrl || data.profilePicture || null);
                }
            } catch (err) {
                console.error('Error fetching author photo:', err);
            }
        };
        fetchAuthorPhoto();
    }, [authorPhoto, post?.userId]);

    const handleAuthorClick = () => {
        if (post?.userId) {
            navigate(`/profile/${post.userId}`);
        }
    };

    const getFrameNumber = (index) => {
        const frameNum = index + 1;
        return frameNum % 2 === 0 ? `${frameNum}` : `${frameNum}A`;
    };

    const getEdgeCode = (index) => `K${(index + 100).toString()}`;
    const getStockName = () => 'PANOSPACE';

    useEffect(() => {
        if (!images || images.length === 0) return;
        const initialLoad = images.slice(0, 3);
        import('@/core/image/preloadFilmSlide').then(({ preloadFilmSlide }) => {
            preloadFilmSlide(initialLoad);
        });
    }, [images]);

    return (
        <div className="cyber-film-strip-wrapper" style={{ position: 'relative' }}>
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
                <div className="cyber-leader"></div>

                {images.map((item, index) => (
                    <FilmFrameUnit
                        key={index}
                        item={item}
                        index={index}
                        priority={index}
                        getStockName={getStockName}
                        getFrameNumber={getFrameNumber}
                        getEdgeCode={getEdgeCode}
                        uiOverlays={uiOverlays}
                        postId={postId}
                    />
                ))}

                <div className="cyber-leader trailer"></div>
            </div>

            {/* Author Info Overlay (Bottom Left) */}
            <div
                className="author-overlay"
                style={{
                    position: 'absolute',
                    bottom: 'max(80px, calc(80px + env(safe-area-inset-bottom)))',
                    left: '20px',
                    display: 'flex',
                    alignItems: 'stretch',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '8px',
                    zIndex: 10,
                    width: 'fit-content',
                    maxWidth: '300px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden'
                }}
            >
                {/* Author Photo */}
                <div
                    onClick={handleAuthorClick}
                    style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        borderRight: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer'
                    }}
                >
                    {authorPhoto ? (
                        <img
                            src={authorPhoto}
                            alt={post?.username}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                    ) : null}
                    <div style={{ display: authorPhoto ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <PlanetUserIcon size={28} color="#7FFFD4" />
                    </div>
                </div>

                {/* Username */}
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
                        {renderCosmicUsername(post?.username || post?.authorName || 'ANONYMOUS')}
                    </span>
                </div>
            </div>

            {/* Actions (Bottom Right) */}
            <div className="post-actions-container" style={{
                position: 'absolute',
                bottom: 'max(80px, calc(80px + env(safe-area-inset-bottom)))',
                right: '20px',
                zIndex: 10
            }}>
                <LikeButton postId={post?.id || postId} />
            </div>

            {/* Post Details Sidebar */}
            <PostDetailsSidebar
                isVisible={showDetailsSidebar}
                onClose={() => setShowDetailsSidebar(false)}
                post={post}
                items={images}
            />
        </div>
    );
};

export default React.memo(FilmStripPost);
