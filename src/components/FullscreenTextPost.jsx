import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import PostDetailsSidebar from './PostDetailsSidebar';
import PlanetUserIcon from './PlanetUserIcon';
import LikeButton from './LikeButton';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import { renderCosmicUsername } from '@/utils/usernameRenderer';
import { fadeColor } from '@/core/utils/colorUtils';
import { FREE_COLOR_PACK } from '@/core/constants/colorPacks';
import { logger } from '@/core/utils/logger';
import '@/styles/Post.css';

// Writer Themes (same as FeedPostCard)
const BASE_WRITER_THEMES = {
    default: { id: 'default', name: 'Obsidian', bg: 'rgba(20, 20, 20, 0.95)', text: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' },
};

const WRITER_THEMES = { ...BASE_WRITER_THEMES };

FREE_COLOR_PACK.filter(c => c.id !== 'brand-colors').forEach(colorOption => {
    WRITER_THEMES[colorOption.id] = {
        id: colorOption.id,
        name: colorOption.name,
        bg: colorOption.isGradient ? colorOption.color : fadeColor(colorOption.color, 0.20),
        text: colorOption.color,
        border: colorOption.isGradient ? 'none' : `1px solid ${fadeColor(colorOption.color, 0.4)}`,
        isGradient: colorOption.isGradient || false
    };
});

/**
 * FullscreenTextPost
 * 
 * Renders a text post in fullscreen mode with:
 * - Left-side info panel (PostDetailsSidebar) - opens by default
 * - Centered reading-focused text content
 * - Click-outside-to-exit behavior
 * - Same interaction model as image fullscreen
 */
const FullscreenTextPost = ({ post, containerRef }) => {
    const navigate = useNavigate();

    // Sidebar state - opens by default for text posts
    const [showDetailsSidebar, setShowDetailsSidebar] = useState(true);

    // Author photo state
    const [authorPhoto, setAuthorPhoto] = useState(
        post.authorPhotoUrl || post.userPhotoUrl || post.userAvatar || post.profileImage || null
    );

    // Content area ref for click-outside detection
    const contentAreaRef = useRef(null);

    // Fetch author photo if not available
    useEffect(() => {
        const fetchAuthorPhoto = async () => {
            if (authorPhoto && authorPhoto.startsWith('http')) return;

            const authorId = post.userId || post.authorId || post.uid;
            if (!authorId) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', authorId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.photoURL) {
                        setAuthorPhoto(data.photoURL);
                    }
                }
            } catch (err) {
                logger.warn("Failed to fetch author photo", err);
            }
        };
        fetchAuthorPhoto();
    }, [post.userId, post.authorId, post.uid, authorPhoto]);

    // Handle author click
    const handleAuthorClick = useCallback(() => {
        navigate(`/profile/${post.userId || post.authorId}`);
    }, [navigate, post.userId, post.authorId]);

    // Handle click outside content to close (navigate back)
    const handleBackgroundClick = useCallback((e) => {
        // Only trigger if clicking directly on the background, not the content
        if (contentAreaRef.current && !contentAreaRef.current.contains(e.target)) {
            navigate(-1);
        }
    }, [navigate]);

    // ESC key to exit
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                navigate(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    // Theme
    const theme = WRITER_THEMES[post.writerTheme] || WRITER_THEMES.default;
    const textColor = post.writerTextColor || theme.text;

    // Date formatter
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date.seconds ? date.seconds * 1000 : date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Text content fallback
    const plainTextContent = post.body || post.description || post.caption;

    return (
        <div
            ref={containerRef}
            className="post-ui--fullscreen-text"
            onClick={handleBackgroundClick}
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
                WebkitTouchCallout: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            data-testid="fullscreen-text-post"
        >
            {/* Centered Text Content Card */}
            <div
                ref={contentAreaRef}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '90%',
                    maxWidth: '700px',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    background: theme.bg,
                    border: theme.border,
                    borderRadius: '16px',
                    padding: '2rem',
                    boxSizing: 'border-box',
                    color: textColor,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                {/* Header: Author & Date - Minimal, since details are in sidebar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: 0.5,
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-family-mono)',
                    marginBottom: '1.5rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <span>{formatDate(post.createdAt)}</span>
                </div>

                {/* Title */}
                {post.title && (
                    <h1 style={{
                        margin: '0 0 1.5rem 0',
                        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                        fontFamily: '"Rajdhani", sans-serif',
                        fontWeight: '700',
                        lineHeight: 1.2,
                        textTransform: 'uppercase',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        color: textColor
                    }}>
                        {post.title}
                    </h1>
                )}

                {/* Body Content */}
                <div style={{
                    fontSize: '1.1rem',
                    lineHeight: '1.8',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word'
                }}>
                    {post.bodyRichText ? (
                        <RichTextRenderer content={post.bodyRichText} fontStyle={post.fontStyle} />
                    ) : (
                        <div style={{
                            color: textColor,
                            fontFamily: 'var(--font-family-body)',
                            whiteSpace: 'pre-line',
                            opacity: 0.95
                        }}>
                            {plainTextContent}
                        </div>
                    )}
                </div>
            </div>

            {/* Author Info Overlay - Bottom Left (mirrors StandardPost) */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 'max(80px, calc(80px + env(safe-area-inset-bottom)))',
                    left: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    zIndex: 20,
                    maxWidth: '300px'
                }}
            >
                <div
                    className="author-overlay"
                    style={{
                        display: 'flex',
                        alignItems: 'stretch',
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '8px',
                        width: 'fit-content',
                        border: '1px solid rgba(255,255,255,0.1)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Profile Picture Button */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAuthorClick();
                        }}
                        style={{
                            width: '40px',
                            height: '40px',
                            padding: '0',
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
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '0'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <PlanetUserIcon size={28} color="#7FFFD4" />
                        )}
                    </div>

                    {/* Username Button - Opens Sidebar */}
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
            </div>

            {/* Left Side Details Sidebar */}
            <PostDetailsSidebar
                isVisible={showDetailsSidebar}
                onClose={() => setShowDetailsSidebar(false)}
                post={post}
                items={[]} // Text posts have no images
                currentSlide={0}
            />

            {/* Like Button - Bottom Right (matches StandardPost) */}
            <div className="post-actions-container">
                <LikeButton postId={post.id} enableRatings={post.enableRatings} showCount={false} />
            </div>
        </div>
    );
};

export default React.memo(FullscreenTextPost);
