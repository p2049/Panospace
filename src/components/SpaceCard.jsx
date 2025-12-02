import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket } from 'react-icons/fa';

const SpaceCard = ({ spacecard }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/spacecard/${spacecard.id}`)}
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--ice-mint)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
        >
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(127, 255, 212, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ice-mint)'
            }}>
                <FaRocket size={20} />
            </div>
            <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1.1rem' }}>{spacecard.title}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>{spacecard.description}</p>
            </div>
        </div>
    );
};

export default SpaceCard;
