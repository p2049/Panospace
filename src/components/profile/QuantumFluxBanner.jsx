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

const QuantumFluxBanner = ({ color = 'math_wave', profileBorderColor, starSettings }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const config = useMemo(() => ({
        math_wave: { id: 'Wave Function', sources: 2, complexity: 1.0 },
        math_interference: { id: 'Double Slit', sources: 4, complexity: 1.5 },
        math_quantum_foam: { id: 'Quantum Foam', sources: 8, complexity: 2.0 }
    })[color] || { id: 'Wave Function', sources: 2, complexity: 1.0 }, [color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrame;

        const render = () => {
            // SLOWED DOWN: 0.004 (was 0.02)
            stateRef.current.time += 0.004;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            ctx.clearRect(0, 0, w, h);
            const activeColor = profileBorderColor || BRAND.MINT;

            const gridRows = 25, gridCols = 45;
            const cellW = w / gridCols, cellH = h / gridRows;

            // Differentiated source logic
            const sources = [];
            const sourceCount = config.sources;

            for (let i = 0; i < sourceCount; i++) {
                const angle = (i / sourceCount) * Math.PI * 2 + t * (0.1 / config.complexity);
                const orbitRadius = color === 'math_quantum_foam' ? (w * 0.4) : (w * 0.25);

                sources.push({
                    x: (w / 2) + Math.cos(angle) * orbitRadius,
                    y: (h / 2) + Math.sin(angle * 1.5) * (h * 0.2),
                    phase: t * 1.5,
                    freq: color === 'math_quantum_foam' ? 0.08 : 0.04
                });
            }

            // Render Field
            ctx.lineWidth = 1 * dpr;
            ctx.strokeStyle = activeColor;

            // Single pass for performance and better grid look
            for (let r = 0; r <= gridRows; r++) {
                ctx.beginPath();
                ctx.globalAlpha = 0.12;
                for (let c = 0; c <= gridCols; c++) {
                    const px = c * cellW, py = r * cellH;

                    let amplitude = 0;
                    sources.forEach(src => {
                        const dist = Math.sqrt((px - src.x) ** 2 + (py - src.y) ** 2);
                        // Wave function math
                        const val = Math.sin(dist * src.freq - src.phase);

                        if (color === 'math_interference') {
                            // Constructive/Destructive focus for Interference variant
                            amplitude += val * Math.cos(dist * 0.01);
                        } else if (color === 'math_quantum_foam') {
                            // Non-linear "bubbling" for Foam
                            amplitude += Math.tan(val * 0.5) * 0.8;
                        } else {
                            amplitude += val;
                        }
                    });

                    const ampNormalized = amplitude / sourceCount;
                    const disp = ampNormalized * 22 * dpr;
                    const finalX = px + disp * 0.4;
                    const finalY = py + disp;

                    if (c === 0) ctx.moveTo(finalX, finalY);
                    else ctx.lineTo(finalX, finalY);
                }
                ctx.stroke();
            }

            // Vertical pass
            for (let c = 0; c <= gridCols; c++) {
                ctx.beginPath();
                ctx.globalAlpha = 0.08;
                for (let r = 0; r <= gridRows; r++) {
                    const px = c * cellW, py = r * cellH;
                    let amplitude = 0;
                    sources.forEach(src => {
                        const dist = Math.sqrt((px - src.x) ** 2 + (py - src.y) ** 2);
                        const val = Math.sin(dist * src.freq - src.phase);

                        if (color === 'math_interference') {
                            amplitude += val * Math.cos(dist * 0.01);
                        } else if (color === 'math_quantum_foam') {
                            amplitude += Math.tan(val * 0.5) * 0.8;
                        } else {
                            amplitude += val;
                        }
                    });
                    const ampNormalized = amplitude / sourceCount;
                    const disp = ampNormalized * 22 * dpr;
                    const finalX = px + disp * 0.4;
                    const finalY = py + disp;
                    if (r === 0) ctx.moveTo(finalX, finalY);
                    else ctx.lineTo(finalX, finalY);
                }
                ctx.stroke();
            }

            // High-probability "Photons" (Differentiated by variant)
            ctx.shadowBlur = 12 * dpr;
            ctx.shadowColor = activeColor;
            const particleCount = color === 'math_quantum_foam' ? 24 : 12;

            for (let i = 0; i < particleCount; i++) {
                const px = ((t * 0.02 + i * 137.5) % 1) * w;
                const py = ((t * 0.01 + i * 222.1) % 1) * h;

                let amp = 0;
                sources.forEach(src => {
                    const dist = Math.sqrt((px - src.x) ** 2 + (py - src.y) ** 2);
                    amp += Math.sin(dist * src.freq - src.phase);
                });

                const threshold = color === 'math_quantum_foam' ? 0.2 : 0.6;
                if (amp / sourceCount > threshold) {
                    ctx.globalAlpha = Math.min(1, (amp / sourceCount));
                    ctx.beginPath();
                    ctx.fillStyle = activeColor;
                    const size = color === 'math_quantum_foam' ? (Math.random() * 2 + 1) : 3;
                    ctx.arc(px, py + (amp / sourceCount) * 20 * dpr, size * dpr, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

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

export default QuantumFluxBanner;
