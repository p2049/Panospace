import React, { useRef, useEffect, useMemo } from 'react';

const BRAND = {
    MINT: '#7FFFD4',
    WHITE: '#FFFFFF'
};

const SymmetryBanner = ({ color = 'math_lissajous', profileBorderColor, starSettings }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const config = useMemo(() => {
        const configs = {
            math_lissajous: {
                id: 'Lissajous Field',
                // Harmonic frequencies
                fx: 3, fy: 2,
                points: 1000,
                dt: 0.005
            },
            math_hypotrochoid: {
                id: 'Spirograph',
                R: 100, r: 40, d: 60,
                points: 2000,
                dt: 0.003
            },
            math_supershape: {
                id: 'Supershape',
                m: 5, n1: 1, n2: 1, n3: 1,
                points: 800,
                dt: 0.008
            }
        };
        return configs[color] || configs.math_lissajous;
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

            const drawCurve = (cX, cY, sideMult) => {
                ctx.beginPath();
                ctx.strokeStyle = activeColor;
                ctx.lineWidth = 1.5 * dpr;
                ctx.globalAlpha = 0.6;
                ctx.shadowBlur = 10 * dpr;
                ctx.shadowColor = activeColor;

                const center_x = w / 2 + cX;
                const center_y = h / 2 + cY;

                if (color === 'math_lissajous') {
                    for (let i = 0; i <= config.points; i++) {
                        const phi = (i / config.points) * Math.PI * 2;
                        // Time-varying frequencies for "Beautiful Math"
                        const x = Math.sin(phi * config.fx + t * sideMult) * (h * 0.4);
                        const y = Math.cos(phi * config.fy + t) * (h * 0.4);
                        if (i === 0) ctx.moveTo(center_x + x, center_y + y);
                        else ctx.lineTo(center_x + x, center_y + y);
                    }
                } else if (color === 'math_hypotrochoid') {
                    // (R-r)cos(phi) + d cos((R-r)phi/r)
                    const { R, r, d } = config;
                    for (let i = 0; i <= config.points; i++) {
                        const phi = (i / config.points) * Math.PI * 16; // Multiple revolutions
                        const x = (R - r) * Math.cos(phi) + d * Math.cos(((R - r) / r) * phi + t * sideMult);
                        const y = (R - r) * Math.sin(phi) - d * Math.sin(((R - r) / r) * phi + t * sideMult);
                        if (i === 0) ctx.moveTo(center_x + x * dpr, center_y + y * dpr);
                        else ctx.lineTo(center_x + x * dpr, center_y + y * dpr);
                    }
                } else {
                    // Supershape 2D
                    for (let i = 0; i <= config.points; i++) {
                        const phi = (i / config.points) * Math.PI * 2;
                        const m = config.m + Math.sin(t) * 2;
                        const t1 = Math.pow(Math.abs(Math.cos(m * phi / 4)), config.n2);
                        const t2 = Math.pow(Math.abs(Math.sin(m * phi / 4)), config.n3);
                        const rad = Math.pow(t1 + t2, -1 / config.n1);
                        const x = rad * Math.cos(phi) * 120 * dpr;
                        const y = rad * Math.sin(phi) * 120 * dpr;
                        if (i === 0) ctx.moveTo(center_x + x, center_y + y);
                        else ctx.lineTo(center_x + x, center_y + y);
                    }
                }
                ctx.stroke();
            };

            drawCurve(-w * 0.28, 0, 1.0);
            drawCurve(w * 0.28, 0, -1.0);

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

export default SymmetryBanner;
