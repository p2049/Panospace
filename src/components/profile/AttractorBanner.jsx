import React, { useRef, useEffect, useMemo } from 'react';

// Brand Colors
const BRAND = {
    MINT: '#7FFFD4',
    ION_BLUE: '#1B82FF',
    SOLAR_PINK: '#FF5C8A',
    DEEP_PURPLE: '#5A3FFF',
    AURORA: '#7FDBFF',
    WHITE: '#FFFFFF'
};

const AttractorBanner = ({ color = 'math_aizawa', profileBorderColor, starSettings }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({
        time: 0,
        particles: []
    });

    const world = useMemo(() => {
        // Deep Maths Configurations - SLOWED DOWN via 'dt' (delta time)
        const configs = {
            math_aizawa: {
                id: 'Aizawa',
                a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1,
                dt: 0.01, // From 0.015
                scale: 60,
                particles: 12
            },
            math_lorenz: {
                id: 'Lorenz',
                sigma: 10, rho: 28, beta: 8 / 3,
                dt: 0.0035, // From 0.005
                scale: 7,
                particles: 15
            },
            math_rossler: {
                id: 'Rossler',
                a: 0.2, b: 0.2, c: 5.7,
                dt: 0.025, // From 0.04
                scale: 12,
                particles: 20
            }
        };
        const current = configs[color] || configs.math_aizawa;

        // Initialize particles with randomized start positions
        stateRef.current.particles = Array.from({ length: current.particles }, (_, i) => ({
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5,
            z: (Math.random() - 0.5) * 5,
            history: [],
            color: [BRAND.MINT, BRAND.ION_BLUE, BRAND.SOLAR_PINK, BRAND.AURORA][i % 4]
        }));

        return current;
    }, [color]);

    const stars = useMemo(() => {
        if (!starSettings?.enabled) return null;
        const count = 40;
        const starColor = starSettings.color || BRAND.MINT;
        return [...Array(count)].map((_, i) => (
            <div
                key={i}
                style={{
                    position: 'absolute',
                    width: '1.5px', height: '1.5px',
                    background: starColor === 'brand' ? [BRAND.MINT, BRAND.SOLAR_PINK, BRAND.ION_BLUE][i % 3] : starColor,
                    borderRadius: '50%',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.5 + 0.2,
                    boxShadow: `0 0 4px ${starColor === 'brand' ? BRAND.MINT : starColor}`,
                    animation: `math-twinkle ${2 + Math.random() * 3}s infinite`
                }}
            />
        ));
    }, [starSettings?.enabled, starSettings?.color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        let animationFrame;

        const project = (x, y, z, w, h, fov = 400) => {
            const scale = fov / (fov + z + 400);
            return { x: (w / 2) + x * scale, y: (h / 2) + y * scale, scale };
        };

        const render = () => {
            stateRef.current.time += 0.008; // Slower time step (was 0.01)
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            ctx.clearRect(0, 0, w, h);

            // 1. SOLVE ATTRACTOR PHYSICS
            stateRef.current.particles.forEach(p => {
                const { x, y, z } = p;
                let dx, dy, dz;

                if (color === 'math_lorenz') {
                    dx = world.sigma * (y - x);
                    dy = x * (world.rho - z) - y;
                    dz = x * y - world.beta * z;
                } else if (color === 'math_rossler') {
                    dx = -y - z;
                    dy = x + world.a * y;
                    dz = world.b + z * (x - world.c);
                } else { // Aizawa (Default)
                    dx = (z - world.b) * x - world.d * y;
                    dy = world.d * x + (z - world.b) * y;
                    dz = world.c + world.a * z - Math.pow(z, 3) / 3 - (Math.pow(x, 2) + Math.pow(y, 2)) * (1 + world.e * z) + world.f * z * Math.pow(x, 3);
                }

                p.x += dx * world.dt;
                p.y += dy * world.dt;
                p.z += dz * world.dt;

                // Update history for trails - increased length for more visible trails at slow speeds
                p.history.push({ x: p.x, y: p.y, z: p.z });
                if (p.history.length > 80) p.history.shift();
            });

            // 2. RENDER TRAILS
            const drawAttractorAt = (cX, cY, rotY) => {
                stateRef.current.particles.forEach(p => {
                    ctx.beginPath();
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 1.5 * dpr;
                    ctx.shadowBlur = 10 * dpr;
                    ctx.shadowColor = p.color;

                    p.history.forEach((pos, idx) => {
                        let rx = pos.x * Math.cos(rotY) - pos.z * Math.sin(rotY);
                        let rz = pos.x * Math.sin(rotY) + pos.z * Math.cos(rotY);
                        const pt = project(rx * world.scale, pos.y * world.scale, rz * world.scale, w, h);
                        ctx.globalAlpha = idx / 80;
                        if (idx === 0) ctx.moveTo(pt.x + cX, pt.y + cY);
                        else ctx.lineTo(pt.x + cX, pt.y + cY);
                    });
                    ctx.stroke();
                });
            };

            const rotation = t * 0.3; // Slower camera rotation (was 0.4)
            drawAttractorAt(-w * 0.28, 0, rotation);
            drawAttractorAt(w * 0.28, 0, -rotation);

            // 3. VIGNETTE
            const tintColor = profileBorderColor || BRAND.MINT;
            const hexToRgb = (hex) => {
                if (!hex || !hex.startsWith('#')) return '127,255,212';
                const rInt = parseInt(hex.slice(1, 3), 16), gInt = parseInt(hex.slice(3, 5), 16), bInt = parseInt(hex.slice(5, 7), 16);
                return `${rInt},${gInt},${bInt}`;
            };
            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.8);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(1, `rgba(${hexToRgb(tintColor)}, 0.15)`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            animationFrame = requestAnimationFrame(render);
        };

        const res = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr;
        };
        window.addEventListener('resize', res); res(); render();
        return () => { window.removeEventListener('resize', res); cancelAnimationFrame(animationFrame); };
    }, [world, color, profileBorderColor]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>{stars}</div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', position: 'relative', zIndex: 1 }} />
            <style>{`
                @keyframes math-twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
};

export default AttractorBanner;
