import React, { useRef, useEffect } from 'react';

const GodEquationBanner = ({ profileBorderColor }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });

        let animationFrame;
        let time = 0;

        // Configuration
        const RING_COUNT = 6;
        const SEGMENTS = 64;

        // Brand Colors Helper
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#7FFFD4');
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 127, g: 255, b: 212 };
        };

        const render = () => {
            time += 0.008;

            // Resize logic
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
            }
            const w = canvas.width;
            const h = canvas.height;

            // Clear
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            // Setup Style
            const baseColor = profileBorderColor || '#7FFFD4';
            const rgb = hexToRgb(baseColor);

            ctx.lineWidth = 1.5 * dpr;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Function to Draw a SINGLE Gyroscope
            const drawGyroscope = (centerX, centerY, mirrored) => {
                const project = (x, y, z) => {
                    const perspective = 1000 / (1000 + z);
                    return {
                        x: centerX + x * perspective,
                        y: centerY + y * perspective,
                        s: perspective
                    };
                };

                const breathe = Math.sin(time * 0.5) * 0.1 + 1;
                const tiltX = time * 0.2 * (mirrored ? -1 : 1); // Reverse tilt if mirrored
                const tiltY = time * 0.13;
                const rotZ = time * 0.05 * (mirrored ? -1 : 1); // Reverse spin if mirrored

                for (let i = 0; i < RING_COUNT; i++) {
                    const layerProgress = i / (RING_COUNT - 1);
                    const radius = (h * 0.45) * (1 - layerProgress * 0.6) * breathe; // Slightly larger for impact

                    const ringTiltX = tiltX + (i * Math.PI / RING_COUNT);
                    const ringTiltY = tiltY + (i * Math.PI / 2);

                    ctx.beginPath();
                    for (let j = 0; j <= SEGMENTS; j++) {
                        const theta = (j / SEGMENTS) * Math.PI * 2;

                        let x = Math.cos(theta) * radius;
                        let y = Math.sin(theta) * radius;
                        let z = 0;

                        // Rotate X
                        let ty = y * Math.cos(ringTiltX) - z * Math.sin(ringTiltX);
                        let tz = y * Math.sin(ringTiltX) + z * Math.cos(ringTiltX);
                        y = ty; z = tz;

                        // Rotate Y
                        let tx = x * Math.cos(ringTiltY) + z * Math.sin(ringTiltY);
                        tz = -x * Math.sin(ringTiltY) + z * Math.cos(ringTiltY);
                        x = tx; z = tz;

                        // Rotate Z
                        tx = x * Math.cos(rotZ) - y * Math.sin(rotZ);
                        ty = x * Math.sin(rotZ) + y * Math.cos(rotZ);
                        x = tx; y = ty;

                        const p = project(x, y, z);

                        if (j === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    }
                    ctx.closePath();

                    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - layerProgress * 0.8})`;
                    ctx.shadowBlur = (15 - i * 2) * dpr;
                    ctx.shadowColor = baseColor;
                    ctx.stroke();

                    // Nodes
                    const nodeCount = 3 + i;
                    for (let n = 0; n < nodeCount; n++) {
                        const theta = (n / nodeCount) * Math.PI * 2 + (time * (i % 2 === 0 ? 1 : -1) * (mirrored ? -1 : 1));

                        let x = Math.cos(theta) * radius;
                        let y = Math.sin(theta) * radius;
                        let z = 0;

                        // Rotate X
                        let ty = y * Math.cos(ringTiltX) - z * Math.sin(ringTiltX);
                        let tz = y * Math.sin(ringTiltX) + z * Math.cos(ringTiltX);
                        y = ty; z = tz;

                        // Rotate Y
                        let tx = x * Math.cos(ringTiltY) + z * Math.sin(ringTiltY);
                        tz = -x * Math.sin(ringTiltY) + z * Math.cos(ringTiltY);
                        x = tx; z = tz;

                        // Rotate Z
                        tx = x * Math.cos(rotZ) - y * Math.sin(rotZ);
                        ty = x * Math.sin(rotZ) + y * Math.cos(rotZ);
                        x = tx; y = ty;

                        const p = project(x, y, z);

                        ctx.beginPath();
                        ctx.fillStyle = '#FFFFFF';
                        ctx.shadowBlur = 10 * dpr;
                        ctx.shadowColor = '#FFFFFF';
                        ctx.arc(p.x, p.y, 1.5 * dpr * p.s, 0, Math.PI * 2);
                        ctx.fill();

                        if (i === 0) {
                            ctx.beginPath();
                            ctx.moveTo(centerX, centerY);
                            ctx.lineTo(p.x, p.y);
                            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
                            ctx.lineWidth = 1;
                            ctx.shadowBlur = 0;
                            ctx.stroke();
                        }
                    }
                }

                // Central Singularity
                const pulse = (Math.sin(time * 3) + 1) / 2;
                ctx.beginPath();
                ctx.fillStyle = '#FFFFFF';
                ctx.shadowColor = baseColor;
                ctx.shadowBlur = (20 + pulse * 20) * dpr;
                ctx.arc(centerX, centerY, (2 + pulse * 1) * dpr, 0, Math.PI * 2);
                ctx.fill();
            };

            // Calculate Positions relative to Canvas Width
            // Left Gyroscope (shifted more towards edge to clear center)
            drawGyroscope(w * 0.15, h * 0.4, false);

            // Right Gyroscope
            drawGyroscope(w * 0.85, h * 0.4, true);

            // Optional: Subtle connection line between the two? No, keep it clean.

            animationFrame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [profileBorderColor]);

    return (
        <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
            />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.8) 100%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default GodEquationBanner;
