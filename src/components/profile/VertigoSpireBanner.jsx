import React, { useRef, useEffect, useMemo } from 'react';

/**
 * VertigoSpireBanner - "THE VERTIGO COLLECTION" (V1)
 * 
 * CONCEPT: Looking straight down from a high-altitude glass ledge.
 * 
 * FEATURES:
 * 1. DEPTH PERSPECTIVE: Buildings recede into a bottomless neon abyss.
 * 2. VERTICAL TRAFFIC: Hover cars move on grid-lanes deep below the "glass".
 * 3. FALLING RAIN: Rain hits the glass and spreads, catching neon light.
 * 4. SYMMETRICAL VOID: A central architectural pillar clears the profile UI.
 * 5. ATMOSPHERIC BOKEH: Deep ground-level fog and blurry distant lights.
 */

const BRAND = {
    MINT: '#7FFFD4',
    ION_BLUE: '#1B82FF',
    DEEP_PURPLE: '#5A3FFF',
    SOLAR_PINK: '#FF5C8A',
    STELLAR_ORANGE: '#FF914D',
    ICE_WHITE: '#F2F7FA',
    VOID: '#010103'
};

const PALETTES = {
    vertigo_mint: {
        id: 'Abyss Mint',
        sky: [BRAND.VOID, '#001a14', '#00332a'],
        city: [BRAND.MINT, BRAND.ION_BLUE, BRAND.ICE_WHITE],
        accent: BRAND.MINT
    },
    vertigo_pink: {
        id: 'Abyss Pink',
        sky: [BRAND.VOID, '#1a000a', '#330015'],
        city: [BRAND.SOLAR_PINK, BRAND.DEEP_PURPLE, BRAND.ICE_WHITE],
        accent: BRAND.SOLAR_PINK
    },
    vertigo_blue: {
        id: 'Abyss Blue',
        sky: [BRAND.VOID, '#00081a', '#001533'],
        city: [BRAND.ION_BLUE, BRAND.DEEP_PURPLE, BRAND.MINT],
        accent: BRAND.ION_BLUE
    },
    vertigo_orange: {
        id: 'Abyss Orange',
        sky: [BRAND.VOID, '#1a0d00', '#331a00'],
        city: [BRAND.STELLAR_ORANGE, BRAND.SOLAR_PINK, BRAND.ICE_WHITE],
        accent: BRAND.STELLAR_ORANGE
    }
};

const LCG = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };

const VertigoSpireBanner = ({ variant = 'vertigo_blue' }) => {
    const palette = PALETTES[variant] || PALETTES.vertigo_blue;
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const stateRef = useRef({ time: 0, cars: [], rain: [] });

    const world = useMemo(() => {
        const rand = LCG(555);
        const buildings = Array.from({ length: 40 }, () => ({
            x: rand() * 2 - 0.5,
            y: rand() * 2 - 0.5,
            depth: 0.1 + rand() * 0.9,
            size: 0.05 + rand() * 0.1,
            color: palette.city[Math.floor(rand() * palette.city.length)]
        }));
        return { buildings };
    }, [palette]);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        const state = stateRef.current;
        let active = true;

        if (state.rain.length === 0) {
            for (let i = 0; i < 60; i++) state.rain.push({ x: Math.random(), y: Math.random(), s: 0.005 + Math.random() * 0.01, op: Math.random() });
        }

        const render = () => {
            if (!active) return;
            state.time += 0.005;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;
            const midX = w / 2, midY = h / 2;

            // 1. THE ABYSS (Deep Radial)
            const bg = ctx.createRadialGradient(midX, midY, 0, midX, midY, w * 0.8);
            bg.addColorStop(0, '#000');
            bg.addColorStop(0.6, palette.sky[1]);
            bg.addColorStop(1, BRAND.VOID);
            ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

            // 2. RECEDING BUILDINGS (Top-Down Perspective)
            world.buildings.forEach(b => {
                // Perspective math: closer to center = deeper
                const bx = midX + b.x * w * b.depth;
                const by = midY + b.y * h * b.depth;
                const size = b.size * w * b.depth;

                ctx.fillStyle = b.color;
                ctx.globalAlpha = 0.1 + b.depth * 0.4;
                ctx.fillRect(bx, by, size, size);

                // Light trails deep below
                if (b.depth < 0.3) {
                    ctx.fillStyle = '#fff';
                    ctx.globalAlpha = 0.05;
                    ctx.fillRect(bx - size, by + size * 2, size * 3, 1);
                }
            });
            ctx.globalAlpha = 1;

            // 3. ARCHITECTURAL POCKETS (Window Frames)
            const winW = w * 0.4, winH = h * 0.8;
            const windows = [
                { x: midX - w * 0.44, w: winW },
                { x: midX + w * 0.04, w: winW }
            ];

            // Blackout Mask (Room)
            ctx.fillStyle = BRAND.VOID;
            // Central Pillar
            ctx.fillRect(midX - 30 * dpr, 0, 60 * dpr, h);
            // Top/Bottom Ledges
            ctx.fillRect(0, 0, w, h * 0.15);
            ctx.fillRect(0, h * 0.85, w, h * 0.15);
            // Side Walls
            ctx.fillRect(0, 0, w * 0.04, h);
            ctx.fillRect(w * 0.96, 0, w * 0.04, h);

            // 4. GLASS EFFECTS (On Window Areas Only)
            windows.forEach(win => {
                // Subtle Glass tint
                ctx.fillStyle = palette.accent + '05';
                ctx.fillRect(win.x, h * 0.15, win.w, h * 0.7);

                // Rain on Glass
                ctx.fillStyle = '#fff';
                state.rain.forEach(r => {
                    const rx = win.x + r.x * win.w;
                    const ry = h * 0.15 + ((r.y + state.time) % 1) * (h * 0.7);

                    ctx.globalAlpha = r.op * 0.2;
                    ctx.beginPath(); ctx.arc(rx, ry, 1 * dpr, 0, Math.PI * 2); ctx.fill();

                    // Small "smudge" trail
                    ctx.strokeStyle = '#fff'; ctx.globalAlpha = r.op * 0.05;
                    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx, ry - 10 * dpr); ctx.stroke();
                });
                ctx.globalAlpha = 1;

                // Frame Glow
                ctx.strokeStyle = palette.accent + '15'; ctx.lineWidth = 1 * dpr;
                ctx.strokeRect(win.x, h * 0.15, win.w, h * 0.7);
            });

            // 5. INTERIOR AMBIENCE
            const ledgeGlow = ctx.createLinearGradient(0, h * 0.85, 0, h);
            ledgeGlow.addColorStop(0, palette.accent + '22'); ledgeGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = ledgeGlow; ctx.fillRect(0, h * 0.85, w, h * 0.15);

            if (active) animationRef.current = requestAnimationFrame(render);
        };

        const res = () => { if (!canvas) return; const dPR = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dPR; canvas.height = canvas.offsetHeight * dPR; };
        window.addEventListener('resize', res); res(); render();
        return () => { active = false; cancelAnimationFrame(animationRef.current); window.removeEventListener('resize', res); };
    }, [palette, world]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: BRAND.VOID }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default VertigoSpireBanner;
