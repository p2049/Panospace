
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- COSMIC GALAXY ---
// Concept: A massive, vibrant spiral galaxy seen from an angle.
// Colors: Deep Orbit Purple, Aurora Mint, Ion Blue, Solar Pink.
// Vibe: Grand, Colorful, Majestic.

const RENDER_CACHE = new Map();

function renderGalaxyToCanvas(canvas) {
    if (!canvas) return '';
    const cacheKey = 'cosmic_galaxy_v1';
    if (RENDER_CACHE.has(cacheKey)) return RENDER_CACHE.get(cacheKey);

    const ctx = canvas.getContext('2d');
    const w = 3840;
    const h = 2160;
    canvas.width = w;
    canvas.height = h;

    const cx = w * 0.5;
    const cy = h * 0.5;

    // 1. DEEP VOID BACKGROUND (Purple Tint)
    const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.8);
    base.addColorStop(0, '#100520'); // Deep purple center
    base.addColorStop(0.5, '#050210');
    base.addColorStop(1, '#000000');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // 2. GALAXY ARMS GENERATOR
    const drawArm = (armOffsetAngle, colorMix, dryness) => {
        ctx.save();
        ctx.translate(cx, cy);

        // Tilt the galaxy for cinematic perspective
        ctx.scale(1, 0.6);
        ctx.rotate(Math.PI / 3); // Diagonal-ish orientation

        const particles = 3000;
        const armLength = 1200;
        const twist = 4; // How many rotations

        for (let i = 0; i < particles; i++) {
            // Distribute particles along the arm
            const t = i / particles; // 0 to 1
            const dist = t * armLength;

            // Spiral math
            const angle = armOffsetAngle + (t * Math.PI * twist);

            // Random scatter (dryness controls how tight the arm is)
            const scatter = (Math.random() - 0.5) * (150 + t * 400) * dryness;
            const orthoScatter = (Math.random() - 0.5) * (50 + t * 100);

            const x = (dist + orthoScatter) * Math.cos(angle) - scatter * Math.sin(angle);
            const y = (dist + orthoScatter) * Math.sin(angle) + scatter * Math.cos(angle);

            // Size varies by distance (larger in center)
            const size = Math.random() * (3 - t * 2) + 0.5;

            // Color Logic
            const r = Math.random();
            let pColor = '#FFF';
            if (colorMix === 'cool') {
                // Blue / Mint / Purple
                pColor = r > 0.6 ? COLORS.ionBlue : (r > 0.3 ? COLORS.auroraMint : COLORS.deepOrbitPurple);
            } else {
                // Pink / Purple / Blue
                pColor = r > 0.6 ? COLORS.solarPink : (r > 0.3 ? COLORS.deepOrbitPurple : COLORS.ionBlue);
            }

            ctx.fillStyle = pColor;

            // Alpha fading at edges
            ctx.globalAlpha = (1 - t) * (0.1 + Math.random() * 0.4);
            ctx.globalCompositeOperation = 'screen';

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    // Draw Multiple Arms
    // Arm 1: Cool (Blue/Mint)
    drawArm(0, 'cool', 1.0);
    drawArm(0.1, 'cool', 0.5); // Accompanying dust lane

    // Arm 2: Warm (Pink/Purple) - Opposite side
    drawArm(Math.PI, 'warm', 1.0);
    drawArm(Math.PI + 0.1, 'warm', 0.5);

    // 3. CORE GLOW
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.6);
    ctx.rotate(Math.PI / 3);

    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
    core.addColorStop(0, '#FFFFFF');
    core.addColorStop(0.1, COLORS.solarPink);
    core.addColorStop(0.3, COLORS.deepOrbitPurple);
    core.addColorStop(1, 'transparent');

    ctx.fillStyle = core;
    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath();
    ctx.arc(0, 0, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();


    // 4. STARFIELD (Background & Foreground layering)
    const drawStars = (count, brightness) => {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const s = Math.random() * 2;
            ctx.fillStyle = Math.random() > 0.9 ? COLORS.auroraMint : '#FFF';
            ctx.globalAlpha = Math.random() * brightness;
            ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
        }
    };
    drawStars(1000, 0.8);

    // 5. VIGNETTE (Text Safety)
    ctx.globalCompositeOperation = 'multiply';
    const vig = ctx.createLinearGradient(0, 0, 0, h);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(0.5, 'transparent');
    vig.addColorStop(1, '#000000dd'); // Strong dark bottom
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    return canvas.toDataURL('image/webp', 0.95);
}

const GalaxyBanner = () => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const bg = renderGalaxyToCanvas(canvasRef.current);
        setBgImage(bg);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#050210',
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

export default GalaxyBanner;
