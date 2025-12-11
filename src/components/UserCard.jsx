import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlanetUserIcon from '@/components/PlanetUserIcon';

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
                borderRadius: '20px', // Updated to match Profile (rounded square)
                overflow: 'hidden',
                background: '#333',
                margin: '0 auto 1rem auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <PlanetUserIcon size={56} color={user.profileTheme?.usernameColor || '#7FFFD4'} />
                )}
            </div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1rem' }}>
                {user.username || user.displayName || 'User'}
            </h4>
        </div>
    );
};

export default UserCard;
