
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- THE FLUX 2.0 (Digital Silk) ---
// Concept: A flowing fabric of liquid metal.
// Visual: Thousands of parallel chrome strands moving in harmonic waves.
//         They create a shimmering, moire-like interference pattern.
// Tech: 3D Sine Wave Surface projected to 2D splines.
//       "Anisotropic Shimmy" shading.
// Vibe: "Premium", "Silk", "Flow", "Viral Satisfying".

const FluxBanner = () => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = 3840;
        const h = 2160;
        canvas.width = w;
        canvas.height = h;

        const cx = w * 0.5;
        const cy = h * 0.5;

        // 1. BACKGROUND (Deep Lux)
        // Dark, rich backdrop to let the chrome pop
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#050510');
        bg.addColorStop(1, '#000000');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // 2. GENERATE SILK STRANDS
        // We draw many parallel lines across the screen X.
        // Y is modulated by noise/sine.

        const strandCount = 120; // High density
        const pointsPerStrand = 100;

        // Perlin-ish Logic
        const noise = (x, z) => {
            return Math.sin(x * 0.002 + z * 0.005) * Math.cos(z * 0.01) * 400;
        };

        const drawSilk = () => {

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Loop Z (Front to Back)
            for (let z = 0; z < strandCount; z++) {
                // Parallax / Depth factors
                const depth = z / strandCount; // 0 (front) to 1 (back)
                if (depth > 0.8) continue; // Cull far back

                const yOffset = (z - strandCount / 2) * 30; // Spread vertically

                ctx.beginPath();
                let started = false;

                // Color Logic (Iridescence)
                // Front strands are White/Blue. Mid are Pink/Purple. Back are Dark.
                let strokeColor;
                if (depth < 0.2) strokeColor = '#FFFFFF';
                else if (depth < 0.4) strokeColor = COLORS.ionBlue;
                else if (depth < 0.6) strokeColor = COLORS.solarPink;
                else strokeColor = COLORS.deepOrbitPurple;

                // Metallic Gradient Stroke hack
                // We can't do gradient stroke easily on disjoint path.
                // We'll use a fixed color but modulate alpha/width.

                // To make it look "Chrome", we need to draw it MULTIPLE times? 
                // No, just draw distinct high-contrast lines.

                const drawPoints = [];
                for (let x = -200; x < w + 200; x += (w / pointsPerStrand)) {
                    // 3D Wave Math
                    const yWave = noise(x, z * 50);

                    // Perspective projection approximation
                    const px = x;
                    const py = cy + yWave + yOffset * (1 + Math.sin(x * 0.001) * 0.5); // Pinch/Expand

                    drawPoints.push({ x: px, y: py });
                }

                // Catmull-Rom or simple line to
                ctx.moveTo(drawPoints[0].x, drawPoints[0].y);
                for (let i = 1; i < drawPoints.length - 2; i++) {
                    const xc = (drawPoints[i].x + drawPoints[i + 1].x) / 2;
                    const yc = (drawPoints[i].y + drawPoints[i + 1].y) / 2;
                    ctx.quadraticCurveTo(drawPoints[i].x, drawPoints[i].y, xc, yc);
                }

                // Styling
                ctx.lineWidth = 4 + (1 - depth) * 4; // Thinner at back
                ctx.strokeStyle = strokeColor;
                ctx.shadowBlur = 15;
                ctx.shadowColor = strokeColor;
                ctx.globalAlpha = 1.0 - depth;

                // Interlace logic (The "Weave")
                // Only draw segments?
                // No, full lines.

                // Layer blending
                // globalComposite 'screen' makes them glow when overlapping
                ctx.globalCompositeOperation = 'screen';
                ctx.stroke();

                // Highlight Pass (The "Sheen")
                // Draw a thinner white line on top
                ctx.lineWidth = 1 + (1 - depth) * 2;
                ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                ctx.shadowBlur = 0;
                ctx.globalCompositeOperation = 'source-over';
                ctx.stroke();
            }
        };

        drawSilk();

        // 3. CHROMATIC ABERRATION ORBS (Foreground)
        // Floating glass droplets
        const drawOrb = (x, y, r, color) => {
            ctx.save();
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);

            // Glass Gradient
            const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
            g.addColorStop(0, 'rgba(255,255,255,0.9)');
            g.addColorStop(0.5, color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
            g.addColorStop(1, 'rgba(0,0,0,0.1)');

            ctx.fillStyle = g;
            ctx.fill();
            // Rim
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        };

        drawOrb(w * 0.8, h * 0.3, 80, COLORS.auroraMint);
        drawOrb(w * 0.2, h * 0.7, 120, COLORS.solarPink);


        // 4. ATMOSPHERE
        // Bottom fog
        const fog = ctx.createLinearGradient(0, h * 0.5, 0, h);
        fog.addColorStop(0, 'transparent');
        fog.addColorStop(1, COLORS.deepOrbitPurple);
        ctx.fillStyle = fog;
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, w, h);

        // 5. VIGNETTE
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        const vig = ctx.createRadialGradient(cx, cy, w * 0.4, cx, cy, w);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, '#000');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        const botGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
        botGrad.addColorStop(0, 'transparent');
        botGrad.addColorStop(1, '#000000');
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, 0, w, h);

        setBgImage(canvas.toDataURL('image/webp', 0.95));

    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#000000',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default FluxBanner;
