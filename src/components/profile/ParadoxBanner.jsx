
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- THE PARADOX (Hyper-Manifold) ---
// Concept: A visual representation of a Calabi-Yau dimensional fold.
// Visual: A 6-Dimensional object projected into 3D, then 2D. 
//         It looks like a "Liquid Crystal Flower" or "Alien Artifact".
//         It defies standard geometry (no cubes/spheres). 
//         It is asymmetrical, complex, and beautiful.
// Tech: Parametric Surface Generation with high-harmonic perturbation.
// Vibe: "Smashing Art Normalities", "Alien Genius", "Beautiful Math".

const ParadoxBanner = () => {
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

        const cy = h * 0.5;

        // 1. VOID BACKGROUND
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // 2. RENDER PIPELINE (Dual Objects)
        const renderObject = (cx, cy, phase) => {
            // Design Laws: Fidelity & Constants
            const uSteps = 160;
            const vSteps = 90;
            const PHI = 1.618; // The Golden Ratio

            // Generate Points for this instance
            const localPoints = [];

            for (let i = 0; i < uSteps; i++) {
                for (let j = 0; j < vSteps; j++) {
                    const u = (i / uSteps) * Math.PI * 2;
                    const v = (j / vSteps) * Math.PI;

                    // Manifold Math: "The Golden Flower"
                    // Base radius uses Golden Ratio harmonics for perfect organic proportion
                    const r = 300 + 100 * Math.sin(PHI * 3 * u + phase) * Math.cos(4 * v);

                    // Twist with PHI to avoid standing waves
                    const twist = Math.sin(3 * u + PHI * v + phase);

                    const x = r * Math.sin(v) * Math.cos(u);
                    const y = r * Math.sin(v) * Math.sin(u);
                    const z = r * Math.cos(v);

                    // Distortion
                    const dx = x + Math.sin(y * 0.01 + phase) * 100 * twist;
                    const dy = y + Math.cos(z * 0.01) * 100 * twist;
                    const dz = z + Math.sin(x * 0.01) * 100 * twist;

                    localPoints.push({ x: dx, y: dy, z: dz });
                }
            }

            // Project
            const project = (p) => {
                const t = 0.5 + phase * 0.5; // Different rotation
                const rotX = p.x * Math.cos(t) - p.z * Math.sin(t);
                const rotZ = p.x * Math.sin(t) + p.z * Math.cos(t);
                const rotY = p.y;

                const tilt = 0.6;
                const rY = rotY * Math.cos(tilt) - rotZ * Math.sin(tilt);
                const rZ = rotY * Math.sin(tilt) + rotZ * Math.cos(tilt);

                const scale = 1200 / (1200 - rZ);
                const px = cx + rotX * scale;
                // Move Y slightly based on phase for levitation diff
                const py = cy + rY * scale + Math.sin(phase) * 50;

                return { x: px, y: py, z: rZ };
            };

            const projPoints = localPoints.map(project);

            // Draw Lines
            ctx.lineWidth = 1;
            ctx.globalCompositeOperation = 'screen';

            const getColor = (i, j) => {
                const uNorm = i / uSteps;
                const vNorm = j / vSteps;

                // Invert colors for the second object?
                // Or just shift hue.
                // Let's keep the palette consistent but mapped differently.
                if (Math.abs(uNorm - 0.5) < 0.05) return '#FFFFFF';

                if ((uNorm + phase) % 1 < 0.5) {
                    return vNorm > 0.5 ? COLORS.deepOrbitPurple : COLORS.ionBlue;
                } else {
                    return vNorm > 0.5 ? COLORS.solarPink : COLORS.auroraMint;
                }
            };

            // U-Lines
            for (let i = 0; i < uSteps; i++) {
                for (let j = 0; j < vSteps - 1; j++) {
                    const idx1 = i * vSteps + j;
                    const idx2 = i * vSteps + (j + 1);
                    const p1 = projPoints[idx1];
                    const p2 = projPoints[idx2];

                    if (p1.z > 600) continue;

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = getColor(i, j);

                    const noise = Math.random();
                    const depthAlpha = (p1.z + 500) / 1000;
                    ctx.globalAlpha = Math.max(0, Math.min(1, depthAlpha * 0.8 * noise));
                    ctx.stroke();
                }
            }
            // V-Lines
            for (let i = 0; i < uSteps - 1; i += 2) {
                for (let j = 0; j < vSteps; j++) {
                    const idx1 = i * vSteps + j;
                    const idx2 = (i + 1) * vSteps + j;
                    const p1 = projPoints[idx1];
                    const p2 = projPoints[idx2];
                    if (p1.z > 600) continue;

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = getColor(i, j);
                    ctx.globalAlpha = 0.05;
                    ctx.stroke();
                }
            }

            // Glitch Shards
            for (let k = 0; k < 30; k++) {
                const idx1 = Math.floor(Math.random() * projPoints.length);
                const idx2 = Math.floor(Math.random() * projPoints.length);
                const idx3 = Math.floor(Math.random() * projPoints.length);
                const p1 = projPoints[idx1]; const p2 = projPoints[idx2]; const p3 = projPoints[idx3];

                if (Math.abs(p1.z - p2.z) < 100) {
                    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
                    ctx.fillStyle = Math.random() > 0.5 ? COLORS.auroraMint : COLORS.solarPink;
                    ctx.globalAlpha = 0.1; ctx.fill();
                    ctx.strokeStyle = '#FFF'; ctx.globalAlpha = 0.4; ctx.stroke();
                }
            }
        };

        // RENDER TWO ARTIFACTS (Rule of Thirds)
        renderObject(w * 0.67, cy, 0);       // Right
        renderObject(w * 0.33, cy, Math.PI); // Left

        // 6. ATMOSPHERE
        const glow = ctx.createRadialGradient(w * 0.5, cy, 0, w * 0.5, cy, 1200);
        glow.addColorStop(0, 'rgba(90, 63, 255, 0.1)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, w, h);

        // 7. VIGNETTE
        ctx.globalCompositeOperation = 'source-over';
        const vig = ctx.createRadialGradient(w * 0.5, cy, w * 0.4, w * 0.5, cy, w);
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

export default ParadoxBanner;
