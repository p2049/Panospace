
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- THE SPECTRUM (Panospace Prism) ---
// Concept: Pure Light Physics. A single beam of white data hits a crystal
//          and fractures into the Panospace Brand Palette.
// Visual: Dark Side of the Moon aesthetic, but hyper-modern/digital.
//         Volumetric lighting, caustics, dispersion.
// Colors: White -> [Ion Blue, Solar Pink, Aurora Mint, Deep Orbit Purple].
// Vibe: "Purity", "Clarity", "The Source of Color".

const SpectrumBanner = () => { // Keeps filename
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

        // 1. VOID BACKGROUND (Deep Space)
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#020205');
        bg.addColorStop(1, '#000000');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // 2. THE CRYSTAL (Triangle)
        // Positioned slightly center
        const triSize = 500;
        const p1 = { x: cx, y: cy - triSize * 0.866 * 0.6 }; // Top
        const p2 = { x: cx - triSize / 2, y: cy + triSize * 0.866 * 0.4 }; // Bottom Left
        const p3 = { x: cx + triSize / 2, y: cy + triSize * 0.866 * 0.4 }; // Bottom Right

        // Draw Crystal Body (Glassy)
        const drawCrystal = () => {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.closePath();

            // Glass Gradient
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p3.y);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
            ctx.fillStyle = grad;
            ctx.fill();

            // Edges (Sharp)
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.stroke();

            // Inner reflections
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y + 20);
            ctx.lineTo(p2.x + 20, p2.y - 10);
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.stroke();

            ctx.restore();
        };

        // 3. THE INPUT BEAM (Pure White Data)
        // Coming from Left-Top
        const startX = -100;
        const startY = cy + 100;
        const hitX = cx - triSize * 0.25; // Hit left face roughly
        const hitY = cy + 50;

        const drawInputBeam = () => {
            ctx.save();

            // Core Beam
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(hitX, hitY);

            ctx.lineWidth = 6;
            ctx.strokeStyle = '#FFFFFF';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 20;
            ctx.stroke();

            // Glow
            ctx.lineWidth = 20;
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.shadowBlur = 40;
            ctx.stroke();

            ctx.restore();
        };

        // 4. THE DISPERSION (Rainbow Output)
        // Exiting Right Face
        const outX = cx + triSize * 0.25;
        const outY = hitY; // Assume straight pass for abstract logic

        // Brand Colors to emit
        const spectrum = [
            COLORS.deepOrbitPurple,
            COLORS.ionBlue,
            COLORS.auroraMint,
            COLORS.stellarOrange, // Swapped
            COLORS.solarPink      // Swapped
        ];

        const drawSpectrum = () => {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            spectrum.forEach((color, i) => {
                const spread = (i - 2) * 50; // Y spread
                const endX = w + 100;
                const endY = outY + spread * 8 + (Math.sin(i) * 200); // Fan out

                ctx.beginPath();
                ctx.moveTo(outX, outY);
                // Quadratic bezier for fluid light curve
                ctx.quadraticCurveTo(cx + 400, outY + spread, endX, endY);

                ctx.lineWidth = 8;
                ctx.strokeStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 30;
                ctx.stroke();

                // Secondary wide glow
                ctx.lineWidth = 40;
                ctx.strokeStyle = color.replace(')', ', 0.2)').replace('rgb', 'rgba'); // Hacky opacity
                ctx.globalAlpha = 0.3;
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            });
            ctx.restore();
        };

        // 5. INTERNAL REFRACTION (Inside Crystal)
        const drawRefraction = () => {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.beginPath();
            ctx.moveTo(hitX, hitY);
            ctx.lineTo(outX, outY);
            ctx.lineWidth = 10;
            // Complex gradient inside
            const grad = ctx.createLinearGradient(hitX, hitY, outX, outY);
            grad.addColorStop(0, '#FFF');
            grad.addColorStop(0.5, COLORS.auroraMint);
            grad.addColorStop(1, COLORS.solarPink);
            ctx.strokeStyle = grad;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFF';
            ctx.stroke();
            ctx.restore();
        };

        // RENDER ORDER
        drawInputBeam();
        drawCrystal();     // Draw crystal body first
        drawRefraction();  // Light inside
        drawSpectrum();    // Light output

        // Redraw crystal edges on top for sharpness
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.stroke();

        // Caustics / Sparkles on corners
        const spark = (x, y, color) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, 60);
            g.addColorStop(0, '#FFF');
            g.addColorStop(0.2, color);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(x, y, 60, 0, Math.PI * 2); ctx.fill();
        };
        spark(p1.x, p1.y, COLORS.ionBlue);
        spark(p2.x, p2.y, COLORS.deepOrbitPurple);
        spark(p3.x, p3.y, COLORS.solarPink);
        ctx.restore();

        // 6. ATMOSPHERE
        // Subtle dust
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        for (let i = 0; i < 300; i++) {
            const dx = Math.random() * w;
            const dy = Math.random() * h;
            // Only near light path
            const distY = Math.abs(dy - h / 2);
            if (distY < 400 || Math.random() > 0.8) {
                const s = Math.random() * 2;
                ctx.beginPath(); ctx.arc(dx, dy, s, 0, Math.PI * 2); ctx.fill();
            }
        }

        // 7. VIGNETTE
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

export default SpectrumBanner;
