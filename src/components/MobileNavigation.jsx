import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useActivePost } from '@/context/ActivePostContext';
import { useBlock } from '@/hooks/useBlock';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import ContextOptionsSection from './ContextOptionsSection';
import ReportModal from './ReportModal';

import { useFeedStore } from '@/core/store/useFeedStore';
import { useCustomFeeds } from '@/hooks/useCustomFeeds';
import { useThemeStore } from '@/core/store/useThemeStore';
import { useTranslation } from 'react-i18next';
import { getUnreadCount } from '@/services/notificationService';
import { renderCosmicUsername } from '@/utils/usernameRenderer';
import {
    FaHome,
    FaSearch,
    FaPlusSquare,
    FaCalendarAlt,
    FaUserCircle,
    FaStore,
    FaCog,
    FaEdit,
    FaFilter,
    FaPlus,
    FaFire,
    FaTrophy,
    FaArrowLeft,
    FaBell
} from 'react-icons/fa';

// Mobile Navigation / Hamburger Menu
const MobileNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportConfig, setReportConfig] = useState({ type: 'post', id: null, title: '' });

    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { activePost } = useActivePost();
    const { blockUser } = useBlock();
    const { t } = useTranslation();

    // Store hooks
    const {
        currentFeed,
        toggleFeed,
        followingOnly,
        toggleFollowingOnly,
        customFeedEnabled,
        toggleCustomFeed,
        activeCustomFeedId,
        activeCustomFeedName
    } = useFeedStore();
    const { setTheme, accentColor } = useThemeStore();



    const [showCustomSelector, setShowCustomSelector] = useState(false);
    const [showHubPanel, setShowHubPanel] = useState(false); // New Hub Panel
    const [unreadNotifications, setUnreadNotifications] = useState(0); // Notification count
    const { feeds } = useCustomFeeds();
    const inactivityTimerRef = useRef(null);

    // Mobile Vertical Detection
    const [isMobileVertical, setIsMobileVertical] = useState(false);
    useEffect(() => {
        const checkLayout = () => {
            setIsMobileVertical(window.innerWidth <= 768);
        };
        checkLayout();
        window.addEventListener('resize', checkLayout);
        return () => window.removeEventListener('resize', checkLayout);
    }, []);

    // Load unread notification count
    useEffect(() => {
        if (!currentUser) return;

        const loadNotificationCount = async () => {
            try {
                const count = await getUnreadCount(currentUser.uid);
                setUnreadNotifications(count);
            } catch (err) {
                console.error('Error loading notification count:', err);
            }
        };

        loadNotificationCount();
        // Poll for updates every 30 seconds
        const interval = setInterval(loadNotificationCount, 30000);
        return () => clearInterval(interval);
    }, [currentUser]);

    // Auto-collapse logic REMOVED as per user request
    /*
    useEffect(() => {
        const checkInactivity = () => {
            // Close selector if inactive too
            if ((isOpen || showCustomSelector) && Date.now() - lastActivity > 10000) {
                setIsOpen(false);
                setShowCustomSelector(false);
            }
        };
        inactivityTimerRef.current = setInterval(checkInactivity, 1000);
        return () => clearInterval(inactivityTimerRef.current);
    }, [lastActivity, isOpen, showCustomSelector]);
    */

    // Close selector when clicking outside
    // Close selector when clicking outside
    useEffect(() => {
        if (!isOpen) {
            setShowCustomSelector(false);
            setShowHubPanel(false);
        }
    }, [isOpen]);

    // Determine Context
    let resolvedContext = null;
    let resolvedPostOwnerId = null;
    let resolvedProfileUserId = null;

    if (activePost) {
        resolvedContext = 'post';
        resolvedPostOwnerId = activePost.authorId;
    } else if (location.pathname.startsWith('/post/')) {
        resolvedContext = 'post';
        if (activePost) resolvedPostOwnerId = activePost.authorId;
    } else if (location.pathname.startsWith('/profile/')) {
        resolvedContext = 'profile';
        const parts = location.pathname.split('/');
        const idParam = parts[2];
        resolvedProfileUserId = (idParam === 'me' || !idParam) ? currentUser?.uid : idParam;
    }

    // Handlers
    const handleEditPost = () => {
        if (!activePost) return;
        setIsOpen(false);
        navigate(`/edit-post/${activePost.id}`);
    };

    const handleDeletePost = async () => {
        if (!activePost) return;
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await deleteDoc(doc(db, 'posts', activePost.id));
                setIsOpen(false);
                navigate('/');
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post.");
            }
        }
    };

    const handleReportPost = () => {
        if (!activePost) return;
        setReportConfig({ type: 'post', id: activePost.id, title: activePost.title || 'Post' });
        setShowReportModal(true);
    };

    const handleReportProfile = () => {
        if (!resolvedProfileUserId) return;
        setReportConfig({ type: 'user', id: resolvedProfileUserId, title: 'Profile' });
        setShowReportModal(true);
    };

    const handleBlockUser = async () => {
        if (resolvedContext === 'post' && activePost) {
            // Check if already blocked handled by hook, but explicit confirmation desired
            if (window.confirm(`Block ${activePost.authorName || 'user'}?`)) {
                await blockUser(activePost.authorId);
                setIsOpen(false);
                navigate('/');
            }
        } else if (resolvedContext === 'profile' && resolvedProfileUserId) {
            if (window.confirm(`Block this user?`)) {
                await blockUser(resolvedProfileUserId);
                setIsOpen(false);
                navigate('/');
            }
        }
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setIsOpen(false);
        alert("Link copied to clipboard");
    };

    const handleShareProfile = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: 'Panospace Profile',
                url: url
            }).catch(console.error);
        } else {
            handleCopyLink();
        }
    };

    const handleInteraction = () => {
        setLastActivity(Date.now());
    };

    const handleNavClick = (path) => {
        navigate(path);
        setIsOpen(false);
        handleInteraction();
    };

    const toggleHubPanel = () => {
        // Toggle Hub, ensure Custom Feeds is closed
        if (!showHubPanel) setShowCustomSelector(false);
        setShowHubPanel(!showHubPanel);
        handleInteraction();
    };

    const toggleCustomFeedsPanel = () => {
        // Toggle Custom Feeds, ensure Hub is closed
        if (!showCustomSelector) setShowHubPanel(false);
        setShowCustomSelector(!showCustomSelector);
        handleInteraction();
    };

    const handleCustomFeedSelect = (feedId, feedName) => {
        setActiveCustomFeed(feedId, feedName);
        setCustomFeedEnabled(true);
        setShowCustomSelector(false);
        setIsOpen(false);
    };

    const handleDisableCustomFeed = () => {
        setCustomFeedEnabled(false);
        setActiveCustomFeed(null, null);
        setShowCustomSelector(false);
        setIsOpen(false);
    };

    // Close both when opening one? Logic handled in toggles.

    // Styling - CRITICAL: Ensure hamburger is ALWAYS visible and clickable
    const menuButtonStyle = {
        position: 'fixed',
        top: 'max(0.75rem, env(safe-area-inset-top))',
        right: '1rem',
        zIndex: 99999, // Highest z-index in the app
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        color: accentColor,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        width: '44px',
        height: '44px',
        minWidth: '44px',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${accentColor}40`,
        borderRadius: '12px',
        outline: 'none',
        filter: `drop-shadow(0 0 6px ${accentColor}80)`,
        // CRITICAL: Ensure click events are always captured
        pointerEvents: 'auto',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Prevent being hidden by overflow
        isolation: 'isolate'
    };

    const drawerStyle = {
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : '-320px',
        width: '300px',
        maxWidth: '80vw',
        height: '100vh',
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.8)',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 9999,
        paddingTop: '80px', // Space for button
        display: 'flex',
        flexDirection: 'column',
    };

    const navItemStyle = {
        padding: '1.2rem 2rem',
        color: '#fff',
        fontSize: '1.1rem',
        fontFamily: 'var(--font-family-heading, sans-serif)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'background 0.2s, color 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem' // Space for icon
    };

    const switchStyle = {
        position: 'fixed',
        top: 'max(0.75rem, env(safe-area-inset-top))',
        right: '4.5rem',
        zIndex: 10001,
        display: isOpen ? 'flex' : 'none',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '22px',
        padding: '4px',
        border: '1px solid rgba(255,255,255,0.1)',
        height: '44px',
        cursor: 'pointer',
        overflow: 'hidden'
    };

    const toggleOptionStyle = (isActive, activeColor) => ({
        padding: '0 1rem',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '18px',
        fontSize: '0.85rem',
        fontWeight: '700',
        color: isActive ? '#000' : 'rgba(255,255,255,0.6)',
        background: isActive ? activeColor : 'transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        minWidth: '60px'
    });

    return (
        <>


            {/* Hamburger Button */}
            <div
                className="mobile-nav-hamburger"
                style={{
                    position: 'fixed',
                    top: 'max(0.75rem, env(safe-area-inset-top))',
                    right: '1rem',
                    zIndex: 99999,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    // Glass Effect
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    width: '44px',
                    height: '44px',
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    outline: 'none',
                    pointerEvents: 'auto',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    isolation: 'isolate',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
                onClick={() => { setIsOpen(!isOpen); handleInteraction(); }}
                role="button"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                tabIndex={0}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    const dot = e.currentTarget.querySelector('.menu-dot');
                    if (dot) {
                        dot.style.boxShadow = '0 0 12px var(--ice-mint)';
                        dot.style.opacity = '1';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    const dot = e.currentTarget.querySelector('.menu-dot');
                    if (dot) {
                        dot.style.boxShadow = '0 0 6px var(--ice-mint)';
                        dot.style.opacity = '0.9';
                    }
                }}
            >
                {isOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    // System Control Dot
                    <div
                        className="menu-dot"
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--ice-mint)',
                            boxShadow: '0 0 6px var(--ice-mint)',
                            opacity: 0.9,
                            transition: 'all 0.3s ease'
                        }}
                    />
                )}
            </div>

            {/* Menu Drawer */}
            <div style={drawerStyle} onClick={(e) => e.stopPropagation()}>

                {/* Left Pane - Sub Options (Feed / Context) */}
                <div style={{
                    width: '60px', // Narrow strip for sub-menu triggers or indicators could go here, 
                    // BUT user asked for "sub box to the left of the first box".
                    // Let's interpret: 
                    // The "Main Box" is the navigation list (Right side usually? Or are we splitting the drawer?)
                    // Actually, distinct "Boxes" implies a visual separation. 
                    // Let's try a layout where a "Sub Menu" slides out or sits to the left of the main menu items.

                    // RE-READING: "pull up a second menu box, sub box, to the left of the first box"
                    // Currently the drawer is on the RIGHT. 
                    // So "Left of the first box" means closer to the center of the screen? Or is the "First Box" the main nav?

                    // Interpretation: When "Feed Options" is clicked, instead of a dropdown *inside* the drawer or over it, 
                    // A WHOLE NEW PANEL appears to the left of the main drawer.
                    // Let's implement this "Sidecar" panel.
                }}>
                </div>

                {/* We need to render the "Sidecar" panel outside of the main drawer div but conditional on state */}
            </div>

            {/* Sidecar Panel for Feed Options */}
            <div style={{
                position: 'fixed',
                top: 0,
                // On vertical mobile (<=768), overlay the drawer (0). On desktop, side-by-side (300px)
                right: (isOpen && showCustomSelector)
                    ? (isMobileVertical ? '0' : '300px')
                    : (isMobileVertical ? '-100%' : '-320px'),
                width: isMobileVertical ? '100%' : '260px', // Full width on mobile
                height: '100vh',
                background: '#111111',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isMobileVertical ? 10005 : 9999, // Higher z-index on mobile to overlay main drawer
                paddingTop: '80px',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: isOpen ? 'auto' : 'none'
            }} onClick={(e) => e.stopPropagation()}>

                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    {isMobileVertical && (
                        <button
                            onClick={() => setShowCustomSelector(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: accentColor,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0
                            }}
                        >
                            <FaArrowLeft size={18} />
                        </button>
                    )}
                    <h3 style={{ margin: 0, fontSize: '0.9rem', color: accentColor, letterSpacing: '0.05em' }}>CUSTOM ORBITS</h3>
                </div>

                {/* App-Curated Feeds Section REMOVED from Custom Panel - Moved to Hub */}

                <div style={{ fontSize: '0.7rem', color: '#888', padding: '1rem 1rem 0.5rem 1rem' }}>SAVED ORBITS</div>

                {/* Feeds List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    padding: '0 1rem'
                }}>
                    {/* Default / Disable Option */}
                    <button
                        onClick={handleDisableCustomFeed}
                        style={{
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: !customFeedEnabled ? 'rgba(255,255,255,0.1)' : 'transparent',
                            color: !customFeedEnabled ? '#fff' : 'rgba(255,255,255,0.6)',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <span>Standard Orbit</span>
                        {!customFeedEnabled && <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor }} />}
                    </button>

                    {feeds.map(feed => (
                        <button
                            key={feed.id}
                            onClick={() => handleCustomFeedSelect(feed.id, feed.name)}
                            style={{
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: (customFeedEnabled && activeCustomFeedId === feed.id) ? accentColor : 'transparent',
                                color: (customFeedEnabled && activeCustomFeedId === feed.id) ? '#000' : '#fff',
                                textAlign: 'left',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontWeight: (customFeedEnabled && activeCustomFeedId === feed.id) ? 'bold' : 'normal',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <span>{feed.name}</span>
                            {(customFeedEnabled && activeCustomFeedId === feed.id) && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#000' }} />}
                        </button>
                    ))}

                    {feeds.length === 0 && (
                        <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                            No saved orbits
                        </div>
                    )}
                </div>

                <div style={{ padding: '1rem' }}>
                    <button
                        onClick={() => {
                            navigate('/custom-feeds/create');
                            setIsOpen(false);
                            setShowCustomSelector(false);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.8rem',
                            background: `${accentColor}20`,
                            border: 'none',
                            borderRadius: '8px',
                            color: accentColor,
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            width: '100%',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                    >
                        <FaPlus size={12} />
                        CREATE NEW
                    </button>
                </div>

            </div>

            {/* Hub Panel (New Secondary Panel) - Slides out to the left of the main drawer */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: (isOpen && showHubPanel)
                    ? (isMobileVertical ? '0' : '300px')
                    : (isMobileVertical ? '-100%' : '-320px'),
                width: isMobileVertical ? '100%' : '260px',
                height: '100vh',
                background: '#111111',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isMobileVertical ? 10005 : 9999,
                paddingTop: '80px',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: isOpen ? 'auto' : 'none'
            }} onClick={(e) => e.stopPropagation()}>

                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    {isMobileVertical && (
                        <button
                            onClick={() => setShowHubPanel(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: accentColor,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0
                            }}
                        >
                            <FaArrowLeft size={18} />
                        </button>
                    )}
                    <h3 style={{ margin: 0, fontSize: '0.9rem', color: accentColor, letterSpacing: '0.05em' }}>STATION</h3>
                </div>

                <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                    {/* Market */}
                    <button
                        onClick={() => handleNavClick('/marketplace')}
                        style={{
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)',
                            color: '#fff',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaStore size={14} color={accentColor} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Market</div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>Shop prints & gear</div>
                        </div>
                    </button>

                    {/* Calendar */}
                    <button
                        onClick={() => handleNavClick('/calendar')}
                        style={{
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)',
                            color: '#fff',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaCalendarAlt size={14} color={accentColor} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Calendar</div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>Events & launches</div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavClick('/events/all')}
                        style={{
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)',
                            color: '#fff',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaTrophy size={14} color={accentColor} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Events</div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>Curated feeds & contests</div>
                        </div>
                    </button>

                    {/* Notifications */}
                    <button
                        onClick={() => handleNavClick('/notifications')}
                        style={{
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)',
                            color: '#fff',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            transition: 'all 0.2s',
                            position: 'relative'
                        }}
                    >
                        <FaBell size={14} color={accentColor} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>Notifications</div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>Activity & updates</div>
                        </div>
                        {unreadNotifications > 0 && (
                            <span style={{
                                background: '#00ff00',
                                color: '#000',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                minWidth: '20px',
                                textAlign: 'center',
                                boxShadow: '0 0 8px rgba(0, 255, 0, 0.8)'
                            }}>
                                {unreadNotifications > 99 ? '99+' : unreadNotifications}
                            </span>
                        )}
                    </button>

                </div>

            </div>

            {/* Main Menu Drawer (Active) */}
            <div style={drawerStyle} onClick={(e) => e.stopPropagation()}>

                {/* Header Items */}
                <div style={{
                    position: 'absolute',
                    top: 'max(0.75rem, env(safe-area-inset-top))',
                    left: '1rem',
                    right: '4.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    alignItems: 'center',
                    pointerEvents: 'auto',
                    zIndex: 10002
                }}>

                    {/* Standard Feed Toggles - Visible when NOT custom feed enabled or always visible but disabled? */}
                    {/* User wants them "back where they were". Originally they were separate buttons in the main header of the drawer. */}

                    {/* Standard Feed Toggles - Grid Layout for alignment */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '0.4rem',
                        width: '100%'
                    }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFollowingOnly();
                                handleInteraction();
                            }}
                            style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: '8px',
                                border: `1px solid ${accentColor}`,
                                background: (followingOnly && !customFeedEnabled) ? accentColor : 'rgba(0,0,0,0.6)',
                                color: (followingOnly && !customFeedEnabled) ? '#000' : accentColor,
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                cursor: customFeedEnabled ? 'default' : 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                height: '32px',
                                backdropFilter: 'blur(10px)',
                                opacity: customFeedEnabled ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            disabled={customFeedEnabled}
                        >
                            {followingOnly ? 'ADDED' : 'GLOBAL'}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFeed();
                                handleInteraction();
                            }}
                            style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: '8px',
                                border: `1px solid ${accentColor}`,
                                background: (currentFeed === 'art' && !customFeedEnabled) ? accentColor : 'rgba(0,0,0,0.6)',
                                color: (currentFeed === 'art' && !customFeedEnabled) ? '#000' : accentColor,
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                cursor: customFeedEnabled ? 'default' : 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                height: '32px',
                                backdropFilter: 'blur(10px)',
                                opacity: customFeedEnabled ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            disabled={customFeedEnabled}
                        >
                            {currentFeed === 'art' ? 'ART' : 'SOCIAL'}
                        </button>

                        {/* Custom Feeds Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleCustomFeedsPanel();
                            }}
                            style={{
                                padding: '0.35rem 0.2rem', // Minimal padding
                                borderRadius: '8px',
                                border: `1px solid ${accentColor}`,
                                background: showCustomSelector ? accentColor : 'rgba(0,0,0,0.6)',
                                color: showCustomSelector ? '#000' : accentColor,
                                fontSize: '0.7rem', // Slightly smaller font
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                height: '32px',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.2rem'
                            }}
                        >
                            <FaFilter size={10} /> CUSTOM
                        </button>

                        {/* Station Button (Full Width) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleHubPanel();
                            }}
                            style={{
                                gridColumn: '1 / -1', // Full Width
                                padding: '0.35rem 0.5rem',
                                borderRadius: '8px',
                                border: `1px solid ${accentColor}`,
                                background: showHubPanel ? accentColor : 'rgba(0,0,0,0.6)',
                                color: showHubPanel ? '#000' : accentColor,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                height: '32px',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.4rem',
                                opacity: 0.9 // Reduce visual dominance
                            }}
                        >
                            <FaStore size={12} /> STATION
                        </button>

                    </div>
                </div>

                {/* Main Navigation List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingTop: '0.5rem',
                    marginTop: '1.5rem' // Ensure clearance from header buttons
                }}>
                    <div onClick={() => handleNavClick('/')} style={navItemStyle}>
                        <FaHome color="#7FFFD4" size={20} />
                        {t('nav.home')}
                    </div>

                    <div onClick={() => handleNavClick('/search')} style={navItemStyle}>
                        <FaSearch color="#7FFFD4" size={20} />
                        {t('nav.search')}
                    </div>

                    <div onClick={() => handleNavClick('/profile/me')} style={navItemStyle}>
                        {currentUser?.photoURL ? (
                            <img
                                src={currentUser.photoURL}
                                alt="Profile"
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    border: '1px solid #7FFFD4'
                                }}
                            />
                        ) : (
                            <FaUserCircle color="#7FFFD4" size={24} />
                        )}
                        <span style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '180px'
                        }}>
                            {renderCosmicUsername(currentUser?.displayName || 'My Profile', accentColor)}
                        </span>
                    </div>

                    <div onClick={() => handleNavClick('/create')} style={navItemStyle}>
                        <FaPlusSquare color="#7FFFD4" size={20} />
                        {t('nav.create')}
                    </div>

                    {/* Market and Calendar Removed from Main List (Moved to Hub) */}

                    <div onClick={() => handleNavClick('/settings')} style={navItemStyle}>
                        <FaCog color="#7FFFD4" size={20} />
                        {t('settings.title')}
                    </div>
                </div>
            </div >

            {/* Backdrop */}
            {
                isOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 9997, // Lowered behind panels
                            backdropFilter: 'blur(2px)'
                        }}
                        onClick={() => setIsOpen(false)}
                    />
                )
            }

            {/* Report Modal Integration */}
            {
                showReportModal && (
                    <ReportModal
                        isOpen={showReportModal}
                        targetType={reportConfig.type}
                        targetId={reportConfig.id}
                        targetTitle={reportConfig.title}
                        onClose={() => setShowReportModal(false)}
                    />
                )
            }
        </>
    );
};

export default MobileNavigation;
