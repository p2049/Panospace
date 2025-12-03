import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaUser, FaPlusSquare, FaCog, FaSignOutAlt, FaCalendar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import NotificationBadge from './NotificationBadge';

const MobileNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const inactivityTimerRef = useRef(null);

    // Auto-collapse logic
    useEffect(() => {
        const checkInactivity = () => {
            if (Date.now() - lastActivity > 4000) { // 4 seconds inactivity
                setIsOpen(false);
            }
        };

        inactivityTimerRef.current = setInterval(checkInactivity, 1000);

        return () => clearInterval(inactivityTimerRef.current);
    }, [lastActivity]);

    // Don't show on login/signup
    if (['/login', '/signup'].includes(location.pathname)) {
        return null;
    }

    const handleInteraction = () => {
        setLastActivity(Date.now());
    };

    const handleNavClick = (path) => {
        navigate(path);
        setIsOpen(false);
        handleInteraction();
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            setIsOpen(false);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const navItemStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        padding: '0.8rem 0',
        cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: 0.7,
        width: '100%'
    };

    const activeNavItemStyle = {
        ...navItemStyle,
        opacity: 1,
        color: 'var(--ice-mint, #7FFFD4)',
        transform: 'scale(1.1)'
    };

    const panelStyle = {
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: isOpen ? '0' : '-120px',
        width: '70px',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(127, 255, 212, 0.2)',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingRight: 'env(safe-area-inset-right)',
        boxShadow: '-5px 0 20px rgba(0, 0, 0, 0.5)',
        overflowY: 'auto',
        boxSizing: 'content-box'
    };

    const menuButtonStyle = {
        position: 'fixed',
        top: 'max(0.75rem, env(safe-area-inset-top))',
        right: '1rem',
        zIndex: 10000,
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        color: '#7FFFD4',
        background: 'transparent', // Removed circle background
        width: '40px', // Keep touch target size
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Removed borderRadius and backdropFilter
    };

    return (
        <>
            {/* Hamburger Menu Button */}
            <div
                style={menuButtonStyle}
                onClick={() => { setIsOpen(!isOpen); handleInteraction(); }}
                title="Menu"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.8))' }} // Slight shadow
                >
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </div>

            {/* Right Navigation Panel */}
            <div
                style={panelStyle}
                onClick={handleInteraction}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%', alignItems: 'center', margin: 'auto 0' }}>
                    <div onClick={() => handleNavClick('/')} style={location.pathname === '/' ? activeNavItemStyle : navItemStyle}>
                        <FaHome size={20} />
                    </div>
                    <div onClick={() => handleNavClick('/search')} style={location.pathname === '/search' ? activeNavItemStyle : navItemStyle}>
                        <FaSearch size={20} />
                    </div>
                    <div onClick={() => handleNavClick('/create')} style={location.pathname === '/create' ? activeNavItemStyle : navItemStyle}>
                        <FaPlusSquare size={20} />
                    </div>
                    <div onClick={() => handleNavClick('/profile')} style={location.pathname.startsWith('/profile') ? activeNavItemStyle : navItemStyle}>
                        <FaUser size={20} />
                    </div>

                    <div onClick={() => handleNavClick('/calendar')} style={location.pathname === '/calendar' ? activeNavItemStyle : navItemStyle}>
                        <FaCalendar size={20} />
                    </div>
                    <div onClick={() => handleNavClick('/settings')} style={location.pathname === '/settings' ? activeNavItemStyle : navItemStyle}>
                        <FaCog size={20} />
                    </div>

                    <div onClick={handleLogout} style={{ ...navItemStyle, color: '#ff4444', marginTop: 'auto', marginBottom: '1rem' }}>
                        <FaSignOutAlt size={20} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileNavigation;
