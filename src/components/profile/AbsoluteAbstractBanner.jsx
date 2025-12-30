
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- DETERMINISTIC SEED ---
const LCG = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
};

const RENDER_CACHE = new Map();

function renderAbstractToCanvas(canvas, variant, baseColor) {
    if (!canvas) return '';

    const cacheKey = `${variant}_${baseColor}`;
    if (RENDER_CACHE.has(cacheKey)) return RENDER_CACHE.get(cacheKey);

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const width = 1920;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    const rand = LCG(99999); // Fixed seed for aesthetic consistency

    // 1. CLEAR & BACKGROUND
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // 2. LAYERED GRADIENTS (Space Depth)
    const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, 100, width * 0.5, height * 0.5, 2000);
    grad.addColorStop(0, '#050510');
    grad.addColorStop(0.5, '#000000');
    grad.addColorStop(1, '#020205');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 3. GENERATIVE RIBBONS (The Silk)
    ctx.globalCompositeOperation = 'screen';

    const colors = [
        COLORS.ionBlue,
        COLORS.solarPink,
        COLORS.auroraMint,
        COLORS.deepOrbitPurple,
        COLORS.stellarOrange,
        COLORS.cosmicPeriwinkle
    ];

    const drawRibbon = (yOffset, freq, amp, color, weight, complexity) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = weight;
        ctx.shadowBlur = 25;
        ctx.shadowColor = color;

        ctx.moveTo(-200, yOffset);

        for (let x = -200; x <= width + 200; x += 5) {
            // High-complexity interference math
            const noise = Math.sin(x * freq * 2.1) * (amp * 0.3) +
                Math.sin(x * freq * 0.4) * (amp * 0.6) +
                Math.cos(x * freq * 5.5 + complexity) * (amp * 0.1);

            const y = yOffset +
                Math.sin(x * freq + complexity) * amp +
                noise;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    };

    // Generate 40 fine glowing ribbons (Reduced density for performance)
    for (let i = 0; i < 40; i++) {
        // If baseColor is provided and is a valid hex, use it primarily
        const isHex = baseColor && baseColor.startsWith('#');
        const c = isHex
            ? (rand() > 0.3 ? baseColor : colors[Math.floor(rand() * colors.length)])
            : colors[Math.floor(rand() * colors.length)];

        const yBase = height * 0.5 + (rand() - 0.5) * height * 1.2; // Overflow coverage
        const frequency = 0.0002 + rand() * 0.0018;
        const amplitude = 80 + rand() * 300;
        const complexity = rand() * Math.PI * 2;
        const opacity = 0.05 + rand() * 0.3;

        ctx.globalAlpha = opacity;
        drawRibbon(yBase, frequency, amplitude, c, rand() * 1.5 + 0.2, complexity);
    }

    // 4. DATA NODES (The Neural Part)
    ctx.globalAlpha = 0.6;
    for (let k = 0; k < 80; k++) {
        const px = rand() * width;
        const py = rand() * height;
        const size = rand() * 2;
        const glowColor = colors[Math.floor(rand() * colors.length)];

        ctx.fillStyle = glowColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = glowColor;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 5. PRISMATIC OVERLAY (Creative Flair)
    ctx.globalAlpha = 0.08;
    ctx.globalCompositeOperation = 'overlay';
    const prism = ctx.createLinearGradient(0, 0, width, height);
    prism.addColorStop(0, COLORS.solarPink);
    prism.addColorStop(0.5, COLORS.ionBlue);
    prism.addColorStop(1, COLORS.auroraMint);
    ctx.fillStyle = prism;
    ctx.fillRect(0, 0, width, height);

    // 6. DEPTH MASK (Vignette)
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'multiply';
    const vig = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, width / 1.2);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

    const dataURL = canvas.toDataURL('image/webp', 0.95);
    RENDER_CACHE.set(cacheKey, dataURL);
    return dataURL;
}

const AbsoluteAbstractBanner = ({ variant = 'neural_silk', color }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const bg = renderAbstractToCanvas(canvasRef.current, variant, color);
        setBgImage(bg);
    }, [variant, color]);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#010103',
            overflow: 'hidden'
        }}>
            {/* Base Background Texture */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 50% 50%, #0a0a20 0%, #000 100%)`,
                opacity: 0.5
            }} />

            {/* Generative Image Layer */}
            <div style={{
                position: 'absolute',
                inset: '-5%', // Extra room for motion
                width: '110%',
                height: '110%',
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                animation: 'neural-float 40s ease-in-out infinite'
            }} />

            {/* Prismatic Shimmer Layer */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(125deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                animation: 'shimmer 15s linear infinite',
                pointerEvents: 'none'
            }} />

            <style>{`
                @keyframes neural-float {
                    0%, 100% { transform: scale(1) translate(0, 0) rotate(0deg); opacity: 0.8; }
                    33% { transform: scale(1.05) translate(1%, 2%) rotate(0.5deg); opacity: 1; }
                    66% { transform: scale(1.03) translate(-1%, 1%) rotate(-0.5deg); opacity: 0.9; }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%) skewX(-25deg); }
                    100% { transform: translateX(200%) skewX(-25deg); }
                }
            `}</style>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default AbsoluteAbstractBanner;
