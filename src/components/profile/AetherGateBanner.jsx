
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- HYPER-GATE CITADEL (Refined Tech Banner) ---
// Concept: A massive orbital stargate structure.
// Elements:
// 1. Gyroscopic Rings (Mechanical Containment)
// 2. Solar Sails (Massive energy collectors)
// 3. Reactor Core (Pure light)
// Vibe: Grand, Technological, Apex Engineering.

const RENDER_CACHE = new Map();

const AetherGateBanner = ({ color: customColor }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const cacheKey = `aether_gate_${customColor || 'brand'}`;
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
        const cy = h * 0.5;

        const isBrand = customColor === 'brand';
        const resolveColor = (fallback) => {
            if (isBrand) return fallback;
            return customColor || fallback;
        };

        // 1. DEEP VOID BG
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
        grad.addColorStop(0, '#100520');
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 2. SOLAR SAILS (Geometric Energy Wings)
        const drawSail = (angle, length, color) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.moveTo(100, 0);
            ctx.lineTo(length, -100);
            ctx.lineTo(length + 50, 0);
            ctx.lineTo(length, 100);
            ctx.closePath();

            const sailGrad = ctx.createLinearGradient(100, 0, length, 0);
            sailGrad.addColorStop(0, color);
            sailGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = sailGrad;
            ctx.globalAlpha = 0.2;
            ctx.fill();

            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.8;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(100, 0);
            ctx.lineTo(length, 0);
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            ctx.stroke();

            ctx.restore();
        };

        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const col = i % 2 === 0 ? resolveColor(COLORS.ionBlue) : resolveColor(COLORS.solarPink);
            drawSail(a, 900, col);
        }

        // 3. GYROSCOPIC RINGS (Clean Tech)
        const drawRing = (rad, axisRotate, color, width) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(axisRotate);
            ctx.scale(1, 0.4);

            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'screen';
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFF';
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * Math.PI * 2;
                const x = rad * Math.cos(a);
                const y = rad * Math.sin(a);
                ctx.beginPath();
                ctx.moveTo(x - 5, y);
                ctx.lineTo(x + 5, y);
                ctx.stroke();
            }

            ctx.restore();
        };

        drawRing(500, 0, resolveColor(COLORS.stellarOrange), 4);
        drawRing(450, Math.PI / 3, resolveColor(COLORS.ionBlue), 8);
        drawRing(400, -Math.PI / 3, resolveColor(COLORS.deepOrbitPurple), 2);
        drawRing(800, Math.PI / 2, resolveColor(COLORS.auroraMint), 1);

        // 4. THE REACTOR CORE (Pure Energy)
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
        core.addColorStop(0, '#FFFFFF');
        core.addColorStop(0.1, resolveColor(COLORS.auroraMint));
        core.addColorStop(0.4, resolveColor(COLORS.ionBlue));
        core.addColorStop(1, 'transparent');

        ctx.fillStyle = core;
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.arc(cx, cy, 200, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = resolveColor(COLORS.ionBlue);
        ctx.globalAlpha = 0.2;
        ctx.fillRect(0, cy - 2, w, 4);

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

export default AetherGateBanner;
