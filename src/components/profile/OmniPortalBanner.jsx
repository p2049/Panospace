import React, { useRef, useEffect, useMemo } from 'react';

/**
 * OmniPortalBanner - "SINGULARITY EDITION" (THE FINAL SYNTHESIS)
 * 
 * THE ULTIMATE DISPLAY: An obsessive-level integration of every aesthetic 
 * peak achieved in the Panospace banner ecosystem (90+ unique builds).
 * 
 * THE ART CORE:
 * 1. GRAVITATIONAL LENSING (SpaceStation V.Trillion): A central singularity warping light behind the glass.
 * 2. HEX-HUD OVERLAY (SciFiUI): Dynamic holographic hex-grids and targeting arrays.
 * 3. BOREALIS NEBULA (Omega/Elysium): Shifting, multi-chromatic gas clouds with deep volumetric noise.
 * 4. DYSON ARCHITECTURE (DysonStation): Massive orbital rings with flickering industrial colonies.
 * 5. VERTIGO PERSPECTIVE (SkyDrive/Vertigo): Parallax-distorted city layers and high-speed light trails.
 * 6. BIOLUMINESCENT SPORES (Botanical/Aquarium): Floating particles catching the prism-light of the nebula.
 * 7. DRIP-TECH (Neon Rain): Water condensation logic on the viewports.
 * 8. PULSE VISUALIZER (Pulse): Core power-geometric spikes reacting to the machine's state.
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

const THEMES = {
    singularity_nexus: {
        id: 'Singularity Nexus',
        palette: [BRAND.DEEP_PURPLE, BRAND.ION_BLUE, BRAND.MINT],
        accent: BRAND.MINT, type: 'NEXUS'
    },
    singularity_supernova: {
        id: 'Supernova Forge',
        palette: [BRAND.VOID, BRAND.STELLAR_ORANGE, BRAND.SOLAR_PINK],
        accent: BRAND.SOLAR_PINK, type: 'FORGE'
    }
};

const LCG = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };

const safeAlpha = (hex, alpha) => {
    if (!hex) return 'transparent';
    let r, g, b;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
    } else {
        r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const OmniPortalBanner = ({ variant = 'singularity_nexus' }) => {
    const theme = THEMES[variant] || THEMES.singularity_nexus;
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const stateRef = useRef({ time: 0, rain: [], ships: [], spores: [], hexFlicker: [] });

    const world = useMemo(() => {
        const rand = LCG(420);
        const stars = Array.from({ length: 80 }, () => ({ x: rand(), y: rand(), s: 0.5 + rand(), op: rand() }));

        // Dyson Ring arcs
        const rings = Array.from({ length: 2 }, () => ({
            y: 0.2 + rand() * 0.4,
            t: 80 + rand() * 120,
            seed: rand()
        }));

        // Hex centers
        const hexes = Array.from({ length: 12 }, () => ({ x: rand(), y: rand(), size: 20 + rand() * 30, op: rand() }));

        // Parallax City (Low-res silhouettes)
        const buildings = Array.from({ length: 15 }, () => ({
            x: rand(), w: 0.02 + rand() * 0.04, h: 0.1 + rand() * 0.2, seed: rand()
        }));

        return { stars, rings, hexes, buildings };
    }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        const state = stateRef.current;
        let active = true;

        if (state.rain.length === 0) {
            for (let i = 0; i < 40; i++) state.rain.push({ x: Math.random(), y: Math.random(), s: 0.005 + Math.random() * 0.015, op: Math.random() });
            for (let i = 0; i < 50; i++) state.spores.push({ x: Math.random(), y: Math.random(), s: 1 + Math.random() * 2, vx: (Math.random() - 0.5) * 0.0005, vy: (Math.random() - 0.5) * 0.0005 });
        }

        const drawHex = (x, y, size, alpha) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const hx = x + size * Math.cos(angle);
                const hy = y + size * Math.sin(angle);
                if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.globalAlpha = alpha; ctx.stroke(); ctx.globalAlpha = 1;
        };

        const drawExterior = (w, h, dpr, time) => {
            // THE NEBULA (omega/borealis)
            const bg = ctx.createLinearGradient(0, 0, 0, h);
            theme.palette.forEach((c, i) => bg.addColorStop(i / (theme.palette.length - 1), c));
            ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

            // Shifting Color Clouds
            for (let i = 0; i < 4; i++) {
                const cx = (Math.sin(time * 0.1 + i) * 0.5 + 0.5) * w;
                const cy = (Math.cos(time * 0.15 + i) * 0.5 + 0.5) * h;
                const rad = h * (0.8 + Math.sin(time * 0.5 + i) * 0.2);
                const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
                g.addColorStop(0, safeAlpha(theme.palette[i % theme.palette.length], 0.2));
                g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
            }

            // DYSON ARCHS
            world.rings.forEach(r => {
                const ry = r.y * h + Math.sin(time * 0.1 + r.seed) * 20 * dpr;
                ctx.strokeStyle = safeAlpha(theme.accent, 0.1); ctx.lineWidth = r.t * dpr;
                ctx.beginPath(); ctx.moveTo(-50, ry); ctx.bezierCurveTo(w * 0.3, ry - 50 * dpr, w * 0.7, ry + 50 * dpr, w + 50, ry); ctx.stroke();

                // Ring Lights
                ctx.strokeStyle = safeAlpha(theme.accent, 0.4); ctx.lineWidth = 1 * dpr;
                for (let i = 0; i < 10; i++) {
                    const lx = ((r.seed + i * 0.1 + time * 0.01) % 1) * w;
                    ctx.beginPath(); ctx.moveTo(lx, ry); ctx.lineTo(lx + 20 * dpr, ry); ctx.stroke();
                }
            });

            // SINGULARITY (SpaceStation V.Trillion logic)
            const sx = w * 0.5, sy = h * 0.5;
            const coreRad = 60 * dpr;
            const sG = ctx.createRadialGradient(sx, sy, 0, sx, sy, coreRad * 4);
            sG.addColorStop(0, '#000'); sG.addColorStop(0.2, safeAlpha(theme.accent, 0.4)); sG.addColorStop(1, 'transparent');
            ctx.fillStyle = sG; ctx.beginPath(); ctx.arc(sx, sy, coreRad * 4, 0, Math.PI * 2); ctx.fill();

            // PARALLAX CITY (Vertigo Depth)
            world.buildings.forEach(b => {
                const bx = b.x * w, bw = b.w * w, bh = b.h * h;
                ctx.fillStyle = BRAND.VOID; ctx.globalAlpha = 0.8;
                ctx.fillRect(bx, h - bh, bw, bh);
                // Windows
                ctx.fillStyle = theme.accent; ctx.globalAlpha = 0.4;
                const rGen = LCG(Math.floor(b.seed * 500));
                for (let wy = h - bh + 5 * dpr; wy < h - 5 * dpr; wy += 6 * dpr) {
                    if (rGen() > 0.7) ctx.fillRect(bx + bw * 0.5, wy, 2 * dpr, 1 * dpr);
                }
            });
            ctx.globalAlpha = 1;

            // FLYING TRAFFIC (Light Trails)
            if (active && Math.random() > 0.98) state.ships.push({ x: 1.2, y: 0.1 + Math.random() * 0.5, s: 0.001 + Math.random() * 0.002, c: theme.accent });
            state.ships.forEach((ship, idx) => {
                ship.x -= ship.s; if (ship.x < -0.3) state.ships.splice(idx, 1);
                const sX = ship.x * w, sY = ship.y * h;
                const g = ctx.createLinearGradient(sX, sY, sX + 60 * dpr, sY);
                g.addColorStop(0, ship.c); g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.globalAlpha = 0.5; ctx.fillRect(sX, sY, 60 * dpr, 1 * dpr);
                ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.9; ctx.fillRect(sX, sY, 1.5 * dpr, 1 * dpr);
            });
            ctx.globalAlpha = 1;

            // SPORES (Botanical Spores)
            state.spores.forEach(s => {
                s.x = (s.x + s.vx + 1) % 1; s.y = (s.y + s.vy + 1) % 1;
                ctx.fillStyle = theme.accent; ctx.globalAlpha = 0.1 + Math.sin(time + s.x * 5) * 0.15;
                ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.s * dpr, 0, Math.PI * 2); ctx.fill();
            });
            ctx.globalAlpha = 1;
        };

        const drawHud = (win, w, h, dpr, time) => {
            // HEX GRID (SciFiUI)
            ctx.strokeStyle = safeAlpha(theme.accent, 0.15); ctx.lineWidth = 0.5 * dpr;
            world.hexes.forEach(hex => {
                const hX = win.x + hex.x * win.w;
                const hY = h * 0.1 + hex.y * h * 0.75;
                const pulse = 0.2 + Math.sin(time * 2 + hex.x * 10) * 0.3;
                drawHex(hX, hY, hex.size * dpr, pulse);
            });

            // TARGETING ARRAY
            const tX = win.x + win.w * 0.5, tY = h * 0.5;
            ctx.strokeStyle = safeAlpha(theme.accent, 0.4); ctx.lineWidth = 1 * dpr;
            ctx.setLineDash([10 * dpr, 20 * dpr]);
            ctx.beginPath(); ctx.arc(tX, tY, 80 * dpr, time, time + Math.PI); ctx.stroke();
            ctx.setLineDash([]);
        };

        const drawBridge = (w, h, dpr) => {
            const midX = w / 2, pillarW = 180 * dpr, pX = midX - pillarW / 2;
            ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, w, h);
            const cG = ctx.createLinearGradient(pX, 0, pX + pillarW, 0);
            cG.addColorStop(0, '#000'); cG.addColorStop(0.5, '#08080c'); cG.addColorStop(1, '#000');
            ctx.fillStyle = cG; ctx.fillRect(pX, 0, pillarW, h);

            // PULSE CORE (Pulse logic)
            ctx.fillStyle = safeAlpha(theme.accent, 0.2);
            for (let i = 0; i < 12; i++) {
                const hVal = (0.2 + Math.sin(stateRef.current.time * 8 + i) * 0.8) * 50 * dpr;
                ctx.fillRect(pX + 30 * dpr + i * 10 * dpr, h - hVal, 4 * dpr, hVal);
            }
        };

        const render = () => {
            if (!active) return;
            state.time += 0.001;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;
            const winH = h * 0.78, topY = h * 0.08, botY = topY + winH;

            drawBridge(w, h, dpr);
            const winW = (w - 240 * dpr) / 2;
            const windows = [{ x: 30 * dpr, w: winW }, { x: w - 30 * dpr - winW, w: winW }];

            windows.forEach(win => {
                ctx.save(); ctx.beginPath(); ctx.rect(win.x, topY, win.w, winH); ctx.clip();
                drawExterior(w, h, dpr, state.time);
                drawHud(win, w, h, dpr, state.time);

                // DRIP-TECH (Neon Rain)
                ctx.fillStyle = '#fff';
                state.rain.forEach(r => {
                    r.y = (r.y + state.time * r.s) % 1;
                    const rx = win.x + r.x * win.w, ry = topY + r.y * winH;
                    ctx.globalAlpha = r.op * 0.15; ctx.beginPath(); ctx.arc(rx, ry, dpr, 0, Math.PI * 2); ctx.fill();
                    ctx.globalAlpha = r.op * 0.05; ctx.fillRect(rx, ry - 8 * dpr, 1, 8 * dpr);
                });
                ctx.globalAlpha = 1;

                const glare = ctx.createLinearGradient(win.x, topY, win.x + win.w, botY);
                glare.addColorStop(0, 'rgba(255,255,255,0.06)'); glare.addColorStop(0.5, 'transparent'); glare.addColorStop(1, 'rgba(255,255,255,0.03)');
                ctx.fillStyle = glare; ctx.fillRect(win.x, topY, win.w, winH);

                ctx.strokeStyle = '#000'; ctx.lineWidth = 14 * dpr; ctx.strokeRect(win.x, topY, win.w, winH);
                ctx.strokeStyle = safeAlpha(theme.accent, 0.1); ctx.lineWidth = 1 * dpr; ctx.strokeRect(win.x + 2 * dpr, topY + 2 * dpr, win.w - 4 * dpr, winH - 4 * dpr);
                ctx.restore();
            });

            if (active) animationRef.current = requestAnimationFrame(render);
        };
        const res = () => { if (!canvas) return; const dPR = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dPR; canvas.height = canvas.offsetHeight * dPR; };
        res(); window.addEventListener('resize', res); render();
        return () => { active = false; cancelAnimationFrame(animationRef.current); window.removeEventListener('resize', res); };
    }, [theme, world]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            {/* CHROMATIC VIGNETTE (V.Trillion Style) */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,0.4) 110%)`, boxShadow: `inset 0 0 100px rgba(0,0,0,0.8)` }} />
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default OmniPortalBanner;
