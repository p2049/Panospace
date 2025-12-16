import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '@/core/store/useThemeStore';
import { FaSearch, FaFilter } from 'react-icons/fa';
import MarketFilters from './MarketFilters';
import SearchEmojiPicker from '@/components/SearchEmojiPicker';

const MarketHeaderMobileHorizontal = ({
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
            padding: 'max(0.75rem, env(safe-area-inset-top)) 1rem 0.4rem 1rem', // Compact padding with safe area
            borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
            background: '#000',
            position: 'sticky',
            top: 0,
            width: '100%',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            // height: '48px', // Removed fixed height
            boxSizing: 'border-box'
        }}>
            {/* Identity Logo Only */}
            <svg
                width="40"
                height="40"
                viewBox="-5 -5 34 34"
                onClick={() => navigate('/')}
                style={{
                    cursor: 'pointer',
                    flexShrink: 0,
                    filter: `drop-shadow(0 0 5px ${glowColorStrong})`,
                    overflow: 'visible',
                    transition: 'filter 0.2s ease'
                }}
            >
                <defs>
                    <radialGradient id="planetGradientH" cx="40%" cy="40%">
                        <stop offset="0%" style={{ stopColor: accentColor, stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: secondaryColor, stopOpacity: 1 }} />
                    </radialGradient>
                    <filter id="planetGlowH" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />
                <circle cx="12" cy="12" r="7" fill="url(#planetGradientH)" opacity="0.95" filter="url(#planetGlowH)" />
                <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)" strokeDasharray="0,8,20,100" />
                <circle cx="12" cy="12" r="7" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
            </svg>

            {/* Search + Filter Icon */}
            <div style={{ flex: 1, display: 'flex', gap: '0.4rem', minWidth: '120px' }}>
                <div style={{ flex: 1, position: 'relative', height: '28px' }}>
                    <FaSearch style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ice-mint)', fontSize: '0.7rem', opacity: 0.8 }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            height: '100%',
                            padding: '0 0.6rem 0 1.8rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(127, 255, 212, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '0.8rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                        onFocus={() => setShowPicker(true)}
                        onBlur={() => setTimeout(() => setShowPicker(false), 200)}
                    />
                </div>

                {/* Filter Icon for Extra Options */}
                <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        width: '28px',
                        height: '28px',
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

            {/* Grid/List Lock - Moved after Search with Gap */}
            <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'feed' : 'grid')}
                style={{
                    marginLeft: '0.8rem', // Requested Gap
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ice-mint)',
                    cursor: 'pointer',
                    flexShrink: 0
                }}
            >
                {viewMode === 'grid' ? '⊞' : '☰'}
            </button>

            {/* Tabs (Compact) */}
            <div style={{ display: 'flex', gap: '0.3rem' }}>
                {['print', 'spacecard', 'sticker'].map((category) => (
                    <button
                        key={category}
                        onClick={() => setShopCategory(category)}
                        style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            background: shopCategory === category ? accentColor : 'transparent',
                            border: `1px solid ${shopCategory === category ? accentColor : 'rgba(255,255,255,0.1)'}`,
                            color: shopCategory === category ? '#000' : accentColor,
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {category === 'print' ? 'PRINTS' : category === 'spacecard' ? 'CARDS' : 'STICKERS'}
                    </button>
                ))}
            </div>

            {/* Filters (Compact) - Reuse MarketFilters but enforce compact rendering */}
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
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

        </div >
    );
};

export default MarketHeaderMobileHorizontal;
