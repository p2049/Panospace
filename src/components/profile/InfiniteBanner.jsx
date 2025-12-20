
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- THE INFINITE (Strange Attractor Simulation) ---
// Concept: A visual rendering of chaos theory mathematics (Peter de Jong Attractor).
// Technique: 10 Million particle iterations mapped to a 2D plane with additive blending.
// Vibe: "Award-Winning" complexity, infinite detail, silk-like digital structures.
// "Digital Mind Fuck" intensity.

const InfiniteBanner = () => {
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
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // 2. ATTRACTOR CONFIGURATION
        // Good seeds for Peter de Jong:
        // A=1.4, B=-2.3, C=2.4, D=-2.1
        // A=2.01, B=-2.53, C=1.61, D=-0.33
        // Let's use a known "beautiful" set
        const a = 1.641;
        const b = 1.902;
        const c = 0.316;
        const d = 1.525;

        let x = 0.1;
        let y = 0.1;

        const iterations = 8000000; // 8 Million points for density
        const scale = 900;

        // 3. RENDER LOOP (Direct Pixel Access for speed)
        // We use ImageData because drawing 8M rects is too slow on 2D context
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        // Logarithmic Density Map
        // We accumulate hits in a Float32Array first
        const densityMap = new Float32Array(w * h).fill(0);

        // Colors (Brand Palette as RGB)
        const cPink = [255, 92, 138];   // Solar Pink
        const cBlue = [27, 130, 255];   // Ion Blue
        const cMint = [140, 255, 233];  // Aurora Mint
        const cPurp = [90, 63, 255];    // Void Purple

        console.time('Attractor Render');

        for (let i = 0; i < iterations; i++) {
            // Peter de Jong Formula
            const xNext = Math.sin(a * y) - Math.cos(b * x);
            const yNext = Math.sin(c * x) - Math.cos(d * y);
            x = xNext;
            y = yNext;

            // Map to Screen
            // Output is approx -2 to 2
            const px = Math.floor(cx + x * scale);
            const py = Math.floor(cy + y * scale);

            if (px >= 0 && px < w && py >= 0 && py < h) {
                const idx = py * w + px;
                densityMap[idx] += 1;
            }
        }

        // 4. COLORIZE DENSITY MAP
        let maxDensity = 0;
        for (let i = 0; i < densityMap.length; i++) {
            if (densityMap[i] > maxDensity) maxDensity = densityMap[i];
        }

        // Logarithmic normalization for bloom effect
        const logMax = Math.log(maxDensity + 1);

        for (let i = 0; i < densityMap.length; i++) {
            const dens = densityMap[i];
            if (dens <= 0) continue;

            const intensity = Math.log(dens + 1) / logMax; // 0 to 1 smooth

            // Color Logic based on screen position (Gradient map)
            // Left side purple/blue, Right side Pink/Mint
            const px = i % w;
            const py = Math.floor(i / w);
            const gradT = px / w;

            let r = 0, g = 0, b = 0;

            // Interpolate colors based on X position + Intensity
            if (gradT < 0.5) {
                // Blue -> Purple
                const t = gradT * 2;
                r = cBlue[0] * (1 - t) + cPurp[0] * t;
                g = cBlue[1] * (1 - t) + cPurp[1] * t;
                b = cBlue[2] * (1 - t) + cPurp[2] * t;
            } else {
                // Purple -> Pink
                const t = (gradT - 0.5) * 2;
                r = cPurp[0] * (1 - t) + cPink[0] * t;
                g = cPurp[1] * (1 - t) + cPink[1] * t;
                b = cPurp[2] * (1 - t) + cPink[2] * t;
            }

            // High intensity hits turn to Mint/White (Hotspots)
            if (intensity > 0.7) {
                const hotT = (intensity - 0.7) / 0.3;
                r = r * (1 - hotT) + cMint[0] * hotT;
                g = g * (1 - hotT) + cMint[1] * hotT;
                b = b * (1 - hotT) + cMint[2] * hotT;
            }
            if (intensity > 0.9) {
                r = 255; g = 255; b = 255;
            }

            // Write to ImageData
            const imgIdx = i * 4;
            data[imgIdx] = r;
            data[imgIdx + 1] = g;
            data[imgIdx + 2] = b;
            data[imgIdx + 3] = 255 * intensity * 2.0; // Alpha boost
        }

        ctx.putImageData(imageData, 0, 0);
        console.timeEnd('Attractor Render');

        // 5. POST PROCESSING GLOW (Overlay Composite)
        // We copy the attractor, blur it, and paste it back on top?
        // Canvas is slow at blur. Let's do a fake radial bloom.

        ctx.globalCompositeOperation = 'screen';
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
        glow.addColorStop(0, 'rgba(27, 130, 255, 0.1)'); // Blue center glow
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // 6. HUD OVERLAY (The "Scientific Award" look)
        // Thin scanlines or data readouts
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';

        // Grid lines
        for (let i = 0; i < w; i += 400) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
        }
        for (let i = 0; i < h; i += 400) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
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

export default InfiniteBanner;
