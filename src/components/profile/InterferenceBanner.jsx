
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- THE INTERFERENCE (Visual Hazard) ---
// Concept: "System Stability: 0%". A GPU meltdown in banner form.
// Visual: Extreme "Datamoshing", high-frequency Moiré patterns, and raw RGB splitting.
//         It is designed to be "Visually Jarring" and intense.
// Tech: 
// 1. Recursive Buffer Displacement (glitch).
// 2. High-Frequency Grid Interference (Moiré).
// 3. Chromatic Channel Explosion.
// Vibe: "Critical Error", "Reality Break", "10000000000% Intensity".

const InterferenceBanner = () => {
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

        // 1. BASE: HIGH CONTRAST STATIC
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        // 2. GENERATE RAW GEOMETRY (To be destroyed)
        // Draw massive solid shapes of pure brand color
        const drawShapes = () => {
            for (let i = 0; i < 50; i++) {
                ctx.fillStyle = i % 2 === 0 ? '#FFF' : COLORS.deepOrbitPurple;
                const sx = Math.random() * w;
                const sy = Math.random() * h;
                const s = Math.random() * 800 + 200;
                ctx.fillRect(sx - s / 2, sy - s / 2, s, s);

                ctx.strokeStyle = Math.random() > 0.5 ? COLORS.ionBlue : COLORS.solarPink;
                ctx.lineWidth = 20;
                ctx.strokeRect(sx - s / 2, sy - s / 2, s, s);
            }

            // Concentric circles center
            for (let r = 100; r < 1500; r += 50) {
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.lineWidth = r % 100 === 0 ? 50 : 10;
                ctx.strokeStyle = (r / 50) % 2 === 0 ? '#FFF' : '#000';
                ctx.stroke();
            }
        };
        drawShapes();

        // 3. THE MOIRE GRID (The "Jarring" vibrance)
        // Overlay a dense pattern that hurts the eyes slightly (Op Art)
        const drawMoire = () => {
            ctx.globalCompositeOperation = 'difference'; // Invert colors
            const density = 8;
            ctx.lineWidth = 4;

            // Layer 1: Vertical
            ctx.beginPath();
            for (let x = -w; x < w * 2; x += density) {
                ctx.moveTo(x, 0); ctx.lineTo(x + w * 0.5, h); // Slanted
            }
            ctx.strokeStyle = '#FFF';
            ctx.stroke();

            // Layer 2: Opposing
            ctx.beginPath();
            for (let x = -w; x < w * 2; x += density) {
                ctx.moveTo(x, h); ctx.lineTo(x + w * 0.5, 0);
            }
            ctx.stroke();
        };
        drawMoire();

        // 4. DIGITAL DESTRUCTION (Glitch Pass)
        // Note: Canvas doesn't let us read/write easy without GetImageData (slow).
        // We will simulate glitch by drawing randomized "Stripes" of the scene 
        // over itself with offsets using `drawImage(canvas, ...)`

        const glitchPass = (intensity) => {
            ctx.globalCompositeOperation = 'source-over';

            for (let i = 0; i < intensity; i++) {
                // Pick a slice
                const sh = Math.random() * 100 + 10; // Slice height
                const sy = Math.random() * (h - sh);

                // Displace X
                const dx = (Math.random() - 0.5) * 400;

                // Displace Y (Vertical Sync Fail)
                const dy = (Math.random() - 0.5) * 50;

                // Copy slice to new pos
                // drawImage(params: image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
                // We use the canvas itself as source!
                ctx.drawImage(canvas, 0, sy, w, sh, dx, sy + dy, w, sh);

                // Chromatic Aberration Simulation
                // Draw color overlay multiply
                if (Math.random() > 0.7) {
                    ctx.globalCompositeOperation = 'multiply';
                    ctx.fillStyle = Math.random() > 0.5 ? COLORS.solarPink : COLORS.ionBlue;
                    ctx.fillRect(dx, sy + dy, w, sh);
                    ctx.globalCompositeOperation = 'source-over';
                }
            }
        };

        glitchPass(150); // Heavy destruction

        // 5. RGB CHANNEL EXPLOSION
        // We can't actually separate channels easily 2D. 
        // We simulate it by drawing the entire canvas over itself with color blends.

        const rgbSplit = () => {
            // Save current state
            // We can't really "save" efficiently 4k. 
            // We just draw large geometric overlays in Screen Mode that look like ghosts.

            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.5;

            // Blue Drift
            ctx.drawImage(canvas, -20, 0); // Shift left
            ctx.fillStyle = COLORS.ionBlue;
            ctx.globalCompositeOperation = 'multiply'; // Tint it blue? No simple way.
            // Let's just draw raw noise blocks.
        };
        // Skip complex RGB split for perf, GlitchPass did enough.

        // 6. "THE TEAR" (White Void)
        // A jagged rip through the center
        /*
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        let tx = 0; let ty = cy;
        ctx.moveTo(tx, ty);
        while (tx < w) {
            tx += Math.random() * 50;
            ty = cy + (Math.random() - 0.5) * 300;
            ctx.lineTo(tx, ty);
        }
        ctx.lineWidth = 10;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FFF';
        ctx.strokeStyle = '#FFF';
        ctx.stroke();
        */


        // 7. VIGNETTE (Essential for text)
        ctx.globalCompositeOperation = 'source-over';
        const vig = ctx.createRadialGradient(cx, cy, w * 0.3, cx, cy, w);
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

export default InterferenceBanner;
