import React, { useRef, useEffect } from 'react';

/**
 * ElysiumBanner
 * A visual sanctuary. High-saturation luminous fields.
 * Support for Stars and Mobile Static Render.
 * Glacial movement for soothing effect.
 */
const ElysiumBanner = ({ starSettings }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const BRAND = {
        voidPurple: '#2A0E61',
        solarPink: '#FF5C8A',
        auroraMint: '#8CFFE9',
        nebulaPink: '#FFB7D5',
        cosmicPeriwinkle: '#A7B6FF',
        auroraBlue: '#7FDBFF',
        white: '#FFFFFF'
    };

    const isBrand = starSettings?.color === 'brand';
    const starColorProp = (starSettings?.color && !isBrand) ? starSettings.color : BRAND.white;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;

        const isLowPower = window.innerWidth <= 768;

        const resize = () => {
            width = canvas.width = canvas.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.offsetHeight || 200;
            if (isLowPower) renderFrame(0);
        };
        window.addEventListener('resize', resize);
        resize();

        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const orbs = [
            { color: BRAND.auroraMint, alpha: 0.6, size: 1.2 },
            { color: BRAND.cosmicPeriwinkle, alpha: 0.7, size: 1.0 },
            { color: BRAND.solarPink, alpha: 0.5, size: 1.3 },
            { color: BRAND.auroraBlue, alpha: 0.6, size: 0.8 },
            { color: BRAND.nebulaPink, alpha: 0.5, size: 1.5 }
        ].map((c) => ({
            ...c,
            x: Math.random() * width,
            y: height * 0.5 + (Math.random() - 0.5) * height,
            vx: (Math.random() - 0.5) * 0.04,
            vy: (Math.random() - 0.5) * 0.04,
            radius: (Math.random() * 300 + 500) * c.size,
            phase: Math.random() * Math.PI * 2
        }));

        const renderFrame = (time) => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = BRAND.voidPurple;
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';
            orbs.forEach(orb => {
                if (!isLowPower) {
                    orb.x += orb.vx; orb.y += orb.vy;
                    if (orb.x < -orb.radius) orb.x = width + orb.radius;
                    if (orb.x > width + orb.radius) orb.x = -orb.radius;
                    if (orb.y < -orb.radius) orb.y = height + orb.radius;
                    if (orb.y > height + orb.radius) orb.y = -orb.radius;
                }

                const pulse = Math.sin(time * 0.00004 + orb.phase) * 0.05 + 0.95;
                const r = orb.radius * pulse;
                const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
                grad.addColorStop(0, hexToRgba(orb.color, orb.alpha));
                grad.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, width, height);
            });

            ctx.globalCompositeOperation = 'multiply';
            const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.4);
            topGrad.addColorStop(0, '#111111');
            topGrad.addColorStop(1, '#FFFFFF');
            ctx.fillStyle = topGrad;
            ctx.fillRect(0, 0, width, height * 0.4);

            if (!isLowPower) {
                animationRef.current = requestAnimationFrame(renderFrame);
            }
        };

        if (!isLowPower) {
            animationRef.current = requestAnimationFrame(renderFrame);
        } else {
            renderFrame(0);
        }

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: BRAND.voidPurple }}>
            {starSettings?.enabled && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    {React.useMemo(() => {
                        const brandColors = ['#7FFFD4', '#FF5C8A', '#5A3FFF', '#1B82FF', '#FFFFFF'];
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
                                        animation: `twinkle ${Math.random() * 6 + 5}s ease-in-out infinite`,
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
                filter: 'blur(50px) saturate(2.0)',
                position: 'relative',
                zIndex: 1
            }} />

            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

export default ElysiumBanner;
