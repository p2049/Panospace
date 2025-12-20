import React, { useRef, useEffect } from 'react';

/**
 * IsoWaveBanner
 * A topography of silence.
 * Integrated darkening and brand color support.
 */
const IsoWaveBanner = ({ color = '#7FFFD4', starSettings }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const isBrand = starSettings?.color === 'brand';
    const starColor = (starSettings?.color && !isBrand) ? starSettings.color : color;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;

        const isLowPower = window.innerWidth <= 768;

        const resize = () => {
            width = canvas.width = canvas.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.offsetHeight || 200;
            if (isLowPower) renderFrame();
        };
        window.addEventListener('resize', resize);
        resize();

        const numLines = 50;
        const lineOffsets = Array.from({ length: numLines }, () => Math.random() * 1000);
        let time = 0;

        const renderFrame = () => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            const stepX = Math.max(width / 80, 5);

            for (let i = 0; i < numLines; i++) {
                const normalizedI = i / numLines;
                const startY = height * 0.60;
                const endY = height * 1.2;
                const baseY = startY + (normalizedI * (endY - startY));

                ctx.beginPath();
                ctx.moveTo(-50, height + 100);
                ctx.lineTo(-50, baseY);

                for (let x = -50; x <= width + 50; x += stepX) {
                    const swell = Math.sin(x * 0.002 + time * 0.05 + lineOffsets[i] * 0.1) * (height * 0.03);
                    const ripple = Math.sin(x * 0.03 - time + i) * 3;
                    ctx.lineTo(x, baseY + swell + ripple);
                }

                ctx.lineTo(width + 50, height + 100);
                ctx.closePath();

                ctx.fillStyle = '#000000';
                ctx.fill();

                ctx.globalAlpha = Math.min(normalizedI + 0.1, 1);
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = color;

                if (i > numLines * 0.6) {
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = color;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }

            // Canvas-Integrated Darkening for Readability
            ctx.globalCompositeOperation = 'multiply';
            const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.4);
            topGrad.addColorStop(0, '#111111');
            topGrad.addColorStop(1, '#FFFFFF');
            ctx.fillStyle = topGrad;
            ctx.fillRect(0, 0, width, height * 0.4);

            if (!isLowPower) {
                time += 0.0004;
                animationRef.current = requestAnimationFrame(renderFrame);
            }
        };

        if (!isLowPower) {
            renderFrame();
        } else {
            renderFrame();
        }

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [color]);

    return (
        <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
            {starSettings?.enabled && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    {React.useMemo(() => {
                        const brandColors = ['#7FFFD4', '#FF5C8A', '#5A3FFF', '#1B82FF', '#FFFFFF'];
                        return [...Array(40)].map((_, i) => {
                            const thisStarColor = isBrand
                                ? brandColors[Math.floor(Math.random() * brandColors.length)]
                                : starColor;
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
                    }, [isBrand, starColor])}
                </div>
            )}

            <canvas ref={canvasRef} style={{
                width: '100%', height: '100%',
                display: 'block',
                position: 'relative',
                zIndex: 1
            }} />

            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

export default IsoWaveBanner;
