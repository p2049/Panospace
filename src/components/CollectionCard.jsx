import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLayerGroup } from 'react-icons/fa';

const CollectionCard = ({ collection }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/collection/${collection.id}`)}
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
            <div style={{ aspectRatio: '1/1', background: '#111', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {collection.coverImage ? (
                    <img
                        src={collection.coverImage}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <FaLayerGroup size={32} color="#444" />
                )}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1rem',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
                }}>
                    <h4 style={{ margin: '0', color: '#fff', fontSize: '1.1rem' }}>{collection.title || 'Untitled Collection'}</h4>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{collection.itemCount || 0} items</p>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CollectionCard);
