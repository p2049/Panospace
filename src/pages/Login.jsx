import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';
import StarBackground from '@/components/StarBackground';

const Login = () => {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login, googleSignIn } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            navigate('/');
        } catch (err) {
            setError('Failed to log in: ' + err.message);
        }

        setLoading(false);
    }

    async function handleGoogleSignIn() {
        try {
            setError('');
            setLoading(true);
            await googleSignIn();
            navigate('/');
        } catch (err) {
            setError('Failed to log in with Google: ' + err.message);
        }
        setLoading(false);
    }

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'radial-gradient(ellipse at center, rgba(20, 20, 40, 0.4) 0%, #000 70%)',
        color: '#fff',
        position: 'relative',
        overflow: 'auto', // Changed from 'hidden' to allow scrolling
        padding: '2rem 1rem' // Add padding for mobile landscape
    };

    const cardStyle = {
        padding: '2.5rem',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.85) 0%, rgba(10, 10, 15, 0.75) 100%)',
        backdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(127, 255, 212, 0.15)',
        boxShadow: `
            0 0 60px rgba(127, 255, 212, 0.15),
            0 0 120px rgba(76, 201, 240, 0.08),
            0 20px 60px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(127, 255, 212, 0.05)
        `,
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        position: 'relative',
        zIndex: 1,
        animation: 'cardFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        opacity: 0,
        transform: 'translateY(20px)',
        margin: 'auto' // Center in landscape
    };

    return (
        <div style={containerStyle}>
            <SEO title="Login" />

            {/* Animated Stars Background */}
            <StarBackground />

            {/* Galaxy Mist Layer */}
            <div className="galaxy-mist"></div>

            <style>{`
                /* Card Fade-In Animation */
                @keyframes cardFadeIn {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Ambient Glow Pulse */
                @keyframes glowPulse {
                    0%, 100% {
                        box-shadow: 
                            0 0 60px rgba(127, 255, 212, 0.15),
                            0 0 120px rgba(76, 201, 240, 0.08),
                            0 20px 60px rgba(0, 0, 0, 0.6),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1),
                            inset 0 -1px 0 rgba(127, 255, 212, 0.05);
                    }
                    50% {
                        box-shadow: 
                            0 0 80px rgba(127, 255, 212, 0.2),
                            0 0 140px rgba(76, 201, 240, 0.12),
                            0 20px 60px rgba(0, 0, 0, 0.6),
                            inset 0 1px 0 rgba(255, 255, 255, 0.15),
                            inset 0 -1px 0 rgba(127, 255, 212, 0.08);
                    }
                }

                /* Button Pulse */
                @keyframes buttonPulse {
                    0%, 100% {
                        box-shadow: 
                            0 0 20px rgba(127, 255, 212, 0.3),
                            0 0 40px rgba(127, 255, 212, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.3);
                    }
                    50% {
                        box-shadow: 
                            0 0 30px rgba(127, 255, 212, 0.5),
                            0 0 60px rgba(127, 255, 212, 0.25),
                            inset 0 1px 0 rgba(255, 255, 255, 0.4);
                    }
                }

                /* Premium Input Fields */
                .y2k-input {
                    padding: 1.1rem 1.2rem;
                    border-radius: 14px;
                    border: 1px solid rgba(127, 255, 212, 0.12);
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(10, 10, 15, 0.5) 100%);
                    color: #fff;
                    font-size: 1rem;
                    width: 100%;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                    position: relative;
                    box-shadow: 
                        inset 0 1px 3px rgba(0, 0, 0, 0.4),
                        0 0 0 rgba(127, 255, 212, 0);
                }

                .y2k-input::placeholder {
                    color: rgba(255, 255, 255, 0.35);
                    font-weight: 300;
                    letter-spacing: 0.5px;
                }

                .y2k-input:focus {
                    border-color: rgba(127, 255, 212, 0.5);
                    background: linear-gradient(135deg, rgba(5, 5, 10, 0.8) 0%, rgba(15, 15, 20, 0.7) 100%);
                    box-shadow: 
                        inset 0 1px 3px rgba(0, 0, 0, 0.4),
                        0 0 20px rgba(127, 255, 212, 0.15),
                        0 0 40px rgba(127, 255, 212, 0.08),
                        inset 0 0 30px rgba(127, 255, 212, 0.03);
                    transform: translateY(-1px);
                }

                /* Premium Button */
                .y2k-button {
                    padding: 1.1rem 1.5rem;
                    border-radius: 14px;
                    border: none;
                    background: linear-gradient(135deg, #7FFFD4 0%, #4CC9F0 50%, #7FFFD4 100%);
                    background-size: 200% 100%;
                    color: #000;
                    font-size: 1rem;
                    font-weight: 800;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 
                        0 0 20px rgba(127, 255, 212, 0.3),
                        0 0 40px rgba(127, 255, 212, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.3);
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    position: relative;
                    overflow: hidden;
                    animation: buttonPulse 3s ease-in-out infinite;
                }

                .y2k-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                    transition: left 0.5s;
                }

                .y2k-button:hover:not(:disabled)::before {
                    left: 100%;
                }

                .y2k-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    background-position: 100% 0;
                    box-shadow: 
                        0 0 30px rgba(127, 255, 212, 0.5),
                        0 0 60px rgba(127, 255, 212, 0.25),
                        0 4px 20px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.4);
                }

                .y2k-button:active:not(:disabled) {
                    transform: translateY(0);
                }

                .y2k-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    filter: grayscale(0.8);
                    animation: none;
                }

                /* Google Button */
                .google-button {
                    padding: 1.1rem 1.5rem;
                    border-radius: 14px;
                    border: 1px solid rgba(127, 255, 212, 0.12);
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
                    color: #fff;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    box-shadow: 
                        inset 0 1px 0 rgba(255, 255, 255, 0.05),
                        0 0 0 rgba(127, 255, 212, 0);
                    letter-spacing: 0.5px;
                }

                .google-button:hover:not(:disabled) {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%);
                    border-color: rgba(127, 255, 212, 0.3);
                    box-shadow: 
                        inset 0 1px 0 rgba(255, 255, 255, 0.08),
                        0 0 15px rgba(127, 255, 212, 0.1);
                    transform: translateY(-1px);
                }

                .google-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Galaxy Mist Background Layers */
                .galaxy-mist {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                    opacity: 0.3;
                }

                .galaxy-mist::before {
                    content: '';
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: radial-gradient(circle, rgba(127, 255, 212, 0.08) 0%, transparent 70%);
                    filter: blur(80px);
                    animation: galaxyPulse 8s ease-in-out infinite;
                }

                .galaxy-mist::after {
                    content: '';
                    position: absolute;
                    width: 800px;
                    height: 800px;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: radial-gradient(circle, rgba(76, 201, 240, 0.05) 0%, transparent 70%);
                    filter: blur(100px);
                    animation: galaxyPulse 10s ease-in-out infinite reverse;
                }

                @keyframes galaxyPulse {
                    0%, 100% {
                        opacity: 0.3;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        opacity: 0.5;
                        transform: translate(-50%, -50%) scale(1.1);
                    }
                }

                /* Landscape Mobile Optimization */
                @media (max-height: 500px) and (orientation: landscape) {
                    /* Reduce card padding in landscape */
                    .login-card {
                        padding: 1.5rem !important;
                        gap: 1rem !important;
                        max-width: 90vw !important;
                    }

                    /* Smaller title in landscape */
                    .login-title {
                        font-size: 1.5rem !important;
                        margin-bottom: 0.5rem !important;
                    }

                    /* Smaller subtitle */
                    .login-subtitle {
                        font-size: 0.7rem !important;
                        margin-top: 0.25rem !important;
                    }

                    /* Compact inputs */
                    .y2k-input {
                        padding: 0.8rem 1rem !important;
                        font-size: 0.9rem !important;
                    }

                    /* Compact buttons */
                    .y2k-button, .google-button {
                        padding: 0.8rem 1.2rem !important;
                        font-size: 0.9rem !important;
                    }

                    /* Reduce form gap */
                    .login-form {
                        gap: 0.8rem !important;
                    }
                }
            `}</style>

            <div style={cardStyle} className="login-card">
                {/* Holographic Card Accent */}
                <div style={{
                    position: 'absolute',
                    top: '-1px',
                    left: '-1px',
                    right: '-1px',
                    bottom: '-1px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(127, 255, 212, 0.1) 0%, transparent 20%, transparent 80%, rgba(76, 201, 240, 0.1) 100%)',
                    pointerEvents: 'none',
                    zIndex: -1
                }}></div>

                <div style={{ textAlign: 'center', marginBottom: '1rem', width: '100%', overflow: 'hidden' }}>
                    <h2 className="login-title" style={{
                        fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
                        fontWeight: '800',
                        margin: 0,
                        background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: 'clamp(0px, 0.5vw, 2px)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%'
                    }}>
                        PANOSPACE
                    </h2>
                    <h3 className="login-subtitle" style={{
                        fontSize: 'clamp(0.75rem, 3vw, 1rem)',
                        color: '#7FFFD4',
                        margin: '0.5rem 0 0 0',
                        fontWeight: '400',
                        letterSpacing: 'clamp(1px, 0.5vw, 2px)',
                        textTransform: 'uppercase',
                        opacity: 0.8
                    }}>
                        Enter the Visual Universe
                    </h3>
                </div>

                {error && <div style={{
                    padding: '0.75rem',
                    background: 'rgba(255, 107, 107, 0.1)',
                    border: '1px solid rgba(255, 107, 107, 0.3)',
                    borderRadius: '8px',
                    color: '#ff6b6b',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                }}>{error}</div>}

                <form onSubmit={handleSubmit} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <input
                        type="email"
                        ref={emailRef}
                        required
                        placeholder="Email"
                        className="y2k-input"
                    />
                    <input
                        type="password"
                        ref={passwordRef}
                        required
                        placeholder="Password"
                        className="y2k-input"
                    />
                    <button disabled={loading} type="submit" className="y2k-button">
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(127, 255, 212, 0.15)' }}>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(127, 255, 212, 0.2), transparent)' }}></div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255, 255, 255, 0.3)' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(127, 255, 212, 0.2), transparent)' }}></div>
                </div>

                <button disabled={loading} onClick={handleGoogleSignIn} className="google-button">
                    Continue with Google
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
                    Need an account? <Link to="/signup" style={{ color: '#7FFFD4', textDecoration: 'none', fontWeight: 'bold' }}>Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
