import React, { useRef, useState } from 'react';
import { BANNER_TYPES } from '@/core/constants/bannerThemes';

const BannerTypeSelector = ({ selectedType, onSelect }) => {
    const [activeCategory, setActiveCategory] = useState('City');

    const getCategory = (id) => {
        if (id.startsWith('city') || id === 'panospace_beyond') return 'City';
        if (id.startsWith('ocean') || id === 'underwaterY2K') return 'Ocean';
        if (['stars', 'nebula', 'orbital'].includes(id)) return 'Cosmic';
        return 'Abstract';
    };

    const categories = ['City', 'Ocean', 'Cosmic', 'Abstract'];

    // Filter and sort to keep the selected item visible if possible, or just standard filter
    const filteredTypes = BANNER_TYPES.filter(t => getCategory(t.id) === activeCategory);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: '1px solid',
                            borderColor: activeCategory === cat ? '#7FFFD4' : 'rgba(255,255,255,0.2)',
                            background: activeCategory === cat ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                            color: activeCategory === cat ? '#7FFFD4' : '#888',
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
                className="banner-type-scroll"
                style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    padding: '4px 0 12px 0',
                    WebkitOverflowScrolling: 'touch',
                    minHeight: '80px' // Prevent layout shift
                }}>
                <style>{`
                    .banner-type-scroll::-webkit-scrollbar { height: 6px; }
                    .banner-type-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
                    .banner-type-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
                    .banner-type-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
                `}</style>

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
                                border: isSelected ? '2px solid #7FFFD4' : '1px solid rgba(255,255,255,0.2)',
                                boxShadow: isSelected ? '0 0 15px rgba(127, 255, 212, 0.3)' : 'none',
                                transition: 'all 0.2s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Stylized Visuals */}
                                {type.id === 'neonGrid' && (
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
                                color: isSelected ? '#7FFFD4' : '#888',
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
        </div>
    );
};

export default BannerTypeSelector;
