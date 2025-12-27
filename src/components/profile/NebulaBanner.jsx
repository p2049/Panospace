
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- COSMIC NEBULA (Refined High-Fidelity) ---
// Concept: The "Shattered Moon" background (Complex CSS/SVG Turbulence) 
//          plus a subtle canvas star/dust field.
// Vibe: Deep, Atmospheric, Turbulent.

const RENDER_CACHE = new Map();

const NebulaBanner = () => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        if (RENDER_CACHE.has('nebula')) {
            setBgImage(RENDER_CACHE.get('nebula'));
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = 2560; // Banner Optimized Width
        const h = 800; // Banner Optimized Height (Prevents zooming on desktop)
        canvas.width = w;
        canvas.height = h;

        // --- CANVAS LAYER: STARS & DUST & VIGNETTE ---

        // 1. CLEAR
        ctx.clearRect(0, 0, w, h);

        // 2. STARS (Subtle depth)
        const drawStar = (x, y, s, alpha) => {
            ctx.fillStyle = '#FFF';
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, s, 0, Math.PI * 2);
            ctx.fill();
        };

        for (let i = 0; i < 150; i++) {
            drawStar(
                Math.random() * w,
                Math.random() * h,
                Math.random() * 1.5,
                Math.random() * 0.8
            );
        }

        // 3. BRAND COLORED DUST (Very subtle)
        // Just small specs of Ion Blue / Pink floating
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? COLORS.ionBlue : COLORS.solarPink;
            ctx.globalAlpha = Math.random() * 0.4;
            const s = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(Math.random() * w, Math.random() * h, s, 0, Math.PI * 2);
            ctx.fill();
        }

        // 4. VIGNETTE (Text Safety)
        ctx.globalCompositeOperation = 'source-over'; // Standard blend on top
        const vig = ctx.createLinearGradient(0, 0, 0, h);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(0.5, 'transparent');
        vig.addColorStop(0.8, '#000000aa');
        vig.addColorStop(1, '#000000');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        const result = canvas.toDataURL('image/webp', 0.95);
        RENDER_CACHE.set('nebula', result);
        setBgImage(result);

    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#020205',
            overflow: 'hidden'
        }}>

            {/* 1. CSS NEBULA ENGINE (From Shattered Moon) */}
            <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                <defs>
                    <filter id="nebula-noise-v2">
                        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.02" numOctaves="4" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="150" xChannelSelector="R" yChannelSelector="G" />
                        <feGaussianBlur stdDeviation="12" />
                    </filter>
                </defs>
            </svg>

            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                {/* Deep Nebula Wash (Purple/Black Base) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at 50% 30%, #2A0E61 0%, #000 70%)',
                    opacity: 0.6
                }} />

                {/* Turbulent Clouds (Mint/Pink/Blue Mix) */}
                <div style={{
                    position: 'absolute', top: 0, left: '-20%', right: '-20%', height: '100%',
                    filter: 'url(#nebula-noise-v2)',
                    // Complex brand gradient
                    background: 'repeating-linear-gradient(45deg, transparent, rgba(90, 63, 255, 0.2) 10%, rgba(255, 92, 138, 0.2) 20%, rgba(27, 130, 255, 0.1) 30%, transparent 40%)',
                    opacity: 0.8,
                    mixBlendMode: 'screen',
                    transform: 'scale(1.2)'
                }} />

                {/* Rolling Fog (Mint Haze) */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
                    background: 'linear-gradient(to top, rgba(140, 255, 233, 0.05) 0%, transparent 100%)',
                    filter: 'blur(40px)', opacity: 0.5
                }} />
            </div>

            {/* 2. CANVAS CONTENT (Stars & Vignette) */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 1
            }} />

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default NebulaBanner;
