import React, { useRef, useEffect, useState, useMemo } from 'react';

/**
 * STANDALONE MATHEMATICAL WALLPAPER ENGINE
 * 
 * This file contains the complete decoupled infrastructure for the 
 * mathematical generative art systems built for Panospace.
 * 
 * Features:
 * - 10-Entity Bouncing Physics
 * - Volumetric Stardust Trails
 * - 3 Dedicated Visual Modes: Fractal Heart (IFS), Kinetic Mandala, Nebula Singularity
 * - Fully Prop-Driven (No external dependencies)
 */

const THEME_COLORS = {
    MINT: '#7FFFD4',
    ION_BLUE: '#1B82FF',
    SOLAR_PINK: '#FF5C8A',
    DEEP_PURPLE: '#5A3FFF',
    WHITE: '#FFFFFF',
    AURORA: '#7FDBFF',
    NEON_PINK: '#FFB7D5'
};

const MathWallpaperEngine = ({
    mode = 'math_fire', // 'math_fire' | 'math_mandala' | 'math_nebula'
    entityCount = 10,
    speed = 1.0,
    trailLength = 80,
    opacity = 1.0,
    resolutionScale = 1.0 // Use > 1.0 for high-res exports
}) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    // Decoupled Physics State
    const [systems, setSystems] = useState([]);

    // Initialize systems on mount or when count changes
    useEffect(() => {
        const palette = Object.values(THEME_COLORS);
        const newSystems = Array.from({ length: entityCount }, (_, i) => ({
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 0.5 * speed,
            vy: (Math.random() - 0.5) * 0.5 * speed,
            color: palette[i % palette.length],
            rot: Math.random() * Math.PI,
            rotV: (Math.random() - 0.5) * 0.04 * speed,
            trail: []
        }));
        setSystems(newSystems);
    }, [entityCount, speed]);

    // Shared Mathematical Constants (Decoupled from Panospace Config)
    const engineConfig = useMemo(() => ({
        dt: 0.005 * speed, // Time step
    }), [speed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;

        const particles = Array.from({ length: 150 }, () => ({
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1
        }));

        const render = () => {
            stateRef.current.time += engineConfig.dt;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = (window.devicePixelRatio || 1) * resolutionScale;

            // 1. Draw Background (Void Foundation)
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);

            const drawSystem = (cX, cY, systemColor, rotation) => {
                ctx.save();
                ctx.translate(w / 2 + cX, h / 2 + cY);
                ctx.rotate(rotation);

                if (mode === 'math_fire') {
                    // MODE: Fractal Heart (IFS)
                    ctx.globalCompositeOperation = 'screen';
                    for (let i = 0; i < 400; i++) {
                        const p = particles[i % particles.length];
                        const r = Math.random();
                        if (r < 0.45) {
                            p.x = p.x * 0.55 + 0.45 * Math.cos(t * 0.4);
                            p.y = p.y * 0.55 + 0.45 * Math.sin(t * 0.3);
                        } else {
                            p.x = Math.sin(p.x * 1.5); p.y = Math.cos(p.y * 1.5);
                        }
                        const px = p.x * (h * 0.12);
                        const py = p.y * (h * 0.12);
                        ctx.beginPath();
                        ctx.fillStyle = systemColor;
                        ctx.globalAlpha = 0.15 * opacity;
                        ctx.arc(px, py, 1.2 * dpr, 0, Math.PI * 2);
                        ctx.fill();
                    }

                } else if (mode === 'math_mandala') {
                    // MODE: Kinetic Mandala
                    ctx.lineWidth = 1 * dpr;
                    for (let k = 0; k < 3; k++) {
                        ctx.save();
                        ctx.rotate(t * (k + 1) * 0.1);
                        ctx.strokeStyle = systemColor;
                        ctx.globalAlpha = 0.45 * opacity;
                        ctx.beginPath();
                        const sSize = (8 + k * 4) * dpr;
                        for (let j = 0; j < 6; j++) {
                            const angle = (j / 6) * Math.PI * 2;
                            const rx = Math.cos(angle) * sSize;
                            const ry = Math.sin(angle) * sSize;
                            if (j === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
                        }
                        ctx.closePath();
                        ctx.stroke();
                        ctx.restore();
                    }

                } else {
                    // MODE: Nebula Singularity
                    ctx.globalCompositeOperation = 'screen';
                    for (let i = 0; i < 20; i++) {
                        const seed = i * 137.5;
                        const pulsate = Math.sin(t + seed) * 4 * dpr;
                        const radius = (Math.sin(t * 0.1 + seed) * 0.2 + 0.8) * (h * 0.08);
                        const x = Math.cos(t * 0.05 + seed) * (radius + pulsate);
                        const y = Math.sin(t * 0.05 + seed) * (radius + pulsate);

                        const grad = ctx.createRadialGradient(x, y, 0, x, y, 5 * dpr);
                        grad.addColorStop(0, systemColor);
                        grad.addColorStop(1, 'transparent');
                        ctx.fillStyle = grad;
                        ctx.globalAlpha = 0.35 * opacity;
                        ctx.beginPath();
                        ctx.arc(x, y, 5 * dpr, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.restore();
            };

            // 2. Physics Update & Stardust Trail Rendering
            systems.forEach((sys) => {
                sys.x += sys.vx * dpr;
                sys.y += sys.vy * dpr;
                sys.rot += sys.rotV;

                // Collision Logic
                const limitX = w / 2 - 50 * dpr;
                const limitY = h / 2 - 30 * dpr;
                if (Math.abs(sys.x) > limitX) sys.vx *= -1;
                if (Math.abs(sys.y) > limitY) sys.vy *= -1;

                // Trail Management
                sys.trail.push({ x: sys.x, y: sys.y });
                if (sys.trail.length > trailLength) sys.trail.shift();

                // Draw Custom Stardust Trail
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                sys.trail.forEach((pos, i) => {
                    const ratio = i / sys.trail.length;
                    const grayAlpha = Math.pow(ratio, 2) * 0.12 * opacity;
                    ctx.beginPath();
                    ctx.fillStyle = '#555';
                    ctx.globalAlpha = grayAlpha;
                    if (Math.random() < 0.3) {
                        const dx = (Math.random() - 0.5) * 8 * dpr;
                        const dy = (Math.random() - 0.5) * 8 * dpr;
                        ctx.arc(w / 2 + pos.x + dx, h / 2 + pos.y + dy, 0.8 * dpr, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
                ctx.restore();

                // 3. Draw the Core System
                drawSystem(sys.x, sys.y, sys.color, sys.rot);
            });

            animationFrame = requestAnimationFrame(render);
        };

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrame);
        };
    }, [systems, mode, opacity, trailLength, resolutionScale, engineConfig]);

    // OPTIONAL: Simple Save to Image function
    const exportAsWallpaper = () => {
        const link = document.createElement('a');
        link.download = `wallpaper-${mode}-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#000' }}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
                onClick={exportAsWallpaper} // Tap to save!
            />
            {/* Minimal Studio HUD */}
            <div style={{
                position: 'absolute', bottom: 20, left: 20,
                color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'monospace'
            }}>
                TAP TO EXPORT HIGH-RES PNG | MODE: {mode.toUpperCase()}
            </div>
        </div>
    );
};

export default MathWallpaperEngine;
