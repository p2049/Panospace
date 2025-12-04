import React, { useMemo } from 'react';

/**
 * AppLoading - Global loading screen for app initialization
 * Displays while Firebase auth, user profile, and UIContext are loading
 */
const AppLoading = () => {
    // Generate stars once and memoize them
    const stars = useMemo(() => {
        return [...Array(80)].map((_, i) => ({
            id: i,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            top: Math.random() * 100,
            left: Math.random() * 100,
            opacity: Math.random() * 0.5 + 0.3,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
        }));
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            overflow: 'hidden'
        }}>
            {/* Animated Stars Background */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    style={{
                        position: 'absolute',
                        width: `${star.width}px`,
                        height: `${star.height}px`,
                        top: `${star.top}%`,
                        left: `${star.left}%`,
                        background: '#7FFFD4',
                        borderRadius: '50%',
                        opacity: star.opacity,
                        boxShadow: `0 0 ${Math.random() * 4 + 2}px rgba(127, 255, 212, 0.8)`,
                        animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`
                    }}
                />
            ))}

            {/* Logo/Brand */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
            }}>
                {/* Planet Logo */}
                <svg
                    width="80"
                    height="80"
                    viewBox="-5 -5 34 34"
                    style={{
                        filter: 'drop-shadow(0 0 20px rgba(127, 255, 212, 0.6))',
                        animation: 'float 3s ease-in-out infinite'
                    }}
                >
                    <defs>
                        <radialGradient id="planetGradientLoading" cx="40%" cy="40%">
                            <stop offset="0%" style={{ stopColor: '#7FFFD4', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#00CED1', stopOpacity: 1 }} />
                        </radialGradient>
                        <filter id="planetGlowLoading" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />
                    <circle cx="12" cy="12" r="7" fill="url(#planetGradientLoading)" opacity="0.95" filter="url(#planetGlowLoading)" />
                    <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)" strokeDasharray="0,8,20,100" />
                    <circle cx="12" cy="12" r="7" fill="none" stroke="#7FFFD4" strokeWidth="0.5" opacity="0.3" />
                </svg>

                {/* App Name */}
                <h1 style={{
                    color: '#7FFFD4',
                    fontSize: '2rem',
                    fontFamily: '"Rajdhani", sans-serif',
                    fontWeight: '700',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    textShadow: '0 0 20px rgba(127, 255, 212, 0.5)',
                    margin: 0,
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    PanoSpace
                </h1>

                {/* Loading Spinner */}
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(127, 255, 212, 0.2)',
                    borderTop: '3px solid #7FFFD4',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    boxShadow: '0 0 15px rgba(127, 255, 212, 0.3)'
                }} />

                {/* Loading Text */}
                <p style={{
                    color: 'rgba(127, 255, 212, 0.7)',
                    fontSize: '0.9rem',
                    fontFamily: '"Rajdhani", sans-serif',
                    fontWeight: '500',
                    letterSpacing: '0.1em',
                    margin: 0,
                    animation: 'fadeInOut 2s ease-in-out infinite'
                }}>
                    Initializing...
                </p>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                @keyframes fadeInOut {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes twinkle {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }
            `}</style>
        </div>
    );
};

export default AppLoading;
