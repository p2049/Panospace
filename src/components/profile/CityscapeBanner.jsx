
import React, { useRef, useEffect, useState } from 'react';

// --- PANOSPACE BRAND PALETTE ---
const COLORS = {
    iceWhite: '#F2F7FA',
    auroraBlue: '#7FDBFF',
    ionBlue: '#1B82FF',
    nebulaPink: '#FFB7D5',
    solarPink: '#FF5C8A',
    cosmicPeriwinkle: '#A7B6FF',
    deepOrbitPurple: '#5A3FFF',
    stellarOrange: '#FF914D',
    classicMint: '#7FFFD4',
    auroraMint: '#8CFFE9',
    darkNebula: '#0A1A3A',
    voidPurple: '#2A0E61',
    black: '#000000'
};

// --- DETERMINISTIC STATIC CITY GENERATOR ---
// "The skyline must always appear identical"
const LCG = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
};

const GENERATE_STATIC_CITY = () => {
    const buildings = [];
    const rand = LCG(123456789); // FIXED SEED FOREVER

    // Generate 5 Layers of fixed buildings
    for (let layer = 0; layer < 5; layer++) {
        let currentX = -0.1; // Start off-screen
        const endX = 1.1; // End off-screen

        while (currentX < endX) {
            // Restore Original Proportions (Tall & Thin)
            const nominalWidth = 60 + rand() * 80;
            const wPct = nominalWidth / 3840;

            const maxH = 1080 * 0.25;
            const nominalHeight = (maxH * 0.2) + (rand() * maxH * 0.8);
            const hPct = nominalHeight / 1080;

            buildings.push({
                layer,
                xPct: currentX,
                wPct: wPct,
                hPct: hPct,
                seed: rand(),
                type: rand() > 0.8 ? 'spire' : 'block'
            });

            const gap = (10 + rand() * 30) / 3840;
            currentX += wPct + gap;
        }
    }
    return buildings; // .sort if needed, but layers are separate
};

const STATIC_CITY = GENERATE_STATIC_CITY();

