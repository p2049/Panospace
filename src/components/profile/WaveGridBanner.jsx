import React, { useRef, useEffect } from 'react';

/**
 * WaveGridBanner - Full-screen animated wavy grid
 * 
 * A mesmerizing grid that undulates like fabric in the wind.
 * Features:
 * - Full-screen wavy grid lines
 * - Brand color gradient across the grid
 * - Smooth wave animation
 * - Perspective depth effect
 * 
 * STRICT BRAND COLORS ONLY
 */
const WaveGridBanner = ({ starSettings, variant = 'main' }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    // STRICT BRAND PALETTE
    const BRAND = {
        voidPurple: '#2A0E61',
        deepOrbit: '#5A3FFF',
        auroraMint: '#8CFFE9',
        ionBlue: '#1B82FF',
        auroraBlue: '#7FDBFF',
        solarPink: '#FF5C8A',
        vividOrange: '#FF914D',
        white: '#FFFFFF',
        black: '#000000'
    };

    const VARIANTS = {
        main: {
            bg: BRAND.black,
            colors: [BRAND.deepOrbit, BRAND.ionBlue, BRAND.auroraMint, BRAND.solarPink],
            glow: BRAND.deepOrbit
        },
        sunset: {
            bg: BRAND.voidPurple,
            colors: [BRAND.solarPink, BRAND.vividOrange, BRAND.deepOrbit, BRAND.ionBlue],
            glow: BRAND.solarPink
        },
        ocean: {
            bg: BRAND.black,
            colors: [BRAND.ionBlue, BRAND.auroraBlue, BRAND.auroraMint, BRAND.deepOrbit],
            glow: BRAND.ionBlue
        },
        mint: {
            bg: BRAND.black,
            colors: [BRAND.auroraMint, BRAND.auroraBlue, BRAND.ionBlue, BRAND.deepOrbit],
            glow: BRAND.auroraMint
        }
    };

    const palette = VARIANTS[variant] || VARIANTS.main;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let time = 0;

        const isLowPower = window.innerWidth <= 768;

        function renderFrame() {
            if (!ctx) return;

            // Clear
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, width, height);

            // Grid parameters
            const gridSpacingX = 25;
            const gridSpacingY = 18;
            const cols = Math.ceil(width / gridSpacingX) + 2;
            const rows = Math.ceil(height / gridSpacingY) + 2;

            // Wave parameters
            const waveAmp = 8;
            const waveFreqX = 0.02;
            const waveFreqY = 0.03;
            const waveSpeed = 0.0012;

            ctx.globalCompositeOperation = 'screen';
            ctx.lineWidth = 1;

            // Pre-calculate wave offsets for each grid point
            const points = [];
            for (let row = 0; row < rows; row++) {
                points[row] = [];
                for (let col = 0; col < cols; col++) {
                    const baseX = col * gridSpacingX;
                    const baseY = row * gridSpacingY;

                    // Multi-frequency wave for organic motion
                    const wave1 = Math.sin(baseX * waveFreqX + baseY * waveFreqY + time * waveSpeed) * waveAmp;
                    const wave2 = Math.sin(baseX * waveFreqX * 1.5 - baseY * waveFreqY * 0.8 + time * waveSpeed * 1.3) * waveAmp * 0.5;
                    const wave3 = Math.cos(baseY * waveFreqY * 2 + time * waveSpeed * 0.7) * waveAmp * 0.3;

                    const offsetX = wave1 + wave2;
                    const offsetY = wave3 + wave2 * 0.5;

                    points[row][col] = {
                        x: baseX + offsetX,
                        y: baseY + offsetY
                    };
                }
            }

            // Get color based on position
            const getColor = (x, y) => {
                const normalX = x / width;
                const normalY = y / height;
                const colorIndex = Math.floor((normalX + normalY) * 2) % palette.colors.length;
                return palette.colors[colorIndex];
            };

            // Draw horizontal lines
            for (let row = 0; row < rows; row++) {
                const yProgress = row / rows;
                ctx.globalAlpha = 0.3 + yProgress * 0.4;

                for (let col = 0; col < cols - 1; col++) {
                    const p1 = points[row][col];
                    const p2 = points[row][col + 1];

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = getColor(p1.x, p1.y);
                    ctx.stroke();
                }
            }

            // Draw vertical lines
            for (let col = 0; col < cols; col++) {
                const xProgress = col / cols;
                ctx.globalAlpha = 0.2 + xProgress * 0.3;

                for (let row = 0; row < rows - 1; row++) {
                    const p1 = points[row][col];
                    const p2 = points[row + 1][col];

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = getColor(p1.x, p1.y);
                    ctx.stroke();
                }
            }

            // Draw intersection dots
            ctx.globalAlpha = 0.6;
            for (let row = 0; row < rows; row += 3) {
                for (let col = 0; col < cols; col += 3) {
                    const p = points[row][col];
                    const dotSize = 1 + Math.sin(time * 0.01 + row * 0.2 + col * 0.3) * 0.5;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
                    ctx.fillStyle = BRAND.white;
                    ctx.fill();
                }
            }

            // Center glow
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.15;
            const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.5);
            glow.addColorStop(0, palette.glow);
            glow.addColorStop(0.5, palette.glow + '44');
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);

            ctx.globalAlpha = 1;

            if (!isLowPower) {
                time += 1;
                animationRef.current = requestAnimationFrame(renderFrame);
            }
        }

        function resize() {
            width = canvas.width = canvas.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.offsetHeight || 200;
            renderFrame();
        }

        window.addEventListener('resize', resize);
        resize();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [variant]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: BRAND.black }}>
            <canvas ref={canvasRef} style={{
                width: '100%',
                height: '100%',
                display: 'block',
                position: 'relative',
                zIndex: 1
            }} />
        </div>
    );
};

export default WaveGridBanner;
