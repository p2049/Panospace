
import React, { useRef, useEffect, useState } from 'react';

// --- PANOSPACE BRAND PALETTE (Strict Enforcement) ---
const COLORS = {
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
    black: '#000000',
    // Removed random reds/yellows, strictly using brand variants or mixes
};

const OCEAN_THEMES = {
    // 1. CLASSIC SUNSET (Brand Orange/Purple)
    'ocean_sunset_classic': {
        sky: [COLORS.black, COLORS.voidPurple, COLORS.stellarOrange],
        waterBase: COLORS.voidPurple,
        waterHighlight: COLORS.stellarOrange,
        sun: { type: 'sun', color: COLORS.stellarOrange, y: 0.55, size: 100 },
        land: { type: 'fractal_mountains', color: '#080205' },
        atmosphere: { stars: true, horizonGlow: true }
    },
    // 2. VAPORWAVE (Pink/Cyan)
    'ocean_sunset_vapor': {
        sky: [COLORS.black, COLORS.deepOrbitPurple, COLORS.nebulaPink],
        waterBase: COLORS.deepOrbitPurple,
        waterHighlight: COLORS.auroraBlue,
        sun: { type: 'grid-sun', color: [COLORS.solarPink, COLORS.auroraBlue], y: 0.5 },
        land: { type: 'palms' },
        atmosphere: { stars: true, grid: true }
    },
    // 3. PASTEL DREAM (Periwinkle/Pink)
    'ocean_sunset_pastel': {
        sky: [COLORS.black, COLORS.ionBlue, COLORS.nebulaPink],
        waterBase: COLORS.deepOrbitPurple,
        waterHighlight: COLORS.iceWhite,
        sun: { type: 'sun', color: COLORS.iceWhite, y: 0.6, size: 60 },
        land: { type: 'fractal_islands', color: '#151025' },
        atmosphere: { stars: true, clouds: true }
    },
    // 4. BIOLUMINESCENT NIGHT (Mint/Black)
    'ocean_night_bio': {
        sky: [COLORS.black, COLORS.darkNebula],
        waterBase: '#020408',
        waterHighlight: COLORS.auroraMint,
        sun: { type: 'none' },
        land: { type: 'fractal_cliffs', color: '#020505' },
        atmosphere: { stars: true, fireflies: true, biolum: true }
    },
    // 5. ELECTRIC STORM (Ion Blue/Purple)
    'ocean_storm_electric': {
        sky: [COLORS.black, COLORS.voidPurple, COLORS.ionBlue],
        waterBase: '#050510',
        waterHighlight: COLORS.ionBlue,
        sun: { type: 'none' },
        land: { type: 'fractal_cliffs', color: '#000' },
        atmosphere: { storm: true, rain: true }
    },
    // 6. EMERALD TROPICAL (Mint/Black)
    'ocean_tropical_emerald': {
        sky: [COLORS.black, '#001a1a', COLORS.classicMint],
        waterBase: '#000d0d',
        waterHighlight: COLORS.classicMint,
        sun: { type: 'none' },
        land: { type: 'palms' },
        atmosphere: { stars: true, clouds: true }
    },
    // 7. VOLCANO (Stellar Orange/Solar Pink)
    'ocean_volcano': {
        sky: [COLORS.black, '#2b0a1a', COLORS.stellarOrange],
        waterBase: '#1a0505',
        waterHighlight: COLORS.solarPink, // Hot pink lava reflection
        sun: { type: 'none' },
        land: { type: 'volcano' }, // Custom fractal volcano logic
        atmosphere: { stars: true, ash: true }
    }
};

