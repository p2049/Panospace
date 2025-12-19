import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaCog, FaSignOutAlt, FaUser, FaBug } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { isDevBypassActive } from '@/core/utils/accessControl';

const SettingsModal = ({ isOpen, onClose, onLogout }) => {
    const navigate = useNavigate();
    const { customClaims } = useAuth();

    // Check for tester status
    const isTester = customClaims?.isTester || isDevBypassActive();

    if (!isOpen) return null;

    const handleEditProfile = () => {
        navigate('/edit-profile');
        onClose();
    };

    const handleLogout = async () => {
        await onLogout();
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
        }} onClick={onClose}>
            <div style={{
                background: '#111',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '400px',
                width: '100%',
                border: '1px solid #333',
                position: 'relative'
            }} onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                    }}
                >
                    <FaTimes />
                </button>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '2rem'
                }}>
                    <FaCog size={24} color="#fff" />
                    <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>Settings</h2>
                    {isTester && (
                        <span style={{
                            marginLeft: 'auto',
                            background: '#ff00ff',
                            color: '#fff',
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            letterSpacing: '1px'
                        }}>
                            TESTER MODE
                        </span>
                    )}
                </div>

                {/* Menu Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        onClick={handleEditProfile}
                        style={{
                            padding: '1rem',
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
                    >
                        <FaUser />
                        <span>Edit Profile</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '1rem',
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#ff4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)'}
                    >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                    </button>

                    {/* Developer Info Button (Only visible if isTester logic is active or user is manually flagged) */}
                    {isTester && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333', fontSize: '0.8rem', color: '#666' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}><FaBug style={{ marginRight: '0.5rem' }} /> Developer Access Active</p>
                            <button
                                onClick={() => alert("To enable tester mode on a real account, set the custom claim 'isTester' to true via Admin SDK.")}
                                style={{ background: 'transparent', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                            >
                                How to enable?
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
