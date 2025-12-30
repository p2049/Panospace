import React, { useRef, useEffect } from 'react';

/**
 * ParticleOverlay - Generic particle system for snow, rain, leaves, etc.
 * Highly configurable for different weather/particle effects
 */
const ParticleOverlay = ({
    type = 'snow', // 'snow', 'rain', 'leaves'
    density = 'medium',
    speed = 'medium',
    color = '#FFFFFF'
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });

        let animationFrame;
        let particles = [];

        // Configuration based on type and settings
        const getConfig = () => {
            const densityMap = {
                low: 30,
                medium: 60,
                high: 100
            };

            const speedMap = {
                slow: 0.5,
                medium: 1,
                fast: 1.5
            };

            const count = densityMap[density] || 60;
            const speedMultiplier = speedMap[speed] || 1;

            switch (type) {
                case 'snow':
                    return {
                        count,
                        minSize: 2,
                        maxSize: 5,
                        minSpeed: 0.5 * speedMultiplier,
                        maxSpeed: 2 * speedMultiplier,
                        drift: 0.3, // Horizontal drift
                        opacity: 0.8,
                        shape: 'circle',
                        blur: 2
                    };
                case 'rain':
                    return {
                        count,
                        minSize: 1,
                        maxSize: 2,
                        minSpeed: 5 * speedMultiplier,
                        maxSpeed: 12 * speedMultiplier,
                        drift: 0.5, // Slight angle
                        opacity: 0.6,
                        shape: 'line',
                        lineLength: 15,
                        blur: 0
                    };
                case 'leaves':
                    return {
                        count: count * 0.5, // Fewer leaves
                        minSize: 3,
                        maxSize: 8,
                        minSpeed: 0.8 * speedMultiplier,
                        maxSpeed: 2.5 * speedMultiplier,
                        drift: 1.2, // More horizontal movement
                        opacity: 0.7,
                        shape: 'leaf',
                        rotation: true,
                        blur: 0
                    };
                case 'cherry_blossoms':
                    return {
                        count: count * 0.4, // Delicate, fewer petals
                        minSize: 2,
                        maxSize: 5,
                        minSpeed: 0.3 * speedMultiplier, // Very slow falling
                        maxSpeed: 1 * speedMultiplier,
                        drift: 0.8, // Gentle side-to-side drift
                        opacity: 0.85,
                        shape: 'petal',
                        rotation: true,
                        blur: 1 // Slight softness
                    };
                default:
                    return {};
            }
        };

        const config = getConfig();

        class Particle {
            constructor(w, h) {
                this.reset(w, h, true);
            }

            reset(w, h, isInitial = false) {
                this.x = Math.random() * w;
                this.y = isInitial ? Math.random() * h : -20; // Start above screen
                this.size = config.minSize + Math.random() * (config.maxSize - config.minSize);
                this.speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
                this.drift = (Math.random() - 0.5) * config.drift;

                if (config.rotation) {
                    this.rotation = Math.random() * Math.PI * 2;
                    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
                }

                if (type === 'leaves' || type === 'cherry_blossoms') {
                    // Wobble effect for leaves and cherry blossoms
                    this.wobble = Math.random() * Math.PI * 2;
                    this.wobbleSpeed = 0.02 + Math.random() * 0.03;
                }
            }

            update(w, h) {
                // Vertical movement
                this.y += this.speed;

                // Horizontal drift/wind
                this.x += this.drift;

                // Wobble for leaves and cherry blossoms
                if (type === 'leaves' || type === 'cherry_blossoms') {
                    this.wobble += this.wobbleSpeed;
                    this.x += Math.sin(this.wobble) * 0.5;
                }

                // Rotation
                if (config.rotation) {
                    this.rotation += this.rotationSpeed;
                }

                // Reset if off screen
                if (this.y > h + 20) {
                    this.reset(w, h);
                }
                if (this.x < -20 || this.x > w + 20) {
                    this.reset(w, h);
                }
            }

            draw(ctx, dpr) {
                ctx.save();
                ctx.globalAlpha = config.opacity;

                if (config.blur > 0) {
                    ctx.filter = `blur(${config.blur}px)`;
                }

                ctx.translate(this.x, this.y);

                if (config.rotation) {
                    ctx.rotate(this.rotation);
                }

                switch (config.shape) {
                    case 'circle':
                        // Snow
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(0, 0, this.size * dpr, 0, Math.PI * 2);
                        ctx.fill();
                        break;

                    case 'line':
                        // Rain
                        ctx.strokeStyle = color;
                        ctx.lineWidth = this.size * dpr;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(config.drift * 2, config.lineLength * dpr);
                        ctx.stroke();
                        break;

                    case 'leaf':
                        // Leaf shape
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        // Simple leaf shape using bezier curves
                        const s = this.size * dpr;
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(s * 0.5, -s * 0.3, s, 0);
                        ctx.quadraticCurveTo(s * 0.5, s * 0.3, 0, 0);
                        ctx.fill();
                        break;

                    case 'petal':
                        // Cherry blossom petal shape (5-petal flower)
                        ctx.fillStyle = color;
                        const petalSize = this.size * dpr;
                        const numPetals = 5;

                        for (let i = 0; i < numPetals; i++) {
                            ctx.save();
                            ctx.rotate((Math.PI * 2 * i) / numPetals);
                            ctx.beginPath();
                            // Heart-shaped petal
                            ctx.moveTo(0, 0);
                            ctx.quadraticCurveTo(petalSize * 0.3, -petalSize * 0.2, petalSize * 0.5, 0);
                            ctx.quadraticCurveTo(petalSize * 0.3, petalSize * 0.2, 0, 0);
                            ctx.fill();
                            ctx.restore();
                        }

                        // Center of flower
                        ctx.fillStyle = '#FFE55C'; // Yellow center
                        ctx.beginPath();
                        ctx.arc(0, 0, petalSize * 0.15, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                }

                ctx.restore();
            }
        }

        const initParticles = (w, h) => {
            particles = Array.from({ length: config.count }, () => new Particle(w, h));
        };

        const render = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            const w = rect.width * dpr;
            const h = rect.height * dpr;

            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                initParticles(w, h);
            }

            // Clear
            ctx.clearRect(0, 0, w, h);

            // Update and draw
            particles.forEach(particle => {
                particle.update(w, h);
                particle.draw(ctx, dpr);
            });

            animationFrame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [type, density, speed, color]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10
            }}
        />
    );
};

export default ParticleOverlay;
