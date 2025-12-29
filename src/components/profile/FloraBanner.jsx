import React, { useRef, useEffect, useMemo } from 'react';

const BRAND = {
    MINT: '#7FFFD4',
    WHITE: '#FFFFFF'
};

const FloraBanner = ({ color = 'math_phyllotaxis', profileBorderColor, starSettings }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const config = useMemo(() => {
        const configs = {
            math_phyllotaxis: {
                id: 'Phyllotaxis',
                divergence: 137.508, // Golden Angle
                points: 400,
                scale: 6,
                dt: 0.005
            },
            math_fibonacci: {
                id: 'Fibonacci Spiral',
                divergence: 137.5,
                points: 600,
                scale: 4,
                dt: 0.003
            },
            math_golden_ratio: {
                id: 'Golden Portal',
                divergence: 137.5,
                points: 200,
                scale: 12,
                dt: 0.01
            }
        };
        return configs[color] || configs.math_phyllotaxis;
    }, [color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrame;

        const render = () => {
            stateRef.current.time += config.dt;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            ctx.clearRect(0, 0, w, h);
            const activeColor = profileBorderColor || BRAND.MINT;

            const drawSystem = (cX, cY, sideMult) => {
                ctx.save();
                ctx.translate(w / 2 + cX, h / 2 + cY);
                // Slow pulse/breathing
                const breath = 1 + Math.sin(t * 0.5) * 0.05;
                ctx.scale(breath, breath);

                for (let i = 0; i < config.points; i++) {
                    // Phyllotaxis formula: angle = i * divergence, radius = c * sqrt(i)
                    const angle = i * (config.divergence * (Math.PI / 180)) + (t * sideMult);
                    const r = config.scale * Math.sqrt(i) * dpr;

                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r;

                    // Aesthetics: size pulses with index and time
                    const size = (1.5 + Math.sin(i * 0.1 + t) * 0.5) * dpr;
                    const opacity = 0.8 * (1 - i / config.points);

                    ctx.beginPath();
                    ctx.fillStyle = activeColor;
                    ctx.globalAlpha = opacity;
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();

                    // Optional subtle trail for the "portal" feel
                    if (color === 'math_golden_ratio' && i % 4 === 0) {
                        ctx.shadowBlur = 10 * dpr;
                        ctx.shadowColor = activeColor;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }
                ctx.restore();
            };

            // Dual Side Framing
            drawSystem(-w * 0.28, 0, 0.2);
            drawSystem(w * 0.28, 0, -0.15);

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

export default FloraBanner;
