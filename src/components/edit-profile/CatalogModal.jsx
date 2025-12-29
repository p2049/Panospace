import React, { useMemo, useState } from 'react';
import { FaTimes, FaSearch, FaCheckCircle, FaLayerGroup, FaCamera, FaMicrochip, FaEye, FaFilm } from 'react-icons/fa';
import { BANNER_TYPES } from '@/core/constants/bannerThemes';
import { BANNER_OVERLAYS, OVERLAY_CATEGORIES } from '@/core/constants/bannerOverlays';

const CatalogModal = ({ isOpen, onClose, type, onSelect, selectedId, highlightColor = '#7FFFD4', bannerColor, overlayTarget }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const isOverlay = type === 'overlay';

    // Category mapping for banners (matching BannerTypeSelector)
    const getBannerCategory = (id) => {
        if (id.startsWith('city') || id === 'panospace_beyond') return 'City';
        if (id.startsWith('ocean') || id === 'underwaterY2K' || id === 'deep_underwater' || id === 'iso_wave' || id === 'marmoris') return 'Ocean';
        if (id.startsWith('cosmic') || id.startsWith('atmos') || id.startsWith('liquid') || ['stars', 'nebula', 'orbital', 'planet', 'ice-planet', 'northern-lights', 'aurora', 'system_orbital', 'borealis_live'].includes(id)) return 'Cosmic';
        if (id === 'elysium') return 'Cosmic';
        if (id.startsWith('window_')) return 'Window';
        return 'Abstract';
    };

    const overlayIcons = {
        [OVERLAY_CATEGORIES.CAMERA.id]: FaCamera,
        [OVERLAY_CATEGORIES.DISPLAY.id]: FaMicrochip,
        [OVERLAY_CATEGORIES.CAPTURE.id]: FaEye,
        [OVERLAY_CATEGORIES.OPTICAL.id]: FaLayerGroup,
        [OVERLAY_CATEGORIES.GRADE.id]: FaFilm
    };

    const sortedData = useMemo(() => {
        let items = isOverlay ? [...BANNER_OVERLAYS] : [...BANNER_TYPES];

        // Filter by search
        if (searchQuery) {
            items = items.filter(item =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Grouping logic
        const sections = {};

        if (isOverlay) {
            // Group by Category
            Object.values(OVERLAY_CATEGORIES).forEach(cat => {
                const catItems = items.filter(i => i.category === cat.id)
                    .sort((a, b) => a.label.localeCompare(b.label)); // Alphabetical within section
                if (catItems.length > 0) sections[cat.label] = catItems;
            });
        } else {
            // Group by custom categories
            const bannerCats = ['City', 'Ocean', 'Cosmic', 'Window', 'Abstract'];
            bannerCats.forEach(cat => {
                const catItems = items.filter(i => getBannerCategory(i.id) === cat)
                    .sort((a, b) => a.label.localeCompare(b.label)); // Alphabetical within section
                if (catItems.length > 0) sections[cat] = catItems;
            });
        }

        return sections;
    }, [isOverlay, searchQuery]);

    if (!isOpen) return null;

    const isGradient = highlightColor && highlightColor.includes('gradient');
    const safeColor = isGradient ? '#7FFFD4' : (highlightColor || '#7FFFD4');

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.3s ease'
        }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .catalog-content::-webkit-scrollbar { width: 8px; }
                .catalog-content::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                .catalog-content::-webkit-scrollbar-thumb { background: ${safeColor}40; border-radius: 4px; }
            `}</style>

            {/* Header */}
            <div style={{
                padding: '2rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.5)'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '900',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: safeColor
                    }}>
                        {type === 'overlay' ? 'Visual Overlay' : 'Banner Theme'} Catalog
                    </h2>
                    <p style={{ color: '#888', margin: '0.5rem 0 0 0' }}>
                        Browse all available {isOverlay ? 'lenses' : 'environments'} ordered by section and name.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                        <input
                            type="text"
                            placeholder="Search catalog..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '30px',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                color: '#fff',
                                width: '300px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: '#fff',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <FaTimes size={24} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="catalog-content" style={{
                flex: 1,
                overflowY: 'auto',
                padding: '2rem'
            }}>
                {Object.entries(sortedData).map(([sectionName, items]) => (
                    <div key={sectionName} style={{ marginBottom: '4rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            borderLeft: `4px solid ${safeColor}`,
                            paddingLeft: '1rem'
                        }}>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                margin: 0
                            }}>
                                {sectionName}
                            </h3>
                            <span style={{ color: '#444', fontWeight: 'bold' }}>/ {items.length} items</span>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {items.map(item => {
                                let isSelected = false;
                                if (isOverlay) {
                                    isSelected = selectedId?.includes(item.id);
                                } else {
                                    isSelected = selectedId === item.id;
                                }

                                // Overlay restrictions for profile
                                const isViewfinderUI = item.category === OVERLAY_CATEGORIES.CAMERA.id || item.id === 'display_terminal';
                                const isProfileRestricted = isOverlay && overlayTarget === 'profile' && isViewfinderUI;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => !isProfileRestricted && onSelect(item.id)}
                                        disabled={isProfileRestricted}
                                        style={{
                                            background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                                            border: isSelected ? `2px solid ${safeColor}` : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            textAlign: 'left',
                                            cursor: isProfileRestricted ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem',
                                            opacity: isProfileRestricted ? 0.4 : 1
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem', color: isSelected ? safeColor : '#fff' }}>
                                                    {item.label}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600' }}>#{item.id}</div>
                                            </div>
                                            {isSelected && <FaCheckCircle size={20} color={safeColor} />}
                                            {isOverlay && !isSelected && React.createElement(overlayIcons[item.category] || FaLayerGroup, { size: 16, color: '#333' })}
                                        </div>

                                        {!isOverlay && (
                                            <div style={{
                                                width: '100%',
                                                height: '60px',
                                                borderRadius: '8px',
                                                background: item.previewGradient,
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }} />
                                        )}

                                        <div style={{ fontSize: '0.9rem', color: '#888', lineHeight: '1.4' }}>
                                            {item.description}
                                        </div>

                                        {isProfileRestricted && (
                                            <div style={{
                                                marginTop: 'auto',
                                                fontSize: '0.7rem',
                                                color: '#ff4d4d',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase'
                                            }}>
                                                Banner Only
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CatalogModal;
