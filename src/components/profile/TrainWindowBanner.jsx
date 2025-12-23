import React, { useRef, useEffect, useMemo } from 'react';

/**
 * TrainWindowBanner - Continuous World Parallax
 * 
 * Logic:
 * 1. Generate ONE set of world layers (Far, Mid, Near).
 * 2. Each window acts as a "view" into this continuous world.
 * 3. Windows pass their x-offset to the renderer.
 * 4. A building leaving Window 1 will naturally appear in Window 2 after the gap duration.
 */
const TrainWindowBanner = ({ starSettings, variant = 'night' }) => {
    const BRAND = {
        voidPurple: '#2A0E61',
        deepOrbit: '#5A3FFF',
        auroraMint: '#8CFFE9',
        ionBlue: '#1B82FF',
        auroraBlue: '#7FDBFF',
        solarPink: '#FF5C8A',
        vividOrange: '#FF914D',
        white: '#FFFFFF',
        black: '#000000'
    };

    const PALETTES = {
        day: {
            sky: [BRAND.auroraBlue, BRAND.ionBlue],
            buildings: [BRAND.voidPurple, BRAND.deepOrbit, BRAND.ionBlue],
            ground: BRAND.black,
            wires: BRAND.deepOrbit,
            interior: BRAND.black
        },
        sunset: {
            sky: [BRAND.solarPink, BRAND.vividOrange, BRAND.deepOrbit],
            buildings: [BRAND.voidPurple, BRAND.deepOrbit, BRAND.solarPink],
            ground: BRAND.black,
            wires: BRAND.solarPink,
            interior: BRAND.black
        },
        night: {
            sky: [BRAND.black, BRAND.voidPurple],
            buildings: [BRAND.black, BRAND.voidPurple, BRAND.deepOrbit],
            ground: BRAND.black,
            wires: BRAND.deepOrbit,
            lights: true,
            interior: BRAND.black
        },
        neon: {
            sky: [BRAND.black, BRAND.voidPurple],
            buildings: [BRAND.black, BRAND.voidPurple, BRAND.deepOrbit],
            ground: BRAND.black,
            wires: BRAND.auroraMint,
            lights: true,
            neon: true,
            interior: BRAND.black
        },
        // NEW PALETTES - BRAND ALIGNED
        midnight_express: {
            sky: [BRAND.black, BRAND.voidPurple],
            buildings: [BRAND.black, BRAND.voidPurple, BRAND.deepOrbit], // Only brand purples/blacks
            ground: BRAND.black,
            wires: BRAND.deepOrbit,
            lights: true,
            interior: BRAND.voidPurple
        },
        crimson_dusk: {
            // Using Solar Pink and Vivid Orange mixed with Void Purple for darks
            sky: [BRAND.voidPurple, BRAND.solarPink, BRAND.vividOrange],
            buildings: [BRAND.black, BRAND.voidPurple, BRAND.solarPink],
            ground: BRAND.black,
            wires: BRAND.solarPink,
            lights: true,
            interior: BRAND.black
        },
        arctic_run: {
            // Using Aurora Blue, Ion Blue, White
            sky: [BRAND.auroraBlue, BRAND.white],
            buildings: [BRAND.white, BRAND.auroraBlue, BRAND.ionBlue],
            ground: BRAND.white,
            wires: BRAND.ionBlue,
            lights: false,
            interior: BRAND.auroraBlue,
            geometry: {
                lightProb: 0, // No lights
                hasPoles: false // No poles
            }
        },
        panospace_ultra: { // Matching System Glitch / Brand Rainbow
            sky: [BRAND.black, BRAND.deepOrbit],
            buildings: [BRAND.black, BRAND.auroraMint, BRAND.solarPink, BRAND.ionBlue],
            ground: BRAND.black,
            wires: BRAND.auroraMint,
            lights: true,
            neon: true,
            interior: BRAND.black,
            geometry: {
                density: 1.2,
                lightProb: 0.5
            }
        },
        space: { // Space City (NASA Blue)
            sky: [BRAND.black, BRAND.ionBlue],
            buildings: [BRAND.black, BRAND.ionBlue, BRAND.voidPurple],
            ground: BRAND.black,
            wires: BRAND.ionBlue,
            lights: true,
            interior: BRAND.black,
            geometry: { density: 0.8, widthScale: 1.1 }
        },
        lunar: { // Lunar City (Monochrome)
            sky: [BRAND.black, BRAND.white],
            buildings: [BRAND.black, '#333', '#666'],
            ground: '#111',
            wires: BRAND.white,
            lights: true,
            interior: '#111',
            geometry: { density: 0.6, widthScale: 1.2, heightScale: 0.5 }
        },
        realistic: { // Realistic Night City
            sky: [BRAND.black, '#1b263b'], // Dark slate
            buildings: [BRAND.black, '#0f172a', '#1e293b'], // Slate tones
            ground: '#020617',
            wires: '#334155',
            lights: true,
            interior: '#0f172a',
            geometry: { density: 1.0, widthScale: 1.0 } // Standard
        },
        neotokyo: { // Matching Neo-Tokyo 2099 (Purple/Pink/Black)
            sky: [BRAND.black, BRAND.deepOrbit, BRAND.solarPink],
            buildings: [BRAND.black, '#050505', '#0a0a0a'],
            ground: BRAND.black,
            wires: BRAND.solarPink,
            lights: true,
            interior: '#050505',
            geometry: { density: 1.2, widthScale: 0.9, lightProb: 0.5 }
        }
    };

    // Inject refined window colors
    if (PALETTES.panospace_ultra) PALETTES.panospace_ultra.windowColors = [BRAND.auroraMint, BRAND.solarPink, BRAND.ionBlue, BRAND.white];
    if (PALETTES.neotokyo) PALETTES.neotokyo.windowColors = [BRAND.vividOrange, BRAND.solarPink, BRAND.ionBlue, BRAND.auroraMint]; // Correct NeoTokyo 2099 colors
    if (PALETTES.realistic) PALETTES.realistic.windowColors = ['#ffdbb7', '#e6e6fa', '#ffffff'];
    if (PALETTES.space) PALETTES.space.windowColors = [BRAND.ionBlue, '#ffffff'];
    if (PALETTES.lunar) PALETTES.lunar.windowColors = ['#ffffff'];
    if (PALETTES.midnight_express) PALETTES.midnight_express.windowColors = [BRAND.auroraMint, BRAND.voidPurple];
    if (PALETTES.crimson_dusk) PALETTES.crimson_dusk.windowColors = [BRAND.solarPink, '#ff5c8a'];
    if (PALETTES.sunset) PALETTES.sunset.windowColors = [BRAND.vividOrange, '#ffd700'];
    if (PALETTES.neon) PALETTES.neon.windowColors = [BRAND.auroraMint, BRAND.solarPink, BRAND.ionBlue];
    if (PALETTES.night) PALETTES.night.windowColors = ['#ffdbb7', '#ffffff'];
    if (PALETTES.arctic_run) PALETTES.arctic_run.windowColors = [BRAND.ionBlue, '#ffffff'];

    const getVariantFromColor = (color) => {
        if (!color) return 'night';

        // Customs from bannerThemes
        if (color === 'train_space') return 'space';
        if (color === 'train_lunar') return 'lunar';
        if (color === 'train_cyber') return 'midnight_express';
        if (color === 'train_mars') return 'crimson_dusk';
        if (color === 'train_neon') return 'neon'; // Correctly map to neon palette
        if (color === 'train_ultra') return 'panospace_ultra'; // Full rainbow
        if (color === 'train_neotokyo') return 'neotokyo'; // New red/black
        if (color === 'train_realistic') return 'realistic';
        if (color === 'train_color') return 'day';

        if (color === 'train_omni') {
            const hour = new Date().getHours();
            if (hour >= 6 && hour < 18) return 'day';
            if (hour >= 18 && hour < 21) return 'sunset';
            return 'night';
        }

        // If color is directly a valid theme key, use it
        if (PALETTES[color]) return color;

        // Check for specific hex matches (case insensitive)
        const c = color.toLowerCase();

        switch (c) {
            case '#7fdbff': // Aurora Blue
            case '#1b82ff': // Ion Blue
            case '#a7b6ff': // Cosmic Periwinkle
                return 'day';

            case '#ff914d': // Stellar Orange
            case '#d9b96e': // Solar Gold
                return 'sunset';

            case '#ff5c8a': // Solar Pink
            case '#ffb7d5': // Nebula Pink
                return 'crimson_dusk';

            case '#e6f8ff': // Cosmic Ice
            case '#f2f7fa': // Ice White
            case '#ffffff':
                return 'arctic_run';

            case '#8cffe9': // Aurora Mint
            case '#7fffd4': // Classic Mint
                return 'neon';

            case 'brand':   // Rainbow
            case BRAND_RAINBOW.toLowerCase():
                return 'panospace_ultra';

            case '#0a1a3a': // Dark Nebula Blue
            case '#2a0e61': // Void Purple
            case '#5a3fff': // Deep Orbit Purple
                return 'midnight_express';

            case '#000000': // Black
            default:
                return 'night';
        }
    };

    const currentVariant = getVariantFromColor(variant);
    const palette = PALETTES[currentVariant] || PALETTES.night;

    // --- GEOMETRY SETTINGS PER VARIANT ---
    // Extract geometry overrides or defaults
    const geo = {
        density: palette.geometry?.density || 1, // Multiplier for count
        widthScale: palette.geometry?.widthScale || 1,
        heightScale: palette.geometry?.heightScale || 1,
        lightProb: palette.geometry?.lightProb || 0.15, // Chance of a window being lit
        hasPoles: palette.geometry?.hasPoles !== false
    };

    // --- SHARED WORLD STATE ---
    // Generate layers ONCE so all windows see the same city
    const layers = useMemo(() => {
        const createLayer = (baseCount, minW, maxW, minH, maxH, speed, zIndex) => {
            const count = Math.floor(baseCount * geo.density);
            return {
                speed,
                zIndex,
                buildings: Array.from({ length: count }, (_, i) => ({
                    // Slotted distribution: Ensures buildings are roughly evenly spaced
                    // Overlap is minimal (neighbors only) rather than clumping
                    x: (i / count) + (Math.random() * (0.5 / count)),
                    width: (minW + Math.random() * (maxW - minW)) * geo.widthScale,
                    height: (minH + Math.random() * (maxH - minH)) * geo.heightScale,
                    colorIndex: Math.floor(Math.random() * 3),
                    windows: Math.random() > 0.1 // Most have windows potetially
                }))
            };
        };

        return [
            createLayer(50, 0.01, 0.03, 0.15, 0.35, 0.05, 0), // Far - Thinner
            createLayer(30, 0.015, 0.04, 0.25, 0.55, 0.15, 1), // Mid - Thinner
            createLayer(15, 0.03, 0.05, 0.4, 0.8, 0.4, 2)     // Near - Thinner
        ];
    }, [currentVariant, geo.density, geo.widthScale, geo.heightScale]); // Re-generate when variant or geometry changes!

    // Window Pane Component
    // viewOffsetX: The "start position" of this window in the world (0.0 - 1.0)
    const WindowPane = ({ viewOffsetX, style }) => {
        const canvasRef = useRef(null);
        const animationRef = useRef(null);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            const render = () => {
                const w = canvas.width;
                const h = canvas.height;
                // Global time factor - slightly slower
                const time = Date.now() * 0.00012;
                const horizonY = h * 0.65;

                ctx.globalCompositeOperation = 'source-over';

                // Sky
                const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
                palette.sky.forEach((c, i) => skyGrad.addColorStop(i / (palette.sky.length - 1), c));
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, w, h);

                // Render Layers
                layers.forEach((layer, layerIndex) => {
                    layer.buildings.forEach(b => {
                        // POSITION LOGIC:
                        // World Position = Building X
                        // Moving factor = speed * time
                        // View Offset = viewOffsetX (where this window looks)

                        // We calculate position in "Canvas Screens"
                        // If viewOffsetX is 0.25 (25% into world), we subtract that.

                        // Normalized world position moving left
                        let worldX = (b.x - time * layer.speed) % 1;
                        if (worldX < 0) worldX += 1;

                        // Apply Window View Offset
                        // This shifts the building based on which window we are
                        // We model the world as one continuous strip of width = 2.5 screens (approx)
                        // This allows buildings to flow from Window 1 -> Gap -> Window 2

                        // Screen scale factor: The world is wider than just one canvas
                        // Let's say the viewport "width" in world units is 0.25
                        const VIEWPORT_SCALE = 0.25;

                        // Calculate relative position frame for this specific window
                        let screenX = (worldX - viewOffsetX);

                        // Wrap logic handles continuity across the loop
                        if (screenX < -0.5) screenX += 1;
                        if (screenX > 0.5) screenX -= 1;

                        // Convert to pixels
                        // We multiply by 4 because if viewport is 0.25 of world, then 1.0 world = 4x canvas width
                        const x = screenX * (w / VIEWPORT_SCALE) + 50; // +50 margin

                        const bw = (b.width / VIEWPORT_SCALE) * w;
                        const bh = b.height * h * 0.8;

                        // Skip if clearly off-screen
                        if (x + bw < 0 || x > w) return;

                        // Render Building
                        ctx.fillStyle = palette.buildings[b.colorIndex];
                        ctx.globalAlpha = 0.4 + (layerIndex * 0.3);
                        ctx.fillRect(x, horizonY - bh, bw, bh);

                        // Windows
                        if (palette.lights && b.windows) {
                            // Advanced Window Rendering (Cityscape Style)
                            const winColors = palette.windowColors || [BRAND.vividOrange];
                            // Deterministic color picker helper
                            const pickColor = (s) => {
                                const idx = Math.floor(Math.abs(Math.sin(s)) * winColors.length);
                                return winColors[Math.min(idx, winColors.length - 1)];
                            };

                            const winSize = layerIndex === 0 ? 2 : (layerIndex === 1 ? 3 : 5);
                            const winGap = winSize + (layerIndex === 2 ? 4 : 2); // Slightly wider gap for foreground

                            const rows = Math.floor(bh / winGap);
                            const cols = Math.floor(bw / winGap);

                            for (let r = 1; r < rows - 1; r++) {
                                for (let c = 1; c < cols - 1; c++) {
                                    // Robust Seed
                                    const seed = (Math.abs(b.x) * 739391) + (r * 449) + (c * 199);
                                    const rand = Math.sin(seed);
                                    const isLit = rand > 0.6; // ~20% Lit

                                    if (isLit) {
                                        // Randomize Color if palette has multiple
                                        if (winColors.length > 1) {
                                            if (winColors.length > 2 || rand > 0.85) {
                                                ctx.fillStyle = pickColor(seed);
                                            } else {
                                                ctx.fillStyle = winColors[0];
                                            }
                                        } else {
                                            ctx.fillStyle = winColors[0];
                                        }

                                        // Apply Alpha for depth
                                        ctx.globalAlpha = layerIndex === 2 ? 1.0 : (layerIndex === 1 ? 0.8 : 0.5);

                                        ctx.fillRect(
                                            x + c * winGap,
                                            horizonY - bh + r * winGap + 2,
                                            winSize, winSize
                                        );
                                    }
                                }
                            }
                        }
                    });
                });

                ctx.globalAlpha = 1;

                // Ground
                ctx.fillStyle = palette.ground;
                ctx.fillRect(0, horizonY, w, h - horizonY);

                // Wires & Poles
                // Wires are continuous
                ctx.strokeStyle = palette.wires + '55';
                ctx.lineWidth = 1;
                ctx.beginPath();
                const wireY = h * 0.25;
                ctx.moveTo(0, wireY);
                for (let x = 0; x < w; x += 10) {
                    // Wire phase must shift by viewOffsetX to line up!
                    // Convert pixel x to world x
                    const worldXForWire = (x / w) * 0.25 + viewOffsetX;
                    ctx.lineTo(x, wireY + Math.sin(worldXForWire * 20 + time * 20) * 3);
                }
                ctx.stroke();

                // Poles - Continuous World Objects
                // Place a pole every 0.15 world units (approx every 60% of a window width)
                const POLE_GAP = 0.15;
                const POLE_SPEED = 1.2; // Faster than buildings

                // We iterate enough poles to cover the view
                // World position of this window is [viewOffsetX, viewOffsetX + 0.25] roughly
                // But poles move FAST, so we treat them as a scrolling texture

                // Let's just render poles based on time-shifted world coordinates
                // Pole World X = (index * GAP) - (time * SPEED)

                // Iterate potential nearby poles
                const scrollOffset = time * POLE_SPEED;
                const startPoleIdx = Math.floor((viewOffsetX + scrollOffset) / POLE_GAP);

                for (let i = startPoleIdx; i < startPoleIdx + 4; i++) {
                    const poleWorldX = (i * POLE_GAP) - scrollOffset;

                    // Normalize to 0..1 loop if we want looping, but infinite scrolling works better for poles
                    // No, for continuous world between windows, they must share the coordinate system.

                    // Calculate relative screen position
                    // poleWorldX is the absolute position in the 'infinite' track
                    // The window is looking at 'viewOffsetX'

                    // But wait, the buildings loop at 1.0. The poles should probably loop too? 
                    // If they move faster they desync from buildings. 
                    // Usually foreground moves faster.

                    // Let's make poles simply move fast and loop every 1.0
                    let pX = ((i * POLE_GAP) - (time * POLE_SPEED)) % 1;
                    if (pX < 0) pX += 1;

                    // Now project to screen relative to viewOffset
                    // Screen scale factor: The world is wider than just one canvas
                    const VIEWPORT_SCALE = 0.25;
                    let screenX = (pX - viewOffsetX);

                    // Wrap logic handles continuity across the loop
                    if (screenX < -0.5) screenX += 1;
                    if (screenX > 0.5) screenX -= 1;

                    const x = screenX * (w / VIEWPORT_SCALE) + 50;

                    // Draw Pole if on screen
                    if (x > -20 && x < w + 20) {
                        ctx.fillStyle = '#0a0a0a';
                        ctx.fillRect(x, wireY, 4, h - wireY);
                        // Crossbar
                        ctx.fillRect(x - 8, wireY + 4, 16, 3);
                    }
                }
                // Frame Reflection
                const grad = ctx.createLinearGradient(0, 0, w, h);
                grad.addColorStop(0, 'rgba(255,255,255,0.05)');
                grad.addColorStop(0.5, 'transparent');
                grad.addColorStop(1, 'rgba(255,255,255,0.02)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                animationRef.current = requestAnimationFrame(render);
            };
            render();
            return () => cancelAnimationFrame(animationRef.current);
        }, [viewOffsetX]); // Re-bind if offset changes (it won't)

        return (
            <div style={{
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                ...style
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '4px solid #1a1a1a',
                    background: '#000',
                    boxShadow: 'inset 0 0 20px #000'
                }}>
                    <canvas
                        ref={canvasRef}
                        width={300}
                        height={150}
                        style={{ width: '100%', height: '100%', display: 'block' }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: palette.interior,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 130px 1fr 1fr',
            gridTemplateRows: '100%',
            gap: '12px',
            padding: '12px 24px'
        }}>
            {/* 
                VIEW OFFSETS:
                Assume the "World" is a continuous strip.
                Window 1 sees 0.0 to 0.25
                Window 2 sees 0.25 to 0.50
                (Gap for profile)
                Window 3 sees 0.60 to 0.85
                Window 4 sees 0.85 to 1.10
            */}
            <WindowPane viewOffsetX={0.0} style={{ padding: '40px 12px 12px 12px' }} />
            <WindowPane viewOffsetX={0.28} style={{ padding: '40px 12px 12px 12px' }} />

            <div style={{ position: 'relative' }}></div>

            <WindowPane viewOffsetX={0.62} style={{ padding: '40px 12px 12px 12px' }} />
            <WindowPane viewOffsetX={0.90} style={{ padding: '40px 12px 12px 12px' }} />
        </div>
    );
};

export default TrainWindowBanner;
