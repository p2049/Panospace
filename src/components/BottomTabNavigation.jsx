import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useThemeStore } from '@/core/store/useThemeStore';
import { FaHome, FaSearch, FaPlusSquare, FaUser } from 'react-icons/fa';

/**
 * BottomTabNavigation
 * 
 * A fixed bottom navigation bar for mobile devices.
 * Provides quick access to core app features:
 * - Home (Feed)
 * - Search
 * - Create Post
 * - Profile
 * 
 * Features:
 * - Safe-area-inset aware for notched devices
 * - Touch-friendly 56px tap targets
 * - Matches PanoSpace design tokens
 * - Only visible on mobile (hidden on desktop)
 */
const BottomTabNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { accentColor } = useThemeStore();

    // Define navigation items
    const navItems = [
        {
            id: 'home',
            path: '/',
            icon: FaHome,
            label: 'Home',
            matchPaths: ['/', '/feed']
        },
        {
            id: 'search',
            path: '/search',
            icon: FaSearch,
            label: 'Search',
            matchPaths: ['/search']
        },
        {
            id: 'create',
            path: '/create-post',
            icon: FaPlusSquare,
            label: 'Create',
            matchPaths: ['/create-post', '/create']
        },
        {
            id: 'profile',
            path: '/profile/me',
            icon: FaUser,
            label: 'Profile',
            matchPaths: ['/profile']
        }
    ];

    // Check if current path matches a nav item
    const isActive = (item) => {
        return item.matchPaths.some(p => {
            if (p === '/') return location.pathname === '/';
            return location.pathname.startsWith(p);
        });
    };

    // Handle navigation
    const handleNavClick = (path) => {
        navigate(path);
    };

    // Styles
    const containerStyle = {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 9990,
        // Hide on desktop
        '@media (min-width: 769px)': {
            display: 'none'
        }
    };

    const navItemStyle = (active) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: '56px',
        padding: '8px 0',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: active ? accentColor : 'rgba(255, 255, 255, 0.5)',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
    });

    const iconStyle = (active) => ({
        fontSize: '22px',
        marginBottom: '4px',
        transition: 'transform 0.2s ease',
        transform: active ? 'scale(1.1)' : 'scale(1)'
    });

    const labelStyle = (active) => ({
        fontSize: '10px',
        fontWeight: active ? '700' : '500',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-family-heading, Rajdhani, sans-serif)'
    });

    return (
        <>
            {/* CSS for desktop hiding */}
            <style>{`
                .bottom-tab-nav {
                    display: flex !important;
                }
                @media (min-width: 769px) {
                    .bottom-tab-nav {
                        display: none !important;
                    }
                }
            `}</style>

            <nav
                className="bottom-tab-nav"
                style={containerStyle}
                role="navigation"
                aria-label="Primary navigation"
            >
                {navItems.map(item => {
                    const active = isActive(item);
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.path)}
                            style={navItemStyle(active)}
                            aria-label={item.label}
                            aria-current={active ? 'page' : undefined}
                        >
                            <Icon style={iconStyle(active)} />
                            <span style={labelStyle(active)}>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </>
    );
};

export default BottomTabNavigation;
