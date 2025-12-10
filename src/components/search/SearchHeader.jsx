import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import SearchFilters from './SearchFilters';
import SearchModeTabs from './SearchModeTabs';
import { useThemeColors } from '@/core/store/useThemeStore';

const SearchHeader = ({
    isMobile,
    headerVisible,
    searchTerm,
    setSearchTerm,
    currentMode,
    setCurrentMode,
    followingOnly,
    setFollowingOnly,
    selectedTags,
    setIsMobileFiltersOpen,
    // Filter props
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    isSortDropdownOpen,
    setIsSortDropdownOpen,
    searchMode,
    setSearchMode,
    isMarketplaceMode,
    setIsMarketplaceMode
}) => {
    const navigate = useNavigate();
    const { accentColor } = useThemeColors();

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
            <style>{`
                @media (max-width: 1024px) and (orientation: landscape) {
                    .search-header {
                        padding: 0.3rem 0.5rem !important;
                    }
                    .search-bar-container {
                        gap: 0.4rem !important;
                    }
                }
            `}</style>
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
                {/* Panospace Logo & Categories Row */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    marginBottom: isMobile ? '0.2rem' : '0.5rem',
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
                                    cursor: 'default',
                                    userSelect: 'none'
                                }}>EXPLORE {isMobile && selectedTags.length > 0 && <span style={{ fontSize: '0.8em', verticalAlign: 'top', color: '#7FFFD4', WebkitTextFillColor: '#7FFFD4' }}>•</span>}</span>
                        </div>
                    </div>

                    {/* Category Tabs - Desktop */}
                    {!isMobile && (
                        <div style={{ flex: 1, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <SearchModeTabs
                                currentMode={currentMode}
                                setCurrentMode={setCurrentMode}
                                isMobile={isMobile}
                            />
                        </div>
                    )}
                </div>

                {/* Desktop Layout (and Mobile Search Bar Row) */}
                <div className="search-bar-container" style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0',
                    position: 'relative',
                    zIndex: 10
                }}>
                    {/* Search Bar - Narrower */}
                    <div style={{ position: 'relative', maxWidth: isMobile ? '140px' : '320px', minWidth: isMobile ? '100px' : '280px', flexShrink: 0 }}>
                        <FaSearch style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--ice-mint)',
                            fontSize: '0.9rem',
                            opacity: 0.8,
                            filter: 'drop-shadow(0 0 5px rgba(127, 255, 212, 0.5))'
                        }} />
                        <input
                            type="text"
                            placeholder={`Search ${currentMode}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.45rem 1rem 0.45rem 2.8rem',
                                background: 'rgba(0, 0, 0, 0.6)',
                                border: '1px solid rgba(127, 255, 212, 0.3)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '0.9rem',
                                outline: 'none',
                                fontFamily: 'var(--font-family-mono)',
                                letterSpacing: '0.02em',
                                boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(127, 255, 212, 0.05)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease',
                                transition: 'all 0.3s ease',
                                height: '32px', // Force height
                                boxSizing: 'border-box'
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

                    {/* Phase 3 Fix: Art/Social Tabs - Banner Inline */}
                    {/* Phase 3 Fix: Single Toggle Button for Art/Social */}
                    {currentMode === 'posts' && (
                        <div className="search-mode-tabs" style={{ flexShrink: 0, display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setSearchMode(searchMode === "art" ? "social" : "art")}
                                style={{
                                    padding: '0.35rem 0.8rem',
                                    borderRadius: '8px',
                                    border: `1px solid ${accentColor}`,
                                    background: searchMode === 'art' ? accentColor : 'transparent',
                                    color: searchMode === 'art' ? '#000' : accentColor,
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    boxShadow: searchMode === 'art' ? `0 0 10px ${accentColor}40` : 'none',
                                    height: '32px', // Enforce 32px
                                    boxSizing: 'border-box'
                                }}
                            >
                                {searchMode === 'art' ? 'ART' : 'SOCIAL'}
                            </button>

                            {/* Marketplace Toggle */}
                            <button
                                onClick={() => setIsMarketplaceMode(!isMarketplaceMode)}
                                style={{
                                    padding: '0.35rem 0.8rem',
                                    borderRadius: '8px',
                                    border: `1px solid ${isMarketplaceMode ? '#7FFFD4' : 'rgba(255,255,255,0.3)'}`,
                                    background: isMarketplaceMode ? 'rgba(127, 255, 212, 0.2)' : 'transparent',
                                    color: isMarketplaceMode ? '#7FFFD4' : 'rgba(255,255,255,0.7)',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    boxShadow: isMarketplaceMode ? `0 0 10px rgba(127, 255, 212, 0.2)` : 'none',
                                    height: '32px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {isMarketplaceMode ? '🛍️ MARKET' : '🛍️ SHOP'}
                            </button>
                        </div>
                    )}

                    {/* Mobile: Filter button next to Search Bar */}
                    {isMobile && (
                        <button
                            onClick={() => setIsMobileFiltersOpen(true)}
                            style={{
                                background: 'rgba(127, 255, 212, 0.1)',
                                border: '1px solid var(--ice-mint)',
                                borderRadius: '8px',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--ice-mint)',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                        >
                            <FaFilter size={14} />
                        </button>
                    )}

                    {/* Mobile: Compact Filter Controls */}
                    {isMobile && (
                        <>
                            {/* Following Toggle - Icon Only */}
                            <button
                                onClick={() => setFollowingOnly(!followingOnly)}
                                style={{
                                    background: followingOnly ? 'rgba(127, 255, 212, 0.15)' : 'transparent',
                                    border: followingOnly ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: followingOnly ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.6)',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    fontSize: '14px'
                                }}
                                title="Following Only"
                            >
                                👥
                            </button>

                            {/* Sort Dropdown - Compact */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    border: '1px solid rgba(127, 255, 212, 0.3)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    height: '32px',
                                    padding: '0 0.5rem',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    minWidth: '60px'
                                }}
                            >
                                <option value="recent">New</option>
                                <option value="popular">Pop</option>
                                <option value="trending">Hot</option>
                            </select>

                            {/* View Mode Toggle - Icons Only */}
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'feed' : 'grid')}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--ice-mint)',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    fontSize: '18px'
                                }}
                                title={viewMode === 'grid' ? 'Grid View' : 'Feed View'}
                            >
                                {viewMode === 'grid' ? '⊞' : '☰'}
                            </button>


                        </>
                    )}

                    {/* Desktop: Buttons Row */}
                    {!isMobile && (
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            flex: 1,
                            flexWrap: 'wrap'
                        }}>
                            {/* Following Toggle - Compact */}
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.45rem 1rem',
                                background: followingOnly ? 'rgba(127, 255, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                border: followingOnly ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                whiteSpace: 'nowrap',
                                height: '32px',
                                boxShadow: followingOnly ? '0 0 15px rgba(127, 255, 212, 0.15)' : 'none',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={followingOnly}
                                    onChange={(e) => setFollowingOnly(e.target.checked)}
                                    style={{
                                        width: '14px',
                                        height: '14px',
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
                                    fontSize: '0.8rem',
                                    fontWeight: followingOnly ? '700' : '500',
                                    color: followingOnly ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.7)',
                                    fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}>
                                    Following
                                </span>
                            </label>

                            {/* Search Filters - Integrated */}
                            <SearchFilters
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                                isSortDropdownOpen={isSortDropdownOpen}
                                setIsSortDropdownOpen={setIsSortDropdownOpen}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default SearchHeader;
