import React, { useRef, useEffect } from 'react';

/**
 * AuroraBanner
 * The Signature of Panospace (formerly Protocol V).
 * STRICT BRAND COLORS ONLY.
 */
const AuroraBanner = ({ starSettings, variant = 'main' }) => {
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

    // Color Variations - STRICT BRAND PACK
    const VARIANTS = {
        main: {
            bg: '#0a0518',
            coreGrad: [BRAND.auroraMint, BRAND.deepOrbit],
            shardColors: [BRAND.auroraMint, BRAND.ionBlue]
        },
        arctic: {
            bg: '#050a18',
            coreGrad: [BRAND.auroraBlue, BRAND.white],
            shardColors: [BRAND.auroraBlue, BRAND.white]
        },
        solar: {
            bg: '#180510',
            coreGrad: [BRAND.solarPink, BRAND.nebulaPink],
            shardColors: [BRAND.solarPink, BRAND.nebulaPink]
        },
        synth: {
            bg: '#0a0518',
            coreGrad: [BRAND.auroraMint, BRAND.solarPink],
            shardColors: [BRAND.auroraMint, BRAND.solarPink]
        },
        void: {
            bg: '#050010',
            coreGrad: [BRAND.deepOrbit, BRAND.voidPurple],
            shardColors: [BRAND.deepOrbit, BRAND.cosmicPeriwinkle]
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

        const shards = Array.from({ length: 30 }, () => ({
            x: Math.random() * (canvas.offsetWidth || window.innerWidth),
            targetX: Math.random() * (canvas.offsetWidth || window.innerWidth),
            width: Math.random() * 60 + 30,
            h: Math.random() * 40 + 20,
            speed: Math.random() * 0.0004 + 0.0002,
            color: palette.shardColors[Math.floor(Math.random() * palette.shardColors.length)],
            opacity: Math.random() * 0.5 + 0.2
        }));

        let time = 0;

        function renderFrame() {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';
            // Use 50% for centering, or slightly lower for effect. 
            // Was 0.85 which pushed it too far down on thin banners.
            const coreY = height * 0.5;
            const bandHeight = height * 0.6; // Scale height relatively

            const grad = ctx.createLinearGradient(0, coreY - bandHeight / 2, 0, coreY + bandHeight / 2);
            grad.addColorStop(0.2, 'transparent');
            grad.addColorStop(0.5, hexToRgba(palette.coreGrad[0], 0.4));
            grad.addColorStop(0.8, hexToRgba(palette.coreGrad[1], 0.3));
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.fillRect(0, coreY - bandHeight / 2, width, bandHeight);

            shards.forEach(s => {
                if (!isLowPower) {
                    s.x += (s.targetX - s.x) * s.speed;
                    if (Math.abs(s.targetX - s.x) < 2) s.targetX = Math.random() * width;
                }
                const pulse = Math.sin(time * 0.04 + s.x * 0.005) * 0.5 + 0.5;
                // Scale shard height relative to canvas height
                // original was 20-60, let's say 10%-30% of height?
                const baseH = s.h * (height / 200);
                const h = baseH * (1 + pulse * 2);

                ctx.globalAlpha = s.opacity * (0.4 + pulse * 0.6);
                ctx.fillStyle = s.color;
                ctx.fillRect(s.x, coreY - h / 2, s.width, h);
            });

            ctx.globalCompositeOperation = 'multiply';
            const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.35);
            topGrad.addColorStop(0, '#111111');
            topGrad.addColorStop(1, '#FFFFFF');
            ctx.fillStyle = topGrad;
            ctx.fillRect(0, 0, width, height * 0.35);

            if (!isLowPower) {
                ctx.globalAlpha = 1.0;
                time += 0.0005;
                animationRef.current = requestAnimationFrame(renderFrame);
            }
        }

        const resize = () => {
            width = canvas.width = canvas.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.offsetHeight || 200;
            if (isLowPower) renderFrame();
        };

        window.addEventListener('resize', resize);
        resize();

        if (!isLowPower) {
            renderFrame();
        } else {
            renderFrame();
        }

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [variant]); // Re-init on variant change

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            {starSettings?.enabled && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    {React.useMemo(() => {
                        const brandColors = [BRAND.auroraMint, BRAND.solarPink, BRAND.deepOrbit, BRAND.ionBlue, BRAND.white];
                        return [...Array(40)].map((_, i) => {
                            const thisStarColor = isBrand
                                ? brandColors[Math.floor(Math.random() * brandColors.length)]
                                : starColorProp;
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
                                        animation: `twinkle ${Math.random() * 7 + 6}s ease-in-out infinite`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        boxShadow: `0 0 ${Math.random() * 3 + 2}px ${thisStarColor}`,
                                    }}
                                />
                            );
                        });
                    }, [isBrand, starColorProp])}
                </div>
            )}

            <canvas ref={canvasRef} style={{
                width: '100%', height: '100%',
                display: 'block',
                filter: 'blur(30px) saturate(2.2) brightness(1.1)',
                position: 'relative',
                zIndex: 1
            }} />

            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
};

export default AuroraBanner;
