import React, { useRef, useEffect, useMemo } from 'react';

/**
 * LavaLampBanner - "GLOW CORE: OMNIFLOW"
 * 
 * DESIGN REFINEMENT:
 * 1. OMNIFLOW MODE: A screen-wide, multi-color wax spread without industrial lamp framing.
 * 2. CENTRAL COMMAND PILLAR: Frames the profile picture perfectly (only in LAMP modes).
 * 3. STABLE BACKGLOW: decoupling the glow from the activity speed factor.
 * 4. ICONIC HARDWARE: Dual-cone industrial bases for LAMP modes.
 * 5. SERENE PHYSICS: Ultra-slow, high-viscosity fluid motion.
 */

const BRAND = {
    MINT: '#7FFFD4',
    ION_BLUE: '#1B82FF',
    DEEP_PURPLE: '#5A3FFF',
    SOLAR_PINK: '#FF5C8A',
    STELLAR_ORANGE: '#FF914D',
    VOID: '#010101'
};

const THEMES = {
    lava_plasma: { id: 'Plasma Flow', colors: [BRAND.MINT, BRAND.ION_BLUE, BRAND.DEEP_PURPLE, BRAND.SOLAR_PINK], multi: true, mode: 'LAMPS' },
    lava_omniflow: { id: 'Omni Flow', colors: [BRAND.MINT, BRAND.ION_BLUE, BRAND.DEEP_PURPLE, BRAND.SOLAR_PINK], multi: true, mode: 'SCREEN_WIDE' },
    lava_neon: { id: 'Neon Mint', colors: [BRAND.MINT, BRAND.MINT, BRAND.MINT, BRAND.MINT], multi: false, mode: 'LAMPS' },
    lava_solar: { id: 'Solar Flare', colors: [BRAND.STELLAR_ORANGE, BRAND.STELLAR_ORANGE, BRAND.STELLAR_ORANGE, BRAND.STELLAR_ORANGE], multi: false, mode: 'LAMPS' },
    lava_nebula: { id: 'Deep Nebula', colors: [BRAND.DEEP_PURPLE, BRAND.DEEP_PURPLE, BRAND.DEEP_PURPLE, BRAND.DEEP_PURPLE], multi: false, mode: 'LAMPS' }
};