// --- THEME CONFIGURATIONS ---
const CITY_THEMES = {
    // 1. Vaporwave Neon City (Grid)
    'city_vaporwave': {
        sky: [COLORS.deepOrbitPurple, COLORS.nebulaPink, COLORS.auroraBlue],
        buildings: { color: '#1a0b2e', windowColor: [COLORS.auroraBlue, COLORS.solarPink], density: 0.6, glow: true },
        atmosphere: { stars: true, grid: true },
        celestial: { type: 'sun', color: [COLORS.solarPink, COLORS.stellarOrange], y: 0.4 }
    },
    'city_realistic': {
        sky: [COLORS.black, '#0d1b2a', '#1b263b'],
        buildings: { color: '#050a10', windowColor: ['#fff8dc', '#f0e68c'], density: 1.0, glow: false },
        atmosphere: { stars: true },
        celestial: { type: 'none' }
    },
    'city_retrowave': {
        sky: [COLORS.voidPurple, COLORS.black],
        buildings: { color: '#000', windowColor: [COLORS.auroraMint, COLORS.solarPink], density: 0.3, glow: true },
        atmosphere: { stars: true, grid: true },
        celestial: { type: 'split-sun', color: [COLORS.solarPink, COLORS.stellarOrange], y: 0.5 }
    },
    'city_cyberpunk': {
        sky: [COLORS.black, '#0a0a0a'],
        buildings: { color: '#050505', windowColor: [COLORS.ionBlue, COLORS.classicMint, COLORS.solarPink], density: 1.0, glow: true },
        atmosphere: { rain: true, stars: true, fog: COLORS.darkNebula },
        celestial: { type: 'none' }
    },
    'city_anime': {
        sky: [COLORS.ionBlue, COLORS.auroraBlue, '#dbeafe'],
        buildings: { color: '#1e293b', windowColor: ['#fef3c7'], density: 0.8, glow: true },
        mountains: { color: '#0f172a', height: 0.6 },
        atmosphere: { stars: true, clouds: true },
        celestial: { type: 'moon', color: '#fff', x: 0.8, y: 0.2 }
    },
    'city_desert': {
        sky: [COLORS.voidPurple, COLORS.stellarOrange],
        buildings: { color: '#270830', windowColor: [COLORS.stellarOrange], density: 0.4, glow: true },
        atmosphere: { stars: true },
        foreground: { type: 'dunes', color: '#1a0523' },
        celestial: { type: 'sun', color: [COLORS.stellarOrange, COLORS.solarPink], y: 0.8 }
    },
    'city_glitch': {
        sky: [COLORS.black, COLORS.darkNebula],
        buildings: { color: '#000', windowColor: [COLORS.classicMint, COLORS.solarPink, COLORS.ionBlue, COLORS.iceWhite], density: 1.0, glow: true },
        atmosphere: { glitch: true, stars: true },
        celestial: { type: 'none' }
    },
    'city_aero': {
        sky: [COLORS.ionBlue, COLORS.auroraMint],
        buildings: { color: '#e0f2fe', windowColor: [COLORS.auroraBlue], density: 0.3, glow: true },
        atmosphere: { clouds: true, stars: true },
        celestial: { type: 'ring-planet', color: COLORS.iceWhite, x: 0.2, y: 0.3 }
    },
    'city_smog': {
        sky: [COLORS.voidPurple, '#1a1a1a'],
        buildings: { color: '#111', windowColor: [COLORS.classicMint], density: 1.0, glow: true },
        atmosphere: { stars: true, fog: COLORS.classicMint },
        celestial: { type: 'none' }
    },
    'city_holo': {
        sky: ['#000', '#001a33'],
        buildings: { type: 'wireframe', color: COLORS.ionBlue, windowColor: [COLORS.ionBlue], density: 0.5, glow: true },
        atmosphere: { grid: true, bloom: true, stars: true },
        celestial: { type: 'none' }
    },

    // --- CITY-3000 PACK (High-Res Procedural Editions) ---

    // 13. Neon Street -> Cyber Density
    'city3000_street': {
        sky: [COLORS.black, COLORS.darkNebula, '#1A0B2E'],
        buildings: { color: '#080808', windowColor: [COLORS.ionBlue, COLORS.solarPink, COLORS.classicMint], density: 1.2, glow: true },
        atmosphere: { rain: true, stars: true, traffic: true },
        celestial: { type: 'none' }
    },
    // 15. Flying Car District
    'city3000_cars': {
        sky: [COLORS.black, COLORS.darkNebula],
        buildings: { color: '#050505', windowColor: [COLORS.ionBlue, COLORS.classicMint], density: 1.1, glow: true },
        atmosphere: { stars: true, traffic: true },
        celestial: { type: 'none' }
    },
    // 16. Chinatown -> Red/Gold Cyber
    'city3000_chinatown': {
        sky: [COLORS.black, '#1a0505'], // Reddish dark
        buildings: { color: '#0f0505', windowColor: [COLORS.stellarOrange, COLORS.solarPink, '#ff3333'], density: 1.0, glow: true },
        atmosphere: { stars: true, rain: true, monorail: true },
        celestial: { type: 'none' }
    },

    // --- THE MAGNUM OPUS: PANOSPACE ULTRA ---
    'city3000_ultra': {
        sky: [COLORS.black, COLORS.voidPurple, COLORS.deepOrbitPurple, COLORS.ionBlue],
        buildings: {
            color: '#020204',
            windowColor: [COLORS.solarPink, COLORS.auroraMint, COLORS.ionBlue, COLORS.iceWhite],
            density: 1.3, // Maximum density
            glow: true
        },
        atmosphere: {
            stars: true,
            ultra_fx: true, // Special mashup key
            traffic: true,
            rain: true,
            fog: COLORS.deepOrbitPurple
        },
        celestial: {
            type: 'prime_planet', // Custom dual-ring giant
            color: COLORS.iceWhite,
            x: 0.5, y: 0.4
        },
        foreground: {
            type: 'prime_mountains' // Fractal mountains BEHIND city logic but handled specially
        }
    },

    // --- NEO-TOKYO 2099 (MAGNUM OPUS REBORN) ---
    // Akira x Blade Runner x Star Wars x Y2K (Brand Palette Version)
    'city3000_genesis': {
        sky: [COLORS.black, COLORS.deepOrbitPurple, COLORS.solarPink], // Brand Gradient
        buildings: {
            color: '#020101', // Obsidian Monoliths
            windowColor: [COLORS.stellarOrange, COLORS.solarPink, COLORS.ionBlue, COLORS.classicMint],
            density: 0.95,
            glow: true
        },
        atmosphere: {
            stars: true,
            neotokyo_fx: true // The Special Sauce
        },
        celestial: {
            type: 'neo_sun',
            color: COLORS.solarPink
        }
    },

    // --- NEON FESTIVAL NIGHT ---
    // Fireworks, Ocean, Mountains, Ferris Wheel
    'city3000_festival': {
        sky: [COLORS.black, COLORS.deepOrbitPurple, '#000'],
        buildings: {
            color: '#050308',
            windowColor: [COLORS.classicMint, COLORS.solarPink, COLORS.ionBlue, COLORS.auroraMint],
            density: 0.7,
            centerGap: 0.4, // Open Bay Gap
            glow: true
        },
        atmosphere: {
            stars: true
        },
        celestial: {
            type: 'moon',
            color: COLORS.iceWhite,
            x: 0.8, y: 0.2
        },
        foreground: {
            type: 'festival_terrain' // Mountains sides, Ocean back
        }
    }
};

