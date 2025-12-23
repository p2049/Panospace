import React, { useMemo } from 'react';

/**
 * PixelAvatarDisplay
 * Renders a read-only 16x16 pixel avatar.
 * 
 * @param {Array<string|null>} data - The flattened 1D array (length 256) of color strings or nulls.
 * @param {string} size - CSS width/height string (default '48px').
 * @param {string} borderMode - 'default', 'clear', or 'none'.
 * @param {string} primaryColor - The primary accent color for the default border glow.
 * @param {string} className - Optional extra classes.
 */
const PixelAvatarDisplay = ({
    data,
    size = '48px',
    borderMode = 'default',
    primaryColor = '#7FFFD4',
    showGrid = true, // Control if gaps are shown
    className = ''
}) => {
    // Determine border styles
    const borderStyle = useMemo(() => {
        const baseStyle = {
            width: size,
            height: size,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '22%', // Squircle shape approximation
            background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)', // Default Glass
            backdropFilter: 'blur(12px)',
        };

        if (borderMode === 'clear') {
            return {
                ...baseStyle,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: 'none'
            };
        }

        if (borderMode === 'none') {
            return {
                ...baseStyle,
                border: 'none',
                boxShadow: 'none'
            };
        }

        // Default: Neon Glow
        return {
            ...baseStyle,
            border: `1.5px solid ${primaryColor}`,
            boxShadow: `0 0 8px ${primaryColor}60`
        };
    }, [borderMode, size, primaryColor]);

    // Grid rendering logic
    // We render a single SVG or a CSS grid? CSS Grid 16x16 is robust.
    // SVG might be lighter for many avatars, but CSS Grid is requested contextually.
    // Let's use CSS Grid for crisp pixels.

    // If data is missing or invalid, render placeholder
    if (!data || data.length !== 256) {
        return <div style={{ ...borderStyle, background: '#111' }} className={className} />;
    }

    return (
        <div style={borderStyle} className={className}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(16, 1fr)',
                gridTemplateRows: 'repeat(16, 1fr)',
                gap: showGrid ? '1px' : '0px', // Cut-thru gaps show only if grid is on
                width: '100%',
                height: '100%'
            }}>
                {data.map((color, i) => (
                    <div
                        key={i}
                        style={{
                            backgroundColor: color || 'transparent',
                            borderRadius: showGrid ? '1.5px' : '0px',
                            width: '100%',
                            height: '100%'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default PixelAvatarDisplay;