const OceanBanner = ({ themeId, starSettings }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        let theme = OCEAN_THEMES[themeId];
        if (!theme) theme = OCEAN_THEMES['ocean_sunset_classic'];

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // HIGH RES KINETIC
        const width = 3840;
        const height = 1080;
        canvas.width = width;
        canvas.height = height;

        const horizonY = height * 0.6; // Horizon line

        // SEEDED RANDOM (Determinism)
        let seed = 12345;
        const rand = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        // --- HELPERS ---
        const drawGradient = (colors, yStop) => {
            const grad = ctx.createLinearGradient(0, 0, 0, yStop);
            colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, yStop);
        };

        // 1. SKY RENDER
        drawGradient(theme.sky, horizonY + 50);

        // 1.5. HORIZON HAZE (Atmospheric perspective)
        const skyBottomColor = Array.isArray(theme.sky) ? theme.sky[theme.sky.length - 1] : theme.sky;
        const haze = ctx.createLinearGradient(0, horizonY - 100, 0, horizonY + 50);
        haze.addColorStop(0, 'transparent');
        haze.addColorStop(0.6, skyBottomColor); // Peak haze at horizon
        haze.addColorStop(1, 'transparent');
        ctx.fillStyle = haze;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(0, horizonY - 100, width, 150);
        ctx.globalAlpha = 1.0;

        // 2. STARS
        const showStars = (starSettings?.enabled !== undefined) ? starSettings.enabled : theme.atmosphere.stars;

        if (showStars) {
            const starClr = starSettings?.color || COLORS.iceWhite;
            ctx.fillStyle = starClr;

            for (let i = 0; i < 600; i++) {
                const sx = rand() * width;
                const sy = rand() * (horizonY * 0.85); // Stay above haze
                const size = rand() * 1.5;
                const opacity = 0.3 + rand() * 0.7;

                ctx.globalAlpha = opacity;

                // Cinematic Star (Cross Flare) - 2% chance
                if (rand() > 0.98) {
                    const flareSize = size * 4;
                    ctx.beginPath();
                    ctx.moveTo(sx - flareSize, sy); ctx.lineTo(sx + flareSize, sy); // Horiz
                    ctx.moveTo(sx, sy - flareSize); ctx.lineTo(sx, sy + flareSize); // Vert
                    ctx.strokeStyle = starClr;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                    // Core
                    ctx.beginPath(); ctx.arc(sx, sy, size + 1, 0, Math.PI * 2); ctx.fill();
                } else {
                    ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
                }
            }
            ctx.globalAlpha = 1.0;
        }

        // 3. LANDSCAPE GENERATOR (FRACTAL MOUNTAINS)
        // Midpoint displacement algorithm for realistic jagged terrain
        const drawFractalMountain = (yBase, color, peakHeight, roughness, startX, endX) => {
            let points = [{ x: startX, y: yBase }, { x: (startX + endX) / 2, y: yBase - peakHeight }, { x: endX, y: yBase }];

            // Subdivide
            for (let i = 0; i < roughness; i++) {
                let nextPoints = [];
                for (let j = 0; j < points.length - 1; j++) {
                    const p1 = points[j];
                    const p2 = points[j + 1];
                    const midX = (p1.x + p2.x) / 2;
                    // Displacement reduces as recursion goes deeper
                    const disp = (rand() - 0.5) * (peakHeight / (i + 1));
                    const midY = (p1.y + p2.y) / 2 + disp;

                    nextPoints.push(p1);
                    nextPoints.push({ x: midX, y: midY });
                }
                nextPoints.push(points[points.length - 1]);
                points = nextPoints;
            }

            // Draw Shape
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(points[0].x, height); // Anchor BL
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(points[points.length - 1].x, height); // Anchor BR
            ctx.fill();

            // Highlight Edge (Moon/Sun light)
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        };

        // 3.5 PALM RENDERER (Helper)
        const drawDetailedPalm = (px, py, scale, flip) => {
            // TRUNK (Tapered & Filled)
            ctx.fillStyle = '#020102'; // Deep contour
            ctx.beginPath();
            const lean = flip ? -100 : 100; // More dramatic lean
            const trunkHeight = 450 * scale; // Taller
            const topX = px + lean * scale;
            const topY = py - trunkHeight;

            // Draw tapered trunk path
            const baseWidth = 30 * scale;
            const topWidth = 8 * scale;

            ctx.moveTo(px - baseWidth / 2, py);
            // Left side curve
            ctx.quadraticCurveTo(px + lean / 3, py - trunkHeight / 2, topX - topWidth / 2, topY);
            // Top cut
            ctx.lineTo(topX + topWidth / 2, topY);
            // Right side curve
            ctx.quadraticCurveTo(px + lean / 3 + baseWidth, py - trunkHeight / 2, px + baseWidth / 2, py);
            ctx.fill();

            // LEAVES (Elongated Football Shapes)
            const lx = topX;
            const ly = topY;
            // Fan of angles
            const angles = [-0.5, 0, 0.5, 1.0, 1.5, 2.5, 3.0, 3.5, 4.0];

            ctx.fillStyle = '#000804'; // Slightly greener black for leaves if we wanted, but silhouette is standard

            angles.forEach(ang => {
                const rad = ang + (flip ? Math.PI : 0);
                const leafLen = (220 + rand() * 60) * scale;
                const leafWidth = 20 * scale; // Width of the "football"

                // Calculate Tip with Gravity Droop
                const droopFactor = 0.6;
                const tipX = lx + Math.cos(rad) * leafLen;
                const tipY = ly + Math.sin(rad) * leafLen * droopFactor + (leafLen * 0.3); // Droop down

                // Calculate Control Point (Midpoint + Arch)
                // We act as if the leaf arches OUT first then falss
                const midX = (lx + tipX) / 2;
                const midY = (ly + tipY) / 2 - (leafLen * 0.2); // Arch up

                // Perpendicular vector for width
                const dx = tipX - lx;
                const dy = tipY - ly;
                const len = Math.sqrt(dx * dx + dy * dy);
                const px = (-dy / len) * leafWidth;
                const pyVector = (dx / len) * leafWidth; // renamed to avoid clash with py arg

                ctx.beginPath();
                ctx.moveTo(lx, ly);
                // Top Curve (arches higher)
                ctx.quadraticCurveTo(midX + px, midY + pyVector, tipX, tipY);
                // Bottom Curve (arches lower)
                ctx.quadraticCurveTo(midX - px, midY - pyVector, lx, ly);
                ctx.fill();
            });
        };

        // 3.6 VOLCANO LOGIC (Special Case)
        if (theme.land?.type === 'volcano') {
            // VOLCANO ON RIGHT
            const cx = width * 0.75;
            // 1. Mountain Body (Smaller: Peak 250, Base 500)
            drawFractalMountain(horizonY, '#050101', 250, 4, cx - 500, cx + 500);

            // 2. Multi-Stream Lava Flow System
            const craterY = horizonY - 210; // New lower crater height for smaller volcano
            const streams = 4; // Fewer rivers

            for (let i = 0; i < streams; i++) {
                // Fan out flows slightly
                const startOffset = (i - (streams / 2)) * 15;
                const endOffset = (i - (streams / 2)) * 80 + (rand() - 0.5) * 40;

                // Gradient for this flow (Heat map: White -> Pink -> Transparent)
                const lava = ctx.createLinearGradient(cx, craterY, cx + endOffset, horizonY);
                lava.addColorStop(0, '#FFF'); // Core heat
                lava.addColorStop(0.1, COLORS.stellarOrange);
                lava.addColorStop(0.3, COLORS.solarPink);
                lava.addColorStop(1, 'transparent'); // Fade into water/smoke

                ctx.fillStyle = lava;
                ctx.beginPath();
                ctx.moveTo(cx + startOffset, craterY);

                // Organic curves down the slope
                const cp1x = cx + startOffset + (endOffset * 0.3) + (rand() - 0.5) * 30;
                const cp1y = craterY + 60;
                const cp2x = cx + startOffset + (endOffset * 0.7) + (rand() - 0.5) * 30;
                const cp2y = craterY + 140;

                // Left bank path
                ctx.quadraticCurveTo(cp1x - 10, cp1y, cp2x - 15, cp2y);
                ctx.lineTo(cx + endOffset - 25, horizonY);
                // River width at bottom
                ctx.lineTo(cx + endOffset + 25, horizonY);
                // Right bank path
                ctx.quadraticCurveTo(cp2x + 15, cp2y, cp1x + 10, cp1y);
                ctx.lineTo(cx + startOffset + 10, craterY);
                ctx.fill();
            }

            // 3. Eruption Glow & Sparks (Magma Chamber Effect)
            const erupt = ctx.createRadialGradient(cx, craterY, 5, cx, craterY, 250);
            erupt.addColorStop(0, COLORS.stellarOrange);
            erupt.addColorStop(0.2, 'rgba(255, 92, 138, 0.4)'); // Solar Pink mist
            erupt.addColorStop(1, 'transparent');
            ctx.fillStyle = erupt;
            ctx.globalAlpha = 0.7;
            ctx.beginPath(); ctx.arc(cx, craterY, 250, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1.0;

            // Volcanic Debris/Sparks
            ctx.fillStyle = '#FFF';
            for (let k = 0; k < 40; k++) {
                const sx = cx + (rand() - 0.5) * 100;
                const sy = craterY - rand() * 150;
                const sz = rand() * 2.5;
                ctx.globalAlpha = rand();
                ctx.beginPath(); ctx.arc(sx, sy, sz, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            // --- TROPICAL ISLAND ON LEFT ---
            const ix = width * 0.2;
            // Island Base
            drawFractalMountain(horizonY, '#020102', 120, 3, ix - 300, ix + 300);
            // Single Palm Tree on Island
            drawDetailedPalm(ix - 50, horizonY, 0.8, false);
            drawDetailedPalm(ix + 80, horizonY + 20, 0.6, true);
        }
        else if (theme.land?.type === 'fractal_mountains') {
            // Left Range
            drawFractalMountain(horizonY + 50, theme.land.color, 300, 4, -100, 600);
            // Right Range (Higher)
            drawFractalMountain(horizonY + 50, theme.land.color, 450, 5, width - 800, width + 100);
        }
        else if (theme.land?.type === 'fractal_cliffs') {
            // Steep jagged cliffs on sides
            drawFractalMountain(horizonY + 100, theme.land.color, 600, 3, -200, 400);
            drawFractalMountain(horizonY + 100, theme.land.color, 700, 4, width - 500, width + 200);
        }
        else if (theme.land?.type === 'fractal_islands') {
            // Scattered small jagged shapes
            drawFractalMountain(horizonY + 20, theme.land.color, 150, 2, 200, 500);
            drawFractalMountain(horizonY + 20, theme.land.color, 120, 2, width - 600, width - 300);
        }


        // 4. CELESTIAL
        const cx = width / 2;
        if (theme.sun && theme.sun.type !== 'none') {
            const { type, color, y, size = 150 } = theme.sun;
            const cy = height * y;

            const glow = ctx.createRadialGradient(cx, cy, size * 0.5, cx, cy, size * 4);
            const glowColor = Array.isArray(color) ? color[0] : color;
            glow.addColorStop(0, glowColor);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow; ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.arc(cx, cy, size * 4, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1.0;

            if (type === 'sun' || type === 'moon') {
                ctx.fillStyle = Array.isArray(color) ? color[0] : color;
                ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2); ctx.fill();
            }
            else if (type === 'grid-sun') {
                const g = ctx.createLinearGradient(0, cy - size, 0, cy + size);
                g.addColorStop(0, color[0]); g.addColorStop(1, color[1]);
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = theme.sky[theme.sky.length - 1];
                for (let i = 0; i < 10; i++) {
                    const barH = 5 + i * 4; const barY = cy + (i * 25) - 20;
                    if (barY < cy + size) ctx.fillRect(cx - size - 10, barY, size * 2 + 20, barH);
                }
            }
        }

        // 5. PROCEDURAL WATER
        const waterStart = horizonY;
        const waterEnd = height;
        const totalHeight = waterEnd - waterStart;

        ctx.fillStyle = theme.waterBase;
        ctx.fillRect(0, waterStart, width, totalHeight);

        const highlightColor = theme.waterHighlight;
        let y = waterStart;
        let bandHeight = 1;

        while (y < waterEnd) {
            const progress = (y - waterStart) / totalHeight;
            bandHeight = 1 + (progress * progress * 8);
            const gap = 2 + (progress * 15);

            // Dynamic Reflection Width (Narrow at top, wide at bottom)
            let reflectWidth = 150 + (progress * 1000);
            let reflectXMin = cx - reflectWidth / 2;

            ctx.fillStyle = highlightColor;

            if (theme.atmosphere.biolum) {
                // BIOLUMINESCENCE OVERHAUL: High Density, Electric Glow
                // Scale effect by proximity (progress 0..1)

                // 1. Base Ambient Glow (The water itself radiates slightly)
                ctx.fillStyle = COLORS.auroraMint;
                ctx.globalAlpha = 0.05 * progress;
                ctx.fillRect(0, y, width, bandHeight);

                // 2. Active Wave Crests (The breaking waves glow)
                if (rand() > 0.6) { // 40% of waves light up
                    const intensity = rand();
                    const crestWidth = 100 + rand() * 400 * progress;
                    const crestX = rand() * width;

                    // Gradient for soft bloom stroke
                    const glow = ctx.createLinearGradient(crestX, y, crestX + crestWidth, y);
                    glow.addColorStop(0, 'transparent');
                    glow.addColorStop(0.2, COLORS.classicMint);
                    glow.addColorStop(0.5, '#FFF'); // Hot white core
                    glow.addColorStop(0.8, COLORS.auroraMint);
                    glow.addColorStop(1, 'transparent');

                    ctx.fillStyle = glow;
                    ctx.globalAlpha = 0.4 + (intensity * 0.4); // 0.4 to 0.8 opacity
                    ctx.fillRect(crestX, y, crestWidth, bandHeight);
                }

                // 3. "Plankton Blooms" (Intense hot spots)
                if (rand() > 0.92) { // Rare bright spots
                    const bx = rand() * width;
                    const size = 10 + rand() * 50 * progress;

                    // Radial bloom for the spot
                    const spotGlow = ctx.createRadialGradient(bx, y, 0, bx, y, size);
                    spotGlow.addColorStop(0, '#FFF');
                    spotGlow.addColorStop(0.4, COLORS.auroraMint);
                    spotGlow.addColorStop(1, 'transparent');

                    ctx.fillStyle = spotGlow;
                    ctx.globalAlpha = 0.9;
                    ctx.beginPath();
                    ctx.ellipse(bx, y, size, bandHeight * 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                }

            } else {
                // 1. Ambient Sparkle (Random waves catching light)
                if (rand() > 0.7) {
                    ctx.globalAlpha = Math.max(0, 0.3 - progress) * 0.5; // Fades out near camera
                    ctx.fillRect(rand() * width, y, rand() * 150, bandHeight);
                }

                // 2. Main Sun Pillar Reflection
                // Stronger at horizon, spreading out
                const intensity = (0.3 + (0.7 * (1 - progress))); // Brighter near horizon
                ctx.globalAlpha = intensity * 0.8;

                // Jitter for wave effect
                const jitter = (rand() - 0.5) * 60;
                const waveX = reflectXMin + jitter;
                const waveW = reflectWidth - jitter * 2;
                ctx.fillRect(waveX, y, waveW, bandHeight);

                // 3. Hot Core (Center of reflection)
                const coreW = waveW * 0.3;
                ctx.globalAlpha = intensity; // Full opacity
                ctx.fillRect(cx - coreW / 2 + jitter, y, coreW, bandHeight);
            }
            y += bandHeight + gap;
        }
        ctx.globalAlpha = 1.0;

        // 6. PALMS (If theme requests - handled separately from fractal mountains)
        if (theme.land?.type === 'palms') {
            // Raised bases: 'height' instead of 'height+50' to show more trunk
            drawDetailedPalm(150, height, 1.2, false);
            drawDetailedPalm(width - 100, height, 1.4, true);
        }

        // 7. WEATHER
        if (theme.atmosphere.storm) {
            // Lightning
            if (theme.atmosphere.storm) { // Double check
                ctx.strokeStyle = COLORS.ionBlue;
                ctx.lineWidth = 3; ctx.shadowBlur = 30; ctx.shadowColor = COLORS.ionBlue;
                ctx.beginPath();
                const lStart = rand() * width; ctx.moveTo(lStart, 0);
                let lx = lStart; let ly = 0;
                while (ly < height * 0.6) { lx += (rand() - 0.5) * 80; ly += 20 + rand() * 40; ctx.lineTo(lx, ly); }
                ctx.stroke(); ctx.shadowBlur = 0;
            }
        }

        // 8. VIGNETTE
        const vig = ctx.createLinearGradient(0, 0, 0, height);
        vig.addColorStop(0, 'rgba(0,0,0,0.85)');
        vig.addColorStop(0.3, 'transparent');
        vig.addColorStop(0.7, 'transparent');
        vig.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vig; ctx.fillRect(0, 0, width, height);

        setBgImage(canvas.toDataURL());

    }, [themeId, starSettings]);

    return (
        <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
        }}>
            <div style={{
                width: '100%', height: '100%',
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover', backgroundPosition: 'center'
            }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default OceanBanner;
