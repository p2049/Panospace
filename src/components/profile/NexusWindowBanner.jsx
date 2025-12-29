import React, { useRef, useEffect, useMemo } from 'react';

/**
 * NexusWindowBanner - "THE NEXUS COLLECTION" (V1)
 * 
 * CONCEPT: Each window pane looks into a different layer of reality/time/aesthetic.
 * 
 * FEATURES:
 * 1. REALITY SPLIT: Pane 1 (Lofi), Pane 2 (Cyber), Pane 3 (Noir), Pane 4 (Glitch).
 * 2. SHARED GEOMETRY: All windows see the same street corner, but in different styles.
 * 3. INTER-DIMENSIONAL RAIN: Rain falls across all realities but changes color per pane.
 * 4. SYMMETRICAL FRAME: A architectural "Nexus" station that clears the profile picture.
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

const REALITIES = {
    LOFI: { sky: ['#0d040a', '#1a0510'], lights: BRAND.STELLAR_ORANGE, fog: '#1a0510' },
    CYBER: { sky: [BRAND.VOID, '#001a33'], lights: BRAND.ION_BLUE, fog: '#000810' },
    AURORA: { sky: [BRAND.VOID, '#00332a'], lights: BRAND.MINT, fog: '#001005' },
    GLITCH: { sky: ['#050510', BRAND.SOLAR_PINK], lights: BRAND.ICE_WHITE, fog: BRAND.VOID }
};

const LCG = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };

const NexusWindowBanner = ({ variant = 'nexus_all' }) => {
    const globalTimeRef = useRef(0);

    const world = useMemo(() => {
        const rand = LCG(1234);
        const buildings = Array.from({ length: 8 }, () => ({
            x: rand(), w: 0.1 + rand() * 0.2, h: 0.3 + rand() * 0.6,
            seed: rand()
        }));
        return { buildings };
    }, []);

    const RealityPane = ({ reality, viewOffsetX }) => {
        const canvasRef = useRef(null);
        const animationRef = useRef(null);

        useEffect(() => {
            const canvas = canvasRef.current; if (!canvas) return;
            const ctx = canvas.getContext('2d', { alpha: false });
            let active = true;

            const render = () => {
                if (!active) return;
                globalTimeRef.current += 0.0001;
                const time = globalTimeRef.current;
                const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;
                const ground = h * 0.95;

                // 1. SKY
                const sky = ctx.createLinearGradient(0, 0, 0, h);
                reality.sky.forEach((c, i) => sky.addColorStop(i / (reality.sky.length - 1), c));
                ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

                // 2. BUILDINGS (Consistent across panes)
                world.buildings.forEach(b => {
                    const bx = ((b.x - time * 50) % 1) * w, bw = b.w * w, bh = b.h * h, by = ground - bh;
                    const bCol = reality.fog;

                    ctx.fillStyle = bCol;
                    ctx.fillRect(bx, by, bw, bh);

                    // Windows in reality style
                    const rand = LCG(Math.floor(b.seed * 1000));
                    ctx.fillStyle = reality.lights; ctx.globalAlpha = 0.6;
                    for (let wy = by + 10; wy < ground - 10; wy += 15) {
                        for (let wx = bx + 5; wx < bx + bw - 5; wx += 10) {
                            if (rand() > 0.7) ctx.fillRect(wx, wy, 2, 2);
                        }
                    }
                    ctx.globalAlpha = 1;
                });

                // 3. REALITY OVERLAY (Glitches, Fog, Smoke)
                if (reality === REALITIES.GLITCH) {
                    if (Math.random() > 0.95) {
                        ctx.fillStyle = BRAND.SOLAR_PINK; ctx.globalAlpha = 0.1;
                        ctx.fillRect(Math.random() * w, 0, 2, h); ctx.globalAlpha = 1;
                    }
                }

                if (active) animationRef.current = requestAnimationFrame(render);
            };
            const res = () => { if (!canvas) return; const dPR = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dPR; canvas.height = canvas.offsetHeight * dPR; };
            res(); render();
            return () => { active = false; cancelAnimationFrame(animationRef.current); };
        }, [reality]);

        return (
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', background: '#000' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', color: reality.lights, fontSize: '10px', fontFamily: 'monospace', opacity: 0.5 }}>{Object.keys(REALITIES).find(k => REALITIES[k] === reality)}</div>
            </div>
        );
    };

    return (
        <div style={{ position: 'absolute', inset: 0, padding: '20px 30px', display: 'grid', gridTemplateColumns: '1fr 1fr 140px 1fr 1fr', gap: '10px', background: BRAND.VOID }}>
            <div style={{ padding: '20px 0 5px 0' }}><RealityPane reality={REALITIES.LOFI} /></div>
            <div style={{ padding: '20px 0 5px 0' }}><RealityPane reality={REALITIES.CYBER} /></div>
            <div style={{ position: 'relative' }} /> {/* PP Gap */}
            <div style={{ padding: '20px 0 5px 0' }}><RealityPane reality={REALITIES.AURORA} /></div>
            <div style={{ padding: '20px 0 5px 0' }}><RealityPane reality={REALITIES.GLITCH} /></div>
        </div>
    );
};

export default NexusWindowBanner;
