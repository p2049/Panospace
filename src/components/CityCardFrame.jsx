import React, { useRef, useEffect } from 'react';
import { CITY_THEMES } from '../core/constants/cityThemes';

// Simplified Deterministic Random
const LCG = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
};

// Simplified Hex to RGB
const hexToRgb = (hex) => {
    if (typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
    if (hex.length === 4) return { r: parseInt(hex[1] + hex[1], 16), g: parseInt(hex[2] + hex[2], 16), b: parseInt(hex[3] + hex[3], 16) };
    return { r: parseInt(hex.substring(1, 3), 16), g: parseInt(hex.substring(3, 5), 16), b: parseInt(hex.substring(5, 7), 16) };
};

export function CityCardFrame({ themeId, width, height, style, children }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Resolve Theme
        const theme = CITY_THEMES[themeId] || CITY_THEMES['city_space'];

        // 2. Setup Canvas
        // Use device pixel ratio for sharpness if needed, but standard 1x is fast
        const drawWidth = typeof width === 'number' ? width : 600;
        const drawHeight = typeof height === 'number' ? height : 900;

        canvas.width = drawWidth;
        canvas.height = drawHeight;

        // 3. Draw Sky
        const skyColors = theme.sky || ['#000', '#111'];
        const skyGrad = ctx.createLinearGradient(0, 0, 0, drawHeight);
        skyColors.forEach((color, idx) => {
            skyGrad.addColorStop(idx / (skyColors.length - 1), color);
        });
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, drawWidth, drawHeight);

        // 4. Draw Stars
        // Use deterministic random for consistent stars across re-renders
        let rng = LCG(12345);
        if (theme.atmosphere?.stars) {
            ctx.fillStyle = '#FFF';
            const starCount = 50; // Fewer stars for small card
            for (let i = 0; i < starCount; i++) {
                const sx = rng() * drawWidth;
                const sy = rng() * (drawHeight * 0.7); // Keep stars in top 70%
                const size = rng() * 1.5;
                ctx.globalAlpha = rng() * 0.8 + 0.2;
                ctx.beginPath();
                ctx.arc(sx, sy, size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
        }

        // 5. Draw Atmosphere/Grid (Simplified)
        if (theme.atmosphere?.grid) {
            ctx.strokeStyle = theme.sky[1] || '#FFF';
            ctx.globalAlpha = 0.2;
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Vertical lines
            for (let x = 0; x <= drawWidth; x += 30) {
                ctx.moveTo(x, drawHeight);
                ctx.lineTo(drawWidth / 2, drawHeight * 0.4); // Vanishing point
            }
            // Horizontal lines
            for (let y = drawHeight * 0.6; y < drawHeight; y += 20) {
                ctx.moveTo(0, y); ctx.lineTo(drawWidth, y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }

        // 6. Draw Skyline (Simplified for Border)
        // We draw buildings at the bottom, scaled to width
        rng = LCG(123456); // Reset for buildings
        const buildingColor = theme.buildings?.color || '#000';
        const windowColors = theme.buildings?.windowColor || ['#FFF'];

        const buildings = [];
        let currentX = -10;
        while (currentX < drawWidth + 10) {
            const w = 20 + rng() * 40; // Narrow buildings
            const h = drawHeight * 0.15 + rng() * drawHeight * 0.2; // 15-35% of card height
            buildings.push({ x: currentX, w, h });
            currentX += w - (rng() * 5); // Slight overlap
        }

        // Draw Buildings
        ctx.fillStyle = buildingColor;
        buildings.forEach(b => {
            const y = drawHeight - b.h;
            ctx.fillRect(b.x, y, b.w, b.h);
        });

        // Draw Windows (Tiny details)
        if (theme.buildings?.glow) {
            buildings.forEach(b => {
                if (rng() > 0.4) { // Only some buildings have windows
                    const cols = Math.floor(b.w / 6);
                    const rows = Math.floor(b.h / 10);
                    const winColor = windowColors[Math.floor(rng() * windowColors.length)];
                    ctx.fillStyle = winColor;

                    for (let r = 0; r < rows; r++) {
                        if (rng() > 0.6) continue;
                        for (let c = 0; c < cols; c++) {
                            if (rng() > 0.3) {
                                const wx = b.x + 2 + c * 5;
                                const wy = (drawHeight - b.h) + 5 + r * 8;
                                if (wy < drawHeight - 2) {
                                    ctx.fillRect(wx, wy, 2, 4);
                                }
                            }
                        }
                    }
                }
            });
        }

        // 7. Neutral Inner Area Mask (Optional? No, we rely on children to cover it)
        // The prompt says "City Space Cards are BORDER-ONLY designs".
        // This component just renders the background. The parent layout puts a "matte" or "image" on top.

    }, [themeId, width, height]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: 'inherit',
                    pointerEvents: 'none'
                }}
            />
            <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                {children}
            </div>
        </div>
    );
}
