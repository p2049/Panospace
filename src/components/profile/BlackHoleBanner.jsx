
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- VOID BLACK HOLE (The Nihilist Archtype) ---
// Concept: Gargantua-style accretion disk. Heavy gravity.
// Vibe: Terrifying, Awesome, Silent.
// Replacing the missing black hole banner.

const RENDER_CACHE = new Map();

function renderBlackHoleToCanvas(canvas) {
    if (!canvas) return '';
    const cacheKey = 'cosmic_black_hole_v1';
    if (RENDER_CACHE.has(cacheKey)) return RENDER_CACHE.get(cacheKey);

    const ctx = canvas.getContext('2d');
    const w = 3840;
    const h = 2160;
    canvas.width = w;
    canvas.height = h;

    const cx = w * 0.5;
    const cy = h * 0.5;

    // 1. VOID BACKGROUND
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#000000');
    base.addColorStop(1, '#050005');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // 2. ACCRETION DISK (The flat spin)
    // We draw this *behind* the sphere first
    const drawDisk = (yOffset, scaleY, front) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, scaleY);

        const rStart = 300;
        const rEnd = 900;

        for (let i = 0; i < 400; i++) {
            const rad = rStart + Math.random() * (rEnd - rStart);
            const angle = Math.random() * Math.PI * 2;

            // Front occlusion check logic roughly
            const z = Math.sin(angle);
            if (front && z < 0) continue;
            if (!front && z > 0) continue;

            // Color temp (STRICT BRAND COLORS)
            const temp = Math.random();
            const color = temp > 0.7 ? '#FFF'
                : (temp > 0.4 ? COLORS.ionBlue
                    : (temp > 0.2 ? COLORS.solarPink : COLORS.deepOrbitPurple));

            // TAPERED STREAK (Pointed Ends)
            const arcLen = 0.1 + Math.random() * 0.3;
            const wHalf = 2 + Math.random() * 4;

            // Calc points for fluid tapered shape
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

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.2 + Math.random() * 0.4;
            ctx.globalCompositeOperation = 'screen';
            ctx.fill();
        }
        ctx.restore();
    };

    drawDisk(0, 0.3, false); // Back half

    // 3. THE EVENT HORIZON (Shadow Sphere)
    ctx.globalCompositeOperation = 'source-over';
    const sphere = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
    sphere.addColorStop(0, '#000');
    sphere.addColorStop(1, '#000');
    ctx.fillStyle = sphere;
    ctx.beginPath();
    ctx.arc(cx, cy, 280, 0, Math.PI * 2); // Slightly smaller than disk start
    ctx.fill();

    // 4. PHOTON RING (The thin light circle gravitylens)
    ctx.strokeStyle = COLORS.ionBlue; // Blue-shift photon ring
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.ionBlue;
    ctx.beginPath();
    ctx.arc(cx, cy, 290, 0, Math.PI * 2);
    ctx.stroke();

    // Disk Front
    drawDisk(0, 0.3, true);

    // 5. GRAVITATIONAL LENSING (Top/Bottom warped disk)
    // The "Hump" of light that bends over the top
    const drawWarp = (isTop) => {
        ctx.save();
        ctx.translate(cx, cy);

        ctx.beginPath();
        // Semi circle arch
        ctx.arc(0, 0, 500, isTop ? Math.PI : 0, isTop ? 0 : Math.PI);

        const grad = ctx.createRadialGradient(0, isTop ? -500 : 500, 100, 0, isTop ? -300 : 300, 400);
        grad.addColorStop(0, COLORS.deepOrbitPurple); // Brand Purple Warp
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
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        // Avoid center
        const dx = x - cx;
        const dy = y - cy;
        if (Math.sqrt(dx * dx + dy * dy) < 350) continue;

        const s = Math.random() * 2;
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

    return canvas.toDataURL('image/webp', 0.95);
}

const BlackHoleBanner = () => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const bg = renderBlackHoleToCanvas(canvasRef.current);
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

export default BlackHoleBanner;
