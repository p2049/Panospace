import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity } from 'react-icons/fa';

const MuseumCard = ({ museum }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/museums/${museum.id}`)}
            style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(127, 255, 212, 0.2)', // Greenish border for museums
                transition: 'transform 0.2s',
                position: 'relative'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ aspectRatio: '16/9', background: '#111', position: 'relative' }}>
                <img
                    src={museum.coverImage || 'https://images.unsplash.com/photo-1566054757965-8c4085344c96?q=80&w=2669&auto=format&fit=crop'} // Museum placeholder
                    alt={museum.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: museum.coverImage ? 1 : 0.6
                    }}
                />
                {!museum.coverImage && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)'
                    }}>
                        <FaUniversity style={{ color: 'rgba(127, 255, 212, 0.5)', fontSize: '3rem' }} />
                    </div>
                )}

                {/* Museum Badge */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(127, 255, 212, 0.4)',
                    color: '#7FFFD4',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <FaUniversity size={10} /> MUSEUM
                </div>
            </div>
            <div style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1rem' }}>{museum.title || 'Untitled Museum'}</h4>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#888' }}>
                    <span>{(museum.galleryIds?.length || 0)} Galleries</span>
                    <span>{(museum.profileIds?.length || 0)} Curators</span>
                </div>
            </div>
        </div>
    );
};

export default MuseumCard;
