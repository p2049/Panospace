import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getUserNotifications, markAsRead, markAllAsRead } from '@/services/notificationService';
import { FaBell, FaCheck, FaImage, FaBook, FaClock, FaTimes, FaCheckDouble, FaArrowLeft, FaStar } from 'react-icons/fa';

const Notifications = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'magazine'

    useEffect(() => {
        if (currentUser) {
            loadNotifications();
        }
    }, [currentUser]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('[Notifications] Loading notifications for user:', currentUser.uid);
            const notifs = await getUserNotifications(currentUser.uid);
            console.log('[Notifications] Loaded:', notifs?.length || 0, 'notifications');
            // Defensive: ensure we always have an array
            setNotifications(Array.isArray(notifs) ? notifs : []);
        } catch (err) {
            console.error('[Notifications] Error loading notifications:', err);
            // Check if it's an index error
            if (err.message?.includes('index')) {
                setError('A Firestore index is being built. Please try again in a few minutes, or check the Firebase Console for the index status.');
            } else {
                setError(err.message || 'Failed to load notifications');
            }
            setNotifications([]);
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

    if (error) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', padding: '2rem', textAlign: 'center' }}>
                <FaBell style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ff6b6b' }} />
                <h2 style={{ marginBottom: '1rem' }}>Error Loading Notifications</h2>
                <p style={{ color: '#888', marginBottom: '1.5rem', maxWidth: '400px' }}>{error}</p>
                <button
                    onClick={loadNotifications}
                    style={{
                        background: '#7FFFD4',
                        color: '#000',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(127, 255, 212, 0.1)',
                position: 'sticky',
                top: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(12px)',
                zIndex: 100,
                overflow: 'hidden'
            }}>
                {/* Animated Stars Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: 0
                }}>
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                width: Math.random() * 2 + 1 + 'px',
                                height: Math.random() * 2 + 1 + 'px',
                                background: '#7FFFD4',
                                borderRadius: '50%',
                                top: Math.random() * 100 + '%',
                                left: Math.random() * 100 + '%',
                                opacity: Math.random() * 0.5 + 0.3,
                                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 2}s`,
                                boxShadow: `0 0 ${Math.random() * 3 + 2}px rgba(127, 255, 212, 0.8)`,
                                willChange: 'opacity'
                            }}
                        />
                    ))}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: 'none',
                                    color: '#fff',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(127, 255, 212, 0.2)';
                                    e.currentTarget.style.color = '#7FFFD4';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.color = '#fff';
                                }}
                            >
                                <FaArrowLeft size={14} />
                            </button>
                            <h1 style={{
                                fontSize: '1.25rem',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontWeight: '600',
                                letterSpacing: '-0.02em'
                            }}>
                                Notifications
                                {unreadCount > 0 && (
                                    <span style={{
                                        background: '#7FFFD4',
                                        color: '#000',
                                        borderRadius: '12px',
                                        padding: '0.1rem 0.6rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        boxShadow: '0 0 10px rgba(127, 255, 212, 0.3)'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </h1>
                        </div>

                    </div>

                    {/* Filters & Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
                            {['all', 'unread'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        background: filter === f ? '#333' : 'transparent',
                                        border: 'none',
                                        color: filter === f ? '#fff' : '#888',
                                        padding: '0.4rem 1rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: filter === f ? '600' : '400',
                                        textTransform: 'capitalize',
                                        transition: 'all 0.2s ease',
                                        boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#7FFFD4',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.8rem',
                                    opacity: 0.8,
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                            >
                                <FaCheckDouble /> Mark All Read
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
                {filteredNotifications.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '6rem 2rem',
                        color: '#444',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <FaBell style={{ fontSize: '1.5rem', opacity: 0.3 }} />
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>No notifications to show</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                    background: notification.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(127, 255, 212, 0.04)',
                                    border: notification.read ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(127, 255, 212, 0.15)',
                                    borderRadius: '16px',
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    transform: 'scale(1)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = notification.read ? 'rgba(255, 255, 255, 0.04)' : 'rgba(127, 255, 212, 0.08)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = notification.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(127, 255, 212, 0.04)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    background: notification.read ? 'rgba(255, 255, 255, 0.05)' : 'rgba(127, 255, 212, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    fontSize: '1.1rem'
                                }}>
                                    {getIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        margin: '0 0 0.25rem 0',
                                        fontSize: '0.95rem',
                                        fontWeight: notification.read ? '500' : '600',
                                        color: notification.read ? '#aaa' : '#fff',
                                        lineHeight: '1.3'
                                    }}>
                                        {notification.title}
                                    </h3>
                                    <p style={{
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '0.85rem',
                                        color: '#888',
                                        lineHeight: '1.4',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {notification.message}
                                    </p>
                                    <span style={{ fontSize: '0.75rem', color: '#555', display: 'block' }}>
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
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '100%',
                                        paddingLeft: '0.5rem'
                                    }}>
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: '#7FFFD4',
                                            boxShadow: '0 0 8px #7FFFD4'
                                        }} />
                                    </div>
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
