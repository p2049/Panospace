import React, { useRef, useEffect } from 'react';

/**
 * AetherBanner
 * "Solar Flare" - Sweeping, organic arcs of luminous data.
 * Glacial, ethereal, Sleepy vibe. Brand colors.
 * Enhanced with better color blending and multi-layered arcs.
 */
const AetherBanner = ({ starSettings, variant = 'main' }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const BRAND = {
        voidPurple: '#2A0E61',
        deepOrbit: '#5A3FFF',
        auroraMint: '#8CFFE9',
        ionBlue: '#1B82FF',
        auroraBlue: '#7FDBFF',
        cosmicPeriwinkle: '#A7B6FF',
        solarPink: '#FF5C8A',
        white: '#FFFFFF'
    };

    const isBrand = starSettings?.color === 'brand';
    const starColorProp = (starSettings?.color && !isBrand) ? starSettings.color : BRAND.white;

    const VARIANTS = {
        main: { bg: '#03000a', colors: [BRAND.cosmicPeriwinkle, BRAND.auroraBlue, BRAND.solarPink] },
        mint: { bg: '#000806', colors: [BRAND.auroraMint, BRAND.white, BRAND.ionBlue] },
        deep: { bg: '#010108', colors: [BRAND.ionBlue, BRAND.deepOrbit, BRAND.voidPurple] }
    };

    const palette = VARIANTS[variant] || VARIANTS.main;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let time = 0;

        const isLowPower = window.innerWidth <= 768;

        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const curves = Array.from({ length: 12 }, (_, i) => ({
            cp1x: Math.random(),
            cp1y: Math.random(),
            cp2x: Math.random(),
            cp2y: Math.random(),
            endX: Math.random(),
            endY: Math.random(),
            color: palette.colors[i % palette.colors.length],
            thickness: Math.random() * 60 + 30,
            phase: Math.random() * Math.PI * 2,
            speed: 0.0001 + Math.random() * 0.0001,
            yOffset: (Math.random() - 0.5) * 50
        }));

        function renderFrame() {
            if (!ctx) return;

            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';

            curves.forEach((c, i) => {
                const shift = Math.sin(time * c.speed + c.phase) * 50;
                const alpha = (Math.sin(time * 0.0001 + c.phase) * 0.1 + 0.2);

                ctx.beginPath();
                ctx.moveTo(-100, height * 0.5 + shift + c.yOffset);
                ctx.bezierCurveTo(
                    c.cp1x * width + shift, c.cp1y * height,
                    c.cp2x * width, c.cp2y * height + shift,
                    width + 100, height * 0.5 - shift + c.yOffset
                );

                const grad = ctx.createLinearGradient(0, 0, width, 0);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(0.5, hexToRgba(c.color, alpha));
                grad.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.lineWidth = c.thickness;
                ctx.strokeStyle = grad;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Inner glow highlight
                if (!isLowPower) {
                    ctx.lineWidth = c.thickness * 0.2;
                    ctx.strokeStyle = hexToRgba(c.color, alpha * 0.5);
                    ctx.stroke();
                }
            });

            // Readability Darkening
            ctx.globalCompositeOperation = 'multiply';
            const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
            topGrad.addColorStop(0, '#0a0a0a');
            topGrad.addColorStop(1, '#FFFFFF');
            ctx.fillStyle = topGrad;
            ctx.fillRect(0, 0, width, height * 0.45);

            if (!isLowPower) {
                time += 1;
                animationRef.current = requestAnimationFrame(renderFrame);
            }
        }

        const resize = () => {
            width = canvas.width = canvas.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.offsetHeight || 200;
            renderFrame();
        };

        window.addEventListener('resize', resize);
        resize();

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
                        return [...Array(35)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    width: Math.random() * 2 + 1 + 'px',
                                    height: Math.random() * 2 + 1 + 'px',
                                    background: isBrand ? brandColors[i % brandColors.length] : starColorProp,
                                    borderRadius: '50%',
                                    top: Math.random() * 100 + '%',
                                    left: Math.random() * 100 + '%',
                                    opacity: Math.random() * 0.4 + 0.2,
                                    animation: `aetherTwink ${Math.random() * 9 + 7}s ease-in-out infinite`,
                                }}
                            />
                        ));
                    }, [isBrand, starColorProp])}
                </div>
            )}
            <canvas ref={canvasRef} style={{
                width: '100%',
                height: '100%',
                display: 'block',
                position: 'relative',
                zIndex: 1,
                filter: 'blur(45px) saturate(2.0) brightness(1.1)'
            }} />
            <style>{`
                @keyframes aetherTwink {
                    0%, 100% { opacity: 0.1; filter: blur(1px); }
                    50% { opacity: 0.6; filter: blur(0px); }
                }
            `}</style>
        </div>
    );
};

export default AetherBanner;
