
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- THE SINGULARITY (Panospace Prime) ---
// A convergence of all systems. The "Perfect" banner.
// Concept: A horizon where data becomes matter. High-fidelity refraction.

const RENDER_CACHE = new Map();

function renderSingularity(canvas, color) {
    if (!canvas) return '';
    const cacheKey = `singularity_prime_${color}`;
    if (RENDER_CACHE.has(cacheKey)) return RENDER_CACHE.get(cacheKey);

    const ctx = canvas.getContext('2d');
    const w = 1920;
    const h = 1080;
    canvas.width = w;
    canvas.height = h;

    const isBrand = color === 'brand';
    const resolveColor = (fallback) => {
        if (isBrand) return fallback;
        return color || fallback;
    };

    // 1. THE VOID SUBSTRATE (Obsidian)
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#000');
    base.addColorStop(1, '#08051a');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // 2. THE EVENT HORIZON (A perfect curve)
    const cx = w * 0.5;
    const cy = h * 0.85;

    // The Glow (Backlight)
    const glow = ctx.createRadialGradient(cx, cy, w * 0.1, cx, cy, w * 0.6);
    glow.addColorStop(0, resolveColor(COLORS.deepOrbitPurple));
    glow.addColorStop(0.5, resolveColor(COLORS.ionBlue));
    glow.addColorStop(1, 'transparent');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // The Tear (White Hot)
    ctx.globalCompositeOperation = 'source-over';
    const tear = ctx.createLinearGradient(0, cy - 20, 0, cy + 20);
    tear.addColorStop(0, 'transparent');
    tear.addColorStop(0.48, COLORS.iceWhite);
    tear.addColorStop(0.5, '#FFF');
    tear.addColorStop(0.52, COLORS.iceWhite);
    tear.addColorStop(1, 'transparent');

    ctx.fillStyle = tear;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.8, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. PRISMATIC DATA RAIN (Upward)
    ctx.globalCompositeOperation = 'screen';
    ctx.lineWidth = 1;

    for (let i = 0; i < 600; i++) {
        const x = Math.random() * w;
        const yStart = cy + (Math.random() - 0.5) * 50;
        const height = 50 + Math.random() * 400;

        const grad = ctx.createLinearGradient(0, yStart, 0, yStart - height);
        grad.addColorStop(0, Math.random() > 0.5 ? resolveColor(COLORS.auroraMint) : resolveColor(COLORS.solarPink));
        grad.addColorStop(1, 'transparent');

        ctx.strokeStyle = grad;
        ctx.globalAlpha = 0.1 + Math.random() * 0.2;
        ctx.beginPath();
        ctx.moveTo(x, yStart);
        ctx.lineTo(x, yStart - height);
        ctx.stroke();
    }

    // 5. FILM GRAIN (Atmosphere)
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 50000; i++) {
        ctx.globalAlpha = 0.03;
        ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }

    const result = canvas.toDataURL('image/webp', 0.95);
    RENDER_CACHE.set(cacheKey, result);
    return result;
}

const SingularityBanner = ({ color }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const bg = renderSingularity(canvasRef.current, color);
        setBgImage(bg);
    }, [color]);

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

export default SingularityBanner;
