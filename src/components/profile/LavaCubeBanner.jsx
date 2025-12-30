import React, { useRef, useEffect, useMemo } from 'react';

// Brand Colors (from colorPacks.ts)
const BRAND = {
    MINT: '#7FFFD4',
    ION_BLUE: '#1B82FF',
    SOLAR_PINK: '#FF5C8A',
    DEEP_PURPLE: '#5A3FFF',
    AURORA: '#7FDBFF',
    WHITE: '#FFFFFF',
    ORANGE: '#FF914D'
};

const PALETTES = {
    fusion_prism: [BRAND.SOLAR_PINK, BRAND.MINT, BRAND.ION_BLUE, BRAND.DEEP_PURPLE],
    fusion_mint: [BRAND.MINT, '#40C9A2', '#A7FFEB', BRAND.WHITE],
    fusion_pink: [BRAND.SOLAR_PINK, '#C73E6A', '#FF9EC2', BRAND.WHITE],
    fusion_blue: [BRAND.ION_BLUE, '#1462C2', '#7FDBFF', BRAND.WHITE],
    fusion_deep: [BRAND.DEEP_PURPLE, '#4326B3', '#8C75FF', BRAND.MINT]
};

const LavaCubeBanner = ({ color = BRAND.MINT, profileBorderColor, starSettings, animationsEnabled = true }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    // 1. STAR FIELD LOGIC
    const stars = useMemo(() => {
        if (!starSettings?.enabled) return null;
        const count = 40;
        const starColor = starSettings.color || BRAND.MINT;
        const isBrand = starColor === 'brand';
        const brandColors = [BRAND.MINT, BRAND.SOLAR_PINK, BRAND.ION_BLUE, BRAND.ORANGE];

        return [...Array(count)].map((_, i) => {
            const thisColor = isBrand ? brandColors[i % brandColors.length] : starColor;
            return (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: (Math.random() * 2 + 1) + 'px',
                        height: (Math.random() * 2 + 1) + 'px',
                        background: thisColor,
                        borderRadius: '50%',
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                        opacity: Math.random() * 0.7 + 0.3,
                        boxShadow: `0 0 ${Math.random() * 4 + 2}px ${thisColor}`,
                        animation: animationsEnabled ? `fusion-star-twinkle ${Math.random() * 3 + 2}s ease-in-out infinite` : 'none',
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            );
        });
    }, [starSettings?.enabled, starSettings?.color, animationsEnabled]);

    // 2. WORLD DATA
    const world = useMemo(() => {
        let activePalette = PALETTES.fusion_prism;
        if (PALETTES[color]) {
            activePalette = PALETTES[color];
        } else if (color === 'brand') {
            activePalette = PALETTES.fusion_prism;
        } else if (color?.startsWith('#')) {
            activePalette = [color, BRAND.DEEP_PURPLE, BRAND.ION_BLUE, BRAND.WHITE];
        }

        const createBlobs = (count, startId) => Array.from({ length: count }, (_, i) => ({
            id: startId + i,
            x: Math.random(),
            y: Math.random(),
            vx: (Math.random() - 0.5) * 0.0018,
            vy: (Math.random() - 0.5) * 0.0018,
            size: 20 + Math.random() * 40,
            color: activePalette[(i + startId) % activePalette.length],
            phase: Math.random() * Math.PI * 2
        }));

        const bgBlobs = createBlobs(10, 0);
        const fgBlobs = createBlobs(8, 10);

        const cubes = [
            { id: 'master', x: 0.5, y: 0.5, size: 145, rotSpeedX: 0.02, rotSpeedY: 0.025, colors: activePalette },
            { id: 'left', x: 0.22, y: 0.45, size: 90, rotSpeedX: -0.025, rotSpeedY: -0.018, colors: [...activePalette].reverse() },
            { id: 'right', x: 0.78, y: 0.55, size: 105, rotSpeedX: 0.03, rotSpeedY: 0.022, colors: [activePalette[2], activePalette[3], activePalette[0], activePalette[1]] }
        ];

        return { bgBlobs, fgBlobs, cubes, pColor: activePalette[0] };
    }, [color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true }); // Changed to true for stars
        let animationFrame;

        const project = (x, y, z, w, h, fov = 400) => {
            const scale = fov / (fov + z);
            return { x: (w / 2) + x * scale, y: (h / 2) + y * scale, scale: scale };
        };

        const render = () => {
            if (animationsEnabled) {
                stateRef.current.time += 0.015;
            }
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            ctx.clearRect(0, 0, w, h); // Clear frame

            // DATA GRID
            ctx.globalAlpha = 0.08; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1 * dpr;
            for (let i = 0; i < w; i += 100 * dpr) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
            for (let i = 0; i < h; i += 100 * dpr) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
            ctx.globalAlpha = 1.0;

            const points = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
            const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

            const updateBlobs = (blobs) => {
                blobs.forEach(b => {
                    b.x += b.vx; b.y += b.vy;
                    if (b.x < -0.2) b.x = 1.2; if (b.x > 1.2) b.x = -0.2;
                    if (b.y < -0.2) b.y = 1.2; if (b.y > 1.2) b.y = -0.2;
                });
            };

            if (animationsEnabled) {
                updateBlobs(world.bgBlobs); updateBlobs(world.fgBlobs);
            }

            // --- STAGE 1: BACKGROUND MELT ---
            ctx.save();
            ctx.filter = `blur(${20 * dpr}px) contrast(300%) brightness(130%)`;
            world.bgBlobs.forEach(b => {
                ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x * w, b.y * h, b.size * dpr, 0, Math.PI * 2); ctx.fill();
            });
            world.cubes.forEach((cube) => {
                const rx = t * cube.rotSpeedX, ry = t * cube.rotSpeedY;
                const cX = (cube.x - 0.5) * w, cY = (cube.y - 0.5) * h, s = cube.size * dpr;
                const projected = points.map(p => {
                    let [px, py, pz] = p;
                    let npy = py * Math.cos(rx) - pz * Math.sin(rx), npz = py * Math.sin(rx) + pz * Math.cos(rx);
                    let npx = px * Math.cos(ry) - npz * Math.sin(ry);
                    return project(npx * s, npy * s, (px * Math.sin(ry) + npz * Math.cos(ry)) + 300, w, h);
                });
                edges.forEach(([m, n], eIdx) => {
                    ctx.strokeStyle = cube.colors[eIdx % cube.colors.length];
                    ctx.lineWidth = 35 * dpr;
                    ctx.beginPath(); ctx.moveTo(projected[m].x + cX, projected[m].y + cY); ctx.lineTo(projected[n].x + cX, projected[n].y + cY); ctx.stroke();
                });
            });
            ctx.restore();

            // --- STAGE 2: CRYSTAL CORES ---
            world.cubes.forEach((cube) => {
                const rx = t * cube.rotSpeedX, ry = t * cube.rotSpeedY;
                const cX = (cube.x - 0.5) * w, cY = (cube.y - 0.5) * h, s = cube.size * dpr;
                const projected = points.map(p => {
                    let [px, py, pz] = p;
                    let npy = py * Math.cos(rx) - pz * Math.sin(rx), npz = py * Math.sin(rx) + pz * Math.cos(rx);
                    let npx = px * Math.cos(ry) - npz * Math.sin(ry);
                    return project(npx * s, npy * s, (px * Math.sin(ry) + npz * Math.cos(ry)) + 300, w, h);
                });
                edges.forEach(([m, n], eIdx) => {
                    const edgeColor = cube.colors[eIdx % cube.colors.length];
                    ctx.strokeStyle = edgeColor; ctx.lineWidth = 8 * dpr; ctx.globalAlpha = 0.5;
                    ctx.beginPath(); ctx.moveTo(projected[m].x + cX, projected[m].y + cY); ctx.lineTo(projected[n].x + cX, projected[n].y + cY); ctx.stroke();
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * dpr; ctx.globalAlpha = 1.0;
                    ctx.shadowBlur = 10 * dpr; ctx.shadowColor = edgeColor;
                    ctx.beginPath(); ctx.moveTo(projected[m].x + cX, projected[m].y + cY); ctx.lineTo(projected[n].x + cX, projected[n].y + cY); ctx.stroke();
                    ctx.shadowBlur = 0;
                });
            });

            // --- STAGE 3: FOREGROUND MELT ---
            ctx.save();
            ctx.filter = `blur(${18 * dpr}px) contrast(300%) brightness(130%)`;
            world.fgBlobs.forEach(b => {
                ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x * w, b.y * h, b.size * dpr, 0, Math.PI * 2); ctx.fill();
            });
            ctx.restore();

            // VIGNETTE
            const tintColor = profileBorderColor || world.pColor || BRAND.MINT;
            const hexToRgb = (hex) => {
                if (!hex || !hex.startsWith('#')) return '127,255,212';
                const ri = parseInt(hex.slice(1, 3), 16), gi = parseInt(hex.slice(3, 5), 16), bi = parseInt(hex.slice(5, 7), 16);
                return `${ri},${gi},${bi}`;
            };
            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.8);
            grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, `rgba(${hexToRgb(tintColor)}, 0.2)`);
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

            if (animationsEnabled) {
                animationFrame = requestAnimationFrame(render);
            }
        };

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr;
            render(); // Force one render on resize
        };
        window.addEventListener('resize', handleResize); handleResize(); // Initial kick-off
        return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationFrame); };
    }, [world, color, profileBorderColor, animationsEnabled]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            {/* Stars Layer */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                {stars}
            </div>

            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', position: 'relative', zIndex: 1 }} />

            <style>{`
                @keyframes fusion-star-twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
};

export default LavaCubeBanner;
