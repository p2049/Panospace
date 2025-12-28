import React, { useRef, useEffect, useMemo } from 'react';

/**
 * SubmarineWindowBanner - An immersive underwater window experience.
 * 
 * Features:
 * 1. DYNAMIC MARINE LIFE: Procedurally animated fish, creatures, and bubbles.
 * 2. VOLUMETRIC ATMOSPHERE: God rays and depth-based color gradients.
 * 3. SUBMERGED PARALLAX: Drifting sea floor, corals, and distant ocean floor.
 * 4. PORTHOLE PERSPECTIVE: Submerged observation deck with multiple window views.
 */
const SubmarineWindowBanner = ({ variant = 'sub_reef' }) => {
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
        sub_reef: {
            bg: ['#1B82FF', '#011627', '#000'],
            rim: '#8CFFE9',
            interior: '#05070a',
            fish: ['#FF5C8A', '#FF914D', '#FFF'],
            caustics: '#8CFFE933',
            speed: 1.0
        },
        sub_abyss: {
            bg: ['#0D2B36', '#010408', '#000'],
            rim: '#1B82FF',
            interior: '#010204',
            fish: ['#1B82FF', '#5A3FFF', '#8CFFE955'],
            caustics: '#1B82FF11',
            speed: 0.4
        },
        sub_neon: {
            bg: ['#2A0E61', '#1a0d33', '#000'],
            rim: '#FF5C8A',
            interior: '#080410',
            fish: ['#8CFFE9', '#FF5C8A', '#7FDBFF'],
            caustics: '#FF5C8A22',
            speed: 1.5
        }
    };

    const palette = PALETTES[variant] || PALETTES.sub_reef;

    // Generate static marine data for consistent but unique views
    const marineLife = useMemo(() => {
        // Schools of fish
        const schools = [...Array(12)].map(() => ({
            x: Math.random(),
            y: 0.2 + Math.random() * 0.6,
            depth: Math.random(),
            size: Math.random() * 3 + 2,
            speed: 0.05 + Math.random() * 0.1,
            count: 4 + Math.floor(Math.random() * 8),
            color: palette.fish[Math.floor(Math.random() * palette.fish.length)],
            phase: Math.random() * Math.PI * 2
        }));

        // Rising bubbles
        const bubbles = [...Array(50)].map(() => ({
            x: Math.random(),
            y: Math.random() + 1,
            size: Math.random() * 2 + 1,
            speed: 0.005 + Math.random() * 0.015,
            drift: Math.random() * Math.PI * 2
        }));

        // Corals/Plants on floor
        const plants = [...Array(30)].map(() => {
            const isPurpleBlue = Math.random() > 0.4;
            const coralPalette = isPurpleBlue
                ? ['#9d4edd', '#5a189a', '#240046', '#0077b6', '#00b4d8', '#48cae4']
                : palette.fish;

            return {
                x: Math.random(),
                y: 0.9,
                depth: Math.random(),
                height: 10 + Math.random() * 30,
                width: 2 + Math.random() * 5,
                color: coralPalette[Math.floor(Math.random() * coralPalette.length)],
                sway: 0.5 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2
            };
        });

        return { schools, bubbles, plants };
    }, [palette]);

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
                const time = Date.now() * 0.0005 * palette.speed;

                // --- 1. WATER BACKGROUND ---
                const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
                palette.bg.forEach((c, i) => bgGrad.addColorStop(i / (palette.bg.length - 1), c));
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, w, h);

                // --- 2. CAUSTICS (Light Rays) ---
                ctx.globalCompositeOperation = 'overlay';
                ctx.fillStyle = palette.caustics;
                for (let i = 0; i < 5; i++) {
                    const angle = (time * 0.2 + i * Math.PI / 2.5) % (Math.PI * 2);
                    const thickness = 20 + Math.sin(time + i) * 10;
                    ctx.beginPath();
                    ctx.moveTo(w / 2 + Math.cos(angle) * w, -50);
                    ctx.lineTo(w / 2 + Math.cos(angle + 0.2) * w + thickness, -50);
                    ctx.lineTo(w / 2 + Math.cos(angle + 0.2) * 20, h + 50);
                    ctx.lineTo(w / 2 + Math.cos(angle) * 20 - thickness, h + 50);
                    ctx.fill();
                }
                ctx.globalCompositeOperation = 'source-over';

                // --- 3. BUBBLES ---
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                marineLife.bubbles.forEach(b => {
                    const bx = ((b.x + viewOffsetX * 0.5 + Math.sin(time + b.drift) * 0.02) % 1) * w;
                    let by = ((b.y - time * b.speed * 2) % 1.2);
                    if (by < 0) by += 1.2;
                    const finalY = (by - 0.1) * h;

                    ctx.beginPath();
                    ctx.arc(bx, finalY, b.size, 0, Math.PI * 2);
                    ctx.fill();
                    // Sparkle
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillRect(bx - 0.5, finalY - 0.5, 1, 1);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                });

                // --- 4. SEA FLOOR PLANTS (DRIVING PERSPECTIVE) ---
                const subDriveProgress = time * palette.speed * 0.12;
                marineLife.plants.forEach(p => {
                    const parallaxFactor = (1.5 - p.depth * 0.8);
                    let pxRaw = (p.x - subDriveProgress * parallaxFactor + viewOffsetX * 0.4) % 1.0;
                    if (pxRaw < 0) pxRaw += 1.0;

                    const px = pxRaw * w;
                    const py = h * (0.85 + p.depth * 0.1);

                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = p.width * (1 - p.depth * 0.5);
                    ctx.lineCap = 'round';
                    ctx.globalAlpha = 0.2 + (1 - p.depth) * 0.8;

                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    const swayX = Math.sin(time * 2 + p.phase) * (5 + p.depth * 5);
                    ctx.quadraticCurveTo(px + swayX * 0.5, py - p.height * 0.5, px + swayX, py - p.height);
                    ctx.stroke();
                });
                ctx.globalAlpha = 1;

                // --- 5. SCHOOLS OF FISH (DRIVING PERSPECTIVE) ---
                marineLife.schools.forEach(s => {
                    const fishDriveSpeed = palette.speed * 0.2 * (1 - s.depth * 0.6);
                    const scrollX = time * (s.speed + fishDriveSpeed);

                    for (let i = 0; i < s.count; i++) {
                        const offset = i * 0.05;
                        let fxRaw = (s.x - scrollX + offset - viewOffsetX * 0.2) % 1.5;
                        if (fxRaw < 0) fxRaw += 1.5;

                        const fx = (fxRaw - 0.25) * w;
                        const fy = s.y * h + Math.sin(time * 3 + s.phase + i * 0.5) * 8;

                        if (fx > -40 && fx < w + 40) {
                            const size = s.size * (1 - s.depth * 0.5);
                            ctx.fillStyle = s.color;
                            ctx.globalAlpha = 0.3 + (1 - s.depth) * 0.7;

                            // Fish face forward (towards progress direction, which is left here)
                            ctx.beginPath();
                            ctx.ellipse(fx, fy, size, size * 0.5, 0, 0, Math.PI * 2);
                            ctx.fill();
                            // Tail (on the right)
                            ctx.beginPath();
                            ctx.moveTo(fx + size, fy);
                            const tailSwish = Math.sin(time * 10 + i) * size * 0.5;
                            ctx.lineTo(fx + size + size * 0.8, fy - size * 0.6 + tailSwish);
                            ctx.lineTo(fx + size + size * 0.8, fy + size * 0.6 + tailSwish);
                            ctx.fill();
                        }
                    }
                });

                // --- 6. OPTICAL DEPTH FOG (Edges of Window) ---
                const innerGlow = ctx.createRadialGradient(w / 2, h / 2, size ? parseInt(size) * 0.3 : 40, w / 2, h / 2, w / 2);
                innerGlow.addColorStop(0, 'transparent');
                innerGlow.addColorStop(1, 'rgba(0,0,0,0.4)');
                ctx.fillStyle = innerGlow;
                ctx.fillRect(0, 0, w, h);

                animationRef.current = requestAnimationFrame(render);
            };
            render();
            return () => cancelAnimationFrame(animationRef.current);
        }, [viewOffsetX, size, variant]);

        return (
            <div style={{
                width: size, height: size,
                position: 'relative', borderRadius: '50%',
                border: `6px solid ${palette.rim}33`,
                outline: `1.5px solid ${palette.rim}55`,
                boxShadow: `0 10px 30px rgba(0,0,0,0.9), inset 0 0 25px rgba(0,0,0,0.8)`,
                overflow: 'hidden', background: '#000',
                flexShrink: 0, transform: 'translateZ(0)'
            }}>
                {/* Bolts around porthole */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute', top: '50%', left: '50%',
                        width: '3px', height: '3px', background: palette.rim, borderRadius: '50%',
                        transform: `translate(-50%, -50%) rotate(${i * 60 + 30}deg) translateY(-${parseInt(size) / 2 - 3}px)`,
                        opacity: 0.5, zIndex: 10
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
            {/* Interior Ambient Lighting / Texture */}
            <div style={{
                position: 'absolute', inset: -20,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                animation: 'subMove 20s ease-in-out infinite', pointerEvents: 'none'
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `linear-gradient(to bottom, transparent 96%, ${palette.rim}08 98%, transparent 100%)`,
                    backgroundSize: '100% 30px', opacity: 0.5
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(circle at 50% 50%, transparent 60%, ${palette.bg[0]}05 100%)`
                }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', animation: 'subRock 25s ease-in-out infinite' }}>
                <Porthole viewOffsetX={0.0} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', animation: 'subRock 25s ease-in-out infinite reverse' }}>
                <Porthole viewOffsetX={0.2} />
            </div>
            <div style={{ position: 'relative' }}></div>
            <div style={{ display: 'flex', justifyContent: 'center', animation: 'subRock 25s ease-in-out infinite 3s' }}>
                <Porthole viewOffsetX={0.7} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', animation: 'subRock 25s ease-in-out infinite -3s' }}>
                <Porthole viewOffsetX={0.9} />
            </div>

            <style>{`
                @keyframes subMove { 0%, 100% { transform: translate(-2px, -3px) rotate(0.05deg); } 50% { transform: translate(2px, 2px) rotate(-0.05deg); } }
                @keyframes subRock { 0%, 100% { transform: translateY(-1px) rotate(-0.05deg); } 50% { transform: translateY(1px) rotate(0.05deg); } }
            `}</style>
        </div>
    );
};

export default SubmarineWindowBanner;
