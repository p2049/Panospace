import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getUserNotifications, markAsRead, markAllAsRead } from '@/services/notificationService';
import { FaBell, FaCheck, FaImage, FaBook, FaClock, FaTimes, FaCheckDouble } from 'react-icons/fa';

const Notifications = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'magazine'

    useEffect(() => {
        if (currentUser) {
            loadNotifications();
        }
    }, [currentUser]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const notifs = await getUserNotifications(currentUser.uid);
            setNotifications(notifs);
        } catch (err) {
            console.error('Error loading notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            );
        }

        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead(currentUser.uid);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'magazine_submission':
            case 'submission_approved':
            case 'submission_rejected':
                return <FaImage style={{ color: '#7FFFD4' }} />;
            case 'magazine_published':
                return <FaBook style={{ color: '#7FFFD4' }} />;
            case 'magazine_deadline':
                return <FaClock style={{ color: '#ffaa00' }} />;
            default:
                return <FaBell style={{ color: '#7FFFD4' }} />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'magazine') return n.type?.startsWith('magazine') || n.type?.startsWith('submission');
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
                Loading notifications...
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid #333',
                position: 'sticky',
                top: 0,
                background: '#000',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FaBell /> Notifications
                        {unreadCount > 0 && (
                            <span style={{
                                background: '#7FFFD4',
                                color: '#000',
                                borderRadius: '12px',
                                padding: '0.25rem 0.75rem',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </h1>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            style={{
                                background: 'transparent',
                                border: '1px solid #333',
                                color: '#7FFFD4',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem'
                            }}
                        >
                            <FaCheckDouble /> Mark All Read
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'unread', 'magazine'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                background: filter === f ? 'rgba(127, 255, 212, 0.2)' : 'transparent',
                                border: filter === f ? '1px solid #7FFFD4' : '1px solid #333',
                                color: filter === f ? '#7FFFD4' : '#888',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                textTransform: 'capitalize'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
                {filteredNotifications.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        color: '#666'
                    }}>
                        <FaBell style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No notifications</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                    background: notification.read ? '#111' : 'rgba(127, 255, 212, 0.05)',
                                    border: notification.read ? '1px solid #333' : '1px solid rgba(127, 255, 212, 0.3)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = notification.read ? '#1a1a1a' : 'rgba(127, 255, 212, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = notification.read ? '#111' : 'rgba(127, 255, 212, 0.05)';
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'rgba(127, 255, 212, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {getIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        margin: '0 0 0.25rem 0',
                                        fontSize: '1rem',
                                        fontWeight: notification.read ? 'normal' : 'bold',
                                        color: notification.read ? '#ccc' : '#fff'
                                    }}>
                                        {notification.title}
                                    </h3>
                                    <p style={{
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '0.9rem',
                                        color: '#888',
                                        lineHeight: '1.4'
                                    }}>
                                        {notification.message}
                                    </p>
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                        {notification.createdAt?.toDate ?
                                            notification.createdAt.toDate().toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) :
                                            'Just now'
                                        }
                                    </span>
                                </div>

                                {/* Unread Indicator */}
                                {!notification.read && (
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: '#7FFFD4',
                                        flexShrink: 0,
                                        marginTop: '0.5rem'
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
