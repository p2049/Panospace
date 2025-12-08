import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useBlock } from '@/hooks/useBlock';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import ContextOptionsSection from './ContextOptionsSection';
import ReportModal from './ReportModal';

import { useFeedStore } from '@/core/store/useFeedStore';
import { useThemeStore } from '@/core/store/useThemeStore';
import { useTranslation } from 'react-i18next';

// Mobile Navigation / Hamburger Menu
const MobileNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportConfig, setReportConfig] = useState({ type: 'post', id: null, title: '' });

    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { activePost } = useUI();
    const { blockUser } = useBlock();
    const { t } = useTranslation();

    // Store hooks
    const { currentFeed, toggleFeed } = useFeedStore();
    const { setTheme, accentColor } = useThemeStore();



    const inactivityTimerRef = useRef(null);

    // Auto-collapse logic
    useEffect(() => {
        const checkInactivity = () => {
            if (isOpen && Date.now() - lastActivity > 10000) { // Increased to 10s for better UX with menus
                setIsOpen(false);
            }
        };
        inactivityTimerRef.current = setInterval(checkInactivity, 1000);
        return () => clearInterval(inactivityTimerRef.current);
    }, [lastActivity, isOpen]);

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

    // Styling
    const menuButtonStyle = {
        position: 'fixed',
        top: 'max(0.75rem, env(safe-area-inset-top))',
        right: '1rem',
        zIndex: 10000,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        color: accentColor, // Dynamic Theme Color
        background: 'transparent',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        outline: 'none',
        filter: `drop-shadow(0 0 6px ${accentColor}80)` // Tasteful glow
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
        transition: 'background 0.2s, color 0.2s'
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
            {/* Feed Switch - Visible when menu is open */}
            <div style={switchStyle} onClick={(e) => {
                e.stopPropagation();
                toggleFeed();
                handleInteraction();
            }}>
                <div style={toggleOptionStyle(currentFeed === 'art', '#7FFFD4')}>
                    Art
                </div>
                <div style={toggleOptionStyle(currentFeed === 'social', '#7FFFD4')}>
                    Social
                </div>
            </div>

            {/* Hamburger Button */}
            <div
                style={menuButtonStyle}
                onClick={() => { setIsOpen(!isOpen); handleInteraction(); }}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                )}
            </div>

            {/* Menu Drawer */}
            <div style={drawerStyle} onClick={(e) => e.stopPropagation()}>
                {/* Context Aware Options */}
                <ContextOptionsSection
                    currentContext={resolvedContext}
                    postOwnerId={resolvedPostOwnerId}
                    profileUserId={resolvedProfileUserId}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                    onReportPost={handleReportPost}
                    onReportProfile={handleReportProfile}
                    onBlockUser={handleBlockUser}
                    onCopyLink={handleCopyLink}
                    onShareProfile={handleShareProfile}
                />

                {/* Main Navigation */}
                <div onClick={() => handleNavClick('/')} style={navItemStyle}>
                    {t('nav.home')}
                </div>

                <div onClick={() => handleNavClick('/search')} style={navItemStyle}>
                    {t('nav.search')}
                </div>

                <div onClick={() => handleNavClick('/create-post')} style={navItemStyle}>
                    {t('nav.create')}
                </div>

                <div onClick={() => handleNavClick('/calendar')} style={navItemStyle}>
                    {t('nav.calendar')}
                </div>

                {(resolvedContext === 'profile' && resolvedProfileUserId === currentUser?.uid) ? (
                    <div onClick={() => handleNavClick('/edit-profile')} style={navItemStyle}>
                        {t('settings.editProfile')}
                    </div>
                ) : (
                    <div onClick={() => handleNavClick('/profile/me')} style={navItemStyle}>
                        {t('settings.account')}
                    </div>
                )}

                <div onClick={() => handleNavClick('/marketplace')} style={navItemStyle}>
                    {t('nav.market')}
                </div>

                <div onClick={() => handleNavClick('/settings')} style={navItemStyle}>
                    {t('settings.title')}
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 9998,
                        backdropFilter: 'blur(2px)'
                    }}
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Report Modal Integration */}
            {showReportModal && (
                <ReportModal
                    isOpen={showReportModal}
                    targetType={reportConfig.type}
                    targetId={reportConfig.id}
                    targetTitle={reportConfig.title}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </>
    );
};

export default MobileNavigation;
