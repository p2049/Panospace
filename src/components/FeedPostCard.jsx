import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage } from 'react-icons/fa';

const FeedPostCard = ({ post, contextPosts }) => {
    const navigate = useNavigate();

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
                gap: '1rem'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ width: '200px', height: '200px', flexShrink: 0, background: '#111' }}>
                {post.images?.[0]?.url || post.imageUrl ? (
                    <img src={post.images?.[0]?.url || post.imageUrl} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaImage color="#333" /></div>
                )}
            </div>
        </div >
    );
};

export default FeedPostCard;
