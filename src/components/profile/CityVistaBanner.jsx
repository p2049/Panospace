import React, { useRef, useEffect, useMemo } from 'react';

/**
 * CityVistaBanner - Cinematic "Sea of Lights" view from a high mountain.
 * Inspired by sprawling nocturnal cityscapes with dense sodium lighting and geographic features.
 */
const CityVistaBanner = ({ starSettings }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const BRAND = {
        voidPurple: '#2A0E61',
        deepOrbit: '#5A3FFF',
        auroraMint: '#8CFFE9',
        ionBlue: '#1B82FF',
        auroraBlue: '#7FDBFF',
        solarPink: '#FF5C8A',
        vividOrange: '#F07A33', // Realistic sodium orange
        white: '#FFFFFF',
        black: '#000000'
    };

    const CITY_COLORS = {
        sodium: '#ff9d2b',    // Rich amber
        sodiumDim: '#cc7a1f', // Dimmer amber for suburbs
        led: '#e0fbff',       // Cool white/blue LED
        signal: '#ff4d4d'     // Red traffic signals
    };

    // Generate static city data
    const cityData = useMemo(() => {
        const lights = [];

        // 1. Highways / Arteries
        const arteries = [
            { x1: 0.1, y1: 0.8, x2: 0.95, y2: 0.35, width: 0.02 }, // Main diagonal highway
            { x1: 0.4, y1: 0.95, x2: 0.55, y2: 0.2, width: 0.015 }, // Vertical artery
        ];

        // 2. City Clusters
        const clusters = [
            { x: 0.5, y: 0.5, radius: 0.45, density: 2000 }, // Dense central sprawl
            { x: 0.8, y: 0.65, radius: 0.25, density: 800 },  // Secondary cluster
            { x: 0.2, y: 0.45, radius: 0.2, density: 400 }    // Third cluster
        ];

        // Function to check if a point is in a dark geographic area (like a bay or unbuilt hill)
        const isExcluded = (x, y) => {
            // A curved bay area on the left
            const bayDx = x - 0.2;
            const bayDy = y - 0.35;
            const bayDist = Math.sqrt(bayDx * bayDx + bayDy * bayDy * 2);
            if (bayDist < 0.12) return true;

            // A dark hill mass in the mid-ground
            const hillDx = x - 0.7;
            const hillDy = y - 0.4;
            const hillDist = Math.sqrt(hillDx * hillDx * 2 + hillDy * hillDy);
            if (hillDist < 0.08) return true;

            return false;
        };

        // Generate points for general sprawl
        clusters.forEach(c => {
            for (let i = 0; i < c.density; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random()) * c.radius;
                const x = c.x + Math.cos(angle) * r;
                const y = c.y + Math.sin(angle) * r;

                if (x < 0 || x > 1 || y < 0 || y > 1 || isExcluded(x, y)) continue;

                const isSodium = Math.random() > 0.2;
                lights.push({
                    x, y,
                    color: isSodium ? (Math.random() > 0.7 ? CITY_COLORS.sodium : CITY_COLORS.sodiumDim) : CITY_COLORS.led,
                    size: 0.4 + Math.random() * 0.9,
                    phase: Math.random() * Math.PI * 2
                });
            }
        });

        // Generate artery/highway lights (continuous streams)
        arteries.forEach(a => {
            const count = 500;
            for (let i = 0; i < count; i++) {
                const t = Math.random();
                const x = a.x1 + (a.x2 - a.x1) * t + (Math.random() - 0.5) * a.width;
                const y = a.y1 + (a.y2 - a.y1) * t + (Math.random() - 0.5) * a.width;

                if (x < 0 || x > 1 || y < 0 || y > 1 || isExcluded(x, y)) continue;

                lights.push({
                    x, y,
                    color: i % 12 === 0 ? CITY_COLORS.signal : CITY_COLORS.led,
                    size: 1.1 + Math.random() * 0.6,
                    intensity: 1.6
                });
            }
        });

        // Sort by y to ensure correct drawing order (though they are pixels, helps with overlap)
        return lights.sort((a, b) => a.y - b.y);
    }, []);

    const starField = useMemo(() => {
        return [...Array(50)].map(() => ({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 0.7 + 0.2,
            phase: Math.random() * Math.PI * 2
        }));
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const render = () => {
            const w = canvas.width;
            const h = canvas.height;
            if (w === 0 || h === 0) return;

            const time = Date.now() * 0.0004;
            const horizonY = h * 0.38;

            ctx.clearRect(0, 0, w, h);

            // --- 1. ATMOSPHERIC SKY ---
            const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
            skyGrad.addColorStop(0, '#020308');
            skyGrad.addColorStop(1, '#080a1a');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, w, horizonY + 2);

            // --- 2. STARS ---
            if (starSettings?.enabled !== false) {
                ctx.fillStyle = starSettings?.color === 'brand' ? BRAND.auroraBlue : (starSettings?.color || BRAND.white);
                starField.forEach((star) => {
                    const sx = star.x * w;
                    const sy = star.y * horizonY * 0.85;
                    ctx.globalAlpha = (0.25 + (Math.sin(time * 2.5 + star.phase) * 0.3 + 0.3)) * (1 - (sy / horizonY));
                    ctx.beginPath(); ctx.arc(sx, sy, star.size, 0, Math.PI * 2); ctx.fill();
                });
                ctx.globalAlpha = 1;
            }

            // --- 3. HORIZON HAZE (Light Pollution) ---
            const haze = ctx.createLinearGradient(0, horizonY - 50, 0, horizonY + 5);
            haze.addColorStop(0, 'transparent');
            haze.addColorStop(1, 'rgba(240, 122, 51, 0.12)');
            ctx.fillStyle = haze;
            ctx.fillRect(0, horizonY - 50, w, 55);

            // --- 4. THE SEA OF LIGHTS ---
            const pX = w / 2;

            cityData.forEach(p => {
                const depth = p.y;
                const scale = Math.pow(depth, 2) * 2.2;

                // Wide, cinematic perspective spread
                const screenY = horizonY + (depth * (h - horizonY)) * 0.88;
                const spread = w * (0.9 + depth * 3.8);
                const screenX = pX + (p.x - 0.5) * spread;

                if (screenY > h + 30 || screenX < -100 || screenX > w + 100) return;

                let opacity = 0.15 + depth * 0.85;

                const lSize = Math.max(0.4, p.size * scale);

                ctx.globalAlpha = opacity;
                ctx.fillStyle = p.color;
                ctx.fillRect(screenX, screenY, lSize, lSize);

                // Subtle bloom for highway arteries and closer points
                if (depth > 0.45 || p.intensity) {
                    ctx.globalAlpha = opacity * 0.18;
                    ctx.beginPath();
                    ctx.arc(screenX + lSize / 2, screenY + lSize / 2, lSize * 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // --- 5. FOREGROUND TERRAIN (Mountain Top) ---
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#010103';
            ctx.beginPath();
            ctx.moveTo(0, h);

            const hillPoints = 80;
            for (let i = 0; i <= hillPoints; i++) {
                const px = (i / hillPoints) * w;
                const normalizedX = (i / hillPoints);

                // Create a jagged, rocky mountain profile
                const base = Math.cos(normalizedX * Math.PI - 0.3) * 0.15 + 0.1;
                const crags = Math.sin(normalizedX * 8) * 0.03 + Math.cos(normalizedX * 45) * 0.012;
                const texture = Math.sin(normalizedX * 300) * 0.002;

                const py = h - (base + crags + texture) * h;
                ctx.lineTo(px, py);
            }
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.fill();

            // Valley haze/fog transition
            const fog = ctx.createLinearGradient(0, h * 0.75, 0, h);
            fog.addColorStop(0, 'transparent');
            fog.addColorStop(1, 'rgba(8, 10, 26, 0.45)');
            ctx.fillStyle = fog;
            ctx.fillRect(0, h * 0.75, w, h * 0.25);

            animationRef.current = requestAnimationFrame(render);
        };

        const resize = () => {
            if (!canvasRef.current) return;
            canvasRef.current.width = canvasRef.current.offsetWidth;
            canvasRef.current.height = canvasRef.current.offsetHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        render();
        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', resize);
        };
    }, [cityData, starField, starSettings]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default CityVistaBanner;
