import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCamera, FaInfoCircle } from 'react-icons/fa';
import PostDetailsSidebar from './PostDetailsSidebar';
import InstantPhotoFrame from './InstantPhotoFrame';
import SmartImage from './SmartImage';
import DateStampOverlay from './DateStampOverlay';
import LikeButton from './LikeButton';
import PlanetUserIcon from './PlanetUserIcon';
import SpaceCardBadge from './SpaceCardBadge';
import SoundTagBadge from './SoundTagBadge';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logger } from '@/core/utils/logger';
import { renderCosmicUsername } from '@/utils/usernameRenderer';
import '@/styles/instant-photo-post.css';

/**
 * InstantPhotoPost
 * 
 * Renders a horizontally scrollable strip of instant photos.
 * Fits ~2.5 photos on screen. Includes scrollbar and standard overlays.
 */
const InstantPhotoPost = ({ post, images = [], uiOverlays = null, priority = 'normal' }) => {
    const navigate = useNavigate();
    const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
    const [authorPhoto, setAuthorPhoto] = useState(
        post?.authorPhotoUrl || post?.userPhotoUrl || post?.userAvatar || post?.profileImage || null
    );

    // Fetch author photo if missing
    useEffect(() => {
        const fetchAuthorPhoto = async () => {
            if (authorPhoto && authorPhoto.startsWith('http')) return;
            const authorId = post?.userId || post?.authorId || post?.uid;
            if (!authorId) return;

            try {
                const userDocRef = doc(db, 'users', authorId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists() && userDocSnap.data().photoURL) {
                    setAuthorPhoto(userDocSnap.data().photoURL);
                }
            } catch (err) {
                logger.warn("Error fetching author photo", err);
            }
        };
        fetchAuthorPhoto();
    }, [post]);

    const handleAuthorClick = (e) => {
        e.stopPropagation();
        const authorId = post?.userId || post?.authorId || post?.uid;
        if (authorId) navigate(`/profile/${authorId}`);
    };

    return (
        <div
            className="post-ui--instant"
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                backgroundColor: (post?.atmosphereBackground === 'cinematic-gradient')
                    ? 'transparent' // We'll set the gradient on the container or a wrapper
                    : '#000',
                background: (post?.atmosphereBackground === 'cinematic-gradient')
                    ? `radial-gradient(circle at center, ${post.gradientColor || '#1a4f3d'} 0%, #000000 90%)`
                    : '#000',
                overflow: 'hidden'
            }}>
            {/* Scroll Container - Dedicated Class for Instant Photos */}
            <div
                className={`instant-photo-scroll-container ${images.length <= 3 ? 'instant-compact' : ''} ${images.length === 1 ? 'instant-single' : ''}`}
                style={{
                    // Style mostly handled by CSS now, but keeping overrides if needed
                    height: '100%',
                    width: '100%',
                }}>

                {images.map((item, index) => {
                    const url = item.url || item;
                    const isUrl = typeof url === 'string' && (url.startsWith('http') || url.startsWith('blob:'));
                    const instantStyle = uiOverlays?.instantPhotoStyle || 'thick';

                    return (
                        <div
                            key={index}
                            className={`instant-photo-frame-wrapper ${instantStyle === 'thin' ? 'thin' : ''}`}
                            style={{
                                height: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <InstantPhotoFrame
                                quartzDate={uiOverlays?.quartzDate}
                                style={uiOverlays?.instantPhotoStyle || 'thick'} // Default to 'thick' for legacy posts
                            >
                                {isUrl ? (
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        <SmartImage
                                            src={url}
                                            alt={`Slide ${index + 1}`}
                                            priority={index === 0 ? priority : 'low'}
                                            objectFit="cover"
                                            className="polaroid-image"
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        background: '#111',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        {item.content || item.text || 'VOID'}
                                    </div>
                                )}
                            </InstantPhotoFrame>
                        </div>
                    );
                })}

                {/* Spacer at end */}
                <div style={{ flex: '0 0 2rem' }}></div>
            </div>

            {/* --- OVERLAYS --- */}

            {/* Badges (Top Right) */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 20,
                alignItems: 'flex-end',
                pointerEvents: 'none' // Allow clicks through
            }}>
                <div style={{ pointerEvents: 'auto' }}>
                    {post?.spaceCardId && (
                        <SpaceCardBadge
                            type={post.isSpaceCardCreator ? 'creator' : 'owner'}
                            rarity={post.spaceCardRarity || 'Common'}
                        />
                    )}
                </div>
                <div style={{ pointerEvents: 'auto' }}>
                    {post?.soundTagId && (
                        <SoundTagBadge
                            hasSound={true}
                            label={post.soundTagTitle || 'SoundTag'}
                        />
                    )}
                </div>
            </div>

            {/* Title Overlay */}
            {post?.title && (
                <div className="post-title-overlay">
                    <h2 className="post-title-text">{renderCosmicUsername(post.title)}</h2>
                </div>
            )}

            {/* Author Info (Bottom Left) */}
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
            <div className="post-actions-container">
                {/* Photo count removed */}
                <LikeButton postId={post?.id} />
            </div>
            {/* Sidebar */}
            <PostDetailsSidebar
                isVisible={showDetailsSidebar}
                onClose={() => setShowDetailsSidebar(false)}
                post={post}
                items={images}
            />

        </div>
    );
};

export default memo(InstantPhotoPost);
