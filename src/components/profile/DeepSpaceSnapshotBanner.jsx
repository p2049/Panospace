import React, { useRef, useEffect, useMemo } from 'react';

// Common utils
const hashStr = (str) => {
    let hash = 0;
    if (!str) return 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return hash;
};

const mulberry32 = (a) => {
    return () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const PANO_COLORS = [
    '#7FFFD4', // Classic Mint
    '#7FDBFF', // Aurora Blue
    '#1B82FF', // Ion Blue
    '#A7B6FF', // Cosmic Periwinkle
    '#5A3FFF', // Deep Orbit Purple
    '#FF5C8A', // Solar Flare Pink
    '#FFB7D5', // Nebula Pink
    '#FF914D'  // Stellar Orange
];

const DeepSpaceSnapshotBanner = ({ seed = 'panospace', animationsEnabled = true }) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    // Generate Scene
    const scene = useMemo(() => {
        const numericSeed = hashStr(seed);
        const rand = mulberry32(numericSeed);

        // 1. Color Tint (Subtle background influence)
        const tintColor = PANO_COLORS[Math.floor(rand() * PANO_COLORS.length)];

        // 2. Stars
        const starCount = 300 + Math.floor(rand() * 500);
        const stars = Array.from({ length: starCount }, () => ({
            x: rand(), // 0-1
            y: rand(), // 0-1
            size: rand() * rand() * 2.5, // Bias small
            alpha: 0.3 + rand() * 0.7,
            blinkSpeed: 0.05 + rand() * 0.1,
            phase: rand() * Math.PI * 2
        }));

        // 3. Nebula Cloud
        const cloudCount = 2 + Math.floor(rand() * 3);
        const clouds = Array.from({ length: cloudCount }, () => ({
            x: rand(),
            y: rand(),
            size: 0.4 + rand() * 0.6, // relative to width
            color: PANO_COLORS[Math.floor(rand() * PANO_COLORS.length)],
            opacity: 0.05 + rand() * 0.1
        }));

        // 4. Planets (The "Snapshot" Objects)
        const planetCount = Math.floor(rand() * 3.5); // 0 to 3 planets
        const planets = [];

        for (let i = 0; i < planetCount; i++) {
            let x, y;
            let healthy = false;
            let attempts = 0;
            while (!healthy && attempts < 10) {
                x = 0.1 + rand() * 0.8;
                y = 0.1 + rand() * 0.8;
                // Check dist to center
                const dx = x - 0.5;
                const dy = y - 0.5;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0.3) healthy = true; // Must be > 30% away from center
                attempts++;
            }
            if (!healthy && attempts >= 10) x = 0.2; // Fallback

            const scale = 0.15 + rand() * 0.45; // Larger min scale for impact
            const isRinged = rand() > 0.7;
            const planetColor = PANO_COLORS[Math.floor(rand() * PANO_COLORS.length)];
            const planetColor2 = PANO_COLORS[Math.floor(rand() * PANO_COLORS.length)]; // Secondary color for gradient

            planets.push({
                x, y, scale, isRinged,
                color1: planetColor,
                color2: planetColor2,
                texture: rand() > 0.5 ? 'striped' : 'cratered',
                tilt: (rand() - 0.5) * Math.PI * 0.5,
                ringColor: PANO_COLORS[Math.floor(rand() * PANO_COLORS.length)]
            });
        }

        // 5. Special Objects (Ships/Comets) - Rare
        const special = rand() > 0.85 ? (rand() > 0.5 ? 'ship' : 'comet') : null;
        let specialObj = null;
        if (special) {
            specialObj = {
                type: special,
                x: rand(),
                y: rand(),
                vx: (rand() - 0.5) * 0.001,
                vy: (rand() - 0.5) * 0.001
            };
        }

        return { tintColor, stars, clouds, planets, specialObj };
    }, [seed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrame;
        const startTime = Date.now();

        const render = () => {
            const w = canvas.width;
            const h = canvas.height;
            const t = animationsEnabled ? (Date.now() - startTime) * 0.001 : 0;

            // Clear - Deep Dark Background
            ctx.fillStyle = '#020205';
            ctx.fillRect(0, 0, w, h);

            // Subtle Tint Overlay
            const tintGrad = ctx.createLinearGradient(0, 0, w, h);
            tintGrad.addColorStop(0, `${scene.tintColor}11`); // Very transparent
            tintGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = tintGrad;
            ctx.fillRect(0, 0, w, h);

            // Nebula
            ctx.globalCompositeOperation = 'screen';
            scene.clouds.forEach(c => {
                const grad = ctx.createRadialGradient(
                    c.x * w, c.y * h, 0,
                    c.x * w, c.y * h, c.size * w
                );
                grad.addColorStop(0, `${c.color}${Math.floor(c.opacity * 255).toString(16).padStart(2, '0')}`);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
            });
            ctx.globalCompositeOperation = 'source-over';

            // Stars
            ctx.fillStyle = '#FFF';
            scene.stars.forEach(s => {
                const alpha = s.alpha * (0.8 + 0.2 * Math.sin(t * s.blinkSpeed * 10 + s.phase));
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;

            // Planets
            scene.planets.forEach(p => {
                const px = p.x * w;
                const py = p.y * h;
                const pr = p.scale * (w < h ? w : h) * 0.5; // Radius relative to min dimension

                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(p.tilt);

                // Planet Atmosphere Glow
                ctx.shadowColor = p.color1;
                ctx.shadowBlur = pr * 0.2;
                ctx.fillStyle = '#000'; // Base for shadow casting
                ctx.beginPath();
                ctx.arc(0, 0, pr, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0; // Reset

                // High-Quality Planet Gradient (3D Sphere Look)
                // Light source from top-left relative to tilt
                const planetGrad = ctx.createRadialGradient(-pr * 0.4, -pr * 0.4, 0, 0, 0, pr);
                planetGrad.addColorStop(0, p.color1);   // Highlight
                planetGrad.addColorStop(0.5, p.color2); // Midtone
                planetGrad.addColorStop(1, '#000000');  // Shadow side

                ctx.fillStyle = planetGrad;
                ctx.beginPath();
                ctx.arc(0, 0, pr, 0, Math.PI * 2);
                ctx.fill();

                // Texture Overlay (Clipped to planet)
                ctx.save();
                ctx.beginPath();
                ctx.arc(0, 0, pr, 0, Math.PI * 2);
                ctx.clip();

                ctx.globalCompositeOperation = 'overlay';
                // Bands
                if (p.texture === 'striped') {
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    for (let j = 0; j < 7; j++) {
                        const bandY = -pr + j * (pr / 3.5);
                        ctx.fillRect(-pr, bandY, pr * 2, pr * 0.15);
                    }
                } else {
                    // Craters / Noise
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    for (let k = 0; k < 5; k++) {
                        const cx = (hashStr(k.toString()) % 100) / 50 - 1; // Pseudo-random positions
                        const cy = (hashStr((k + 5).toString()) % 100) / 50 - 1;
                        ctx.beginPath();
                        ctx.arc(cx * pr * 0.7, cy * pr * 0.7, pr * 0.15, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.restore(); // End clipping

                // Shadow Crescent (Day/Night cycle effect)
                // Simulated by drawing a large offset circle in black with blur
                ctx.globalCompositeOperation = 'source-over';

                // Realistic Terminator Shadow:
                // Draw a black circle offset down-right
                ctx.beginPath();
                ctx.arc(0, 0, pr, 0, Math.PI * 2);
                ctx.clip(); // Clip to planet again
                ctx.fillStyle = 'rgba(0,0,0,0.85)';
                ctx.filter = `blur(${pr * 0.1}px)`;
                ctx.beginPath();
                ctx.arc(pr * 0.5, pr * 0.5, pr * 1.1, 0, Math.PI * 2);
                ctx.fill();
                ctx.filter = 'none';

                // Rings
                if (p.isRinged) {
                    ctx.save();
                    // Rings should go BEHIND planet on top half, IN FRONT on bottom?
                    // Simple approach: Draw full ellipse, then cut out planet? 
                    // No, draw back half, draw planet, draw front half.
                    // But we already drew planet.
                    // Let's just draw rings on top with transparency for "Pro" look
                    ctx.globalCompositeOperation = 'screen';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, pr * 2.5, pr * 0.5, -0.2, 0, Math.PI * 2);
                    ctx.strokeStyle = `${p.ringColor}66`; // Transparent
                    ctx.lineWidth = pr * 0.3;
                    ctx.stroke();

                    // Detail ring
                    ctx.beginPath();
                    ctx.ellipse(0, 0, pr * 2.5, pr * 0.5, -0.2, 0, Math.PI * 2);
                    ctx.strokeStyle = `${p.ringColor}AA`;
                    ctx.lineWidth = pr * 0.05;
                    ctx.stroke();

                    ctx.globalCompositeOperation = 'source-over';
                    ctx.restore();
                }

                ctx.restore(); // Restore to scene coords
            });

            // Special Objects
            if (scene.specialObj) {
                const { x, y, type, vx, vy } = scene.specialObj;
                const curX = (x + vx * t * 10) % 1;
                const curY = (y + vy * t * 10) % 1;
                const sx = curX * w;
                const sy = curY * h;

                ctx.save();
                ctx.translate(sx, sy);
                if (type === 'ship') {
                    // Triangle ship
                    ctx.rotate(t * 0.5); // Spin slowly
                    ctx.fillStyle = '#FFF';
                    ctx.shadowColor = '#0FF';
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.moveTo(10, 0);
                    ctx.lineTo(-5, 5);
                    ctx.lineTo(-5, -5);
                    ctx.fill();
                    // Engine glow
                    ctx.shadowColor = '#F0F';
                    ctx.beginPath();
                    ctx.arc(-8, 0, 3, 0, Math.PI * 2);
                    ctx.fill();

                } else {
                    // Comet
                    const tailX = Math.cos(t) * 40;
                    const tailY = Math.sin(t) * 40;
                    const grad = ctx.createLinearGradient(0, 0, tailX, tailY);
                    grad.addColorStop(0, '#FFF');
                    grad.addColorStop(1, 'transparent');
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(tailX, tailY);
                    ctx.stroke();
                    ctx.fillStyle = '#FFF';
                    ctx.beginPath();
                    ctx.arc(0, 0, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            if (animationsEnabled) {
                animationFrame = requestAnimationFrame(render);
            }
        };

        const onResize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
            if (!animationsEnabled) render();
        };

        window.addEventListener('resize', onResize);
        onResize();
        if (animationsEnabled) render();

        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(animationFrame);
        };
    }, [scene, animationsEnabled]);

    return (
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#020205' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default DeepSpaceSnapshotBanner;
