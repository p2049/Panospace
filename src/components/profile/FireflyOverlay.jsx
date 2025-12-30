import React, { useRef, useEffect } from 'react';

/**
 * FireflyOverlay - Animated fireflies floating across the banner
 * Can be layered on top of any banner as an overlay
 */
const FireflyOverlay = ({ color = '#FFD700', density = 'medium', speed = 'medium' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });

        let animationFrame;
        let time = 0;

        // Configuration based on density
        const getDensity = () => {
            if (density === 'low') return 15;
            if (density === 'high') return 50;
            return 30; // medium
        };

        const getSpeed = () => {
            if (speed === 'slow') return 0.3;
            if (speed === 'fast') return 1.0;
            return 0.6; // medium
        };

        const FIREFLY_COUNT = getDensity();
        const SPEED_MULTIPLIER = getSpeed();

        // Firefly class
        class Firefly {
            constructor(w, h) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.15 * SPEED_MULTIPLIER;
                this.vy = (Math.random() - 0.5) * 0.15 * SPEED_MULTIPLIER;
                this.size = 1 + Math.random() * 1;
                this.glow = 3 + Math.random() * 6;

                // Pulsing animation
                this.pulseSpeed = 0.008 + Math.random() * 0.012;
                this.pulsePhase = Math.random() * Math.PI * 2;
                this.brightness = 0;

                // Flight pattern
                this.wanderAngle = Math.random() * Math.PI * 2;
            }

            update(w, h, time) {
                // Much gentler wandering motion
                this.wanderAngle += (Math.random() - 0.5) * 0.03;
                this.vx += Math.cos(this.wanderAngle) * 0.003 * SPEED_MULTIPLIER;
                this.vy += Math.sin(this.wanderAngle) * 0.003 * SPEED_MULTIPLIER;

                // Stronger damping for calmer movement
                this.vx *= 0.95;
                this.vy *= 0.95;

                // Update position
                this.x += this.vx;
                this.y += this.vy;

                // Wrap around edges with margin
                const margin = 50;
                if (this.x < -margin) this.x = w + margin;
                if (this.x > w + margin) this.x = -margin;
                if (this.y < -margin) this.y = h + margin;
                if (this.y > h + margin) this.y = -margin;

                // Slower, more subtle pulse brightness (firefly blink effect)
                this.brightness = (Math.sin(time * this.pulseSpeed + this.pulsePhase) + 1) / 2;
                // More gradual fade
                this.brightness = Math.pow(this.brightness, 1.5); // Less dramatic than 2
            }

            draw(ctx, dpr, color) {
                const alpha = this.brightness;
                if (alpha < 0.05) return; // Don't draw nearly invisible fireflies

                ctx.save();

                // Outer glow
                const grad = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.glow * dpr
                );
                grad.addColorStop(0, color);
                grad.addColorStop(0.3, `${color}${Math.floor(alpha * 128).toString(16).padStart(2, '0')}`);
                grad.addColorStop(1, 'transparent');

                ctx.fillStyle = grad;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.glow * dpr, 0, Math.PI * 2);
                ctx.fill();

                // Bright core
                ctx.globalAlpha = alpha * 0.9;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * dpr * 0.4, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        let fireflies = [];

        const initFireflies = (w, h) => {
            fireflies = Array.from({ length: FIREFLY_COUNT }, () => new Firefly(w, h));
        };

        const render = () => {
            time += 1;

            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            const w = rect.width * dpr;
            const h = rect.height * dpr;

            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                initFireflies(w, h);
            }

            // Clear canvas (transparent)
            ctx.clearRect(0, 0, w, h);

            // Update and draw fireflies
            fireflies.forEach(firefly => {
                firefly.update(w, h, time);
                firefly.draw(ctx, dpr, color);
            });

            animationFrame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [color, density, speed]);

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

export default FireflyOverlay;
