import React from 'react';
import { BANNER_OVERLAYS, OVERLAY_CATEGORIES, areOverlaysCompatible } from '@/core/constants/bannerOverlays';
import { FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';

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

    const categories = Object.values(OVERLAY_CATEGORIES);

    return (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ color: highlightColor, fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visual Overlays (Lens)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{selectedOverlays.length}/2 Active</span>
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

            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                Stack up to two hardware simulations. Some combinations are incompatible due to physics or sensor constraints.
            </p>

            {categories.map(cat => (
                <div key={cat.id} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.7rem', color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', borderBottom: '1px solid #222', paddingBottom: '4px' }}>
                        {cat.label}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                        {BANNER_OVERLAYS.filter(o => o.category === cat.id).map(overlay => {
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
                                    onClick={() => handleToggleOverlay(overlay.id)}
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
                                        <span style={{ fontSize: '0.8rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? highlightColor : '#fff' }}>
                                            {overlay.label}
                                        </span>
                                        {isSelected && <FaCheckCircle size={10} color={highlightColor} />}
                                    </div>
                                    <span style={{ fontSize: '0.65rem', color: '#666', lineHeight: '1.2' }}>
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
    );
};

export default BannerOverlaySelector;
