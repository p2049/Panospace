import React, { useRef, useEffect, useMemo } from 'react';

/**
 * NeonRainBanner - "THE SANCTUARY COLLECTION" (V1)
 * 
 * CONCEPT: The ultimate lo-fi sanctuary. A rainy night window overlooking a neon-soaked city.
 * 
 * FEATURES:
 * 1. DRIP-TECH: Animated water droplets that streak down the glass and catch theme colors.
 * 2. BOKEH CITY: A blurry, atmospheric neon world with glowing signs and moving vehicle shadows.
 * 3. COZY INTERIOR: Soft, reflective surfaces and "steamed glass" edges near the frames.
 * 4. AMBIENT BLOOM: Light bleeds from the distant "bokeh" signs into the rainy glass.
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
    rain_mint: {
        id: 'Rainy Mint',
        sky: [BRAND.VOID, '#001a14', '#00332a'],
        bokeh: [BRAND.MINT, BRAND.ION_BLUE, BRAND.ICE_WHITE],
        interior: { accent: BRAND.MINT, desk: '#0a1a15', glow: 'rgba(127, 255, 212, 0.1)' }
    },
    rain_pink: {
        id: 'Neon Sunset',
        sky: [BRAND.VOID, '#1a000a', '#330015'],
        bokeh: [BRAND.SOLAR_PINK, BRAND.DEEP_PURPLE, BRAND.ICE_WHITE],
        interior: { accent: BRAND.SOLAR_PINK, desk: '#1a0a10', glow: 'rgba(255, 92, 138, 0.1)' }
    },
    rain_blue: {
        id: 'Electric Storm',
        sky: [BRAND.VOID, '#00081a', '#001533'],
        bokeh: [BRAND.ION_BLUE, BRAND.DEEP_PURPLE, BRAND.MINT],
        interior: { accent: BRAND.ION_BLUE, desk: '#0a0a1a', glow: 'rgba(27, 130, 255, 0.1)' }
    },
    rain_amber: {
        id: 'Stellar Dusk',
        sky: [BRAND.VOID, '#1a0d00', '#331a00'],
        bokeh: [BRAND.STELLAR_ORANGE, BRAND.SOLAR_PINK, BRAND.ICE_WHITE],
        interior: { accent: BRAND.STELLAR_ORANGE, desk: '#1a1005', glow: 'rgba(255, 145, 77, 0.1)' }
    }
};

const LCG = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };

const NeonRainBanner = ({ variant = 'rain_mint' }) => {
    const palette = PALETTES[variant] || PALETTES.rain_mint;
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const stateRef = useRef({ time: 0, drops: [], bokeh: [] });

    const world = useMemo(() => {
        const rand = LCG(12345);
        const bokeh = Array.from({ length: 25 }, () => ({
            x: rand(), y: 0.1 + rand() * 0.8, s: 20 + rand() * 60,
            c: palette.bokeh[Math.floor(rand() * palette.bokeh.length)],
            op: 0.1 + rand() * 0.4, vx: (rand() - 0.5) * 0.0005
        }));
        return { bokeh };
    }, [palette]);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        const state = stateRef.current;
        let active = true;

        if (state.drops.length === 0) {
            for (let i = 0; i < 100; i++) {
                state.drops.push({
                    x: Math.random(), y: Math.random(),
                    speed: 0.001 + Math.random() * 0.003,
                    size: 0.5 + Math.random() * 1.5,
                    trail: []
                });
            }
        }

        const render = () => {
            if (!active) return;
            state.time += 0.01;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;
            const midX = w / 2;

            // 1. SKY / BACKGROUND
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            palette.sky.forEach((c, i) => sky.addColorStop(i / (palette.sky.length - 1), c));
            ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

            // 2. BOKEH CITY (BLURRY LIGHTS)
            world.bokeh.forEach(b => {
                b.x += b.vx; if (b.x < -0.1) b.x = 1.1; if (b.x > 1.1) b.x = -0.1;
                const bx = b.x * w, by = b.y * h;
                const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.s * dpr);
                grad.addColorStop(0, b.c); grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad; ctx.globalAlpha = b.op * (0.8 + Math.sin(state.time + b.x) * 0.2);
                ctx.beginPath(); ctx.arc(bx, by, b.s * dpr, 0, Math.PI * 2); ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 3. WINDOW FRAMING
            const winW = w * 0.38, winH = h * 0.8;
            const windows = [
                { x: midX - w * 0.43, w: winW },
                { x: midX + w * 0.05, w: winW }
            ];

            // 4. RAIN DRIPS (ON GLASS)
            ctx.lineWidth = 1 * dpr;
            state.drops.forEach(d => {
                d.y += d.speed;
                if (d.y > 1.1) { d.y = -0.1; d.x = Math.random(); d.trail = []; }

                const dx = d.x * w, dy = d.y * h;
                // Only draw rain if it's over a window
                const inWin = windows.some(win => dx > win.x && dx < win.x + win.w);
                if (!inWin) return;

                // Drip Head
                ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.3;
                ctx.beginPath(); ctx.arc(dx, dy, d.size * dpr, 0, Math.PI * 2); ctx.fill();

                // Catch Light from theme
                ctx.fillStyle = palette.interior.accent; ctx.globalAlpha = 0.2;
                ctx.beginPath(); ctx.arc(dx, dy, (d.size + 1) * dpr, 0, Math.PI * 2); ctx.fill();

                // Small trail
                ctx.strokeStyle = '#fff'; ctx.globalAlpha = 0.1;
                ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx, dy - 15 * dpr); ctx.stroke();
            });
            ctx.globalAlpha = 1;

            // 5. ROOM INTERIOR (COZY MASK)
            ctx.fillStyle = BRAND.VOID;
            // Floor / Desk
            ctx.fillRect(0, h * 0.75, w, h * 0.25);
            // Center Pillar
            ctx.fillRect(midX - w * 0.05, 0, w * 0.1, h);
            // Top/Edges
            ctx.fillRect(0, 0, w, h * 0.1);
            ctx.fillRect(0, 0, w * 0.07, h);
            ctx.fillRect(w * 0.93, 0, w * 0.07, h);

            // Reflected Glow on Desk
            const deskGlow = ctx.createLinearGradient(0, h * 0.75, 0, h);
            deskGlow.addColorStop(0, palette.interior.glow);
            deskGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = deskGlow; ctx.fillRect(0, h * 0.75, w, h * 0.25);

            // Window Frames Detail
            ctx.strokeStyle = '#111'; ctx.lineWidth = 4 * dpr;
            windows.forEach(win => {
                ctx.strokeRect(win.x, h * 0.1, win.w, h * 0.65);
                // Glass edges "Steam"
                const steam = ctx.createLinearGradient(win.x, 0, win.x + 20 * dpr, 0);
                steam.addColorStop(0, 'rgba(255,255,255,0.03)'); steam.addColorStop(1, 'transparent');
                ctx.fillStyle = steam; ctx.fillRect(win.x, h * 0.1, 20 * dpr, h * 0.65);
            });

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

export default NeonRainBanner;
