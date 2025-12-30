import React, { useRef, useEffect } from 'react'; // Refresh HMR

const SolarSystemBanner = ({ profileBorderColor, variant, starSettings }) => {
    const canvasRef = useRef(null);
    const starsRef = useRef([]);
    const systemsRef = useRef(null);
    const timeRef = useRef(0);
    // Panospace Core Brand Colors
    const BRAND_COLORS = [
        '#7FFFD4', // Mint
        '#FF5C8A', // Pink
        '#1B82FF', // Blue
        '#5A3FFF', // Purple
        '#FF914D', // Orange
        '#8CFFE9'  // Ice
    ];

    useEffect(() => {
        // Initialize Stars if needed
        if (starsRef.current.length === 0) {
            starsRef.current = Array.from({ length: 150 }).map(() => ({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 1.5,
                alpha: 0.2 + Math.random() * 0.8
            }));
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });

        let animationFrame;
        let time = timeRef.current; // Resume animation time

        // Configuration
        const SPEED_FACTOR = 0.001;

        const getColor = (index) => {
            if (variant === 'solar_multi' || variant === 'solar_skewed') {
                return BRAND_COLORS[index % BRAND_COLORS.length];
            }
            if (variant && variant.startsWith('#')) return variant;

            const colorMap = {
                'solar_mint': '#7FFFD4',
                'solar_pink': '#FF5C8A',
                'solar_blue': '#1B82FF',
                'solar_purple': '#5A3FFF',
                'solar_orange': '#FF914D',
                'solar_ice': '#FFFFFF'
            };

            if (colorMap[variant]) return colorMap[variant];
            return profileBorderColor || '#7FFFD4';
        };

        // Initialize Systems (Once)
        if (!systemsRef.current) {
            const createSystem = () => Array.from({ length: 9 }).map((_, i) => ({
                distance: 40 + i * 18,
                size: 3 + Math.random() * 10,
                speed: (0.5 + Math.random() * 0.5) * (i % 2 === 0 ? 1 : -1) * (100 / (40 + i * 22)),
                angle: Math.random() * Math.PI * 2,
                index: i
            }));
            systemsRef.current = {
                left: createSystem(),
                right: createSystem()
            };
        }

        const leftPlanets = systemsRef.current.left.map(p => ({ ...p, color: getColor(p.index) }));
        const rightPlanets = systemsRef.current.right.map(p => ({ ...p, color: getColor(p.index) }));

        const render = () => {
            time += SPEED_FACTOR;
            timeRef.current = time;

            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
            }
            const w = canvas.width;
            const h = canvas.height;

            // Clear
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            // Draw Stars
            if (starSettings?.enabled || true) {
                const starColor = starSettings?.color || '#FFFFFF';
                // Fallback manually if color is undefined
                ctx.fillStyle = starColor;

                starsRef.current.forEach(star => {
                    ctx.globalAlpha = star.alpha;
                    ctx.beginPath();
                    ctx.arc(star.x * w, star.y * h, star.size * dpr, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
            }

            const drawSystem = (centerX, centerY, planets, rotation = 0) => {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(rotation);
                ctx.translate(-centerX, -centerY);

                const tiltScaleY = 0.3;

                // 1. Calculate and Sort Planets
                const calculatedPlanets = planets.map(p => {
                    const currentAngle = p.angle + time * p.speed;
                    const x = centerX + Math.cos(currentAngle) * p.distance * dpr;
                    const y = centerY + Math.sin(currentAngle) * p.distance * tiltScaleY * dpr;
                    const zFactor = Math.sin(currentAngle);
                    return { ...p, currentAngle, x, y, zFactor };
                });

                const backPlanets = calculatedPlanets.filter(p => p.zFactor < 0);
                const frontPlanets = calculatedPlanets.filter(p => p.zFactor >= 0);

                // 2. Draw Orbits
                // Check variant for 'clean' or 'no_path' - hiding paths for cleaner look
                const hidePaths = variant?.includes('clean') || variant?.includes('no_orbits');

                if (!hidePaths) {
                    ctx.lineWidth = 1.5 * dpr;
                    planets.forEach(p => {
                        ctx.beginPath();
                        ctx.strokeStyle = p.color;
                        ctx.globalAlpha = 0.08;
                        ctx.ellipse(centerX, centerY, p.distance * dpr, p.distance * tiltScaleY * dpr, 0, 0, Math.PI * 2);
                        ctx.stroke();
                    });
                    ctx.globalAlpha = 1;
                }

                // Helper to draw a planet
                const drawPlanet = (p) => {
                    const scale = 1 + p.zFactor * 0.2;
                    const radius = Math.max(0.1, p.size * dpr * scale);

                    // Calculations for highlight
                    // Move highlight closer to the edge facing the sun (0.6 offset)
                    const highlightX = p.x - Math.cos(p.currentAngle) * p.size * 0.6 * dpr;
                    const highlightY = p.y - Math.sin(p.currentAngle) * p.size * 0.6 * tiltScaleY * dpr;

                    // Safety Check
                    if (!Number.isFinite(highlightX) || !Number.isFinite(highlightY) || !Number.isFinite(radius) || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return;

                    ctx.beginPath();
                    const planetGrad = ctx.createRadialGradient(highlightX, highlightY, 0, p.x, p.y, radius);
                    planetGrad.addColorStop(0, '#FFFFFF'); // Hotspot
                    planetGrad.addColorStop(0.2, p.color); // Bright color
                    planetGrad.addColorStop(1, '#000000'); // Shadow

                    ctx.fillStyle = planetGrad;
                    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Optional: Inner Glow for 'Light' effect (Atmosphere)
                    const glowGrad = ctx.createRadialGradient(
                        p.x - Math.cos(p.currentAngle) * p.size * 0.8 * dpr,
                        p.y - Math.sin(p.currentAngle) * p.size * 0.8 * tiltScaleY * dpr,
                        0,
                        p.x, p.y, radius
                    );
                    glowGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
                    glowGrad.addColorStop(0.5, 'transparent');

                    ctx.fillStyle = glowGrad;
                    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Moon?
                    if (p.size > 5) {
                        const moonAngle = time * p.speed * 4;
                        const mx = p.x + Math.cos(moonAngle) * p.size * 2.5 * dpr;
                        const my = p.y + Math.sin(moonAngle) * p.size * 2.5 * tiltScaleY * dpr;
                        ctx.beginPath();
                        ctx.fillStyle = '#FFF';
                        ctx.arc(mx, my, 1.5 * dpr * scale, 0, Math.PI * 2);
                        ctx.fill();
                    }
                };

                // 3. Draw Back Planets
                backPlanets.sort((a, b) => a.zFactor - b.zFactor).forEach(drawPlanet);

                // 4. Draw Sun
                const sunGradient = ctx.createRadialGradient(centerX, centerY, 8 * dpr, centerX, centerY, 50 * dpr);
                sunGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
                sunGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.1)');
                sunGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = sunGradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 50 * dpr, 0, Math.PI * 2);
                ctx.fill();

                const pulse = Math.sin(time * 300) * 0.5 + 1;
                ctx.beginPath();
                ctx.fillStyle = '#FFFFFF';
                ctx.shadowBlur = (15 + pulse * 5) * dpr;
                ctx.shadowColor = '#FFFFFF';
                ctx.arc(centerX, centerY, 10 * dpr, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // 5. Draw Front Planets
                frontPlanets.sort((a, b) => a.zFactor - b.zFactor).forEach(drawPlanet);

                ctx.restore();
            };

            const isSkewed = variant === 'solar_skewed';
            drawSystem(w * 0.15, h * 0.5, leftPlanets, isSkewed ? -0.5 : 0);
            drawSystem(w * 0.85, h * 0.5, rightPlanets, isSkewed ? 0.5 : 0);

            animationFrame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [profileBorderColor, variant, starSettings]);

    return (
        <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
            />
            {/* Gradient Overlay for Fade Effect */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.5) 70%, #000 100%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default SolarSystemBanner;
