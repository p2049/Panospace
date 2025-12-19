
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- HYPER-GLASS (The Construct) ---
// Concept: A study of pure geometry, refraction, and light. 
// v2: "Prismatic Cathedral" - High fidelity chromatic dispersion.

const RENDER_CACHE = new Map();

function renderHyperGlass(canvas) {
    if (!canvas) return '';
    const cacheKey = 'abstract_hyperglass_v3_prism';
    if (RENDER_CACHE.has(cacheKey)) return RENDER_CACHE.get(cacheKey);

    const ctx = canvas.getContext('2d');
    const w = 3840;
    const h = 2160;
    canvas.width = w;
    canvas.height = h;

    // 1. VOID SUBSTRATE
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#050510'); // Deepest void
    base.addColorStop(1, '#000000');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // 2. VOLUMETRIC FLOOR (Grounding)
    const floor = ctx.createLinearGradient(0, h * 0.8, 0, h);
    floor.addColorStop(0, 'transparent');
    floor.addColorStop(1, COLORS.deepOrbitPurple + '33');
    ctx.fillStyle = floor;
    ctx.fillRect(0, h * 0.8, w, h * 0.2);

    // --- PRISMATIC RENDERER ---
    // Simulates chromatic aberration by drawing channels separately
    const drawPrismShard = (x, y, w, h, angle, color) => {
        const drawPath = (ox, oy) => {
            ctx.save();
            ctx.translate(x + ox, y + oy);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(-w / 2, h / 2); // Bottom Left
            ctx.lineTo(w / 2, h / 2);  // Bottom Right
            ctx.lineTo(w / 4, -h / 2); // Top Right (Tapered)
            ctx.lineTo(-w / 4, -h / 2); // Top Left (Tapered)
            ctx.closePath();
            ctx.restore();
        };

        // Red Channel (Left Shift)
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = '#FF0055';
        ctx.globalAlpha = 0.4;
        drawPath(-4, 0);
        ctx.fill();

        // Blue Channel (Right Shift)
        ctx.fillStyle = '#0055FF';
        ctx.globalAlpha = 0.4;
        drawPath(4, 0);
        ctx.fill();

        // Core (The Glass)
        ctx.globalCompositeOperation = 'source-over';
        const grad = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
        grad.addColorStop(0, color + '11');
        grad.addColorStop(0.5, color + '88');
        grad.addColorStop(1, color + '22');
        ctx.fillStyle = grad;
        drawPath(0, 0);
        ctx.fill();

        // Rim Light (Sharp edges)
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        drawPath(0, 0);
        ctx.stroke();

        // Surface Reflection
        ctx.fillStyle = `linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)`;
        ctx.globalAlpha = 0.3;
        drawPath(0, 0);
        ctx.fill();
    };

    const cx = w / 2;
    const cy = h * 0.6;

    // 3. THE CATHEDRAL (Shard Cluster)
    // Back
    drawPrismShard(cx - 300, cy + 100, 400, 1600, -0.1, COLORS.deepOrbitPurple);
    drawPrismShard(cx + 300, cy + 100, 400, 1600, 0.1, COLORS.deepOrbitPurple);

    // Mid
    drawPrismShard(cx - 150, cy + 50, 300, 1400, -0.05, COLORS.ionBlue);
    drawPrismShard(cx + 150, cy + 50, 300, 1400, 0.05, COLORS.ionBlue);

    // Hero (Center)
    drawPrismShard(cx, cy, 350, 1800, 0, COLORS.iceWhite);

    // Floating Debris
    drawPrismShard(cx - 600, cy - 400, 100, 400, -0.3, COLORS.auroraMint);
    drawPrismShard(cx + 700, cy + 200, 120, 300, 0.4, COLORS.solarPink);


    // 4. ATMOSPHERIC PARTICLES
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const s = Math.random() * 4;
        ctx.fillStyle = Math.random() > 0.5 ? '#FFF' : COLORS.ionBlue;
        ctx.globalAlpha = Math.random() * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
    }

    // 5. MASTER GRAIN
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 80000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#FFF';
        ctx.globalAlpha = 0.04;
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }

    return canvas.toDataURL('image/webp', 0.95);
}

const HyperGlassBanner = () => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const bg = renderHyperGlass(canvasRef.current);
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

export default HyperGlassBanner;
