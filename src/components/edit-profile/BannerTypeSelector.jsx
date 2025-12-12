import React, { useRef } from 'react';
import { BANNER_TYPES } from '@/core/constants/bannerThemes';

const BannerTypeSelector = ({ selectedType, onSelect }) => {
    return (
        <div
            className="banner-type-scroll"
            style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                padding: '4px 0 12px 0',
                WebkitOverflowScrolling: 'touch' // Functionality for mobile
            }}>
            <style>{`
                .banner-type-scroll::-webkit-scrollbar { height: 6px; }
                .banner-type-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
                .banner-type-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
                .banner-type-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
            `}</style>

            {BANNER_TYPES.map((type) => {
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
    );
};

export default BannerTypeSelector;
