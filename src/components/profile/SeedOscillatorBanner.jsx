import React, { useRef, useEffect, useMemo } from 'react';

// Hash function: String -> Number
const hashStr = (str) => {
    let hash = 0;
    if (!str) return 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// Seeded Random Generator (Mulberry32)
const mulberry32 = (a) => {
    return () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const SeedOscillatorBanner = ({ seed = 'panospace', color: activeColor, speed = 1.0, animationsEnabled = true }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    // 1. Generate deterministic parameters from seed
    const params = useMemo(() => {
        const numericSeed = hashStr(seed);
        const rand = mulberry32(numericSeed);

        const hues = [160, 200, 280, 320, 10, 40]; // Mint, Blue, Purple, Magenta, Red, Orange
        const baseHue = hues[Math.floor(rand() * hues.length)];

        return {
            fx: 1 + rand() * 4,
            fy: 1 + rand() * 4,
            fz: 1 + rand() * 4,
            amplitude: 0.2 + rand() * 0.3,
            thickness: 1 + rand() * 3,
            opacity: 0.4 + rand() * 0.4,
            symmetry: Math.floor(rand() * 4), // 0: None, 1: H, 2: V, 3: Both
            rotX: (rand() - 0.5) * 0.01,
            rotY: (rand() - 0.5) * 0.01,
            rotZ: (rand() - 0.5) * 0.01,
            hue: baseHue,
            complexity: 500 + Math.floor(rand() * 1500),
            pulseSpeed: (0.002 + rand() * 0.008) * speed,
            mode: rand() > 0.5 ? 'lissajous' : 'oscillator'
        };
    }, [seed, speed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrame;

        const render = () => {
            if (animationsEnabled) {
                stateRef.current.time += params.pulseSpeed;
            }
            const t = stateRef.current.time;
            const w = canvas.width;
            const h = canvas.height;
            const dpr = window.devicePixelRatio || 1;

            ctx.clearRect(0, 0, w, h);

            // Background Glow base
            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
            grad.addColorStop(0, `hsla(${params.hue}, 80%, 10%, 0.1)`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const drawCurve = (offsetX = 0, offsetY = 0, scaleX = 1, scaleY = 1) => {
                ctx.save();
                ctx.translate(w / 2 + offsetX, h / 2 + offsetY);
                ctx.scale(scaleX, scaleY);

                ctx.lineWidth = params.thickness * dpr;
                ctx.globalAlpha = params.opacity;
                ctx.shadowBlur = 15 * dpr;

                // 1. Determine coloring mode
                const isMultiColor = activeColor && (activeColor.includes('gradient') || activeColor === 'brand');

                // For solid colors, we can draw a single path (Performance)
                if (!isMultiColor) {
                    const strokeColor = activeColor && activeColor.startsWith('#')
                        ? activeColor
                        : `hsl(${params.hue + Math.sin(t) * 20}, 80%, 70%)`;

                    ctx.strokeStyle = strokeColor;
                    ctx.shadowColor = strokeColor;
                    ctx.beginPath();
                }

                const getPoint = (i) => {
                    const phi = (i / params.complexity) * Math.PI * 2;
                    let x, y, z;
                    if (params.mode === 'lissajous') {
                        x = Math.sin(phi * params.fx + t) * (w * params.amplitude);
                        y = Math.cos(phi * params.fy + t * 0.5) * (h * params.amplitude);
                        z = Math.sin(phi * params.fz + t * 0.2) * 100;
                    } else {
                        x = (phi - Math.PI) * (w * 0.15) + Math.sin(phi * params.fx + t) * 50;
                        y = Math.sin(phi * params.fy + t) * (h * params.amplitude);
                        z = Math.cos(phi * params.fz + t) * 100;
                    }
                    const fov = 400;
                    const perspective = fov / (fov + z);
                    return { x: x * perspective, y: y * perspective };
                };

                for (let i = 0; i <= params.complexity; i++) {
                    const p = getPoint(i);

                    if (isMultiColor) {
                        // Segment-by-segment coloring for multi-color
                        if (i > 0) {
                            const prev = getPoint(i - 1);
                            const ratio = i / params.complexity;
                            // Interpolate between brand colors for "Multi Color" effect
                            const h_color = (params.hue + ratio * 120 + t * 50) % 360;
                            const strokeColor = `hsl(${h_color}, 80%, 70%)`;

                            ctx.beginPath();
                            ctx.strokeStyle = strokeColor;
                            ctx.shadowColor = strokeColor;
                            ctx.moveTo(prev.x, prev.y);
                            ctx.lineTo(p.x, p.y);
                            ctx.stroke();
                        }
                    } else {
                        // Standard single path
                        if (i === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    }
                }

                if (!isMultiColor) {
                    ctx.stroke();
                }

                ctx.restore();
            };

            // Symmetry Logic
            drawCurve(0, 0, 1, 1);

            if (params.symmetry === 1 || params.symmetry === 3) {
                drawCurve(0, 0, -1, 1); // Horizontal flip
            }
            if (params.symmetry === 2 || params.symmetry === 3) {
                drawCurve(0, 0, 1, -1); // Vertical flip
            }
            if (params.symmetry === 3) {
                drawCurve(0, 0, -1, -1); // Both flips
            }

            if (animationsEnabled) {
                animationFrame = requestAnimationFrame(render);
            }
        };

        const res = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            if (!animationsEnabled) render(); // Render once if static
        };

        window.addEventListener('resize', res);
        res();
        if (animationsEnabled) render();

        return () => {
            window.removeEventListener('resize', res);
            cancelAnimationFrame(animationFrame);
        };
    }, [params, activeColor, animationsEnabled]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#020002' }}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
            />
        </div>
    );
};

export default SeedOscillatorBanner;
