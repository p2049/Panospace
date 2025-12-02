import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlusSquare, FaUser, FaSearch } from 'react-icons/fa';

const BottomNav = () => {
    const location = useLocation();

    // Don't show on login/signup
    if (['/login', '/signup'].includes(location.pathname)) {
        return null;
    }

    const navStyle = {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'auto',
        minWidth: '250px',
        height: '60px',
        backgroundColor: 'rgba(20, 20, 20, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '30px',
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
        padding: '0 20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    };

    const linkStyle = {
        color: '#fff',
        fontSize: '1.5rem',
        opacity: 0.6,
        transition: 'all 0.2s ease'
    };

    const activeLinkStyle = {
        ...linkStyle,
        opacity: 1,
        transform: 'scale(1.1)',
        color: '#fff'
    };

    return (
        <nav style={navStyle}>
            <Link to="/" style={location.pathname === '/' ? activeLinkStyle : linkStyle}>
                <FaHome />
            </Link>
            <Link to="/search" style={location.pathname === '/search' ? activeLinkStyle : linkStyle}>
                <FaSearch />
            </Link>
            <Link to="/create" style={location.pathname === '/create' ? activeLinkStyle : linkStyle}>
                <FaPlusSquare />
            </Link>
            <Link to="/profile/me" style={location.pathname.startsWith('/profile') ? activeLinkStyle : linkStyle}>
                <FaUser />
            </Link>
        </nav>
    );
};

export default BottomNav;
