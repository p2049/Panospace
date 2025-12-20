
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- THE BLACK MIRROR (Vantablack Zen) ---
// Concept: Pure reflection. A glossy, liquid black surface with a single, perfect neon circle.
// Vibe: High-end fashion editorial. Minimalist. Expensive.

const RENDER_CACHE = new Map();

function renderBlackMirror(canvas) {
    if (!canvas) return '';
    const cacheKey = 'black_mirror_v1';
    if (RENDER_CACHE.has(cacheKey)) return RENDER_CACHE.get(cacheKey);

    const ctx = canvas.getContext('2d');
    const w = 3840;
    const h = 2160;
    canvas.width = w;
    canvas.height = h;

    // 1. LIQUID BLACK (The Surface)
    // Not flat black. A gradient that suggests a curved, polished surface.
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#0a0a0a');
    base.addColorStop(0.4, '#000000');
    base.addColorStop(0.6, '#000000');
    base.addColorStop(1, '#0f0f0f');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // 2. THE RING (The Subject)
    // A perfect circle of light, reflected on the floor.
    const cx = w * 0.5;
    const cy = h * 0.45;
    const r = h * 0.35;

    // The Reflection (Distorted, on the floor)
    ctx.save();
    ctx.translate(0, h * 0.85);
    ctx.scale(1, 0.2); // Squish vertically
    ctx.globalAlpha = 0.15;
    ctx.filter = 'blur(40px)';

    const reflectGrad = ctx.createLinearGradient(0, -r, 0, r);
    reflectGrad.addColorStop(0, COLORS.auroraMint);
    reflectGrad.addColorStop(1, COLORS.ionBlue);

    ctx.lineWidth = 40;
    ctx.strokeStyle = reflectGrad;
    ctx.beginPath();
    ctx.arc(cx, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // The Real Ring (Sharp, Floating)
    ctx.shadowBlur = 80;
    ctx.shadowColor = COLORS.ionBlue;
    ctx.lineWidth = 12;

    const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ringGrad.addColorStop(0, '#FFFFFF'); // White hot highlight
    ringGrad.addColorStop(0.2, COLORS.auroraMint);
    ringGrad.addColorStop(0.8, COLORS.ionBlue);
    ringGrad.addColorStop(1, COLORS.deepOrbitPurple);

    ctx.strokeStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // 3. CAUSTICS (The Glass Effect)
    // Subtle white highlights on the "lens" of the screen
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowBlur = 0;

    const glare = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.1);
    glare.addColorStop(0, 'transparent');
    glare.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    glare.addColorStop(1, 'transparent');
    ctx.fillStyle = glare;
    ctx.fillRect(0, 0, w, h);

    // 4. MIST (Atmosphere)
    // Low hanging fog
    const fog = ctx.createLinearGradient(0, h * 0.6, 0, h);
    fog.addColorStop(0, 'transparent');
    fog.addColorStop(1, 'rgba(27, 130, 255, 0.05)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, h * 0.6, w, h * 0.4);

    return canvas.toDataURL('image/webp', 0.95);
}

const BlackMirrorBanner = () => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const bg = renderBlackMirror(canvasRef.current);
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

export default BlackMirrorBanner;
