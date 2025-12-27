import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import SearchFilters from './SearchFilters';
import SearchModeTabs from './SearchModeTabs';
import { useThemeColors } from '@/core/store/useThemeStore';
import SearchEmojiPicker from '@/components/SearchEmojiPicker';
import { useFeedStore } from '@/core/store/useFeedStore';

const SearchHeader = ({
    isMobile,
    headerVisible,
    searchTerm,
    setSearchTerm,
    currentMode,
    setCurrentMode,
    selectedTags,
    setIsMobileFiltersOpen,
    // Filter props
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    isSortDropdownOpen,
    setIsSortDropdownOpen,
    isMarketplaceMode,
    setIsMarketplaceMode,
    hasActiveFilters // New prop
}) => {
    const navigate = useNavigate();
    const { accentColor } = useThemeColors();
    const { feedScope, feedContentType } = useFeedStore();

    // Derive display labels
    const scopeLabel = feedScope === 'all' ? 'UNIVERSAL' : (feedScope === 'following' ? 'ADDED' : 'GLOBAL');
    const contentLabel = feedContentType === 'all' ? 'ART & SOCIAL' : (feedContentType === 'art' ? 'ART ONLY' : 'SOCIAL ONLY');
    const [showPicker, setShowPicker] = React.useState(false);

    return (
        <div className="search-header" style={{
            padding: isMobile ? '0.5rem 0.8rem 0.5rem 0.8rem' : '1rem 2rem 0.5rem 2rem',
            borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
            background: '#000',
            position: 'sticky',
            top: 0,
            height: 'auto',
            width: '100%',
            boxSizing: 'border-box',
            zIndex: 'var(--z-sticky)',
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
                    marginBottom: '0.5rem',
                    justifyContent: 'flex-start'
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
                            title="Go to Orbit"
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

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', whiteSpace: 'nowrap' }}>
                            <h1 style={{
                                color: '#fff',
                                fontSize: '0.95rem',
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
                                margin: 0,
                                opacity: 0.9
                            }} onClick={() => navigate('/')}>
                                PANOSPACE
                            </h1>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
                                <span
                                    style={{
                                        fontSize: '0.65rem',
                                        fontWeight: '800',
                                        fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', monospace",
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        background: 'repeating-linear-gradient(to bottom, rgba(255, 255, 255, 1) 0px, rgba(255, 255, 255, 1) 1px, rgba(127, 255, 212, 0.7) 1px, rgba(127, 255, 212, 0.7) 2px)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        filter: 'drop-shadow(0 0 4px rgba(127, 255, 212, 0.4))',
                                        cursor: 'default',
                                        userSelect: 'none',
                                        lineHeight: 1.2
                                    }}>EXPLORE {scopeLabel}</span>
                                <span
                                    style={{
                                        fontSize: '0.55rem',
                                        fontWeight: '700',
                                        fontFamily: "'Orbitron', 'Rajdhani', monospace",
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        color: 'rgba(127, 255, 212, 0.6)',
                                        cursor: 'default',
                                        userSelect: 'none',
                                        opacity: 0.8,
                                        lineHeight: 1
                                    }}>{contentLabel}</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs - Desktop ONLY */}
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

                {/* ROW 1: Desktop Layout & Mobile Search Bar Row (Input + Controls) */}
                <div className="search-bar-container" style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: isMobile ? '0.5rem' : '0.75rem',
                    marginBottom: '0',
                    position: 'relative',
                    zIndex: 10,
                    flexWrap: 'nowrap' // Force single row (Group Goal)
                }}>
                    {/* Search Bar - Takes available space */}
                    <div style={{
                        position: 'relative',
                        flex: 1, // Grow to fill space
                        minWidth: '50px' // Prevent collapse
                    }}>
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
                            placeholder={isMobile ? "Search..." : `Search ${currentMode === 'galleries' ? 'studios' : currentMode}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.45rem 1rem 0.45rem 2.5rem', // Slightly less padding on mobile
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
                                height: '32px', // Force height
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--ice-mint)';
                                e.target.style.boxShadow = '0 0 25px rgba(127, 255, 212, 0.15), inset 0 0 15px rgba(127, 255, 212, 0.1)';
                                e.target.style.background = 'rgba(0, 0, 0, 0.8)';
                                setShowPicker(true);
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(127, 255, 212, 0.3)';
                                e.target.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(127, 255, 212, 0.05)';
                                e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                                // Delay hiding so click registers
                                setTimeout(() => setShowPicker(false), 200);
                            }}
                        />
                    </div>



                    {/* Mobile: Filter button */}
                    {isMobile && (
                        <button
                            onClick={() => setIsMobileFiltersOpen(true)}
                            style={{
                                background: hasActiveFilters ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                                border: hasActiveFilters ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: hasActiveFilters ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.7)',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                        >
                            <FaFilter size={14} />
                        </button>
                    )}

                    {/* Mobile: Compact Filter Controls Row (Inline now) */}
                    {isMobile && (
                        <>


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
                                    maxWidth: '60px'
                                }}
                            >
                                <option value="recent">New</option>
                                <option value="popular">Pop</option>
                                <option value="trending">Hot</option>
                            </select>

                            {/* View Mode Toggle - Icons Only (Hide for Text Mode) */}
                            {currentMode !== 'text' && (
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
                                    title={viewMode === 'grid' ? 'Grid View' : 'Orbit View'}
                                >
                                    {viewMode === 'grid' ? '⊞' : '☰'}
                                </button>
                            )}
                        </>
                    )}

                    {/* Desktop: Buttons Row (Not modified) */}
                    {!isMobile && (
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            flex: 1,
                            flexWrap: 'wrap'
                        }}>
                            {/* Following Toggle - Compact */}


                            {/* Search Filters - Integrated */}
                            <SearchFilters
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                                isSortDropdownOpen={isSortDropdownOpen}
                                setIsSortDropdownOpen={setIsSortDropdownOpen}
                                allowViewToggle={currentMode !== 'text'}
                            />
                        </div>
                    )}
                </div>

                {/* ROW 2: Mobile Category Tabs (Icon Row) - Bottom Row */}
                {isMobile && (
                    <div style={{ marginTop: '0.75rem', width: '100%', overflow: 'hidden' }}>
                        <SearchModeTabs
                            currentMode={currentMode}
                            setCurrentMode={setCurrentMode}
                            isMobile={isMobile}
                        />
                    </div>
                )}


            </div>


            {/* Emoji Picker - Mobile Friendly & Reverse Map Search Logic */}
            < SearchEmojiPicker
                visible={showPicker}
                isMobile={isMobile}
                onSelect={(emoji) => {
                    setSearchTerm(prev => prev + emoji);
                    // Keep focus on input
                    // We don't have direct ref easily available to the input unless I add one.
                    // But preventDefault on the button usually keeps focus. 
                    // If focusing lost, user can tap back. 
                    // But requirement says "When user taps... inserts...".
                    // Let's settle for functional update.
                }}
            />
        </div >
    );
};

export default SearchHeader;
