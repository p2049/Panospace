import React, { useState } from 'react';
import { FaPalette, FaTimes } from 'react-icons/fa';
import { COLOR_PALETTE, colorSimilarity } from '../../utils/colorExtraction';

const ColorWheelSearch = ({ onColorSelect, selectedColor, onClear }) => {
    const [showPalette, setShowPalette] = useState(false);
    const [hueValue, setHueValue] = useState(0);
    const [saturation, setSaturation] = useState(100);
    const [lightness, setLightness] = useState(50);

    const handleColorClick = (color) => {
        onColorSelect(color.hex);
        setShowPalette(false);
    };

    const handleCustomColor = () => {
        const h = hueValue;
        const s = saturation;
        const l = lightness;

        // Convert HSL to RGB
        const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l / 100 - c / 2;

        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        const hex = '#' + [r, g, b].map(x => {
            const h = x.toString(16);
            return h.length === 1 ? '0' + h : h;
        }).join('');

        onColorSelect(hex);
        setShowPalette(false);
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Color Button */}
            <button
                onClick={() => setShowPalette(!showPalette)}
                style={{
                    padding: '0.5rem 1rem',
                    background: selectedColor || '#222',
                    color: selectedColor ? '#fff' : '#888',
                    border: selectedColor ? `2px solid ${selectedColor}` : '1px solid #333',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    textShadow: selectedColor ? '0 0 4px rgba(0,0,0,0.8)' : 'none'
                }}
            >
                <FaPalette />
                {selectedColor ? 'Color Selected' : 'Search by Color'}
            </button>

            {/* Clear Button */}
            {selectedColor && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                    style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#ff4444',
                        border: '2px solid #000',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        zIndex: 10
                    }}
                >
                    <FaTimes />
                </button>
            )}

            {/* Color Palette Modal */}
            {showPalette && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '1rem',
                    zIndex: 1000,
                    minWidth: '320px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        paddingBottom: '0.75rem',
                        borderBottom: '1px solid #222'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>
                            Select Color
                        </h3>
                        <button
                            onClick={() => setShowPalette(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#888',
                                cursor: 'pointer',
                                padding: '0.25rem'
                            }}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Preset Colors */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{
                            fontSize: '0.85rem',
                            color: '#888',
                            marginBottom: '0.5rem'
                        }}>
                            Quick Select
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            gap: '0.5rem'
                        }}>
                            {COLOR_PALETTE.map((color, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleColorClick(color)}
                                    title={color.name}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        background: color.hex,
                                        border: selectedColor === color.hex
                                            ? '3px solid #7FFFD4'
                                            : '2px solid #222',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.5)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Custom Color Sliders */}
                    <div style={{
                        paddingTop: '1rem',
                        borderTop: '1px solid #222'
                    }}>
                        <div style={{
                            fontSize: '0.85rem',
                            color: '#888',
                            marginBottom: '0.75rem'
                        }}>
                            Custom Color
                        </div>

                        {/* Hue Slider */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.25rem',
                                fontSize: '0.75rem',
                                color: '#666'
                            }}>
                                <span>Hue</span>
                                <span>{hueValue}°</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={hueValue}
                                onChange={(e) => setHueValue(parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>

                        {/* Saturation Slider */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.25rem',
                                fontSize: '0.75rem',
                                color: '#666'
                            }}>
                                <span>Saturation</span>
                                <span>{saturation}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={saturation}
                                onChange={(e) => setSaturation(parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: `linear-gradient(to right, hsl(${hueValue}, 0%, 50%), hsl(${hueValue}, 100%, 50%))`,
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>

                        {/* Lightness Slider */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.25rem',
                                fontSize: '0.75rem',
                                color: '#666'
                            }}>
                                <span>Lightness</span>
                                <span>{lightness}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={lightness}
                                onChange={(e) => setLightness(parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: `linear-gradient(to right, hsl(${hueValue}, ${saturation}%, 0%), hsl(${hueValue}, ${saturation}%, 50%), hsl(${hueValue}, ${saturation}%, 100%))`,
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>

                        {/* Preview and Apply */}
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                flex: 1,
                                height: '40px',
                                borderRadius: '8px',
                                background: `hsl(${hueValue}, ${saturation}%, ${lightness}%)`,
                                border: '2px solid #222',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }} />
                            <button
                                onClick={handleCustomColor}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#7FFFD4',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorWheelSearch;
