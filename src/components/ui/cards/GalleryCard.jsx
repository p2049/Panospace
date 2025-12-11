import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudioCard = ({ studio }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/gallery/${studio.id}`)}
            style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ aspectRatio: '16/9', background: '#111', position: 'relative' }}>
                <img
                    src={studio.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'}
                    alt={studio.title}
                    loading="lazy"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: studio.coverImage ? 1 : 0.6
                    }}
                />
                {!studio.coverImage && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)'
                    }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '2rem' }}>🖼️</span>
                    </div>
                )}
            </div>
            <div style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1rem' }}>{studio.title || 'Untitled Studio'}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>{studio.postCount || 0} posts</p>
            </div>
        </div>
    );
};

export default StudioCard;
