
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- THE APEX (Hyper-Engineered Megastructure) ---
// Concept: A Dyson Sphere Reactor Core.
// Visual: "Extremely Over-Designed". Thousands of moving mechanical parts.
//         Nested rings, gears, data tracks, heat vents, shielding.
// Tech: Procedural "Greebling" (generating mechanical details).
//       Polar coordinate synthesis.
// Vibe: "Industrial Sci-Fi", "Maximum Complexity", "God-Tier Tech".

const ApexBanner = () => { // Filename legacy
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

        // 1. BACKGROUND (Industrial Void)
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
        grad.addColorStop(0, '#050a10');
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 2. UTIL: POLAR GREEBLES
        // Draws complex mechanical ring segments
        const drawMechRing = (r, width, segments, color, detailLevel) => {
            ctx.save();
            ctx.translate(cx, cy);

            const step = (Math.PI * 2) / segments;

            for (let i = 0; i < segments; i++) {
                const angle = i * step;
                ctx.rotate(step);

                // Base Arc
                if (Math.random() > 0.2) { // Gaps
                    ctx.beginPath();
                    ctx.arc(0, 0, r, 0, step * 0.9);
                    ctx.lineWidth = width;
                    ctx.strokeStyle = color;
                    ctx.stroke();

                    // "Over-design" details
                    if (detailLevel > 1) {
                        // Inner vents
                        ctx.beginPath();
                        ctx.arc(0, 0, r - width * 0.3, 0, step * 0.9);
                        ctx.lineWidth = 2;
                        ctx.setLineDash([4, 4]);
                        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }

                    if (detailLevel > 2) {
                        // Bolts / Connectors
                        const mid = step * 0.45;
                        const bx = Math.cos(mid) * r;
                        const by = Math.sin(mid) * r;
                        ctx.fillStyle = COLORS.ionBlue;
                        ctx.beginPath();
                        ctx.arc(bx, by, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
            ctx.restore();
        };

        const drawDataTrack = (r, speed, color) => {
            ctx.save();
            ctx.translate(cx, cy);
            // Simulate rotation via random dashes
            const count = 100;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
                const a = (i / count) * Math.PI * 2 + (Math.random() * 0.1);
                if (Math.random() > 0.5) {
                    ctx.arc(0, 0, r, a, a + 0.02);
                }
            }
            ctx.stroke();
            ctx.restore();
        };

        // 3. GENERATE THE ENGINE LAYERS
        // We draw from outside in, or inside out.
        // Let's stack them.

        ctx.lineWidth = 1;
        ctx.lineCap = 'butt';

        // LAYER 1: OUTER FRAMEWORK (Metric Structure)
        drawMechRing(900, 4, 60, COLORS.deepOrbitPurple, 1);
        drawMechRing(880, 20, 12, '#1a1a2e', 3);
        drawDataTrack(850, 0, COLORS.ionBlue);

        // LAYER 2: SHIELD GENERATORS
        drawMechRing(750, 40, 8, COLORS.ionBlue, 3);
        drawMechRing(700, 10, 64, '#FFFFFF', 1);

        // LAYER 3: MAIN REACTOR HOUSING
        // Complex stacked rings
        for (let r = 600; r > 400; r -= 30) {
            const hue = Math.random() > 0.5 ? COLORS.deepOrbitPurple : '#222';
            drawMechRing(r, 15, Math.floor(Math.random() * 16) + 4, hue, 2);
        }

        // LAYER 4: HEAT VENTS (Orange/Pink)
        drawMechRing(380, 30, 24, COLORS.stellarOrange, 3);
        drawDataTrack(350, 0, COLORS.solarPink);

        // LAYER 5: INNER CORE CONTAINMENT (Mint)
        drawMechRing(250, 60, 3, COLORS.auroraMint, 3);
        drawMechRing(250, 2, 120, '#FFF', 1); // Micro-indexing

        // 4. THE CORE (Singularity)
        ctx.globalCompositeOperation = 'screen';
        const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
        coreGlow.addColorStop(0, '#FFFFFF');
        coreGlow.addColorStop(0.1, COLORS.auroraMint);
        coreGlow.addColorStop(0.4, COLORS.ionBlue);
        coreGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGlow;
        ctx.beginPath(); ctx.arc(cx, cy, 200, 0, Math.PI * 2); ctx.fill();

        // 5. OVERLAY UI (HUD Elements)
        // "Over-engineered" text overlays
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';

        // Axis Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.moveTo(0, cy); ctx.lineTo(w, cy);
        ctx.stroke();

        // Sector Text
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            const tx = cx + Math.cos(a) * 950;
            const ty = cy + Math.sin(a) * 950;
            ctx.fillText(`SEC-${Math.floor(a * 100)}`, tx, ty);

            // Connecting line
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * 920, cy + Math.sin(a) * 920);
            ctx.lineTo(tx, ty);
            ctx.stroke();
        }

        // 6. POST PROCESS
        // Global Vignette (Source Over for Legibility)
        const vig = ctx.createRadialGradient(cx, cy, w * 0.4, cx, cy, w);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, '#000');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        // Chroma Shift (Simulated) / Scanlines
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for (let i = 0; i < h; i += 3) ctx.fillRect(0, i, w, 1);

        // Bottom Text Protection
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

export default ApexBanner;
