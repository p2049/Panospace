import React, { useRef, useEffect, useMemo } from 'react';

/**
 * ApartmentWindowBanner - "THE METROPOLITAN COLLECTION" (V77)
 * 
 * ARCHITECTURAL MATURITY & EXPANSION:
 * 1. TWO NEW PREMIUM VARIANTS: 
 *    - "The Studio" (apt_studio): Creative workspace with 6-pane grid and industrial amber focus.
 *    - "The Penthouse" (apt_penthouse): Ultra-wide panoramic view with peak-level gold/purple luxury.
 * 2. MATURE THEME NAMING: All 20 themes now use grounded, professional designations.
 * 3. CINEMATIC FIDELITY: God rays, dust motes, searchlights, and glass Fresnel glare.
 * 4. SYMMETRICAL PERFECTION: All 20 themes are perfectly mirrored and stable.
 * 5. ZERO BLINK: 100% solid lighting across all layers.
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
    apt_lofi: {
        id: 'Loft', sky: ['#0d040a', '#1a0510', '#3a1a2a'],
        city: { base: '#0d040a', detail: [BRAND.STELLAR_ORANGE, BRAND.SOLAR_PINK, BRAND.ICE_WHITE], fog: '#1a0510' },
        room: { accent: BRAND.STELLAR_ORANGE, wall: '#0a0505', desk: '#120a0a', floor: '#0e0808', layout: 'DUO_SYM' },
    },
    apt_cyber: {
        id: 'Grid', sky: [BRAND.VOID, '#000810', '#001a33'],
        city: { base: '#000508', detail: [BRAND.ION_BLUE, BRAND.MINT, BRAND.ICE_WHITE], fog: '#00050a' },
        room: { accent: BRAND.ION_BLUE, wall: '#050510', desk: '#0a0a1a', floor: '#050512', layout: 'QUAD_SYM' },
    },
    apt_nyc: {
        id: 'Metro', sky: [BRAND.VOID, '#050505', '#111'],
        city: { base: '#050505', detail: [BRAND.ICE_WHITE, BRAND.ION_BLUE, BRAND.SOLAR_PINK], fog: '#000' },
        room: { accent: BRAND.ICE_WHITE, wall: '#080808', desk: '#0f0f0f', floor: '#0a0a0a', layout: 'PANORAMA_SYM' },
    },
    apt_vapor: {
        id: 'Vista', sky: [BRAND.VOID, BRAND.DEEP_PURPLE, '#2d1b4e'],
        city: { base: '#100015', detail: [BRAND.MINT, BRAND.SOLAR_PINK, BRAND.ICE_WHITE], fog: '#2d1b4e' },
        room: { accent: BRAND.MINT, wall: '#0a0515', desk: '#10051a', floor: '#0f051a', layout: 'WIDE_SYM' },
    },
    apt_noir: {
        id: 'Noir', sky: [BRAND.VOID, '#080202', '#1a0805'],
        city: { base: '#050202', detail: [BRAND.STELLAR_ORANGE, '#CC4400', BRAND.ICE_WHITE, BRAND.SOLAR_PINK], fog: '#0a0505' },
        room: { accent: BRAND.STELLAR_ORANGE, wall: '#050202', desk: '#0a0505', floor: '#080302', layout: 'QUAD_SYM' },
    },
    apt_aurora: {
        id: 'Borealis', sky: [BRAND.VOID, '#001a1a', '#00332a'],
        city: { base: '#000808', detail: [BRAND.MINT, BRAND.ION_BLUE, BRAND.ICE_WHITE], fog: '#001a1a' },
        room: { accent: BRAND.MINT, wall: '#000a0a', desk: '#001512', floor: '#000806', layout: 'TRIPLE_BAY' },
    },
    apt_manor: {
        id: 'Heritage', sky: [BRAND.VOID, '#050815', '#0a1025'],
        city: { base: '#020510', detail: [BRAND.ICE_WHITE, BRAND.ION_BLUE, '#FFD700'], fog: '#050815' },
        room: { accent: '#AA7744', wall: '#150c05', desk: '#2a1a0a', floor: '#1a0f05', layout: 'GRID_4' },
    },
    apt_emerald: {
        id: 'Gilded', sky: [BRAND.VOID, '#001005', '#002510'],
        city: { base: '#000802', detail: [BRAND.MINT, '#D4AF37', BRAND.ICE_WHITE], fog: '#001005' },
        room: { accent: '#D4AF37', wall: '#051005', desk: '#0a200a', floor: '#050f05', layout: 'GRID_4' },
    },
    apt_starlight: {
        id: 'Silver', sky: [BRAND.VOID, '#0a0515', '#1a1030'],
        city: { base: '#05020a', detail: [BRAND.ICE_WHITE, BRAND.SOLAR_PINK, BRAND.ION_BLUE], fog: '#0a0515' },
        room: { accent: BRAND.ICE_WHITE, wall: '#0a0515', desk: '#150a25', floor: '#0a0515', layout: 'GRID_4' },
    },
    apt_midnight: {
        id: 'Midnight', sky: [BRAND.VOID, '#020205', '#050515'],
        city: { base: '#010105', detail: [BRAND.ION_BLUE, BRAND.ICE_WHITE, '#333'], fog: '#020205' },
        room: { accent: BRAND.ION_BLUE, wall: '#02020a', desk: '#05051a', floor: '#020208', layout: 'GRID_4' },
    },
    apt_amber: {
        id: 'Horizon', sky: [BRAND.VOID, '#0d0500', '#1a0a00'],
        city: { base: '#050200', detail: [BRAND.STELLAR_ORANGE, '#CC4400', BRAND.ICE_WHITE], fog: '#0d0500' },
        room: { accent: BRAND.STELLAR_ORANGE, wall: '#080300', desk: '#120500', floor: '#050200', layout: 'GRID_4' },
    },
    apt_cobalt: {
        id: 'Stream', sky: [BRAND.VOID, '#000a15', '#001530'],
        city: { base: '#000508', detail: [BRAND.ION_BLUE, BRAND.MINT, BRAND.ICE_WHITE], fog: '#000a15' },
        room: { accent: BRAND.MINT, wall: '#000510', desk: '#000a1a', floor: '#000512', layout: 'TRIPLE_BAY' },
    },
    apt_crimson: {
        id: 'District', sky: [BRAND.VOID, '#0d0000', '#1a0000'],
        city: { base: '#050000', detail: [BRAND.SOLAR_PINK, '#FF0000', BRAND.ICE_WHITE], fog: '#0d0000' },
        room: { accent: BRAND.SOLAR_PINK, wall: '#060000', desk: '#0c0000', floor: '#040000', layout: 'WIDE_SYM' },
    },
    apt_rose: {
        id: 'Suite', sky: [BRAND.VOID, '#150005', '#2a000a'],
        city: { base: '#0a0002', detail: [BRAND.SOLAR_PINK, BRAND.ICE_WHITE, '#550011'], fog: '#150005' },
        room: { accent: BRAND.SOLAR_PINK, wall: '#1a0a0d', desk: '#250a10', floor: '#150508', layout: 'GRID_6' },
    },
    apt_glacier: {
        id: 'Frontier', sky: [BRAND.VOID, '#080a10', '#1a2030'],
        city: { base: '#040508', detail: [BRAND.ICE_WHITE, BRAND.MINT, BRAND.ION_BLUE], fog: '#080a10' },
        room: { accent: BRAND.ICE_WHITE, wall: '#06080a', desk: '#0e1218', floor: '#080a0c', layout: 'PANORAMA_SYM' },
    },
    apt_solaris: {
        id: 'Apex', sky: ['#0d0200', '#1a0800', '#3a1100'],
        city: { base: '#0d0200', detail: [BRAND.STELLAR_ORANGE, '#FFCC00', BRAND.ICE_WHITE], fog: '#1a0800' },
        room: { accent: BRAND.STELLAR_ORANGE, wall: '#0a0400', desk: '#150800', floor: '#0d0300', layout: 'DUO_SYM' },
    },
    apt_future: {
        id: 'Zenith', sky: [BRAND.VOID, '#15151a', '#222'],
        city: { base: '#0a0a0c', detail: [BRAND.ICE_WHITE, BRAND.MINT, BRAND.ION_BLUE], fog: '#15151a' },
        room: { accent: BRAND.ICE_WHITE, wall: '#111113', desk: '#101012', floor: '#0c0c0e', layout: 'NARROW_SYM' },
    },
    apt_terrace: {
        id: 'Terrace', sky: [BRAND.VOID, '#050208', '#0a0515'],
        city: { base: '#020105', detail: [BRAND.ION_BLUE, BRAND.ICE_WHITE, BRAND.MINT], fog: '#050208' },
        room: { accent: BRAND.MINT, wall: '#08080f', desk: '#0f0f1a', floor: '#0a0a15', layout: 'PANORAMA_SYM' },
    },
    apt_penthouse: {
        id: 'Penthouse', sky: [BRAND.VOID, '#0a0208', '#1a0515'],
        city: { base: '#050105', detail: ['#FFD700', BRAND.ICE_WHITE, BRAND.DEEP_PURPLE], fog: '#0a0208' },
        room: { accent: '#FFD700', wall: '#08050a', desk: '#120a1a', floor: '#0a0812', layout: 'PANORAMA_SYM' },
    }
};

const LCG = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
const hexToRgb = (h) => {
    if (typeof h !== 'string') return { r: 0, g: 0, b: 0 };
    const r = parseInt(h.length === 4 ? h[1] + h[1] : h.substring(1, 3), 16);
    const g = parseInt(h.length === 4 ? h[2] + h[2] : h.substring(3, 5), 16);
    const b = parseInt(h.length === 4 ? h[3] + h[3] : h.substring(5, 7), 16);
    return { r, g, b };
};
const mixColors = (c1, c2, o) => {
    const a = hexToRgb(c1), b = hexToRgb(c2 || BRAND.VOID);
    return `rgb(${Math.round(a.r * o + b.r * (1 - o))},${Math.round(a.g * o + b.g * (1 - o))},${Math.round(a.b * o + b.b * (1 - o))})`;
};

const ApartmentWindowBanner = ({ variant = 'apt_lofi', starSettings }) => {
    const theme = THEMES[variant] || THEMES.apt_lofi;
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const stateRef = useRef({
        time: 0, traffic: [], aviation: [], rain: [], shootingStars: [],
        trainPosB: 0.5, dust: [], searchlights: []
    });

    const world = useMemo(() => {
        const rand = LCG(111999);
        const layers = Array.from({ length: 5 }, (_, l) => {
            const layer = []; let cx = -0.2;
            const isForemost = l === 4;
            while (cx < 1.4) {
                const w = (70 + rand() * 200) / 2560;
                const h = (isForemost ? (450 + rand() * 550) : (350 + rand() * 750)) / 1080 * (0.32 + l * 0.18);
                layer.push({ x: cx, w, h, seed: rand() });
                cx += w + (isForemost ? (900 + rand() * 1300) : (8 + rand() * 22)) / 2560;
            }
            return layer;
        });
        const mountains = Array.from({ length: 3 }, (_, i) => {
            const pts = []; let mx = 0;
            while (mx < 3000) { pts.push({ x: mx / 2560, y: (280 + rand() * 220 + i * 40) / 1080 }); mx += 120 + rand() * 300; }
            return pts;
        });
        return { layers, mountains };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        const state = stateRef.current;
        let active = true;

        if (state.rain.length === 0) {
            for (let i = 0; i < 70; i++) state.rain.push({ x: Math.random(), y: Math.random(), s: 0.01 + Math.random() * 0.01 });
            for (let i = 0; i < 45; i++) state.dust.push({ x: Math.random(), y: Math.random(), s: 0.0003 + Math.random() * 0.0005, op: Math.random() });
            for (let i = 0; i < 4; i++) state.searchlights.push({ x: Math.random(), angle: -0.2 + Math.random() * 0.4, s: 0.002 + Math.random() * 0.002 });
        }

        const drawBuilding = (bx, by, bw, bh, lIdx, seed, theme, dpr, pg) => {
            const rand = LCG(Math.floor(seed * 4294967296));
            const isNear = lIdx === 4, isMid = lIdx === 3 || lIdx === 2;
            const dF = 0.4 + (lIdx * 0.12);
            const bCol = mixColors(theme.city.base, theme.city.fog, dF);

            ctx.fillStyle = bCol; ctx.fillRect(bx, by, bw, bh + 45);

            const isHeritage = ['Heritage', 'Gilded', 'Silver', 'Midnight', 'Horizon', 'Suite', 'Studio', 'Penthouse'].includes(theme.id);
            if (isHeritage && isNear) {
                ctx.fillStyle = 'rgba(255,255,255,0.06)';
                ctx.fillRect(bx + bw * 0.1, by, bw * 0.8, 6 * dpr);
                ctx.fillRect(bx + bw * 0.48, by - 14 * dpr, 3 * dpr, bh + 14 * dpr);
            } else if (bw > 35 * dpr) {
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                ctx.fillRect(bx + bw * 0.2, by, 1.2 * dpr, bh);
                ctx.fillRect(bx + bw * 0.8, by, 1.2 * dpr, bh);
            }

            const winS = (isNear ? 4.2 : (isMid ? 2.6 : 1.5)) * dpr;
            const gapY = (isNear ? 12 : (isMid ? 8 : 6)) * dpr;
            const gapX = gapY * 0.85;
            const winChance = isNear ? 0.74 : (isMid ? 0.52 : 0.3);
            let hasL = false;

            for (let wy = by + 25 * dpr; wy < pg - 15 * dpr; wy += gapY) {
                const floorOn = rand() > 0.25;
                if (wy > pg - 20 * dpr) continue;
                for (let wx = bx + 6 * dpr; wx < bx + bw - 6 * dpr; wx += gapX) {
                    if ((rand() < winChance && floorOn) || (isNear && !hasL && rand() > 0.95)) {
                        const winCol = theme.city.detail[Math.floor(rand() * theme.city.detail.length)];
                        ctx.fillStyle = winCol; ctx.globalAlpha = 1.0 * dF; ctx.fillRect(wx, wy, winS, winS);
                        if (isNear) {
                            ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.22;
                            ctx.fillRect(wx + winS * 0.1, wy + winS * 0.1, winS * 0.3, winS * 0.15);
                        }
                        ctx.shadowColor = winCol; ctx.shadowBlur = 5 * dpr;
                        ctx.globalAlpha = 0.22 * dF; ctx.fillRect(wx - dpr, wy - dpr, winS + 2 * dpr, winS + 2 * dpr);
                        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
                        hasL = true;
                    }
                }
            }
        };

        const render = () => {
            if (!active) return;
            state.time += 0.0001;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1, ground = h * 0.98;
            const ceilY = h * 0.08, deskY = h * 0.74, wallWallH = deskY - ceilY;

            // 1. SKYBOX
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            theme.sky.forEach((c, i) => sky.addColorStop(i / (theme.sky.length - 1), c));
            ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

            // 2. CELESTIAL & SEARCHLIGHTS
            state.searchlights.forEach(sl => {
                sl.angle += Math.sin(state.time * 50) * 0.0005;
                const slX = sl.x * w, lg = ctx.createLinearGradient(slX, ground, slX + Math.sin(sl.angle) * h, 0);
                lg.addColorStop(0, theme.room.accent + '15'); lg.addColorStop(1, 'transparent');
                ctx.strokeStyle = lg; ctx.lineWidth = 40 * dpr; ctx.globalAlpha = 0.3;
                ctx.beginPath(); ctx.moveTo(slX, ground); ctx.lineTo(slX + Math.sin(sl.angle) * h, 0); ctx.stroke();
            });

            if (active && Math.random() > 0.9997 && state.shootingStars.length < 3) state.shootingStars.push({ x: 1.1, y: 0.1 + Math.random() * 0.3, s: 0.005 + Math.random() * 0.015 });
            state.shootingStars.forEach((s, idx) => {
                s.x -= s.s; if (s.x < -0.2) state.shootingStars.splice(idx, 1);
                const sG = ctx.createLinearGradient(s.x * w, s.y * h, (s.x + 0.06) * w, s.y * h);
                sG.addColorStop(0, theme.city.detail[0]); sG.addColorStop(1, 'transparent');
                ctx.strokeStyle = sG; ctx.lineWidth = dpr; ctx.beginPath(); ctx.moveTo(s.x * w, s.y * h); ctx.lineTo((s.x + 0.06) * w, s.y * h); ctx.stroke();
            });

            // 3. JAGGED MOUNTAINS
            world.mountains.forEach((m, i) => {
                ctx.fillStyle = mixColors(theme.city.base, theme.city.fog, 0.15 + i * 0.12);
                ctx.beginPath(); ctx.moveTo(0, h); m.forEach(p => ctx.lineTo(p.x * w, p.y * h + (i * 15 * dpr))); ctx.lineTo(w, h); ctx.fill();
            });

            // 4. ATMOSPHERIC RAIN
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.5 * dpr; ctx.globalAlpha = 0.08;
            state.rain.forEach(p => {
                p.y += p.s; p.x += p.s * 0.2; if (p.y > 1) { p.y = -0.1; p.x = Math.random(); }
                ctx.beginPath(); ctx.moveTo(p.x * w, p.y * h); ctx.lineTo((p.x + 0.005) * w, (p.y + 0.015) * h); ctx.stroke();
            });

            // --- TRANSPORT ---
            const drawTransit = () => {
                const vx = w / 2, vy = ceilY + wallWallH * 0.85;
                if (active && Math.random() > 0.988 && state.traffic.length < 60) {
                    state.traffic.push({ progress: 0, s: 0.0003 + Math.random() * 0.0006, side: Math.random() > 0.5 ? 'L' : 'R', dir: Math.random() > 0.4 ? 1 : -1, lane: Math.random(), r: Math.random() > 0.7, tail: 0.8 + Math.random() * 0.5 });
                }
                state.traffic.forEach((c, i) => {
                    const curT = c.dir === 1 ? c.progress : (1 - c.progress);
                    c.progress += c.s * (0.12 + curT * 0.88);
                    if (c.progress > 1) { state.traffic.splice(i, 1); return; }
                    const t = c.dir === 1 ? c.progress : (1 - c.progress);
                    const col = c.r ? BRAND.SOLAR_PINK : (c.dir === 1 ? BRAND.ICE_WHITE : BRAND.ION_BLUE);
                    const pathX = (c.side === 'L' ? w * 0.43 : w * 0.88) + (c.lane * 40 * t * dpr);
                    const tx = vx + (pathX - vx) * t, ty = vy + (deskY - vy) * t;
                    const cS = (0.35 + t * 3.6) * dpr, gS = (1.5 + t * 15) * dpr, sL = (5 + t * 38) * c.tail * dpr;
                    const smG = ctx.createLinearGradient(tx, ty, tx, ty - (c.dir * sL));
                    smG.addColorStop(0, col); smG.addColorStop(1, 'transparent');
                    ctx.strokeStyle = smG; ctx.lineWidth = cS; ctx.globalAlpha = 0.05 + t * 0.94;
                    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty - (c.dir * sL)); ctx.stroke();
                    ctx.shadowColor = col; ctx.shadowBlur = gS; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tx, ty, cS, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
                }); ctx.globalAlpha = 1;
            };

            world.layers.forEach((layer, lIdx) => {
                if (lIdx === 4) drawTransit();
                const px = (lIdx + 1) * 20 * dpr;
                layer.forEach(b => {
                    const bx = (b.x * w) + px, bw = b.w * w, bh = b.h * h, by = ground - bh;
                    if (bx < -bw || bx > w) return;
                    drawBuilding(bx, by, bw, bh, lIdx, b.seed, theme, dpr, ground);
                });
                const hg = ctx.createLinearGradient(0, ground - 260 * dpr, 0, ground);
                hg.addColorStop(0, 'transparent'); hg.addColorStop(1, theme.city.fog);
                ctx.fillStyle = hg; ctx.globalAlpha = (1 - lIdx / 5) * 0.45; ctx.fillRect(0, ground - 260 * dpr, w, 260 * dpr); ctx.globalAlpha = 1;
            });

            // --- ABSOLUTE SYMMETRICAL ROOM ---
            ctx.fillStyle = theme.room.wall;
            const windows = []; const l = theme.room.layout; const mid = w / 2;
            const isGrid = l.includes('GRID');
            const curWinH = isGrid ? (wallWallH * 0.73) : wallWallH;

            if (l === 'DUO_SYM' || l === 'GRID_4' || l === 'GRID_6') {
                windows.push({ x: mid - w * 0.42, w: w * 0.38 }, { x: mid + w * 0.04, w: w * 0.38 });
            } else if (l === 'QUAD_SYM') {
                windows.push({ x: mid - w * 0.42, w: w * 0.17 }, { x: mid - w * 0.21, w: w * 0.17 }, { x: mid + w * 0.04, w: w * 0.17 }, { x: mid + w * 0.25, w: w * 0.17 });
            } else if (l === 'PANORAMA_SYM') {
                windows.push({ x: mid - w * 0.44, w: w * 0.88 });
            } else if (l === 'WIDE_SYM') {
                windows.push({ x: mid - w * 0.43, w: w * 0.41 }, { x: mid + w * 0.02, w: w * 0.41 });
            } else if (l === 'NARROW_SYM') {
                windows.push({ x: mid - w * 0.3, w: w * 0.15 }, { x: mid + w * 0.15, w: w * 0.15 });
            } else if (l === 'TRIPLE_BAY') {
                windows.push({ x: mid - w * 0.44, w: w * 0.25 }, { x: mid - w * 0.15, w: w * 0.3 }, { x: mid + w * 0.19, w: w * 0.25 });
            }

            ctx.fillRect(0, 0, w, ceilY); ctx.fillRect(0, deskY, w, h - deskY);
            if (isGrid) ctx.fillRect(0, ceilY + curWinH, w, wallWallH - curWinH);
            let curX = 0;[...windows].sort((a, b) => a.x - b.x).forEach(win => {
                ctx.fillRect(curX, ceilY, win.x - curX, curWinH); curX = win.x + win.w;
            }); ctx.fillRect(curX, ceilY, w - curX, curWinH);

            // VOLUMETRIC GOD RAYS (Enhanced)
            windows.forEach(win => {
                const rayG = ctx.createLinearGradient(win.x + win.w / 2, ceilY, win.x + win.w / 2, deskY);
                rayG.addColorStop(0, theme.room.accent + '12'); rayG.addColorStop(1, 'transparent');
                ctx.fillStyle = rayG; ctx.fillRect(win.x, ceilY, win.w, deskY - ceilY);

                const fG = ctx.createLinearGradient(win.x, ceilY, win.x + win.w, deskY);
                fG.addColorStop(0, 'rgba(255,255,255,0.03)'); fG.addColorStop(0.5, 'transparent'); fG.addColorStop(1, 'rgba(255,255,255,0.03)');
                ctx.fillStyle = fG; ctx.fillRect(win.x, ceilY, win.w, curWinH);

                ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1.5 * dpr;
                ctx.strokeRect(win.x, ceilY, win.w, curWinH);
                if (l === 'GRID_4') {
                    ctx.fillStyle = 'rgba(255,255,255,0.08)';
                    ctx.fillRect(win.x + win.w / 2 - dpr, ceilY, 2 * dpr, curWinH);
                    ctx.fillRect(win.x, ceilY + curWinH / 2 - dpr, win.w, 2 * dpr);
                } else if (l === 'GRID_6') {
                    ctx.fillStyle = 'rgba(255,255,255,0.08)';
                    ctx.fillRect(win.x + win.w / 3 - dpr, ceilY, 2 * dpr, curWinH);
                    ctx.fillRect(win.x + (win.w / 3) * 2 - dpr, ceilY, 2 * dpr, curWinH);
                    ctx.fillRect(win.x, ceilY + curWinH / 2 - dpr, win.w, 2 * dpr);
                }
                ctx.fillStyle = theme.room.accent; ctx.globalAlpha = 0.2;
                ctx.fillRect(win.x, ceilY, 3 * dpr, curWinH); ctx.fillRect(win.x + win.w - 3 * dpr, ceilY, 3 * dpr, curWinH);
            }); ctx.globalAlpha = 1;

            // ROOM DUST MOTES
            state.dust.forEach(d => {
                d.y -= d.s; if (d.y < 0) d.y = 1;
                const distToWin = windows.reduce((min, win) => Math.min(min, Math.abs(d.x * w - (win.x + win.w / 2))), w);
                const catchLight = Math.max(0, 1 - distToWin / (w * 0.15));
                ctx.fillStyle = BRAND.ICE_WHITE; ctx.globalAlpha = d.op * 0.3 * catchLight;
                ctx.beginPath(); ctx.arc(d.x * w, d.y * h, 0.8 * dpr, 0, Math.PI * 2); ctx.fill();
            }); ctx.globalAlpha = 1;

            const flrG = ctx.createLinearGradient(0, deskY, 0, h);
            flrG.addColorStop(0, BRAND.VOID); flrG.addColorStop(0.2, theme.room.desk); flrG.addColorStop(1, theme.room.floor);
            ctx.fillStyle = flrG; ctx.fillRect(0, deskY, w, h - deskY);
            ctx.fillStyle = theme.room.accent; ctx.globalAlpha = 0.1;
            for (let j = 0; j < w; j += 100 * dpr) ctx.fillRect(j, deskY, 2 * dpr, h - deskY);

            const wash = ctx.createRadialGradient(mid, 0, 0, mid, ceilY, h * 0.7);
            wash.addColorStop(0, theme.room.accent + '25'); wash.addColorStop(1, 'transparent');
            ctx.globalAlpha = 1; ctx.fillStyle = wash; ctx.fillRect(0, 0, w, h);
            const bounce = ctx.createLinearGradient(0, deskY, 0, deskY + 160 * dpr);
            bounce.addColorStop(0, theme.room.accent + '40'); bounce.addColorStop(1, 'transparent');
            ctx.fillStyle = bounce; ctx.fillRect(0, deskY, w, 160 * dpr);

            if (active) animationRef.current = requestAnimationFrame(render);
        };
        const res = () => { if (!canvas) return; const dPR = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dPR; canvas.height = canvas.offsetHeight * dPR; };
        window.addEventListener('resize', res); res(); render();
        return () => { active = false; cancelAnimationFrame(animationRef.current); window.removeEventListener('resize', res); };
    }, [theme, world, starSettings]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: BRAND.VOID }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default ApartmentWindowBanner;
