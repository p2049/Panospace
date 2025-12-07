import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const Credits = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-darker, #020404)',
            color: 'var(--text-primary, #d8fff1)',
            paddingBottom: '80px'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(110, 255, 216, 0.2)',
                position: 'sticky',
                top: 0,
                zIndex: 100
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
                        padding: 0
                    }}
                >
                    <FaArrowLeft />
                </button>
                <h1 style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'var(--accent, #6effd8)',
                    fontFamily: 'var(--font-family-heading)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    margin: 0
                }}>Credits</h1>
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
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--accent, #6effd8)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        margin: 0,
                        textShadow: '0 0 20px var(--accent-glow, rgba(110,255,216,0.35))'
                    }}>
                        Credits & Acknowledgements
                    </h2>
                </div>

                {/* Created By Section */}
                <div style={{
                    background: 'var(--bg-card, #050808)',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid rgba(110, 255, 216, 0.15)',
                    textAlign: 'center'
                }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary, #6b7f78)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '1rem'
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
                        gap: '0.5rem',
                        color: 'var(--text-primary, #d8fff1)',
                        fontSize: '0.95rem'
                    }}>
                        <p style={{ margin: 0 }}>Founder & Chief Executive Officer</p>
                        <p style={{ margin: 0 }}>Product & Experience Architect</p>
                        <p style={{ margin: 0 }}>Lead Engineer</p>
                    </div>
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
