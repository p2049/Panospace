// FILE: src/components/MobileNavigation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaUser, FaPlusSquare, FaCog, FaSignOutAlt, FaCalendar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const MobileNavigation = () => {
    const [leftOpen, setLeftOpen] = useState(false);
    const [rightOpen, setRightOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout } = useAuth();
    const inactivityTimerRef = useRef(null);

    // Auto-collapse logic
    useEffect(() => {
        const checkInactivity = () => {
            if (Date.now() - lastActivity > 3000) { // 3 seconds inactivity
                setLeftOpen(false);
                setRightOpen(false);
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
        setLeftOpen(false);
        setRightOpen(false);
        handleInteraction();
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            setRightOpen(false);
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
        padding: '1.5rem 0',
        cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: 0.7
    };

    const activeNavItemStyle = {
        ...navItemStyle,
        opacity: 1,
        color: '#fff',
        transform: 'scale(1.1)'
    };

    const panelStyle = (isOpen, side) => ({
        position: 'fixed',
        top: '50%',
        [side]: isOpen ? '0' : '-80px',
        transform: 'translateY(-50%)',
        width: '70px',
        height: 'auto',
        backgroundColor: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(15px)',
        borderRadius: side === 'left' ? '0 20px 20px 0' : '20px 0 0 20px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '1rem 0',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    });

    const edgePeekStyle = (side) => ({
        position: 'fixed',
        top: '50%',
        [side]: '0',
        transform: 'translateY(-50%)',
        width: '30px',
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        cursor: 'pointer',
        opacity: 0.6,
        transition: 'opacity 0.2s'
    });

    return (
        <>
            {/* Left Panel - Navigation */}
            <div
                style={panelStyle(leftOpen, 'left')}
                onClick={handleInteraction}
            >
                <div onClick={() => handleNavClick('/')} style={location.pathname === '/' ? activeNavItemStyle : navItemStyle}>
                    <FaHome size={24} />
                </div>
                <div onClick={() => handleNavClick('/search')} style={location.pathname === '/search' ? activeNavItemStyle : navItemStyle}>
                    <FaSearch size={24} />
                </div>
                <div onClick={() => handleNavClick('/profile/me')} style={location.pathname.startsWith('/profile') ? activeNavItemStyle : navItemStyle}>
                    <FaUser size={24} />
                </div>
                <div onClick={() => handleNavClick('/calendar')} style={location.pathname === '/calendar' ? activeNavItemStyle : navItemStyle}>
                    <FaCalendar size={24} />
                </div>
            </div>

            {/* Left Edge Peek */}
            {!leftOpen && (
                <div style={edgePeekStyle('left')} onClick={() => { setLeftOpen(true); setRightOpen(false); handleInteraction(); }}>
                    <div style={{ width: '4px', height: '40px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
                </div>
            )}

            {/* Right Panel - Actions (3 buttons only) */}
            <div
                style={panelStyle(rightOpen, 'right')}
                onClick={handleInteraction}
            >
                <div onClick={() => handleNavClick('/create')} style={location.pathname === '/create' ? activeNavItemStyle : navItemStyle}>
                    <FaPlusSquare size={24} />
                </div>
                <div onClick={() => handleNavClick('/edit-profile')} style={location.pathname === '/edit-profile' ? activeNavItemStyle : navItemStyle}>
                    <FaCog size={24} />
                </div>
                <div onClick={handleLogout} style={{ ...navItemStyle, color: '#ff4444' }}>
                    <FaSignOutAlt size={24} />
                </div>
            </div>

            {/* Right Edge Peek */}
            {!rightOpen && (
                <div style={edgePeekStyle('right')} onClick={() => { setRightOpen(true); setLeftOpen(false); handleInteraction(); }}>
                    <div style={{ width: '4px', height: '40px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
                </div>
            )}
        </>
    );
};

export default MobileNavigation;
