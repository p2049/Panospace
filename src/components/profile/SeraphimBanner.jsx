
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- DIGITAL SERAPHIM (The "Insane" Creative Banner) ---
// Concept: A "Biblically Accurate Angel" made of pure data and cyberpunk energy.
// Elements:
// 1. The Core (The Eye of the Machine)
// 2. The Ophanim (Interlocking Gyroscopic Rings of Code)
// 3. The Wings (Six massive wings of light/data streaks)
// 4. The Eyes (Floating observant orbs everywhere)
// Vibe: Overwhelming, Divine, Glitch-Tech, Hyper-Detailed.

const RENDER_CACHE = new Map();

const SeraphimBanner = ({ color: customColor }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const cacheKey = `seraphim_${customColor || 'brand'}`;
        if (RENDER_CACHE.has(cacheKey)) {
            setBgImage(RENDER_CACHE.get(cacheKey));
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = 3840;
        const h = 2160;
        canvas.width = w;
        canvas.height = h;

        const cx = w * 0.5;
        const cy = h * 0.45;

        const isBrand = customColor === 'brand';
        const resolveColor = (fallback) => {
            if (isBrand) return fallback;
            return customColor || fallback;
        };

        // 1. VOID BG
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#020002');
        grad.addColorStop(1, '#0b0210');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 2. THE WINGS (6 Massive Energy Arcs)
        const drawWing = (angle, scale, color) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.scale(scale, scale);

            for (let i = 0; i < 80; i++) {
                ctx.beginPath();
                const spread = (Math.random() - 0.5) * 200;
                const len = 600 + Math.random() * 800;

                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(200 + spread, 100, 400 + spread, 300, 50 + spread, len);

                ctx.strokeStyle = color;
                ctx.lineWidth = 1 + Math.random() * 2;
                ctx.globalAlpha = 0.1 + Math.random() * 0.3;
                ctx.globalCompositeOperation = 'screen';
                ctx.stroke();
            }

            for (let i = 0; i < 5; i++) {
                const x = 100 + Math.random() * 400;
                const y = 200 + Math.random() * 600;
                ctx.fillStyle = '#FFF';
                ctx.globalAlpha = 0.8;
                ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 20;
                ctx.shadowColor = color;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            ctx.restore();
        };

        const degToRad = (d) => d * Math.PI / 180;
        drawWing(degToRad(300), 1.2, resolveColor(COLORS.solarPink));
        drawWing(degToRad(240), 1.2, resolveColor(COLORS.solarPink));
        drawWing(degToRad(350), 1.3, resolveColor(COLORS.ionBlue));
        drawWing(degToRad(190), 1.3, resolveColor(COLORS.ionBlue));
        drawWing(degToRad(50), 1.1, resolveColor(COLORS.auroraMint));
        drawWing(degToRad(130), 1.1, resolveColor(COLORS.auroraMint));

        // 3. THE OPHANIM (Gyroscope Rings)
        const drawRing = (rad, axisRotate, color) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(axisRotate);
            ctx.scale(1, 0.3);

            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.lineWidth = 15;
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.6;
            ctx.globalCompositeOperation = 'screen';
            ctx.stroke();

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFF';
            ctx.globalAlpha = 0.9;
            ctx.stroke();

            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                const x = rad * Math.cos(a);
                const y = rad * Math.sin(a);
                ctx.beginPath();
                ctx.fillStyle = '#FFF';
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        };

        drawRing(400, 0, resolveColor(COLORS.stellarOrange));
        drawRing(350, Math.PI / 3, resolveColor(COLORS.ionBlue));
        drawRing(300, -Math.PI / 3, resolveColor(COLORS.solarPink));
        drawRing(500, Math.PI / 2, resolveColor(COLORS.deepOrbitPurple));

        // 4. THE CORE (Eye of the Machine)
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
        core.addColorStop(0, '#FFFFFF');
        core.addColorStop(0.2, resolveColor(COLORS.auroraMint));
        core.addColorStop(0.6, resolveColor(COLORS.deepOrbitPurple));
        core.addColorStop(1, 'transparent');

        ctx.fillStyle = core;
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.arc(cx, cy, 120, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 50; i++) {
            const vy = Math.random() * h;
            const hLine = Math.random() * 5;
            ctx.fillStyle = Math.random() > 0.5 ? resolveColor(COLORS.ionBlue) : resolveColor(COLORS.stellarOrange);
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(0, vy, w, hLine);
        }

        // 5. VIGNETTE
        ctx.globalCompositeOperation = 'multiply';
        const vig = ctx.createLinearGradient(0, 0, 0, h);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(0.6, 'transparent');
        vig.addColorStop(1, '#000');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        const result = canvas.toDataURL('image/webp', 0.95);
        RENDER_CACHE.set(cacheKey, result);
        setBgImage(result);

    }, [customColor]);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#020002',
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

export default SeraphimBanner;
