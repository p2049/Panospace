
import React, { useRef, useEffect, useMemo, useState } from 'react';

const BRAND = {
    deepOrbit: '#5A3FFF',
    ionBlue: '#1B82FF',
    solarPink: '#FF5C8A',
    auroraMint: '#7FFFD4',
    white: '#FFFFFF',
    black: '#000000',
    purple: '#A7B6FF'
};

const PALETTES = {
    metro_tunnel: {
        bg: '#050505',
        windowTint: 'rgba(0, 0, 10, 0.4)',
        tunnelColor: '#1a1a1a',
        accent: '#333',
        lights: ['#ffcc00', '#ffaa00', '#444'],
        rhythm: 1.0
    },
    metro_station: {
        bg: '#08050a',
        windowTint: 'rgba(10, 0, 20, 0.2)',
        tunnelColor: '#1a0a1a',
        accent: BRAND.solarPink,
        lights: [BRAND.ionBlue, BRAND.solarPink, '#FFF'],
        rhythm: 1.5
    },
    metro_glitch: {
        bg: '#000',
        windowTint: 'rgba(0, 20, 10, 0.3)',
        tunnelColor: '#050505',
        accent: BRAND.auroraMint,
        lights: [BRAND.auroraMint, '#FFF', '#00ff00'],
        rhythm: 2.0
    }
};

const WORLD_LENGTH = 2400;

// HELPERS FOR REALISTIC ARCHITECTURE
const drawRealBuilding = (ctx, b, localX, w, h, time) => {
    const perspective = 3.8 / (b.z + 1);
    let ox = (b.x - localX);
    if (ox < -800) ox += WORLD_LENGTH; if (ox > 1600) ox -= WORLD_LENGTH;

    const finalPx = (ox / 100) * w * perspective + w / 2;
    const bw = b.w * perspective;
    const bh = b.h * perspective;
    if (finalPx < -250 || finalPx > 400) return;

    // 1. BASE MASS
    ctx.fillStyle = b.color;
    ctx.fillRect(finalPx, h - bh, bw, bh);

    // 2. ICONIC SILHOUETTES
    if (b.style === 'sears') {
        ctx.fillRect(finalPx + bw * 0.1, h - bh - bh * 0.1, bw * 0.8, bh * 0.1);
        ctx.fillRect(finalPx + bw * 0.25, h - bh - bh * 0.2, bw * 0.5, bh * 0.1);
    } else if (b.style === 'hancock') {
        ctx.beginPath();
        ctx.moveTo(finalPx, h); ctx.lineTo(finalPx + bw * 0.2, h - bh);
        ctx.lineTo(finalPx + bw * 0.8, h - bh); ctx.lineTo(finalPx + bw, h);
        ctx.fill();
    } else if (b.style === 'ball') {
        ctx.fillStyle = b.color;
        ctx.fillRect(finalPx + bw * 0.45, h - bh, bw * 0.1, bh);
        ctx.beginPath(); ctx.arc(finalPx + bw * 0.5, h - bh, bw * 0.35, 0, Math.PI * 2); ctx.fill();
    }

    // 3. WINDOW GRIDS (WARM AMBER / WHITE)
    ctx.fillStyle = b.windowColor;
    const rows = Math.min(25, Math.floor(bh / 10));
    const cols = Math.min(8, Math.floor(bw / 8));
    for (let i = 0; i < rows; i++) {
        const active = Math.sin(b.seed * 100 + i) > 0.1;
        if (active) {
            ctx.globalAlpha = (0.05 + Math.sin(time * 0.4 + i + b.seed) * 0.04) * perspective;
            for (let j = 0; j < cols; j++) {
                if ((j + i) % 3 !== 0) {
                    ctx.fillRect(finalPx + j * (bw / cols) + 3, h - bh + i * (bh / rows) + 5, 1.2 * perspective, 1.8 * perspective);
                }
            }
        }
    }

    // 4. SIGNAL LIGHTS
    ctx.globalAlpha = (Math.sin(time * 5 + b.seed) + 1) * 0.5 * perspective;
    ctx.fillStyle = '#F03'; ctx.fillRect(finalPx + bw / 2, h - bh - 3, 2, 2);
    ctx.globalAlpha = 1.0;
};

