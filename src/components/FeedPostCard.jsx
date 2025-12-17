import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaLink, FaQuoteLeft } from 'react-icons/fa';

const WRITER_THEMES = {
    default: { name: 'Default', bg: '#121212', text: '#ffffff', border: '1px solid #333' },
    paper: { name: 'Paper', bg: '#fdfbf7', text: '#2a2a2a', border: '1px solid #e0d0b0' },
    night: { name: 'Night', bg: '#050510', text: '#e0e0ff', border: '1px solid #2a2a40' },
    mono: { name: 'Mono', bg: '#ffffff', text: '#000000', border: '1px solid #ccc' },
    aurora: { name: 'Aurora', bg: '#002b36', text: '#eee8d5', border: '1px solid #073642' }
};

const FeedPostCard = ({ post, contextPosts, onClick }) => {
    const navigate = useNavigate();

    // Format date
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date.seconds ? date.seconds * 1000 : date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // --- TEXT POST RENDERING ---
    if (post.postType === 'text') {
        const theme = WRITER_THEMES[post.writerTheme] || WRITER_THEMES.default;
        return (
            <div
                onClick={() => {
                    if (onClick) {
                        onClick();
                    } else {
                        navigate(`/post/${post.id}`, { state: { contextPosts: contextPosts } });
                    }
                }}
                style={{
                    background: theme.bg,
                    border: theme.border,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    color: theme.text,
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
                {/* Header: Author & Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6, fontSize: '0.8rem', fontFamily: 'var(--font-family-mono)' }}>
                    <span>{post.authorName || post.username || 'Writer'}</span>
                    <span>{formatDate(post.createdAt)}</span>
                </div>

                {/* Content */}
                <div>
                    {post.title && (
                        <h3 style={{
                            margin: '0 0 0.8rem 0',
                            fontSize: '1.4rem',
                            fontFamily: '"Rajdhani", sans-serif',
                            fontWeight: '700',
                            lineHeight: 1.2,
                            textTransform: 'uppercase'
                        }}>
                            {post.title}
                        </h3>
                    )}
                    <div style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        fontFamily: 'var(--font-family-body)',
                        display: '-webkit-box',
                        WebkitLineClamp: 10, // Show fair amount, but truncate eventually
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        opacity: 0.9,
                        whiteSpace: 'pre-line'
                    }}>
                        {post.body}
                    </div>
                </div>

                {/* Linked Post Indicator */}
                {post.linkedPostIds && post.linkedPostIds.length > 0 && (
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.8, color: theme.text === '#ffffff' ? '#7FFFD4' : 'inherit' }}>
                        <FaLink size={12} />
                        <span>{post.linkedPostIds.length} Linked Post{post.linkedPostIds.length > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>
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
