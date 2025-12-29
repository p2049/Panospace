import React, { useRef, useEffect, useMemo } from 'react';
import { useLayoutEngine } from '../../core/responsive/useLayoutEngine';

/**
 * CyberLoftBanner - "The Rainy Safehouse"
 * 
 * Aesthetic: Cozy, melancholic, reflective.
 * Visuals: 
 *  - High-fidelity canvas rain simulation (sliding drops, impact splashes).
 *  - Heavy bokeh city background (out of focus neon lights).
 *  - Industrial Steel Window Frame (CSS-based).
 */

const PALETTES = {
    loft_cyber: {
        bg: '#050510',
        bokeh: ['#FF5C8A', '#1B82FF', '#5A3FFF', '#7FFFD4'], // Panospace Brand
        tint: 'rgba(10, 20, 40, 0.4)',
        rainColor: 'rgba(200, 230, 255, 0.15)'
    },
    loft_noir: {
        bg: '#000000',
        bokeh: ['#CCC', '#888', '#444', '#FFF'],
        tint: 'rgba(0,0,0,0.6)',
        rainColor: 'rgba(255, 255, 255, 0.1)'
    },
    loft_gold: {
        bg: '#1a0d00',
        bokeh: ['#FF914D', '#FFD700', '#FF5C8A', '#ffaa00'], // Blade Runner Sepia
        tint: 'rgba(40, 20, 0, 0.5)',
        rainColor: 'rgba(255, 220, 180, 0.15)'
    },
    loft_storm: {
        bg: '#00050a',
        bokeh: ['#7FDBFF', '#FFFFFF', '#001835', '#1B82FF'],
        tint: 'rgba(0, 10, 25, 0.5)',
        rainColor: 'rgba(200, 240, 255, 0.2)'
    }
};

