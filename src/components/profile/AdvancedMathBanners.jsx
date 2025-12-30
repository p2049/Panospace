import React, { useRef, useEffect } from 'react';

/**
 * ADHD-FRIENDLY 3D MATH BANNERS
 * Hypnotic, mesmerizing, constantly moving mathematical visualizations
 */

// 1. LORENZ ATTRACTOR - The Butterfly Effect
export const LorenzAttractorBanner = ({ profileBorderColor = '#7FFFD4', variant = 'classic' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;

        // Lorenz system parameters
        const sigma = 10;
        const rho = 28;
        const beta = 8 / 3;

        // Starting points for multiple attractors
        const attractors = Array.from({ length: 3 }, (_, i) => ({
            x: 0.1 + i * 0.1,
            y: 0,
            z: 0,
            color: (variant === 'rainbow' || variant.includes('rainbow') || profileBorderColor === 'brand')
                ? ['#FF5C8A', '#7FFFD4', '#1B82FF'][i]
                : profileBorderColor,
            rotation: i * (Math.PI * 2 / 3)
        }));

        const dt = 0.002; // Slower time step (was 0.005)
        let time = 0;

        const render = () => {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width;
            const h = canvas.height;

            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#000508';
            ctx.fillRect(0, 0, w, h);

            const scale = Math.min(w, h) / 85;
            const centerX = w / 2;
            const centerY = h / 2;

            attractors.forEach(attractor => {
                // Lorenz equations
                const dx = sigma * (attractor.y - attractor.x);
                const dy = attractor.x * (rho - attractor.z) - attractor.y;
                const dz = attractor.x * attractor.y - beta * attractor.z;

                // Slower time step (0.001)
                attractor.x += dx * 0.001;
                attractor.y += dy * 0.001;
                attractor.z += dz * 0.001;

                // Slower rotation
                const rotY = time * 0.0002 + attractor.rotation;
                const x3d = attractor.x;
                const y3d = attractor.y;
                const z3d = attractor.z;

                const x = x3d * Math.cos(rotY) - z3d * Math.sin(rotY);
                const z = x3d * Math.sin(rotY) + z3d * Math.cos(rotY);

                const screenX = centerX + x * scale;
                const screenY = centerY - y3d * scale;

                // Glowing Head
                const grad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 15 * dpr);
                grad.addColorStop(0, attractor.color);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(screenX, screenY, 15 * dpr, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;

                // Bright Core
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(screenX, screenY, 2 * dpr, 0, Math.PI * 2);
                ctx.fill();
            });

            time++;
            animationFrame = requestAnimationFrame(render);
        };

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
        };

        resize();
        window.addEventListener('resize', resize);
        render();

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', resize);
        };
    }, [profileBorderColor, variant]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000508' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

