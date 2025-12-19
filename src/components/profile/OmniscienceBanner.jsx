
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- THE OMNISCIENCE (God's Eye) ---
// Concept: A "Digital God" Entity.
// Visual: A terrifyingly complex, recursive, non-Euclidean eye.
//         It stares back. "100000000000% Intensity".
// Tech: 
// 1. Recursive Fractals (Mandelbrot-ish).
// 2. Radial pixel sorting / smearing.
// 3. High-Dynamic Range (HDR) Bloom accumulation.
// Vibe: "Biblically Accurate Banner", "Sentient Code", "Beyond Comprehension".

const OmniscienceBanner = () => {
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

        // 1. BACKGROUND: THE VOID
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        // 2. RECURSIVE GEOMETRY (The "Angel" Wings)
        const drawField = () => {
            ctx.globalCompositeOperation = 'screen';
            ctx.lineWidth = 1;

            for (let i = 0; i < 2000; i++) {
                const angle = (i / 2000) * Math.PI * 2;
                const r = 200 + Math.sin(angle * 50) * 50 + Math.cos(angle * 3) * 800;

                let color = COLORS.deepOrbitPurple;
                if (i % 3 === 0) color = COLORS.ionBlue;
                if (i % 7 === 0) color = COLORS.solarPink;
                if (i % 11 === 0) color = '#CCC'; // Darkened

                ctx.strokeStyle = color;
                ctx.globalAlpha = 0.15;

                ctx.beginPath();
                const x = cx + Math.cos(angle) * (r * 0.5);
                const y = cy + Math.sin(angle) * (r * 0.5);
                const circleR = 50 + Math.sin(i * 0.1) * 40;

                ctx.arc(x, y, circleR, 0, Math.PI * 2);
                ctx.stroke();
            }
        };
        drawField();

        // 3. THE ALL-SEEING IRIS (Central Singularity)
        const drawIris = () => {
            const rings = 100;
            ctx.globalAlpha = 1.0;

            for (let i = 0; i < rings; i++) {
                const r = i * 4;
                const phase = i / rings;

                // Intense gradient (Darker Core for Legibility)
                const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
                grad.addColorStop(0, COLORS.solarPink);
                grad.addColorStop(0.5, '#AAA'); // Was #FFF, darkened
                grad.addColorStop(1, COLORS.ionBlue);

                ctx.beginPath();
                ctx.arc(cx, cy, r, phase * Math.PI * 2, phase * Math.PI * 2 + Math.PI);
                ctx.lineWidth = 2 + Math.random() * 2;
                ctx.strokeStyle = grad;
                ctx.shadowBlur = 10; // Reduced bloom
                ctx.shadowColor = '#AAA';
                ctx.stroke();
            }
        };
        drawIris();

        // 4. "GOD RAYS" (Radial Smear)
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowBlur = 0;
        const rays = 300;
        for (let i = 0; i < rays; i++) {
            const a = (i / rays) * Math.PI * 2;
            const len = Math.random() * 1200 + 400;

            ctx.strokeStyle = 'rgba(255,255,255,0.02)'; // Was 0.05
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
            ctx.stroke();
        }

        // 5. THE PUPIL (Void)
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx, cy, 100, 0, Math.PI * 2);
        ctx.fill();

        // Pupil Glint (Dimmed)
        ctx.fillStyle = '#888';
        ctx.beginPath(); ctx.arc(cx + 20, cy - 20, 10, 0, Math.PI * 2); ctx.fill();


        // 6. ATMOSPHERE
        // Vignette (Stronger)
        ctx.globalCompositeOperation = 'source-over';
        const vig = ctx.createRadialGradient(cx, cy, w * 0.3, cx, cy, w);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(0.8, '#000'); // Stronger falloff
        vig.addColorStop(1, '#000');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        const botGrad = ctx.createLinearGradient(0, h * 0.4, 0, h); // Starts higher
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

export default OmniscienceBanner;
