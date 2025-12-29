import React, { useRef, useEffect, useMemo } from 'react';

/**
 * BotanicalWindowBanner - "THE ARBORETUM COLLECTION" (V1)
 * 
 * CONCEPT: A high-tech sanctuary looking out from a floating greenhouse.
 * 
 * FEATURES:
 * 1. ORGANIC SILHOUETTES: Layered shadows of exotic plants (Monsteras, Palms) that sway in the HVAC.
 * 2. ARCHED GEOMETRY: Elegant curved window frames for a more "grand observatory" feel.
 * 3. BIOLUMINESCENT SPORES: Floating, glowing particles that react to the interior light.
 * 4. ETHEREAL EXTERIORS: Sunsets, auroras, and misty "cloud-forest" cities.
 * 5. CINEMATIC BLOOM: Soft lighting that bleeds from the plant edges into the room.
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
    botanic_mint: {
        id: 'Emerald Haven',
        sky: [BRAND.VOID, '#001a14', '#00332a'],
        exterior: { base: '#000806', detail: [BRAND.MINT, BRAND.ION_BLUE], fog: '#001a14' },
        interior: { accent: BRAND.MINT, wall: '#050a08', plants: '#001a10' }
    },
    botanic_pink: {
        id: 'Orchid Spire',
        sky: [BRAND.VOID, '#1a000a', '#330015'],
        exterior: { base: '#080002', detail: [BRAND.SOLAR_PINK, BRAND.DEEP_PURPLE], fog: '#1a000a' },
        interior: { accent: BRAND.SOLAR_PINK, wall: '#0a0508', plants: '#1a000d' }
    },
    botanic_amber: {
        id: 'Solar Grove',
        sky: [BRAND.VOID, '#1a0d00', '#331a00'],
        exterior: { base: '#080400', detail: [BRAND.STELLAR_ORANGE, BRAND.SOLAR_PINK], fog: '#1a0d00' },
        interior: { accent: BRAND.STELLAR_ORANGE, wall: '#0a0805', plants: '#1a0d00' }
    },
    botanic_blue: {
        id: 'Cobalt Sanctuary',
        sky: [BRAND.VOID, '#00081a', '#001533'],
        exterior: { base: '#000208', detail: [BRAND.ION_BLUE, BRAND.DEEP_PURPLE], fog: '#00081a' },
        interior: { accent: BRAND.ION_BLUE, wall: '#05050f', plants: '#00081a' }
    }
};

const LCG = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };

const BotanicalWindowBanner = ({ variant = 'botanic_mint' }) => {
    const palette = PALETTES[variant] || PALETTES.botanic_mint;
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const stateRef = useRef({ time: 0, spores: [], movement: [] });

    const world = useMemo(() => {
        const rand = LCG(888);
        const plants = Array.from({ length: 12 }, () => ({
            x: rand(), y: 0.5 + rand() * 0.4, type: rand() > 0.5 ? 'PALM' : 'MONSTERA',
            scale: 0.8 + rand() * 0.6, phase: rand() * Math.PI * 2, speed: 0.01 + rand() * 0.02
        }));
        const stars = Array.from({ length: 50 }, () => ({ x: rand(), y: rand() * 0.5, op: rand() }));
        return { plants, stars };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        const state = stateRef.current;
        let active = true;

        if (state.spores.length === 0) {
            for (let i = 0; i < 40; i++) state.spores.push({ x: Math.random(), y: Math.random(), s: 0.0005 + Math.random() * 0.001, op: Math.random(), amp: 0.2 + Math.random() * 0.5 });
        }

        const drawPlant = (x, y, scale, phase, type, dpr, time, theme) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            const sway = Math.sin(time * 2 + phase) * 0.05;
            ctx.rotate(sway);

            ctx.fillStyle = theme.interior.plants;
            ctx.globalAlpha = 0.9;

            if (type === 'PALM') {
                // Tall leaves
                for (let i = 0; i < 5; i++) {
                    ctx.save();
                    ctx.rotate((i - 2) * 0.4 + sway * 2);
                    ctx.beginPath();
                    ctx.ellipse(0, -100 * dpr, 10 * dpr, 100 * dpr, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            } else {
                // Large broad leaves
                for (let i = 0; i < 3; i++) {
                    ctx.save();
                    ctx.rotate((i - 1) * 0.8 + sway);
                    ctx.beginPath();
                    ctx.ellipse(0, -60 * dpr, 30 * dpr, 60 * dpr, 0.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        };

        const render = () => {
            if (!active) return;
            state.time += 0.01;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;
            const midX = w / 2;

            // 1. SKY
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            palette.sky.forEach((c, i) => sky.addColorStop(i / (palette.sky.length - 1), c));
            ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

            // 2. STARS
            ctx.fillStyle = '#fff';
            world.stars.forEach(s => {
                ctx.globalAlpha = s.op * (0.5 + Math.sin(state.time * 2 + s.x * 10) * 0.5);
                ctx.fillRect(s.x * w, s.y * h, dpr, dpr);
            });
            ctx.globalAlpha = 1;

            // 3. ARCHED WINDOW LOGIC (THE SYMMETRY)
            const winW = w * 0.35, winH = h * 0.8;
            const windows = [
                { x: midX - w * 0.44, w: winW },
                { x: midX + w * 0.09, w: winW }
            ];

            // Masking & Frame
            ctx.fillStyle = palette.interior.wall;
            ctx.fillRect(0, 0, w, h);

            windows.forEach(win => {
                // Arched Window Cutout
                ctx.save();
                ctx.beginPath();
                const radius = win.w / 2;
                ctx.arc(win.x + radius, h * 0.2 + radius, radius, Math.PI, 0); // Top Arch
                ctx.rect(win.x, h * 0.2 + radius, win.w, h * 0.7); // Bottom Body
                ctx.clip();

                // --- CONTENT INSIDE WINDOW ---
                // Exterior Fog
                const fogG = ctx.createLinearGradient(0, h * 0.5, 0, h);
                fogG.addColorStop(0, 'transparent'); fogG.addColorStop(1, palette.exterior.fog);
                ctx.fillStyle = fogG; ctx.fillRect(win.x, 0, win.w, h);

                // Plants
                world.plants.forEach(p => {
                    const plantX = win.x + (p.x * win.w);
                    drawPlant(plantX, h * 0.95, p.scale * dpr, p.phase, p.type, dpr, state.time, palette);
                });

                // Glass Glare
                const glare = ctx.createLinearGradient(win.x, 0, win.x + win.w, h);
                glare.addColorStop(0, 'rgba(255,255,255,0.05)'); glare.addColorStop(0.5, 'transparent'); glare.addColorStop(1, 'rgba(255,255,255,0.02)');
                ctx.fillStyle = glare; ctx.fillRect(win.x, 0, win.w, h);

                ctx.restore();

                // Window Frame
                ctx.strokeStyle = palette.interior.wall; ctx.lineWidth = 10 * dpr;
                ctx.beginPath();
                const r = win.w / 2;
                ctx.arc(win.x + r, h * 0.2 + r, r, Math.PI, 0);
                ctx.rect(win.x, h * 0.2 + r, win.w, h * 0.7);
                ctx.stroke();

                // Subtle inner glow on frame
                ctx.strokeStyle = palette.interior.accent + '22'; ctx.lineWidth = 2 * dpr;
                ctx.stroke();
            });

            // 4. BIOLUMINESCENT SPORES (FLOATING IN THE ROOM)
            ctx.fillStyle = palette.interior.accent;
            state.spores.forEach(p => {
                p.y -= p.s; p.x += Math.sin(state.time + p.y * 10) * 0.0005;
                if (p.y < -0.1) p.y = 1.1;
                const shine = 0.5 + Math.sin(state.time * 3 + p.x * 20) * 0.5;
                ctx.globalAlpha = p.op * shine * 0.6;
                ctx.shadowBlur = 10 * dpr; ctx.shadowColor = palette.interior.accent;
                ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 1.5 * dpr, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            });
            ctx.globalAlpha = 1;

            // 5. GOD RAYS (SOFT BLOOM)
            windows.forEach(win => {
                const bloom = ctx.createLinearGradient(win.x + win.w / 2, h * 0.2, win.x + win.w / 2, h);
                bloom.addColorStop(0, palette.interior.accent + '11');
                bloom.addColorStop(1, 'transparent');
                ctx.fillStyle = bloom; ctx.fillRect(win.x, h * 0.2, win.w, h * 0.8);
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

export default BotanicalWindowBanner;
