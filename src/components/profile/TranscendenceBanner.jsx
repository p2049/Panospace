import React, { useRef, useEffect, useMemo } from 'react';

const BRAND = {
    MINT: '#7FFFD4',
    ION_BLUE: '#1B82FF',
    SOLAR_PINK: '#FF5C8A',
    DEEP_PURPLE: '#5A3FFF',
    WHITE: '#FFFFFF'
};

const TranscendenceBanner = ({ color = 'math_fire', profileBorderColor, starSettings, animationsEnabled = true }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const config = useMemo(() => ({
        math_fire: {
            id: 'Fractal Flame',
            points: 15000,
            dt: 0.005,
            spread: 0.8
        },
        math_mandala: {
            id: 'Geometric Symphony',
            points: 2000,
            dt: 0.003,
            spread: 1.2
        },
        math_nebula: {
            id: 'Topological Nebula',
            points: 10000,
            dt: 0.004,
            spread: 1.5
        }
    })[color] || { id: 'Fractal Flame', points: 15000, dt: 0.005, spread: 0.8 }, [color]);

    const systems = useMemo(() => Array.from({ length: 10 }, (_, i) => {
        const brandPalette = [BRAND.MINT, BRAND.ION_BLUE, BRAND.SOLAR_PINK, BRAND.DEEP_PURPLE, '#FFB7D5', '#A7B6FF', '#7FDBFF', BRAND.WHITE];

        let customColor = (i === 0 && profileBorderColor) ? profileBorderColor : null;
        if (customColor === 'brand') customColor = brandPalette[0];

        return {
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            color: customColor || (profileBorderColor === 'brand' ? brandPalette[i % brandPalette.length] : brandPalette[i % 8]),
            rot: Math.random() * Math.PI,
            rotV: (Math.random() - 0.5) * 0.04,
            trail: []
        };
    }), [profileBorderColor, color]);

    const systemsRef = useRef([]);
    useEffect(() => {
        systemsRef.current = systems;
    }, [systems]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;

        // Initialize particles for IFS
        const particles = Array.from({ length: 100 }, () => ({
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1
        }));

        const render = () => {
            stateRef.current.time += config.dt;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            // Absolute clear and opaque background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);

            const drawSystem = (cX, cY, sideMult, systemColor, rotation) => {
                ctx.save();
                ctx.translate(w / 2 + cX, h / 2 + cY);
                ctx.rotate(rotation);

                if (color === 'math_fire') {
                    // Volumetric Fractal Heart
                    ctx.globalCompositeOperation = 'screen';
                    for (let i = 0; i < 400; i++) {
                        const p = particles[i % particles.length];
                        const r = Math.random();
                        if (r < 0.45) {
                            p.x = p.x * 0.55 + 0.45 * Math.cos(t * 0.4);
                            p.y = p.y * 0.55 + 0.45 * Math.sin(t * 0.3);
                        } else {
                            p.x = Math.sin(p.x * 1.5); p.y = Math.cos(p.y * 1.5);
                        }
                        const px = p.x * (h * 0.12);
                        const py = p.y * (h * 0.12);
                        ctx.beginPath();
                        ctx.fillStyle = systemColor;
                        ctx.globalAlpha = 0.15;
                        ctx.arc(px, py, 1.2 * dpr, 0, Math.PI * 2);
                        ctx.fill();
                    }

                } else if (color === 'math_mandala') {
                    // Kinetic Geometric Core
                    ctx.lineWidth = 1 * dpr;
                    for (let k = 0; k < 3; k++) {
                        ctx.save();
                        ctx.rotate(t * (k + 1) * 0.1 * sideMult);
                        ctx.strokeStyle = systemColor;
                        ctx.globalAlpha = 0.45;
                        ctx.beginPath();
                        const sSize = (8 + k * 4) * dpr;
                        for (let j = 0; j < 6; j++) {
                            const angle = (j / 6) * Math.PI * 2;
                            const rx = Math.cos(angle) * sSize;
                            const ry = Math.sin(angle) * sSize;
                            if (j === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
                        }
                        ctx.closePath();
                        ctx.stroke();
                        ctx.restore();
                    }

                } else {
                    // Pulsing Nebula Singularity
                    ctx.globalCompositeOperation = 'screen';
                    for (let i = 0; i < 20; i++) {
                        const seed = i * 137.5;
                        const pulsate = Math.sin(t + seed) * 4 * dpr;
                        const radius = (Math.sin(t * 0.1 + seed) * 0.2 + 0.8) * (h * 0.08);
                        const x = Math.cos(t * 0.05 + seed) * (radius + pulsate);
                        const y = Math.sin(t * 0.05 + seed) * (radius + pulsate);

                        const grad = ctx.createRadialGradient(x, y, 0, x, y, 5 * dpr);
                        grad.addColorStop(0, systemColor);
                        grad.addColorStop(1, 'transparent');
                        ctx.fillStyle = grad;
                        ctx.globalAlpha = 0.35;
                        ctx.beginPath();
                        ctx.arc(x, y, 5 * dpr, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.restore();
            };

            // Physics and Trails
            systemsRef.current.forEach((sys) => {
                sys.x += sys.vx * dpr;
                sys.y += sys.vy * dpr;
                sys.rot += sys.rotV;

                const limitX = w / 2 - 50 * dpr;
                const limitY = h / 2 - 30 * dpr;

                if (Math.abs(sys.x) > limitX) sys.vx *= -1;
                if (Math.abs(sys.y) > limitY) sys.vy *= -1;

                // Push to trail history
                sys.trail.push({ x: sys.x, y: sys.y });
                if (sys.trail.length > 80) sys.trail.shift();

                // Render "Gray Stardust" Trail (Additive Volumetric)
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                sys.trail.forEach((pos, i) => {
                    const ratio = i / sys.trail.length;
                    const grayAlpha = Math.pow(ratio, 2) * 0.12;
                    ctx.beginPath();
                    ctx.fillStyle = '#555';
                    ctx.globalAlpha = grayAlpha;
                    const d = Math.random() < 0.3; // Stardust flicker
                    if (d) {
                        const dx = (Math.random() - 0.5) * 8 * dpr;
                        const dy = (Math.random() - 0.5) * 8 * dpr;
                        ctx.arc(w / 2 + pos.x + dx, h / 2 + pos.y + dy, 0.8 * dpr, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
                ctx.restore();

                drawSystem(sys.x, sys.y, 1, sys.color, sys.rot);
            });

            if (animationsEnabled) {
                animationFrame = requestAnimationFrame(render);
            }
        };

        const res = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr;
            // Force one render on resize
            render();
        };
        window.addEventListener('resize', res); res();

        // Initial kick-off
        render();

        return () => { window.removeEventListener('resize', res); cancelAnimationFrame(animationFrame); };
    }, [config, color, profileBorderColor, animationsEnabled]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            {/* Vignette Overlay for depth */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.8) 100%)`,
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default TranscendenceBanner;
