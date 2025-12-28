import React, { useRef, useEffect, useMemo } from 'react';

/**
 * BoatWindowBanner - The Definitive Pano-Maritime Experience
 * 
 * Features:
 * 1. ORGANIC LIQUID VOLUME: 8 Unique wave layers with non-uniform fractal noise.
 * 2. DRAMATIC PARALLAX: Speed-depth gradient for realistic maritime travel.
 * 3. SMOOTH BUT VARIED: Uses LFO modulators to break the "perfect" loop look.
 * 4. REALISTIC BUOY TRACKING: Buoy is synced to Layer 2 and respects porthole gaps.
 */
const BoatWindowBanner = ({ starSettings, variant = 'boat_storm' }) => {
    const BRAND = {
        voidPurple: '#2A0E61',
        deepOrbit: '#5A3FFF',
        auroraMint: '#8CFFE9',
        ionBlue: '#1B82FF',
        auroraBlue: '#7FDBFF',
        solarPink: '#FF5C8A',
        vividOrange: '#FF914D',
        white: '#FFFFFF',
        black: '#000000'
    };

    const PALETTES = {
        boat_storm: {
            sky: [BRAND.black, BRAND.voidPurple, BRAND.ionBlue],
            ocean: [BRAND.black, '#0d041a', BRAND.voidPurple, '#3d25b0', BRAND.deepOrbit, '#155cb4', BRAND.ionBlue, BRAND.auroraBlue],
            rim: BRAND.deepOrbit,
            bolt: BRAND.ionBlue,
            interior: BRAND.black,
            shipSpeed: 0.6
        },
        boat_sunset: {
            sky: [BRAND.voidPurple, BRAND.solarPink, BRAND.vividOrange],
            ocean: [BRAND.black, BRAND.voidPurple, '#4a148c', '#880e4f', BRAND.solarPink, '#ff4081', BRAND.vividOrange, BRAND.white + '88'],
            rim: BRAND.vividOrange,
            bolt: BRAND.solarPink,
            interior: BRAND.voidPurple,
            shipSpeed: 0.5
        },
        boat_mint: {
            sky: [BRAND.black, BRAND.voidPurple],
            ocean: [BRAND.black, BRAND.voidPurple, '#1a0d33', '#1e306b', BRAND.deepOrbit, '#42d4bc', BRAND.auroraMint, BRAND.white + '33'],
            rim: BRAND.auroraMint,
            bolt: BRAND.deepOrbit,
            interior: BRAND.black,
            shipSpeed: 0.4
        }
    };

    const palette = PALETTES[variant] || PALETTES.boat_storm;

    const starField = useMemo(() => {
        return [...Array(40)].map(() => ({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 1.2 + 0.4,
            twinkleSpeed: Math.random() * 1.0 + 0.3,
            phase: Math.random() * Math.PI * 2
        }));
    }, []);

    const Porthole = ({ viewOffsetX, size = '115px' }) => {
        const canvasRef = useRef(null);
        const animationRef = useRef(null);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            const render = () => {
                const w = canvas.width;
                const h = canvas.height;
                const time = Date.now() * 0.0005;
                const horizonY = h * 0.45;

                // --- 1. SKY ---
                ctx.globalCompositeOperation = 'source-over';
                const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
                palette.sky.forEach((c, i) => skyGrad.addColorStop(i / (palette.sky.length - 1), c));
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, w, horizonY);

                // --- 2. STARS ---
                if (starSettings?.enabled) {
                    starField.forEach((star) => {
                        let sx = ((star.x + viewOffsetX * 0.1 - time * 0.001) % 1) * w;
                        if (sx < 0) sx += w;
                        let sy = star.y * horizonY;
                        const opacity = 0.15 + (Math.sin(time * 2 * star.twinkleSpeed + star.phase) * 0.5 + 0.5) * 0.5;
                        ctx.fillStyle = starSettings.color === 'brand' ? (palette.ocean[7] || BRAND.white) : (starSettings.color || BRAND.white);
                        ctx.globalAlpha = opacity;
                        ctx.beginPath();
                        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    ctx.globalAlpha = 1;
                }

                // --- 3. ORGANIC LIQUID ENGINE (8 UNIQUE LAYERS) ---
                const layers = [
                    { depth: 0, amp: 0.6, freq: 0.005, speed: 0.20, alpha: 0.45, offset: 1, jitter: 1.1 },
                    { depth: 1, amp: 1.2, freq: 0.009, speed: 0.30, alpha: 0.55, offset: 8, jitter: 1.3 },
                    { depth: 2, amp: 2.1, freq: 0.014, speed: 0.45, alpha: 0.65, offset: 18, jitter: 1.5 },
                    { depth: 3, amp: 3.2, freq: 0.019, speed: 0.65, alpha: 0.75, offset: 32, jitter: 1.7 },
                    { depth: 4, amp: 4.5, freq: 0.024, speed: 0.90, alpha: 0.85, offset: 48, jitter: 1.9 },
                    { depth: 5, amp: 5.8, freq: 0.030, speed: 1.15, alpha: 0.90, offset: 66, jitter: 1.2 },
                    { depth: 6, amp: 7.2, freq: 0.036, speed: 1.40, alpha: 0.95, offset: 88, jitter: 1.4 },
                    { depth: 7, amp: 8.8, freq: 0.042, speed: 1.65, alpha: 1.00, offset: 112, jitter: 1.6 }
                ];

                const BUOY_INTERVAL = 30;
                const buoyTime = time % BUOY_INTERVAL;
                const getDepthSpeed = (d) => 0.08 + (d * 0.62);

                const layer2Speed = palette.shipSpeed * getDepthSpeed(2);
                const WORLD_WIDTH = 25.0;
                const buoyProgress = (buoyTime * layer2Speed * 1.5) % WORLD_WIDTH;
                const buoyWorldX = 15.0 - buoyProgress;
                const BUOY_VIEW_SCALE = 150;
                let buoyX = (buoyWorldX - viewOffsetX * 5.0) * BUOY_VIEW_SCALE + (w / 2);
                let buoyBobs = Math.sin(time * 6) * 1.2;

                layers.forEach((layer, lIdx) => {
                    const hScroll = time * palette.shipSpeed * getDepthSpeed(layer.depth);
                    const colorIdx = Math.min(layer.depth, palette.ocean.length - 1);
                    const baseColor = palette.ocean[colorIdx];

                    const waveGrad = ctx.createLinearGradient(0, horizonY + layer.offset - 20, 0, h);
                    waveGrad.addColorStop(0, baseColor);
                    waveGrad.addColorStop(1, BRAND.black);

                    ctx.fillStyle = waveGrad;
                    ctx.globalAlpha = layer.alpha;
                    ctx.beginPath();
                    ctx.moveTo(0, h);

                    const points = [];
                    const stepSize = lIdx < 4 ? 6 : 4;

                    for (let x = 0; x <= w; x += stepSize) {
                        const vPhase = time * 0.8;
                        const xPrime = x + hScroll * 150 + viewOffsetX * 600;

                        // NON-UNIFORMITY LFO Modulations per-layer
                        // We use the layer's jitter factor to create unique phase shifts
                        const lfo1 = Math.sin(xPrime * 0.002 * layer.jitter + vPhase * 0.1);
                        const lfo2 = Math.cos(xPrime * 0.003 / layer.jitter - vPhase * 0.15);

                        // Fractal Sine Summation: No two layers are identical
                        const s1 = Math.sin(xPrime * layer.freq + vPhase);
                        const s2 = Math.sin(xPrime * layer.freq * 1.6 * layer.jitter + vPhase * 0.3 + lfo1);
                        const s3 = Math.cos(xPrime * layer.freq * 0.45 + vPhase * 0.8 + lfo2);

                        // Weighted sum produces organic complexity
                        let combined = (s1 * 0.65 + s2 * 0.25 + s3 * 0.1);

                        // Apply slight amplitude variance over time/space
                        const ampVariance = 1.0 + (lfo1 * 0.1);
                        let y = horizonY + layer.offset + (combined * layer.amp * ampVariance);

                        points.push({ x, y, combined });
                        ctx.lineTo(x, y);
                    }
                    ctx.lineTo(w, h);
                    ctx.fill();

                    // --- DRAW BUOY (ON LAYER 2) ---
                    if (lIdx === 2 && buoyX > -25 && buoyX < w + 25) {
                        ctx.save();
                        ctx.globalAlpha = 1.0;
                        const buoyY = horizonY + layer.offset + buoyBobs + 2;
                        ctx.fillStyle = BRAND.solarPink;
                        ctx.beginPath();
                        ctx.moveTo(buoyX, buoyY - 8);
                        ctx.lineTo(buoyX - 4, buoyY);
                        ctx.lineTo(buoyX + 4, buoyY);
                        ctx.fill();
                        ctx.fillStyle = BRAND.white;
                        ctx.globalAlpha = 0.4 + Math.sin(time * 12) * 0.4;
                        ctx.beginPath();
                        ctx.arc(buoyX, buoyY - 8, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }

                    // Surface Highlight (Subtle)
                    if (layer.depth > 3) {
                        ctx.globalAlpha = 0.1;
                        ctx.strokeStyle = palette.ocean[Math.min(layer.depth + 1, palette.ocean.length - 1)];
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(points[0].x, points[0].y - 0.5);
                        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y - 0.5);
                        ctx.stroke();
                    }
                });

                // Optics
                const reflection = ctx.createLinearGradient(0, horizonY, 0, h);
                reflection.addColorStop(0, 'rgba(255,255,255,0.015)');
                reflection.addColorStop(1, 'transparent');
                ctx.fillStyle = reflection;
                ctx.fillRect(0, horizonY, w, h - horizonY);

                animationRef.current = requestAnimationFrame(render);
            };
            render();
            return () => cancelAnimationFrame(animationRef.current);
        }, [viewOffsetX, size, variant, starSettings]);

        return (
            <div style={{
                width: size, height: size,
                position: 'relative', borderRadius: '50%',
                border: `6px solid ${palette.rim}33`,
                outline: `1.5px solid ${palette.rim}55`,
                boxShadow: `0 10px 30px rgba(0,0,0,0.9), inset 0 0 25px rgba(0,0,0,0.8)`,
                overflow: 'hidden', background: BRAND.black,
                flexShrink: 0, transform: 'translateZ(0)'
            }}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute', top: '50%', left: '50%',
                        width: '3px', height: '3px', background: palette.bolt, borderRadius: '50%',
                        transform: `translate(-50%, -50%) rotate(${i * 60 + 30}deg) translateY(-${parseInt(size) / 2 - 3}px)`,
                        opacity: 0.4, zIndex: 10
                    }} />
                ))}
                <canvas ref={canvasRef} width={180} height={180} style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>
        );
    };

    return (
        <div style={{
            position: 'absolute', inset: 0, background: palette.interior,
            display: 'grid', gridTemplateColumns: '1fr 1fr 130px 1fr 1fr',
            padding: '12px 24px', alignItems: 'center', overflow: 'hidden',
            boxSizing: 'border-box'
        }}>
            <div style={{
                position: 'absolute', inset: -20,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                animation: 'boatSway 18s ease-in-out infinite', pointerEvents: 'none'
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `linear-gradient(to right, transparent 49.5%, ${BRAND.white}02 50%, transparent 50.5%)`,
                    backgroundSize: '200px 100%', opacity: 0.5
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `linear-gradient(to bottom, transparent 97%, ${BRAND.white}01 98%, transparent 100%)`,
                    backgroundSize: '100% 40px', opacity: 0.4
                }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', animation: 'cabinRock 20s ease-in-out infinite' }}>
                <Porthole viewOffsetX={0.0} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', animation: 'cabinRock 20s ease-in-out infinite reverse' }}>
                <Porthole viewOffsetX={0.25} />
            </div>
            <div style={{ position: 'relative' }}></div>
            <div style={{ display: 'flex', justifyContent: 'center', animation: 'cabinRock 20s ease-in-out infinite 2s' }}>
                <Porthole viewOffsetX={0.72} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', animation: 'cabinRock 20s ease-in-out infinite -2s' }}>
                <Porthole viewOffsetX={0.95} />
            </div>

            <style>{`
                @keyframes boatSway { 0%, 100% { transform: translate(-1px, -2px) rotate(0.1deg); } 50% { transform: translate(1px, 1px) rotate(-0.1deg); } }
                @keyframes cabinRock { 0%, 100% { transform: translateY(-0.4px) rotate(-0.1deg); } 50% { transform: translateY(0.4px) rotate(0.1deg); } }
            `}</style>
        </div>
    );
};

export default BoatWindowBanner;
