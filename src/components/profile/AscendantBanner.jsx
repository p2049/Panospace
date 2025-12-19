
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- THE NEURAL SPHERE (Formerly Ascendant) ---
// Concept: A "Ball of Energy" formed by thousands of flowing neural strands.
// Visual: Particles flow across the surface of a 3D sphere, leaving glowing trails.
// Tech: 3D Surface Flow Simulation projected to 2D.
// Vibe: The "Quintessence" of a digital mind.

const AscendantBanner = () => {
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

        // 1. VOID BACKGROUND
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
        grad.addColorStop(0, '#020002');
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 2. 3D NOISE FUNCTION (Simple Approx)
        const noise3D = (x, y, z) => {
            // Pseudo-random noise based on position
            const s = Math.sin(x * 0.5 + y * 0.4 + z * 0.3);
            const c = Math.cos(x * 0.3 - z * 0.5);
            return s * c;
        };

        // 3. DRAW SPHERE STRANDS
        // 3. DRAW SPHERE STRANDS
        const radius = 550; // Slightly smaller to allow unwinding room

        // Unwinding Logic:
        // Strands start on surface, then some break free and spiral out.

        const drawStrands = (colorFn, alpha, width, count, escapeProb, maxSteps) => {
            ctx.lineWidth = width;

            for (let i = 0; i < count; i++) {
                // Random Start on Sphere Surface
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);

                let x = radius * Math.sin(phi) * Math.cos(theta);
                let y = radius * Math.sin(phi) * Math.sin(theta);
                let z = radius * Math.cos(phi);

                let escaped = false;
                let escapeVel = { x: 0, y: 0, z: 0 };

                ctx.beginPath();

                // Project start
                const scale = 1000 / (1000 - z);
                ctx.moveTo(cx + x * scale, cy + y * scale);

                ctx.strokeStyle = colorFn(i);
                ctx.globalAlpha = alpha;
                ctx.globalCompositeOperation = 'screen';

                for (let s = 0; s < maxSteps; s++) {
                    // 1. Calculate Surface Flow (Curl Noise)
                    const nx = noise3D(x * 0.005, y * 0.005, z * 0.005 + 10);
                    const ny = noise3D(x * 0.005, y * 0.005 + 20, z * 0.005);
                    const nz = noise3D(x * 0.005 + 30, y * 0.005, z * 0.005);

                    // Move
                    x += nx * 6;
                    y += ny * 6;
                    z += nz * 6;

                    // 2. CHECK ESCAPE
                    if (!escaped && Math.random() < escapeProb) {
                        escaped = true;
                        // Calculate tangential velocity to fling it out
                        escapeVel = { x: nx * 10, y: ny * 10, z: nz * 10 };
                    }

                    if (escaped) {
                        // UNWINDING PHYSICS
                        // Spiral outward
                        x += escapeVel.x;
                        y += escapeVel.y;
                        z += escapeVel.z;

                        // Slowly expand outward from center
                        x *= 1.01; y *= 1.01; z *= 1.01;

                        // Accelerate slightly
                        escapeVel.x *= 1.005;
                        escapeVel.y *= 1.005;

                    } else {
                        // CONSTRAIN TO SURFACE (Perfect Sphere)
                        const mag = Math.sqrt(x * x + y * y + z * z);
                        x = (x / mag) * radius;
                        y = (y / mag) * radius;
                        z = (z / mag) * radius;
                    }

                    // Project
                    const pScale = 1200 / (1200 - z);
                    const pX = cx + x * pScale;
                    const pY = cy + y * pScale;

                    ctx.lineTo(pX, pY);

                    // Fade logic
                    if (z < -radius * 0.8) ctx.globalAlpha = alpha * 0.2;
                    else ctx.globalAlpha = alpha;

                    // If far off screen, stop
                    if (pX < -500 || pX > w + 500 || pY < -500 || pY > h + 500) break;
                }
                ctx.stroke();
            }
        };

        // LAYER 1: DEEP STRUCTURE (Purple/Blue) - Tighter, stays mostly on sphere
        drawStrands(
            () => Math.random() > 0.5 ? COLORS.deepOrbitPurple : COLORS.ionBlue,
            0.15, 3, 600, 0.001, 300
        );

        // LAYER 2: HIGHLIGHTS (Mint/Pink) - Unwinds frequently
        drawStrands(
            () => Math.random() > 0.5 ? COLORS.solarPink : COLORS.auroraMint,
            0.3, 1.5, 300, 0.008, 600
        );

        // LAYER 3: CORE ENERGY (White) - TIGHT core
        drawStrands(
            () => '#FFFFFF',
            0.5, 1, 100, 0.0, 200
        );

        // LAYER 4: THE LONG UNWINDERS (Stellar Orange / Mint) - Specially designed to go far
        drawStrands(
            () => Math.random() > 0.5 ? COLORS.stellarOrange : COLORS.classicMint,
            0.6, 1.2, 50, 0.02, 1200
        );

        // 4. OUTER GLOW / ATMOSPHERE
        const glow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5);
        glow.addColorStop(0, 'transparent');
        glow.addColorStop(0.5, 'rgba(27, 130, 255, 0.1)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.globalCompositeOperation = 'add';
        ctx.fillRect(0, 0, w, h);

        // 5. VIGNETTE
        ctx.globalCompositeOperation = 'multiply';
        const vig = ctx.createLinearGradient(0, 0, 0, h);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(0.6, 'transparent');
        vig.addColorStop(1, '#000');
        ctx.fillStyle = vig;
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

export default AscendantBanner;
