import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaClock } from 'react-icons/fa';

const ContestCard = ({ contest }) => {
    const navigate = useNavigate();
    const isActive = contest.status === 'active';

    return (
        <div
            onClick={() => navigate(`/contest/${contest.id}`)}
            style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.2s',
                display: 'flex',
                flexDirection: 'column'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ padding: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        background: isActive ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                        color: isActive ? 'var(--ice-mint)' : '#888',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        {isActive ? <FaClock size={10} /> : null}
                        {isActive ? 'ACTIVE' : 'ENDED'}
                    </div>
                    <FaTrophy style={{ color: 'gold', opacity: 0.8 }} />
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.2rem' }}>{contest.title}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa', lineHeight: 1.4 }}>{contest.description}</p>
            </div>
            {contest.prize && (
                <div style={{
                    padding: '1rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.9rem',
                    color: 'var(--ice-mint)'
                }}>
                    🏆 Prize: {contest.prize}
                </div>
            )}
        </div>
    );
};

export default ContestCard;