const safeAlpha = (hex, alpha) => {
    if (!hex) return 'transparent';
    let r, g, b;
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16); g = parseInt(cleanHex[1] + cleanHex[1], 16); b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else {
        r = parseInt(cleanHex.substring(0, 2), 16); g = parseInt(cleanHex.substring(2, 4), 16); b = parseInt(cleanHex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const LavaLampBanner = ({ variant = 'lava_plasma' }) => {
    const theme = THEMES[variant] || THEMES.lava_plasma;
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const world = useMemo(() => {
        if (theme.mode === 'SCREEN_WIDE') {
            // Screen-wide spread: 12-15 blobs across the entire canvas
            return [{
                id: 'wide',
                isWide: true,
                blobs: Array.from({ length: 20 }, (_, i) => ({
                    id: i,
                    x: Math.random(),
                    y: 0.1 + Math.random() * 0.8,
                    vx: (Math.random() - 0.5) * 0.0001,
                    vy: 0,
                    size: 60 + Math.random() * 90,
                    state: Math.random() > 0.5 ? 'rising' : 'sinking',
                    wait: Math.random() * 800,
                    phase: Math.random() * 200,
                    temp: Math.random(),
                    color: theme.colors[i % theme.colors.length],
                    scaleX: 0.9 + Math.random() * 0.2,
                    scaleY: 0.9 + Math.random() * 0.2,
                    deform: Array.from({ length: 16 }, () => 0.9 + Math.random() * 0.2)
                }))
            }];
        }

        // Standard 4-Lamp mode
        return Array.from({ length: 4 }, (_, i) => {
            const isRight = i >= 2;
            const blobCount = 2 + Math.floor(Math.random() * 2);
            return {
                id: i,
                nx: isRight ? 0.68 + (i - 2) * 0.18 : 0.14 + i * 0.18,
                w: 0.11,
                taper: 0.45 + Math.random() * 0.1,
                blobs: Array.from({ length: blobCount }, (_, bi) => ({
                    id: bi,
                    y: 0.1 + Math.random() * 0.8,
                    vy: 0,
                    size: bi === 0 ? 30 + Math.random() * 15 : 12 + Math.random() * 10,
                    state: Math.random() > 0.5 ? 'rising' : 'sinking',
                    wait: Math.random() * 400,
                    phase: Math.random() * 100,
                    temp: Math.random(),
                    color: theme.colors[i % theme.colors.length]
                }))
            };
        });
    }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let active = true;

        const updatePhysics = (lamp, speedMult) => {
            lamp.blobs.forEach((b) => {
                // OG Rhythmic Speed: Uniform and steady
                const gravity = 0.0000008 * speedMult;
                const riseStrength = 0.0000025 * speedMult;

                if (b.state === 'heating') {
                    b.y = Math.min(0.96, b.y + 0.0004 * speedMult);
                    b.vy *= 0.5; // Quick dampening at bottom
                    b.temp = Math.min(1.0, b.temp + 0.0004 * speedMult);
                    if (b.temp >= 1.0 && Math.random() > 0.99) b.state = 'rising';
                } else if (b.state === 'rising') {
                    b.vy -= riseStrength;
                    // Terminal velocity for steady move
                    if (b.vy < -0.001) b.vy = -0.001;
                    if (b.y < 0.1) { b.state = 'cooling'; b.wait = 600 + Math.random() * 400; }
                } else if (b.state === 'cooling') {
                    b.wait -= speedMult;
                    b.vy *= 0.94;
                    b.temp = Math.max(0, b.temp - 0.0003 * speedMult);
                    if (b.wait <= 0 && b.temp <= 0.1) b.state = 'sinking';
                } else if (b.state === 'sinking') {
                    b.vy += gravity;
                    // Terminal velocity for steady move
                    if (b.vy > 0.0008) b.vy = 0.0008;
                    if (b.y > 0.9) b.state = 'heating';
                }

                b.vy *= 0.99;
                b.y += b.vy;

                // OG Lava Lamp movement is purely vertical
                // We keep horizontal "drifting" only in the initial X to spread them
                // but we remove the active X-pushing from physics 
                if (!lamp.isWide) {
                    lamp.blobs.forEach(other => {
                        if (b === other) return;
                        const dy = Math.abs(b.y - other.y);
                        const dist = dy;
                        const limit = 0.2;
                        if (dist < limit && dist > 0) {
                            const push = (limit - dist) * 0.000015 * speedMult;
                            b.vy += b.y > other.y ? push : -push;
                        }
                    });
                }

                if (b.y < -0.1) b.y = 1.1;
                if (b.y > 1.1) b.y = -0.1;
            });
        };

        const drawPillar = (w, h, dpr) => {
            const midX = w / 2, pillarW = 180 * dpr, pX = midX - pillarW / 2;
            const grad = ctx.createLinearGradient(pX, 0, pX + pillarW, 0);
            grad.addColorStop(0, '#000'); grad.addColorStop(0.5, '#0a0a0f'); grad.addColorStop(1, '#000');
            ctx.fillStyle = grad; ctx.fillRect(pX, 0, pillarW, h);
            ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1 * dpr; ctx.strokeRect(pX, 0, pillarW, h);
        };

        const render = () => {
            if (!active) return;

            let totalActivity = 0;
            world.forEach(l => { l.blobs.forEach(b => { if (b.state === 'rising') totalActivity += 0.1; }); });
            const speedFactor = 1.0 + Math.min(1.2, totalActivity);

            stateRef.current.time += 0.0018 * speedFactor;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;
            const topY = h * 0.15, botY = h * 0.85, lampH = botY - topY;

            ctx.fillStyle = BRAND.VOID; ctx.fillRect(0, 0, w, h);

            world.forEach((lamp) => {
                if (lamp.isWide) {
                    // SCREEN WIDE RENDERING
                    updatePhysics(lamp, speedFactor);

                    ctx.save();
                    // Heavier blur/merging for "wax" feel
                    ctx.filter = `blur(${20 * dpr}px) contrast(300%) brightness(110%)`;

                    // Helper to lerp between hex colors
                    const lerpColor = (c1, c2, f) => {
                        const r1 = parseInt(c1.substring(1, 3), 16);
                        const g1 = parseInt(c1.substring(3, 5), 16);
                        const b1 = parseInt(c1.substring(5, 7), 16);
                        const r2 = parseInt(c2.substring(1, 3), 16);
                        const g2 = parseInt(c2.substring(3, 5), 16);
                        const b2 = parseInt(c2.substring(5, 7), 16);
                        const r = Math.round(r1 + (r2 - r1) * f);
                        const g = Math.round(g1 + (g2 - g1) * f);
                        const b = Math.round(b1 + (b2 - b1) * f);
                        return `rgb(${r},${g},${b})`;
                    };

                    lamp.blobs.forEach((b) => {
                        const bx = b.x * w;
                        const by = b.y * h;
                        const bSize = b.size * dpr;

                        // Velocity-based Stretching (OG Lava Lamp feel)
                        let stretchY = 1 + Math.abs(b.vy) * 1200;
                        if (b.state === 'heating') stretchY = 0.6; // Flat on bottom
                        const stretchX = 1 / stretchY; // Conservation of volume

                        // Smoothly cycle through theme colors
                        if (theme.multi && theme.colors.length > 1) {
                            const colorCycleSpeed = 0.12;
                            const phase = (t * colorCycleSpeed + b.phase * 0.05) % 1.0;
                            const colorIndex = Math.floor(phase * theme.colors.length);
                            const nextColorIndex = (colorIndex + 1) % theme.colors.length;
                            const f = (phase * theme.colors.length) % 1.0;
                            ctx.fillStyle = lerpColor(theme.colors[colorIndex], theme.colors[nextColorIndex], f);
                        } else {
                            ctx.fillStyle = b.color;
                        }

                        // Organic Shape Drawing
                        ctx.beginPath();
                        const points = 16;
                        const wobble = Math.sin(t * 0.4 + b.phase) * 0.08;
                        for (let j = 0; j <= points; j++) {
                            const angle = (j / points) * Math.PI * 2;
                            const deformation = b.deform[j % 16] || 1;

                            // OG Logic: Elongated top/bottom based on direction
                            let asymmetry = 1.0;
                            if (b.vy < -0.0001) { // Rising: Stretch Top
                                if (angle > Math.PI) asymmetry = 1.25;
                            } else if (b.vy > 0.0001) { // Sinking: Stretch Bottom
                                if (angle < Math.PI) asymmetry = 1.25;
                            }

                            const reach = bSize * (deformation + wobble) * asymmetry;
                            const px = bx + Math.cos(angle) * reach * (b.scaleX || 1) * stretchX;
                            const py = by + Math.sin(angle) * reach * (b.scaleY || 1) * stretchY;

                            if (j === 0) ctx.moveTo(px, py);
                            else ctx.lineTo(px, py);
                        }
                        ctx.closePath();
                        ctx.fill();
                    });
                    ctx.filter = 'none';
                    ctx.restore();
                } else {
                    // STANDARD LAMP RENDERING
                    const color = lamp.blobs[0].color;
                    const lx = lamp.nx * w;
                    const lw = lamp.w * w;
                    const tw = lw * lamp.taper;

                    updatePhysics(lamp, speedFactor);

                    const backGlow = ctx.createRadialGradient(lx, h / 2, 0, lx, h / 2, lw * 3);
                    backGlow.addColorStop(0, safeAlpha(color, 0.08)); backGlow.addColorStop(1, 'transparent');
                    ctx.fillStyle = backGlow; ctx.fillRect(0, 0, w, h);

                    const hardwareGrad = ctx.createLinearGradient(lx - lw / 2, 0, lx + lw / 2, 0);
                    hardwareGrad.addColorStop(0, '#020204'); hardwareGrad.addColorStop(0.5, '#15151a'); hardwareGrad.addColorStop(1, '#020204');
                    ctx.fillStyle = hardwareGrad;
                    ctx.beginPath(); ctx.moveTo(lx - lw / 2 - 4 * dpr, botY); ctx.lineTo(lx + lw / 2 + 4 * dpr, botY);
                    ctx.lineTo(lx + lw * 0.8 + 6 * dpr, botY + 45 * dpr); ctx.lineTo(lx - lw * 0.8 - 6 * dpr, botY + 45 * dpr);
                    ctx.closePath(); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(lx - tw / 2 - 2 * dpr, topY); ctx.lineTo(lx + tw / 2 + 2 * dpr, topY);
                    ctx.lineTo(lx + tw / 2 * 0.8, topY - 18 * dpr); ctx.lineTo(lx - tw / 2 * 0.8, topY - 18 * dpr);
                    ctx.closePath(); ctx.fill();

                    ctx.save();
                    ctx.beginPath(); ctx.moveTo(lx - lw / 2, botY); ctx.lineTo(lx + lw / 2, botY); ctx.lineTo(lx + tw / 2, topY); ctx.lineTo(lx - tw / 2, topY);
                    ctx.closePath(); ctx.clip();
                    ctx.fillStyle = '#010101'; ctx.fill();
                    ctx.filter = `blur(${10 * dpr}px) contrast(260%) brightness(110%)`;
                    ctx.fillStyle = color;
                    ctx.beginPath(); ctx.ellipse(lx, botY, lw * 0.6, (20 + Math.sin(t * 2) * 2) * dpr, 0, 0, Math.PI * 2); ctx.fill();
                    lamp.blobs.forEach((b) => {
                        const bx = lx + Math.sin(t * 0.4 + b.phase) * (lw * 0.08);
                        const by = topY + b.y * lampH;
                        const bSize = (b.size + Math.sin(t * 0.5 + b.phase) * 2) * dpr;
                        let stretch = 1 + Math.abs(b.vy) * 1100;
                        if (b.state === 'heating') stretch = 0.55;
                        const squash = 1 / stretch;
                        ctx.beginPath();
                        for (let i = 0; i <= 14; i++) {
                            const angle = (i / 14) * Math.PI * 2;
                            const reach = bSize * (1 + Math.sin(t * 0.5 + b.phase + i) * 0.1);
                            const px = (reach * squash) * Math.cos(angle);
                            const py = (reach * stretch) * (angle > Math.PI ? 1.25 : 0.75) * Math.sin(angle);
                            if (i === 0) ctx.moveTo(bx + px, by + py); else ctx.lineTo(bx + px, by + py);
                        }
                        ctx.fill();
                    });
                    ctx.filter = 'none'; ctx.restore();
                    const shine = ctx.createLinearGradient(lx - lw / 2, 0, lx + lw / 2, 0);
                    shine.addColorStop(0, 'transparent'); shine.addColorStop(0.1, 'rgba(255,255,255,0.04)');
                    shine.addColorStop(0.2, 'transparent'); shine.addColorStop(0.85, 'rgba(255,255,255,0.02)');
                    ctx.fillStyle = shine; ctx.beginPath(); ctx.moveTo(lx - lw / 2, botY); ctx.lineTo(lx + lw / 2, botY); ctx.lineTo(lx + tw / 2, topY); ctx.lineTo(lx - tw / 2, topY);
                    ctx.closePath(); ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1 * dpr; ctx.stroke();
                }
            });

            if (theme.mode !== 'SCREEN_WIDE') drawPillar(w, h, dpr);

            if (active) animationRef.current = requestAnimationFrame(render);
        };

        const res = () => { if (!canvas) return; const dPR = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dPR; canvas.height = canvas.offsetHeight * dPR; };
        res(); window.addEventListener('resize', res); render();
        return () => { active = false; cancelAnimationFrame(animationRef.current); window.removeEventListener('resize', res); };
    }, [theme, world]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default LavaLampBanner;
