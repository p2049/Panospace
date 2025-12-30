
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- THE OMEGASPHERE (The "Frontier" Banner) ---
// Concept: A Dyson Sphere of pure executable consciousness.
// Visuals: A recursive, ray-marched (simulated) sphere made of millions of data-shards.
//          It sits in a void of "Digital Flux" (Aurora/Nebula hybrid).
//          It has "Neural Tendrils" connecting to the edge of the frame.
// Tech: 
// - Simulated 3D projection onto 2D canvas.
// - High density particle system (CPU heavy generation, cached).
// - Complex layering of composite operations.
// Vibe: The Final Frontier of Computing.

const RENDER_CACHE = new Map();

const OmegasphereBanner = ({ color }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const cacheKey = `omegasphere_${color || 'brand'}`;
        if (RENDER_CACHE.has(cacheKey)) {
            setBgImage(RENDER_CACHE.get(cacheKey));
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = 1920;
        const h = 1080;
        canvas.width = w;
        canvas.height = h;

        const cx = w * 0.5;
        const cy = h * 0.45;

        const isBrand = color === 'brand';
        const resolveColor = (fallback) => isBrand ? fallback : (color || fallback);

        // 1. VOID SUBSTRATE (Deepest Digital Black)
        const voidGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
        voidGrad.addColorStop(0, '#020002');
        voidGrad.addColorStop(0.5, '#050205');
        voidGrad.addColorStop(1, '#000000');
        ctx.fillStyle = voidGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. THE DIGITAL FLUX (Background Nebula of Code)
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const s = Math.random() * 4;

            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (dist < 500) continue;

            ctx.fillStyle = Math.random() > 0.5 ? resolveColor(COLORS.deepOrbitPurple) : resolveColor(COLORS.ionBlue);
            ctx.globalAlpha = (Math.random() * 0.1) + 0.02;
            ctx.fillRect(x, y, s, s * 4);
        }

        // 3. THE OMEGASPHERE (3D Point Cloud Projection)
        const density = 800;
        const radius = 225;
        const phi = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < density; i++) {
            const y = 1 - (i / (density - 1)) * 2;
            const rRadius = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const x = Math.cos(theta) * rRadius;
            const z = Math.sin(theta) * rRadius;

            const scale = radius;
            const px = cx + x * scale;
            const py = cy + y * scale;

            const size = 1.5 + (z + 1) * 2;
            const alpha = 0.2 + (z + 1) * 0.4;

            if (z < -0.8) continue;

            ctx.save();
            ctx.translate(px, py);
            const rot = Math.atan2(y, x);
            ctx.rotate(rot);

            ctx.fillStyle = z > 0.5 ? resolveColor(COLORS.auroraMint)
                : (Math.random() > 0.5 ? resolveColor(COLORS.ionBlue) : resolveColor(COLORS.solarPink));

            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation = 'screen';

            ctx.beginPath();
            ctx.moveTo(-size, -size / 2);
            ctx.lineTo(size * 2, 0);
            ctx.lineTo(-size, size / 2);
            ctx.fill();

            ctx.restore();

            if (rRadius > 0.95 && Math.random() > 0.95) {
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(cx, cy);
                ctx.strokeStyle = resolveColor(COLORS.auroraMint);
                ctx.lineWidth = 0.5;
                ctx.globalAlpha = 0.1;
                ctx.stroke();
            }
        }

        // 4. THE CORE PROCESSOR (Inside the Sphere)
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
        core.addColorStop(0, resolveColor(COLORS.ionBlue));
        core.addColorStop(0.2, resolveColor(COLORS.auroraMint));
        core.addColorStop(0.5, 'transparent');

        ctx.fillStyle = core;
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.arc(cx, cy, 300, 0, Math.PI * 2);
        ctx.fill();

        // 5. ORBITAL RINGS (Holographic Interfaces)
        const drawHoloRing = (rad, tilt, ringColor) => {
            const scaledRad = rad * 0.5;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(tilt);
            ctx.scale(1, 0.2);

            ctx.beginPath();
            ctx.arc(0, 0, scaledRad, 0, Math.PI * 2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = ringColor;
            ctx.shadowColor = ringColor;
            ctx.shadowBlur = 10;
            ctx.globalAlpha = 0.8;
            ctx.stroke();

            ctx.setLineDash([10, 20]);
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.4;
            ctx.stroke();

            ctx.restore();
        };

        drawHoloRing(600, Math.PI / 4, resolveColor(COLORS.ionBlue));
        drawHoloRing(700, -Math.PI / 4, resolveColor(COLORS.deepOrbitPurple));
        drawHoloRing(900, 0, resolveColor(COLORS.solarPink));

        // 6. RAY TRACED BEAMS (Volumetric Lighting Rays)
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            const beamGrad = ctx.createLinearGradient(0, 0, w, 0);
            const beamColor = resolveColor(COLORS.auroraMint);
            beamGrad.addColorStop(0, beamColor + '1A');
            beamGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = beamGrad;
            ctx.globalCompositeOperation = 'screen';
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(w, -200);
            ctx.lineTo(w, 200);
            ctx.lineTo(0, 20);
            ctx.fill();

            ctx.restore();
        }

        // 7. VIGNETTE (Safety)
        ctx.globalCompositeOperation = 'multiply';
        const vig = ctx.createLinearGradient(0, 0, 0, h);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(0.5, 'transparent');
        vig.addColorStop(1, '#000');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        const result = canvas.toDataURL('image/webp', 0.95);
        RENDER_CACHE.set(cacheKey, result);
        setBgImage(result);

    }, [color]);

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

export default OmegasphereBanner;
