import React, { useRef, useEffect, useMemo } from 'react';

const BRAND = {
    MINT: '#7FFFD4',
    ION_BLUE: '#1B82FF',
    SOLAR_PINK: '#FF5C8A',
    DEEP_PURPLE: '#5A3FFF',
    WHITE: '#FFFFFF'
};

const CosmicMathBanner = ({ color = 'math_calabi', profileBorderColor, starSettings }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const config = useMemo(() => ({
        math_calabi: {
            id: 'Calabi-Yau Space',
            points: 1200,
            scale: 140,
            dt: 0.004
        },
        math_singularity: {
            id: 'Event Horizon',
            points: 800,
            scale: 1,
            dt: 0.006
        },
        math_ribbon: {
            id: 'Attractor Ribbon',
            points: 200, // Length of ribbon segments
            scale: 12,
            dt: 0.005
        }
    })[color] || { id: 'Calabi-Yau Space', points: 1200, scale: 140, dt: 0.004 }, [color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrame;

        const project = (x, y, z, w, h, fov = 600) => {
            const scale = fov / (fov + z + 400);
            return { x: (w / 2) + x * scale, y: (h / 2) + y * scale, scale };
        };

        const render = () => {
            stateRef.current.time += config.dt;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            ctx.clearRect(0, 0, w, h);
            const activeColor = profileBorderColor || BRAND.MINT;

            const drawSystem = (cX, cY, sideMult) => {
                ctx.beginPath();
                ctx.strokeStyle = activeColor;
                ctx.lineWidth = 1 * dpr;
                ctx.shadowBlur = 15 * dpr;
                ctx.shadowColor = activeColor;

                if (color === 'math_calabi') {
                    // Calabi-Yau Manifold Projection
                    // Real projection of a 6D Clarabi-Yau manifold into 3D
                    // Equations: x = Re(z1^k / n), y = Im(z1^k / n)...
                    for (let i = 0; i < config.points; i++) {
                        const theta = (i / config.points) * Math.PI * 2;
                        const phi = t * 0.2 + (i / 100);

                        // Parametric approximation of a Calabi-Yau quintic
                        const x = Math.cos(theta) * (Math.cos(phi) + 2) * config.scale;
                        const y = Math.sin(theta) * (Math.cos(phi) + 2) * config.scale;
                        const z = Math.sin(phi) * 1.5 * config.scale;

                        // Rotate in 3D
                        let rx = x * Math.cos(t * sideMult) - z * Math.sin(t * sideMult);
                        let rz = x * Math.sin(t * sideMult) + z * Math.cos(t * sideMult);
                        let ry = y * Math.cos(t * 0.5) - rz * Math.sin(t * 0.5);
                        rz = y * Math.sin(t * 0.5) + rz * Math.cos(t * 0.5);

                        const pt = project(rx, ry, rz, w, h);
                        ctx.globalAlpha = 0.1 + (1 - i / config.points) * 0.3;
                        if (i === 0) ctx.moveTo(pt.x + cX, pt.y + cY);
                        else ctx.lineTo(pt.x + cX, pt.y + cY);
                    }
                    ctx.stroke();

                } else if (color === 'math_singularity') {
                    // Gravitational Lensing / Schwarzschild Geodesics
                    // Visualizing light-ray bending around a black hole
                    const bhRadius = 40 * dpr;
                    for (let i = 0; i < 60; i++) {
                        ctx.beginPath();
                        const angle = (i / 60) * Math.PI * 2 + t * 0.1 * sideMult;
                        ctx.moveTo(w / 2 + cX, h / 2 + cY);

                        for (let step = 0; step < 100; step++) {
                            const r = (step * 8 + 50) * dpr;
                            // Gravitational bending factor
                            const bend = 1200 / r;
                            const sa = angle + bend * sideMult;

                            const x = Math.cos(sa) * r;
                            const y = Math.sin(sa) * r;

                            ctx.globalAlpha = 0.05 + (step / 100) * 0.2;
                            ctx.lineTo(w / 2 + cX + x, h / 2 + cY + y);
                        }
                        ctx.stroke();
                    }
                    // Event Horizon Glow
                    ctx.beginPath();
                    ctx.arc(w / 2 + cX, h / 2 + cY, bhRadius, 0, Math.PI * 2);
                    ctx.fillStyle = '#000';
                    ctx.fill();
                    ctx.shadowBlur = 40 * dpr;
                    ctx.strokeStyle = activeColor;
                    ctx.stroke();

                } else if (color === 'math_ribbon') {
                    // Ribbonized Lorenz Attractor
                    let lx = 0.1, ly = 0, lz = 0;
                    const dt = 0.005;
                    const sigma = 10, rho = 28, beta = 8 / 3;

                    ctx.globalAlpha = 0.15;
                    for (let i = 0; i < 400; i++) {
                        const dx = sigma * (ly - lx);
                        const dy = lx * (rho - lz) - ly;
                        const dz = lx * ly - beta * lz;
                        lx += dx * dt; ly += dy * dt; lz += dz * dt;

                        const r_rot = t * 0.3 * sideMult;
                        let rx = lx * Math.cos(r_rot) - lz * Math.sin(r_rot);
                        let rz = lx * Math.sin(r_rot) + lz * Math.cos(r_rot);
                        let ry = ly;

                        const pt = project(rx * config.scale, ry * config.scale, (rz - 25) * config.scale, w, h);

                        // Draw a "ribbon" by drawing paths slightly offset
                        if (i > 20) {
                            ctx.lineTo(pt.x + cX, pt.y + cY);
                        } else {
                            ctx.moveTo(pt.x + cX, pt.y + cY);
                        }
                    }
                    ctx.stroke();
                }
            };

            drawSystem(-w * 0.28, 0, 1.0);
            drawSystem(w * 0.28, 0, -0.8);

            // Subtle Background Depth
            ctx.globalAlpha = 0.03;
            ctx.strokeStyle = activeColor;
            ctx.beginPath();
            for (let i = 0; i < w; i += 60 * dpr) {
                ctx.moveTo(i, 0); ctx.lineTo(i, h);
            }
            ctx.stroke();

            animationFrame = requestAnimationFrame(render);
        };

        const res = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr;
        };
        window.addEventListener('resize', res); res(); render();
        return () => { window.removeEventListener('resize', res); cancelAnimationFrame(animationFrame); };
    }, [config, color, profileBorderColor]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default CosmicMathBanner;