const CyberLoftBanner = ({ variant = 'loft_cyber' }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const palette = PALETTES[variant] || PALETTES.loft_cyber;

    // Generate static city lights (Bokeh)
    const bokehLights = useMemo(() => {
        return [...Array(40)].map(() => ({
            x: Math.random(),
            y: Math.random(),
            size: 20 + Math.random() * 60,
            color: palette.bokeh[Math.floor(Math.random() * palette.bokeh.length)],
            pulseSpeed: 0.001 + Math.random() * 0.002,
            phase: Math.random() * Math.PI * 2,
            driftX: (Math.random() - 0.5) * 0.05
        }));
    }, [palette]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Raindrops state
        let drops = [];
        const maxDrops = 150; // Performance limit
        const rainAngle = 0.1; // Slight wind

        class Drop {
            constructor(w, h) {
                this.reset(w, h, true);
            }

            reset(w, h, randomY = false) {
                this.x = Math.random() * w;
                this.y = randomY ? Math.random() * h : -20;
                this.len = 10 + Math.random() * 20;
                this.speed = 15 + Math.random() * 10;
                this.width = 1 + Math.random() * 1.5;
                this.splashLine = false;
            }

            update(w, h) {
                this.x += this.speed * rainAngle;
                this.y += this.speed;
                if (this.y > h) {
                    if (Math.random() > 0.8) {
                        // Create splash eventually
                    }
                    this.reset(w, h);
                }
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.len * rainAngle, this.y + this.len);
                ctx.lineWidth = this.width;
                ctx.strokeStyle = palette.rainColor;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }

        // Sliding Drops on Glass (The "Streak" effect)
        class GlassStreak {
            constructor(w, h) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.dy = 0;
                this.size = 2 + Math.random() * 3;
                this.trail = [];
                this.moving = false;
                this.nextMove = Math.random() * 100;
            }

            update(h) {
                if (this.moving) {
                    this.y += this.dy;
                    this.dy += 0.05; // Gravity acceleration
                    // Add to trail
                    if (Math.random() > 0.5) {
                        this.trail.push({ x: this.x, y: this.y, size: this.size * (0.5 + Math.random() * 0.5) });
                    }
                    if (this.y > h) this.reset();
                } else {
                    this.nextMove--;
                    if (this.nextMove <= 0) {
                        this.moving = true;
                        this.dy = 0.5;
                    }
                }
                // Fade trails
                if (this.trail.length > 20) this.trail.shift();
            }

            reset() {
                this.y = Math.random() * -100;
                this.x = Math.random() * canvas.width;
                this.dy = 0;
                this.moving = false;
                this.nextMove = Math.random() * 300;
                this.trail = [];
            }

            draw(ctx) {
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                // Head
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                // Trail
                this.trail.forEach(t => {
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, t.size * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
        }

        // Init
        const init = () => {
            drops = [...Array(maxDrops)].map(() => new Drop(canvas.width, canvas.height));
            // streaks = [...Array(10)].map(() => new GlassStreak(canvas.width, canvas.height)); // Disabled streaks for performance preference
        };
        init();

        const render = () => {
            const w = canvas.width;
            const h = canvas.height;
            const time = Date.now() * 0.001;

            // 1. Clear & Background
            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, w, h);

            // 2. Bokeh City Lights
            ctx.globalCompositeOperation = 'screen';
            bokehLights.forEach(b => {
                const pulse = 0.8 + Math.sin(time * 2 + b.phase) * 0.2;
                const drift = Math.sin(time * 0.5 + b.phase) * 20;

                // Draw blurred circle
                ctx.beginPath();
                ctx.arc((b.x * w) + drift, b.y * h, b.size * pulse, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient((b.x * w) + drift, b.y * h, 0, (b.x * w) + drift, b.y * h, b.size * pulse);
                grad.addColorStop(0, b.color + 'aa'); // Hex + Alpha
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fill();
            });

            // 3. Fog / Tint Glass Layer
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = palette.tint;
            ctx.fillRect(0, 0, w, h);

            // 4. Raindrops (Falling)
            drops.forEach(d => {
                d.update(w, h);
                d.draw(ctx);
            });

            // 5. Glass Reflection / Glare
            const glare = ctx.createLinearGradient(0, 0, w, h);
            glare.addColorStop(0, 'transparent');
            glare.addColorStop(0.4, 'rgba(255,255,255,0.02)');
            glare.addColorStop(0.6, 'rgba(255,255,255,0.02)');
            glare.addColorStop(1, 'transparent');
            ctx.fillStyle = glare;
            ctx.fillRect(0, 0, w, h);

            animationRef.current = requestAnimationFrame(render);
        };

        const handleResize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            init();
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        render();

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [palette, bokehLights]);

    // FRAME STYLES
    const frameColor = '#111';
    const gridStyle = {
        background: frameColor,
        boxShadow: '0 0 10px rgba(0,0,0,0.8)'
    };

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            {/* Canvas Layer */}
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

            {/* Window Frame Overlay (CSS Grid) */}
            <div style={{
                position: 'absolute', inset: 0,
                display: 'grid',
                gridTemplateColumns: '1fr 12px 1.5fr', // Industrial ratio
                gridTemplateRows: '1fr 12px 0.6fr',    // Industrial ratio
                pointerEvents: 'none'
            }}>
                {/* Panes are transparent, Grid lines are divs */}

                {/* Top Left Pane */}
                <div style={{ border: '1px solid #222', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}></div>

                {/* Vertical Bar */}
                <div style={gridStyle}></div>

                {/* Top Right Pane */}
                <div style={{ border: '1px solid #222', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}></div>

                {/* Horizontal Row */}
                <div style={gridStyle}></div>
                <div style={{ ...gridStyle, zIndex: 10 }}>{/* Cross Junction */}</div>
                <div style={gridStyle}></div>

                {/* Bottom Left Pane */}
                <div style={{ border: '1px solid #222', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}></div>

                {/* Vertical Bar Lower */}
                <div style={gridStyle}></div>

                {/* Bottom Right Pane */}
                <div style={{ border: '1px solid #222', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}></div>
            </div>

            {/* Condensation / Vignette Overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default CyberLoftBanner;