// 2. PARTICLE PHYSICS - Gravitational Dance
export const ParticlePhysicsBanner = ({ profileBorderColor = '#7FFFD4' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;

        // Create particles (fewer for less clutter)
        const particles = Array.from({ length: 100 }, () => ({
            x: Math.random(),
            y: Math.random(),
            vx: (Math.random() - 0.5) * 0.0004, // Slower (was 0.001)
            vy: (Math.random() - 0.5) * 0.0004,
            mass: 0.5 + Math.random() * 1.5,
            hue: Math.random() * 360
        }));

        // Attractors (softer strength)
        const attractors = [
            { x: 0.3, y: 0.5, strength: 0.000005 }, // Halved strength
            { x: 0.7, y: 0.5, strength: 0.000005 }
        ];

        const render = () => {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width;
            const h = canvas.height;

            // Solid clear - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#00000a';
            ctx.fillRect(0, 0, w, h);

            // Update and draw particles
            particles.forEach((p, i) => {
                // Gravity from attractors
                attractors.forEach(att => {
                    const dx = att.x - p.x;
                    const dy = att.y - p.y;
                    const distSq = dx * dx + dy * dy + 0.005; // Softened distance (was 0.001)
                    const dist = Math.sqrt(distSq);
                    const force = att.strength / distSq;

                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                });

                // Particle-particle interaction (minimal for calming feel)
                particles.forEach((p2, j) => {
                    if (i === j) return;
                    const dx = p2.x - p.x;
                    const dy = p2.y - p.y;
                    const distSq = dx * dx + dy * dy + 0.005;
                    const dist = Math.sqrt(distSq);

                    if (dist < 0.08) { // Smaller radius (was 0.1)
                        const force = 0.0000005 / distSq; // Half force
                        p.vx += (dx / dist) * force;
                        p.vy += (dy / dist) * force;
                    }
                });

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Even more damping for honey-like movement
                p.vx *= 0.96;
                p.vy *= 0.96;

                // Wrap around
                if (p.x < 0) p.x = 1;
                if (p.x > 1) p.x = 0;
                if (p.y < 0) p.y = 1;
                if (p.y > 1) p.y = 0;

                // Draw particle
                const px = p.x * w;
                const py = p.y * h;
                const size = p.mass * 2.5 * dpr; // Smaller (was 3)

                const grad = ctx.createRadialGradient(px, py, 0, px, py, size * 4);
                grad.addColorStop(0, profileBorderColor);
                grad.addColorStop(1, 'transparent');
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, size * 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;

                // Core
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(px, py, size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw connections - much subtler
            ctx.strokeStyle = profileBorderColor + '08'; // Very faint (was 20)
            ctx.lineWidth = 0.8 * dpr;
            particles.forEach((p, i) => {
                particles.forEach((p2, j) => {
                    if (i >= j) return;
                    const dx = (p2.x - p.x) * w;
                    const dy = (p2.y - p.y) * h;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 70 * dpr) { // Shorter range (was 100)
                        ctx.beginPath();
                        ctx.moveTo(p.x * w, p.y * h);
                        ctx.lineTo(p2.x * w, p2.y * h);
                        ctx.stroke();
                    }
                });
            });

            animationFrame = requestAnimationFrame(render);
        };

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
        };

        resize();
        window.addEventListener('resize', resize);
        render();

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', resize);
        };
    }, [profileBorderColor]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#00000a' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

// 3. FIBONACCI SPIRAL PARTICLES - Golden Ratio Hypnosis
export const FibonacciSpiralBanner = ({ profileBorderColor = '#7FFFD4' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;
        let time = 0;

        const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
        const particles = [];
        const maxParticles = 400; // Slightly fewer (was 500)

        const render = () => {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width;
            const h = canvas.height;

            // Solid clear - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#000510';
            ctx.fillRect(0, 0, w, h);

            const centerX = w / 2;
            const centerY = h / 2;

            // Spawn new particles even slower
            if (particles.length < maxParticles && time % 5 === 0) { // (was 3)
                particles.push({
                    angle: time * phi,
                    radius: 0,
                    life: 0,
                    maxLife: 250 // Longer life for slower drift (was 200)
                });
            }

            // Update and draw particles
            particles.forEach((p, i) => {
                p.life++;
                p.radius = p.life * 0.8;

                const angle = p.angle + time * 0.001;
                const x = centerX + Math.cos(angle) * p.radius;
                const y = centerY + Math.sin(angle) * p.radius;

                const alpha = (1 - (p.life / p.maxLife)) * 0.6; // Softened opacity
                const size = (2 + Math.sin(p.life * 0.05) * 1.5) * dpr; // Smaller pulsing

                // Softer Glow
                const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
                grad.addColorStop(0, profileBorderColor);
                grad.addColorStop(1, 'transparent');
                ctx.globalAlpha = alpha;
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, size * 4, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
                ctx.fill();

                ctx.globalAlpha = 1;

                // Remove dead particles
                if (p.life >= p.maxLife || p.radius > Math.max(w, h)) {
                    particles.splice(i, 1);
                }
            });

            time++;
            animationFrame = requestAnimationFrame(render);
        };

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
        };

        resize();
        window.addEventListener('resize', resize);
        render();

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', resize);
        };
    }, [profileBorderColor]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000510' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default { LorenzAttractorBanner, ParticlePhysicsBanner, FibonacciSpiralBanner };
