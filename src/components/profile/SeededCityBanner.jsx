import React, { useRef, useEffect, useMemo } from 'react';

// --- BRAND COLORS ---
const BRAND = {
    iceWhite: '#F2F7FA',
    auroraBlue: '#7FDBFF',
    ionBlue: '#1B82FF',
    nebulaPink: '#FFB7D5',
    solarPink: '#FF5C8A',
    deepOrbitPurple: '#5A3FFF',
    stellarOrange: '#FF914D',
    classicMint: '#7FFFD4',
    auroraMint: '#8CFFE9',
    darkNebula: '#0A1A3A',
    voidPurple: '#2A0E61',
    black: '#000000'
};

const BRAND_KEYS = Object.keys(BRAND);
const WINDOW_CANDIDATES = [
    BRAND.iceWhite, BRAND.auroraBlue, BRAND.ionBlue, BRAND.nebulaPink,
    BRAND.solarPink, BRAND.stellarOrange, BRAND.classicMint, BRAND.auroraMint
];
const SKY_CANDIDATES = [
    BRAND.black, BRAND.darkNebula, BRAND.voidPurple, BRAND.deepOrbitPurple,
    BRAND.ionBlue, BRAND.midnightBlue
];

// --- UTILS ---
const hashStr = (str) => {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h >>> 0) / 4294967296;
    }
};

class SeededRNG {
    constructor(seedStr) {
        this.rand = hashStr(seedStr);
    }
    next() { return this.rand(); }
    range(min, max) { return min + this.next() * (max - min); }
    int(min, max) { return Math.floor(this.range(min, max + 1)); }
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
}

