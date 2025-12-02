import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/notificationService';

const NotificationBadge = ({ size = 32, showDot = true }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (currentUser) {
            loadUnreadCount();

            // Poll for updates every 30 seconds
            const interval = setInterval(loadUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    const loadUnreadCount = async () => {
        try {
            const count = await getUnreadCount(currentUser.uid);
            setUnreadCount(count);
        } catch (err) {
            console.error('Error loading unread count:', err);
        }
    };

    const handleClick = () => {
        navigate('/notifications');
    };

    if (!currentUser) return null;

    return (
        <div
            onClick={handleClick}
            style={{
                position: 'relative',
                cursor: 'pointer',
                width: `${size}px`,
                height: `${size}px`
            }}
        >
            {/* Profile Picture */}
            <img
                src={currentUser.photoURL || '/default-avatar.png'}
                alt={currentUser.displayName || 'User'}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: unreadCount > 0 ? '2px solid #7FFFD4' : '2px solid #333'
                }}
            />

            {/* Notification Dot */}
            {showDot && unreadCount > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '12px',
                        height: '12px',
                        background: '#00ff00',
                        borderRadius: '50%',
                        border: '2px solid #000',
                        boxShadow: '0 0 8px rgba(0, 255, 0, 0.8)',
                        animation: 'pulse 2s infinite'
                    }}
                />
            )}

            {/* Pulse Animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 0 8px rgba(0, 255, 0, 0.8);
                    }
                    50% {
                        box-shadow: 0 0 16px rgba(0, 255, 0, 1);
                    }
                }
            `}</style>
        </div>
    );
};

export default NotificationBadge;
