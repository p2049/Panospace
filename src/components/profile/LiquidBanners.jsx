import React, { useRef, useEffect, useMemo } from 'react';

// Brand colors for liquid banners
const BRAND = {
    MINT: '#7FFFD4',
    ION_BLUE: '#1B82FF',
    DEEP_PURPLE: '#5A3FFF',
    SOLAR_PINK: '#FF5C8A'
};

// (Obsidian Mercury Removed)

// (Solar Radiance Removed)

/**
 * 2. NEON NEBULA GOSSAMER
 * Concept: Ethereal, cloud-like liquid that feels like northern lights in a jar.
 * Visual: Soft, multi-layered, dreamy.
 */
export const GossamerLiquidBanner = () => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const clusters = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: Math.random(),
        y: Math.random(),
        color: [BRAND.ION_BLUE, BRAND.DEEP_PURPLE, BRAND.SOLAR_PINK][i % 3],
        blobs: Array.from({ length: 8 }, () => ({
            offX: (Math.random() - 0.5) * 0.2,
            offY: (Math.random() - 0.5) * 0.2,
            size: 150 + Math.random() * 200,
            speed: 0.2 + Math.random() * 0.4
        }))
    })), []);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let active = true;

        const render = () => {
            if (!active) return;
            stateRef.current.time += 0.002;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            ctx.fillStyle = '#020005'; ctx.fillRect(0, 0, w, h);

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            // MEGA SOFT BLUR - No contrast (GOSSAMER)
            ctx.filter = `blur(${60 * dpr}px)`;

            clusters.forEach(c => {
                const cx = (c.x + Math.sin(t * 0.5 + c.id) * 0.1) * w;
                const cy = (c.y + Math.cos(t * 0.3 + c.id) * 0.1) * h;

                c.blobs.forEach(b => {
                    const bx = cx + (Math.sin(t * b.speed + b.offX) * 0.2) * w;
                    const by = cy + (Math.cos(t * b.speed + b.offY) * 0.2) * h;

                    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.size * dpr);
                    grad.addColorStop(0, c.color);
                    grad.addColorStop(1, 'transparent');

                    ctx.fillStyle = grad;
                    ctx.beginPath(); ctx.arc(bx, by, b.size * dpr, 0, Math.PI * 2); ctx.fill();
                });
            });

            ctx.restore();

            if (active) requestAnimationFrame(render);
        };

        const res = () => { if (!canvas) return; const dPR = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dPR; canvas.height = canvas.offsetHeight * dPR; };
        res(); window.addEventListener('resize', res); render();
        return () => { active = false; window.removeEventListener('resize', res); };
    }, [clusters]);

    return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

/**
 * 3. CYBER KINETIC FLUID
 * Concept: Fast, aggressive, data-driven liquid. Like a racing anime's engine in slow-mo.
 * Visual: Sharp, linear, high-energy.
 */
export const CyberKineticBanner = () => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const trails = useMemo(() => Array.from({ length: 25 }, (_, i) => ({
        id: i,
        y: Math.random(),
        x: Math.random(),
        speed: 0.0005 + Math.random() * 0.0015, // Significantly slower
        length: 200 + Math.random() * 400,
        thickness: 20 + Math.random() * 40,
        color: [BRAND.MINT, BRAND.ION_BLUE, BRAND.SOLAR_PINK, BRAND.DEEP_PURPLE][Math.floor(Math.random() * 4)],
        phase: Math.random() * 10
    })), []);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let active = true;

        const render = () => {
            if (!active) return;
            stateRef.current.time += 0.01;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);

            ctx.save();
            ctx.filter = `blur(${8 * dpr}px) contrast(250%)`;

            trails.forEach(tr => {
                tr.x += tr.speed;
                if (tr.x > 1.2) tr.x = -0.2;

                const tx = tr.x * w, ty = tr.y * h;
                const grad = ctx.createLinearGradient(tx - tr.length * dpr, ty, tx, ty);
                grad.addColorStop(0, 'transparent');
                grad.addColorStop(1, tr.color);

                ctx.fillStyle = grad;
                // Draw pill shape
                ctx.beginPath();
                ctx.roundRect(tx - tr.length * dpr, ty - (tr.thickness * dpr) / 2, tr.length * dpr, tr.thickness * dpr, 20 * dpr);
                ctx.fill();

                // Sparkles at the head
                if (Math.random() > 0.95) {
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(tx, ty, 4 * dpr, 0, Math.PI * 2); ctx.fill();
                }
            });

            ctx.restore();

            // Scanlines
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            for (let i = 0; i < h; i += 4 * dpr) { ctx.fillRect(0, i, w, 1 * dpr); }

            if (active) requestAnimationFrame(render);
        };

        const res = () => { if (!canvas) return; const dPR = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dPR; canvas.height = canvas.offsetHeight * dPR; };
        res(); window.addEventListener('resize', res); render();
        return () => { active = false; window.removeEventListener('resize', res); };
    }, [trails]);

    return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

/**
 * 4. PANOSPACE MAGNUS OPUS (Replacing Solar Radiance)
 * Concept: The "Alchemist's Flow". A mesmerizing, high-fidelity liquid simulation.
 * Visual: Deep, multi-layered, organic lava flow with suspended stardust.
 * Technique: Advanced 16-point Omni-physics, velocity stretching, smooth color triangulation, and particle systems.
 */
