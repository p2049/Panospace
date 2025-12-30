
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- VOID BLACK HOLE (The Nihilist Archtype) ---
// Concept: Gargantua-style accretion disk. Heavy gravity.
// Vibe: Terrifying, Awesome, Silent.
// Replacing the missing black hole banner.

const RENDER_CACHE = new Map();

function renderBlackHoleToCanvas(canvas, color) {
    if (!canvas) return '';
    const cacheKey = `cosmic_black_hole_${color}`;
    if (RENDER_CACHE.has(cacheKey)) return RENDER_CACHE.get(cacheKey);

    const ctx = canvas.getContext('2d');
    const w = 2560; // Banner Optimized Width
    const h = 800; // Banner Optimized Height
    canvas.width = w;
    canvas.height = h;

    const cx = w * 0.5;
    const cy = h * 0.5;

    const isBrand = color === 'brand';
    const resolveColor = (fallback) => {
        if (isBrand) return fallback;
        return color || fallback;
    };

    // 1. VOID BACKGROUND
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#000000');
    base.addColorStop(1, '#050005');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // 2. ACCRETION DISK (The flat spin)
    const drawDisk = (yOffset, scaleY, front) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, scaleY);

        const rStart = 150;
        const rEnd = 450;

        for (let i = 0; i < 200; i++) {
            const rad = rStart + Math.random() * (rEnd - rStart);
            const angle = Math.random() * Math.PI * 2;

            const z = Math.sin(angle);
            if (front && z < 0) continue;
            if (!front && z > 0) continue;

            const temp = Math.random();
            const particleColor = temp > 0.7 ? '#FFF'
                : (temp > 0.4 ? resolveColor(COLORS.ionBlue)
                    : (temp > 0.2 ? resolveColor(COLORS.solarPink) : resolveColor(COLORS.deepOrbitPurple)));

            const arcLen = 0.1 + Math.random() * 0.3;
            const wHalf = 1 + Math.random() * 2;

            const x1 = rad * Math.cos(angle);
            const y1 = rad * Math.sin(angle);

            const midAngle = angle + arcLen * 0.5;
            const xMidOut = (rad + wHalf) * Math.cos(midAngle);
            const yMidOut = (rad + wHalf) * Math.sin(midAngle);
            const xMidIn = (rad - wHalf) * Math.cos(midAngle);
            const yMidIn = (rad - wHalf) * Math.sin(midAngle);

            const endAngle = angle + arcLen;
            const x2 = rad * Math.cos(endAngle);
            const y2 = rad * Math.sin(endAngle);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(xMidOut, yMidOut, x2, y2);
            ctx.quadraticCurveTo(xMidIn, yMidIn, x1, y1);
            ctx.closePath();

            ctx.fillStyle = particleColor;
            ctx.globalAlpha = 0.2 + Math.random() * 0.4;
            ctx.globalCompositeOperation = 'screen';
            ctx.fill();
        }
        ctx.restore();
    };

    drawDisk(0, 0.3, false); // Back half

    // 3. THE EVENT HORIZON (Shadow Sphere)
    ctx.globalCompositeOperation = 'source-over';
    const sphere = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
    sphere.addColorStop(0, '#000');
    sphere.addColorStop(1, '#000');
    ctx.fillStyle = sphere;
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.fill();

    // 4. PHOTON RING (The thin light circle gravitylens)
    ctx.strokeStyle = resolveColor(COLORS.ionBlue);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 5;
    ctx.shadowColor = resolveColor(COLORS.ionBlue);
    ctx.beginPath();
    ctx.arc(cx, cy, 145, 0, Math.PI * 2);
    ctx.stroke();

    drawDisk(0, 0.3, true);

    // 5. GRAVITATIONAL LENSING (Top/Bottom warped disk)
    const drawWarp = (isTop) => {
        ctx.save();
        ctx.translate(cx, cy);

        ctx.beginPath();
        ctx.arc(0, 0, 250, isTop ? Math.PI : 0, isTop ? 0 : Math.PI);

        const grad = ctx.createRadialGradient(0, isTop ? -250 : 250, 50, 0, isTop ? -150 : 150, 200);
        grad.addColorStop(0, resolveColor(COLORS.deepOrbitPurple));
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.2;
        ctx.globalCompositeOperation = 'screen';
        ctx.fill();
        ctx.restore();
    };
    drawWarp(true);
    drawWarp(false);


    // 6. STARFIELD
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 800; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const dx = x - cx;
        const dy = y - cy;
        if (Math.sqrt(dx * dx + dy * dy) < 175) continue;

        const s = Math.random() * 1.5;
        ctx.fillStyle = '#FFF';
        ctx.globalAlpha = Math.random() * 0.8;
        ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
    }

    // 7. TEXT LEGIBILITY VIGNETTE
    ctx.globalCompositeOperation = 'multiply';
    const vig = ctx.createLinearGradient(0, 0, 0, h);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(0.6, '#00000000');
    vig.addColorStop(1, '#000000cc');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    const result = canvas.toDataURL('image/webp', 0.90);
    RENDER_CACHE.set(cacheKey, result);
    return result;
}

const BlackHoleBanner = ({ color }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const bg = renderBlackHoleToCanvas(canvasRef.current, color);
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

export default BlackHoleBanner;
