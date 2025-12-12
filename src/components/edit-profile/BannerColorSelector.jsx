import React from 'react';
import { ALL_COLORS } from '@/core/constants/colorPacks';

const BannerColorSelector = ({ selectedColor, onSelect }) => {

    // Filter out black if needed? The UI shows black as valid. 
    // Usually neon/accent colors should not be black.
    // prompt says "Only use the existing PanoSpace theme colors... NO additional colors."
    // ALL_COLORS includes 'event-horizon-black' which might be invisible on black bg.
    // I will filter out black.
    const displayColors = ALL_COLORS.filter(c => c.color !== '#000000');

    return (
        <div className="banner-color-scroll" style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            padding: '4px 0 12px 0',
            WebkitOverflowScrolling: 'touch'
        }}>
            <style>{`
                .banner-color-scroll::-webkit-scrollbar { height: 6px; }
                .banner-color-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
                .banner-color-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
                .banner-color-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
            `}</style>

            {displayColors.map((opt) => {
                const isSelected = selectedColor === opt.color;

                return (
                    <button
                        key={opt.id}
                        type="button" // Prevent form submission
                        onClick={() => onSelect(opt.color)}
                        style={{
                            flex: '0 0 auto',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                        }}
                        title={opt.name}
                    >
                        {/* Circle */}
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: opt.color,
                            border: isSelected ? `2px solid #fff` : '2px solid rgba(255,255,255,0.1)',
                            boxShadow: isSelected ? `0 0 10px ${opt.color}` : 'none',
                            transition: 'all 0.2s',
                            // Handle gradients if present in ALL_COLORS
                            backgroundImage: opt.color.includes('gradient') ? opt.color : 'none'
                        }} />
                    </button>
                );
            })}
        </div>
    );
};

export default BannerColorSelector;
