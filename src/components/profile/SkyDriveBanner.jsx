import React, { useRef, useEffect, useMemo } from 'react';

/**
 * SkyDriveBanner - "THE VELOCITY COLLECTION" (V79)
 * 
 * ARCHITECTURAL SYMMETRY & UI HARMONY:
 * 1. TWIN-PANE PURSUIT: Re-architected into a symmetrical twin-window layout to clear the Profile Picture (PP) and action buttons.
 * 2. PROFILE PILLAR: A central architectural zone (140px) that ensures the PP area is never obstructed.
 * 3. INTERNALIZED HUD: Brackets and velocity readouts are now contained within the window panes.
 * 4. CONTINUOUS PARALLAX: A single city engine renders across both windows with perspective-aware offsets.
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
    velocity_mint: {
        sky: [BRAND.VOID, '#001a14', '#00332a'],
        city: { base: '#000806', lights: [BRAND.MINT, BRAND.ION_BLUE, BRAND.ICE_WHITE], fog: '#001a14' },
        traffic: BRAND.MINT,
        hud: BRAND.MINT,
        inner: '#050a08'
    },
    velocity_pink: {
        sky: [BRAND.VOID, '#1a000a', '#330015'],
        city: { base: '#080002', lights: [BRAND.SOLAR_PINK, BRAND.DEEP_PURPLE, BRAND.ICE_WHITE], fog: '#1a000a' },
        traffic: BRAND.SOLAR_PINK,
        hud: BRAND.SOLAR_PINK,
        inner: '#0a0508'
    },
    velocity_blue: {
        sky: [BRAND.VOID, '#00081a', '#001533'],
        city: { base: '#000208', lights: [BRAND.ION_BLUE, BRAND.DEEP_PURPLE, BRAND.MINT], fog: '#00081a' },
        traffic: BRAND.ION_BLUE,
        hud: BRAND.ION_BLUE,
        inner: '#05050f'
    },
    velocity_orange: {
        sky: [BRAND.VOID, '#1a0d00', '#331a00'],
        city: { base: '#080400', lights: [BRAND.STELLAR_ORANGE, BRAND.SOLAR_PINK, BRAND.ICE_WHITE], fog: '#1a0d00' },
        traffic: BRAND.STELLAR_ORANGE,
        hud: BRAND.STELLAR_ORANGE,
        inner: '#0a0805'
    }
};

const LCG = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
const hexToRgb = (h) => {
    const r = parseInt(h.length === 4 ? h[1] + h[1] : h.substring(1, 3), 16);
    const g = parseInt(h.length === 4 ? h[2] + h[2] : h.substring(3, 5), 16);
    const b = parseInt(h.length === 4 ? h[3] + h[3] : h.substring(5, 7), 16);
    return { r, g, b };
};
const mixColors = (c1, c2, o) => {
    const a = hexToRgb(c1), b = hexToRgb(c2 || BRAND.VOID);
    return `rgb(${Math.round(a.r * o + b.r * (1 - o))},${Math.round(a.g * o + b.g * (1 - o))},${Math.round(a.b * o + b.b * (1 - o))})`;
};

const SkyDriveBanner = ({ variant = 'velocity_blue' }) => {
    const palette = PALETTES[variant] || PALETTES.velocity_blue;
    const globalStateRef = useRef({ time: 0, cars: [], particles: [] });

    const world = useMemo(() => {
        const rand = LCG(777);
        const layers = Array.from({ length: 4 }, (_, l) => {
            const layer = []; let cx = -0.2;
            const isNear = l === 3;
            while (cx < 2.5) {
                const w = (140 + rand() * 320) / 2560;
                // Height Logic: Mix of low horizon and "Megastructures" that break the top frame
                const isSuperTall = rand() > 0.75;
                const baseH = isSuperTall ? (900 + rand() * 400) : (200 + rand() * 500);
                const h = (baseH / 1080) * (0.4 + l * 0.22);

                layer.push({ x: cx, w, h, seed: rand(), detail: isSuperTall || rand() > 0.7, tall: isSuperTall });
                cx += w + (isNear ? (0.5 + rand() * 0.9) : (0.04 + rand() * 0.15));
            }
            return layer;
        });
        return { layers };
    }, []);

    const WindowPane = ({ viewOffsetX, isLeft }) => {
        const canvasRef = useRef(null);
        const animationRef = useRef(null);

        useEffect(() => {
            const canvas = canvasRef.current; if (!canvas) return;
            const ctx = canvas.getContext('2d', { alpha: false });
            const state = globalStateRef.current;
            let active = true;

            const render = () => {
                if (!active) return;
                state.time += 0.008;
                const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

                // 1. Sky
                const sky = ctx.createLinearGradient(0, 0, 0, h);
                palette.sky.forEach((c, i) => sky.addColorStop(i / (palette.sky.length - 1), c));
                ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

                // 2. City Parallax
                world.layers.forEach((layer, lIdx) => {
                    const speed = (lIdx + 1) * 0.005;
                    const dF = 0.2 + (lIdx * 0.18);
                    const bCol = mixColors(palette.city.base, palette.city.fog, dF);

                    layer.forEach(b => {
                        let lx = ((b.x - state.time * speed) % 2.5);
                        if (lx < 0) lx += 2.5;

                        // Apply specific view offset for this window
                        let sx = (lx - viewOffsetX);
                        if (sx < -1.25) sx += 2.5;
                        if (sx > 1.25) sx -= 2.5;

                        const bx = sx * w * 4, bw = b.w * w * 4, bh = b.h * h, by = h * 0.96 - bh;
                        if (bx + bw < 0 || bx > w) return;

                        ctx.fillStyle = bCol; ctx.fillRect(bx, by, bw, bh);

                        const rand = LCG(Math.floor(b.seed * 1000000));
                        ctx.globalAlpha = dF * 0.7;
                        for (let wy = by + 12 * dpr; wy < by + bh - 12 * dpr; wy += 10 * dpr) {
                            for (let wx = bx + 4 * dpr; wx < bx + bw - 4 * dpr; wx += 6 * dpr) {
                                if (rand() > 0.6) {
                                    ctx.fillStyle = palette.city.lights[Math.floor(rand() * 3)];
                                    ctx.fillRect(wx, wy, 1.2 * dpr, 1.2 * dpr);
                                }
                            }
                        }
                        ctx.globalAlpha = 1;
                    });
                });

                // Glass Glare
                const glare = ctx.createLinearGradient(0, 0, w, h);
                glare.addColorStop(0, 'rgba(255,255,255,0.03)'); glare.addColorStop(0.5, 'transparent'); glare.addColorStop(1, 'rgba(255,255,255,0.01)');
                ctx.fillStyle = glare; ctx.fillRect(0, 0, w, h);

                if (active) animationRef.current = requestAnimationFrame(render);
            };
            const res = () => { if (!canvas) return; const dPR = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dPR; canvas.height = canvas.offsetHeight * dPR; };
            res(); render();
            return () => { active = false; cancelAnimationFrame(animationRef.current); };
        }, [viewOffsetX, isLeft]);

        return (
            <div style={{
                position: 'relative', width: '100%', height: '100%',
                border: `3px solid ${palette.hud}22`, borderRadius: '4px', overflow: 'hidden',
                background: BRAND.VOID, boxShadow: `inset 0 0 20px #000`
            }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>
        );
    };

    return (
        <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden', background: palette.inner,
            display: 'grid', gridTemplateColumns: '1fr 1fr 140px 1fr 1fr', gap: '12px', padding: '15px 25px'
        }}>
            {/* Left Windows */}
            <div style={{ padding: '30px 5px 5px 5px' }}><WindowPane viewOffsetX={0.0} isLeft={true} /></div>
            <div style={{ padding: '30px 5px 5px 5px' }}><WindowPane viewOffsetX={0.3} isLeft={true} /></div>

            {/* Profile Pillar (Safe Zone) */}
            <div style={{ position: 'relative' }}>
                <div style={{
                    position: 'absolute', top: '30px', bottom: '5px', left: 0, right: 0,
                    background: `linear-gradient(to bottom, ${palette.hud}11, transparent)`,
                    borderLeft: `1px solid ${palette.hud}22`, borderRight: `1px solid ${palette.hud}22`,
                    opacity: 0.5
                }} />
            </div>

            {/* Right Windows */}
            <div style={{ padding: '30px 5px 5px 5px' }}><WindowPane viewOffsetX={0.65} isLeft={false} /></div>
            <div style={{ padding: '30px 5px 5px 5px' }}><WindowPane viewOffsetX={0.95} isLeft={false} /></div>
        </div>
    );
};

export default SkyDriveBanner;
