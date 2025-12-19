
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- THE RESONANCE 3.0 (Purple Haze) ---
// Concept: "The Sound of the Universe".
// Visual: High-fidelity Chladni Plate visualization.
// Palette: 
// - Core: White
// - Inner Ring: Deep Purple (Replacing Gold)
// - Mid Ring: Ion Blue
// - Outer Ring: Solar Pink (Replacing Purple)
// Spacing: Expanded scale (more breathing room).

const ResonanceBanner = () => {
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

        // 1. BACKGROUND (Deep Space Void)
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
        bg.addColorStop(0, '#0a050f'); // Deep Purple tint
        bg.addColorStop(1, '#000000');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // 2. CYMATICS MATH (Spaced Out)
        // Calculates the vibration height
        const getVibration = (x, y, n, m) => {
            // Increased scale for "Spaced Out" feel (550 -> 750)
            const scale = 750;
            const nx = (x - cx) / scale;
            const ny = (y - cy) / scale;
            return Math.cos(n * nx) * Math.cos(m * ny) - Math.cos(m * nx) * Math.cos(n * ny);
        };

        // 3. GENERATE STARDUST
        const particles = [];
        const particleCount = 40000;

        // Mode Select
        const n = 7;
        const m = 11;

        for (let i = 0; i < particleCount; i++) {
            let px = Math.random() * w;
            let py = Math.random() * h;

            // Bias (Wider range now)
            if (Math.hypot(px - cx, py - cy) > 1200) {
                const ang = Math.random() * Math.PI * 2;
                const r = Math.random() * 1200;
                px = cx + Math.cos(ang) * r;
                py = cy + Math.sin(ang) * r;
            }

            // High-precision simulation step
            for (let step = 0; step < 25; step++) {
                const v = getVibration(px, py, n, m);
                const kick = Math.abs(v) * 20; // Stronger kick for cleaner lines
                px += (Math.random() - 0.5) * kick;
                py += (Math.random() - 0.5) * kick;
            }

            particles.push({ x: px, y: py });
        }

        // 4. RENDER PARTICLES (Purple Core -> Pink Edge)
        ctx.globalCompositeOperation = 'screen';

        particles.forEach(p => {
            const dist = Math.hypot(p.x - cx, p.y - cy);
            const maxDist = 1100; // Wider max dist
            const normDist = dist / maxDist;

            if (normDist > 1) return;

            // New Requested Palette
            let color = '#FFF';
            // Center = Bright White
            if (normDist < 0.1) color = '#FFFFFF';
            // Inner = Deep Purple (Was Gold)
            else if (normDist < 0.4) color = COLORS.deepOrbitPurple;
            // Mid = Ion Blue (Kept)
            else if (normDist < 0.7) color = COLORS.ionBlue;
            // Outer = Solar Pink (Was Purple)
            else color = COLORS.solarPink;

            ctx.fillStyle = color;

            // Draw
            const size = Math.random() * 1.5 + 0.4;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        });

        // 5. ENERGY NODES (Glowing Intersections)
        ctx.globalAlpha = 0.5;
        const gridSize = 4;
        for (let x = 0; x < w; x += gridSize) {
            for (let y = 0; y < h; y += gridSize) {
                if (Math.abs(x - cx) > 1100 || Math.abs(y - cy) > 1100) continue;

                const v = getVibration(x, y, n, m);
                if (Math.abs(v) > 1.95) {
                    // Peak Amplitude - Pink/Purple highlights
                    ctx.fillStyle = Math.random() > 0.5 ? '#FFF' : COLORS.solarPink;
                    ctx.fillRect(x, y, 1.5, 1.5);
                }
            }
        }
        ctx.globalAlpha = 1.0;

        // 6. RINGS (Wider)
        const drawRing = (r, color, width) => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
        };

        // Purple Rings
        drawRing(850, `rgba(90, 63, 255, 0.3)`, 1); // Purple

        // Pink Outer Ring
        drawRing(900, `rgba(255, 92, 138, 0.2)`, 4); // Pink

        // 7. GLITCH TEXT
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'center';
        ctx.fillText('FREQ: 963HZ [COSMIC]', cx, cy + 950);

        // 8. VIGNETTE
        ctx.globalCompositeOperation = 'source-over';
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
            background: '#0a000f',
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

export default ResonanceBanner;
