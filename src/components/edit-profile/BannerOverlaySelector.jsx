import React, { useState } from 'react';
import { BANNER_OVERLAYS, OVERLAY_CATEGORIES, areOverlaysCompatible } from '@/core/constants/bannerOverlays';
import { FaInfoCircle, FaCheckCircle, FaTrashAlt, FaMicrochip, FaCamera, FaEye, FaFilm, FaLayerGroup, FaMagic } from 'react-icons/fa';
import { fadeColor } from '@/core/utils/colorUtils';

/**
 * BannerOverlaySelector
 * UI for selecting visual overlays (Lens) for the profile banner.
 * Refactored to match BannerTypeSelector UI pattern with scrolling lists.
 */
const BannerOverlaySelector = ({ selectedOverlays = [], onSelect, highlightColor = '#7FFFD4', overlayTarget = 'both', setOverlayTarget, onOpenCatalog }) => {
    // Initialize active category based on first selected overlay
    const [activeCategory, setActiveCategory] = useState(() => {
        if (selectedOverlays.length === 0) return null;
        const firstOverlay = typeof selectedOverlays[0] === 'string' ? selectedOverlays[0] : selectedOverlays[0].id;
        const overlayDef = BANNER_OVERLAYS.find(o => o.id === firstOverlay);
        return overlayDef?.category || null;
    });
    // Track selected color for each overlay (overlayId -> colorId)
    const [overlayColors, setOverlayColors] = useState({});
    const scrollContainerRef = React.useRef(null);

    // Auto-scroll to selected items on mount or when category changes
    React.useEffect(() => {
        if (scrollContainerRef.current) {
            const selectedElement = scrollContainerRef.current.querySelector('[data-selected="true"]');
            if (selectedElement) {
                selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeCategory, selectedOverlays]);

    // Map Category IDs to Icons
    const categoryIcons = {
        [OVERLAY_CATEGORIES.CAMERA.id]: FaCamera,
        [OVERLAY_CATEGORIES.DISPLAY.id]: FaMicrochip,
        [OVERLAY_CATEGORIES.CAPTURE.id]: FaEye,
        [OVERLAY_CATEGORIES.OPTICAL.id]: FaLayerGroup,
        [OVERLAY_CATEGORIES.GRADE.id]: FaFilm,
        [OVERLAY_CATEGORIES.ANIMATED.id]: FaMagic
    };

    const handleToggleOverlay = (id) => {
        // Check if overlay is already selected (need to handle both string IDs and objects)
        const isAlreadySelected = selectedOverlays.some(o =>
            typeof o === 'string' ? o === id : o.id === id
        );

        if (isAlreadySelected) {
            onSelect(selectedOverlays.filter(o =>
                typeof o === 'string' ? o !== id : o.id !== id
            ));
            return;
        }

        if (selectedOverlays.length >= 2) {
            return; // Limit reached
        }

        // Compatibility check (handle both string IDs and objects)
        const isCompatible = selectedOverlays.every(alreadySelected => {
            const selectedId = typeof alreadySelected === 'string' ? alreadySelected : alreadySelected.id;
            return areOverlaysCompatible(selectedId, id);
        });

        if (isCompatible) {
            // Create overlay object with color info if it has colorVariants
            const overlayDef = BANNER_OVERLAYS.find(o => o.id === id);
            const overlayToAdd = overlayDef?.colorVariants
                ? { id, selectedColor: overlayColors[id] || overlayDef.colorVariants[0].id }
                : id;

            onSelect([...selectedOverlays, overlayToAdd]);
        }
    };

    // Helper to cycle through colors for an overlay
    const cycleColor = (overlayId, direction) => {
        const overlay = BANNER_OVERLAYS.find(o => o.id === overlayId);
        if (!overlay?.colorVariants) return;

        const currentColorId = overlayColors[overlayId] || overlay.colorVariants[0].id;
        const currentIndex = overlay.colorVariants.findIndex(c => c.id === currentColorId);
        const newIndex = direction === 'next'
            ? (currentIndex + 1) % overlay.colorVariants.length
            : (currentIndex - 1 + overlay.colorVariants.length) % overlay.colorVariants.length;

        setOverlayColors(prev => ({
            ...prev,
            [overlayId]: overlay.colorVariants[newIndex].id
        }));
    };

    // Sync color changes with selected overlays
    React.useEffect(() => {
        // Update selected overlays when colors change
        const updatedOverlays = selectedOverlays.map(overlay => {
            const id = typeof overlay === 'string' ? overlay : overlay.id;
            const overlayDef = BANNER_OVERLAYS.find(o => o.id === id);

            // If this overlay has colorVariants and a color is selected
            if (overlayDef?.colorVariants && overlayColors[id]) {
                return { id, selectedColor: overlayColors[id] };
            }

            return overlay;
        });

        // Only update if something actually changed
        const hasChanges = JSON.stringify(updatedOverlays) !== JSON.stringify(selectedOverlays);
        if (hasChanges) {
            onSelect(updatedOverlays);
        }
    }, [overlayColors]);

    const categories = Object.values(OVERLAY_CATEGORIES);
    const filteredOverlays = activeCategory ? BANNER_OVERLAYS.filter(o => o.category === activeCategory) : [];

    // Color Helpers
    const isGradient = highlightColor && highlightColor.includes('gradient');
    // For non-gradient colors, use them as is. For gradients, fallback to mint for borders/text if needed.
    const safeColor = isGradient ? '#7FFFD4' : highlightColor || '#7FFFD4';

    const getBackgroundWithOpacity = (color, opacity = 0.1) => {
        if (color && color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
    };


    return (
        <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
            {/* Header / Title Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{
                        ...(isGradient ? {
                            backgroundImage: highlightColor,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent'
                        } : { color: highlightColor }),
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em'
                    }}>Visual Overlays (Lens)</label>
                    {selectedOverlays.length > 0 && (
                        <span style={{
                            fontSize: '0.7rem',
                            color: '#fff',
                            background: isGradient ? 'rgba(255,255,255,0.2)' : fadeColor(safeColor, 0.2),
                            padding: '2px 8px',
                            borderRadius: '10px'
                        }}>
                            {selectedOverlays.length}/2
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {activeCategory && (
                        <button
                            type="button"
                            onClick={() => setActiveCategory(null)}
                            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                        >
                            Close Options
                        </button>
                    )}
                    {selectedOverlays.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onSelect([])}
                            style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <FaTrashAlt size={10} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Target Selector */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '0.5rem' }}>
                {['both', 'banner', 'profile'].map((target) => (
                    <button
                        key={target}
                        type="button"
                        onClick={() => setOverlayTarget && setOverlayTarget(target)}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: overlayTarget === target ? (isGradient ? '#fff' : safeColor) : 'transparent',
                            color: overlayTarget === target ? '#000' : '#888',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            transition: 'all 0.2s'
                        }}
                    >
                        {target.replace('profile', 'Avatar')}
                    </button>
                ))}
            </div>

            {/* Category Tabs (Pills) - These are the "Top Selections" */}
            <div className="custom-gradient-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: activeCategory ? '0.75rem' : '0.25rem' }}>
                <button
                    type="button"
                    onClick={() => onOpenCatalog && onOpenCatalog()}
                    style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        background: '#7FFFD4',
                        color: '#000',
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 0 15px rgba(127, 255, 212, 0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}
                >
                    <FaLayerGroup size={11} />
                    CATALOG
                </button>
                {categories.map(cat => {
                    const isActive = activeCategory === cat.id;
                    const Icon = categoryIcons[cat.id] || FaLayerGroup;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(isActive ? null : cat.id)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: isActive ? (isGradient ? '#fff' : safeColor) : 'rgba(255,255,255,0.2)',
                                background: isActive ? (isGradient ? 'rgba(255,255,255,0.1)' : getBackgroundWithOpacity(safeColor, 0.1)) : 'transparent',
                                color: isActive ? (isGradient ? '#fff' : safeColor) : '#888',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Icon size={12} />
                            {cat.label.replace(' / ', ' ')} {/* Shorten label slightly */}
                        </button>
                    );
                })}
            </div>

            {/* Horizontal Scrollable Overlay List (2 Rows) - ONLY OPEN WHEN CATEGORY SELECTED */}
            {activeCategory && (
                <div
                    ref={scrollContainerRef}
                    className="custom-gradient-scrollbar"
                    style={{
                        display: 'grid',
                        gridTemplateRows: 'repeat(2, 90px)',
                        gridAutoFlow: 'column',
                        gap: '10px',
                        overflowX: 'auto',
                        padding: '4px',
                        WebkitOverflowScrolling: 'touch',
                        scrollBehavior: 'smooth'
                    }}
                >
                    {filteredOverlays.map((overlay) => {
                        // Handle both string IDs and objects
                        const isSelected = selectedOverlays.some(o =>
                            typeof o === 'string' ? o === overlay.id : o.id === overlay.id
                        );
                        const isMaxed = selectedOverlays.length >= 2 && !isSelected;
                        const isCompatibleWithCurrent = selectedOverlays.every(selected => {
                            const selectedId = typeof selected === 'string' ? selected : selected.id;
                            return areOverlaysCompatible(selectedId, overlay.id);
                        });

                        // Identify Viewfinder/UI overlays that shouldn't be on profile
                        const isViewfinderUI = overlay.category === OVERLAY_CATEGORIES.CAMERA.id || overlay.id === 'display_terminal';
                        const isProfileRestricted = overlayTarget === 'profile' && isViewfinderUI;

                        // Only hard-disable if it's literally impossible (like Banner-Only while on Profile target)
                        const isHardDisabled = isProfileRestricted && !isSelected;
                        const needsSwap = (isMaxed || !isCompatibleWithCurrent) && !isSelected && !isHardDisabled;

                        return (
                            <div
                                key={overlay.id}
                                data-selected={isSelected}
                                style={{
                                    flex: '0 0 auto',
                                    width: '130px',
                                    height: '90px',
                                    position: 'relative',
                                }}
                            >
                                <button
                                    type="button"
                                    disabled={isHardDisabled}
                                    onClick={() => {
                                        if (needsSwap) {
                                            onSelect([overlay.id]);
                                        } else {
                                            handleToggleOverlay(overlay.id);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        background: isSelected ? getBackgroundWithOpacity(safeColor, 0.05) : 'rgba(255,255,255,0.03)',
                                        border: isSelected ? `2px solid ${isGradient ? '#fff' : safeColor}` : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        padding: '10px',
                                        textAlign: 'left',
                                        cursor: isHardDisabled ? 'not-allowed' : 'pointer',
                                        opacity: isHardDisabled ? 0.4 : 1,
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Card Content */}
                                    <div style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{
                                                fontSize: '0.8rem',
                                                fontWeight: isSelected ? '700' : '600',
                                                color: isSelected ? (isGradient ? '#fff' : safeColor) : '#eee',
                                                lineHeight: '1.2'
                                            }}>
                                                {overlay.label}
                                            </span>
                                            {isSelected && <FaCheckCircle size={14} color={isGradient ? '#fff' : safeColor} style={{ flexShrink: 0 }} />}
                                        </div>
                                        <div style={{
                                            fontSize: '0.65rem',
                                            color: 'rgba(255,255,255,0.5)',
                                            marginTop: '4px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {overlay.description}
                                        </div>

                                        {/* Color Picker for overlays with colorVariants */}
                                        {overlay.colorVariants && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginTop: '6px',
                                                gap: '6px'
                                            }}>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        cycleColor(overlay.id, 'prev');
                                                    }}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        borderRadius: '4px',
                                                        padding: '3px 8px',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                        fontSize: '0.7rem'
                                                    }}
                                                >
                                                    ◀
                                                </button>
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    color: isSelected ? (isGradient ? '#fff' : safeColor) : '#aaa',
                                                    fontWeight: '600',
                                                    flex: 1,
                                                    textAlign: 'center'
                                                }}>
                                                    {overlay.colorVariants.find(c => c.id === (overlayColors[overlay.id] || 'mint'))?.label || 'Mint'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        cycleColor(overlay.id, 'next');
                                                    }}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        borderRadius: '4px',
                                                        padding: '3px 8px',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                        fontSize: '0.7rem'
                                                    }}
                                                >
                                                    ▶
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Banner Only Restriction - Keep this as simple message since it's a hard limit */}
                                    {isProfileRestricted && !isSelected && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(0,0,0,0.85)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 5
                                        }}>
                                            <span style={{ fontSize: '0.7rem', color: '#ff4d4d', fontWeight: 'bold' }}>Banner Only</span>
                                        </div>
                                    )}

                                    {/* Swap UI - Clean badge that doesn't hide content */}
                                    {needsSwap && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '6px',
                                            right: '6px',
                                            zIndex: 10
                                        }}>
                                            <div style={{
                                                background: isGradient ? '#fff' : safeColor,
                                                color: '#000',
                                                padding: '3px 8px',
                                                borderRadius: '10px',
                                                fontSize: '0.6rem',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px',
                                                letterSpacing: '0.5px'
                                            }}>
                                                <span style={{ fontSize: '0.75rem' }}>↻</span> Swap
                                            </div>
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Compatibility Hint / Warning Footer */}
            {selectedOverlays.length >= 2 && (
                <div style={{
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <FaInfoCircle size={10} /> Max overlays reached. Deselect one to change.
                </div>
            )}
        </div>
    );
};

export default BannerOverlaySelector;
