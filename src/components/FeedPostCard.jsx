import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaLink, FaQuoteLeft } from 'react-icons/fa';
import { fadeColor } from '@/core/utils/colorUtils';
import { FREE_COLOR_PACK } from '@/core/constants/colorPacks';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import { renderCosmicUsername } from '@/utils/usernameRenderer';

const BASE_WRITER_THEMES = {
    default: { id: 'default', name: 'Obsidian', bg: 'rgba(20, 20, 20, 0.6)', text: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' },
};

const WRITER_THEMES = { ...BASE_WRITER_THEMES };

// Hydrate from Color Packs
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

const TextPostCard = ({ post, theme, textColor, onClick, navigate, contextPosts, onResize }) => {
    const textBodyRef = React.useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    // Date formatter helper (duplicated for now to avoid props drilling complexity or external dep)
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date.seconds ? date.seconds * 1000 : date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Fallback content for older posts
    const plainTextContent = post.body || post.description || post.caption;

    React.useLayoutEffect(() => {
        if (textBodyRef.current) {
            // Check if scrollHeight is significantly larger than clientHeight
            const overflowing = textBodyRef.current.scrollHeight > textBodyRef.current.clientHeight + 5;
            setIsOverflowing(overflowing);
        }
    }, [post.bodyRichText, plainTextContent, post.title]);

    // Measure height when expanding and notify parent
    React.useLayoutEffect(() => {
        if (onResize && textBodyRef.current) {
            if (isExpanded) {
                // Add header + padding + link height estimation or measure container?
                // Measuring the text body scrollHeight isn't enough, we need total height.
                // We don't have a ref to the container here easily unless we add one.
                // Let's use internal ref for container? No, we need it on the root div.
                // Actually, let's grab the ref from the click event or add a ref to the root.
            }
        }
    }, [isExpanded, onResize]);

    // Root Ref
    const cardRef = React.useRef(null);

    React.useLayoutEffect(() => {
        if (onResize && isExpanded && cardRef.current) {
            // Delay slightly to let layout settle? Or simple measure?
            // scrollHeight should be correct if height is 'auto'.
            onResize(cardRef.current.scrollHeight);
        } else if (onResize && !isExpanded) {
            onResize(undefined); // Reset
        }
    }, [isExpanded, onResize]);

    return (
        <div
            ref={cardRef}
            onClick={(e) => {
                if (isOverflowing) {
                    setIsExpanded(!isExpanded);
                } else if (onClick) {
                    onClick();
                }
            }}
            style={{
                background: theme.bg,
                border: theme.border,
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: isOverflowing ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                color: textColor,
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
                // Strict height control: 100% matches the Grid Cell (Span 2) when collapsed
                height: isExpanded ? 'auto' : (onResize ? '100%' : 'auto'),
                maxHeight: isExpanded ? 'none' : (onResize ? 'none' : '320px'),
                minHeight: onResize ? '100%' : '160px',
                justifyContent: 'space-between',
                zIndex: isExpanded ? 10 : 1
            }}
            onMouseEnter={e => { if (isOverflowing || onClick) e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Header: Author & Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6, fontSize: '0.8rem', fontFamily: 'var(--font-family-mono)', flexShrink: 0 }}>
                <span>{renderCosmicUsername(post.authorName || post.username || 'Writer', textColor)}</span>
                <span>{formatDate(post.createdAt)}</span>
            </div>

            {/* Content Container - Flex grow to fill space */}
            <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {post.title && (
                    <h3 style={{
                        margin: '0 0 0.8rem 0',
                        fontSize: '1.4rem',
                        fontFamily: '"Rajdhani", sans-serif',
                        fontWeight: '700',
                        lineHeight: 1.2,
                        textTransform: 'uppercase',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        flexShrink: 0 // Title doesn't shrink
                    }}>
                        {post.title}
                    </h3>
                )}
                <div
                    ref={textBodyRef}
                    style={{
                        position: 'relative',
                        // If collapsed, use flex to fill available space (and cut off). If expanded, allow auto height.
                        flex: isExpanded ? 'none' : '1 1 auto',
                        height: isExpanded ? 'auto' : undefined,
                        overflow: 'hidden',
                        minHeight: 0, // Critical for flex child scrolling/clipping
                        maskImage: (!isExpanded && isOverflowing) ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none',
                        WebkitMaskImage: (!isExpanded && isOverflowing) ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none',
                        transition: 'all 0.3s ease',
                        width: '100%'
                    }}
                >
                    {post.bodyRichText ? (
                        <div style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                            <RichTextRenderer content={post.bodyRichText} fontStyle={post.fontStyle} />
                        </div>
                    ) : (
                        <div style={{
                            color: textColor,
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            fontFamily: 'var(--font-family-body)',
                            whiteSpace: 'pre-line',
                            opacity: 0.9,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word'
                        }}>
                            {plainTextContent}
                        </div>
                    )}
                </div>

                {!isExpanded && isOverflowing && (
                    <div style={{
                        position: 'absolute',
                        bottom: '1.5rem',
                        left: 0,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                    }}>
                        <span
                            style={{
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#fff',
                                padding: '0.4rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                display: 'inline-block',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                            }}
                        >
                            Read More
                        </span>
                    </div>
                )}
            </div>

            {/* Linked Post Indicator (Footer) */}
            {post.linkedPostIds && post.linkedPostIds.length > 0 && (
                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.8, color: theme.text === '#ffffff' ? '#7FFFD4' : 'inherit', flexShrink: 0 }}>
                    <FaLink size={12} />
                    <span>{post.linkedPostIds.length} Linked Ping{post.linkedPostIds.length > 1 ? 's' : ''}</span>
                </div>
            )}
        </div>
    );
};

const FeedPostCard = ({ post, contextPosts, onClick, onResize }) => {
    const navigate = useNavigate();

    // Format date
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date.seconds ? date.seconds * 1000 : date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // --- TEXT POST RENDERING ---
    // Determine if this is a text post (explicit type OR no images)
    const hasImages = (
        post.thumbnailUrls?.length > 0 ||
        (post.images && post.images.length > 0) ||
        (post.imageUrls && post.imageUrls.length > 0) ||
        !!post.imageUrl ||
        !!post.shopImageUrl
    );

    // Treat as Text Post if explicit type OR no images found (Legacy support)
    if (post.postType === 'text' || !hasImages) {
        const theme = WRITER_THEMES[post.writerTheme] || WRITER_THEMES.default;
        const textColor = post.writerTextColor || theme.text;

        return (
            <TextPostCard
                post={post}
                theme={theme}
                textColor={textColor}
                onClick={onClick}
                navigate={navigate}
                contextPosts={contextPosts}
                onResize={onResize}
            />
        );
    }

    // --- STANDARD IMAGE POST RENDERING ---
    return (
        <div
            onClick={() => {
                if (onClick) {
                    onClick();
                } else {
                    navigate(`/post/${post.id}`, {
                        state: {
                            contextPosts: contextPosts,
                            initialIndex: contextPosts ? contextPosts.findIndex(p => p.id === post.id) : 0
                        }
                    });
                }
            }}
            style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.2s',
                display: 'flex',
                gap: '1rem',
                padding: '0.75rem' // Added padding for better spacing
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Left: Image (thumbnail) */}
            <div style={{ width: '120px', height: '120px', flexShrink: 0, background: '#111', borderRadius: '8px', overflow: 'hidden' }}>
                {(post.thumbnailUrls?.[0] || post.images?.[0]?.thumbnailUrl || post.images?.[0]?.url || post.imageUrls?.[0] || post.imageUrl) ? (
                    <img
                        src={post.thumbnailUrls?.[0] || post.images?.[0]?.thumbnailUrl || post.images?.[0]?.url || post.imageUrls?.[0] || post.imageUrl}
                        alt=""
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaImage color="#333" /></div>
                )}
            </div>

            {/* Right: Metadata Panel (Group B Fix) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', overflow: 'hidden' }}>
                {/* 1. Username */}
                <span style={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-family-heading)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {post.authorName || post.username || 'Unknown Artist'}
                </span>

                {/* 2. Title & Date Row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>


                    {/* Date */}
                    <span style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-family-mono)'
                    }}>
                        {formatDate(post.createdAt)}
                    </span>
                </div>

                {/* 3. Title & Description Snippet */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.3rem' }}>
                    {post.title && (
                        <span style={{
                            color: '#fff',
                            fontSize: '1.0rem',
                            fontWeight: '600',
                            lineHeight: '1.2'
                        }}>
                            {post.title}
                        </span>
                    )}

                    {(post.description || post.caption) && (
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.85rem',
                            margin: '0',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: '1.4'
                        }}>
                            {post.description || post.caption}
                        </p>
                    )}
                </div>

                {/* 3. Tags (Max 3) */}
                {post.tags && post.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.2rem' }}>
                        {post.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} style={{
                                fontSize: '0.65rem',
                                color: '#7FFFD4',
                                background: 'rgba(127, 255, 212, 0.1)',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap'
                            }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* 4. EXIF (Only if present) */}
                {(post.camera || post.film) && (
                    <div style={{
                        marginTop: 'auto',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        fontSize: '0.7rem',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                        {post.camera && <span>📷 {post.camera}</span>}
                        {post.film && <span>🎞️ {post.film}</span>}
                    </div>
                )}
            </div>
        </div >
    );
};

export default FeedPostCard;
