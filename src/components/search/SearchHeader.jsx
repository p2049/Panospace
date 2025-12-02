import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const SearchHeader = ({
    isMobile,
    headerVisible,
    searchTerm,
    setSearchTerm,
    currentMode,
    followingOnly,
    setFollowingOnly,
    selectedTags,
    setIsMobileFiltersOpen
}) => {
    const navigate = useNavigate();

    return (
        <div className="search-header" style={{
            padding: isMobile ? '0.5rem 0.8rem 0.5rem 0.8rem' : '1rem 2rem 0.5rem 2rem',
            borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
            background: '#000',
            position: 'sticky',
            top: 0,
            height: 'auto',
            zIndex: 50,
            WebkitTransform: 'translateZ(0)',
            overflow: 'visible',
            transition: 'transform 0.3s ease',
            transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)'
        }}>
            {/* Animated Stars Background - Optimized for Performance */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 0
            }}>
                {[...Array(isMobile ? 15 : 50)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: Math.random() * 2 + 1 + 'px',
                            height: Math.random() * 2 + 1 + 'px',
                            background: '#7FFFD4',
                            borderRadius: '50%',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            opacity: Math.random() * 0.5 + 0.3,
                            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                            boxShadow: `0 0 ${Math.random() * 3 + 2}px rgba(127, 255, 212, 0.8)`,
                            willChange: 'opacity'
                        }}
                    />
                ))}
            </div>

            {/* Content Layer */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Panospace Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginBottom: isMobile ? '0.2rem' : '1rem',
                    justifyContent: isMobile ? 'space-between' : 'flex-start'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {/* Custom Green Planet with Ring Logo */}
                        <svg
                            width="40"
                            height="40"
                            viewBox="-5 -5 34 34"
                            onClick={() => navigate('/')}
                            style={{
                                flexShrink: 0,
                                filter: 'drop-shadow(0 0 8px rgba(127, 255, 212, 0.4))',
                                cursor: 'pointer',
                                overflow: 'visible'
                            }}
                            title="Go to Feed"
                        >
                            <defs>
                                <radialGradient id="planetGradient" cx="40%" cy="40%">
                                    <stop offset="0%" style={{ stopColor: '#7FFFD4', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#00CED1', stopOpacity: 1 }} />
                                </radialGradient>
                                <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Ring behind planet */}
                            <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />

                            {/* Planet circle with glow */}
                            <circle cx="12" cy="12" r="7" fill="url(#planetGradient)" opacity="0.95" filter="url(#planetGlow)" />

                            {/* Ring in front of planet */}
                            <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)"
                                strokeDasharray="0,8,20,100" />

                            {/* Subtle glow */}
                            <circle cx="12" cy="12" r="7" fill="none" stroke="#7FFFD4" strokeWidth="0.5" opacity="0.3" />
                        </svg>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', whiteSpace: 'nowrap' }}>
                            <h1 style={{
                                color: '#fff',
                                fontSize: '1.1rem',
                                fontWeight: '900',
                                textShadow: '0 2px 8px rgba(127, 255, 212, 0.4)',
                                cursor: 'pointer',
                                fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', monospace",
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                background: 'linear-gradient(135deg, #7FFFD4, #00CED1)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                margin: 0
                            }} onClick={() => navigate('/')}>
                                PANOSPACE
                            </h1>
                            <span
                                onClick={() => isMobile && setIsMobileFiltersOpen(true)}
                                style={{
                                    fontSize: '0.95rem',
                                    fontWeight: '800',
                                    fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', monospace",
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #7FFFD4 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    filter: 'drop-shadow(0 0 8px rgba(127, 255, 212, 0.3))',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}>EXPLORE {isMobile && selectedTags.length > 0 && <span style={{ fontSize: '0.8em', verticalAlign: 'top', color: '#7FFFD4', WebkitTextFillColor: '#7FFFD4' }}>•</span>}</span>
                        </div>
                    </div>
                </div>

                {/* Desktop Search Bar (Hidden on Mobile) */}
                {(!isMobile) && (
                    <div className="search-bar-container" style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '0',
                        position: 'relative',
                        zIndex: 10
                    }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <FaSearch style={{
                                position: 'absolute',
                                left: '1.2rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--ice-mint)',
                                fontSize: '1rem',
                                opacity: 0.8,
                                filter: 'drop-shadow(0 0 5px rgba(127, 255, 212, 0.5))'
                            }} />
                            <input
                                type="text"
                                placeholder={`Search for ${currentMode}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 1rem 0.5rem 3.2rem',
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    border: '1px solid rgba(127, 255, 212, 0.3)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    fontFamily: 'var(--font-family-mono)',
                                    letterSpacing: '0.02em',
                                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(127, 255, 212, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--ice-mint)';
                                    e.target.style.boxShadow = '0 0 25px rgba(127, 255, 212, 0.15), inset 0 0 15px rgba(127, 255, 212, 0.1)';
                                    e.target.style.background = 'rgba(0, 0, 0, 0.8)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(127, 255, 212, 0.3)';
                                    e.target.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(127, 255, 212, 0.05)';
                                    e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                                }}
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            {/* Following Toggle */}
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.6rem 1.2rem',
                                background: followingOnly ? 'rgba(127, 255, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                border: followingOnly ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                whiteSpace: 'nowrap',
                                height: '100%',
                                boxShadow: followingOnly ? '0 0 15px rgba(127, 255, 212, 0.15)' : 'none',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={followingOnly}
                                    onChange={(e) => setFollowingOnly(e.target.checked)}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        border: '2px solid #7FFFD4',
                                        borderRadius: '3px',
                                        background: followingOnly ? '#7FFFD4' : '#000',
                                        position: 'relative',
                                        transition: 'all 0.2s'
                                    }}
                                />
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: followingOnly ? '700' : '500',
                                    color: followingOnly ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.7)',
                                    fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}>
                                    Following Only
                                </span>
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchHeader;
