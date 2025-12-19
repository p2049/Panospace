
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- COSMIC DREAMWORLD: "STARDUST PLAYGROUND" ---
// Concept: A whimsical, childlike interpretation of spacetime.
// Features: Floating islands, soft pastel clouds, bubbly planets, and sparkling dust.
// Vibe: "Spacetime Freedom Happyland"

const RENDER_CACHE = new Map();
const LCG = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
};

function renderDreamworldToCanvas(canvas) {
    if (!canvas) return '';
    const cacheKey = `cosmic_dreamworld_v1`;
    if (RENDER_CACHE.has(cacheKey)) return RENDER_CACHE.get(cacheKey);

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const width = 1920;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    const rand = LCG(12345); // Joyful seed

    // 1. SKY OF INFINITE POSSIBILITY
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#2A0E61'); // Deep magic purple
    sky.addColorStop(0.5, '#7FDBFF'); // Aurora Blue
    sky.addColorStop(1, '#FFB7D5'); // Nebula Pink
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // 2. FLUFFY CLOUDS (The Softness)
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#FFFFFF';

    const drawCloud = (cx, cy, s) => {
        ctx.beginPath();
        ctx.arc(cx, cy, s, 0, Math.PI * 2);
        ctx.arc(cx + s * 0.7, cy - s * 0.5, s * 0.9, 0, Math.PI * 2);
        ctx.arc(cx + s * 1.4, cy, s * 0.8, 0, Math.PI * 2);
        ctx.fill();
    };

    for (let i = 0; i < 8; i++) {
        drawCloud(rand() * width, height * 0.6 + rand() * height * 0.4, 80 + rand() * 100);
    }

    // 3. BUBBLE PLANETS (The Wonder)
    // Shiny, glass-like spheres
    const drawPlanet = (x, y, r, color1, color2) => {
        const grd = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // High gloss reflection
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(x - r * 0.4, y - r * 0.4, r * 0.2, r * 0.1, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
    };

    drawPlanet(width * 0.8, height * 0.3, 120, COLORS.solarPink, '#FF5C8A'); // Big Pink
    drawPlanet(width * 0.2, height * 0.2, 80, COLORS.auroraMint, '#00CED1'); // Minty World
    drawPlanet(width * 0.5, height * 0.8, 40, COLORS.stellarOrange, '#FFD700'); // Little Gold

    // 4. FLOATING ISLANDS (The Adventure)
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#222'; // Silhouette islands
    // Simplified whimsical shapes would go here, representing "land" in the sky

    // 5. MAGIC DUST (The Freedom)
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 300; i++) {
        const x = rand() * width;
        const y = rand() * height;
        const s = rand() * 4;

        ctx.fillStyle = rand() > 0.5 ? COLORS.iceWhite : COLORS.classicMint;
        ctx.globalAlpha = rand();

        ctx.beginPath();
        // Star shape or simple sparkle
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
    }

    const dataURL = canvas.toDataURL('image/webp', 0.90);
    RENDER_CACHE.set(cacheKey, dataURL);
    return dataURL;
}

const DreamworldBanner = () => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const bg = renderDreamworldToCanvas(canvasRef.current);
        setBgImage(bg);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#2A0E61',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                // Subtle lift animation
                animation: 'dream-float 20s ease-in-out infinite alternate'
            }} />

            <style>{`
                @keyframes dream-float {
                    0% { transform: translateY(0) scale(1); }
                    100% { transform: translateY(-10px) scale(1.02); }
                }
            `}</style>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default DreamworldBanner;
