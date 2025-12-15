import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage } from 'react-icons/fa';

const FeedPostCard = ({ post, contextPosts }) => {
    const navigate = useNavigate();

    // Format date
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date.seconds ? date.seconds * 1000 : date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

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

                {/* 2. Date */}
                <span style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-family-mono)'
                }}>
                    {formatDate(post.createdAt)}
                </span>

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
