
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- THE INFINITE (Strange Attractor Simulation) ---
// Concept: A visual rendering of chaos theory mathematics (Peter de Jong Attractor).
// Technique: 10 Million particle iterations mapped to a 2D plane with additive blending.
// Vibe: "Award-Winning" complexity, infinite detail, silk-like digital structures.
// "Digital Mind Fuck" intensity.

const RENDER_CACHE = new Map();

const InfiniteBanner = ({ color }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const cacheKey = `infinite_${color || 'brand'}`;
        if (RENDER_CACHE.has(cacheKey)) {
            setBgImage(RENDER_CACHE.get(cacheKey));
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = 3840;
        const h = 2160;
        canvas.width = w;
        canvas.height = h;

        const cx = w * 0.5;
        const cy = h * 0.5;

        const isBrand = color === 'brand';
        const resolveColor = (fallback) => isBrand ? fallback : (color || fallback);

        // 1. VOID BACKGROUND
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // 2. ATTRACTOR CONFIGURATION
        const a = 1.641;
        const b = 1.902;
        const c = 0.316;
        const d = 1.525;

        let x = 0.1;
        let y = 0.1;

        const iterations = 8000000;
        const scale = 900;

        // 3. RENDER LOOP
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;
        const densityMap = new Float32Array(w * h).fill(0);

        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        };

        const cPink = hexToRgb(resolveColor(COLORS.solarPink));
        const cBlue = hexToRgb(resolveColor(COLORS.ionBlue));
        const cMint = hexToRgb(resolveColor(COLORS.auroraMint));
        const cPurp = hexToRgb(resolveColor(COLORS.deepOrbitPurple));

        for (let i = 0; i < iterations; i++) {
            const xNext = Math.sin(a * y) - Math.cos(b * x);
            const yNext = Math.sin(c * x) - Math.cos(d * y);
            x = xNext;
            y = yNext;

            const px = Math.floor(cx + x * scale);
            const py = Math.floor(cy + y * scale);

            if (px >= 0 && px < w && py >= 0 && py < h) {
                const idx = py * w + px;
                densityMap[idx] += 1;
            }
        }

        let maxDensity = 0;
        for (let i = 0; i < densityMap.length; i++) {
            if (densityMap[i] > maxDensity) maxDensity = densityMap[i];
        }

        const logMax = Math.log(maxDensity + 1);

        for (let i = 0; i < densityMap.length; i++) {
            const dens = densityMap[i];
            if (dens <= 0) continue;

            const intensity = Math.log(dens + 1) / logMax;
            const px = i % w;
            const gradT = px / w;

            let r = 0, g = 0, b = 0;

            if (gradT < 0.5) {
                const t = gradT * 2;
                r = cBlue[0] * (1 - t) + cPurp[0] * t;
                g = cBlue[1] * (1 - t) + cPurp[1] * t;
                b = cBlue[2] * (1 - t) + cPurp[2] * t;
            } else {
                const t = (gradT - 0.5) * 2;
                r = cPurp[0] * (1 - t) + cPink[0] * t;
                g = cPurp[1] * (1 - t) + cPink[1] * t;
                b = cPurp[2] * (1 - t) + cPink[2] * t;
            }

            if (intensity > 0.7) {
                const hotT = (intensity - 0.7) / 0.3;
                r = r * (1 - hotT) + cMint[0] * hotT;
                g = g * (1 - hotT) + cMint[1] * hotT;
                b = b * (1 - hotT) + cMint[2] * hotT;
            }
            if (intensity > 0.9) {
                r = 255; g = 255; b = 255;
            }

            const imgIdx = i * 4;
            data[imgIdx] = r;
            data[imgIdx + 1] = g;
            data[imgIdx + 2] = b;
            data[imgIdx + 3] = 255 * intensity * 2.0;
        }

        ctx.putImageData(imageData, 0, 0);

        // 5. POST PROCESSING GLOW
        ctx.globalCompositeOperation = 'screen';
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
        const glowColor = resolveColor(COLORS.ionBlue);
        glow.addColorStop(0, glowColor + '1A'); // 0.1 opacity
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // 6. HUD OVERLAY
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';

        for (let i = 0; i < w; i += 400) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
        }
        for (let i = 0; i < h; i += 400) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
        }

        // 7. VIGNETTE
        ctx.globalCompositeOperation = 'multiply';
        const vig = ctx.createLinearGradient(0, 0, 0, h);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(0.5, 'transparent');
        vig.addColorStop(1, '#000');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        const result = canvas.toDataURL('image/webp', 0.95);
        RENDER_CACHE.set(cacheKey, result);
        setBgImage(result);

    }, [color]);

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
