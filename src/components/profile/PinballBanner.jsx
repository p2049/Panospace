
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- HYPERSPACE CADET: MAX IMPACT ---
// Concept: The "XP League" vibe turned up to 11. 
// A Statement Piece. Massive geometry, blinding neon, aggressive perspective.
// "BOLDER."

const RENDER_CACHE = new Map();

function renderHyperspaceToCanvas(canvas) {
    if (!canvas) return '';
    const cacheKey = 'abstract_hyperspace_cadet_max_v4';
    if (RENDER_CACHE.has(cacheKey)) return RENDER_CACHE.get(cacheKey);

    const ctx = canvas.getContext('2d');
    const w = 3840;
    const h = 2160;
    canvas.width = w;
    canvas.height = h;

    const cx = w * 0.5;
    const cy = h * 0.5;

    // 1. DEEP VOID (High Contrast Base)
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#000000');
    base.addColorStop(1, '#050010'); // Subtle purple floor
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // 2. THE WARP TUNNEL (Aggressive Speed)
    // Massive, thick lines radiating out
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2;
        const x1 = cx + Math.cos(angle) * 100;
        const y1 = cy + Math.sin(angle) * 100;
        const x2 = cx + Math.cos(angle) * w;
        const y2 = cy + Math.sin(angle) * w;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.2, i % 2 === 0 ? COLORS.ionBlue : COLORS.deepOrbitPurple);
        grad.addColorStop(0.8, 'transparent');

        ctx.strokeStyle = grad;
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = i % 2 === 0 ? 0.4 : 0.1; // Alternating bright/dim
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // 3. THE HERO ARROWS (Removed at User Request)
    // The Statement is now purely the void and the grid.

    // 4. THE MAELSTROM RINGS (Background Texture)
    // Massive swirling green energy in the back
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    for (let i = 0; i < 10; i++) {
        const r = 400 + (i * 150);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.lineWidth = 40;
        ctx.strokeStyle = COLORS.auroraMint;
        ctx.globalAlpha = 0.05;
        ctx.stroke();
    }
    ctx.restore();

    // 5. DATA HUD ELEMENTS (Tech Detailing)
    const drawTechHex = (x, y, size) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
        }
        ctx.closePath();
        ctx.strokeStyle = COLORS.ionBlue;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
    };

    drawTechHex(w * 0.15, h * 0.5, 200);
    drawTechHex(w * 0.85, h * 0.5, 200);

    // 6. CHROMATIC ABERRATION SHIFT (The "Glitch")
    // Manually drawing offset copies (Simple version without pixel manip)
    // Ideally we'd do per-pixel but this is faster for static render

    // 7. HEAVY SCANLINES (The Texture)
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = '#000';
    for (let y = 0; y < h; y += 8) {
        ctx.fillRect(0, y, w, 4); // Thicker scanlines for boldness
    }

    // 8. VIGNETTE FRAMING
    ctx.globalCompositeOperation = 'multiply';
    const vig = ctx.createRadialGradient(cx, cy, h * 0.4, cx, cy, w * 0.9);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, '#000');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    return canvas.toDataURL('image/webp', 0.95);
}

const PinballBanner = () => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const bg = renderHyperspaceToCanvas(canvasRef.current);
        setBgImage(bg);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }} />

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default PinballBanner;