const SeededCityBanner = ({ seed = 'Panospace', animationsEnabled = true }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = React.useState('');

    const config = useMemo(() => {
        const safeSeed = seed || 'Panospace';
        const rng = new SeededRNG(safeSeed);

        // 1. DYNAMIC PALETTE GENERATION
        // Sky: 2 to 3 colors
        const skyCount = rng.int(2, 3);
        const sky = [];
        // Always start with something dark-ish
        sky.push(rng.pick([BRAND.black, BRAND.darkNebula, BRAND.voidPurple]));
        for (let i = 1; i < skyCount; i++) {
            sky.push(rng.pick([BRAND.deepOrbitPurple, BRAND.ionBlue, BRAND.voidPurple, BRAND.black, BRAND.darkNebula]));
        }

        // Windows: 1 to 6 colors
        const windowCount = rng.int(1, 6);
        const windowColors = [];
        // Shuffle candidates logic-lite
        const candidates = [...WINDOW_CANDIDATES];
        for (let i = 0; i < windowCount; i++) {
            if (candidates.length === 0) break;
            const idx = rng.int(0, candidates.length - 1);
            windowColors.push(candidates[idx]);
            candidates.splice(idx, 1); // remove to avoid dupe
        }

        // Building Base
        const building = rng.pick([BRAND.black, BRAND.black, BRAND.darkNebula, '#050510']);
        const accent = rng.pick(WINDOW_CANDIDATES);
        const glow = rng.pick(WINDOW_CANDIDATES);

        const palette = { sky, building, windowColor: windowColors, accent, glow };

        // 2. CITY LAYOUT (5 Layers)
        const layers = [];
        for (let layer = 0; layer < 5; layer++) {
            const layerBuildings = [];
            let currentX = -0.1;
            // Slightly randomised start to prevent identical edge artifacts
            // currentX -= rng.next() * 0.2; 
            const endX = 1.1;

            while (currentX < endX) {
                // Nominal logic
                const nominalWidth = 60 + rng.next() * 80;
                const wPct = nominalWidth / 3840;

                const maxH = 1080 * 0.25;
                const nominalHeight = (maxH * 0.2) + (rng.next() * maxH * 0.8);
                const hPct = nominalHeight / 1080;

                layerBuildings.push({
                    xPct: currentX,
                    wPct: wPct,
                    hPct: hPct,
                    seed: rng.next(),
                    type: rng.next() > 0.85 ? 'spire' : 'block'
                });

                const gap = (10 + rng.next() * 30) / 3840;
                currentX += wPct + gap;
            }
            layers.push(layerBuildings);
        }

        // 3. Sky Features
        const hasMoon = rng.next() > 0.5;
        const moonX = rng.range(0.1, 0.9);
        const moonSize = rng.range(30, 80);

        return { palette, layers, hasMoon, moonX, moonSize };

    }, [seed]);

    // Helpers
    const hexToRgb = (hex) => {
        if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
        // Shorthand
        if (hex.length === 4) return {
            r: parseInt(hex[1] + hex[1], 16),
            g: parseInt(hex[2] + hex[2], 16),
            b: parseInt(hex[3] + hex[3], 16)
        };
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        };
    };
    const mixColors = (c1, c2, amt) => {
        const rgb1 = hexToRgb(c1);
        const rgb2 = hexToRgb(c2);
        const r = Math.round(rgb1.r * amt + rgb2.r * (1 - amt));
        const g = Math.round(rgb1.g * amt + rgb2.g * (1 - amt));
        const b = Math.round(rgb1.b * amt + rgb2.b * (1 - amt));
        return `rgb(${r},${g},${b})`;
    };

    // --- DRAW ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        const width = 2560;
        const height = 800;
        canvas.width = width;
        canvas.height = height;

        // 1. SKY
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        config.palette.sky.forEach((stop, i) => {
            grad.addColorStop(i / (config.palette.sky.length - 1), stop);
        });
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // 1.5 STARS
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 200; i++) {
            const sx = Math.random() * width;
            const sy = Math.random() * (height * 0.85);
            const size = Math.random() * 2;
            ctx.globalAlpha = Math.random() * 0.8 + 0.2;
            ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // 2. MOON
        if (config.hasMoon) {
            ctx.save();
            ctx.fillStyle = '#FFF';
            ctx.shadowBlur = 40;
            ctx.shadowColor = config.palette.glow;
            ctx.beginPath();
            ctx.arc(config.moonX * width, height * 0.2, config.moonSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 3. LAYERS
        const drawCityLayer = (baseY, scale, layerIndex) => {
            const ls = scale || 1;
            const isSuperFar = layerIndex === 0;
            const isFar = layerIndex === 1;
            const isMidBack = layerIndex === 2;
            const isMid = layerIndex === 3;
            const isNear = layerIndex === 4;

            const fogColor = '#000000';
            let depthFactor = 1.0;
            if (isSuperFar) depthFactor = 0.45;
            else if (isFar) depthFactor = 0.60;
            else if (isMidBack) depthFactor = 0.75;
            else if (isMid) depthFactor = 0.90;

            const solidLayerColor = mixColors(config.palette.building, fogColor, depthFactor);
            ctx.filter = (isSuperFar) ? 'blur(2px)' : 'none';
            ctx.globalAlpha = 1.0;

            // GROUND FOR LAYER
            // Draw a rect from baseY to bottom
            ctx.fillStyle = solidLayerColor;
            ctx.fillRect(0, baseY, width, height - baseY);

            const layerBuildings = config.layers[layerIndex];

            // Re-instantiate LCG for rendering to keep drawing deterministic per building
            const LCG = (s) => () => {
                s = (s * 1664525 + 1013904223) % 4294967296;
                return s / 4294967296;
            };

            layerBuildings.forEach(b => {
                let currentX = b.xPct * width;
                let bw = (b.wPct * width) * ls;
                let bh = (b.hPct * height) * ls;

                if (bw < 2 || currentX > width) return;

                // DRAW BUILDING
                const rand = LCG(Math.floor(b.seed * 4294967296));
                const randomConfig = (arr) => arr[Math.floor(rand() * arr.length)];

                ctx.fillStyle = solidLayerColor;

                // Shape
                if (b.type === 'spire') {
                    ctx.beginPath();
                    ctx.moveTo(currentX, baseY);
                    ctx.lineTo(currentX + bw / 2, baseY - bh);
                    ctx.lineTo(currentX + bw, baseY);
                    ctx.fill();
                } else {
                    ctx.fillRect(currentX, baseY - bh, bw, bh);
                    if (bw > 80 * ls) { // Detail
                        ctx.fillStyle = 'rgba(0,0,0,0.2)';
                        ctx.fillRect(currentX + bw * 0.3, baseY - bh, bw * 0.1, bh);
                        ctx.fillRect(currentX + bw * 0.6, baseY - bh, bw * 0.1, bh);
                    }
                }

                // Windows
                if (b.type !== 'spire') {
                    const winSize = (isNear ? 5 : (isMid ? 3 : 2)) * ls;
                    const gap = (isNear ? 12 : (isMid ? 8 : 6)) * ls;
                    const windowChance = ((isFar || ls < 0.5) ? 0.02 : (isMid ? 0.3 : 0.6));

                    let hasLitWindow = false;
                    for (let wy = baseY - bh + 10; wy < baseY - 5; wy += gap) {
                        if (wy > baseY - 10) continue;
                        for (let wx = currentX + 5; wx < currentX + bw - 5; wx += gap) {
                            if (rand() > (1 - windowChance) || (!hasLitWindow && isNear)) {
                                ctx.globalAlpha = 1.0;
                                ctx.fillStyle = randomConfig(config.palette.windowColor);

                                ctx.fillRect(wx, wy, winSize, winSize);
                                hasLitWindow = true;
                            }
                        }
                    }
                    ctx.globalAlpha = 1.0;
                } else {
                    // Spire light
                    ctx.fillStyle = config.palette.glow;
                    ctx.fillRect(currentX + bw / 2 - ls, baseY - bh + (bh * 0.2), ls * 2, bh * 0.7);
                }

            });
            ctx.filter = 'none';
        };

        // Render Stack
        drawCityLayer(height * 0.82, 0.3, 0);
        drawCityLayer(height * 0.85, 0.45, 1);
        drawCityLayer(height * 0.89, 0.60, 2);
        drawCityLayer(height * 0.94, 0.80, 3);
        drawCityLayer(height * 1.0, 1.0, 4);

        // Vignette
        const vig = ctx.createLinearGradient(0, 0, 0, height);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(0.5, 'transparent');
        vig.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, width, height);

        setBgImage(canvas.toDataURL());

    }, [config]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center bottom',
                zIndex: 1
            }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default SeededCityBanner;
