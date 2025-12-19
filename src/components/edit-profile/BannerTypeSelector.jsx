import React, { useRef, useState } from 'react';
import { BANNER_TYPES } from '@/core/constants/bannerThemes';

import BannerColorSelector from './BannerColorSelector';

const BannerTypeSelector = ({ selectedType, onSelect, highlightColor = '#7FFFD4', bannerColor, onColorSelect }) => {
    const [activeCategory, setActiveCategory] = useState('City');

    const getCategory = (id) => {
        if (id.startsWith('city') || id === 'panospace_beyond') return 'City';
        if (id.startsWith('ocean') || id === 'underwaterY2K' || id === 'deep_underwater') return 'Ocean';
        if (['stars', 'nebula', 'orbital', 'cosmic-earth', 'planet', 'ice-planet', 'northern-lights'].includes(id)) return 'Cosmic';
        return 'Abstract';
    };

    const categories = ['City', 'Ocean', 'Cosmic', 'Abstract'];

    // Filter and sort to keep the selected item visible if possible, or just standard filter
    const filteredTypes = BANNER_TYPES.filter(t => getCategory(t.id) === activeCategory);

    // Color Helpers
    const isGradient = highlightColor && highlightColor.includes('gradient');
    const safeColor = isGradient ? '#7FFFD4' : highlightColor;

    // Helper for RGBA background (10% opacity)
    const getBackgroundWithOpacity = (color, opacity = 0.1) => {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color; // Return raw if not hex (e.g. gradient string unlikely but safe fallback)
    };

    const selectedThemeDef = BANNER_TYPES.find(t => t.id === selectedType);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Category Pills */}
            <div className="custom-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: '1px solid',
                            borderColor: activeCategory === cat ? (isGradient ? '#fff' : safeColor) : 'rgba(255,255,255,0.2)',
                            background: activeCategory === cat ? (isGradient ? 'rgba(255,255,255,0.1)' : getBackgroundWithOpacity(safeColor, 0.1)) : 'transparent',
                            color: activeCategory === cat ? (isGradient ? '#fff' : safeColor) : '#888',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Scrollable List */}
            <div
                className="custom-scrollbar"
                style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    padding: '16px 4px', // Increased to prevent glow clipping
                    WebkitOverflowScrolling: 'touch',
                    minHeight: '80px' // Prevent layout shift
                }}>
                {filteredTypes.map((type) => {
                    const isSelected = selectedType === type.id;

                    return (
                        <button
                            key={type.id}
                            type="button" // Prevent form submission
                            onClick={() => onSelect(type.id)}
                            style={{
                                flex: '0 0 auto',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                outline: 'none',
                                padding: 0
                            }}
                        >
                            {/* Thumbnail */}
                            <div style={{
                                width: '90px',
                                height: '50px',
                                borderRadius: '8px',
                                background: type.previewGradient,
                                border: isSelected ? `2px solid ${isGradient ? '#fff' : safeColor}` : '1px solid rgba(255,255,255,0.2)',
                                boxShadow: isSelected ? `0 0 15px ${isGradient ? 'rgba(255,255,255,0.3)' : getBackgroundWithOpacity(safeColor, 0.5)}` : 'none',
                                transition: 'all 0.2s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Stylized Visuals */}
                                {(type.id === 'neonGrid' || type.id === 'cyberpunkLines') && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '50%',
                                        background: `
                                            linear-gradient(transparent 95%, rgba(255,255,255,0.3) 95%),
                                            linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.3) 95%)
                                        `,
                                        backgroundSize: '10px 10px',
                                        transform: 'perspective(20px) rotateX(45deg)'
                                    }} />
                                )}
                                {type.id === 'ps2_2000' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#080808', // Charcoal
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px',
                                            transform: 'rotateX(30deg) translateZ(0)', transformStyle: 'preserve-3d'
                                        }}>
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <div key={i} style={{
                                                    width: '6px', height: '20px',
                                                    background: 'linear-gradient(to bottom, #9BA9FF, #080808)',
                                                    opacity: 0.6,
                                                    borderRadius: '1px'
                                                }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {type.id === 'deep_underwater' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#010408',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <div key={i} style={{
                                                width: '4px', height: '30px',
                                                margin: '0 2px',
                                                background: 'linear-gradient(to bottom, transparent, #0D2B36, transparent)',
                                                opacity: 0.4,
                                                filter: 'blur(1px)'
                                            }} />
                                        ))}
                                    </div>
                                )}
                                {type.id === 'stars' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                                        backgroundSize: '15px 15px',
                                        opacity: 0.5
                                    }} />
                                )}
                            </div>

                            {/* Label */}
                            <span style={{
                                color: isSelected ? (isGradient ? '#fff' : safeColor) : '#888',
                                fontSize: '0.75rem',
                                fontWeight: isSelected ? '700' : '500',
                                whiteSpace: 'nowrap'
                            }}>
                                {type.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Embedded Color Selector for Supported Themes */}
            {selectedThemeDef?.needsColor && (
                <div style={{ marginTop: '4px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>

                    <BannerColorSelector
                        selectedColor={bannerColor}
                        onSelect={onColorSelect}
                    />
                </div>
            )}
        </div>
    );
};

export default BannerTypeSelector;
