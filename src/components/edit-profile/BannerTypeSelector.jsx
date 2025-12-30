import React, { useRef, useState } from 'react';
import { BANNER_TYPES } from '@/core/constants/bannerThemes';
import { fadeColor } from '@/core/utils/colorUtils';

import BannerColorSelector from './BannerColorSelector';

import { FaLayerGroup, FaTrash } from 'react-icons/fa';

const BannerTypeSelector = ({ selectedType, onSelect, highlightColor = '#7FFFD4', bannerColor, onColorSelect, onOpenCatalog, savedBanners = [], onApplySaved, onDeleteSaved }) => {
    const getCategory = (id) => {
        if (!id) return 'Abstract';
        if (id.startsWith('city') || id === 'panospace_beyond') return 'City';
        if (id.startsWith('ocean') || id === 'underwaterY2K' || id === 'deep_underwater' || id === 'iso_wave' || id === 'marmoris') return 'Ocean';
        if (id.startsWith('cosmic') || id.startsWith('atmos') || ['stars', 'nebula', 'orbital', 'planet', 'ice-planet', 'northern-lights', 'aurora', 'system_orbital', 'borealis_live'].includes(id)) return 'Cosmic';
        if (id === 'elysium') return 'Cosmic';
        if (id.startsWith('window_')) return 'Window';
        if (id.startsWith('math_') || id.startsWith('os_') || id === 'abstract_oscilloscope') return 'Math';
        if (id.startsWith('zen_')) return 'Zen';
        // Ensure abstract_genesis_core is Treated as Abstract (default fallback covers it)
        if (id === 'custom_saved' || id === 'custom_oscillator' || id === 'custom_flow' || id === 'custom_city' || id === 'custom_snapshot' || id === 'custom_voxel' || id === 'custom_digital_forest' || id === 'custom_digital_jungle' || id === 'custom_liquid_fractal' || id === 'custom_aquarium_abyss' || id === 'custom_jazz_cup' || id === 'custom_memphis_pattern') return 'Custom';
        return 'Abstract';
    };

    const [activeCategory, setActiveCategory] = useState(() => getCategory(selectedType));
    const [showColorPicker, setShowColorPicker] = useState(() => {
        const theme = BANNER_TYPES.find(t => t.id === selectedType);
        return theme?.needsColor || theme?.needsVariant || false;
    });
    const scrollContainerRef = useRef(null);

    // Auto-scroll to selected item on mount or when category changes
    React.useEffect(() => {
        if (scrollContainerRef.current) {
            const selectedElement = scrollContainerRef.current.querySelector('[data-selected="true"]');
            if (selectedElement) {
                selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeCategory, selectedType]);

    const categories = ['Custom', 'City', 'Ocean', 'Cosmic', 'Window', 'Math', 'Zen', 'Abstract'];

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Category Pills */}
            <div className="custom-gradient-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 15px' }}>
                <button
                    type="button"
                    onClick={() => onOpenCatalog && onOpenCatalog()}
                    style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        border: '1px solid #8CFFE9',
                        background: 'transparent',
                        color: '#8CFFE9',
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 0 5px rgba(140, 255, 233, 0.2)', // Subtle glow only
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}
                >
                    <FaLayerGroup size={11} />
                    CATALOG
                </button>
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
                ref={scrollContainerRef}
                className="custom-gradient-scrollbar"
                style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    padding: '20px 20px', // Increased padding to prevent 15px glow clipping
                    WebkitOverflowScrolling: 'touch',
                    minHeight: '70px' // Reduced minHeight
                }}>
                {filteredTypes.map((type) => {
                    const isSelected = selectedType === type.id;

                    return (
                        <button
                            key={type.id}
                            data-selected={isSelected}
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
                                {type.id === 'window_submarine' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#05070a',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            width: '30px', height: '30px',
                                            border: '2px solid #8CFFE955',
                                            borderRadius: '50%',
                                            background: 'radial-gradient(circle at 30% 30%, #1B82FF, #011627)',
                                            boxShadow: '0 0 10px rgba(0,0,0,0.8), inset 0 0 5px rgba(0,0,0,0.5)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)', opacity: 0.5 }} />
                                        </div>
                                    </div>
                                )}
                                {type.id === 'window_rocket' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#000',
                                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                        padding: '4px'
                                    }}>
                                        {/* Stars */}
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '20%', left: '30%', width: '1px', height: '1px', background: '#fff' }} />
                                            <div style={{ position: 'absolute', top: '50%', left: '70%', width: '1px', height: '1px', background: '#fff' }} />
                                            <div style={{ position: 'absolute', top: '40%', left: '10%', width: '1px', height: '1px', background: '#fff' }} />
                                        </div>
                                        {/* Dashboard */}
                                        <div style={{ height: '12px', background: '#111', borderTop: '1px solid #5A3FFF', borderRadius: '2px', display: 'flex', gap: '2px', padding: '2px' }}>
                                            <div style={{ width: '4px', height: '4px', background: '#5A3FFF', borderRadius: '50%' }} />
                                            <div style={{ flex: 1, height: '2px', background: '#5A3FFF44' }} />
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
                                {type.id === 'custom_flow' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#010505',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: '100%', height: '100%',
                                            opacity: 0.6
                                        }}>
                                            <svg width="100%" height="100%" viewBox="0 0 90 50">
                                                <path d="M 0 10 Q 20 40, 45 15 T 90 30" fill="none" stroke="#7FFFD4" strokeWidth="1" />
                                                <path d="M 0 20 Q 25 45, 50 20 T 90 35" fill="none" stroke="#7FFFD4" strokeWidth="1" opacity="0.5" />
                                                <path d="M 0 30 Q 15 5, 40 25 T 90 10" fill="none" stroke="#7FFFD4" strokeWidth="1" opacity="0.3" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                {type.id === 'custom_oscillator' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#000',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: '70%', height: '30px',
                                            borderLeft: '1px solid #7FFFD4',
                                            borderRight: '1px solid #7FFFD4',
                                            position: 'relative'
                                        }}>
                                            <svg width="100%" height="100%" viewBox="0 0 100 40">
                                                <path d="M 0 20 Q 25 0, 50 20 T 100 20" fill="none" stroke="#7FFFD4" strokeWidth="2" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                {type.id === 'custom_city' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(to bottom, #050510, #1a0b2e)',
                                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Skyline */}
                                        <div style={{ width: '12px', height: '25px', background: '#222', marginRight: '1px', borderTop: '1px solid #7FFFD4' }} />
                                        <div style={{ width: '16px', height: '40px', background: '#333', marginRight: '1px', borderTop: '1px solid #FF00CC', boxShadow: '0 0 5px #FF00CC' }} />
                                        <div style={{ width: '10px', height: '18px', background: '#222', marginRight: '1px' }} />
                                        <div style={{ width: '14px', height: '32px', background: '#2a2a2a', marginRight: '1px', borderTop: '1px solid #00DDFF' }} />

                                        {/* Reflection/Glow */}
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(to bottom, rgba(127,255,212,0.2), transparent)' }} />
                                    </div>
                                )}
                                {type.id === 'custom_snapshot' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#000',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '20%', left: '30%' }} />
                                        <div style={{ width: '8px', height: '8px', background: '#5A3FFF', borderRadius: '50%', position: 'absolute', top: '60%', left: '70%' }} />
                                        <div style={{ width: '2px', height: '2px', background: '#8CFFE9', borderRadius: '50%', position: 'absolute', top: '80%', left: '20%' }} />
                                    </div>
                                )}
                                {type.id === 'custom_voxel' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#E0F7FA',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Isometric Island */}
                                        <div style={{
                                            position: 'relative', width: '24px', height: '24px',
                                            transform: 'translateY(5px) rotateX(60deg) rotateZ(-45deg)',
                                            transformStyle: 'preserve-3d'
                                        }}>
                                            <div style={{ position: 'absolute', inset: 0, background: '#8D6E63', boxShadow: '-2px 2px 0 #5D4037' }} /> {/* Dirt */}
                                            <div style={{ position: 'absolute', inset: 0, background: '#66BB6A', transform: 'translateZ(4px)' }} /> {/* Grass */}
                                            {/* Tiny voxel tree */}
                                            <div style={{ position: 'absolute', top: '4px', left: '4px', width: '6px', height: '6px', background: '#1B5E20', transform: 'translateZ(10px)' }} />
                                        </div>
                                    </div>
                                )}
                                {type.id === 'custom_digital_forest' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#020505',
                                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ width: '1px', height: '30px', background: '#0F0', position: 'absolute', bottom: 0, left: '50%' }}>
                                            <div style={{ width: '10px', height: '1px', background: '#0F0', position: 'absolute', bottom: '20px', left: '-5px', transform: 'rotate(-45deg)' }} />
                                            <div style={{ width: '10px', height: '1px', background: '#0F0', position: 'absolute', bottom: '15px', left: '0px', transform: 'rotate(45deg)' }} />
                                        </div>
                                    </div>
                                )}
                                {type.id === 'custom_digital_jungle' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(to bottom, #051a14, #000)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Dense Foliage Layers */}
                                        <div style={{ position: 'absolute', bottom: -5, left: -5, width: '30px', height: '30px', background: '#2e8b57', borderRadius: '50%', opacity: 0.6 }} />
                                        <div style={{ position: 'absolute', bottom: -5, right: -5, width: '40px', height: '40px', background: '#1b4d3e', borderRadius: '50%', opacity: 0.8 }} />

                                        {/* Cute Monkey Face Hint */}
                                        <div style={{
                                            width: '18px', height: '16px', background: '#8D6E63', borderRadius: '50%',
                                            position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', background: '#4E342E', borderRadius: '50%', position: 'absolute', left: '-2px', top: '2px' }} /> {/* Ear */}
                                            <div style={{ width: '6px', height: '6px', background: '#4E342E', borderRadius: '50%', position: 'absolute', right: '-2px', top: '2px' }} /> {/* Ear */}
                                            <div style={{ width: '12px', height: '10px', background: '#fff', borderRadius: '50%', position: 'relative', top: '1px' }} /> {/* Face Mask */}
                                            <div style={{ width: '2px', height: '2px', background: '#000', borderRadius: '50%', position: 'absolute', top: '6px', left: '5px' }} /> {/* Eye */}
                                            <div style={{ width: '2px', height: '2px', background: '#000', borderRadius: '50%', position: 'absolute', top: '6px', right: '5px' }} /> {/* Eye */}
                                        </div>
                                    </div>
                                )}
                                {type.id === 'custom_liquid_fractal' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#020505',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: '25px', height: '25px', borderRadius: '50%',
                                            background: 'radial-gradient(circle at 30% 30%, #fff, #7FFFD4)',
                                            boxShadow: '0 0 10px #5A3FFF',
                                            filter: 'blur(2px)'
                                        }} />
                                        <div style={{
                                            width: '15px', height: '15px', borderRadius: '50%',
                                            background: '#7FFFD4',
                                            position: 'absolute', top: '20px', left: '35px',
                                            filter: 'blur(1px)'
                                        }} />
                                    </div>
                                )}
                                {type.id === 'custom_aquarium_abyss' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(#001, #002)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Bubbles */}
                                        <div style={{ width: '4px', height: '4px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', position: 'absolute', bottom: '10px', left: '20%' }} />
                                        <div style={{ width: '6px', height: '6px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', position: 'absolute', top: '15px', right: '30%' }} />

                                        {/* Fish Silhouette */}
                                        <div style={{
                                            width: '12px', height: '8px', background: '#ff6b6b',
                                            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                                            position: 'relative',
                                            boxShadow: '0 0 5px #ff6b6b'
                                        }}>
                                            <div style={{ position: 'absolute', right: '-4px', top: '1px', width: 0, height: 0, borderLeft: '4px solid #ff6b6b', borderTop: '3px solid transparent', borderBottom: '3px solid transparent' }} />
                                        </div>
                                    </div>
                                )}
                                {type.id === 'custom_jazz_cup' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Teal Blob */}
                                        <div style={{
                                            position: 'absolute', top: -10, left: -10,
                                            width: '50px', height: '40px',
                                            background: '#00A8A8', borderRadius: '50%'
                                        }} />
                                        {/* Purple Squiggle */}
                                        <div style={{
                                            position: 'absolute', width: '40px', height: '4px',
                                            background: '#892CDC', borderRadius: '2px',
                                            transform: 'rotate(25deg)',
                                            boxShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                                        }} />
                                    </div>
                                )}
                                {type.id === 'custom_memphis_pattern' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#000',
                                        display: 'flex', flexDirection: 'column',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Top Void (Empty) */}
                                        <div style={{ height: '35%', width: '100%', background: '#000' }} />

                                        {/* Pattern Area (Bottom 2/3) */}
                                        <div style={{
                                            flex: 1,
                                            background: '#111',
                                            display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '2px',
                                            alignContent: 'flex-start'
                                        }}>
                                            <div style={{ width: '12px', height: '12px', background: '#FF00CC', borderRadius: '50%' }} />
                                            <div style={{ width: '18px', height: '8px', background: '#00DDFF' }} />
                                            <div style={{ width: '10px', height: '10px', border: '2px solid #FFFF00' }} />
                                            <div style={{ width: '8px', height: '16px', background: '#fff', borderRadius: '4px' }} />
                                            <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid #FF00CC' }} />
                                        </div>
                                    </div>
                                )}
                                {type.id === 'abstract_oscilloscope' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: '#000',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: '80%', height: '2px',
                                            background: '#7FFFD4',
                                            boxShadow: '0 0 8px #7FFFD4',
                                            position: 'relative',
                                            animation: 'oscilloscope-thumb 1s infinite ease-in-out'
                                        }}>
                                            <style>{`
                                                @keyframes oscilloscope-thumb {
                                                    0%, 100% { transform: scaleY(1); }
                                                    50% { transform: scaleY(5); }
                                                }
                                            `}</style>
                                        </div>
                                    </div>
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

            {/* Saved Banners Pop-down Row */}
            {
                selectedType === 'custom_saved' && (
                    <div style={{
                        padding: '12px 20px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '12px',
                        margin: '0 15px 15px 15px',
                        border: '1px solid rgba(127, 255, 212, 0.2)',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#7FFFD4', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
                            Your Saved Presets ({savedBanners.length}/25)
                        </div>

                        {savedBanners.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '0.75rem' }}>
                                You haven't saved any custom configurations yet.
                            </div>
                        ) : (
                            <div className="custom-gradient-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                                {savedBanners.map((saved) => (
                                    <div key={saved.id} style={{ position: 'relative', flex: '0 0 auto' }}>
                                        <button
                                            type="button"
                                            onClick={() => onApplySaved && onApplySaved(saved)}
                                            style={{
                                                width: '120px',
                                                padding: '10px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.borderColor = '#FFD700'}
                                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        >
                                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {saved.name}
                                            </span>
                                            <span style={{ fontSize: '0.55rem', color: '#888' }}>
                                                Seed: {saved.seed.substring(0, 8)}...
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteSaved && onDeleteSaved(saved.id);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '-6px',
                                                right: '-6px',
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: '#ff4444',
                                                border: 'none',
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                zIndex: 10
                                            }}
                                        >
                                            <FaTrash size={8} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {/* Direct Color Options (No pop-down) */}
            {
                selectedThemeDef && (selectedThemeDef.needsColor || selectedThemeDef.needsVariant || selectedThemeDef.hasAuroraVariants || selectedThemeDef.hasAtmosVariants) && (
                    <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        {/* Special Case: Aurora Variants */}
                        {selectedThemeDef.hasAuroraVariants && (
                            <div className="custom-gradient-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 15px', width: 'fit-content', maxWidth: '100%', margin: '0 auto' }}>
                                {[
                                    { id: 'aurora_borealis', label: 'Borealis', colors: ['#7FFFD4', '#7FFFD4'] },
                                    { id: 'aurora_australis', label: 'Australis', colors: ['#FF5C8A', '#5A3FFF'] },
                                    { id: 'aurora_polar', label: 'Polar Ice', colors: ['#7FFFD4', '#FFFFFF'] },
                                    { id: 'aurora_deep', label: 'Deep Space', colors: ['#5A3FFF', '#1B82FF'] },
                                    { id: 'aurora_plasma', label: 'Plasma', colors: ['#FF5C8A', '#5A3FFF', '#7FFFD4'] },
                                    { id: 'aurora_synth', label: 'Synth', colors: ['#7FFFD4', '#5A3FFF'] },
                                    { id: 'aurora_rose', label: 'Rose', colors: ['#FF5C8A', '#FFB7D5'] },
                                    { id: 'aurora_mint', label: 'Mint', colors: ['#7FFFD4', '#8CFFE9'] },
                                    { id: 'aurora_spirit', label: 'Spirit', colors: ['#A7B6FF', '#FFFFFF'] },
                                    { id: 'aurora_azure', label: 'Azure', colors: ['#1B82FF', '#7FDBFF'] },
                                    { id: 'aurora_void', label: 'Void', colors: ['#2A0E61', '#5A3FFF'] },
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
                                                border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                                                transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <div style={{
                                                    width: isSelected ? '50%' : '100%', height: isSelected ? '50%' : '100%', borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${variant.colors.join(', ')})`,
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '0.65rem', color: isSelected ? '#fff' : '#888' }}>{variant.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Special Case: Aurora ID Specific */}
                        {selectedThemeDef.id === 'aurora' && !selectedThemeDef.hasAuroraVariants && (
                            <div className="custom-gradient-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 15px', width: 'fit-content', maxWidth: '100%', margin: '0 auto' }}>
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
                                                border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                                                transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <div style={{
                                                    width: isSelected ? '50%' : '100%', height: isSelected ? '50%' : '100%', borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${variant.colors.join(', ')})`,
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '0.65rem', color: isSelected ? '#fff' : '#888' }}>{variant.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Atmos Variants */}
                        {selectedThemeDef.hasAtmosVariants && selectedThemeDef.id !== 'aurora' && (
                            <div className="custom-gradient-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 15px', width: 'fit-content', maxWidth: '100%', margin: '0 auto' }}>
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
                                                    width: '36px', height: '36px', borderRadius: '50%',
                                                    background: isSelected ? fadeColor(variant.colors[0], 0.15) : 'transparent',
                                                    border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                                                    transition: 'all 0.2s',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <div style={{
                                                        width: isSelected ? '50%' : '100%', height: isSelected ? '50%' : '100%', borderRadius: '50%',
                                                        background: `linear-gradient(135deg, ${variant.colors.join(', ')})`,
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.65rem', color: isSelected ? '#fff' : '#888' }}>{variant.label}</span>
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                        )}

                        {/* Standard Palette (Always Show for monochrome/needsColor banners) */}
                        {selectedThemeDef.needsColor && !selectedThemeDef.hasAuroraVariants && !selectedThemeDef.hasAtmosVariants && (
                            <div style={{ marginTop: '4px' }}>
                                <BannerColorSelector
                                    selectedColor={bannerColor}
                                    onSelect={onColorSelect}
                                    customVariants={selectedThemeDef.customVariants}
                                />
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
};

export default BannerTypeSelector;
