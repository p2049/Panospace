import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '@/core/store/useThemeStore';
import { FaSearch, FaShoppingBag } from 'react-icons/fa';
import MarketFilters from './MarketFilters';
import SearchEmojiPicker from '@/components/SearchEmojiPicker';

const MarketHeaderDesktop = ({
    searchTerm,
    setSearchTerm,
    followingOnly,
    setFollowingOnly,
    selectedTags,
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

    // Desktop uses the standard "Search" header style but adapted for Market
    return (
        <div style={{
            padding: 'max(1rem, env(safe-area-inset-top)) 2rem 0.5rem 2rem',
            borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
            background: '#000',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            {/* Top Row: Identity & Search */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
                            <radialGradient id="planetGradientD" cx="40%" cy="40%">
                                <stop offset="0%" style={{ stopColor: accentColor, stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: secondaryColor, stopOpacity: 1 }} />
                            </radialGradient>
                            <filter id="planetGlowD" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />
                        <circle cx="12" cy="12" r="7" fill="url(#planetGradientD)" opacity="0.95" filter="url(#planetGlowD)" />
                        <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)" strokeDasharray="0,8,20,100" />
                        <circle cx="12" cy="12" r="7" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
                    </svg>
                    <h1 style={{
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        color: accentColor,
                        textShadow: `0 0 8px ${glowColorStrong}`,
                        letterSpacing: '0.05em',
                        fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', monospace",
                        margin: 0,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3em'
                    }} onClick={() => navigate('/')}>
                        PANOSPACE
                        <span style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #7FFFD4 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent',
                            filter: 'drop-shadow(0 0 8px rgba(127, 255, 212, 0.3))'
                        }}>
                            MARKET
                        </span>
                    </h1>
                </div>

                <div style={{ position: 'relative', width: '400px' }}>
                    <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ice-mint)', opacity: 0.8 }} />
                    <input
                        type="text"
                        placeholder="Search Shop..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(127, 255, 212, 0.3)',
                            borderRadius: '10px',
                            color: '#fff',
                            fontSize: '0.95rem',
                            outline: 'none',
                            fontFamily: 'var(--font-family-mono)'
                        }}
                        onFocus={() => setShowPicker(true)}
                        onBlur={() => setTimeout(() => setShowPicker(false), 200)}
                    />
                </div>
            </div>

            {/* Bottom Row: Tabs, Added, Filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {['print', 'spacecard', 'sticker'].map((category) => (
                        <button
                            key={category}
                            onClick={() => setShopCategory(category)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                background: shopCategory === category ? accentColor : 'transparent',
                                border: `1px solid ${shopCategory === category ? accentColor : 'rgba(255,255,255,0.1)'}`,
                                color: shopCategory === category ? '#000' : accentColor,
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {category === 'print' ? 'PRINTS' : category === 'spacecard' ? 'CARDS' : 'STICKERS'}
                        </button>
                    ))}
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={followingOnly}
                            onChange={(e) => setFollowingOnly(e.target.checked)}
                            style={{ accentColor: accentColor }}
                        />
                        <span style={{ fontSize: '0.85rem', color: followingOnly ? accentColor : '#aaa', fontWeight: 'bold' }}>ADDED</span>
                    </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                        hideViewToggle={false} // Desktop shows view toggles in filter bar
                    />
                </div>
            </div>
            <SearchEmojiPicker
                visible={showPicker}
                isMobile={false}
                onSelect={(emoji) => setSearchTerm(prev => prev + emoji)}
            />
        </div>
    );
};

export default MarketHeaderDesktop;
