import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useActivePost } from '@/context/ActivePostContext';
import { useBlock } from '@/hooks/useBlock';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import ContextOptionsSection from './ContextOptionsSection';
import ReportModal from './ReportModal';
import FeedControlBar from './feed/FeedControlBar';

import { useFeedStore } from '@/core/store/useFeedStore';
import { useCustomFeeds } from '@/hooks/useCustomFeeds';
import { useThemeStore } from '@/core/store/useThemeStore';
import { useTranslation } from 'react-i18next';
import { getUnreadCount } from '@/services/notificationService';
import { renderCosmicUsername } from '@/utils/usernameRenderer';
import PlanetUserIcon from './PlanetUserIcon';
import NotificationList from './NotificationList';
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
    FaBell,
    FaSatellite,
    FaGlobeAmericas,
    FaUserFriends,
    FaPalette,
    FaGlobe,
    FaShoppingBag,
    FaShoppingCart,
    FaTimes
} from 'react-icons/fa';
import {
    FiImage,
    FiMessageSquare,
    FiPlus,
    FiUsers,
    FiGlobe,
    FiLayers,
    FiEye,
    FiHash,
    FiMenu
} from 'react-icons/fi';
import { useCart } from '@/context/CartContext';

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
        setCustomFeedEnabled,
        setActiveCustomFeed,
        toggleCustomFeed,
        activeCustomFeedId,
        activeCustomFeedName,
        feedScope,
        setFeedScope,
        feedContentType,
        setFeedContentType,
        feedViewMode,
        setFeedViewMode,
        listFilter,
        setListFilter
    } = useFeedStore();
    const { setTheme, accentColor } = useThemeStore();

    // PANO BRAND COLORS (Matching FeedControlBar)
    const BRAND_COLORS = {
        mint: '#7FFFD4',
        blue: '#4CC9F0',
        ionBlue: '#1B82FF',
        pink: '#FF6B9D',
        lightPink: '#FFB7D5',
        purple: '#6C5CE7'
    };




    const [showHubPanel, setShowHubPanel] = useState(false); // New Hub Panel
    const [showFiltersPanel, setShowFiltersPanel] = useState(false); // New Filters Panel
    const [showCustomOrbitsPanel, setShowCustomOrbitsPanel] = useState(false); // Custom Orbits Panel
    const [showNotifications, setShowNotifications] = useState(false); // Notifications Popup State
    const [unreadNotifications, setUnreadNotifications] = useState(0); // Notification count
    const { feeds } = useCustomFeeds();
    const { cartCount, toggleCart } = useCart();
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
            if (isOpen && Date.now() - lastActivity > 10000) {
                setIsOpen(false);
            }
        };
        inactivityTimerRef.current = setInterval(checkInactivity, 1000);
        return () => clearInterval(inactivityTimerRef.current);
    }, [lastActivity, isOpen]);
    */

    // Close selector when clicking outside
    // Close selector when clicking outside
    useEffect(() => {
        if (!isOpen) {
            setShowHubPanel(false);
            setShowFiltersPanel(false);
            setShowCustomOrbitsPanel(false);
            setShowNotifications(false);
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
        // Toggle Hub, ensure others are closed
        if (!showHubPanel) {
            setShowFiltersPanel(false);
            setShowCustomOrbitsPanel(false);
        }
        setShowHubPanel(!showHubPanel);
        handleInteraction();
    };

    const toggleFiltersPanel = () => {
        // Toggle Filters, ensure others are closed
        if (!showFiltersPanel) {
            setShowHubPanel(false);
            setShowCustomOrbitsPanel(false);
        }
        setShowFiltersPanel(!showFiltersPanel);
        handleInteraction();
    };

    const toggleCustomOrbitsPanel = () => {
        // Toggle Custom Orbits, ensure others are closed
        if (!showCustomOrbitsPanel) {
            setShowHubPanel(false);
            setShowFiltersPanel(false);
        }
        setShowCustomOrbitsPanel(!showCustomOrbitsPanel);
        handleInteraction();
    };

    // The previous toggleCustomFeedsPanel function is removed as per instruction.



    // Close both when opening one? Logic handled in toggles.

    // Styling - CRITICAL: Ensure hamburger is ALWAYS visible and clickable
    const menuButtonStyle = {
        position: 'fixed',
        top: 'max(0.75rem, env(safe-area-inset-top))',
        right: '1rem',
        zIndex: 1000000, // Highest z-index in the app
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
        right: isOpen ? 0 : '-100vw', // Move completely off-screen
        width: '300px',
        maxWidth: '85vw',
        height: '100vh',
        background: 'rgba(5, 5, 5, 0.95)',
        backdropFilter: 'blur(20px)',
        borderLeft: isOpen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        boxShadow: isOpen ? '-10px 0 30px rgba(0,0,0,0.8)' : 'none', // Kill shadow when closed
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 80000,
        paddingTop: '55px',
        display: 'flex',
        flexDirection: 'column',
        visibility: isOpen ? 'visible' : 'hidden', // Extra safety
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
        justifyContent: 'flex-start',
        gap: '1rem'
    };

    const switchStyle = {
        position: 'fixed',
        top: 'max(0.75rem, env(safe-area-inset-top))',
        right: '4.5rem',
        zIndex: 80020,
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
            {/* Feed Control Bar - Slides out when menu is open */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 'max-content',
                paddingTop: 'max(8px, env(safe-area-inset-top))',
                background: 'rgba(0,0,0,0.85)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                zIndex: 80000,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: (isOpen && !isMobileVertical) ? 'auto' : 'none',
                opacity: (isOpen && !isMobileVertical) ? 1 : 0
            }}>
                <FeedControlBar />
            </div>

            {/* Left UI - PANOSPACE logo (rendered AFTER banner so it's ON TOP) - Matches Feed.jsx exactly */}
            {isOpen && (
                <div
                    onClick={() => {
                        const newMode = feedViewMode === 'image' ? 'list' : 'image';
                        setFeedViewMode(newMode);
                    }}
                    style={{
                        position: 'fixed',
                        top: 'max(0.5rem, env(safe-area-inset-top))',
                        left: '0.75rem',
                        zIndex: 90000,
                        pointerEvents: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '2px',
                        cursor: 'pointer',
                        background: 'transparent',
                        padding: '4px'
                    }}>
                    {/* Row 1: PANOSPACE Label */}
                    <span style={{
                        fontSize: '0.55rem',
                        color: accentColor,
                        letterSpacing: '0.1em',
                        fontWeight: '700',
                        fontFamily: "'Orbitron', sans-serif",
                        textShadow: `0 0 5px ${accentColor}`,
                        marginLeft: '2px',
                        marginTop: '3px'
                    }}>
                        PANOSPACE
                    </span>

                    {/* Row 2: Planet Icon + Mode Label */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        marginTop: '-8px'
                    }}>
                        <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                            <svg
                                width="32"
                                height="32"
                                viewBox="-5 -5 34 34"
                                style={{
                                    filter: `drop-shadow(0 0 8px ${accentColor})`,
                                    overflow: 'visible',
                                    transition: 'filter 0.2s ease'
                                }}
                            >
                                <defs>
                                    <radialGradient id="planetGradientNav" cx="40%" cy="40%">
                                        <stop offset="0%" style={{ stopColor: accentColor, stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: accentColor, stopOpacity: 0.6 }} />
                                    </radialGradient>
                                    <filter id="planetGlowNav" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />
                                <circle cx="12" cy="12" r="7" fill="url(#planetGradientNav)" opacity="0.95" filter="url(#planetGlowNav)" />
                                <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)" strokeDasharray="0,8,20,100" />
                                <circle cx="12" cy="12" r="7" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
                            </svg>
                        </div>

                        <span style={{
                            display: 'inline-block',
                            fontSize: '0.55rem',
                            background: 'repeating-linear-gradient(to bottom, rgba(127, 255, 212, 1) 0px, rgba(127, 255, 212, 1) 1px, rgba(127, 255, 212, 0.6) 1px, rgba(127, 255, 212, 0.6) 2px)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent',
                            filter: 'drop-shadow(0 0 2px rgba(127, 255, 212, 0.5))',
                            letterSpacing: '0.1em',
                            fontWeight: '700',
                            fontFamily: "'Orbitron', sans-serif",
                            marginLeft: '-3px'
                        }}>
                            {feedViewMode === 'image' ? 'VISUAL' : 'LIST'}
                        </span>
                    </div>
                </div>
            )}


            {/* Mobile Vertical: "Main Menu" Sidebar Return Bar (Futuristic Tab) */}
            {isMobileVertical && isOpen && (showHubPanel || showNotifications || showFiltersPanel || showCustomOrbitsPanel) && (
                <div
                    onClick={() => {
                        setShowHubPanel(false);
                        setShowNotifications(false);
                        setShowFiltersPanel(false);
                        setShowCustomOrbitsPanel(false);
                    }}
                    style={{
                        position: 'fixed',
                        top: '15vh', // Not full height, feels more like a "tab" or "file"
                        right: 'clamp(0px, 80vw, 300px)', // Anchor to left edge of panel (which is max 300px or 80vw)
                        bottom: 'auto',
                        height: '70vh',
                        width: '44px',
                        background: 'rgba(5, 5, 5, 0.9)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 110000, // Higher than all secondary panels
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderLeft: `1px solid ${accentColor}`,
                        borderTop: `1px solid ${accentColor}`,
                        borderBottom: `1px solid ${accentColor}`,
                        borderTopLeftRadius: '12px',
                        borderBottomLeftRadius: '12px',
                        boxShadow: `-4px 0 20px -5px ${accentColor}40`,
                        // Futuristic shape trim
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 15px)' // Slight cut handled by radius, but let's stick to CSS radius for smoothness
                    }}
                >
                    {/* Decorative Data Line */}
                    <div style={{
                        position: 'absolute',
                        left: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '2px',
                        height: '80%',
                        background: `linear-gradient(to bottom, transparent, ${accentColor}80, transparent)`
                    }} />

                    <div style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                        color: accentColor,
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        letterSpacing: '0.25em',
                        fontFamily: "'Orbitron', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        height: '100%',
                        justifyContent: 'center',
                        padding: '1rem 0',
                        textShadow: `0 0 5px ${accentColor}40`
                    }}>
                        {/* Animated Tech Arrow */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            transform: 'rotate(90deg)'
                        }}>
                            <div style={{ width: '4px', height: '4px', background: accentColor, borderRadius: '50%', boxShadow: `0 0 4px ${accentColor}` }} />
                            <FaArrowLeft size={14} />
                        </div>

                        <span>MAIN MENU</span>
                    </div>
                </div>
            )}



            {/* Hamburger Button */}
            <div
                className="mobile-nav-hamburger"
                style={{
                    position: 'fixed',
                    top: 'max(0.75rem, env(safe-area-inset-top))',
                    right: '1.25rem',
                    zIndex: 1000001,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    // Removed rotation to keep square shape stable
                    background: isOpen ? 'transparent' : 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: isOpen ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    width: '36px', // Slightly larger for touch target on square
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px', // Rounded Square
                    outline: 'none',
                    pointerEvents: 'auto',
                    touchAction: 'manipulation',
                    boxShadow: isOpen
                        ? 'none'
                        : '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Tiny Menu Label Below */}
                {!isOpen && (
                    <span style={{
                        position: 'absolute',
                        top: '32px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'inline-block',
                        fontSize: '0.55rem',
                        background: 'repeating-linear-gradient(to bottom, rgba(127, 255, 212, 1) 0px, rgba(127, 255, 212, 1) 1px, rgba(127, 255, 212, 0.6) 1px, rgba(127, 255, 212, 0.6) 2px)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent',
                        filter: 'drop-shadow(0 0 2px rgba(127, 255, 212, 0.5))',
                        letterSpacing: '0.1em',
                        fontWeight: '700',
                        fontFamily: "'Orbitron', sans-serif",
                        pointerEvents: 'none'
                    }}>
                        MENU
                    </span>
                )}

                {isOpen ? (
                    <FaTimes size={20} color={accentColor} style={{ filter: `drop-shadow(0 0 8px ${accentColor})` }} />
                ) : (
                    <div style={{
                        width: '8px',
                        height: '8px',
                        background: accentColor,
                        borderRadius: '50%',
                        boxShadow: `0 0 10px ${accentColor}`,
                        animation: 'pulse-glow 2s infinite'
                    }} />
                )}

                <style>{`
                    @keyframes pulse-glow {
                        0% { box-shadow: 0 0 4px ${accentColor}; opacity: 0.85; }
                        50% { box-shadow: 0 0 8px ${accentColor}; opacity: 1; }
                        100% { box-shadow: 0 0 4px ${accentColor}; opacity: 0.85; }
                    }
                `}</style>
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



            {/* Filters Panel (Dedicated Feed Options for Mobile Vertical) */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: (isOpen && showFiltersPanel)
                    ? (isMobileVertical ? '0' : '300px')
                    : (isMobileVertical ? '-100%' : '-320px'),
                width: isMobileVertical ? '300px' : '260px',
                maxWidth: isMobileVertical ? '85vw' : 'none',
                height: '100vh',
                background: '#050505',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isMobileVertical ? 100005 : 99999,
                paddingTop: '80px',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: isOpen ? 'auto' : 'none',
                overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '1.2rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    minHeight: '60px'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: '#fff',
                        letterSpacing: '0.15em',
                        fontWeight: '800',
                        textAlign: 'center'
                    }}>
                        ORBIT FILTERS
                    </h3>
                </div>

                {/* Filters Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* 1. Orbit Scope */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', fontWeight: '800' }}>ORBIT SCOPE</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {[
                                    { id: 'all', label: 'ALL', color: BRAND_COLORS.mint, icon: FiLayers },
                                    { id: 'following', label: 'ADDED', color: BRAND_COLORS.lightPink, icon: FiUsers },
                                    { id: 'global', label: 'GLOBAL', color: BRAND_COLORS.ionBlue, icon: FiGlobe }
                                ].map(option => {
                                    const active = feedScope === option.id;
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => setFeedScope(option.id)}
                                            style={{
                                                padding: '0.8rem 0.4rem',
                                                borderRadius: '10px',
                                                border: `1px solid ${active ? option.color : 'rgba(255,255,255,0.05)'}`,
                                                background: active ? `${option.color}15` : 'rgba(255,255,255,0.02)',
                                                color: active ? option.color : '#666',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: active ? `0 0 15px ${option.color}20` : 'none'
                                            }}
                                        >
                                            <Icon size={14} />
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Content Type */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', fontWeight: '800' }}>CONTENT TYPE</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {[
                                    { id: 'all', label: 'ALL', color: BRAND_COLORS.mint, icon: FiLayers },
                                    { id: 'art', label: 'ART', color: BRAND_COLORS.pink, icon: FiImage },
                                    { id: 'social', label: 'SOCIAL', color: BRAND_COLORS.mint, icon: FiMessageSquare }
                                ].map(option => {
                                    const active = feedContentType === option.id;
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                if (listFilter === 'text' && option.id !== 'social') setListFilter('all');
                                                setFeedContentType(option.id);
                                            }}
                                            style={{
                                                padding: '0.8rem 0.4rem',
                                                borderRadius: '10px',
                                                border: `1px solid ${active ? option.color : 'rgba(255,255,255,0.05)'}`,
                                                background: active ? `${option.color}15` : 'rgba(255,255,255,0.02)',
                                                color: active ? option.color : '#666',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: active ? `0 0 15px ${option.color}20` : 'none'
                                            }}
                                        >
                                            <Icon size={14} />
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. List Filter */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', fontWeight: '800' }}>LIST FILTER</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {[
                                    { id: 'all', label: 'ALL', color: BRAND_COLORS.mint, icon: FiLayers },
                                    { id: 'visual', label: 'VISUAL', color: BRAND_COLORS.blue, icon: FiEye },
                                    { id: 'text', label: 'PINGS', color: BRAND_COLORS.purple, icon: FiHash }
                                ].map(option => {
                                    const active = listFilter === option.id;
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                if (option.id === 'text' && feedContentType !== 'social') setFeedContentType('social');
                                                setListFilter(option.id);
                                            }}
                                            style={{
                                                padding: '0.8rem 0.4rem',
                                                borderRadius: '10px',
                                                border: `1px solid ${active ? option.color : 'rgba(255,255,255,0.05)'}`,
                                                background: active ? `${option.color}15` : 'rgba(255,255,255,0.02)',
                                                color: active ? option.color : '#666',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: active ? `0 0 15px ${option.color}20` : 'none'
                                            }}
                                        >
                                            <Icon size={14} />
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. Display Mode */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            marginTop: '0.5rem',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            paddingTop: '2rem'
                        }}>
                            <div style={{ fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', fontWeight: '800' }}>DISPLAY MODE</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[
                                    { id: 'image', label: 'VISUAL', icon: FiImage },
                                    { id: 'list', label: 'LIST', icon: FiMenu }
                                ].map(mode => {
                                    const active = feedViewMode === mode.id;
                                    const Icon = mode.icon;
                                    return (
                                        <button
                                            key={mode.id}
                                            onClick={() => setFeedViewMode(mode.id)}
                                            style={{
                                                flex: 1,
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: `1px solid ${active ? accentColor : 'rgba(255,255,255,0.05)'}`,
                                                background: active ? `${accentColor}10` : 'transparent',
                                                color: active ? '#fff' : '#444',
                                                fontSize: '0.8rem',
                                                fontWeight: '900',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.6rem',
                                                transition: 'all 0.3s ease',
                                                letterSpacing: '0.1em'
                                            }}
                                        >
                                            <Icon size={16} color={active ? accentColor : '#444'} />
                                            {mode.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Orbits Panel (Saved Custom Feeds) */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: (isOpen && showCustomOrbitsPanel)
                    ? (isMobileVertical ? '0' : '300px')
                    : (isMobileVertical ? '-100%' : '-320px'),
                width: isMobileVertical ? '300px' : '260px',
                maxWidth: isMobileVertical ? '85vw' : 'none',
                height: '100vh',
                background: '#050505',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isMobileVertical ? 100005 : 99999,
                paddingTop: '80px',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: isOpen ? 'auto' : 'none',
                overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '1.2rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center', // Centered like others
                    position: 'relative',
                    minHeight: '60px'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: '#fff',
                        letterSpacing: '0.15em',
                        fontWeight: '800',
                        textAlign: 'center'
                    }}>
                        CUSTOM ORBITS
                    </h3>
                </div>

                {/* Custom Orbits Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Add New Orbit */}
                        <button
                            onClick={() => {
                                handleNavClick('/custom-feeds/create');
                                setShowCustomOrbitsPanel(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: `1px dashed ${accentColor}40`,
                                background: 'rgba(255,255,255,0.03)',
                                color: accentColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.8rem',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FiPlus size={18} />
                            CREATE NEW ORBIT
                        </button>

                        {/* Saved Orbits List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ fontSize: '0.7rem', color: '#888', letterSpacing: '0.1em' }}>SAVED FREQUENCIES</div>
                            {feeds.length === 0 ? (
                                <div style={{
                                    padding: '2rem 1rem',
                                    textAlign: 'center',
                                    color: '#555',
                                    fontSize: '0.8rem',
                                    fontStyle: 'italic',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '8px'
                                }}>
                                    No custom frequencies detected
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {feeds.map(feed => {
                                        const isActive = customFeedEnabled && activeCustomFeedId === feed.id;
                                        return (
                                            <div
                                                key={feed.id}
                                                onClick={() => {
                                                    if (isActive) {
                                                        setCustomFeedEnabled(false);
                                                        setActiveCustomFeed(null, null);
                                                    } else {
                                                        setCustomFeedEnabled(true);
                                                        setActiveCustomFeed(feed.id, feed.name);
                                                    }
                                                }}
                                                style={{
                                                    padding: '1rem',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${isActive ? accentColor : 'rgba(255,255,255,0.1)'}`,
                                                    background: isActive ? `${accentColor}15` : 'rgba(255,255,255,0.03)',
                                                    color: isActive ? accentColor : '#fff',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '700',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                    <FaSatellite size={14} opacity={isActive ? 1 : 0.5} />
                                                    {feed.name}
                                                </div>
                                                {isActive && (
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: accentColor,
                                                        boxShadow: `0 0 10px ${accentColor}`
                                                    }} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hub Panel (New Secondary Panel) - Slides out to the left of the main drawer */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: (isOpen && showHubPanel)
                    ? (isMobileVertical ? '0' : '300px')
                    : (isMobileVertical ? '-100%' : '-320px'),
                width: isMobileVertical ? '300px' : '260px',
                maxWidth: isMobileVertical ? '80vw' : 'none',
                height: '100vh',
                background: '#050505', // Deep black for space theme base
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isMobileVertical ? 85000 : 80000,
                paddingTop: '80px',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: isOpen ? 'auto' : 'none',
                overflow: 'hidden' // Ensure banner doesn't spill
            }} onClick={(e) => e.stopPropagation()}>

                {/* VISUAL BANNER: Earth Horizon & Station - Absolute Top Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: isMobileVertical ? '100px' : '130px', // Adjusted to align with neighboring tab bottom
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#050505',
                    zIndex: 0,
                    borderBottom: '1px solid rgba(76, 201, 240, 0.2)'
                }}>
                    {/* Animated Stars */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        zIndex: 0
                    }}>
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    width: Math.random() * 2 + 1 + 'px',
                                    height: Math.random() * 2 + 1 + 'px',
                                    background: '#7FFFD4', // Brand Ice Mint
                                    borderRadius: '50%',
                                    top: Math.random() * 100 + '%',
                                    left: Math.random() * 100 + '%',
                                    opacity: Math.random() * 0.5 + 0.3,
                                    animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    boxShadow: `0 0 ${Math.random() * 3 + 2}px rgba(127, 255, 212, 0.6)`,
                                    willChange: 'opacity'
                                }}
                            />
                        ))}
                    </div>

                    {/* Space Station - Larger & Boldly Placed */}
                    <div style={{
                        position: 'absolute',
                        top: isMobileVertical ? '25px' : '40px', // Pushed down to interact/overlap with horizon
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2,
                        animation: 'ambient-float 6s ease-in-out infinite',
                        filter: 'drop-shadow(0 0 12px rgba(76, 201, 240, 0.5))' // Increased glow
                    }}>
                        {/* 
                            Diagonal Rotation: -30deg
                            Scale: Increased to 38px (approx 12-15% bump)
                            Why: To feel designed and intentional, not polite.
                        */}
                        <span style={{ display: 'inline-block', transform: 'rotate(-30deg)' }}>
                            <FaSatellite size={38} color="#7FFFD4" style={{ opacity: 0.95 }} />
                        </span>
                    </div>

                    {/* Earth Horizon Glow - Compressed Height, Brand Blue */}
                    <div style={{
                        position: 'absolute',
                        bottom: isMobileVertical ? '-380px' : '-350px', // Adjusted for new height
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '800px', // Wider arc
                        height: '400px',
                        background: '#000',
                        borderRadius: '50%',
                        zIndex: 1,
                        boxShadow: '0 -15px 50px rgba(76, 201, 240, 0.5), inset 0 20px 40px rgba(76, 201, 240, 0.1)',
                        borderTop: '2px solid rgba(76, 201, 240, 0.6)'
                    }} />

                    {/* Atmosphere Haze - Brand Blue */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '60px',
                        background: 'linear-gradient(to top, rgba(76, 201, 240, 0.15), transparent)',
                        zIndex: 3,
                        pointerEvents: 'none'
                    }} />
                </div>

                {/* Header Content - zIndex above banner */}
                <div style={{
                    position: 'absolute', // Absolute to anchor to top of panel
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 10,
                    padding: '1rem',
                    // marginBottom removed as it's not in flow
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        color: '#fff',
                        letterSpacing: '0.25em', // Increased spacing for authority
                        fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
                        textShadow: '0 0 10px rgba(127, 255, 212, 0.6)',
                        lineHeight: '1',
                        position: 'absolute',
                        top: '12px',
                        left: '16px',
                        zIndex: 15
                    }}>STATION</h3>
                </div>

                {/* Content List - zIndex above banner */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    padding: '0 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem',
                    height: '100%',
                    overflowY: 'auto',
                    marginTop: '60px' // Add top margin to clear the 130px banner (80px pad + 60px margin = 140px)
                }}>

                    {/* Decorative HUD Lines - Adjusted */}
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '0',
                        width: '100%',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(127, 255, 212, 0.3), transparent)',
                        pointerEvents: 'none'
                    }} />

                    {/* Cart - High Priority at Station */}
                    <button
                        onClick={() => handleNavClick('/cart')}
                        className="station-hologram-btn"
                        style={{
                            position: 'relative',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            border: `1px solid ${cartCount > 0 ? accentColor : 'rgba(127, 255, 212, 0.15)'}`,
                            background: 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))',
                            color: '#fff',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: cartCount > 0 ? `inset 0 0 15px ${accentColor}20` : 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = accentColor;
                            e.currentTarget.style.background = `linear-gradient(90deg, ${accentColor}10, rgba(10, 10, 10, 0.95))`;
                            e.currentTarget.style.boxShadow = `inset 4px 0 0 ${accentColor}, 0 0 15px ${accentColor}20`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = cartCount > 0 ? accentColor : 'rgba(127, 255, 212, 0.15)';
                            e.currentTarget.style.background = 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))';
                            e.currentTarget.style.boxShadow = cartCount > 0 ? `inset 0 0 15px ${accentColor}20` : 'inset 0 0 20px rgba(0, 0, 0, 0.8)';
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '4px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${accentColor}40`,
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '4px', height: '4px', borderTop: `1px solid ${accentColor}`, borderLeft: `1px solid ${accentColor}` }}></div>
                            <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '4px', height: '4px', borderBottom: `1px solid ${accentColor}`, borderRight: `1px solid ${accentColor}` }}></div>
                            <FaShoppingCart size={14} color={accentColor} style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }} />

                            {cartCount > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: accentColor,
                                    color: '#000',
                                    fontSize: '0.6rem',
                                    fontWeight: '900',
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 0 8px ${accentColor}`,
                                    fontFamily: "'Orbitron', sans-serif"
                                }}>
                                    {cartCount}
                                </div>
                            )}
                        </div>
                        <div>
                            <div style={{
                                fontWeight: '700',
                                fontFamily: "'Orbitron', sans-serif",
                                letterSpacing: '0.05em',
                                fontSize: '0.95rem',
                                textTransform: 'uppercase',
                                color: cartCount > 0 ? accentColor : '#fff'
                            }}>Cart</div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: '#aaa',
                                fontFamily: "'Rajdhani', sans-serif",
                                letterSpacing: '0.02em',
                                marginTop: '2px'
                            }}>{cartCount > 0 ? `${cartCount} items ready` : 'Inventory empty'}</div>
                        </div>
                    </button>

                    {/* Market */}
                    <button
                        onClick={() => handleNavClick('/marketplace')}
                        className="station-hologram-btn"
                        style={{
                            position: 'relative',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(127, 255, 212, 0.15)',
                            background: 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))',
                            color: '#fff',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = accentColor;
                            e.currentTarget.style.background = `linear-gradient(90deg, ${accentColor}10, rgba(10, 10, 10, 0.95))`;
                            e.currentTarget.style.boxShadow = `inset 4px 0 0 ${accentColor}, 0 0 15px ${accentColor}20`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(127, 255, 212, 0.15)';
                            e.currentTarget.style.background = 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))';
                            e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.8)';
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '4px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${accentColor}40`,
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '4px', height: '4px', borderTop: `1px solid ${accentColor}`, borderLeft: `1px solid ${accentColor}` }}></div>
                            <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '4px', height: '4px', borderBottom: `1px solid ${accentColor}`, borderRight: `1px solid ${accentColor}` }}></div>
                            <FaStore size={14} color={accentColor} style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }} />
                        </div>
                        <div>
                            <div style={{
                                fontWeight: '700',
                                fontFamily: "'Orbitron', sans-serif",
                                letterSpacing: '0.05em',
                                fontSize: '0.95rem',
                                textTransform: 'uppercase'
                            }}>Market</div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: '#aaa',
                                fontFamily: "'Rajdhani', sans-serif",
                                letterSpacing: '0.02em',
                                marginTop: '2px'
                            }}>Collect cards</div>
                        </div>
                    </button>

                    {/* Shop */}
                    <button
                        onClick={() => handleNavClick('/shop')}
                        className="station-hologram-btn"
                        style={{
                            position: 'relative',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(127, 255, 212, 0.15)',
                            background: 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))',
                            color: '#fff',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = accentColor;
                            e.currentTarget.style.background = `linear-gradient(90deg, ${accentColor}10, rgba(10, 10, 10, 0.95))`;
                            e.currentTarget.style.boxShadow = `inset 4px 0 0 ${accentColor}, 0 0 15px ${accentColor}20`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(127, 255, 212, 0.15)';
                            e.currentTarget.style.background = 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))';
                            e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.8)';
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '4px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${accentColor}40`,
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '4px', height: '4px', borderTop: `1px solid ${accentColor}`, borderLeft: `1px solid ${accentColor}` }}></div>
                            <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '4px', height: '4px', borderBottom: `1px solid ${accentColor}`, borderRight: `1px solid ${accentColor}` }}></div>
                            <FaShoppingBag size={14} color={accentColor} style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }} />
                        </div>
                        <div>
                            <div style={{
                                fontWeight: '700',
                                fontFamily: "'Orbitron', sans-serif",
                                letterSpacing: '0.05em',
                                fontSize: '0.95rem',
                                textTransform: 'uppercase'
                            }}>Shop</div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: '#aaa',
                                fontFamily: "'Rajdhani', sans-serif",
                                letterSpacing: '0.02em',
                                marginTop: '2px'
                            }}>Prints & gear</div>
                        </div>
                    </button>

                    {/* Calendar */}
                    <button
                        onClick={() => handleNavClick('/calendar')}
                        style={{
                            position: 'relative',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(127, 255, 212, 0.15)',
                            background: 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))',
                            color: '#fff',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = accentColor;
                            e.currentTarget.style.background = `linear-gradient(90deg, ${accentColor}10, rgba(10, 10, 10, 0.95))`;
                            e.currentTarget.style.boxShadow = `inset 4px 0 0 ${accentColor}, 0 0 15px ${accentColor}20`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(127, 255, 212, 0.15)';
                            e.currentTarget.style.background = 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))';
                            e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.8)';
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '4px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${accentColor}40`,
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '4px', height: '4px', borderTop: `1px solid ${accentColor}`, borderLeft: `1px solid ${accentColor}` }}></div>
                            <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '4px', height: '4px', borderBottom: `1px solid ${accentColor}`, borderRight: `1px solid ${accentColor}` }}></div>
                            <FaCalendarAlt size={14} color={accentColor} style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }} />
                        </div>
                        <div>
                            <div style={{
                                fontWeight: '700',
                                fontFamily: "'Orbitron', sans-serif",
                                letterSpacing: '0.05em',
                                fontSize: '0.95rem',
                                textTransform: 'uppercase'
                            }}>Calendar</div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: '#aaa',
                                fontFamily: "'Rajdhani', sans-serif",
                                letterSpacing: '0.02em',
                                marginTop: '2px'
                            }}>Events & launches</div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavClick('/events/all')}
                        style={{
                            position: 'relative',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(127, 255, 212, 0.15)',
                            background: 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))',
                            color: '#fff',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = accentColor;
                            e.currentTarget.style.background = `linear-gradient(90deg, ${accentColor}10, rgba(10, 10, 10, 0.95))`;
                            e.currentTarget.style.boxShadow = `inset 4px 0 0 ${accentColor}, 0 0 15px ${accentColor}20`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(127, 255, 212, 0.15)';
                            e.currentTarget.style.background = 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))';
                            e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.8)';
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '4px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${accentColor}40`,
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '4px', height: '4px', borderTop: `1px solid ${accentColor}`, borderLeft: `1px solid ${accentColor}` }}></div>
                            <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '4px', height: '4px', borderBottom: `1px solid ${accentColor}`, borderRight: `1px solid ${accentColor}` }}></div>
                            <FaTrophy size={14} color={accentColor} style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }} />
                        </div>
                        <div>
                            <div style={{
                                fontWeight: '700',
                                fontFamily: "'Orbitron', sans-serif",
                                letterSpacing: '0.05em',
                                fontSize: '0.95rem'
                            }}>Events</div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: '#aaa',
                                fontFamily: "'Rajdhani', sans-serif",
                                letterSpacing: '0.02em',
                                marginTop: '2px'
                            }}>Curated feeds & contests</div>
                        </div>
                    </button>


                    {/* Notifications */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifications(true);
                        }}
                        style={{
                            position: 'relative',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(127, 255, 212, 0.15)',
                            background: 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))',
                            color: '#fff',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = accentColor;
                            e.currentTarget.style.background = `linear-gradient(90deg, ${accentColor}10, rgba(10, 10, 10, 0.95))`;
                            e.currentTarget.style.boxShadow = `inset 4px 0 0 ${accentColor}, 0 0 15px ${accentColor}20`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(127, 255, 212, 0.15)';
                            e.currentTarget.style.background = 'linear-gradient(90deg, rgba(23, 23, 23, 0.9), rgba(10, 10, 10, 0.95))';
                            e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.8)';
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '4px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${accentColor}40`,
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '4px', height: '4px', borderTop: `1px solid ${accentColor}`, borderLeft: `1px solid ${accentColor}` }}></div>
                            <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '4px', height: '4px', borderBottom: `1px solid ${accentColor}`, borderRight: `1px solid ${accentColor}` }}></div>
                            <FaBell size={14} color={accentColor} style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontWeight: '700',
                                fontFamily: "'Orbitron', sans-serif",
                                letterSpacing: '0.05em',
                                fontSize: '0.95rem'
                            }}>Notifications</div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: '#aaa',
                                fontFamily: "'Rajdhani', sans-serif",
                                letterSpacing: '0.02em',
                                marginTop: '2px'
                            }}>Activity & updates</div>
                        </div>
                        {unreadNotifications > 0 && (
                            <span style={{
                                background: 'transparent',
                                color: '#00ff00',
                                fontSize: '0.7rem',
                                fontFamily: "'Orbitron', monospace",
                                fontWeight: 'bold',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid #00ff00',
                                minWidth: '32px',
                                textAlign: 'center',
                                boxShadow: '0 0 8px rgba(0, 255, 0, 0.4)',
                                textShadow: '0 0 5px #00ff00'
                            }}>
                                {unreadNotifications > 99 ? '99+' : unreadNotifications}
                            </span>
                        )}
                    </button>

                </div>

            </div>

            {/* Notifications Popup Panel (Drilled Down from Station) */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: (isOpen && showNotifications)
                    ? (isMobileVertical ? '0' : '300px')
                    : (isMobileVertical ? '-100%' : '-320px'),
                width: isMobileVertical ? '300px' : '260px',
                maxWidth: isMobileVertical ? '80vw' : 'none',
                height: '100vh',
                background: '#080808',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isMobileVertical ? 10006 : 10000, // Higher than Station
                paddingTop: '80px',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: isOpen ? 'auto' : 'none'
            }} onClick={(e) => e.stopPropagation()}>

                {/* Notifications Header with Back to Station */}
                <div style={{
                    padding: '1.2rem 1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <button
                        onClick={() => setShowNotifications(false)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: accentColor,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.8rem',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <FaArrowLeft size={10} />
                        BACK
                    </button>
                    <h3 style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: '#fff',
                        letterSpacing: '0.2em',
                        fontWeight: '800',
                        opacity: 0.9,
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none'
                    }}>
                        NOTIFICATIONS
                    </h3>
                    <div style={{ width: '60px' }}></div> {/* Spacer for symmetry */}
                </div>

                {/* Real Notification List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    <NotificationList
                        userId={currentUser?.uid}
                        onNotificationClick={() => {
                            // Optionally refresh unread count
                        }}
                    />

                    <button
                        onClick={() => {
                            handleNavClick('/notifications');
                            setShowNotifications(false);
                            setIsOpen(false);
                        }}
                        style={{
                            width: 'calc(100% - 1rem)',
                            margin: '1rem 0.5rem',
                            padding: '0.8rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            color: accentColor,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                        VIEW ALL ACTIVITY
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
                    flexDirection: 'row',
                    gap: '0.5rem',
                    alignItems: 'stretch',
                    pointerEvents: 'auto',
                    zIndex: 10002
                }}>

                    {/* Station Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleHubPanel();
                        }}
                        style={{
                            flex: 1.5,
                            padding: '0.6rem 0.5rem',
                            borderRadius: '8px',
                            border: `1px solid ${accentColor}`,
                            background: showHubPanel ? accentColor : 'rgba(0,0,0,0.6)',
                            color: showHubPanel ? '#000' : accentColor,
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                            height: '40px',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            opacity: 0.9
                        }}
                    >
                        <span style={{ display: 'inline-block', transform: 'rotate(-30deg)' }}>
                            <FaSatellite size={12} />
                        </span> STATION
                    </button>

                    {/* Custom Orbits Header Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleCustomOrbitsPanel();
                        }}
                        style={{
                            flex: 1,
                            padding: '0.6rem 0.5rem',
                            borderRadius: '8px',
                            border: `1px solid ${showCustomOrbitsPanel ? accentColor : 'rgba(255,255,255,0.2)'}`,
                            background: showCustomOrbitsPanel ? `${accentColor}20` : 'rgba(0,0,0,0.6)',
                            color: showCustomOrbitsPanel ? accentColor : '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                            height: '40px',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem'
                        }}
                    >
                        <FaSatellite size={10} /> ORBITS
                    </button>
                </div>

                {/* Main Navigation List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingTop: '0.5rem',
                    paddingRight: (isOpen && !isMobileVertical) ? '60px' : '0', // Clear hamburger in horizontal
                    marginTop: '0.25rem'
                }}>
                    <div onClick={() => handleNavClick('/')} style={{
                        ...navItemStyle,
                        color: location.pathname === '/' ? accentColor : '#fff',
                        background: location.pathname === '/' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                        borderLeft: location.pathname === '/' ? `2px solid ${accentColor}` : '2px solid transparent'
                    }}>
                        {location.pathname === '/' && (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}`, marginRight: '4px' }} />
                        )}
                        <FaHome color={location.pathname === '/' ? accentColor : '#aaa'} size={20} />
                        {t('nav.home')}
                    </div>

                    <div onClick={() => handleNavClick('/search')} style={{
                        ...navItemStyle,
                        color: location.pathname === '/search' ? accentColor : '#fff',
                        background: location.pathname === '/search' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                        borderLeft: location.pathname === '/search' ? `2px solid ${accentColor}` : '2px solid transparent'
                    }}>
                        {location.pathname === '/search' && (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}`, marginRight: '4px' }} />
                        )}
                        <FaSearch color={location.pathname === '/search' ? accentColor : '#aaa'} size={20} />
                        {t('nav.search')}
                    </div>

                    <div onClick={() => handleNavClick('/profile/me')} style={{
                        ...navItemStyle,
                        color: location.pathname.startsWith('/profile') ? accentColor : '#fff',
                        background: location.pathname.startsWith('/profile') ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                        borderLeft: location.pathname.startsWith('/profile') ? `2px solid ${accentColor}` : '2px solid transparent'
                    }}>
                        {location.pathname.startsWith('/profile') && (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}`, marginRight: '4px' }} />
                        )}
                        {currentUser?.photoURL ? (
                            <img
                                src={currentUser.photoURL}
                                alt="Profile"
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    objectFit: 'cover',
                                    border: `1px solid ${location.pathname.startsWith('/profile') ? accentColor : 'rgba(255,255,255,0.2)'}`
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '6px',
                                background: 'rgba(0,0,0,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px solid ${location.pathname.startsWith('/profile') ? accentColor : 'rgba(255,255,255,0.2)'}`
                            }}>
                                <PlanetUserIcon size={16} color={location.pathname.startsWith('/profile') ? accentColor : '#aaa'} />
                            </div>
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

                    <div onClick={() => handleNavClick('/create')} style={{
                        ...navItemStyle,
                        color: location.pathname === '/create' ? accentColor : '#fff',
                        background: location.pathname === '/create' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                        borderLeft: location.pathname === '/create' ? `2px solid ${accentColor}` : '2px solid transparent'
                    }}>
                        {location.pathname === '/create' && (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}`, marginRight: '4px' }} />
                        )}
                        <FaPlusSquare color={location.pathname === '/create' ? accentColor : '#aaa'} size={20} />
                        {t('nav.create')}
                    </div>

                    <div onClick={() => handleNavClick('/settings')} style={{
                        ...navItemStyle,
                        color: location.pathname === '/settings' ? accentColor : '#fff',
                        background: location.pathname === '/settings' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                        borderLeft: location.pathname === '/settings' ? `2px solid ${accentColor}` : '2px solid transparent'
                    }}>
                        {location.pathname === '/settings' && (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}`, marginRight: '4px' }} />
                        )}
                        <FaCog color={location.pathname === '/settings' ? accentColor : '#aaa'} size={20} />
                        {t('settings.title')}
                    </div>

                    {/* Feed Filters Option for Mobile Vertical (User Request) */}
                    {isMobileVertical && (
                        <>
                            <div onClick={toggleFiltersPanel} style={{
                                ...navItemStyle,
                                color: showFiltersPanel ? accentColor : '#fff',
                                background: showFiltersPanel ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                                borderLeft: showFiltersPanel ? `2px solid ${accentColor}` : '2px solid transparent',
                                marginTop: '1rem',
                                borderTop: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <FaFilter color={showFiltersPanel ? accentColor : '#aaa'} size={18} />
                                ORBIT FILTERS
                            </div>
                        </>
                    )}
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
