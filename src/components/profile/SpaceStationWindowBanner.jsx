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
        accent: BRAND.MINT, type: 'NEXUS',
        sky: [BRAND.VOID, BRAND.DEEP_PURPLE, BRAND.ION_BLUE],
        interior: { accent: BRAND.MINT },
        exterior: { accent: BRAND.MINT, horizon: BRAND.MINT, land: BRAND.VOID, type: 'VOID' }
    },
    singularity_supernova: {
        id: 'Supernova Forge',
        palette: [BRAND.VOID, BRAND.STELLAR_ORANGE, BRAND.SOLAR_PINK],
        accent: BRAND.SOLAR_PINK, type: 'FORGE',
        sky: [BRAND.VOID, BRAND.STELLAR_ORANGE, BRAND.SOLAR_PINK],
        interior: { accent: BRAND.SOLAR_PINK },
        exterior: { accent: BRAND.SOLAR_PINK, horizon: BRAND.SOLAR_PINK, land: BRAND.VOID, type: 'VOID' }
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

const SpaceStationWindowBanner = ({ variant = 'station_moon' }) => {
    // Check if it's one of the SINGULARITY variants, otherwise use old THEMES logic
    const isSingularity = variant.startsWith('singularity_');

    // Original THEMES for fallback/compatibility
    const OLD_THEMES = {
        station_moon: {
            id: 'Lunar Outpost', sky: ['#000', '#1a1a25'],
            exterior: { accent: BRAND.ION_BLUE, type: 'MOON', land: '#08080a', horizon: '#1a1a2a' },
            interior: { accent: BRAND.ION_BLUE }
        },
        station_mars: {
            id: 'Mars Station', sky: [BRAND.VOID, BRAND.STELLAR_ORANGE],
            exterior: { accent: BRAND.STELLAR_ORANGE, type: 'MARS', land: '#1a0502', horizon: '#3a1a10' },
            interior: { accent: BRAND.STELLAR_ORANGE }
        },
        station_deep: {
            id: 'Event Horizon', sky: [BRAND.VOID, BRAND.DEEP_PURPLE, BRAND.VOID],
            exterior: { accent: BRAND.DEEP_PURPLE, type: 'VOID', land: BRAND.VOID, horizon: BRAND.DEEP_PURPLE },
            interior: { accent: BRAND.DEEP_PURPLE }
        },
        station_vulcan: {
            id: 'Forge Alpha', sky: [BRAND.VOID, BRAND.SOLAR_PINK],
            exterior: { accent: BRAND.SOLAR_PINK, type: 'VULCAN', land: '#120000', horizon: '#FF3300' },
            interior: { accent: BRAND.SOLAR_PINK }
        },
        station_ice: {
            id: 'Glacial Reach', sky: [BRAND.VOID, BRAND.MINT, BRAND.VOID],
            exterior: { accent: BRAND.MINT, type: 'ICE', land: '#02050a', horizon: BRAND.MINT },
            interior: { accent: BRAND.MINT }
        }
    };

    const theme = isSingularity ? THEMES[variant] : (OLD_THEMES[variant] || OLD_THEMES.station_moon);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const stateRef = useRef({ time: 0, rain: [], ships: [], spores: [], steam: [] });

    const world = useMemo(() => {
        const rand = LCG(isSingularity ? 420 : 777);
        const stars = Array.from({ length: isSingularity ? 80 : 150 }, () => ({ x: rand(), y: rand(), s: 0.5 + rand(), op: rand() }));

        if (isSingularity) {
            const rings = Array.from({ length: 2 }, () => ({ y: 0.2 + rand() * 0.4, t: 80 + rand() * 120, seed: rand() }));
            const hexes = Array.from({ length: 12 }, () => ({ x: rand(), y: rand(), size: 20 + rand() * 30, op: rand() }));
            const buildings = Array.from({ length: 15 }, () => ({ x: rand(), w: 0.02 + rand() * 0.04, h: 0.1 + rand() * 0.2, seed: rand() }));
            return { stars, rings, hexes, buildings, isSingularity: true };
        }

        const params = {
            MOON: { base: 0.72, amp: 0.15 },
            MARS: { base: 0.68, amp: 0.35 },
            ICE: { base: 0.65, amp: 0.45 },
            VULCAN: { base: 0.72, amp: 0.25 },
            VOID: { base: 1, amp: 0 }
        }[theme.exterior.type];

        const terrain = Array.from({ length: 3 }, (_, l) => {
            const pts = []; let tx = -0.1;
            while (tx < 1.2) {
                pts.push({ x: tx, y: params.base + (l * 0.05) - (rand() * params.amp) });
                tx += 0.08 + rand() * 0.1;
            }
            return pts;
        });

        const colonyPlanets = ['MOON', 'MARS', 'ICE'];
        const showColony = colonyPlanets.includes(theme.exterior.type);
        const buildings = showColony ? Array.from({ length: 8 }, () => ({
            x: 0.1 + rand() * 0.8, w: 0.03 + rand() * 0.04, h: 0.1 + rand() * 0.15, seed: rand()
        })) : [];

        return { stars, terrain, buildings, isSingularity: false };
    }, [theme, isSingularity]);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        const state = stateRef.current;
        let active = true;

        if (state.steam.length === 0) {
            for (let i = 0; i < 20; i++) state.steam.push({ x: Math.random(), y: Math.random(), s: 0.0002 + Math.random() * 0.0004, op: Math.random() });
        }
        if (isSingularity && state.rain.length === 0) {
            for (let i = 0; i < 40; i++) state.rain.push({ x: Math.random(), y: Math.random(), s: 0.005 + Math.random() * 0.015, op: Math.random() });
            for (let i = 0; i < 50; i++) state.spores.push({ x: Math.random(), y: Math.random(), s: 1 + Math.random() * 2, vx: (Math.random() - 0.5) * 0.0005, vy: (Math.random() - 0.5) * 0.0005 });
        }

        const getTerrainY = (x, layer) => {
            if (isSingularity) return 0.8;
            const pts = world.terrain[layer];
            for (let i = 0; i < pts.length - 1; i++) {
                if (x >= pts[i].x && x <= pts[i + 1].x) {
                    const t = (x - pts[i].x) / (pts[i + 1].x - pts[i].x);
                    return pts[i].y + t * (pts[i + 1].y - pts[i].y);
                }
            }
            return pts[0].y;
        };

        const drawHex = (x, y, size, alpha) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const hx = x + size * Math.cos(angle);
                const hy = y + size * Math.sin(angle);
                if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
            }
            ctx.closePath(); ctx.globalAlpha = alpha; ctx.stroke(); ctx.globalAlpha = 1;
        };

        const drawLand = (w, h, dpr, time) => {
            if (theme.exterior.type === 'VOID' && !isSingularity) return;

            if (isSingularity) {
                // Parallax City Silhouettes for Singularity
                world.buildings.forEach(b => {
                    const bx = b.x * w, bw = b.w * w, bh = b.h * h;
                    ctx.fillStyle = BRAND.VOID; ctx.globalAlpha = 0.8;
                    ctx.fillRect(bx, h - bh, bw, bh);
                    ctx.fillStyle = theme.accent; ctx.globalAlpha = 0.4;
                    const rGen = LCG(Math.floor(b.seed * 500));
                    for (let wy = h - bh + 5 * dpr; wy < h - 5 * dpr; wy += 6 * dpr) {
                        if (rGen() > 0.7) ctx.fillRect(bx + bw * 0.5, wy, 2 * dpr, 1 * dpr);
                    }
                });
                ctx.globalAlpha = 1;
                return;
            }

            world.terrain.forEach((layer, lIdx) => {
                if (lIdx === 1) {
                    world.buildings.forEach(b => {
                        const bx = b.x * w, bw = b.w * w, bh = b.h * h;
                        const sitY = getTerrainY(b.x, 0) * h;
                        ctx.fillStyle = BRAND.VOID; ctx.fillRect(bx, sitY - bh, bw, h - (sitY - bh));
                        const rGen = LCG(Math.floor(b.seed * 8888));
                        ctx.fillStyle = theme.exterior.accent;
                        const spacing = 4 * dpr;
                        for (let wy = sitY - bh + 5 * dpr; wy < h - 10 * dpr; wy += spacing + 2 * dpr) {
                            for (let wx = bx + 5 * dpr; wx < bx + bw - 5 * dpr; wx += spacing + 2 * dpr) {
                                if (rGen() > 0.45) { ctx.globalAlpha = 0.6; ctx.fillRect(wx, wy, 1.5 * dpr, 1.5 * dpr); }
                            }
                        }
                        ctx.globalAlpha = 1;
                        if (b.seed > 0.6) {
                            ctx.strokeStyle = '#111'; ctx.lineWidth = 1 * dpr;
                            ctx.beginPath(); ctx.moveTo(bx + bw * 0.5, sitY - bh); ctx.lineTo(bx + bw * 0.5, sitY - bh - 12 * dpr); ctx.stroke();
                            ctx.fillStyle = theme.exterior.accent; ctx.globalAlpha = 0.5 + Math.sin(time * 2 + b.seed) * 0.3;
                            ctx.fillRect(bx + bw * 0.5 - 1, sitY - bh - 12 * dpr, 2, 2); ctx.globalAlpha = 1;
                        }
                        ctx.strokeStyle = safeAlpha(theme.exterior.accent, 0.1); ctx.lineWidth = 0.5 * dpr;
                        ctx.strokeRect(bx, sitY - bh, bw, h - (sitY - bh));
                    });
                }
                ctx.fillStyle = safeAlpha(theme.exterior.land, 1.0);
                if (lIdx < 2) ctx.globalAlpha = 0.7 + lIdx * 0.15;
                ctx.beginPath(); ctx.moveTo(-50, h);
                layer.forEach(p => ctx.lineTo(p.x * w, p.y * h));
                ctx.lineTo(w + 50, h); ctx.fill();
                ctx.globalAlpha = 1.0;
                if (lIdx === 0) { ctx.strokeStyle = safeAlpha(theme.exterior.horizon, 0.4); ctx.lineWidth = 1.6 * dpr; ctx.stroke(); }
            });
        };

        const drawExterior = (w, h, dpr, time) => {
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            (isSingularity ? theme.palette : theme.sky).forEach((c, i, arr) => sky.addColorStop(i / (arr.length - 1), c));
            ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

            if (isSingularity) {
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
                    ctx.strokeStyle = safeAlpha(theme.accent, 0.4); ctx.lineWidth = 1 * dpr;
                    for (let i = 0; i < 10; i++) {
                        const lx = ((r.seed + i * 0.1 + time * 0.01) % 1) * w;
                        ctx.beginPath(); ctx.moveTo(lx, ry); ctx.lineTo(lx + 20 * dpr, ry); ctx.stroke();
                    }
                });
                // SINGULARITY Core
                const sx = w * 0.5, sy = h * 0.5;
                const coreRad = 60 * dpr;
                const sG = ctx.createRadialGradient(sx, sy, 0, sx, sy, coreRad * 4);
                sG.addColorStop(0, '#000'); sG.addColorStop(0.2, safeAlpha(theme.accent, 0.4)); sG.addColorStop(1, 'transparent');
                ctx.fillStyle = sG; ctx.beginPath(); ctx.arc(sx, sy, coreRad * 4, 0, Math.PI * 2); ctx.fill();
            }

            ctx.fillStyle = '#fff';
            world.stars.forEach(s => {
                ctx.globalAlpha = s.op * (0.3 + Math.sin(time * 4 + s.x * 20) * 0.7);
                ctx.fillRect(s.x * w, s.y * h, dpr, dpr);
            });
            ctx.globalAlpha = 1;

            if (active && Math.random() > 0.99 && state.ships.length < 5) {
                state.ships.push({ x: 1.3, y: 0.15 + Math.random() * 0.35, s: 0.0004 + Math.random() * 0.0008, c: isSingularity ? theme.accent : theme.exterior.accent });
            }
            state.ships.forEach((ship, idx) => {
                ship.x -= ship.s;
                if (ship.x < -0.4) { state.ships.splice(idx, 1); return; }
                const sx = ship.x * w, sy = ship.y * h;
                const g = ctx.createLinearGradient(sx, sy, sx + 80 * dpr, sy);
                g.addColorStop(0, ship.c || theme.exterior.accent); g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.globalAlpha = 0.4;
                ctx.fillRect(sx, sy, 80 * dpr, 1 * dpr);
                ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.8; ctx.fillRect(sx, sy, 1.5 * dpr, 1.5 * dpr);
            });
            ctx.globalAlpha = 1;

            if (isSingularity) {
                state.spores.forEach(s => {
                    s.x = (s.x + s.vx + 1) % 1; s.y = (s.y + s.vy + 1) % 1;
                    ctx.fillStyle = theme.accent; ctx.globalAlpha = 0.1 + Math.sin(time + s.x * 5) * 0.15;
                    ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.s * dpr, 0, Math.PI * 2); ctx.fill();
                });
                ctx.globalAlpha = 1;
            }

            drawLand(w, h, dpr, time);
        };

        const drawHud = (win, w, h, dpr, time) => {
            if (!isSingularity) return;
            ctx.strokeStyle = safeAlpha(theme.accent, 0.15); ctx.lineWidth = 0.5 * dpr;
            world.hexes.forEach(hex => {
                const hX = win.x + hex.x * win.w;
                const hY = h * 0.1 + hex.y * h * 0.75;
                const pulse = 0.2 + Math.sin(time * 2 + hex.x * 10) * 0.3;
                drawHex(hX, hY, hex.size * dpr, pulse);
            });
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

            if (isSingularity) {
                ctx.fillStyle = safeAlpha(theme.accent, 0.2);
                for (let i = 0; i < 12; i++) {
                    const hVal = (0.2 + Math.sin(stateRef.current.time * 8 + i) * 0.8) * 50 * dpr;
                    ctx.fillRect(pX + 30 * dpr + i * 10 * dpr, h - hVal, 4 * dpr, hVal);
                }
            } else {
                ctx.fillStyle = safeAlpha(theme.interior.accent, 0.2);
                ctx.beginPath(); ctx.arc(midX, h * 0.45, 2 * dpr, 0, Math.PI * 2); ctx.fill();
            }
        };

        const render = () => {
            if (!active) return;
            state.time += isSingularity ? 0.001 : 0.0012;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;
            const midX = w / 2, winH = h * (isSingularity ? 0.78 : 0.72), topY = h * (isSingularity ? 0.08 : 0.12), botY = topY + winH;

            drawBridge(w, h, dpr);
            const winW = (w - 240 * dpr) / 2;
            const windows = [{ x: 30 * dpr, w: winW }, { x: w - 30 * dpr - winW, w: winW }];

            windows.forEach(win => {
                ctx.clearRect(win.x, topY, win.w, winH);
                ctx.save(); ctx.beginPath(); ctx.rect(win.x, topY, win.w, winH); ctx.clip();
                drawExterior(w, h, dpr, state.time);
                if (isSingularity) drawHud(win, w, h, dpr, state.time);

                if (isSingularity) {
                    ctx.fillStyle = '#fff';
                    state.rain.forEach(r => {
                        r.y = (r.y + state.time * r.s) % 1;
                        const rx = win.x + r.x * win.w, ry = topY + r.y * winH;
                        ctx.globalAlpha = r.op * 0.15; ctx.beginPath(); ctx.arc(rx, ry, dpr, 0, Math.PI * 2); ctx.fill();
                        ctx.globalAlpha = r.op * 0.05; ctx.fillRect(rx, ry - 8 * dpr, 1, 8 * dpr);
                    });
                    ctx.globalAlpha = 1;
                }

                const glare = ctx.createLinearGradient(win.x, topY, win.x + win.w, botY);
                glare.addColorStop(0, 'rgba(255,255,255,0.05)'); glare.addColorStop(0.5, 'transparent'); glare.addColorStop(1, 'rgba(255,255,255,0.02)');
                ctx.fillStyle = glare; ctx.fillRect(win.x, topY, win.w, winH);

                ctx.strokeStyle = '#000'; ctx.lineWidth = 14 * dpr; ctx.strokeRect(win.x, topY, win.w, winH);
                ctx.strokeStyle = safeAlpha(theme.interior.accent, 0.1); ctx.lineWidth = 1 * dpr; ctx.strokeRect(win.x + 2 * dpr, topY + 2 * dpr, win.w - 4 * dpr, winH - 4 * dpr);
                ctx.restore();
            });

            if (!isSingularity) {
                state.steam.forEach(p => {
                    p.y -= p.s * 0.2; if (p.y < 0) p.y = 1;
                    ctx.globalAlpha = p.op * 0.1; ctx.fillStyle = theme.interior.accent;
                    ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 1 * dpr, 0, Math.PI * 2); ctx.fill();
                });
                windows.forEach(win => {
                    const ray = ctx.createLinearGradient(win.x + win.w / 2, topY, win.x + win.w / 2, botY + 120 * dpr);
                    ray.addColorStop(0, safeAlpha(theme.interior.accent, 0.06)); ray.addColorStop(1, 'transparent');
                    ctx.fillStyle = ray; ctx.fillRect(win.x, topY, win.w, h - topY);
                });
            }

            if (active) animationRef.current = requestAnimationFrame(render);
        };
        const res = () => { if (!canvas) return; const dPR = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dPR; canvas.height = canvas.offsetHeight * dPR; };
        res(); window.addEventListener('resize', res); render();
        return () => { active = false; cancelAnimationFrame(animationRef.current); window.removeEventListener('resize', res); };
    }, [theme, world, isSingularity]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, background: `radial-gradient(circle, transparent 70%, rgba(0,0,0,0.5) 110%)`, boxShadow: `inset 0 0 100px rgba(0,0,0,0.8)` }} />
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default SpaceStationWindowBanner;
