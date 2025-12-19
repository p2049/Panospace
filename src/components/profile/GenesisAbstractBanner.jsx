
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- GENESIS CORE V3: "THE LIVING AURA" (Optimized & Brand Compliant) ---
// Concept: Fluid light energy using strictly PanoSpace brand colors.
// Performance: Baked canvas filters, CSS-only animations disabled on mobile.

const RENDER_CACHE = new Map();

function renderAuraToCanvas(canvas) {
    if (!canvas) return '';

    const cacheKey = `genesis_aura_v3_brand`;
    if (RENDER_CACHE.has(cacheKey)) return RENDER_CACHE.get(cacheKey);

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const width = 1920;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // 1. BRAND BASE: Void Purple Deep
    // We mix black with void purple for a rich, dark substrate
    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, COLORS.black);
    baseGrad.addColorStop(1, '#05020a'); // Very dark void purple variant
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. ORBS OF BEING (Brand Palette Only)
    // Baking the blur for performance
    ctx.filter = 'blur(80px)';
    ctx.globalCompositeOperation = 'screen';

    const orbs = [
        { x: 0.2, y: 0.3, r: 0.5, c: COLORS.deepOrbitPurple }, // The Deep
        { x: 0.8, y: 0.7, r: 0.6, c: COLORS.solarPink },       // The Passion
        { x: 0.5, y: 0.5, r: 0.4, c: COLORS.ionBlue },         // The Logic
        { x: 0.1, y: 0.9, r: 0.5, c: COLORS.auroraMint },      // The Growth
        { x: 0.9, y: 0.1, r: 0.4, c: COLORS.stellarOrange }    // The Will
    ];

    orbs.forEach(orb => {
        const cx = width * orb.x;
        const cy = height * orb.y;
        const r = height * orb.r;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, orb.c);
        grad.addColorStop(0.6, orb.c + '66');
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.filter = 'none'; // Reset

    // 3. INTERFERENCE MESH (Brand White)
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = COLORS.iceWhite;
    for (let y = 0; y < height; y += 4) {
        ctx.globalAlpha = 0.02;
        ctx.fillRect(0, y, width, 1);
    }

    // 4. FOCUS VIGNETTE
    ctx.globalCompositeOperation = 'multiply';
    const vig = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, height * 0.9);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

    const dataURL = canvas.toDataURL('image/webp', 0.90);
    RENDER_CACHE.set(cacheKey, dataURL);
    return dataURL;
}

const GenesisAbstractBanner = () => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const bg = renderAuraToCanvas(canvasRef.current);
        setBgImage(bg);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: COLORS.black,
            overflow: 'hidden'
        }}>
            {/* 
                PERFORMANCE ARCHITECTURE:
                - Mobile: Static, high-quality compose.
                - Desktop: 2-Layer fluid animation (reduced from 3).
                - No runtime CSS filters (blur baked).
            */}

            {/* Layer 1: Primary Aura (Static on Mobile, Drifts on Desktop) */}
            <div className="genesis-layer genesis-layer-1" style={{
                backgroundImage: `url(${bgImage})`
            }} />

            {/* Layer 2: Interference (Hidden on Mobile, Drifts on Desktop) */}
            {/* Blends with overlay to create shifting secondary brand colors */}
            <div className="genesis-layer genesis-layer-2" style={{
                backgroundImage: `url(${bgImage})`
            }} />

            <style>{`
                .genesis-layer {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    will-change: transform;
                }

                /* --- MOBILE (Default) --- */
                .genesis-layer-1 {
                    opacity: 1.0;
                    transform: scale(1.1); /* Slight zoom for drama */
                }
                .genesis-layer-2 {
                    display: none; /* Save GPU on phones */
                }

                /* --- DESKTOP (>768px) --- */
                @media (min-width: 768px) {
                    .genesis-layer-1 {
                        inset: -10%;
                        width: 120%;
                        height: 120%;
                        opacity: 0.9;
                        animation: aura-drift-1 35s ease-in-out infinite alternate;
                    }

                    .genesis-layer-2 {
                        display: block;
                        inset: -10%;
                        width: 120%;
                        height: 120%;
                        mix-blend-mode: overlay;
                        opacity: 0.6;
                        animation: aura-drift-2 28s ease-in-out infinite alternate-reverse;
                    }
                }

                @keyframes aura-drift-1 {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(-4%, -2%) scale(1.05); }
                }
                @keyframes aura-drift-2 {
                    0% { transform: translate(0, 0) scale(1.05); }
                    100% { transform: translate(4%, 3%) scale(1); }
                }
            `}</style>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default GenesisAbstractBanner;
