import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import StarBackground from '../components/StarBackground';
import { useTranslation } from 'react-i18next';

const Credits = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000000',
            color: 'var(--text-primary, #d8fff1)',
            paddingBottom: '80px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <StarBackground starColor="#6effd8" transparent={true} />

            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(110, 255, 216, 0.2)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <button
                    onClick={() => navigate('/settings')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent, #6effd8)',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                        position: 'absolute',
                        left: '2rem'
                    }}
                >
                    <FaArrowLeft />
                </button>
                <h1 style={{
                    color: '#fff',
                    fontSize: '1.4rem',
                    fontWeight: '900',
                    textShadow: '0 2px 8px rgba(127, 255, 212, 0.4)',
                    fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', monospace",
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    background: 'linear-gradient(135deg, #7FFFD4, #00CED1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0
                }}>
                    PANOSPACE
                </h1>
            </div>

            {/* Content */}
            <div style={{
                padding: '2rem 1.5rem',
                maxWidth: '600px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem'
            }}>
                {/* Main Title */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80px',
                            height: '80px',
                            background: 'radial-gradient(circle, rgba(110,255,216,0.3) 0%, transparent 70%)',
                            borderRadius: '50%',
                            pointerEvents: 'none'
                        }} />
                        <img
                            src="/favicon.svg"
                            alt="Panospace"
                            style={{
                                width: '48px',
                                height: '48px',
                                position: 'relative',
                                zIndex: 1,
                                borderRadius: '50%'
                            }}
                        />
                    </div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--accent, #6effd8)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        margin: 0,
                        textShadow: '0 0 20px var(--accent-glow, rgba(110,255,216,0.35))'
                    }}>
                        {t('settings.credits')}
                    </h2>
                </div>

                {/* Created By Section */}
                <div style={{
                    background: 'var(--bg-card, #050808)',
                    borderRadius: '18px',
                    padding: '3rem',
                    border: '1px solid rgba(110, 255, 216, 0.15)',
                    boxShadow: '0 0 40px rgba(110, 255, 216, 0.03)',
                    textAlign: 'center'
                }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary, #6b7f78)',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        borderBottom: '1px solid rgba(110, 255, 216, 0.08)',
                        paddingBottom: '0.5rem',
                        display: 'inline-block'
                    }}>
                        Created by
                    </p>
                    <h3 style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: 'var(--accent, #6effd8)',
                        margin: '0 0 1.5rem 0',
                        letterSpacing: '0.05em'
                    }}>
                        Parker Adlington
                    </h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        color: 'var(--text-primary, #d8fff1)',
                        fontSize: '0.95rem'
                    }}>
                        <p style={{ margin: 0 }}>Founder & Chief Executive Officer</p>
                        <p style={{ margin: 0 }}>Product & Experience Architect</p>
                        <p style={{ margin: 0 }}>Lead Designer</p>
                        <p style={{ margin: 0 }}>Lead Engineer</p>
                    </div>
                </div>

                {/* Special Thanks Section */}
                <div style={{
                    background: 'var(--bg-card, #050808)',
                    borderRadius: '18px',
                    padding: '3rem',
                    border: '1px solid rgba(110, 255, 216, 0.15)',
                    boxShadow: '0 0 40px rgba(110, 255, 216, 0.03)',
                    textAlign: 'center'
                }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary, #6b7f78)',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        borderBottom: '1px solid rgba(110, 255, 216, 0.08)',
                        paddingBottom: '0.5rem',
                        display: 'inline-block'
                    }}>
                        Special Thanks
                    </p>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: 'var(--accent, #6effd8)',
                        margin: '0 0 1rem 0',
                        letterSpacing: '0.05em'
                    }}>
                        To Our Users
                    </h3>
                    <p style={{
                        margin: 0,
                        color: 'var(--text-primary, #d8fff1)',
                        fontSize: '0.95rem',
                        lineHeight: '1.6'
                    }}>
                        For having good taste.
                    </p>
                </div>

                {/* Copyright */}
                <div style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary, #6b7f78)',
                    fontSize: '0.85rem',
                    marginTop: '2rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid rgba(110, 255, 216, 0.1)'
                }}>
                    <p style={{ margin: 0 }}>© 2025 Panospace. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Credits;