const CityscapeBanner = ({ themeId }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        let theme = CITY_THEMES[themeId];
        if (!theme) theme = CITY_THEMES['city_realistic'];

        // SEEDED RANDOM (Determinism)
        let seed = 12345;
        const rand = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // HIGH RES KINETIC
        const width = 3840;
        const height = 1080;
        canvas.width = width;
        canvas.height = height;

        // --- HELPERS ---
        const randomConfig = (arr) => arr[Math.floor(rand() * arr.length)];
        const hexToRgb = (hex) => {
            if (hex.length === 4) { return { r: parseInt(hex[1] + hex[1], 16), g: parseInt(hex[2] + hex[2], 16), b: parseInt(hex[3] + hex[3], 16) }; }
            return { r: parseInt(hex.substring(1, 3), 16), g: parseInt(hex.substring(3, 5), 16), b: parseInt(hex.substring(5, 7), 16) };
        };
        const mixColors = (hexColor, mixColor, opacity) => {
            const c = hexToRgb(hexColor);
            const m = hexToRgb(mixColor || '#000000');
            const r = Math.round(c.r * opacity + m.r * (1 - opacity));
            const g = Math.round(c.g * opacity + m.g * (1 - opacity));
            const b = Math.round(c.b * opacity + m.b * (1 - opacity));
            return `rgb(${r},${g},${b})`;
        };

        // 1. DRAW SKY
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        // Ensure sky is defined
        const skyColors = theme.sky || [COLORS.black, COLORS.darkNebula];
        skyColors.forEach((color, idx) => {
            skyGrad.addColorStop(idx / (skyColors.length - 1), color);
        });
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. STARS (Always behind)
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 400; i++) {
            const sx = rand() * width;
            const sy = rand() * (height * 0.85); // Down to horizon
            const size = rand() * 2;
            ctx.globalAlpha = rand() * 0.8 + 0.2;
            ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // 2.5 CELESTIAL
        if (theme.celestial && theme.celestial.type !== 'none') {
            const { type, color, x = 0.5, y = 0.5 } = theme.celestial;
            const cx = width * x;
            const cy = height * y;

            if (type === 'sun' || type === 'moon') {
                const r = 200;
                const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
                const c1 = Array.isArray(color) ? color[0] : color;
                grad.addColorStop(0, c1);
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
            }
            if (type === 'split-sun') {
                const r = 300;
                const grad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
                grad.addColorStop(0, Array.isArray(color) ? color[0] : color);
                grad.addColorStop(1, Array.isArray(color) ? color[1] : color);
                ctx.save();
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = '#000';
                for (let i = 0; i < 8; i++) {
                    const h = 20 + i * 5;
                    const yStart = cy + (i * 40) - 50;
                    ctx.fillRect(cx - r, yStart, r * 2, h * 0.4);
                }
                ctx.restore();
                ctx.globalCompositeOperation = 'source-over';
            }
            if (type === 'ring-planet') {
                const r = 100;
                ctx.fillStyle = color;
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(cx, cy, r * 2.5, r * 0.4, -0.2, 0, Math.PI * 2);
                ctx.strokeStyle = color; ctx.lineWidth = 10; ctx.stroke();
            }
        }

        // 3. BACKGROUND TERRAIN (Mountains/Dunes)
        if (theme.mountains) {
            ctx.fillStyle = theme.mountains.color;
            ctx.beginPath(); ctx.moveTo(0, height);
            let mx = 0;
            while (mx <= width) {
                const my = height * (1 - theme.mountains.height) - (rand() * 200);
                ctx.lineTo(mx, my); mx += 200;
            }
            ctx.lineTo(width, height); ctx.fill();
        }

        // --- 2. MOUNTAINS (PANOSPACE PRIME EXCLUSIVE) ---
        // Ported & Adapted Fractal Logic for Background Majesty
        if (theme.foreground?.type === 'prime_mountains') {
            const skylineY = height * 0.8; // Base for mountains
            const drawFractalMountain = (yBase, colorBase, peakHeight, roughness, startX, endX) => {
                let points = [{ x: startX, y: yBase }, { x: (startX + endX) / 2, y: yBase - peakHeight }, { x: endX, y: yBase }];
                for (let i = 0; i < roughness; i++) {
                    let nextPoints = [];
                    for (let j = 0; j < points.length - 1; j++) {
                        const p1 = points[j]; const p2 = points[j + 1];
                        const midX = (p1.x + p2.x) / 2;
                        const disp = (rand() - 0.5) * (peakHeight / (i + 1));
                        const midY = (p1.y + p2.y) / 2 + disp;
                        nextPoints.push(p1); nextPoints.push({ x: midX, y: midY });
                    }
                    nextPoints.push(points[points.length - 1]);
                    points = nextPoints;
                }

                // Draw Mountain Body with Gradient
                const mGrad = ctx.createLinearGradient(0, yBase - peakHeight, 0, yBase);
                mGrad.addColorStop(0, COLORS.voidPurple);
                mGrad.addColorStop(1, '#000');
                ctx.fillStyle = mGrad;

                ctx.beginPath();
                ctx.moveTo(points[0].x, height); // Anchor BL
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.lineTo(points[points.length - 1].x, height); // Anchor BR
                ctx.fill();

                // Glowing Rim Light (Cyber Edge)
                ctx.strokeStyle = COLORS.auroraBlue;
                ctx.lineWidth = 1;
                ctx.shadowBlur = 10; ctx.shadowColor = COLORS.auroraBlue;
                ctx.beginPath();
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.stroke();
                ctx.shadowBlur = 0;
            };

            // Huge distant range
            drawFractalMountain(skylineY, COLORS.voidPurple, 600, 6, -200, width + 200);
        }

        // --- 2.6 ULTRA ATMOSPHERE (Aurora) ---
        if (theme.atmosphere?.ultra_fx) {
            // Northern Lights
            ctx.globalCompositeOperation = 'screen';
            const auroraGrad = ctx.createLinearGradient(0, 0, width, 0);
            auroraGrad.addColorStop(0, 'transparent');
            auroraGrad.addColorStop(0.2, COLORS.auroraMint);
            auroraGrad.addColorStop(0.5, COLORS.ionBlue);
            auroraGrad.addColorStop(0.8, COLORS.deepOrbitPurple);
            auroraGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = auroraGrad;
            ctx.globalAlpha = 0.3;

            // Wavy ribbon
            ctx.beginPath();
            ctx.moveTo(0, height * 0.2);
            for (let x = 0; x <= width; x += 50) {
                ctx.lineTo(x, height * 0.2 + Math.sin(x * 0.005) * 100 + Math.cos(x * 0.02) * 50);
            }
            ctx.lineTo(width, 0); ctx.lineTo(0, 0);
            ctx.fill();

            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';

            // Vertical Beams (Holo-Searchlights)
            ctx.fillStyle = COLORS.ionBlue;
            const skylineY = height * 0.8; // Assuming this is defined or calculated earlier
            for (let k = 0; k < 15; k++) {
                const bx = rand() * width;
                const by = skylineY;
                const bh = rand() * height * 0.8;
                const bw = rand() * 20 + 5;

                const beam = ctx.createLinearGradient(bx, by, bx, by - bh);
                beam.addColorStop(0, 'rgba(27, 130, 255, 0.4)');
                beam.addColorStop(1, 'transparent');
                ctx.fillStyle = beam;
                ctx.fillRect(bx, by - bh, bw, bh);
            }
        }

        // --- 2.7 NEO-TOKYO BACKGROUND FX ---
        if (theme.atmosphere?.neotokyo_fx) {
            const cx = width / 2;
            const cy = height * 0.6;

            // 0. NEON SUN (The Energy Sphere)
            // Massive Pink/White sphere (Brand Compliant)
            const sunR = 400;
            const sunGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, sunR);
            sunGrad.addColorStop(0, '#FFF'); // Core
            sunGrad.addColorStop(0.1, COLORS.solarPink); // Solar Pink
            sunGrad.addColorStop(0.4, 'rgba(255, 92, 138, 0.2)');
            sunGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = sunGrad;
            ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, Math.PI * 2); ctx.fill();

            // 1. MEGASTRUCTURE (Tyrell Corp Pyramid)
            const strucHeight = height * 0.85;
            const topW = width * 0.3;
            const botW = width * 0.8;

            // Dark silhouette
            ctx.fillStyle = '#020101';
            ctx.beginPath();
            ctx.moveTo(cx - topW / 2, height - strucHeight);
            ctx.lineTo(cx + topW / 2, height - strucHeight);
            ctx.lineTo(cx + botW / 2, height);
            ctx.lineTo(cx - botW / 2, height);
            ctx.fill();

            // 2. MEGA-LIGHTS (Addictive Detail)
            // Grid pattern of lights on the structure
            ctx.fillStyle = 'rgba(255, 160, 50, 0.6)'; // Sodium vapor orange
            const rows = 40;
            for (let r = 0; r < rows; r++) {
                const yPct = r / rows;
                const y = (height - strucHeight) + yPct * strucHeight;
                const rowW = topW + (botW - topW) * yPct;
                const cols = 20 + r * 2; // More lights at bottom

                if (rand() > 0.3) { // Skip some rows
                    for (let c = 0; c < cols; c++) {
                        if (rand() > 0.8) continue; // Sparse lights
                        const x = (cx - rowW / 2) + (c / cols) * rowW;
                        const sz = rand() * 2 + 1;
                        ctx.fillRect(x, y, sz, sz);
                    }
                }
            }

            // 3. SMOG (Atmosphere)
            const smog = ctx.createLinearGradient(0, 0, 0, height);
            smog.addColorStop(0.3, 'transparent');
            smog.addColorStop(0.7, 'rgba(10, 5, 5, 0.8)'); // Dark smog base
            ctx.fillStyle = smog;
            ctx.fillRect(0, 0, width, height);
        }

        // --- 2.8 FESTIVAL BACKDROP (Bay & Mountains) ---
        if (theme.foreground?.type === 'festival_terrain') {
            // 1. OCEAN BAY
            const oceanY = height * 0.85;
            const sea = ctx.createLinearGradient(0, oceanY, 0, height);
            sea.addColorStop(0, COLORS.deepOrbitPurple);
            sea.addColorStop(1, COLORS.ionBlue);
            ctx.fillStyle = sea;
            ctx.fillRect(0, oceanY, width, height - oceanY);

            // Glimmer
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            for (let i = 0; i < 100; i++) {
                const gx = rand() * width;
                const gy = oceanY + rand() * (height - oceanY);
                ctx.fillRect(gx, gy, rand() * 20 + 5, 2);
            }

            // 2. MOUNTAINS (Framing)
            // Lighter buildings, Darker Mountains
            ctx.fillStyle = '#000000';
            // Left Peak
            ctx.beginPath(); ctx.moveTo(0, height); ctx.lineTo(0, height * 0.5);
            ctx.quadraticCurveTo(width * 0.1, height * 0.55, width * 0.20, height); ctx.fill();

            // MOUNTAINSIDE ROAD (Solar Pink Beam)
            // "Sliver" effect created by the glowing beam cutting the darkness
            const rx1 = 0; const ry1 = height * 0.60;
            const rx2 = width * 0.15; const ry2 = height * 0.75; // Middle of mountain

            const beamGrad = ctx.createLinearGradient(rx1, ry1, rx2, ry2);
            beamGrad.addColorStop(0, COLORS.solarPink);
            beamGrad.addColorStop(1, 'transparent');

            ctx.shadowBlur = 15; ctx.shadowColor = COLORS.solarPink;
            ctx.strokeStyle = beamGrad;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(rx1, ry1);
            ctx.quadraticCurveTo(width * 0.06, height * 0.68, rx2, ry2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            // Right Peak
            ctx.beginPath(); ctx.moveTo(width, height); ctx.lineTo(width, height * 0.4);
            ctx.quadraticCurveTo(width * 0.9, height * 0.5, width * 0.80, height); ctx.fill();

            // 3. FERRIS WHEEL (Distant)
            if (theme.atmosphere?.ferris_wheel) {
                const wx = width * 0.92;
                const wy = height * 0.55;
                const wr = 50;

                // Rim
                ctx.strokeStyle = COLORS.solarPink; ctx.lineWidth = 2;
                ctx.shadowBlur = 10; ctx.shadowColor = COLORS.solarPink;
                ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.stroke();
                ctx.shadowBlur = 0;

                // Spokes
                ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
                    ctx.beginPath(); ctx.moveTo(wx, wy);
                    ctx.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr); ctx.stroke();
                }
            }
        }

        // --- 2.9 FESTIVAL FIREWORKS ---
        if (theme.atmosphere?.festival_fx) {
            const colors = [COLORS.solarPink, COLORS.classicMint, COLORS.ionBlue, COLORS.iceWhite];
            for (let f = 0; f < 8; f++) {
                const fx = rand() * width;
                const fy = rand() * (height * 0.5);
                const fColor = colors[Math.floor(rand() * colors.length)];
                const fSize = rand() * 60 + 20;
                // Burst Lines
                ctx.strokeStyle = fColor;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
                    ctx.moveTo(fx, fy);
                    ctx.lineTo(fx + Math.cos(a) * fSize, fy + Math.sin(a) * fSize);
                }
                ctx.stroke();
                // Core Glow
                const glow = ctx.createRadialGradient(fx, fy, 2, fx, fy, fSize);
                glow.addColorStop(0, 'rgba(255,255,255,0.8)');
                glow.addColorStop(0.5, fColor);
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.beginPath(); ctx.arc(fx, fy, fSize, 0, Math.PI * 2); ctx.fill();
            }
        }

        // 4. DRAW CITY LAYERS (High Res)
        const drawCityLayer = (baseY, scale, layerIndex) => {
            const ls = scale || 1;
            const centerX = width / 2;
            const isSuperFar = layerIndex === 0;
            const isFar = layerIndex === 1;
            const isMidBack = layerIndex === 2;
            const isMid = layerIndex === 3;
            const isNear = layerIndex === 4;

            const fogColor = theme.atmosphere?.fog || '#000000';

            let depthFactor = 1.0;
            if (isSuperFar) depthFactor = 0.45;
            else if (isFar) depthFactor = 0.60;
            else if (isMidBack) depthFactor = 0.75;
            else if (isMid) depthFactor = 0.90;

            const solidLayerColor = mixColors(theme.buildings.color, fogColor, depthFactor);
            ctx.filter = (isSuperFar) ? 'blur(2px)' : 'none';
            ctx.globalAlpha = 1.0;

            // STATIC CITY ITERATION
            const cityLayer = STATIC_CITY.filter(b => b.layer === layerIndex);

            cityLayer.forEach(b => {
                let currentX = b.xPct * width;
                let bw = (b.wPct * width) * ls; // Original Scale (No 2.5x multiplier)
                let bh = (b.hPct * height) * ls;

                // GAP LOGIC (Static Masking)
                const isFestival = theme.foreground?.type === 'festival_terrain';
                const hasGap = isFestival || (theme.buildings.centerGap !== undefined && theme.buildings.centerGap !== null);

                if (hasGap) {
                    const layerGapShrink = layerIndex * 0.01;
                    const leftShore = isFestival ? width * (0.20 + layerGapShrink) : (width / 2) - (width * theme.buildings.centerGap / 2);
                    const rightShore = isFestival ? width * (0.80 - layerGapShrink) : (width / 2) + (width * theme.buildings.centerGap / 2);

                    // Check Overlap
                    if (currentX + bw > leftShore && currentX < rightShore) {
                        if (currentX < leftShore) {
                            bw = leftShore - currentX;
                        } else if (currentX < rightShore) {
                            return; // Hide
                        }
                    }
                }

                if (bw < 2 || currentX > width) return;

                drawBuilding(ctx, currentX, baseY, bw, bh, ls, solidLayerColor, isNear, isMid, isFar, theme, themeId, b.seed);
            });
            ctx.filter = 'none';
        };

        const drawBuilding = (ctx, bx, baseY, bw, bh, scale, color, isNear, isMid, isFar, theme, themeId, seed) => {
            // DETERMINISTIC RANDOM
            // Fix seed: seed is float 0-1, so multiply to get integer for LCG
            const rand = LCG(Math.floor(seed * 4294967296));
            const randomConfig = (arr) => arr[Math.floor(rand() * arr.length)];

            ctx.fillStyle = color;
            if (theme.buildings.type === 'wireframe') {
                ctx.strokeStyle = color; ctx.lineWidth = 2 * scale; ctx.fillStyle = 'rgba(0,0,0,0.9)';
                ctx.fillRect(bx, baseY - bh, bw, bh); ctx.strokeRect(bx, baseY - bh, bw, bh);
            } else if (theme.buildings.type === 'spires') {
                ctx.beginPath(); ctx.moveTo(bx, baseY); ctx.lineTo(bx + bw / 2, baseY - bh); ctx.lineTo(bx + bw, baseY); ctx.fill();
            } else {
                ctx.fillRect(bx, baseY - bh, bw, bh);
                if (bw > 80 * scale) { // Detail
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    ctx.fillRect(bx + bw * 0.3, baseY - bh, bw * 0.1, bh); ctx.fillRect(bx + bw * 0.6, baseY - bh, bw * 0.1, bh);
                }
            }

            // Windows
            const winSize = (isNear ? 5 : (isMid ? 3 : 2)) * scale;
            const gap = (isNear ? 12 : (isMid ? 8 : 6)) * scale;

            if (theme.buildings.windowColor) {
                const winColor = Array.isArray(theme.buildings.windowColor) ? randomConfig(theme.buildings.windowColor) : theme.buildings.windowColor;
                ctx.fillStyle = winColor;
                let hasLitWindow = false;
                const windowChance = (isFar || scale < 0.5) ? 0.02 : (isMid ? 0.3 : 0.6);

                if (theme.buildings.type !== 'spires') {
                    for (let wy = baseY - bh + 10; wy < baseY - 5; wy += gap) {
                        if (wy > baseY - 10) continue;
                        for (let wx = bx + 5; wx < bx + bw - 5; wx += gap) {
                            if (rand() > (1 - windowChance) || (!hasLitWindow && isNear)) {
                                if (isNear) ctx.globalAlpha = 1.0; else ctx.globalAlpha = 0.7;
                                if (themeId === 'city_glitch' && rand() > 0.8) ctx.fillStyle = randomConfig(theme.buildings.windowColor);
                                else ctx.fillStyle = winColor;
                                ctx.fillRect(wx, wy, winSize, winSize); ctx.globalAlpha = 1.0; hasLitWindow = true;
                            }
                        }
                    }
                } else {
                    ctx.fillRect(bx + bw / 2 - scale, baseY - bh + (bh * 0.2), scale * 2, bh * 0.7);
                }
            }
        };

        // RENDER STACK
        drawCityLayer(height * 0.82, 0.3, 0);
        drawCityLayer(height * 0.85, 0.45, 1);
        drawCityLayer(height * 0.89, 0.60, 2);
        drawCityLayer(height * 0.94, 0.80, 3);
        drawCityLayer(height * 1.0, 1.0, 4);


        // 5. ATMOSPHERIC & SPECIALS

        // Traffic (City-3000)
        if (theme.atmosphere?.traffic) {
            for (let i = 0; i < 100; i++) {
                const tx = rand() * width;
                const ty = rand() * (height * 0.7) + (height * 0.2);
                const isRed = rand() > 0.5;
                const speed = 50 + rand() * 100;

                ctx.fillStyle = isRed ? COLORS.solarPink : COLORS.ionBlue;
                // Draw Streak
                const grad = ctx.createLinearGradient(tx, ty, tx - speed, ty);
                grad.addColorStop(0, ctx.fillStyle);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fillRect(tx - speed, ty, speed, 2);

                // Brighter Head
                ctx.fillStyle = '#FFF';
                ctx.fillRect(tx, ty, 4, 2);
            }
        }

        // Hologram (City-3000 Billboard)
        if (theme.atmosphere?.hologram === 'girl') {
            // Giant Arc Hologram in Sky
            const hx = width * 0.7; const hy = height * 0.3;
            const hr = 300;
            const grad = ctx.createRadialGradient(hx, hy, hr * 0.5, hx, hy, hr);
            grad.addColorStop(0, 'rgba(255,183,213, 0.4)'); // Pink
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();

            // Scanlines within holo area
            ctx.save();
            ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.clip();
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            for (let y = hy - hr; y < hy + hr; y += 4) { ctx.fillRect(hx - hr, y, hr * 2, 2); }
            ctx.restore();
        }

        // Monorail (Chinatown)
        if (theme.atmosphere?.monorail) {
            const my = height * 0.65;
            // Rail
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, my, width, 10);
            // Train
            const tx = width * 0.4;
            ctx.shadowBlur = 20; ctx.shadowColor = COLORS.stellarOrange;
            ctx.fillStyle = COLORS.ionBlue;
            ctx.fillRect(tx, my - 15, 400, 15);
            ctx.shadowBlur = 0;
            // Windows
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 10; i++) ctx.fillRect(tx + 20 + (i * 35), my - 10, 20, 8);
        }

        // Foregrounds (Bridge/Rooftops)
        if (theme.foreground) {
            ctx.fillStyle = theme.foreground.color; // Silhouette
            if (theme.foreground.type === 'dunes') {
                // Dunes
            } else if (theme.foreground.type === 'bridge') {
                // Suspension Cables
                ctx.strokeStyle = '#111'; ctx.lineWidth = 5;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(width / 2, height * 0.6, width, 0); ctx.stroke();
                // Vertical cables
                for (let x = 0; x < width; x += 100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
                // Railing base
                ctx.fillRect(0, height * 0.8, width, height * 0.2);
            } else if (theme.foreground.type === 'rooftops') {
                // Vents/Antennas in immediate front
                ctx.fillRect(100, height - 200, 150, 200); // Box
                ctx.fillRect(width - 300, height - 150, 200, 150); // Box
                ctx.strokeStyle = COLORS.ionBlue; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(175, height - 200); ctx.lineTo(175, height - 400); ctx.stroke(); // Antenna (Red light on top?)
                ctx.fillStyle = 'red'; ctx.fillRect(170, height - 410, 10, 10);
            }
        }

        // Weather
        if (theme.atmosphere?.rain) {
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < 1000; i++) {
                const rx = rand() * width; const ry = rand() * height;
                ctx.moveTo(rx, ry); ctx.lineTo(rx - 5, ry + 40);
            }
            ctx.stroke();
        }

        if (theme.atmosphere?.grid) {
            // High Res Grid
            const vanishY = height * 0.70;
            ctx.strokeStyle = COLORS.solarPink; ctx.lineWidth = 2; ctx.globalAlpha = 0.3; ctx.beginPath();
            for (let x = -width; x < width * 2; x += 100) { ctx.moveTo(x, height); ctx.lineTo(width / 2, vanishY); }
            for (let y = vanishY; y < height; y += (y - vanishY) * 0.1 + 2) { if (y > height) break; ctx.moveTo(0, y); ctx.lineTo(width, y); }
            ctx.stroke(); ctx.globalAlpha = 1.0;
        }

        if (theme.atmosphere?.glitch) {
            ctx.fillStyle = `rgba(${rand() * 255}, 0, 255, 0.1)`; ctx.fillRect(0, 0, width, height);
            for (let i = 0; i < 10; i++) { const y = rand() * height; ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, y, width, rand() * 50); }
        }

        // Vignette
        const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.8);
        vig.addColorStop(0, 'transparent'); vig.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = vig; ctx.fillRect(0, 0, width, height);

        // --- 4. NEO-TOKYO FOREGROUND FX ---
        if (theme.atmosphere?.neotokyo_fx) {
            const cx = width / 2;

            // 1. FLYING CAR TRAFFIC (Coruscant Skyway)
            // Multi-colored beams spread across the sky
            const trafficColors = ['#FF3333', COLORS.ionBlue, COLORS.classicMint, COLORS.solarPink, '#FFF'];

            for (let k = 0; k < 25; k++) {
                ctx.beginPath();
                // STRICT BRAND PALETTE ONLY
                const brandPalette = [
                    COLORS.classicMint,
                    COLORS.solarPink,
                    COLORS.ionBlue,
                    COLORS.deepOrbitPurple,
                    '#FFFFFF', // Headlights
                    COLORS.solarPink  // Taillights (Pink instead of Red)
                ];
                const color = brandPalette[Math.floor(rand() * brandPalette.length)];

                // Varied brightness/depth
                const alpha = rand() * 0.7 + 0.3;
                ctx.globalAlpha = alpha;

                const startY = rand() * height;
                const isMovingRight = rand() > 0.5;

                // Motion Trail Gradient
                const trailGrad = ctx.createLinearGradient(0, 0, width, 0);
                if (isMovingRight) {
                    // Moving Right: Tail at Left (Transparent) -> Head at Right (Color)
                    trailGrad.addColorStop(0, 'transparent');
                    trailGrad.addColorStop(0.3, 'transparent'); // Longer tail fade
                    trailGrad.addColorStop(1, color);
                } else {
                    // Moving Left: Head at Left (Color) -> Tail at Right (Transparent)
                    trailGrad.addColorStop(0, color);
                    trailGrad.addColorStop(0.7, 'transparent');
                    trailGrad.addColorStop(1, 'transparent');
                }

                // Shadow/Glow matches beam color
                ctx.shadowBlur = rand() * 5 + 2;
                ctx.shadowColor = color;
                ctx.strokeStyle = trailGrad;
                ctx.lineWidth = rand() * 2 + 1; // 1px to 3px

                ctx.moveTo(0, startY);

                const chaos = (rand() - 0.5) * 150;
                const cp1x = width * 0.3; const cp1y = startY + chaos;
                const cp2x = width * 0.7; const cp2y = startY - chaos;
                const endY = startY + (rand() - 0.5) * 100;

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, width, endY);
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1.0;
            }

            // 2. HOLO-ADS (Spinning Geometrics)
            // Y2K style HUD elements
            ctx.strokeStyle = COLORS.ionBlue;
            ctx.lineWidth = 2;

            const drawHoloRing = (hx, hy, r) => {
                ctx.beginPath();
                ctx.arc(hx, hy, r, 0, Math.PI * 2);
                ctx.stroke();

                // Spinning segments
                ctx.beginPath();
                const startAng = rand() * Math.PI;
                ctx.arc(hx, hy, r + 10, startAng, startAng + 1.5);
                ctx.strokeStyle = COLORS.classicMint;
                ctx.stroke();
                ctx.strokeStyle = COLORS.ionBlue; // reset
            };

            drawHoloRing(width * 0.2, height * 0.3, 60);
            drawHoloRing(width * 0.8, height * 0.4, 80);

            // 3. SEARCHLIGHTS (Blade Runner)
            // Beams cutting through the smog
            ctx.globalCompositeOperation = 'overlay';
            const beam = ctx.createLinearGradient(0, height, 0, height * 0.4);
            beam.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            beam.addColorStop(1, 'transparent');
            ctx.fillStyle = beam;

            ctx.save();
            ctx.translate(width * 0.1, height);
            ctx.rotate(-0.3);
            ctx.fillRect(-50, -height, 100, height);
            ctx.restore();

            ctx.save();
            ctx.translate(width * 0.9, height);
            ctx.rotate(0.3);
            ctx.fillRect(-50, -height, 100, height);
            ctx.restore();

            ctx.globalCompositeOperation = 'source-over';
        }

        setBgImage(canvas.toDataURL());

    }, [themeId]);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
        }}>
            <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center bottom',
            }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default CityscapeBanner;
