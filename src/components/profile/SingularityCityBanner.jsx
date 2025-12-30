
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- SINGULARITY CITY (The "Ultra" Banner) ---
// Concept: The "Northern Lights" CSS implementation as the skybox.
//          The "Black Hole" Canvas implementation floating in the sky.
//          The "City" Silhouette grounding the scale.
// "Literal Mix" of the best technologies.

// "Literal Mix" of the best technologies.

const RENDER_CACHE = new Map();

const SingularityCityBanner = ({ color: customColor }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const cacheKey = `singularity_city_${customColor || 'brand'}`;
        if (RENDER_CACHE.has(cacheKey)) {
            setBgImage(RENDER_CACHE.get(cacheKey));
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = 2560;
        const h = 800; // Banner-optimized height
        canvas.width = w;
        canvas.height = h;

        const cx = w * 0.5;
        const cy = h * 0.45; // Center the hole

        // --- LAYER 1: CANVAS VISUALS (Black Hole & City) ---
        // We do NOT draw a background rect here. We let the CSS Aurora show through.

        // 1. THE BLACK HOLE (Gargantua)
        // Accretion Disk - Tapered fluid curves
        const drawDisk = (scaleY, front) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, scaleY);

            const rStart = 350;
            const rEnd = 1100;

            // Optimized: 500 -> 200
            for (let i = 0; i < 200; i++) {
                const rad = rStart + Math.random() * (rEnd - rStart);
                const angle = Math.random() * Math.PI * 2;

                // Front/Back check
                const z = Math.sin(angle);
                if (front && z < 0) continue;
                if (!front && z > 0) continue;

                // Tapered shape logic
                const arcLen = 0.1 + Math.random() * 0.4;
                const wHalf = 3 + Math.random() * 5;

                const x1 = rad * Math.cos(angle);
                const y1 = rad * Math.sin(angle);
                const midAngle = angle + arcLen * 0.5;
                const xMidOut = (rad + wHalf) * Math.cos(midAngle);
                const yMidOut = (rad + wHalf) * Math.sin(midAngle);
                const xMidIn = (rad - wHalf) * Math.cos(midAngle);
                const yMidIn = (rad - wHalf) * Math.sin(midAngle);
                const x2 = rad * Math.cos(angle + arcLen);
                const y2 = rad * Math.sin(angle + arcLen);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.quadraticCurveTo(xMidOut, yMidOut, x2, y2);
                ctx.quadraticCurveTo(xMidIn, yMidIn, x1, y1);

                // Brand Colors
                const temp = Math.random();
                const isBrand = customColor === 'brand';
                const pColor = isBrand
                    ? (temp > 0.7 ? '#FFF' : (temp > 0.4 ? COLORS.ionBlue : (temp > 0.2 ? COLORS.solarPink : COLORS.deepOrbitPurple)))
                    : (customColor ? (temp > 0.5 ? customColor : '#FFF') : (temp > 0.7 ? '#FFF' : (temp > 0.4 ? COLORS.ionBlue : COLORS.deepOrbitPurple)));

                ctx.fillStyle = pColor;
                ctx.globalAlpha = 0.3 + Math.random() * 0.5;
                ctx.globalCompositeOperation = 'screen';
                ctx.fill();
            }
            ctx.restore();
        };

        drawDisk(0.25, false); // Back Disk

        // Event Horizon (The Black Sphere)
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000'; // Pure black hole
        ctx.beginPath();
        ctx.arc(cx, cy, 320, 0, Math.PI * 2);
        ctx.fill();

        // Photon Ring
        const photonColor = customColor && customColor !== 'brand' ? customColor : COLORS.ionBlue;
        ctx.strokeStyle = photonColor;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = photonColor;
        ctx.globalCompositeOperation = 'screen';
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset

        drawDisk(0.25, true); // Front Disk

        // 2. CITY SILHOUETTE (Grounding)
        // Drawing massive megastructures at the bottom
        ctx.globalCompositeOperation = 'source-over';
        const floorY = h;
        let currentX = 0;

        // Darken the bottom area for the city
        const cityGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
        cityGrad.addColorStop(0, 'transparent');
        cityGrad.addColorStop(1, '#000');
        ctx.fillStyle = cityGrad;
        ctx.fillRect(0, h * 0.5, w, h * 0.5);

        // Buildings
        while (currentX < w) {
            const bW = 50 + Math.random() * 150;
            const bH = 100 + Math.random() * 500;
            const bX = currentX;
            currentX += bW - 10;

            // Main block
            ctx.fillStyle = '#020205';
            ctx.fillRect(bX, floorY - bH, bW, bH);

            // Random Windows (Brand Colors)
            if (Math.random() > 0.4) {
                const cols = 2 + Math.floor(Math.random() * 3);
                const rows = 5 + Math.floor(Math.random() * 15);
                const winW = bW * 0.6 / cols;
                const winH = bH * 0.8 / rows;

                for (let r = 0; r < rows; r++) {
                    if (Math.random() > 0.5) continue;
                    for (let c = 0; c < cols; c++) {
                        const winColor = customColor && customColor !== 'brand'
                            ? (Math.random() > 0.3 ? customColor : '#FFF')
                            : (Math.random() > 0.5 ? COLORS.ionBlue : COLORS.auroraMint);
                        ctx.fillStyle = winColor;
                        ctx.globalAlpha = 0.6;
                        ctx.globalCompositeOperation = 'screen';
                        ctx.fillRect(bX + bW * 0.2 + c * winW * 1.2, floorY - bH + 20 + r * winH * 1.5, winW * 0.8, winH * 0.8);
                    }
                }
                ctx.globalAlpha = 1.0;
            }
        }

        // 3. VIGNETTE (Text Safety)
        ctx.globalCompositeOperation = 'multiply';
        const vig = ctx.createLinearGradient(0, 0, 0, h);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(0.5, 'transparent');
        vig.addColorStop(1, '#000000');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        const result = canvas.toDataURL('image/webp', 0.95);
        RENDER_CACHE.set(cacheKey, result);
        setBgImage(result);

    }, [customColor]);

    // --- CSS AURORA LAYER (From BannerThemeRenderer) ---
    // The "Literal" Northern Lights Background
    const isBrand = customColor === 'brand';
    const activeColor = customColor && !isBrand ? customColor : COLORS.auroraMint;

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#020205', // Deep space base
            overflow: 'hidden'
        }}>

            {/* 1. SVG FILTERS (Hidden) */}
            <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                <defs>
                    <filter id="aurora-curtains-banner">
                        <feTurbulence type="fractalNoise" baseFrequency="0.002 0.04" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="200" xChannelSelector="R" yChannelSelector="G" />
                        <feGaussianBlur stdDeviation="8" />
                    </filter>
                </defs>
            </svg>

            {/* 2. AURORA LAYERS */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                {/* Layer 1: Purple/Blue Deep Atmosphere wash */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: isBrand
                        ? 'linear-gradient(to top, rgba(90, 63, 255, 0.1) 0%, rgba(27, 130, 255, 0.0) 50%, rgba(90, 63, 255, 0.4) 100%)'
                        : `linear-gradient(to top, ${activeColor}1a 0%, transparent 50%, ${activeColor}33 100%)`,
                    filter: 'blur(30px)', opacity: 0.8
                }} />

                {/* Layer 2: Main Ribbon */}
                <div style={{
                    position: 'absolute', top: '-20%', left: '-20%', right: '-20%', bottom: '-20%',
                    transform: 'perspective(500px) rotateX(10deg) skewY(-5deg)',
                    filter: 'url(#aurora-curtains-banner) brightness(1.4)',
                    background: isBrand
                        ? 'repeating-linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1) 5%, rgba(0, 255, 136, 0.8) 15%, rgba(127, 255, 212, 0.5) 25%, transparent 35%, transparent 60%)'
                        : `repeating-linear-gradient(90deg, transparent, ${activeColor}1a 5%, ${activeColor}cc 15%, ${activeColor}80 25%, transparent 35%, transparent 60%)`,
                    opacity: 0.9, mixBlendMode: 'screen'
                }} />

                {/* Layer 3: Secondary Curtains (Offset) */}
                <div style={{
                    position: 'absolute', top: '20%', left: '-20%', right: '-20%', bottom: '-20%',
                    transform: 'perspective(500px) rotateX(20deg) skewY(2deg)',
                    filter: 'url(#aurora-curtains-banner) hue-rotate(30deg)',
                    background: isBrand
                        ? 'repeating-linear-gradient(90deg, transparent, transparent 30%, rgba(0, 255, 136, 0.5) 45%, transparent 60%)'
                        : `repeating-linear-gradient(90deg, transparent, transparent 30%, ${activeColor}80 45%, transparent 60%)`,
                    opacity: 0.7, mixBlendMode: 'screen'
                }} />

                {/* Layer 4: Pink Ionization Spikes (Brand Pink) */}
                <div style={{
                    position: 'absolute', top: '-10%', left: '-10%', right: '-10%', bottom: '0',
                    transform: 'perspective(500px) rotateX(15deg) skewY(-2deg)',
                    filter: 'url(#aurora-curtains-banner) blur(2px)',
                    background: isBrand
                        ? 'repeating-linear-gradient(90deg, transparent, transparent 40%, rgba(255, 42, 109, 0.7) 42%, transparent 45%, transparent 80%, rgba(255, 42, 109, 0.6) 82%, transparent 85%)'
                        : `repeating-linear-gradient(90deg, transparent, transparent 40%, ${activeColor}b3 42%, transparent 45%, transparent 80%, ${activeColor}99 82%, transparent 85%)`,
                    opacity: 1, mixBlendMode: 'screen'
                }} />
            </div>

            {/* 3. CANVAS OVERLAY (Black Hole & City) */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 1 // On top of Aurora
            }} />

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default SingularityCityBanner;