const generateMetroWorld = () => {
    const world = [];
    // Suburban / Tunnel Track
    for (let i = 0; i < 40; i++) {
        world.push({ type: 'track_structure', x: (i / 40) * 500, hasPillar: i % 4 === 0, hasLight: i % 10 === 0 });
    }
    // High Density Downtown
    for (let i = 0; i < 150; i++) {
        const z = 1.2 + Math.random() * 14;
        const styles = ['sears', 'hancock', 'ball', 'flat', 'glass'];
        world.push({
            type: 'skyscraper',
            x: 500 + Math.random() * 1400,
            z: z,
            w: (70 + Math.random() * 140) * (1 / (z * 0.08 + 1)),
            h: 350 + Math.random() * 1100,
            style: styles[Math.floor(Math.random() * styles.length)],
            color: z > 8 ? '#020308' : '#050712',
            windowColor: Math.random() > 0.6 ? '#FFD27F' : '#E0EFFF',
            seed: Math.random()
        });
    }
    // River / Bridge
    for (let i = 0; i < 18; i++) {
        world.push({ type: 'bridge_pylon', x: 1900 + i * 35, isTower: i % 4 === 0 });
    }
    return world;
};

const MetroWindowSub = ({ palette, world, worldX, config, time }) => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        ctxRef.current = canvas.getContext('2d', { alpha: false });
    }, []);

    useEffect(() => {
        const ctx = ctxRef.current;
        if (!ctx || !world) return;
        const w = 140; const h = 140;
        const { cabinBloom } = config;
        const localX = worldX % WORLD_LENGTH;

        // 1. SKY & ATMOSPHERE
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
        const isOutside = localX > 450 && localX < 2350;
        if (isOutside) {
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            sky.addColorStop(0, '#02040d'); sky.addColorStop(0.5, '#040818'); sky.addColorStop(1, '#020205');
            ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
            const streetGlow = ctx.createLinearGradient(0, h * 0.7, 0, h);
            streetGlow.addColorStop(0, 'transparent'); streetGlow.addColorStop(1, 'rgba(255, 130, 0, 0.12)');
            ctx.fillStyle = streetGlow; ctx.fillRect(0, h * 0.7, w, h * 0.3);
        }

        // 2. WORLD DRAW PASS
        world.forEach(obj => { if (obj.type === 'skyscraper' && obj.z >= 7) drawRealBuilding(ctx, obj, localX, w, h, time); });

        world.forEach(obj => {
            let ox = (obj.x - localX);
            if (ox < -800) ox += WORLD_LENGTH; if (ox > 1600) ox -= WORLD_LENGTH;
            const px = (ox / 100) * w;
            if (obj.type === 'bridge_pylon' && isOutside) {
                ctx.fillStyle = '#0a0a0a'; ctx.fillRect(px - 10, 0, 20, h);
                if (obj.isTower) {
                    ctx.fillStyle = '#111'; ctx.fillRect(px - 20, 0, 40, h * 0.3);
                    ctx.strokeStyle = '#1a1a1a'; ctx.strokeRect(px - 20, 0, 40, h * 0.3);
                }
            }
        });

        world.forEach(obj => { if (obj.type === 'skyscraper' && obj.z < 7) drawRealBuilding(ctx, obj, localX, w, h, time); });

        world.forEach(obj => {
            if (obj.type !== 'track_structure') return;
            let ox = (obj.x - localX);
            if (ox < -800) ox += WORLD_LENGTH; if (ox > 1600) ox -= WORLD_LENGTH;
            const px = (ox / 100) * w;
            ctx.fillStyle = '#050505'; ctx.fillRect(px, h * 0.82, 35, h * 0.18);
            ctx.fillStyle = '#111'; ctx.fillRect(px - 100, h * 0.8, 200, 3);
            if (obj.hasLight) {
                const flare = ctx.createRadialGradient(px, h * 0.78, 0, px, h * 0.78, 30);
                flare.addColorStop(0, 'rgba(255, 220, 150, 0.08)'); flare.addColorStop(1, 'transparent');
                ctx.fillStyle = flare; ctx.fillRect(px - 30, h * 0.5, 60, h * 0.5);
                ctx.fillStyle = '#FFAD66'; ctx.fillRect(px - 1, h * 0.75, 2, 6);
            }
        });

        // 3. CABIN FINISH
        const path = new Path2D(); const p = 6; const r = 26;
        path.roundRect(p, p, w - p * 2, h - p * 2, r);
        ctx.lineWidth = 18;
        const bezel = ctx.createLinearGradient(0, 0, w, 0);
        bezel.addColorStop(0, '#0a0a0a'); bezel.addColorStop(0.5, '#252525'); bezel.addColorStop(1, '#0a0a0a');
        ctx.strokeStyle = bezel; ctx.stroke(path);

        ctx.globalCompositeOperation = 'screen';
        const rx = (localX * 0.9) % w;
        const glass = ctx.createLinearGradient(rx, 0, rx + 130, h);
        glass.addColorStop(0, 'rgba(255,255,255,0.05)'); glass.addColorStop(0.5, 'transparent'); glass.addColorStop(1, 'rgba(255,255,255,0.01)');
        ctx.fillStyle = glass; ctx.fill(path);

        ctx.fillStyle = cabinBloom; ctx.globalAlpha = 0.06; ctx.fill(path);
        ctx.globalCompositeOperation = 'source-over';
    }, [world, worldX, config, time]);

    return <canvas ref={canvasRef} width={140} height={140} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
};

