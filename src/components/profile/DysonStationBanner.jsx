import React, { useRef, useEffect, useMemo } from 'react';

/**
 * DysonStationBanner - "THE MONOLITH COLLECTION" (V1)
 * 
 * CONCEPT: A brutalist, obsidian-clad observation deck overlooking a Dyson Swarm.
 * 
 * FEATURES:
 * 1. BRUTALIST ARCHITECTURE: Sharp, angled obsidian pillars and horizontal "blast slit" windows.
 * 2. DYSON SWARM: Thousands of tiny, glowing solar collectors orbiting a massive central star.
 * 3. FALLING DATA FILAMENTS: Vertical "Matrix-style" filaments of light on the glass (Panospace style).
 * 4. TACTICAL LIGHTING: Intense, narrow light beams and sharp neon reflections on dark polished stone.
 * 5. GEOMETRIC HUD: Shifting triangular patterns and orbit-tracking telemetry.
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
    dyson_mint: {
        id: 'Sector Mint',
        star: BRAND.MINT,
        nebula: '#001a14',
        interior: { accent: BRAND.MINT, wall: '#050a08', floor: '#020504' }
    },
    dyson_pink: {
        id: 'Sector Pink',
        star: BRAND.SOLAR_PINK,
        nebula: '#1a000a',
        interior: { accent: BRAND.SOLAR_PINK, wall: '#0a0508', floor: '#050204' }
    },
    dyson_blue: {
        id: 'Sector Blue',
        star: BRAND.ION_BLUE,
        nebula: '#00081a',
        interior: { accent: BRAND.ION_BLUE, wall: '#05050f', floor: '#020205' }
    },
    dyson_orange: {
        id: 'Sector Orange',
        star: BRAND.STELLAR_ORANGE,
        nebula: '#1a0d00',
        interior: { accent: BRAND.STELLAR_ORANGE, wall: '#0a0805', floor: '#050402' }
    }
};

const LCG = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };

const DysonStationBanner = ({ variant = 'dyson_mint' }) => {
    const palette = PALETTES[variant] || PALETTES.dyson_mint;
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const stateRef = useRef({ time: 0, swarm: [], filaments: [], hudAngle: 0 });

    const world = useMemo(() => {
        const rand = LCG(999);
        const collectors = Array.from({ length: 150 }, () => ({
            r: 200 + rand() * 500,
            angle: rand() * Math.PI * 2,
            speed: 0.0002 + rand() * 0.0005,
            size: 1 + rand() * 2,
            z: rand()
        }));
        const filaments = Array.from({ length: 30 }, () => ({
            x: rand(), y: rand(), s: 0.005 + rand() * 0.015, l: 0.1 + rand() * 0.2
        }));
        return { collectors, filaments };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        const state = stateRef.current;
        let active = true;

        const render = () => {
            if (!active) return;
            state.time += 0.01;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;
            const midX = w / 2, midY = h / 2;

            // 1. COSMIC BACKGROUND
            ctx.fillStyle = BRAND.VOID; ctx.fillRect(0, 0, w, h);

            // Central Star Glow
            const starGlow = ctx.createRadialGradient(midX, midY, 0, midX, midY, h * 0.8);
            starGlow.addColorStop(0, palette.star + '44');
            starGlow.addColorStop(0.2, palette.nebula);
            starGlow.addColorStop(1, BRAND.VOID);
            ctx.fillStyle = starGlow; ctx.fillRect(0, 0, w, h);

            // 2. DYSON SWARM
            world.collectors.forEach(c => {
                c.angle += c.speed;
                const sx = midX + Math.cos(c.angle) * c.r * (w / 2560);
                const sy = midY + Math.sin(c.angle) * c.r * (h / 1080) * 0.5;
                const distToMid = Math.sqrt(Math.pow(sx - midX, 2) + Math.pow(sy - midY, 2));
                const op = 0.2 + (1 - distToMid / (w / 2)) * 0.8;

                ctx.fillStyle = palette.star; ctx.globalAlpha = op * c.z;
                ctx.beginPath(); ctx.arc(sx, sy, c.size * dpr * c.z, 0, Math.PI * 2); ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 3. BRUTALIST OBSERVATORY FRAME
            const winH = h * 0.45;
            const topY = h * 0.25, botY = topY + winH;

            // Obsidian Pillars
            ctx.fillStyle = palette.interior.wall;
            // Top Frame
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w, topY);
            ctx.lineTo(midX + 70 * dpr, topY); ctx.lineTo(midX, topY + 40 * dpr); ctx.lineTo(midX - 70 * dpr, topY);
            ctx.lineTo(0, topY); ctx.closePath(); ctx.fill();

            // Bottom Frame
            ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w, h); ctx.lineTo(w, botY);
            ctx.lineTo(midX + 70 * dpr, botY); ctx.lineTo(midX, botY - 40 * dpr); ctx.lineTo(midX - 70 * dpr, botY);
            ctx.lineTo(0, botY); ctx.closePath(); ctx.fill();

            // Side Beams (Clearing PP)
            const gap = 80 * dpr;
            ctx.fillRect(0, topY, midX - gap, winH);
            ctx.fillRect(midX + gap, topY, winH, winH);

            // 4. DATA FILAMENTS ON GLASS
            ctx.strokeStyle = palette.star; ctx.lineWidth = 1 * dpr;
            world.filaments.forEach(f => {
                f.y += f.s; if (f.y > 1.2) f.y = -0.2;
                const fx = f.x * w;
                if (Math.abs(fx - midX) < gap) return; // Don't draw over PP gap

                const grad = ctx.createLinearGradient(fx, f.y * h, fx, (f.y + f.l) * h);
                grad.addColorStop(0, 'transparent'); grad.addColorStop(0.5, palette.star + '66'); grad.addColorStop(1, 'transparent');
                ctx.strokeStyle = grad;
                ctx.beginPath(); ctx.moveTo(fx, f.y * h); ctx.lineTo(fx, (f.y + f.l) * h); ctx.stroke();
            });

            // 5. TACTICAL HUD
            ctx.save();
            ctx.translate(midX, midY);
            state.hudAngle += 0.005;
            ctx.rotate(state.hudAngle);
            ctx.strokeStyle = palette.star; ctx.lineWidth = 0.5 * dpr; ctx.globalAlpha = 0.2;

            // Orbit Circles
            ctx.beginPath(); ctx.arc(0, 0, 120 * dpr, 0, Math.PI * 2); ctx.stroke();
            // Shifting Triangles
            for (let i = 0; i < 3; i++) {
                ctx.rotate(Math.PI * 2 / 3);
                ctx.beginPath(); ctx.moveTo(130 * dpr, 0); ctx.lineTo(150 * dpr, -10 * dpr); ctx.lineTo(150 * dpr, 10 * dpr); ctx.closePath(); ctx.stroke();
            }
            ctx.restore();
            ctx.globalAlpha = 1;

            // 6. POLISHED REFLECTIONS
            const refG = ctx.createLinearGradient(0, botY, 0, h);
            refG.addColorStop(0, palette.star + '22');
            refG.addColorStop(0.5, palette.interior.floor);
            refG.addColorStop(1, BRAND.VOID);
            ctx.fillStyle = refG; ctx.fillRect(0, botY, w, h - botY);

            // Light Beams (God Rays)
            const rayG = ctx.createLinearGradient(midX, topY, midX, botY);
            rayG.addColorStop(0, palette.star + '11');
            rayG.addColorStop(1, 'transparent');
            ctx.fillStyle = rayG;
            ctx.fillRect(0, topY, midX - gap, winH);
            ctx.fillRect(midX + gap, topY, w - (midX + gap), winH);

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

export default DysonStationBanner;
