import React, { useRef, useEffect, useState, useMemo } from 'react';

// BRAND COLORS (Copied from cityThemes to ensure standalone stability)
const COLORS = {
    auroraMint: '#7FFFD4',
    solarPink: '#FF5C8A',
    ionBlue: '#1B82FF',
    deepOrbitPurple: '#5A3FFF',
    neonOrange: '#FF914D'
};

const RENDER_CACHE = new Map();

const OmegaBorealis = () => {
    // -------------------------------------------------------------------------
    // LAYER 1: NORTHERN LIGHTS (React/CSS/SVG Implementation)
    // -------------------------------------------------------------------------
    // Literal copy of the "Northern Lights" implementation from BannerThemeRenderer.jsx
    // Adapted slightly to be a background component.

    // Star Logic
    const stars = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 5
    })), []);

    // -------------------------------------------------------------------------
    // LAYER 2 & 3: OMEGASPHERE + PARADOX (Canvas Implementation)
    // -------------------------------------------------------------------------
    const canvasRef = useRef(null);
    const [canvasImage, setCanvasImage] = useState('');

    useEffect(() => {
        if (RENDER_CACHE.has('omega_borealis')) {
            setCanvasImage(RENDER_CACHE.get('omega_borealis'));
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = 2560;
        const h = 800; // Banner-optimized height
        canvas.width = w;
        canvas.height = h;
        const cx = w * 0.5;
        const cy = h * 0.5; // Centered

        // CLEAR CANVAS (Transparent background to let Northern Lights show through)
        ctx.clearRect(0, 0, w, h);

        // =====================================================================
        // EFFECT A: THE OMEGASPHERE (From OmegasphereBanner.jsx)
        // =====================================================================
        // 3D Point Cloud Projection
        // Optimized: 2000 -> 800
        const density = 800;
        const radius = 275;   // Scale for 1080p (was 550)
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        for (let i = 0; i < density; i++) {
            const y = 1 - (i / (density - 1)) * 2;
            const rRadius = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const x = Math.cos(theta) * rRadius;
            const z = Math.sin(theta) * rRadius;

            // Project
            const scale = radius;
            const px = cx + x * scale;
            const py = cy + y * scale;

            // Z-Depth
            const size = 1.5 + (z + 1) * 3;
            const alpha = 0.3 + (z + 1) * 0.5;

            if (z < -0.5) continue; // Cull back

            ctx.save();
            ctx.translate(px, py);

            // Rotation for spin effect
            // We want it to look static but dynamic, let's rotate shards to center
            const rot = Math.atan2(y, x);
            ctx.rotate(rot);

            // Color Mix
            ctx.fillStyle = z > 0.6 ? COLORS.auroraMint : (Math.random() > 0.5 ? COLORS.ionBlue : COLORS.deepOrbitPurple);
            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation = 'screen';

            // Shard Shape
            ctx.beginPath();
            ctx.moveTo(-size, -size / 2);
            ctx.lineTo(size * 2, 0);
            ctx.lineTo(-size, size / 2);
            ctx.fill();
            ctx.restore();
        }

        // =====================================================================
        // EFFECT B: THE PARADOX (From ParadoxBanner.jsx)
        // =====================================================================
        // We render the manifold INSIDE the sphere

        const renderManifold = (centerX, centerY, phase, scaleFactor) => {
            // Optimized steps for 1080p
            const uSteps = 70;
            const vSteps = 40;
            const PHI = 1.618;

            const localPoints = [];

            for (let i = 0; i < uSteps; i++) {
                for (let j = 0; j < vSteps; j++) {
                    const u = (i / uSteps) * Math.PI * 2;
                    const v = (j / vSteps) * Math.PI;

                    // "Golden Flower" Math
                    const r = (250 + 80 * Math.sin(PHI * 3 * u + phase) * Math.cos(4 * v)) * scaleFactor;
                    const twist = Math.sin(3 * u + PHI * v + phase);

                    const x = r * Math.sin(v) * Math.cos(u);
                    const y = r * Math.sin(v) * Math.sin(u);
                    const z = r * Math.cos(v);

                    const dx = x + Math.sin(y * 0.01 + phase) * 80 * twist;
                    const dy = y + Math.cos(z * 0.01) * 80 * twist;
                    const dz = z + Math.sin(x * 0.01) * 80 * twist;

                    localPoints.push({ x: dx, y: dy, z: dz });
                }
            }

            const project = (p) => {
                const t = 0.5 + phase * 0.5;
                const rotX = p.x * Math.cos(t) - p.z * Math.sin(t);
                const rotZ = p.x * Math.sin(t) + p.z * Math.cos(t);

                // Tilt it
                const tilt = 0.4;
                const rY = p.y * Math.cos(tilt) - rotZ * Math.sin(tilt);
                const rZ = p.y * Math.sin(tilt) + rotZ * Math.cos(tilt);

                const projScale = 1000 / (1000 - rZ);
                const px = centerX + rotX * projScale;
                const py = centerY + rY * projScale;

                return { x: px, y: py, z: rZ };
            };

            const projPoints = localPoints.map(project);

            // Draw using Screen blend to mix with Sphere
            ctx.lineWidth = 1.5;
            ctx.globalCompositeOperation = 'lighten';

            for (let i = 0; i < uSteps; i++) {
                for (let j = 0; j < vSteps - 1; j++) {
                    const idx1 = i * vSteps + j;
                    const idx2 = i * vSteps + (j + 1);
                    const p1 = projPoints[idx1];
                    const p2 = projPoints[idx2];

                    if (!p1 || !p2 || p1.z > 600) continue;

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);

                    // Color Logic - Paradox Pink/Orange to contrast Sphere Blue/Mint
                    const uNorm = i / uSteps;
                    const color = Math.cos(uNorm * Math.PI + phase) > 0 ? COLORS.solarPink : COLORS.neonOrange;

                    ctx.strokeStyle = color;

                    const depthAlpha = (p1.z + 500) / 1000;
                    ctx.globalAlpha = Math.max(0, Math.min(1, depthAlpha * 0.6)); // Slightly subtler
                    ctx.stroke();
                }
            }
        };

        // Render two Paradox manifolds at the sides
        const scaleFactor = 0.8; // Slightly smaller to fit with the sphere

        // Right Paradox (Standard Phase)
        renderManifold(w * 0.75, cy, 0, scaleFactor);

        // Left Paradox (Inverted Phase)
        renderManifold(w * 0.25, cy, Math.PI, scaleFactor);


        // =====================================================================
        // FINAL COMPOSITING
        // =====================================================================

        // Add a central "Core Processor" glow from Omegasphere to bind them
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400);
        core.addColorStop(0, COLORS.ionBlue);
        core.addColorStop(0.3, 'transparent');
        ctx.fillStyle = core;
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.arc(cx, cy, 400, 0, Math.PI * 2);
        ctx.fill();

        // Convert to image
        const result = canvas.toDataURL('image/webp', 0.9);
        RENDER_CACHE.set('omega_borealis', result);
        setCanvasImage(result);

    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#020205',
            overflow: 'hidden',
            zIndex: 0
        }}>
            {/* ========================================= */}
            {/* EFFECT 1: NORTHERN LIGHTS (Background)    */}
            {/* ========================================= */}

            {/* 1. Deep Night Sky Background */}
            <div style={{ position: 'absolute', inset: 0, background: '#020205', zIndex: 0 }} />

            {/* 2. Stars */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                {stars.map((star) => (
                    <div
                        key={star.id}
                        style={{
                            position: 'absolute',
                            width: star.size + 'px',
                            height: star.size + 'px',
                            background: '#E0FFFF',
                            borderRadius: '50%',
                            top: star.top + '%',
                            left: star.left + '%',
                            opacity: Math.random() * 0.7 + 0.3,
                            boxShadow: `0 0 ${star.size + 1}px #E0FFFF`,
                            animation: `twinkle ${star.delay + 3}s ease-in-out infinite`,
                            animationDelay: `${star.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* 3. THE AURORA BOREALIS - Full Sky Curtains (SVG Filter) */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', mixBlendMode: 'screen', overflow: 'hidden'
            }}>
                <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                    <defs>
                        <filter id="aurora-curtains-hybrid">
                            <feTurbulence type="fractalNoise" baseFrequency="0.002 0.04" numOctaves="3" result="noise" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="200" xChannelSelector="R" yChannelSelector="G" />
                            <feGaussianBlur stdDeviation="8" />
                        </filter>
                    </defs>
                </svg>

                {/* Layer 1: Purple/Blue Deep Atmosphere */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(to top, rgba(90, 63, 255, 0.1) 0%, rgba(27, 130, 255, 0.0) 50%, rgba(90, 63, 255, 0.4) 100%)',
                    filter: 'blur(30px)', opacity: 0.8
                }} />

                {/* Layer 2: Main Green Ribbon */}
                <div style={{
                    position: 'absolute', top: '-10%', left: '-20%', right: '-20%', bottom: '-20%',
                    transform: 'perspective(500px) rotateX(10deg) skewY(-5deg)',
                    filter: 'url(#aurora-curtains-hybrid) brightness(1.4)',
                    background: 'repeating-linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1) 5%, rgba(0, 255, 136, 0.8) 15%, rgba(127, 255, 212, 0.5) 25%, transparent 35%, transparent 60%)',
                    opacity: 0.7, // Slightly reduced to let Canvas show
                    mixBlendMode: 'normal'
                }} />

                {/* Layer 3: Pink Ionization Spikes */}
                <div style={{
                    position: 'absolute', top: '0%', left: '-10%', right: '-10%', bottom: '0',
                    transform: 'perspective(500px) rotateX(15deg) skewY(-2deg)',
                    filter: 'url(#aurora-curtains-hybrid) blur(2px)',
                    background: 'repeating-linear-gradient(90deg, transparent, transparent 40%, rgba(255, 42, 109, 0.7) 42%, transparent 45%, transparent 80%, rgba(255, 42, 109, 0.6) 82%, transparent 85%)',
                    opacity: 0.8, mixBlendMode: 'screen'
                }} />
            </div>

            {/* ========================================= */}
            {/* EFFECT 2 & 3: OMEGA + PARADOX (Overlay)   */}
            {/* ========================================= */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1, // Lowered from 10 to 1
                backgroundImage: `url(${canvasImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'screen' // Blend heavily with Aurora
            }} />

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <style>{`
                @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
            `}</style>
        </div>
    );
};

export default OmegaBorealis;
