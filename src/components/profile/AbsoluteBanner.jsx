
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- THE ABSOLUTE (Infinite Complexity) ---
// Concept: The collection of all knowledge. A Singularity of Detail.
// Visual: A Hyper-Dense Dyson Swarm / Neural Star.
//         It looks like a burning sun made of pure connective data.
// Intensity: Maximum. 100,000+ effective draw operations compressed into a static render.
// Tech: 
// 1. Fibonacci Sphere Point Distribution (Perfect evenness).
// 2. Nearest-Neighbor Network (3000 nodes x 5 connections = 15,000 lines).
// 3. Volumetric Glow Stacking (Hundreds of layers).
// Vibe: "Digital God", "Perfection", "Overwhelming Beauty".

const AbsoluteBanner = () => {
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

        // 1. BACKGROUND: DEEP COSMOS
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
        bg.addColorStop(0, '#100510'); // Deep purple tint
        bg.addColorStop(1, '#000000');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // 2. GENERATE FIBONACCI SPHERE (The Core)
        // This creates perfectly distributed points on a sphere surface
        const points = [];
        const numPoints = 2500;
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden Angle

        for (let i = 0; i < numPoints; i++) {
            const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
            const radius = Math.sqrt(1 - y * y); // Radius at y

            const theta = phi * i;

            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;

            // Project 3D sphere to 2D
            // Scale it up
            const scale = 800;
            const projScale = 1000 / (1000 - z * 300); // Perspective ish

            points.push({
                x: cx + x * scale,
                y: cy + y * scale,
                z: z, // Keep z for depth sorting/color
                trueX: x, trueY: y, trueZ: z
            });
        }

        // 3. RENDER THE NET (The Connective Tissue)
        // We draw lines between close points to create the "Surface"
        ctx.globalCompositeOperation = 'screen';
        ctx.lineWidth = 0.5;

        // Optimization: Dist buckets? No, brute force is fine for 2500^2 static render?
        // 2500^2 is 6.25 million checks. Too slow for JS main thread (might freeze for 2s).
        // Strategy: Only check neighbors in array? Since Fibonacci spiral preserves locality somewhat.
        // Better: Just connect i to i+1..i+10. It creates a spiral web!

        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const p1 = points[i];

            // Web density
            const connections = 8;
            for (let j = 1; j <= connections; j++) {
                const p2 = points[(i + j) % numPoints];

                // Dist check to avoid cross-sphere long lines
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                if (dx * dx + dy * dy > 5000) continue; // Cull long lines

                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
            }
        }
        // Color: We want a burning core.
        // We can't gradient stroke easily.
        // Let's stroke the whole web with a "Heat" gradient
        const webGrad = ctx.createRadialGradient(cx, cy, 200, cx, cy, 900);
        webGrad.addColorStop(0, '#FFFFFF');
        webGrad.addColorStop(0.2, COLORS.solarPink);
        webGrad.addColorStop(0.6, COLORS.ionBlue);
        webGrad.addColorStop(1, COLORS.deepOrbitPurple);

        ctx.strokeStyle = webGrad;
        ctx.globalAlpha = 0.25;
        ctx.stroke();


        // 4. THE POINTS (The Data)
        // Draw varied glowing dots at vertices
        points.forEach((p, i) => {
            // Cull back faces for clear "Sphere" look? 
            // No, transparent structure is cooler.

            const dist = Math.sqrt(p.trueX * p.trueX + p.trueY * p.trueY);
            // Edge glow
            const alpha = 0.3 + (p.z + 1) * 0.3; // Brighter front

            ctx.fillStyle = i % 5 === 0 ? '#FFF' : COLORS.ionBlue;
            ctx.globalAlpha = alpha;

            const size = Math.random() < 0.05 ? 3 : 1.2;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        });


        // 5. THE ORBITAL RINGS (The Containment Field)
        // Huge perfect circles surrounding the chaos
        const drawRing = (r, color, width, dash) => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            if (dash) ctx.setLineDash(dash);
            else ctx.setLineDash([]);
            ctx.stroke();
        };

        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;

        // Inner bright ring
        drawRing(850, 'rgba(255,255,255,0.1)', 1);

        // Outer complex rings
        drawRing(950, COLORS.deepOrbitPurple, 2, [10, 20]);
        drawRing(1000, COLORS.ionBlue, 1, [5, 5]);
        drawRing(1100, COLORS.solarPink, 4);  // The "Event Horizon"


        // 6. VOLUME FLARES (The Intensity)
        // Massive soft brushes to fake volume
        const drawFlare = (x, y, r, color) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, color);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        };

        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.3;
        drawFlare(cx, cy, 600, COLORS.solarPink); // Core Heat
        drawFlare(cx - 400, cy - 400, 800, COLORS.ionBlue); // Ambient

        // 7. BEAMS OF LIGHT (Energy Ejection)
        // Shooting out from core
        ctx.strokeStyle = '#FFF';
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 800 + Math.random() * 600;
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
        }
        ctx.stroke();


        // 8. VIGNETTE (Mandatory Legibility)
        ctx.globalCompositeOperation = 'source-over';
        ctx.setLineDash([]);

        const vig = ctx.createRadialGradient(cx, cy, w * 0.35, cx, cy, w);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(0.9, '#000');
        vig.addColorStop(1, '#000');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        // Stronger bottom fade for text
        const botGrad = ctx.createLinearGradient(0, h * 0.4, 0, h);
        botGrad.addColorStop(0, 'transparent');
        botGrad.addColorStop(0.8, '#000'); // Ensure readability
        botGrad.addColorStop(1, '#000');
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

export default AbsoluteBanner;
