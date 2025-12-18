import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserNotifications, markAsRead } from '@/services/notificationService';
import { FaBell, FaCircle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const NotificationList = ({ userId, onNotificationClick }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;

        const loadNotifications = async () => {
            try {
                const data = await getUserNotifications(userId, 20);
                setNotifications(data);
            } catch (err) {
                console.error('Error loading notifications:', err);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [userId]);

    const handleItemClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? { ...n, read: true } : n
            ));
        }

        if (onNotificationClick) onNotificationClick();
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const handleUserClick = (e, actorId) => {
        e.stopPropagation();
        if (onNotificationClick) onNotificationClick();
        navigate(`/profile/${actorId}`);
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                Loading...
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
                <FaBell size={32} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <p>No new notifications</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {notifications.map((n) => (
                <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    style={{
                        padding: '1rem 0.75rem',
                        background: n.read ? 'transparent' : 'rgba(127, 255, 212, 0.03)',
                        borderLeft: n.read ? 'none' : '3px solid #7FFFD4',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        borderRadius: '8px',
                        marginBottom: '4px',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(127, 255, 212, 0.03)')}
                >
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: '0.85rem',
                            color: n.read ? '#aaa' : '#fff',
                            lineHeight: '1.4',
                            fontWeight: n.read ? '400' : '500'
                        }}>
                            {renderMessage(n, handleUserClick)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.4rem' }}>
                            {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                        </div>
                    </div>
                    {!n.read && (
                        <FaCircle size={8} style={{ color: '#7FFFD4', marginTop: '4px', flexShrink: 0 }} />
                    )}
                </div>
            ))}
        </div>
    );
};

const renderMessage = (notification, onUserClick) => {
    const { message, actorId, actorName } = notification;

    if (!actorId || !actorName || !message.includes(actorName)) {
        return message;
    }

    const parts = message.split(actorName);

    return (
        <>
            {parts[0]}
            <span
                onClick={(e) => onUserClick(e, actorId)}
                style={{
                    color: '#7FFFD4',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
                {actorName}
            </span>
            {parts[1]}
        </>
    );
};

export default NotificationList;
