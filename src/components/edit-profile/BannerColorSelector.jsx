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
            padding: '0 0 8px 0',
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

                // Special handling for 'brand' multi-color option
                const isBrandColors = opt.color === 'brand';
                const brandGradient = 'linear-gradient(135deg, #7FFFD4, #FF5C8A, #5A3FFF, #1B82FF, #FF914D, #FFB7D5)';
                const displayBackground = isBrandColors ? brandGradient : opt.color;
                const glowColor = isBrandColors ? '#7FFFD4' : opt.color;

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
                        {/* Circle - with animated stars for Brand Colors */}
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isBrandColors ? '#0a0a14' : displayBackground,
                            border: isSelected ? `2px solid #fff` : '2px solid rgba(255,255,255,0.1)',
                            boxShadow: isSelected ? `0 0 10px ${glowColor}` : 'none',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden',
                            // Handle gradients if present in ALL_COLORS
                            backgroundImage: (!isBrandColors && opt.color.includes('gradient')) ? displayBackground : 'none'
                        }}>
                            {/* Animated star dots for Brand Colors */}
                            {isBrandColors && (
                                <>
                                    <style>{`
                                        @keyframes brand-twinkle-1 { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
                                        @keyframes brand-twinkle-2 { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                                    `}</style>
                                    <div style={{ position: 'absolute', top: '6px', left: '8px', width: '4px', height: '4px', borderRadius: '50%', background: '#7FFFD4', boxShadow: '0 0 4px #7FFFD4', animation: 'brand-twinkle-1 1.5s infinite' }} />
                                    <div style={{ position: 'absolute', top: '14px', left: '22px', width: '3px', height: '3px', borderRadius: '50%', background: '#FF5C8A', boxShadow: '0 0 4px #FF5C8A', animation: 'brand-twinkle-2 1.8s infinite' }} />
                                    <div style={{ position: 'absolute', top: '24px', left: '10px', width: '4px', height: '4px', borderRadius: '50%', background: '#5A3FFF', boxShadow: '0 0 4px #5A3FFF', animation: 'brand-twinkle-1 2s infinite' }} />
                                    <div style={{ position: 'absolute', top: '8px', left: '18px', width: '3px', height: '3px', borderRadius: '50%', background: '#1B82FF', boxShadow: '0 0 4px #1B82FF', animation: 'brand-twinkle-2 1.4s infinite' }} />
                                    <div style={{ position: 'absolute', top: '20px', left: '24px', width: '3px', height: '3px', borderRadius: '50%', background: '#FF914D', boxShadow: '0 0 4px #FF914D', animation: 'brand-twinkle-1 1.6s infinite' }} />
                                </>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default BannerColorSelector;
