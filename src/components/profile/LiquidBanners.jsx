import React, { useRef, useEffect, useMemo } from 'react';

/**
 * LiquidBanners - A collection of high-fidelity liquid physics banners
 * Using the "Lava Lamp" metaball technique pushed to its creative limits.
 */

const BRAND = {
    MINT: '#7FFFD4',
    ION_BLUE: '#1B82FF',
    DEEP_PURPLE: '#5A3FFF',
    SOLAR_PINK: '#FF5C8A',
    STELLAR_ORANGE: '#FF914D',
    VOID: '#010101',
    GOLD: '#FFD700',
    CYBER_RED: '#FF003C'
};

/**
 * 1. OBSIDIAN MERCURY
 * Concept: Liquid black metal with razor-sharp neon edge glows.
 * Visual: High contrast, metallic, premium.
 */
export const ObsidianMercuryBanner = () => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const blobs = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.001,
        vy: (Math.random() - 0.5) * 0.001,
        size: 80 + Math.random() * 120,
        phase: Math.random() * Math.PI * 2,
        deform: Array.from({ length: 12 }, () => 0.8 + Math.random() * 0.4)
    })), []);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let active = true;

        const render = () => {
            if (!active) return;
            stateRef.current.time += 0.005;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            // Deep background
            ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, w, h);

            // Subtle base grid
            ctx.strokeStyle = 'rgba(127, 255, 212, 0.03)';
            ctx.lineWidth = 1;
            for (let i = 0; i < w; i += 100 * dpr) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }

            blobs.forEach(b => {
                // Physics: Gentle drift with screen wrap
                b.x += b.vx; b.y += b.vy;
                if (b.x < -0.2) b.x = 1.2; if (b.x > 1.2) b.x = -0.2;
                if (b.y < -0.2) b.y = 1.2; if (b.y > 1.2) b.y = -0.2;

                const bx = b.x * w, by = b.y * h;
                const bSize = b.size * dpr;

                // Prepare path
                ctx.beginPath();
                const points = 12;
                for (let j = 0; j <= points; j++) {
                    const angle = (j / points) * Math.PI * 2;
                    const def = b.deform[j % points] + Math.sin(t + b.phase + j) * 0.1;
                    const r = bSize * def;
                    const px = bx + Math.cos(angle) * r;
                    const py = by + Math.sin(angle) * r;
                    if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                }
                ctx.closePath();

                // Draw Glow
                ctx.shadowColor = i % 2 === 0 ? BRAND.MINT : BRAND.SOLAR_PINK;
                ctx.shadowBlur = 20 * dpr;
                ctx.fillStyle = '#0a0a0a';
                ctx.fill();

                // Draw Stroke
                ctx.shadowBlur = 0;
                ctx.strokeStyle = i % 2 === 0 ? BRAND.MINT : BRAND.SOLAR_PINK;
                ctx.lineWidth = 2 * dpr;
                ctx.stroke();
            });

            ctx.restore();

            // Hardware Shine overlays
            const shine = ctx.createLinearGradient(0, 0, w, h);
            shine.addColorStop(0, 'rgba(255,255,255,0.05)');
            shine.addColorStop(0.5, 'transparent');
            shine.addColorStop(1, 'rgba(255,255,255,0.02)');
            ctx.fillStyle = shine; ctx.fillRect(0, 0, w, h);

            if (active) requestAnimationFrame(render);
        };

        const res = () => { if (!canvas) return; const dPR = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dPR; canvas.height = canvas.offsetHeight * dPR; };
        res(); window.addEventListener('resize', res); render();
        return () => { active = false; window.removeEventListener('resize', res); };
    }, [blobs]);

    return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

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
 * 4. SOL-SYSTEM RADIANCE
 * Concept: Liquid sun. Slow, massive, pulsating golden-orange surface.
 * Visual: Volumetric, warm, authoritative.
 */
/**
 * 4. PANOSPACE MAGNUS OPUS (Replacing Solar Radiance)
 * Concept: The "Alchemist's Flow". A mesmerizing, high-fidelity liquid simulation.
 * Visual: Deep, multi-layered, organic lava flow with suspended stardust.
 * Technique: Advanced 16-point Omni-physics, velocity stretching, smooth color triangulation, and particle systems.
 */
