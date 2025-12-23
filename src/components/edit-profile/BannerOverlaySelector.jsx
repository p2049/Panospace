import React from 'react';
import { BANNER_OVERLAYS, OVERLAY_CATEGORIES, areOverlaysCompatible } from '@/core/constants/bannerOverlays';
import { FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';
import { fadeColor } from '@/core/utils/colorUtils';

/**
 * BannerOverlaySelector
 * UI for selecting visual overlays (Lens) for the profile banner.
 */
const BannerOverlaySelector = ({ selectedOverlays = [], onSelect, highlightColor = '#7FFFD4' }) => {

    const handleToggleOverlay = (id) => {
        if (selectedOverlays.includes(id)) {
            onSelect(selectedOverlays.filter(o => o !== id));
            return;
        }

        if (selectedOverlays.length >= 2) {
            // Check if we can replace or alert
            // For now, prompt rules say "Display a clear UI message if third selected"
            // We'll handle this by showing a temporary error or just blocking
            return;
        }

        // Compatibility check
        const isCompatible = selectedOverlays.every(alreadySelected =>
            areOverlaysCompatible(alreadySelected, id)
        );

        if (isCompatible) {
            onSelect([...selectedOverlays, id]);
        }
    };

    const [isOpen, setIsOpen] = React.useState(false);
    const categories = Object.values(OVERLAY_CATEGORIES);

    return (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isOpen ? (highlightColor.includes('gradient') ? 'rgba(255,255,255,0.3)' : highlightColor + '80') : 'rgba(255,255,255,0.1)'}`,
                    padding: '0.8rem 1.2rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isOpen ? `0 4px 20px ${highlightColor.includes('gradient') ? 'rgba(255,255,255,0.1)' : highlightColor + '20'}` : 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{
                        ...(highlightColor.includes('gradient') ? {
                            backgroundImage: highlightColor,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent'
                        } : { color: highlightColor }),
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                        filter: isOpen && !highlightColor.includes('gradient') ? `drop-shadow(0 0 5px ${highlightColor}80)` : 'none'
                    }}>Visual Overlays (Lens)</label>
                    {selectedOverlays.length > 0 && (
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#fff',
                            background: highlightColor.includes('gradient') ? 'rgba(255,255,255,0.2)' : fadeColor(highlightColor, 0.2),
                            padding: '2px 8px',
                            borderRadius: '10px'
                        }}>
                            {selectedOverlays.length} Active
                        </span>
                    )}
                </div>
                <div style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    color: highlightColor.includes('gradient') ? '#fff' : highlightColor
                }}>▼</div>
            </button>


            {isOpen && (
                <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        {selectedOverlays.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onSelect([])}
                                style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <FaTrashAlt size={10} /> Clear All
                            </button>
                        )}
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                        Stack up to two hardware simulations. Some combinations are incompatible due to physics or sensor constraints.
                    </p>

                    {categories.map(cat => (
                        <CategorySection
                            key={cat.id}
                            category={cat}
                            selectedOverlays={selectedOverlays}
                            onToggleOverlay={handleToggleOverlay}
                            highlightColor={highlightColor}
                        />
                    ))}

                    {selectedOverlays.length >= 2 && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: 'rgba(255, 180, 50, 0.05)',
                            border: '1px solid rgba(255, 180, 50, 0.2)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FaInfoCircle color="rgba(255, 180, 50, 0.8)" size={14} />
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 180, 50, 0.8)' }}>
                                Maximum of 2 overlays reach hardware stability limits.
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Helper component for collapsible sections
const CategorySection = ({ category, selectedOverlays, onToggleOverlay, highlightColor }) => {
    const [isExpanded, setIsExpanded] = React.useState(false); // Default collapsed

    // Check if any item in this category is selected to optionally auto-expand or highlight
    const hasActive = BANNER_OVERLAYS.filter(o => o.category === category.id).some(o => selectedOverlays.includes(o.id));

    return (
        <div style={{ marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    width: '100%',
                    padding: '0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    border: 'none',
                    borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    cursor: 'pointer',
                    color: '#fff'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                        fontSize: '0.75rem',
                        color: hasActive ? (highlightColor.includes('gradient') ? '#fff' : highlightColor) : 'rgba(255,255,255,0.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: hasActive ? '700' : '500'
                    }}>
                        {category.label}
                    </span>
                    {hasActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: highlightColor.includes('gradient') ? '#fff' : highlightColor }} />}
                </div>
                <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>▼</div>
            </button>

            {isExpanded && (
                <div style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                        {BANNER_OVERLAYS.filter(o => o.category === category.id).map(overlay => {
                            const isSelected = selectedOverlays.includes(overlay.id);
                            const isMaxed = selectedOverlays.length >= 2 && !isSelected;

                            // Compatibility check for this specific button
                            const isCompatibleWithCurrent = selectedOverlays.every(id => areOverlaysCompatible(id, overlay.id));
                            const isDisabled = (isMaxed || !isCompatibleWithCurrent) && !isSelected;

                            return (
                                <button
                                    key={overlay.id}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => onToggleOverlay(overlay.id)}
                                    style={{
                                        background: isSelected ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255,255,255,0.03)',
                                        border: isSelected ? `1px solid ${highlightColor}` : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '10px',
                                        textAlign: 'left',
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        opacity: isDisabled ? 0.3 : 1,
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? (highlightColor.includes('gradient') ? '#fff' : highlightColor) : '#fff' }}>
                                            {overlay.label}
                                        </span>
                                        {isSelected && <FaCheckCircle size={10} color={highlightColor.includes('gradient') ? '#fff' : highlightColor} />}
                                    </div>
                                    <span style={{ fontSize: '0.65rem', color: (highlightColor && !highlightColor.includes('gradient')) ? fadeColor(highlightColor, 0.5) : 'rgba(255,255,255,0.4)', lineHeight: '1.2' }}>
                                        {overlay.description}
                                    </span>

                                    {!isSelected && !isCompatibleWithCurrent && selectedOverlays.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(0,0,0,0.8)',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '8px',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            pointerEvents: 'none',
                                            zIndex: 5
                                        }} className="incompatible-tip">
                                            <span style={{ fontSize: '0.6rem', color: '#ff4d4d', textAlign: 'center' }}>Incompatible with current selection</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannerOverlaySelector;
