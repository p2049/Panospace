import React, { useRef, useEffect, useMemo } from 'react';

// Hash function
const hashStr = (str) => {
    let hash = 0;
    if (!str) return 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return hash;
};

// Seeded Random
const mulberry32 = (a) => {
    return () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const SeedOscillatorAvatar = ({ seed = 'panospace', color }) => {
    const canvasRef = useRef(null);

    // Generate params
    const params = useMemo(() => {
        const numericSeed = hashStr(seed);
        const rand = mulberry32(numericSeed);
        const hues = [160, 200, 280, 320, 10, 40];
        const baseHue = hues[Math.floor(rand() * hues.length)];

        return {
            fx: 1 + rand() * 4,
            fy: 1 + rand() * 4,
            fz: 1 + rand() * 4,
            amplitude: 0.38 + rand() * 0.08, // Max 0.46
            thickness: 2.0 + rand() * 2, // Thicker lines
            opacity: 0.9 + rand() * 0.1, // Very visible
            symmetry: Math.floor(rand() * 4),
            hue: baseHue,
            complexity: 300 + Math.floor(rand() * 300), // Clean but detailed
            mode: rand() > 0.5 ? 'lissajous' : 'oscillator'
        };
    }, [seed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Setup Canvas
        // Assume square-ish parent, but handle resize.
        // For static avatar, we just render once.
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        // High DPI
        const dpr = window.devicePixelRatio || 2;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const render = () => {
            ctx.clearRect(0, 0, w, h);

            // Transparent background (user requested glass effect to stay)
            // But we might want a faint glow behind the curve?
            // "background should stay glass like the default profile pic options"
            // The parent container handles the glass. We just need to be transparent or semi-transparent.

            // Faint glow center
            const cx = w / 2;
            const cy = h / 2;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
            grad.addColorStop(0, `hsla(${params.hue}, 80%, 50%, 0.2)`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const drawCurve = (offsetX = 0, offsetY = 0, scaleX = 1, scaleY = 1) => {
                ctx.save();
                ctx.translate(w / 2 + offsetX, h / 2 + offsetY);
                ctx.scale(scaleX, scaleY);
                ctx.lineWidth = params.thickness; // scale handling via DPI
                ctx.globalAlpha = params.opacity;
                ctx.shadowBlur = 10;

                // Color Logic
                const isMultiColor = color && (color.includes('gradient') || color === 'brand');
                if (!isMultiColor) {
                    const strokeColor = color && color.startsWith('#')
                        ? color
                        : `hsl(${params.hue}, 80%, 70%)`;
                    ctx.strokeStyle = strokeColor;
                    ctx.shadowColor = strokeColor;
                    ctx.beginPath();
                }

                const getPoint = (i) => {
                    const phi = (i / params.complexity) * Math.PI * 2;
                    let x, y, z;
                    // Simplify Z depth for avatar
                    // Use relative sizing to ensure fit
                    if (params.mode === 'lissajous') {
                        x = Math.sin(phi * params.fx) * (w * params.amplitude);
                        y = Math.cos(phi * params.fy) * (h * params.amplitude);
                        z = Math.sin(phi * params.fz) * (w * 0.2);
                    } else {
                        // Linear oscillator mode needing stricter bounds
                        // Range of (phi - PI) is -PI to PI (~3.14)
                        // Max width budget is w/2 (radius) = 0.5 * w
                        // So factor must be < 0.5 / 3.14 = 0.159
                        x = (phi - Math.PI) * (w * 0.12) + Math.sin(phi * params.fx) * (w * 0.05);
                        y = Math.sin(phi * params.fz) * (h * params.amplitude);
                        z = Math.cos(phi * params.fy) * (w * 0.2);
                    }
                    // Mild perspective
                    const fov = w * 3; // FOV relative to size
                    const perspective = fov / (fov + z + (w * 0.5)); // Safe Z shift
                    return { x: x * perspective, y: y * perspective };
                };

                for (let i = 0; i <= params.complexity; i++) {
                    const p = getPoint(i);
                    if (isMultiColor) {
                        if (i > 0) {
                            const prev = getPoint(i - 1);
                            const ratio = i / params.complexity;
                            const h_color = (params.hue + ratio * 120) % 360;
                            const strokeColor = `hsl(${h_color}, 80%, 70%)`;
                            ctx.beginPath();
                            ctx.strokeStyle = strokeColor;
                            ctx.shadowColor = strokeColor;
                            ctx.moveTo(prev.x, prev.y);
                            ctx.lineTo(p.x, p.y);
                            ctx.stroke();
                        }
                    } else {
                        if (i === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    }
                }
                if (!isMultiColor) ctx.stroke();
                ctx.restore();
            };

            drawCurve(0, 0, 1, 1);
            if (params.symmetry === 1 || params.symmetry === 3) drawCurve(0, 0, -1, 1);
            if (params.symmetry === 2 || params.symmetry === 3) drawCurve(0, 0, 1, -1);
            if (params.symmetry === 3) drawCurve(0, 0, -1, -1);
        };

        render();

    }, [params, color]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
        />
    );
};

export default SeedOscillatorAvatar;
