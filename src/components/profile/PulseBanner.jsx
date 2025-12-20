import React, { useRef, useEffect } from 'react';

/**
 * PulseBanner
 * "Void Bloom" - Breathing, overlapping spheres of soft light.
 * Гlacial movement, Brand Colors, Starfield support.
 */
const PulseBanner = ({ starSettings, variant = 'main' }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const BRAND = {
        voidPurple: '#2A0E61',
        deepOrbit: '#5A3FFF',
        auroraMint: '#8CFFE9',
        ionBlue: '#1B82FF',
        solarPink: '#FF5C8A',
        nebulaPink: '#FFB7D5',
        auroraBlue: '#7FDBFF',
        cosmicPeriwinkle: '#A7B6FF',
        white: '#FFFFFF'
    };

    const isBrand = starSettings?.color === 'brand';
    const starColorProp = (starSettings?.color && !isBrand) ? starSettings.color : BRAND.white;

    const VARIANTS = {
        main: {
            bg: '#050510',
            colors: [BRAND.solarPink, BRAND.deepOrbit, BRAND.cosmicPeriwinkle]
        },
        arctic: {
            bg: '#000810',
            colors: [BRAND.auroraMint, BRAND.auroraBlue, BRAND.white]
        },
        toxic: {
            bg: '#051005',
            colors: [BRAND.auroraMint, BRAND.ionBlue, BRAND.auroraMint]
        }
    };

    const palette = VARIANTS[variant] || VARIANTS.main;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;

        const isLowPower = window.innerWidth <= 768;

        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const orbs = Array.from({ length: 6 }, (_, i) => ({
            x: Math.random() * (canvas.offsetWidth || window.innerWidth),
            y: Math.random() * (canvas.offsetHeight || 200),
            radius: Math.random() * ((canvas.offsetWidth || window.innerWidth) * 0.4) + ((canvas.offsetWidth || window.innerWidth) * 0.2),
            color: palette.colors[i % palette.colors.length],
            phase: Math.random() * Math.PI * 2,
            speed: 0.0001 + Math.random() * 0.0001
        }));

        function renderFrame(time) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';
            orbs.forEach(orb => {
                const pulse = Math.sin(time * orb.speed + orb.phase) * 0.15 + 0.85;
                const r = orb.radius * pulse;

                const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
                grad.addColorStop(0, hexToRgba(orb.color, 0.4));
                grad.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, width, height);
            });

            // Readability Darkening
            ctx.globalCompositeOperation = 'multiply';
            const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.4);
            topGrad.addColorStop(0, '#111111');
            topGrad.addColorStop(1, '#FFFFFF');
            ctx.fillStyle = topGrad;
            ctx.fillRect(0, 0, width, height * 0.4);

            if (!isLowPower) {
                animationRef.current = requestAnimationFrame(renderFrame);
            }
        }

        const resize = () => {
            width = canvas.width = canvas.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.offsetHeight || 200;
            if (isLowPower) renderFrame(0);
        };

        window.addEventListener('resize', resize);
        resize();

        if (!isLowPower) {
            animationRef.current = requestAnimationFrame(renderFrame);
        } else {
            renderFrame(0);
        }

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [variant]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: palette.bg }}>
            {starSettings?.enabled && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    {React.useMemo(() => {
                        const brandColors = [BRAND.auroraMint, BRAND.solarPink, BRAND.deepOrbit, BRAND.ionBlue, BRAND.white];
                        return [...Array(30)].map((_, i) => {
                            const thisStarColor = isBrand ? brandColors[i % brandColors.length] : starColorProp;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        width: Math.random() * 2 + 1 + 'px',
                                        height: Math.random() * 2 + 1 + 'px',
                                        background: thisStarColor,
                                        borderRadius: '50%',
                                        top: Math.random() * 100 + '%',
                                        left: Math.random() * 100 + '%',
                                        opacity: Math.random() * 0.5 + 0.3,
                                        animation: `twinkAtmos ${Math.random() * 8 + 6}s ease-in-out infinite`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        boxShadow: `0 0 ${Math.random() * 3 + 2}px ${thisStarColor}`,
                                    }}
                                />
                            );
                        });
                    }, [isBrand, starColorProp])}
                </div>
            )}
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', position: 'relative', zIndex: 1, filter: 'blur(40px) saturate(1.8)' }} />
            <style>{`
                @keyframes twinkAtmos {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

export default PulseBanner;
