import React, { useRef, useEffect } from 'react';

/**
 * GlobeBanner - "The Blue Marble" (Brand Optimized)
 * 
 * Key Features:
 * - Fractal-rugged continents (Strictly BRAND.auroraMint).
 * - Manually spaced strip layout to ENSURE NO OVERLAP.
 * - Multi-layered realistic atmospheric clouds (wispy, varied opacity).
 * - Intense Blue Atmospheric Rim (Fresnel Halo).
 * - Multi-pass spherical shading.
 * - Glacial, "sleepy" rotation.
 */
const GlobeBanner = ({ starSettings, variant = 'main' }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const BRAND = {
        voidPurple: '#2A0E61',
        deepOrbit: '#5A3FFF',
        auroraMint: '#8CFFE9',
        ionBlue: '#1B82FF',
        auroraBlue: '#7FDBFF',
        solarPink: '#FF5C8A',
        white: '#FFFFFF',
        deepOcean: '#02091c'
    };

    const isBrand = starSettings?.color === 'brand';
    const starColorProp = (starSettings?.color && !isBrand) ? starSettings.color : BRAND.white;

    const VARIANTS = {
        main: {
            ocean: BRAND.deepOcean,
            land: BRAND.auroraMint,
            glow: BRAND.ionBlue,
            rim: BRAND.auroraBlue,
            stars: [BRAND.auroraBlue, BRAND.white]
        },
        void: {
            ocean: '#05020c',
            land: BRAND.deepOrbit || '#5A3FFF',
            glow: BRAND.voidPurple,
            rim: BRAND.deepOrbit,
            stars: [BRAND.voidPurple, BRAND.white]
        },
        solar: {
            ocean: '#1a0308',
            land: BRAND.white,
            glow: BRAND.solarPink,
            rim: '#FF8A5C',
            stars: [BRAND.solarPink, BRAND.white]
        }
    };

    const palette = VARIANTS[variant] || VARIANTS.main;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let time = 0;

        const isLowPower = window.innerWidth <= 768;

        const hexToRgba = (hex, alpha) => {
            if (!hex) return `rgba(0,0,0,${alpha})`;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        // Fractal Polygon (Jagged Coastlines)
        const createFractalContinent = (baseSize, complexity = 20) => {
            let points = [];
            for (let i = 0; i < complexity; i++) {
                const angle = (i / complexity) * Math.PI * 2;
                const r = baseSize * (0.8 + Math.random() * 0.45);
                points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
            }
            return points;
        };

        // SIMPLE PUFFY CLOUDS - Ellipses with radial gradient fading edges
        const simpleClouds = Array.from({ length: 15 }, () => ({
            size: 25 + Math.random() * 45,
            x: Math.random(),
            y: 0.15 + Math.random() * 0.7,
            speed: 0.00003 + Math.random() * 0.00002,
            alpha: 0.25 + Math.random() * 0.2,
            stretch: 1.4 + Math.random() * 0.8
        }));

        // CONTINENT ZONES - Strictly spaced to prevent overlap
        const continentZones = [
            { size: 70, x: 0.1, y: 0.45 },
            { size: 35, x: 0.3, y: 0.7 },
            { size: 60, x: 0.5, y: 0.35 },
            { size: 45, x: 0.7, y: 0.65 },
            { size: 30, x: 0.9, y: 0.4 }
        ];

        const continents = continentZones.map(def => ({
            points: createFractalContinent(def.size),
            x: def.x,
            y: def.y,
            alpha: 1.0
        }));

        function renderFrame() {
            if (!ctx) return;

            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            const centerX = width * 0.75;
            const centerY = height * 0.5;
            const globeRadius = Math.min(width, height) * 0.48;

            // 0. DISTANT MOON (Scientifically scaled - Moon is ~1/4 Earth diameter)
            // At typical viewing distance, moon appears about 8-12% of Earth's size
            const moonRadius = globeRadius * 0.1;
            const moonX = width * 0.15;
            const moonY = height * 0.35;

            ctx.globalCompositeOperation = 'source-over';
            ctx.save();

            // Moon base (gray)
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
            const moonGrad = ctx.createRadialGradient(
                moonX - moonRadius * 0.3, moonY - moonRadius * 0.3, 0,
                moonX, moonY, moonRadius
            );
            moonGrad.addColorStop(0, '#d4d4d4');
            moonGrad.addColorStop(0.7, '#a0a0a0');
            moonGrad.addColorStop(1, '#606060');
            ctx.fillStyle = moonGrad;
            ctx.fill();

            // Moon shading (terminator shadow)
            const moonShadow = ctx.createRadialGradient(
                moonX + moonRadius * 0.4, moonY + moonRadius * 0.3, 0,
                moonX + moonRadius * 0.4, moonY + moonRadius * 0.3, moonRadius * 1.2
            );
            moonShadow.addColorStop(0, 'rgba(0,0,0,0)');
            moonShadow.addColorStop(0.6, 'rgba(0,0,0,0.3)');
            moonShadow.addColorStop(1, 'rgba(0,0,0,0.7)');
            ctx.fillStyle = moonShadow;
            ctx.fill();
            ctx.restore();

            // 1. DISTANT ATMOSPHERE (Outer Halo)
            ctx.globalCompositeOperation = 'screen';
            const outerHalo = ctx.createRadialGradient(centerX, centerY, globeRadius * 0.95, centerX, centerY, globeRadius * 1.6);
            outerHalo.addColorStop(0, hexToRgba(palette.glow, 0.4));
            outerHalo.addColorStop(0.5, hexToRgba(palette.glow, 0.1));
            outerHalo.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = outerHalo;
            ctx.fillRect(0, 0, width, height);

            // 2. PLANET MASK
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
            ctx.clip();

            // Ocean
            ctx.fillStyle = palette.ocean;
            ctx.fill();

            // 3. CONTINENTS (Smoother with bezier curves)
            const rotation = time * 0.00002;

            ctx.globalCompositeOperation = 'source-over';
            continents.forEach(c => {
                let currentX = (c.x + rotation) % 1.0;
                const angle = (currentX * Math.PI * 2) - Math.PI;
                if (Math.abs(angle) > Math.PI / 2) return;

                const pixelX = Math.sin(angle) * globeRadius;
                const drawX = centerX + pixelX;
                const drawY = centerY - globeRadius + (c.y * globeRadius * 2);

                ctx.save();
                ctx.translate(drawX, drawY);
                const squeeze = Math.cos(angle);
                ctx.scale(squeeze, 1.0);
                ctx.globalAlpha = Math.max(0, squeeze) * c.alpha;

                // Smooth bezier curves for rounded continent edges
                ctx.beginPath();
                c.points.forEach((p, idx) => {
                    const next = c.points[(idx + 1) % c.points.length];
                    const ctrl = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
                    if (idx === 0) ctx.moveTo(ctrl.x, ctrl.y);
                    ctx.quadraticCurveTo(p.x, p.y, ctrl.x, ctrl.y);
                });
                ctx.closePath();
                ctx.fillStyle = palette.land;
                ctx.fill();
                ctx.restore();
            });

            // 4. PUFFY CLOUDS (Simple ellipses with radial gradient fade)
            simpleClouds.forEach(cl => {
                const cloudRot = time * cl.speed;
                let currentX = (cl.x + cloudRot) % 1.0;
                const angle = (currentX * Math.PI * 2) - Math.PI;
                if (Math.abs(angle) > Math.PI / 2) return;

                const pixelX = Math.sin(angle) * (globeRadius + 2);
                const drawX = centerX + pixelX;
                const drawY = centerY - globeRadius + (cl.y * globeRadius * 2);

                ctx.save();
                ctx.translate(drawX, drawY);
                const squeeze = Math.cos(angle);
                ctx.scale(squeeze * cl.stretch, 1.0);
                ctx.globalAlpha = Math.max(0, squeeze) * cl.alpha;

                // Simple ellipse with radial gradient (puffy, fading edges)
                const cloudGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, cl.size);
                cloudGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
                cloudGrad.addColorStop(0.5, 'rgba(255,255,255,0.5)');
                cloudGrad.addColorStop(1, 'rgba(255,255,255,0)');

                ctx.beginPath();
                ctx.arc(0, 0, cl.size, 0, Math.PI * 2);
                ctx.fillStyle = cloudGrad;
                ctx.fill();
                ctx.restore();
            });

            // 5. SOFT LIGHTING (No dark/black shading)

            // A: Specular highlight (bright side)
            ctx.globalCompositeOperation = 'screen';
            const spec = ctx.createRadialGradient(
                centerX - globeRadius * 0.5, centerY - globeRadius * 0.4, 0,
                centerX - globeRadius * 0.5, centerY - globeRadius * 0.4, globeRadius * 1.15
            );
            spec.addColorStop(0, 'rgba(255,255,255,0.2)');
            spec.addColorStop(0.5, 'rgba(255,255,255,0.05)');
            spec.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = spec;
            ctx.fill();

            // B: Blue Fresnel Rim (atmospheric glow at edge)
            const blueRim = ctx.createRadialGradient(centerX, centerY, globeRadius * 0.85, centerX, centerY, globeRadius);
            blueRim.addColorStop(0, 'rgba(0,0,0,0)');
            blueRim.addColorStop(0.9, hexToRgba(palette.rim, 0.3));
            blueRim.addColorStop(1, hexToRgba(palette.rim, 0.6));
            ctx.fillStyle = blueRim;
            ctx.fill();

            ctx.restore();

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
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            {starSettings?.enabled !== false && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    {React.useMemo(() => (
                        [...Array(40)].map((_, i) => {
                            // Get user's star color (supports hex colors)
                            const userColor = starSettings?.color || BRAND.white;
                            const isUserBrand = userColor === 'brand';
                            const starColor = isUserBrand
                                ? palette.stars[i % 2]
                                : userColor;

                            return (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        width: Math.random() * 2 + 0.5 + 'px',
                                        height: Math.random() * 2 + 0.5 + 'px',
                                        background: starColor,
                                        borderRadius: '50%',
                                        top: Math.random() * 100 + '%',
                                        left: Math.random() * 100 + '%',
                                        opacity: Math.random() * 0.4 + 0.15,
                                        animation: `twinkGlobe ${Math.random() * 12 + 10}s linear infinite`,
                                    }}
                                />
                            );
                        })
                    ), [starSettings?.color, palette.stars])}
                </div>
            )}

            <canvas ref={canvasRef} style={{
                width: '100%',
                height: '100%',
                display: 'block',
                position: 'relative',
                zIndex: 1,
                filter: 'none'
            }} />
        </div>
    );
};

export default GlobeBanner;
