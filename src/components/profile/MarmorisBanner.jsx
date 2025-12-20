import React, { useRef, useEffect } from 'react';

/**
 * MarmorisBanner - "Marmoris" (Shimmering Ocean Surface)
 * 
 * The Latin word for the shining, marble-like surface of the ocean.
 * Features:
 * - Vivid sunset sky with brand colors (purple, pink, orange)
 * - Deep ocean water reflecting sunset
 * - Realistic glittering sunlight on water
 * - Sleepy, hypnotic animation
 * 
 * STRICT BRAND COLORS ONLY
 */
const MarmorisBanner = ({ starSettings, variant = 'main' }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    // STRICT BRAND PALETTE
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

    const VARIANTS = {
        main: {
            skyTop: BRAND.voidPurple,
            skyMid: BRAND.solarPink,
            skyBottom: BRAND.vividOrange,
            sunCore: BRAND.white,
            sunGlow: BRAND.vividOrange,
            water: BRAND.deepOrbit,
            waterDeep: BRAND.voidPurple,
            shimmer: BRAND.white
        },
        dusk: {
            skyTop: BRAND.black,
            skyMid: BRAND.voidPurple,
            skyBottom: BRAND.solarPink,
            sunCore: BRAND.vividOrange,
            sunGlow: BRAND.solarPink,
            water: BRAND.voidPurple,
            waterDeep: BRAND.black,
            shimmer: BRAND.solarPink
        },
        golden: {
            skyTop: BRAND.solarPink,
            skyMid: BRAND.vividOrange,
            skyBottom: BRAND.white,
            sunCore: BRAND.white,
            sunGlow: BRAND.vividOrange,
            water: BRAND.solarPink,
            waterDeep: BRAND.voidPurple,
            shimmer: BRAND.white
        }
    };

    const palette = VARIANTS[variant] || VARIANTS.main;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let time = 0;

        const isLowPower = window.innerWidth <= 768;

        // Pre-generate shimmer segments (so they don't flicker/regenerate each frame)
        const shimmerSegments = Array.from({ length: 60 }, () => {
            const distFromHorizon = Math.random();
            const spread = 0.1 + distFromHorizon * 0.06;
            return {
                distFromHorizon,
                yOffset: distFromHorizon,
                xSpread: (Math.random() - 0.5) * spread,
                segmentLength: 4 + distFromHorizon * 20 + Math.random() * 10,
                lineWidth: 0.15 + distFromHorizon * 0.4 + Math.random() * 0.2,
                phase: Math.random() * Math.PI * 2,
                steps: 2 + Math.floor(Math.random() * 4),
                stepOffsets: Array.from({ length: 6 }, () => ({
                    dx: (Math.random() - 0.5) * 3,
                    dy: (Math.random() - 0.5) * (0.8 + distFromHorizon * 2)
                }))
            };
        });

        // Pre-generate wave segments (static positions, only animation moves)
        const waveSegments = Array.from({ length: 100 }, () => {
            const distFromHorizon = Math.random();
            return {
                distFromHorizon,
                yOffset: distFromHorizon,
                xStart: Math.random(),
                segmentLength: 12 + distFromHorizon * 50 + Math.random() * 30,
                amplitude: 0.2 + distFromHorizon * 2.5,
                lineWidth: 0.2 + distFromHorizon * 0.8,
                alpha: 0.06 + distFromHorizon * 0.08,
                phaseOffset: Math.random() * Math.PI * 2,
                waveFreq1: 0.02 + Math.random() * 0.04, // Random wavelength
                waveFreq2: 0.03 + Math.random() * 0.05  // Random secondary wavelength
            };
        });

        function renderFrame() {
            if (!ctx) return;

            ctx.globalCompositeOperation = 'source-over';

            const horizonY = height * 0.5;
            const sunX = width * 0.5;
            const sunY = horizonY - height * 0.02;

            // 1. VIVID SUNSET SKY (Brand colors gradient)
            const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
            skyGrad.addColorStop(0, palette.skyTop);
            skyGrad.addColorStop(0.4, palette.skyMid);
            skyGrad.addColorStop(0.85, palette.skyBottom);
            skyGrad.addColorStop(1, palette.sunGlow);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, width, horizonY);

            // 2. SUN CORE (White/Orange bright center)
            ctx.globalCompositeOperation = 'screen';

            // Outer glow
            const sunOuter = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, width * 0.35);
            sunOuter.addColorStop(0, palette.sunGlow + 'CC');
            sunOuter.addColorStop(0.3, palette.sunGlow + '44');
            sunOuter.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = sunOuter;
            ctx.fillRect(0, 0, width, horizonY + 20);

            // Inner bright core
            const sunInner = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, width * 0.08);
            sunInner.addColorStop(0, palette.sunCore);
            sunInner.addColorStop(0.5, palette.sunGlow + 'AA');
            sunInner.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = sunInner;
            ctx.fillRect(sunX - width * 0.15, sunY - height * 0.15, width * 0.3, height * 0.2);

            // 3. OCEAN WATER (Gradient reflecting sky)
            ctx.globalCompositeOperation = 'source-over';
            const waterGrad = ctx.createLinearGradient(0, horizonY, 0, height);
            waterGrad.addColorStop(0, palette.water);
            waterGrad.addColorStop(0.3, palette.waterDeep);
            waterGrad.addColorStop(1, BRAND.black);
            ctx.fillStyle = waterGrad;
            ctx.fillRect(0, horizonY, width, height - horizonY);

            // 4. SUN REFLECTION PATH ON WATER (Circular fade, not square)
            ctx.globalCompositeOperation = 'screen';

            // Radial glow from sun position extending down into water
            const reflectRadial = ctx.createRadialGradient(
                sunX, horizonY, 0,
                sunX, horizonY + (height - horizonY) * 0.6, width * 0.3
            );
            reflectRadial.addColorStop(0, palette.sunGlow + '40');
            reflectRadial.addColorStop(0.4, palette.sunGlow + '20');
            reflectRadial.addColorStop(0.7, palette.sunGlow + '08');
            reflectRadial.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = reflectRadial;
            ctx.beginPath();
            ctx.arc(sunX, horizonY + (height - horizonY) * 0.3, width * 0.35, 0, Math.PI * 2);
            ctx.fill();

            // 5. SUN SHIMMER (Simple glowing spots that twinkle)
            ctx.globalCompositeOperation = 'screen';

            shimmerSegments.forEach((seg) => {
                const y = horizonY + seg.yOffset * (height - horizonY);
                const x = sunX + seg.xSpread * width;

                const twinkle = Math.sin(time * 0.015 + seg.phase);
                if (twinkle < 0.3) return;

                ctx.globalAlpha = (twinkle - 0.3) * 0.5;

                // Simple glowing spot
                const spotSize = 1 + seg.distFromHorizon * 4;
                const spotGrad = ctx.createRadialGradient(x, y, 0, x, y, spotSize);
                spotGrad.addColorStop(0, palette.shimmer);
                spotGrad.addColorStop(0.5, palette.shimmer + '88');
                spotGrad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = spotGrad;

                ctx.beginPath();
                ctx.arc(x, y, spotSize, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 6. 3D PERSPECTIVE WAVES (Much wavier - larger amplitude)
            ctx.globalCompositeOperation = 'screen';
            ctx.strokeStyle = BRAND.white;

            const waterHeight = height - horizonY;

            waveSegments.forEach(seg => {
                // Wave comes and goes (slower)
                const fade = Math.sin(time * 0.008 + seg.phaseOffset);
                if (fade < 0) return; // Wave hidden during negative phase

                const baseY = horizonY + seg.yOffset * waterHeight;
                const startX = seg.xStart * (width - seg.segmentLength);

                ctx.lineWidth = seg.lineWidth;
                ctx.globalAlpha = seg.alpha * fade; // Fade in and out

                ctx.beginPath();

                // Much larger wave amplitude for visible wavy motion
                const amp = seg.amplitude * 3;

                for (let x = startX; x < startX + seg.segmentLength; x += 3) {
                    const wave1 = Math.sin(x * seg.waveFreq1 + time * 0.004 + seg.phaseOffset) * amp;
                    const wave2 = Math.sin(x * seg.waveFreq2 + time * 0.003 + seg.phaseOffset * 1.5) * amp * 0.3;
                    const waveOffset = wave1 + wave2;

                    if (x === startX) ctx.moveTo(x, baseY + waveOffset);
                    else ctx.lineTo(x, baseY + waveOffset);
                }
                ctx.stroke();
            });

            // Soft highlight bands (peaceful shimmer across waves)
            for (let i = 0; i < 5; i++) {
                const bandY = horizonY + (height - horizonY) * (0.1 + i * 0.18);
                const bandWidth = width * 0.3;
                const bandX = sunX - bandWidth / 2 + Math.sin(time * 0.000002 + i) * 20;

                ctx.globalAlpha = 0.03 * (1 - i * 0.15);
                const bandGrad = ctx.createLinearGradient(bandX, 0, bandX + bandWidth, 0);
                bandGrad.addColorStop(0, 'rgba(255,255,255,0)');
                bandGrad.addColorStop(0.5, palette.shimmer);
                bandGrad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = bandGrad;
                ctx.fillRect(bandX, bandY - 3, bandWidth, 6);
            }
            ctx.globalAlpha = 1;

            // 7. HORIZON GLOW LINE (Warm, melancholic)
            ctx.globalCompositeOperation = 'screen';
            const horizonGlow = ctx.createLinearGradient(0, horizonY - 5, 0, horizonY + 5);
            horizonGlow.addColorStop(0, 'rgba(0,0,0,0)');
            horizonGlow.addColorStop(0.5, palette.sunGlow + '50');
            horizonGlow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = horizonGlow;
            ctx.fillRect(0, horizonY - 5, width, 10);

            if (!isLowPower) {
                time += 1;
                animationRef.current = requestAnimationFrame(renderFrame);
            }
        }

        function resize() {
            width = canvas.width = canvas.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.offsetHeight || 200;
            renderFrame();
        }

        window.addEventListener('resize', resize);
        resize();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [variant]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: BRAND.black }}>
            <canvas ref={canvasRef} style={{
                width: '100%',
                height: '100%',
                display: 'block',
                position: 'relative',
                zIndex: 1
            }} />
        </div>
    );
};

export default MarmorisBanner;
