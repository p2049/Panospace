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

const ManifoldBanner = ({ color = 'math_knot', profileBorderColor, starSettings }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const world = useMemo(() => {
        // High-Complexity Parametric Equations
        const configs = {
            math_knot: {
                id: 'Torus Knot',
                p: 3, q: 7, // High frequency winding
                radius: 120, innerRadius: 45,
                points: 800,
                dt: 0.008
            },
            math_enneper: {
                id: 'Enneper Surface',
                uRange: [-2, 2], vRange: [-2, 2],
                resolution: 28, // 28x28 grid = 784 points
                dt: 0.006
            },
            math_mobius: {
                id: 'Mobius Loop',
                uRange: [0, Math.PI * 2], vRange: [-0.5, 0.5],
                uResolution: 60, vResolution: 10,
                dt: 0.01
            }
        };
        const current = configs[color] || configs.math_knot;
        return current;
    }, [color]);

    const stars = useMemo(() => {
        if (!starSettings?.enabled) return null;
        const count = 45;
        const starColor = starSettings.color || BRAND.MINT;
        return [...Array(count)].map((_, i) => (
            <div
                key={i}
                style={{
                    position: 'absolute',
                    width: '1px', height: '1px',
                    background: starColor === 'brand' ? [BRAND.MINT, BRAND.SOLAR_PINK, BRAND.ION_BLUE][i % 3] : starColor,
                    borderRadius: '50%',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.4 + 0.2,
                    boxShadow: `0 0 3px ${starColor === 'brand' ? BRAND.MINT : starColor}`,
                    animation: `manifold-twinkle ${3 + Math.random() * 4}s infinite`
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
            const scale = fov / (fov + z + 400);
            return { x: (w / 2) + x * scale, y: (h / 2) + y * scale, scale };
        };

        const render = () => {
            stateRef.current.time += world.dt;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            ctx.clearRect(0, 0, w, h);

            const activeColor = profileBorderColor || BRAND.MINT;

            const drawSurface = (cX, cY, rotY, rotX) => {
                ctx.beginPath();
                ctx.strokeStyle = activeColor;
                ctx.lineWidth = 1 * dpr;
                ctx.shadowBlur = 8 * dpr;
                ctx.shadowColor = activeColor;

                if (color === 'math_enneper') {
                    // Enneper Surface Logic
                    for (let i = 0; i < world.resolution; i++) {
                        for (let j = 0; j < world.resolution; j++) {
                            const u = world.uRange[0] + (i / world.resolution) * (world.uRange[1] - world.uRange[0]);
                            const v = world.vRange[0] + (j / world.resolution) * (world.vRange[1] - world.vRange[0]);

                            // Equations
                            let x = u - (u ** 3) / 3 + u * (v ** 2);
                            let y = v - (v ** 3) / 3 + v * (u ** 2);
                            let z = (u ** 2) - (v ** 2);

                            const scale = 50;
                            // Rotate
                            let rx = x * Math.cos(rotY) - z * Math.sin(rotY);
                            let rz = x * Math.sin(rotY) + z * Math.cos(rotY);
                            let ry = y * Math.cos(rotX) - rz * Math.sin(rotX);
                            rz = y * Math.sin(rotX) + rz * Math.cos(rotX);

                            const pt = project(rx * scale, ry * scale, rz * scale, w, h);
                            if (j === 0) ctx.moveTo(pt.x + cX, pt.y + cY);
                            else ctx.lineTo(pt.x + cX, pt.y + cY);
                        }
                    }
                } else if (color === 'math_mobius') {
                    // Mobius Loop Logic
                    for (let j = 0; j < world.vResolution; j++) {
                        const v = world.vRange[0] + (j / world.vResolution) * (world.vRange[1] - world.vRange[0]);
                        for (let i = 0; i <= world.uResolution; i++) {
                            const u = (i / world.uResolution) * Math.PI * 2;
                            const x = (1 + v * Math.cos(u / 2)) * Math.cos(u);
                            const y = (1 + v * Math.cos(u / 2)) * Math.sin(u);
                            const z = v * Math.sin(u / 2);

                            const scale = 140;
                            let rx = x * Math.cos(rotY) - z * Math.sin(rotY);
                            let rz = x * Math.sin(rotY) + z * Math.cos(rotY);
                            let ry = y * Math.cos(rotX) - rz * Math.sin(rotX);
                            rz = y * Math.sin(rotX) + rz * Math.cos(rotX);

                            const pt = project(rx * scale, ry * scale, rz * scale, w, h);
                            if (i === 0) ctx.moveTo(pt.x + cX, pt.y + cY);
                            else ctx.lineTo(pt.x + cX, pt.y + cY);
                        }
                    }
                } else {
                    // Torus Knot Logic (Default/Knot)
                    for (let i = 0; i < world.points; i++) {
                        const phi = (i / world.points) * Math.PI * 2;
                        const r = world.radius + world.innerRadius * Math.cos(world.q * phi);
                        const x = r * Math.cos(world.p * phi);
                        const y = r * Math.sin(world.p * phi);
                        const z = world.innerRadius * Math.sin(world.q * phi);

                        let rx = x * Math.cos(rotY) - z * Math.sin(rotY);
                        let rz = x * Math.sin(rotY) + z * Math.cos(rotY);
                        let ry = y * Math.cos(rotX) - rz * Math.sin(rotX);
                        rz = y * Math.sin(rotX) + rz * Math.cos(rotX);

                        const pt = project(rx, ry, rz, w, h);
                        if (i === 0) ctx.moveTo(pt.x + cX, pt.y + cY);
                        else ctx.lineTo(pt.x + cX, pt.y + cY);
                    }
                }
                ctx.stroke();
            };

            const rotationY = t * 0.5;
            const rotationX = t * 0.3;
            // Frame UI - Side systems
            drawSurface(-w * 0.28, 0, rotationY, rotationX);
            drawSurface(w * 0.28, 0, -rotationY, rotationX * 0.5);

            // VIGNETTE
            const tintColor = profileBorderColor || BRAND.MINT;
            const hexToRgb = (hex) => {
                if (!hex || !hex.startsWith('#')) return '127,255,212';
                const ri = parseInt(hex.slice(1, 3), 16), gi = parseInt(hex.slice(3, 5), 16), bi = parseInt(hex.slice(5, 7), 16);
                return `${ri},${gi},${bi}`;
            };
            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.8);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(1, `rgba(${hexToRgb(tintColor)}, 0.1)`);
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
                @keyframes manifold-twinkle {
                    0%, 100% { opacity: 0.1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

export default ManifoldBanner;
