import React, { useRef, useEffect, useMemo } from 'react';

// Brand Colors
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
    paradox_prism: [BRAND.SOLAR_PINK, BRAND.MINT, BRAND.ION_BLUE, BRAND.DEEP_PURPLE],
    paradox_void: [BRAND.DEEP_PURPLE, '#2D1B4E', BRAND.ION_BLUE, '#000000'],
    paradox_stellar: [BRAND.ORANGE, BRAND.SOLAR_PINK, '#FF5C8A', BRAND.WHITE],
    paradox_cyber: [BRAND.ION_BLUE, BRAND.MINT, BRAND.AURORA, BRAND.WHITE]
};

const OmniParadoxBanner = ({ color = 'paradox_prism', profileBorderColor, starSettings }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const world = useMemo(() => {
        let activePalette = PALETTES[color] || PALETTES.paradox_prism;

        // Paradox Blobs - Focused more towards the center-top to frame the profile info
        const blobs = Array.from({ length: 18 }, (_, i) => ({
            id: i,
            x: Math.random(),
            y: Math.random() * 0.6, // Keep them higher up
            vx: (Math.random() - 0.5) * 0.0015,
            vy: (Math.random() - 0.5) * 0.001,
            size: 15 + Math.random() * 30,
            color: activePalette[i % activePalette.length],
            z: Math.random() * 200 - 100
        }));

        // The Paradox Core - 4D Tesseract points
        const corePoints = [];
        for (let i = 0; i < 16; i++) corePoints.push([(i & 1 ? 1 : -1), (i & 2 ? 1 : -1), (i & 4 ? 1 : -1), (i & 8 ? 1 : -1)]);

        return { blobs, corePoints, palette: activePalette };
    }, [color]);

    // Star layer
    const stars = useMemo(() => {
        if (!starSettings?.enabled) return null;
        const count = 45;
        const starColor = starSettings.color || BRAND.MINT;
        const isBrand = starColor === 'brand';
        const brandColors = [BRAND.MINT, BRAND.SOLAR_PINK, BRAND.ION_BLUE, BRAND.ORANGE];

        return [...Array(count)].map((_, i) => (
            <div
                key={i}
                style={{
                    position: 'absolute',
                    width: (Math.random() * 1.5 + 0.5) + 'px',
                    height: (Math.random() * 1.5 + 0.5) + 'px',
                    background: isBrand ? brandColors[i % 4] : starColor,
                    borderRadius: '50%',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.6 + 0.2,
                    boxShadow: `0 0 3px ${isBrand ? brandColors[i % 4] : starColor}`,
                    animation: `paradox-star-twinkle ${Math.random() * 4 + 2}s infinite`
                }}
            />
        ));
    }, [starSettings?.enabled, starSettings?.color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        let animationFrame;

        const project = (x, y, z, w, h, fov = 500) => {
            const scale = fov / (fov + z);
            return { x: (w / 2) + x * scale, y: (h / 2) + y * scale, scale };
        };

        const render = () => {
            stateRef.current.time += 0.012;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            ctx.clearRect(0, 0, w, h);

            // 1. DYNAMIC DISTORTION GRID (Background context)
            ctx.save();
            ctx.globalAlpha = 0.06;
            ctx.strokeStyle = world.palette[1];
            ctx.lineWidth = 1 * dpr;
            const gridCount = 20;
            for (let i = 0; i <= gridCount; i++) {
                const step = w / gridCount;
                ctx.beginPath();
                for (let j = 0; j < h; j += 15) {
                    const x = i * step + Math.sin(t + j * 0.01) * 30;
                    if (j === 0) ctx.moveTo(x, j); else ctx.lineTo(x, j);
                }
                ctx.stroke();
            }
            ctx.restore();

            // 2. STAGE 1: THE LIQUID HORIZON
            ctx.save();
            ctx.filter = `blur(${18 * dpr}px) contrast(300%) brightness(120%)`;

            world.blobs.forEach(b => {
                b.x += b.vx; b.y += b.vy;
                if (b.x < -0.1) b.x = 1.1; if (b.x > 1.1) b.x = -0.1;
                if (b.y < -0.1) b.y = 1.1; if (b.y > 1.1) b.y = -0.1;

                const p = project((b.x - 0.5) * w, (b.y - 0.5) * h, b.z, w, h);
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, b.size * dpr, 0, Math.PI * 2);
                ctx.fill();
            });

            // 3. THE DUAL Paradox Cores (Designed around UI center)
            const drawCore = (cX, cY, rotSpeed, sizeMult) => {
                const rx = t * rotSpeed, ry = t * (rotSpeed * 0.6);
                const s = 110 * dpr * sizeMult;
                const projectedCore = world.corePoints.map(p => {
                    let [px, py, pz, pw] = p;
                    let npy = py * Math.cos(rx) - pz * Math.sin(rx), npz = py * Math.sin(rx) + pz * Math.cos(rx);
                    let npx = px * Math.cos(ry) - npz * Math.sin(ry);
                    npz = px * Math.sin(ry) + npz * Math.cos(ry);
                    const s4 = 2 / (2 + Math.sin(t * 0.5) * 0.3 + 1.2);
                    return project(npx * s * s4, npy * s * s4, npz * s * s4 + 400, w, h);
                });

                // Molten shell pass (Blured)
                ctx.save();
                ctx.filter = `blur(${18 * dpr}px) contrast(300%)`;
                ctx.lineWidth = 30 * dpr;
                ctx.lineCap = 'round';
                for (let i = 0; i < 16; i++) {
                    for (let bit = 0; bit < 4; bit++) {
                        const j = i ^ (1 << bit);
                        if (j > i) {
                            ctx.strokeStyle = world.palette[i % world.palette.length];
                            ctx.beginPath();
                            ctx.moveTo(projectedCore[i].x + cX, projectedCore[i].y + cY);
                            ctx.lineTo(projectedCore[j].x + cX, projectedCore[j].y + cY);
                            ctx.stroke();
                        }
                    }
                }
                ctx.restore();

                // Sharp Vector Overlay
                for (let i = 0; i < 16; i++) {
                    for (let bit = 0; bit < 4; bit++) {
                        const j = i ^ (1 << bit);
                        if (j > i) {
                            const edgeColor = world.palette[(i + bit) % world.palette.length];
                            ctx.strokeStyle = '#fff';
                            ctx.lineWidth = 2 * dpr;
                            ctx.beginPath();
                            ctx.moveTo(projectedCore[i].x + cX, projectedCore[i].y + cY);
                            ctx.lineTo(projectedCore[j].x + cX, projectedCore[j].y + cY);
                            ctx.stroke();

                            ctx.strokeStyle = edgeColor;
                            ctx.lineWidth = 6 * dpr;
                            ctx.globalAlpha = 0.4;
                            ctx.beginPath();
                            ctx.moveTo(projectedCore[i].x + cX, projectedCore[i].y + cY);
                            ctx.lineTo(projectedCore[j].x + cX, projectedCore[j].y + cY);
                            ctx.stroke();
                            ctx.globalAlpha = 1.0;
                        }
                    }
                }
            };

            // USER UI CENTER PROTECTION: Move busy elements to the sides
            drawCore(-w * 0.28, 0, 0.4, 1.0); // Side Core Left
            drawCore(w * 0.28, 0, -0.3, 0.9); // Side Core Right (mirrored counter-rotation)

            ctx.restore();

            // 4. VIGNETTE (Profile Border Sync)
            const tintColor = profileBorderColor || world.palette[0];
            const hexToRgb = (hex) => {
                if (!hex || !hex.startsWith('#')) return '127,255,212';
                const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
                return `${r},${g},${b}`;
            };
            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.8);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(1, `rgba(${hexToRgb(tintColor)}, 0.15)`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            animationFrame = requestAnimationFrame(render);
        };

        const handleRes = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr;
        };
        window.addEventListener('resize', handleRes); handleRes(); render();
        return () => { window.removeEventListener('resize', handleRes); cancelAnimationFrame(animationFrame); };
    }, [world, profileBorderColor]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>{stars}</div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', position: 'relative', zIndex: 1 }} />
            <style>{`
                @keyframes paradox-star-twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.3); }
                }
            `}</style>
        </div>
    );
};

export default OmniParadoxBanner;
