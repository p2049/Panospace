import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '@/core/store/useThemeStore';
import { FaSearch, FaFilter } from 'react-icons/fa';
import MarketFilters from './MarketFilters';
import SearchEmojiPicker from '@/components/SearchEmojiPicker';

const MarketHeaderMobileVertical = ({
    searchTerm,
    setSearchTerm,
    followingOnly,
    setFollowingOnly,
    selectedTags,
    setIsMobileFiltersOpen,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    isSortDropdownOpen,
    setIsSortDropdownOpen,
    selectedSize,
    setSelectedSize,
    selectedType,
    setSelectedType,
    shopCategory,
    setShopCategory
}) => {
    const navigate = useNavigate();
    const { accentColor, secondaryColor, glowColorStrong } = useThemeColors();
    const [showPicker, setShowPicker] = React.useState(false);

    return (
        <div style={{
            padding: 'max(0.75rem, env(safe-area-inset-top)) 1rem 0.5rem 1rem',
            borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
            background: '#000',
            position: 'sticky',
            top: 0,
            width: '100%',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        }}>
            {/* ROW 1: Identity + View Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Planet Logo */}
                    <svg
                        width="40"
                        height="40"
                        viewBox="-5 -5 34 34"
                        onClick={() => navigate('/')}
                        style={{
                            cursor: 'pointer',
                            flexShrink: 0,
                            filter: `drop-shadow(0 0 8px ${glowColorStrong})`,
                            overflow: 'visible',
                            transition: 'filter 0.2s ease'
                        }}
                    >
                        <defs>
                            <radialGradient id="planetGradientV" cx="40%" cy="40%">
                                <stop offset="0%" style={{ stopColor: accentColor, stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: secondaryColor, stopOpacity: 1 }} />
                            </radialGradient>
                            <filter id="planetGlowV" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />
                        <circle cx="12" cy="12" r="7" fill="url(#planetGradientV)" opacity="0.95" filter="url(#planetGlowV)" />
                        <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)" strokeDasharray="0,8,20,100" />
                        <circle cx="12" cy="12" r="7" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
                    </svg>

                    <h1 style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: '800',
                        fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', monospace",
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: accentColor,
                        textShadow: `0 0 8px ${glowColorStrong}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3em'
                    }}>
                        PANOSPACE
                        <span style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #7FFFD4 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent',
                            filter: 'drop-shadow(0 0 8px rgba(127, 255, 212, 0.3))',
                            fontSize: '1.2rem'
                        }}>
                            MARKET
                        </span>
                    </h1>
                </div>

                {/* Grid/List Lock - Moved to Row 1 */}
                <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'feed' : 'grid')}
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--ice-mint)',
                        cursor: 'pointer'
                    }}
                >
                    {viewMode === 'grid' ? '⊞' : '☰'}
                </button>
            </div>

            {/* ROW 2: Tabs Only */}
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '32px' }}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', width: '100%' }}>
                    {['print', 'spacecard', 'sticker'].map((category) => (
                        <button
                            key={category}
                            onClick={() => setShopCategory(category)}
                            style={{
                                flex: 1, // Distribute evenly
                                padding: '0.35rem 0',
                                borderRadius: '6px',
                                background: shopCategory === category ? accentColor : 'transparent',
                                border: `1px solid ${shopCategory === category ? accentColor : 'rgba(255,255,255,0.1)'}`,
                                color: shopCategory === category ? '#000' : accentColor,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                textAlign: 'center'
                            }}
                        >
                            {category === 'print' ? 'PRINTS' : category === 'spacecard' ? 'CARDS' : 'STICKERS'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ROW 3: Search + Filter Button */}
            <div style={{ width: '100%', height: '36px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, height: '100%' }}>
                    <FaSearch style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ice-mint)', fontSize: '0.8rem', opacity: 0.8 }} />
                    <input
                        type="text"
                        placeholder="Search Shop..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            height: '100%',
                            padding: '0 0.8rem 0 2.2rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(127, 255, 212, 0.2)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.9rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                        onFocus={() => setShowPicker(true)}
                        onBlur={() => setTimeout(() => setShowPicker(false), 200)}
                    />
                </div>
                {/* Filter Button - Moved to Row 3 */}
                <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        minWidth: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        flexShrink: 0
                    }}
                >
                    <FaFilter size={12} />
                </button>
            </div>

            {/* ROW 4: Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
                {/* Added Toggle */}
                <button
                    onClick={() => setFollowingOnly(!followingOnly)}
                    style={{
                        padding: '0 0.6rem',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        borderRadius: '6px',
                        background: followingOnly ? 'rgba(127, 255, 212, 0.15)' : 'transparent',
                        border: followingOnly ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.15)',
                        color: followingOnly ? accentColor : '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        flexShrink: 0
                    }}
                >
                    ADDED
                </button>

                <MarketFilters
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isSortDropdownOpen={isSortDropdownOpen}
                    setIsSortDropdownOpen={setIsSortDropdownOpen}
                    selectedSize={selectedSize}
                    setSelectedSize={setSelectedSize}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    hideViewToggle={true}
                    disableDropdowns={true}
                    onFilterClick={() => setIsMobileFiltersOpen(true)}
                />


            </div>

            <SearchEmojiPicker
                visible={showPicker}
                isMobile={true}
                onSelect={(emoji) => setSearchTerm(prev => prev + emoji)}
            />
        </div>
    );
};

export default MarketHeaderMobileVertical;
