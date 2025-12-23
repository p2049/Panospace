import React, { useRef, useState } from 'react';
import { BANNER_TYPES } from '@/core/constants/bannerThemes';
import { fadeColor } from '@/core/utils/colorUtils';

import BannerColorSelector from './BannerColorSelector';

const BannerTypeSelector = ({ selectedType, onSelect, highlightColor = '#7FFFD4', bannerColor, onColorSelect }) => {
    const [activeCategory, setActiveCategory] = useState('City');

    const getCategory = (id) => {
        if (id.startsWith('city') || id === 'panospace_beyond') return 'City';
        if (id.startsWith('ocean') || id === 'underwaterY2K' || id === 'deep_underwater' || id === 'iso_wave' || id === 'marmoris') return 'Ocean';
        if (id.startsWith('cosmic') || id.startsWith('atmos') || ['stars', 'nebula', 'orbital', 'planet', 'ice-planet', 'northern-lights', 'aurora', 'system_orbital', 'borealis_live'].includes(id)) return 'Cosmic';
        if (id === 'elysium') return 'Cosmic';
        if (id.startsWith('window_')) return 'Window';
        if (id === 'wave_grid') return 'Abstract';
        return 'Abstract';
    };

    const categories = ['City', 'Ocean', 'Cosmic', 'Window', 'Abstract'];

    // Filter and sort to keep the selected item visible if possible, or just standard filter
    const filteredTypes = BANNER_TYPES.filter(t => getCategory(t.id) === activeCategory);

    // Color Helpers
    const isGradient = highlightColor && highlightColor.includes('gradient');
    const isTransparent = highlightColor === 'transparent' || highlightColor === 'transparent-border' || !highlightColor;
    const safeColor = isGradient ? '#7FFFD4' : (isTransparent ? '#fff' : highlightColor);

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
            <div className="custom-gradient-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
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
                className="custom-gradient-scrollbar"
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
                                {type.id === 'elysium' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'radial-gradient(circle at 30% 30%, rgba(224, 195, 252, 0.4), transparent), radial-gradient(circle at 70% 70%, rgba(142, 197, 252, 0.4), transparent)',
                                        filter: 'blur(5px)'
                                    }} />
                                )}
                                {type.id === 'aurora' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#2A0E61',
                                        display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            width: '100%', height: '1px',
                                            background: '#8CFFE9',
                                            boxShadow: '0 0 5px #8CFFE9'
                                        }} />
                                    </div>
                                )}
                                {type.id === 'window_plane' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#050510',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            width: '28px', height: '40px',
                                            border: '2px solid #333',
                                            borderRadius: '12px',
                                            background: 'radial-gradient(circle at 50% 100%, #1B82FF33, transparent)',
                                            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                                        }} />
                                    </div>
                                )}
                                {type.id === 'window_metro' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#0a0a0a',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            width: '32px', height: '32px',
                                            border: '2px solid #444',
                                            borderRadius: '6px',
                                            background: 'linear-gradient(to right, #1a1a1a, #333)',
                                            boxShadow: '0 0 8px rgba(0,0,0,0.5)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ position: 'absolute', top: '10%', left: 0, width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                                            <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '4px', height: '4px', background: '#FF5C8A', borderRadius: '50%' }} />
                                        </div>
                                    </div>
                                )}
                                {type.id === 'technicolor_hardware' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(135deg, rgba(27,130,255,0.2), rgba(255,92,138,0.2), rgba(127,255,212,0.2))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            width: '60%', height: '40%',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            borderRadius: '4px',
                                            background: 'rgba(255,255,255,0.1)',
                                            backdropFilter: 'blur(2px)'
                                        }} />
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
            {selectedThemeDef?.hasAuroraVariants && (
                <div style={{ marginTop: '4px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="custom-gradient-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {[
                            // 4 REALISTIC
                            { id: 'aurora_borealis', label: 'Borealis', colors: ['#7FFFD4', '#7FFFD4'] },
                            { id: 'aurora_australis', label: 'Australis', colors: ['#FF5C8A', '#5A3FFF'] },
                            { id: 'aurora_polar', label: 'Polar Ice', colors: ['#7FFFD4', '#FFFFFF'] },
                            { id: 'aurora_deep', label: 'Deep Space', colors: ['#5A3FFF', '#1B82FF'] },
                            // 2 CRAZY
                            { id: 'aurora_plasma', label: 'Plasma', colors: ['#FF5C8A', '#5A3FFF', '#7FFFD4'] },
                            { id: 'aurora_synth', label: 'Synth', colors: ['#7FFFD4', '#5A3FFF'] },
                            { id: 'aurora_rose', label: 'Rose', colors: ['#FF5C8A', '#FFB7D5'] },
                            { id: 'aurora_mint', label: 'Mint', colors: ['#7FFFD4', '#8CFFE9'] },
                            { id: 'aurora_spirit', label: 'Spirit', colors: ['#A7B6FF', '#FFFFFF'] },
                            { id: 'aurora_azure', label: 'Azure', colors: ['#1B82FF', '#7FDBFF'] },
                            { id: 'aurora_void', label: 'Void', colors: ['#2A0E61', '#5A3FFF'] },
                            // 1 INSANE
                            { id: 'aurora_prism', label: 'Prism', colors: ['#7FFFD4', '#FF5C8A', '#5A3FFF', '#1B82FF'] },
                        ].map((variant) => {
                            const isSelected = bannerColor === variant.id || (!bannerColor && variant.id === 'aurora_borealis');
                            return (
                                <button
                                    key={variant.id}
                                    type="button"
                                    onClick={() => onColorSelect(variant.id)}
                                    style={{
                                        flex: '0 0 auto',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                        background: 'transparent', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: isSelected ? fadeColor(variant.colors[0], 0.15) : 'transparent',
                                        backdropFilter: isSelected ? 'blur(2px)' : 'none',
                                        border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                                        boxShadow: isSelected ? `0 0 10px ${variant.colors[0]}` : 'none',
                                        transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            width: isSelected ? '50%' : '100%', height: isSelected ? '50%' : '100%', borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${variant.colors.join(', ')})`,
                                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: isSelected ? '#fff' : '#888', fontWeight: isSelected ? '600' : '400' }}>
                                        {variant.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            {selectedThemeDef?.id === 'aurora' && (
                <div style={{ marginTop: '4px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="custom-gradient-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {[
                            { id: 'main', label: 'Main', colors: ['#8CFFE9', '#5A3FFF'] },
                            { id: 'arctic', label: 'Arctic', colors: ['#7FDBFF', '#FFFFFF'] },
                            { id: 'solar', label: 'Solar', colors: ['#FF5C8A', '#FFB7D5'] },
                            { id: 'synth', label: 'Synth', colors: ['#8CFFE9', '#FF5C8A'] },
                            { id: 'void', label: 'Void', colors: ['#5A3FFF', '#2A0E61'] }
                        ].map((variant) => {
                            const isSelected = bannerColor === variant.id || (!bannerColor && variant.id === 'main');
                            return (
                                <button
                                    key={variant.id}
                                    type="button"
                                    onClick={() => onColorSelect(variant.id)}
                                    style={{
                                        flex: '0 0 auto',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                        background: 'transparent', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: isSelected ? fadeColor(variant.colors[0], 0.15) : 'transparent',
                                        backdropFilter: isSelected ? 'blur(2px)' : 'none',
                                        border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                                        boxShadow: isSelected ? `0 0 10px ${variant.colors[0]}` : 'none',
                                        transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            width: isSelected ? '50%' : '100%', height: isSelected ? '50%' : '100%', borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${variant.colors.join(', ')})`,
                                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: isSelected ? '#fff' : '#888', fontWeight: isSelected ? '600' : '400' }}>
                                        {variant.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Other Atmospheric Variants */}
            {selectedThemeDef?.hasAtmosVariants && selectedThemeDef?.id !== 'aurora' && (
                <div style={{ marginTop: '4px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="custom-gradient-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {(() => {
                            let variants = [];
                            if (selectedThemeDef.id === 'atmos_pulse') {
                                variants = [
                                    { id: 'main', label: 'Bloom', colors: ['#FF5C8A', '#5A3FFF', '#A7B6FF'] },
                                    { id: 'arctic', label: 'Frost', colors: ['#8CFFE9', '#7FDBFF', '#FFFFFF'] },
                                    { id: 'toxic', label: 'Venom', colors: ['#8CFFE9', '#1B82FF'] }
                                ];
                            } else if (selectedThemeDef.id === 'atmos_flux') {
                                variants = [
                                    { id: 'main', label: 'Silk', colors: ['#8CFFE9', '#5A3FFF'] },
                                    { id: 'sunset', label: 'Sunset', colors: ['#FF5C8A', '#2A0E61'] },
                                    { id: 'neon', label: 'Neon', colors: ['#1B82FF', '#A7B6FF'] }
                                ];
                            } else if (selectedThemeDef.id === 'atmos_aether') {
                                variants = [
                                    { id: 'main', label: 'Drift', colors: ['#A7B6FF', '#7FDBFF'] },
                                    { id: 'mint', label: 'Mint', colors: ['#8CFFE9', '#FFFFFF'] },
                                    { id: 'deep', label: 'Deep', colors: ['#1B82FF', '#5A3FFF'] }
                                ];
                            } else if (selectedThemeDef.id === 'atmos_globe') {
                                variants = [
                                    { id: 'main', label: 'World', colors: ['#8CFFE9', '#1B82FF'] },
                                    { id: 'void', label: 'Void', colors: ['#5A3FFF', '#2A0E61'] },
                                    { id: 'solar', label: 'Solar', colors: ['#FF5C8A', '#FFFFFF'] }
                                ];
                            } else {
                                variants = [
                                    { id: 'main', label: 'Main', colors: ['#5A3FFF', '#FF5C8A', '#8CFFE9'] },
                                    { id: 'arctic', label: 'Arctic', colors: ['#8CFFE9', '#7FDBFF', '#FFFFFF'] },
                                    { id: 'toxic', label: 'Toxic', colors: ['#ADFF2F', '#1B82FF', '#8CFFE9'] },
                                ];
                            }

                            return variants.map((variant) => {
                                const isSelected = bannerColor === variant.id || (!bannerColor && variant.id === 'main');
                                return (
                                    <button
                                        key={variant.id}
                                        type="button"
                                        onClick={() => onColorSelect(variant.id)}
                                        style={{
                                            flex: '0 0 auto',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                            background: 'transparent', border: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: isSelected ? fadeColor(variant.colors[0], 0.15) : 'transparent',
                                            backdropFilter: isSelected ? 'blur(2px)' : 'none',
                                            border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                                            boxShadow: isSelected ? `0 0 10px ${variant.colors[0]}` : 'none',
                                            transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <div style={{
                                                width: isSelected ? '50%' : '100%', height: isSelected ? '50%' : '100%', borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${variant.colors.join(', ')})`,
                                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: isSelected ? '#fff' : '#888', fontWeight: isSelected ? '600' : '400' }}>
                                            {variant.label}
                                        </span>
                                    </button>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}
            {selectedThemeDef?.needsColor && !selectedThemeDef?.hasAuroraVariants && !selectedThemeDef?.hasAtmosVariants && (
                <div style={{ marginTop: '4px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <BannerColorSelector
                        selectedColor={bannerColor}
                        onSelect={onColorSelect}
                        customVariants={selectedThemeDef?.customVariants}
                    />
                </div>
            )}
        </div>
    );
};

export default BannerTypeSelector;