export const SolarRadianceBanner = () => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    // COMPLEXITY LEVEL: GOD MODE (CALM & MESMERIZING)
    // Structure: Deep flow + Foreground detailed flow + Sparkle layer
    const layers = useMemo(() => [
        { scale: 0.5, count: 14, alpha: 0.3, blur: 40, speedMod: 0.2, z: 'back' }, // Slower
        { scale: 0.9, count: 12, alpha: 0.8, blur: 25, speedMod: 0.4, z: 'mid' },
        { scale: 1.2, count: 8, alpha: 1.0, blur: 15, speedMod: 0.6, z: 'front' } // Slower foreground
    ].map(layer => ({
        ...layer,
        blobs: Array.from({ length: layer.count }, (_, i) => ({
            id: i,
            x: Math.random(),
            y: 0.1 + Math.random() * 0.8,
            vx: (Math.random() - 0.5) * 0.0002,
            vy: 0,
            baseSize: (50 + Math.random() * 110) * layer.scale,
            size: 0,
            state: Math.random() > 0.5 ? 'rising' : 'sinking',
            wait: Math.random() * 600,
            phase: Math.random() * 200,
            colorPhase: Math.random(), // Unique starting color
            deform: Array.from({ length: 16 }, () => 0.8 + Math.random() * 0.4)
        }))
    })), []);

    // Soothing "Fairy dust" 
    const particles = useMemo(() => Array.from({ length: 60 }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0005, // Very slow drift
        vy: (Math.random() - 0.5) * 0.0005,
        size: Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.5,
        blinkSpeed: 0.01 + Math.random() * 0.02, // Slow pulse
        blinkPhase: Math.random() * 10
    })), []);

    // STRICT BRAND PALETTE ONLY - High saturation, high contrast
    const MASTER_PALETTE = useMemo(() => [
        BRAND.MINT, BRAND.ION_BLUE, BRAND.DEEP_PURPLE, BRAND.SOLAR_PINK,
        BRAND.MINT, BRAND.ION_BLUE // Cycle ensuring smooth loop
    ], []);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let active = true;

        const lerpColor = (c1, c2, f) => {
            if (!c1 || !c2) return '#000';
            const r1 = parseInt(c1.substring(1, 3), 16), g1 = parseInt(c1.substring(3, 5), 16), b1 = parseInt(c1.substring(5, 7), 16);
            const r2 = parseInt(c2.substring(1, 3), 16), g2 = parseInt(c2.substring(3, 5), 16), b2 = parseInt(c2.substring(5, 7), 16);
            return `rgb(${Math.round(r1 + (r2 - r1) * f)},${Math.round(g1 + (g2 - g1) * f)},${Math.round(b1 + (b2 - b1) * f)})`;
        };

        const render = () => {
            if (!active) return;
            stateRef.current.time += 0.0015; // Slower time
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            // 1. DEEP VOID
            const bg = ctx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#000000'); bg.addColorStop(1, '#050010');
            ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

            // 2. RENDER LAYERS
            layers.forEach(layer => {
                ctx.save();
                ctx.filter = `blur(${layer.blur * dpr}px)`; // Blur only - no contrast glitching
                ctx.globalAlpha = layer.alpha;

                layer.blobs.forEach(b => {
                    // Omni-Physics Update
                    const speedMult = layer.speedMod;
                    const riseStrength = 0.000003 * speedMult;
                    const gravity = 0.000001 * speedMult;

                    if (b.state === 'rising') {
                        b.vy -= riseStrength;
                        if (b.vy < -0.0015) b.vy = -0.0015;
                        if (b.y < -0.1) { b.y = 1.1; b.state = 'sinking'; b.vy = 0; }
                    } else {
                        b.vy += gravity;
                        if (b.vy > 0.0015) b.vy = 0.0015;
                        if (b.y > 1.1) { b.y = -0.1; b.state = 'rising'; b.vy = 0; }
                    }
                    b.y += b.vy;
                    b.x += Math.sin(t * 0.5 + b.id) * 0.0002; // Gentle swaying

                    // Visuals
                    const bx = b.x * w;
                    const by = b.y * h;
                    const bSize = b.baseSize * dpr; // Static size - no pumping

                    // Stretch
                    let stretchY = 1 + Math.abs(b.vy) * 2000;
                    const stretchX = 1 / stretchY;

                    // Fixed Color per blob - no cycling to prevent glitching
                    const colorIdx = Math.floor(b.colorPhase * MASTER_PALETTE.length) % MASTER_PALETTE.length;
                    ctx.fillStyle = MASTER_PALETTE[colorIdx];

                    // Organic Shape
                    ctx.beginPath();
                    const points = 16;
                    const wobble = Math.sin(t * 0.3 + b.phase) * 0.03; // Gentle wobble
                    for (let j = 0; j <= points; j++) {
                        const angle = (j / points) * Math.PI * 2;
                        const deformation = b.deform[j % 16] || 1;
                        // Morphing logic
                        const morph = Math.sin(t * 0.5 + j + b.id) * 0.01; // Tiny morph

                        const r = bSize * (deformation + wobble + morph);
                        const px = bx + Math.cos(angle) * r * stretchX;
                        const py = by + Math.sin(angle) * r * stretchY;
                        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                    }
                    ctx.fill();
                });
                ctx.restore();
            });

            // 3. SPARKLE DUST
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
                if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;

                const flicker = 1; // No flicker - static glow
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * flicker})`;

                const px = p.x * w;
                const py = p.y * h;

                ctx.beginPath();
                ctx.arc(px, py, p.size * dpr, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();

            // 4. FINAL POLISH: Vignette & Scanlines
            const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8);
            vignette.addColorStop(0, 'transparent');
            vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
            ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h);

            if (active) requestAnimationFrame(render);
        };

        const res = () => { if (!canvas) return; const dPR = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dPR; canvas.height = canvas.offsetHeight * dPR; };
        res(); window.addEventListener('resize', res); render();
        return () => { active = false; window.removeEventListener('resize', res); };
    }, [layers, particles, MASTER_PALETTE]);

    return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};