const MetroWindowBanner = ({ variant = 'metro_tunnel' }) => {
    const p = PALETTES[variant] || PALETTES.metro_tunnel;
    const world = useMemo(() => generateMetroWorld(), []);
    const [time, setTime] = React.useState(0);
    const [worldX, setWorldX] = React.useState(0);

    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false); // Default to false to avoid initial heavy load if low down
    const isVisibleRef = useRef(false); // Ref for loop access

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
                isVisibleRef.current = entry.isIntersecting;
            },
            { threshold: 0.1 } // Start when 10% visible
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        // Respect reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        let frame;
        let lastTime = Date.now();

        const loop = () => {
            if (!isVisibleRef.current) {
                // If not visible, check again in 500ms instead of 16ms to save battery (simple throttle)
                // Actually, logic is cleaner if we just stop the loop and restart in useEffect when isVisible changes.
                // But since we are here, let's just use the boolean state dependency to start/stop.
                return;
            }

            const now = Date.now();
            const dt = Math.min((now - lastTime) * 0.001, 0.1); // Cap dt to prevent huge jumps
            lastTime = now;

            setTime(t => t + dt);
            setWorldX(prevX => {
                const lx = prevX % WORLD_LENGTH;
                let speed = 2.0;
                if (lx > 400 && lx < 1900) speed = 2.8 + Math.sin(time * 0.2) * 0.4;
                else if (lx >= 1900 && lx < 2300) speed = 3.8;
                else if (lx >= 2300) speed = 1.0;
                return prevX + speed * dt * 45;
            });
            frame = requestAnimationFrame(loop);
        };

        if (isVisible) {
            lastTime = Date.now(); // Reset time to avoid jump
            loop();
        }

        return () => cancelAnimationFrame(frame);
    }, [isVisible]); // Re-run when visibility changes

    const lx = worldX % WORLD_LENGTH;
    let cabinBloom = p.accent;
    if (lx > 500 && lx < 1900) cabinBloom = '#FFAD6611';
    else if (lx >= 1900) cabinBloom = '#B0C4DE11';

    const config = { cabinBloom };
    const windowOffsets = [0, 8, 16, 24, 60, 68, 76, 84];

    return (
        <div ref={containerRef} style={{
            position: 'absolute', inset: 0, background: '#050505',
            backgroundImage: `linear-gradient(to bottom, #111, #050505 50%, #111), radial-gradient(circle at 50% 130%, ${cabinBloom}, transparent 80%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', gap: '4%',
            willChange: 'contents'
        }}>
            <div style={{ position: 'absolute', top: '22%', left: 0, right: 0, height: '3px', background: 'linear-gradient(to bottom, #111, #444, #000)', opacity: 0.5, zIndex: 10 }} />
            <div style={{ display: 'flex', gap: '12px', height: '62%', width: '44%' }}>
                {[0, 1, 2, 3].map(i => <div key={i} style={{ flex: 1, filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.9))' }}>
                    <MetroWindowSub palette={p} world={world} time={time} worldX={worldX + windowOffsets[i]} config={config} />
                </div>)}
            </div>
            <div style={{ width: '60px', height: '85px', background: 'rgba(255,255,255,0.01)', border: '1px solid #1a1a1a', borderRadius: '4px', opacity: 0.4, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ height: '4px', width: '100%', background: '#222' }} /><div style={{ height: '4px', width: '60%', background: '#1a1a1a' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', height: '62%', width: '44%' }}>
                {[4, 5, 6, 7].map(i => <div key={i} style={{ flex: 1, filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.9))' }}>
                    <MetroWindowSub palette={p} world={world} time={time} worldX={worldX + windowOffsets[i]} config={config} />
                </div>)}
            </div>
        </div>
    );
};

export default MetroWindowBanner;
