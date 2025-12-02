import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/profile/${user.id}`)}
            style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.2s',
                textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: user.photoURL ? `url(${user.photoURL})` : '#333',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                margin: '0 auto 1rem auto'
            }} />
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1rem' }}>{user.displayName || 'Anonymous'}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>@{user.username || user.id}</p>
        </div>
    );
};

export default UserCard;