export const SolarRadianceBanner = () => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    // COMPLEXITY LEVEL: GOD MODE
    // We create multiple "layers" of liquid to simulate depth
    const layers = useMemo(() => [
        { scale: 0.6, count: 12, alpha: 0.4, blur: 30, speedMod: 0.5, z: 'back' }, // Deep background flow
        { scale: 1.0, count: 18, alpha: 1.0, blur: 20, speedMod: 1.0, z: 'mid' }   // Crisp foreground flow
    ].map(layer => ({
        ...layer,
        blobs: Array.from({ length: layer.count }, (_, i) => ({
            id: i,
            x: Math.random(),
            y: 0.1 + Math.random() * 0.8,
            vx: (Math.random() - 0.5) * 0.0001, // Tiniest drift
            vy: 0,
            baseSize: (60 + Math.random() * 100) * layer.scale,
            size: 0, // Dynamic
            state: Math.random() > 0.5 ? 'rising' : 'sinking',
            wait: Math.random() * 800,
            phase: Math.random() * 200,
            colorPhase: Math.random(),
            deform: Array.from({ length: 16 }, () => 0.9 + Math.random() * 0.2)
        }))
    })), []);

    // Suspended "Stardust" Particles
    const particles = useMemo(() => Array.from({ length: 50 }, () => ({
        x: Math.random(),
        y: Math.random(),
        vy: (Math.random() - 0.5) * 0.0005,
        size: Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.6,
        blink: Math.random() * 10
    })), []);

    const MASTER_PALETTE = [
        BRAND.MINT, BRAND.ION_BLUE, BRAND.DEEP_PURPLE, BRAND.SOLAR_PINK,
        BRAND.GOLD, '#FFFFFF', BRAND.CYBER_RED, BRAND.MINT // Loop back
    ];

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
            stateRef.current.time += 0.0025; // Mesmerizingly slow time
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            // 1. VOID BACKGROUND
            const bg = ctx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#020005'); bg.addColorStop(1, '#0a0a12');
            ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

            // 2. RENDER LAYERS
            layers.forEach(layer => {
                ctx.save();
                // "Metaball" effect: Blur then Contrast
                // Adjusted per layer for depth perception
                ctx.filter = `blur(${layer.blur * dpr}px) contrast(${layer.z === 'mid' ? 300 : 150}%) brightness(110%)`;

                // Opacity handling for background fades
                ctx.globalAlpha = layer.alpha;

                layer.blobs.forEach(b => {
                    // --- PHYSICS: Omni-Flow Logic (OG Lava Lamp) ---
                    const speedMult = 1.0 * layer.speedMod;
                    const gravity = 0.0000008 * speedMult;
                    const riseStrength = 0.0000025 * speedMult;

                    if (b.state === 'heating') {
                        b.y = Math.min(0.96, b.y + 0.0004 * speedMult);
                        b.vy *= 0.5;
                        if (Math.random() > 0.992) b.state = 'rising';
                    } else if (b.state === 'rising') {
                        b.vy -= riseStrength;
                        if (b.vy < -0.001) b.vy = -0.001; // Terminal UP
                        if (b.y < 0.1) { b.state = 'cooling'; b.wait = 400 + Math.random() * 400; }
                    } else if (b.state === 'cooling') {
                        b.wait -= 1;
                        b.vy *= 0.94;
                        if (b.wait <= 0) b.state = 'sinking';
                    } else if (b.state === 'sinking') {
                        b.vy += gravity;
                        if (b.vy > 0.0008) b.vy = 0.0008; // Terminal DOWN
                        if (b.y > 0.9) b.state = 'heating';
                    }

                    b.vy *= 0.99;
                    b.y += b.vy;

                    // Wrap check
                    if (b.y < -0.2) b.y = 1.2;
                    if (b.y > 1.2) b.y = -0.2;

                    // --- DRAWING: Organic Velocity Shapes ---
                    const bx = b.x * w;
                    const by = b.y * h;
                    const bSize = b.baseSize * dpr;

                    // Velocity Stretch & Squash
                    let stretchY = 1 + Math.abs(b.vy) * 1500; // Go hard on the stretch
                    if (b.state === 'heating') stretchY = 0.5; // Pancake at bottom
                    if (b.state === 'cooling') stretchY = 0.8; // Mushroom at top
                    const stretchX = 1 / stretchY;

                    // COLOR: Triangulated Palette Cycling
                    const speed = 0.1;
                    const val = (t * speed + b.colorPhase) % 1;
                    const idx = Math.floor(val * (MASTER_PALETTE.length - 1));
                    const nextIdx = idx + 1;
                    const f = (val * (MASTER_PALETTE.length - 1)) % 1;
                    ctx.fillStyle = lerpColor(MASTER_PALETTE[idx], MASTER_PALETTE[nextIdx], f);

                    // SHAPE: 16-point organic Outline
                    ctx.beginPath();
                    const points = 16;
                    const wobble = Math.sin(t * 0.8 + b.phase) * 0.12;
                    for (let j = 0; j <= points; j++) {
                        const angle = (j / points) * Math.PI * 2;
                        const deformation = b.deform[j % 16] || 1;

                        // OG Asymmetry Logic
                        let asymmetry = 1.0;
                        if (b.vy < -0.0001 && angle > Math.PI) asymmetry = 1.3; // Trail bottom when rising
                        if (b.vy > 0.0001 && angle < Math.PI) asymmetry = 1.3; // Trail top when sinking

                        const reach = bSize * (deformation + wobble) * asymmetry;
                        const px = bx + Math.cos(angle) * reach * stretchX;
                        const py = by + Math.sin(angle) * reach * stretchY;

                        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                    }
                    ctx.fill();
                });
                ctx.restore();
            });

            // 3. STARDUST PARTICLES (Suspended in the flow)
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            particles.forEach(p => {
                p.y += p.vy;
                if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;

                // Twinkle
                const alpha = p.alpha * (0.5 + 0.5 * Math.sin(t * 2 + p.blink));
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

                const px = p.x * w;
                const py = p.y * h;
                const ps = p.size * dpr;

                ctx.beginPath(); ctx.arc(px, py, ps, 0, Math.PI * 2); ctx.fill();
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
