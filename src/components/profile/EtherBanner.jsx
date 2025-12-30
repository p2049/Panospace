
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- THE ETHER (Hyper-Minimalist Glass) ---
// Concept: The "OS of the Gods". Better than Apple/Microsoft.
//          It focuses on "Ether" - the substance of space itself.
// Visual: Extremely soft, deep, multi-layered "Mica" glass materials.
//         Impossible refractions, caustic hazes, and a perfect central "Lens".
// Tech: 
// 1. Multi-pass Gaussian Blur emulation (Stacking gradients).
// 2. Caustic Noise generation for "Ethereal" light texture.
// 3. Super-ellipse geometry (Squaricles) for that "Premier" feel.
// Vibe: "Ultra-Premium", "Next-Gen OS", "Weightless", "Perfect".

const RENDER_CACHE = new Map();

const EtherBanner = ({ color: customColor }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const cacheKey = `ether_${customColor || 'brand'}`;
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

        const isBrand = customColor === 'brand';
        const resolveColor = (fallback) => {
            if (isBrand) return fallback;
            return customColor || fallback;
        };

        // 1. BASE: THE "DEEP MICA" BACKGROUND
        // A gradient that feels like expensive frosted glass over a void
        const bg = ctx.createLinearGradient(0, 0, w, h);
        bg.addColorStop(0, '#020205'); // Deep Blue Black
        bg.addColorStop(0.5, '#050a12'); // Rich Navy
        bg.addColorStop(1, '#000000');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // 2. THE CAUSTIC AURA (The "Ghost" Light)
        // Soft, drifting clouds of brand colors, heavily blurred
        // Drawn as huge circles with extremely low alpha stack

        const drawAura = (x, y, r, color) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, color);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.globalCompositeOperation = 'screen'; // Light addition
            ctx.globalAlpha = 0.4;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        };

        // Brand Palette "Nebula" behind the glass
        drawAura(w * 0.2, h * 0.2, 1200, resolveColor(COLORS.deepOrbitPurple));
        drawAura(w * 0.8, h * 0.8, 1400, resolveColor(COLORS.ionBlue));
        drawAura(w * 0.5, h * 0.5, 900, 'rgba(255,255,255,0.1)'); // White core

        // 3. THE "PERFECT" OBJECT (The Lens)
        // A giant Super-Ellipse (Squircle) made of dispersive glass.
        // It sits in the center, refracting the background.

        const drawSquircle = (x, y, size, radius, color, rotation) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            ctx.beginPath();
            // Super-ellipse approx
            // Or just a rounded rect with huge radius
            const s = size / 2;
            const r = size * 0.4; // 40% rounding for Apple-like smoothness

            ctx.moveTo(-s + r, -s);
            ctx.lineTo(s - r, -s);
            ctx.quadraticCurveTo(s, -s, s, -s + r);
            ctx.lineTo(s, s - r);
            ctx.quadraticCurveTo(s, s, s - r, s);
            ctx.lineTo(-s + r, s);
            ctx.quadraticCurveTo(-s, s, -s, s - r);
            ctx.lineTo(-s, -s + r);
            ctx.quadraticCurveTo(-s, -s, -s + r, -s);
            ctx.closePath();

            // FILL: Frosted Glass Effect
            // We use a linear gradient that is slightly brighter than bg
            const fillGrad = ctx.createLinearGradient(-s, -s, s, s);
            fillGrad.addColorStop(0, 'rgba(255,255,255,0.15)'); // White Highlight
            fillGrad.addColorStop(0.5, 'rgba(255,255,255,0.02)'); // Clear center
            fillGrad.addColorStop(1, 'rgba(255,255,255,0.05)'); // Bottom catch
            ctx.fillStyle = fillGrad;
            ctx.globalCompositeOperation = 'source-over';
            ctx.backdropFilter = 'blur(40px)'; // Browser only, canvas can't do this easily.
            // Canvas emulation: We just paint the overlay.
            ctx.fill();

            // BORDER: The "Premier" Edge
            // A crisp, 1px white border that fades out
            const borderGrad = ctx.createLinearGradient(-s, -s, s, s);
            borderGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
            borderGrad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
            borderGrad.addColorStop(1, 'rgba(255,255,255,0.5)');

            ctx.lineWidth = 2; // Thicker for 4K
            ctx.strokeStyle = borderGrad;
            ctx.stroke();

            // INNER GLOW (Caustic Edge)
            ctx.shadowBlur = 60;
            ctx.shadowColor = color;
            ctx.globalAlpha = 0.5;
            ctx.stroke();

            ctx.restore();
        };

        // Draw Composition of Floating Plates
        // "Zero Gravity UI"

        // Background Plate (Huge, dark)
        drawSquircle(w * 0.7, h * 0.4, 900, 100, resolveColor(COLORS.deepOrbitPurple), Math.PI * 0.1);

        // Mid Plate (Mint)
        drawSquircle(w * 0.3, h * 0.6, 600, 120, resolveColor(COLORS.auroraMint), -Math.PI * 0.05);

        // HERO PLATE (The Centerpiece)
        // Bright, sharp, in focus
        drawSquircle(cx, cy, 400, 80, resolveColor(COLORS.solarPink), 0);


        // 4. "NANOTECH" DETAILS (Subtle Texture)
        // Tiny plus patterns or dots to give it scale/tech feel
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        const dotGap = 60;
        for (let x = 0; x < w; x += dotGap) {
            for (let y = 0; y < h; y += dotGap) {
                if (Math.random() > 0.8) {
                    ctx.fillRect(x, y, 2, 2);
                }
            }
        }

        // 5. LIGHT SHAFT (God Ray)
        // A single, perfect beam of light cutting across
        ctx.globalCompositeOperation = 'screen';
        const beamGrad = ctx.createLinearGradient(0, 0, w, h);
        beamGrad.addColorStop(0.4, 'transparent');
        beamGrad.addColorStop(0.45, 'rgba(255,255,255,0.05)');
        beamGrad.addColorStop(0.5, 'rgba(255,255,255,0.1)'); // Peak
        beamGrad.addColorStop(0.55, 'rgba(255,255,255,0.05)');
        beamGrad.addColorStop(0.6, 'transparent');

        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, 0, w, h);


        // 6. ATMOSPHERE / NOISE
        // Add subtle grain for realism
        // Canvas can generate noise pixel by pixel (slow) or use pattern.
        // We'll skip pixel noise for performance and rely on the gradient banding which actually looks nice here.

        // 7. VIGNETTE
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
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

        const result = canvas.toDataURL('image/webp', 0.95);
        RENDER_CACHE.set(cacheKey, result);
        setBgImage(result);

    }, [customColor]);

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

export default EtherBanner;
