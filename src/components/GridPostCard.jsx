import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage } from 'react-icons/fa';
import SmartImage from './SmartImage';
import { getDerivedDate } from '@/core/utils/dates';
import SpaceCardBadge from './SpaceCardBadge';
import SoundTagBadge from './SoundTagBadge';
import { renderCosmicUsername } from '@/utils/usernameRenderer';

const GridPostCard = memo(({ post, contextPosts, selectedOrientation, selectedAspectRatio }) => {
    const navigate = useNavigate();

    // Helper to determine aspect ratio percentage
    const getPaddingBottom = () => {
        if (selectedAspectRatio) {
            const [w, h] = selectedAspectRatio.split(':').map(Number);
            return `${(h / w) * 100}%`;
        }
        if (selectedOrientation === 'landscape') return '56.25%'; // 16:9
        if (selectedOrientation === 'portrait') return '125%'; // 4:5
        if (selectedOrientation === 'square') return '100%'; // 1:1
        return '100%'; // Default square
    };

    const paddingBottom = getPaddingBottom();
    const isFiltered = selectedOrientation || selectedAspectRatio;

    // OPTIMIZATION: Prioritize thumbnail URL for grid views
    // Post structure from Firestore:
    // - images: [{url, thumbnailUrl, tinyUrl, ...}]
    // - imageUrls: [url1, url2, ...]
    // - thumbnailUrls: [thumb1, thumb2, ...]
    const displaySrc =
        post.thumbnailUrls?.[0] ||           // Root-level thumbnail array
        post.images?.[0]?.thumbnailUrl ||     // First image in images array
        post.images?.[0]?.url ||              // Full URL from images array
        post.imageUrls?.[0] ||                // Root-level URL array
        post.thumbnailUrl ||                  // Legacy: root thumbnailUrl
        post.items?.[0]?.thumbnailUrl ||      // Legacy: items array
        post.items?.[0]?.url ||               // Legacy: items URL
        post.imageUrl;                        // Legacy: single imageUrl

    // Use previewUrl or tinyUrl for the blur placeholder if available
    const placeholderSrc =
        post.images?.[0]?.tinyUrl ||
        post.images?.[0]?.thumbnailUrl ||
        post.previewUrl ||
        post.items?.[0]?.previewUrl;

    return (
        <div
            onClick={() => navigate(`/post/${post.id}`, {
                state: {
                    contextPosts: contextPosts,
                    initialIndex: contextPosts ? contextPosts.findIndex(p => p.id === post.id) : 0
                }
            })}
            style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '0',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                width: '100%',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
            onMouseEnter={e => {
                const pill = e.currentTarget.querySelector('.username-pill');
                if (pill && window.innerWidth >= 768) pill.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1.015)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                e.currentTarget.style.zIndex = '10';
                e.currentTarget.style.borderColor = 'rgba(127, 255, 212, 0.3)';
                e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={e => {
                const pill = e.currentTarget.querySelector('.username-pill');
                if (pill) pill.style.opacity = '0';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.zIndex = '1';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.filter = 'brightness(1)';
            }}
        >
            {/* Container with dynamic aspect ratio */}
            <div style={{
                width: '100%',
                paddingBottom: paddingBottom,
                background: '#111',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}>
                    {displaySrc ? (
                        <SmartImage
                            src={displaySrc}
                            previewSrc={placeholderSrc}
                            thumbnailSrc={placeholderSrc} // Use placeholder as thumbnail level
                            alt={post.title || ''}
                            aspectRatio="1/1"
                            objectFit="cover"
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                display: 'block'
                            }}
                            showDateStamp={post.showDateStamp}
                            dateStampStyle={post.dateStampStyle}
                            date={getDerivedDate(post)}
                            eager={false} // Ensure lazy loading
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaImage color="#333" size={40} />
                        </div>
                    )}
                </div>

                {/* Digital Goods Badges - Top Left */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    zIndex: 2,
                    pointerEvents: 'none'
                }}>
                    {post.spaceCardId && (
                        <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                            <SpaceCardBadge
                                type={post.isSpaceCardCreator ? 'creator' : 'owner'}
                                rarity={post.spaceCardRarity || 'Common'}
                            />
                        </div>
                    )}
                    {post.soundTagId && (
                        <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                            <SoundTagBadge
                                hasSound={true}
                                label="" // No text for grid view
                            />
                        </div>
                    )}
                </div>

                {/* Post Type Indicator */}
                {post.postType && post.postType !== 'standard' && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(127, 255, 212, 0.9)',
                            color: '#000',
                            padding: '4px 8px',
                            borderRadius: '5px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            zIndex: 2
                        }}
                    >
                        {post.postType === 'flipbook' && '🎞️'}
                        {post.postType === 'multi-layout' && '🖼️'}
                        {post.postType === 'pano-stack' && '🏔️'}
                    </div>
                )}

                {/* Username pill - hover on desktop, always visible on mobile */}
                <div
                    className="username-pill"
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: '500',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        opacity: window.innerWidth < 768 ? '1' : '0',
                        transition: 'opacity 0.2s',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        zIndex: 2
                    }}
                >
                    {renderCosmicUsername(post.username || post.authorName || post.displayName || 'Anonymous')}
                </div>
            </div>
        </div>
    );
});

export default GridPostCard;
