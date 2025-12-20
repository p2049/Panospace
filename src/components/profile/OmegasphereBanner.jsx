
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- THE OMEGASPHERE (The "Frontier" Banner) ---
// Concept: A Dyson Sphere of pure executable consciousness.
// Visuals: A recursive, ray-marched (simulated) sphere made of millions of data-shards.
//          It sits in a void of "Digital Flux" (Aurora/Nebula hybrid).
//          It has "Neural Tendrils" connecting to the edge of the frame.
// Tech: 
// - Simulated 3D projection onto 2D canvas.
// - High density particle system (CPU heavy generation, cached).
// - Complex layering of composite operations.
// Vibe: The Final Frontier of Computing.

const OmegasphereBanner = () => {
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
        const cy = h * 0.45;

        // 1. VOID SUBSTRATE (Deepest Digital Black)
        const voidGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
        voidGrad.addColorStop(0, '#020002');
        voidGrad.addColorStop(0.5, '#050205');
        voidGrad.addColorStop(1, '#000000');
        ctx.fillStyle = voidGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. THE DIGITAL FLUX (Background Nebula of Code)
        // We use thousands of tiny rectangles to simulate 'glitch fog'
        for (let i = 0; i < 4000; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const s = Math.random() * 4;

            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (dist < 500) continue; // Keep center clear for the Sphere

            ctx.fillStyle = Math.random() > 0.5 ? COLORS.deepOrbitPurple : COLORS.ionBlue;
            ctx.globalAlpha = (Math.random() * 0.1) + 0.02;
            ctx.fillRect(x, y, s, s * 4); // Vertical data bits
        }

        // 3. THE OMEGASPHERE (3D Point Cloud Projection)
        const density = 2500;
        const radius = 450;

        // Sphere function: Golden Spiral on Sphere surface
        // Fibonacci Sphere algorithm for even distribution
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        for (let i = 0; i < density; i++) {
            const y = 1 - (i / (density - 1)) * 2; // y goes from 1 to -1
            const rRadius = Math.sqrt(1 - y * y); // radius at y

            const theta = phi * i; // Golden angle increment

            const x = Math.cos(theta) * rRadius;
            const z = Math.sin(theta) * rRadius;

            // PROJECT TO 2D
            // Scale
            const scale = radius;
            const px = cx + x * scale;
            const py = cy + y * scale;

            // Perspective / Z-Depth Logic
            // Z goes from -1 (back) to 1 (front)
            // We map size and spread based on Z

            const size = 1.5 + (z + 1) * 2; // Front points bigger
            const alpha = 0.2 + (z + 1) * 0.4;

            if (z < -0.8) continue; // Cull back-most faces for visual clarity (Hollow look)

            // DRAW SHARD
            ctx.save();
            ctx.translate(px, py);

            // Rotate shard to face center
            const rot = Math.atan2(y, x);
            ctx.rotate(rot);

            // Top tier points (Front facing) now Mint instead of White
            ctx.fillStyle = z > 0.5 ? COLORS.auroraMint
                : (Math.random() > 0.5 ? COLORS.ionBlue : COLORS.solarPink);

            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation = 'screen';

            // "Digital Shard" shape (Trapezoid)
            ctx.beginPath();
            ctx.moveTo(-size, -size / 2);
            ctx.lineTo(size * 2, 0); // Point out
            ctx.lineTo(-size, size / 2);
            ctx.fill();

            ctx.restore();

            // CONNECTING NEURONS (If neighbors close)
            // ...too expensive for 2500 points n^2.
            // visual fake: random arcs from point to center if on rim
            if (rRadius > 0.95 && Math.random() > 0.95) {
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(cx, cy);
                ctx.strokeStyle = COLORS.auroraMint;
                ctx.lineWidth = 0.5;
                ctx.globalAlpha = 0.1;
                ctx.stroke();
            }
        }

        // 4. THE CORE PROCESSOR (Inside the Sphere)
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
        core.addColorStop(0, COLORS.ionBlue); // Blue core instead of white
        core.addColorStop(0.2, COLORS.auroraMint);
        core.addColorStop(0.5, 'transparent');

        ctx.fillStyle = core;
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.arc(cx, cy, 300, 0, Math.PI * 2);
        ctx.fill();

        // 5. ORBITAL RINGS (Holographic Interfaces)
        const drawHoloRing = (rad, tilt, color) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(tilt);
            ctx.scale(1, 0.2); // Flatten

            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.globalAlpha = 0.8;
            ctx.stroke();

            // Data notches
            ctx.setLineDash([10, 20]);
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.4;
            ctx.stroke();

            ctx.restore();
        };

        drawHoloRing(600, Math.PI / 4, COLORS.ionBlue);
        drawHoloRing(700, -Math.PI / 4, COLORS.deepOrbitPurple);
        drawHoloRing(900, 0, COLORS.solarPink); // Equator

        // 6. RAY TRACED BEAMS (Volumetric Lighting Rays)
        // Emanating from center out
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            const beamGrad = ctx.createLinearGradient(0, 0, w, 0);
            beamGrad.addColorStop(0, COLORS.auroraMint + '1A'); // Mint with low opacity (approx 0.1 hex is 1A)
            beamGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = beamGrad;
            ctx.globalCompositeOperation = 'screen';
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(w, -200);
            ctx.lineTo(w, 200);
            ctx.lineTo(0, 20);
            ctx.fill();

            ctx.restore();
        }

        // 7. VIGNETTE (Safety)
        ctx.globalCompositeOperation = 'multiply';
        const vig = ctx.createLinearGradient(0, 0, 0, h);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(0.5, 'transparent');
        vig.addColorStop(1, '#000');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        setBgImage(canvas.toDataURL('image/webp', 0.95));

    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#020002',
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

export default OmegasphereBanner;
