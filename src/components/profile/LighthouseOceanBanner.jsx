import React, { useRef, useEffect, useMemo } from 'react';

/**
 * LighthouseOceanBanner - Multi-Variant Cinematic Banner
 * 
 * Variants:
 * 1. SUNSET (ocean_lighthouse): Solar Pink / Vivid Orange sky with a warm sun.
 * 2. NIGHT (ocean_lighthouse_night): Black / Void Purple / Deep Orbit sky with a glowing moon.
 * 
 * Features:
 * - Stout 5-striped lighthouse with a structural lantern room.
 * - 3-Octave fractal ocean with horizon masking.
 * - Distant ships with navigation lights.
 */
const LighthouseOceanBanner = ({ variant = 'ocean_lighthouse', starSettings }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const BRAND = {
        voidPurple: '#2A0E61',
        deepOrbit: '#5A3FFF',
        auroraMint: '#8CFFE9',
        ionBlue: '#1B82FF',
        auroraBlue: '#7FDBFF',
        solarPink: '#FF5C8A',
        vividOrange: '#FF914D',
        white: '#FFFFFF',
        black: '#000000'
    };

    const isNight = variant === 'ocean_lighthouse_night';

    const THEME = useMemo(() => {
        if (isNight) {
            return {
                sky: [BRAND.black, '#050210', BRAND.voidPurple, BRAND.deepOrbit],
                sunColor: BRAND.white,
                sunBloom: BRAND.deepOrbit,
                sunSize: 32,
                beamAlpha: 0.6,
                waterBase: '#050208',
                waterLayers: [
                    { alpha: 0.6, color: '#08041a' },
                    { alpha: 0.7, color: '#0a0525' },
                    { alpha: 0.8, color: BRAND.voidPurple },
                    { alpha: 0.85, color: '#3d1e8c' },
                    { alpha: 0.9, color: BRAND.deepOrbit },
                    { alpha: 0.95, color: BRAND.deepOrbit },
                    { alpha: 1.0, color: '#7a5fff' },
                    { alpha: 1.0, color: BRAND.auroraMint + '33' } // Biolum touch
                ]
            };
        }
        return {
            sky: ['#050210', BRAND.voidPurple, BRAND.solarPink, BRAND.vividOrange, '#ffab40'],
            sunColor: BRAND.white,
            sunBloom: BRAND.vividOrange,
            sunSize: 28,
            beamAlpha: 0.4,
            waterBase: '#100520',
            waterLayers: [
                { alpha: 0.6, color: BRAND.voidPurple },
                { alpha: 0.7, color: '#1a0d33' },
                { alpha: 0.8, color: BRAND.voidPurple },
                { alpha: 0.85, color: BRAND.deepOrbit },
                { alpha: 0.9, color: BRAND.ionBlue },
                { alpha: 0.95, color: BRAND.ionBlue },
                { alpha: 1.0, color: BRAND.auroraBlue },
                { alpha: 1.0, color: BRAND.auroraBlue }
            ]
        };
    }, [isNight]);

    const starField = useMemo(() => {
        return [...Array(isNight ? 100 : 60)].map(() => ({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * (isNight ? 1.5 : 1.2) + 0.4,
            twinkleSpeed: Math.random() * 0.8 + 0.2,
            phase: Math.random() * Math.PI * 2
        }));
    }, [isNight]);

    const distantShips = useMemo(() => {
        return [...Array(isNight ? 6 : 4)].map((_, i) => ({
            x: Math.random(),
            speed: 0.002 + Math.random() * 0.005,
            size: 0.4 + Math.random() * 0.6,
            type: i % 2 === 0 ? 'sail' : 'cargo'
        }));
    }, [isNight]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const render = () => {
            const w = canvas.width;
            const h = canvas.height;
            if (w === 0 || h === 0) return;

            const time = Date.now() * 0.0005;
            const horizonY = h * 0.58;

            ctx.clearRect(0, 0, w, h);

            // --- 1. SKY (Clipped) ---
            ctx.save();
            ctx.beginPath(); ctx.rect(0, 0, w, horizonY); ctx.clip();

            const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
            THEME.sky.forEach((color, i) => skyGrad.addColorStop(i / (THEME.sky.length - 1), color));
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, w, horizonY);

            // --- 2. CELESTIAL (Sun or Moon) ---
            const sunX = w * 0.22;
            const sunY = horizonY - 10;
            const sunSize = THEME.sunSize;

            ctx.fillStyle = THEME.sunColor;
            ctx.beginPath(); ctx.arc(sunX, sunY, sunSize, 0, Math.PI * 2); ctx.fill();

            const sunBloom = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize * 4);
            sunBloom.addColorStop(0, THEME.sunBloom + (isNight ? '44' : '33'));
            sunBloom.addColorStop(1, 'transparent');
            ctx.fillStyle = sunBloom;
            ctx.beginPath(); ctx.arc(sunX, sunY, sunSize * 4, 0, Math.PI * 2); ctx.fill();

            // --- 3. STARS ---
            if (starSettings?.enabled || isNight) {
                starField.forEach((star) => {
                    const sx = star.x * w;
                    const sy = star.y * horizonY * 0.95;
                    const opacity = (0.3 + (Math.sin(time * 2 * star.twinkleSpeed + star.phase) * 0.5 + 0.5) * 0.5) * (1 - (sy / horizonY) * (isNight ? 0.8 : 1.5));
                    if (opacity > 0) {
                        ctx.fillStyle = starSettings?.color === 'brand' ? BRAND.auroraBlue : (starSettings?.color || BRAND.white);
                        ctx.globalAlpha = opacity;
                        ctx.beginPath(); ctx.arc(sx, sy, star.size, 0, Math.PI * 2); ctx.fill();
                    }
                });
                ctx.globalAlpha = 1;
            }

            // --- DISTANT SHIPS ---
            distantShips.forEach((ship) => {
                let sx = ((ship.x + time * ship.speed) % 1) * w;
                let sy = horizonY - 2;
                ctx.globalAlpha = isNight ? 0.9 : 0.8;
                ctx.fillStyle = BRAND.black;

                if (ship.type === 'sail') {
                    ctx.fillRect(sx - 4 * ship.size, sy, 8 * ship.size, 2 * ship.size);
                    ctx.fillRect(sx - 0.5, sy - 8 * ship.size, 1, 8 * ship.size);
                    ctx.beginPath();
                    ctx.moveTo(sx, sy - 7 * ship.size);
                    ctx.lineTo(sx + 5 * ship.size, sy - 3 * ship.size);
                    ctx.lineTo(sx, sy - 1 * ship.size);
                    ctx.fill();
                } else {
                    ctx.fillRect(sx - 6 * ship.size, sy, 12 * ship.size, 3 * ship.size);
                    ctx.fillRect(sx - 2 * ship.size, sy - 4 * ship.size, 4 * ship.size, 4 * ship.size);
                    ctx.fillRect(sx + 1 * ship.size, sy - 5 * ship.size, 2 * ship.size, 3 * ship.size);
                }

                ctx.fillStyle = isNight ? BRAND.auroraMint : BRAND.white;
                ctx.globalAlpha = 0.5 + Math.sin(time * 4 + ship.x * 10) * 0.5;
                ctx.beginPath();
                ctx.arc(sx + (ship.type === 'sail' ? 0 : 3 * ship.size), sy - (ship.type === 'sail' ? 4 : 5) * ship.size, 0.8, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            ctx.restore();

            // --- 4. LIGHTHOUSE ---
            const lhX = w * 0.85;
            const lhBaseY = horizonY + 15;
            const lhHeight = 70;
            const beamAngle = time * 0.6;

            ctx.fillStyle = isNight ? '#02020a' : '#050510';
            ctx.beginPath();
            ctx.moveTo(lhX - 80, lhBaseY + 30);
            ctx.quadraticCurveTo(lhX, lhBaseY - 10, lhX + 80, lhBaseY + 40);
            ctx.lineTo(lhX + 90, h);
            ctx.lineTo(lhX - 90, h);
            ctx.fill();

            const drawStoutLighthouse = () => {
                const towerWidthBase = 22;
                const towerWidthTop = 15;
                const segments = 5;
                const segmentH = lhHeight / segments;

                for (let i = 0; i < segments; i++) {
                    const yTop = lhBaseY - lhHeight + (i * segmentH);
                    const yBot = yTop + segmentH;
                    const wTop = towerWidthTop + (towerWidthBase - towerWidthTop) * (i / segments);
                    const wBot = towerWidthTop + (towerWidthBase - towerWidthTop) * ((i + 1) / segments);

                    ctx.fillStyle = i % 2 === 0 ? BRAND.solarPink : (isNight ? '#ddd' : BRAND.white);
                    ctx.beginPath();
                    ctx.moveTo(lhX - wTop, yTop); ctx.lineTo(lhX + wTop, yTop); ctx.lineTo(lhX + wBot, yBot); ctx.lineTo(lhX - wBot, yBot);
                    ctx.fill();

                    ctx.fillStyle = 'rgba(0,0,0,0.15)';
                    ctx.beginPath();
                    ctx.moveTo(lhX + wTop * 0.2, yTop); ctx.lineTo(lhX + wTop, yTop); ctx.lineTo(lhX + wBot, yBot); ctx.lineTo(lhX + wBot * 0.2, yBot);
                    ctx.fill();
                }

                ctx.fillStyle = BRAND.black;
                ctx.fillRect(lhX - 22, lhBaseY - lhHeight - 3, 44, 4);

                const lanternY = lhBaseY - lhHeight - 18;
                const lanternH = 15;
                const lanternW = 22;
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(lhX - (lanternW / 2 - 2), lanternY, lanternW - 4, lanternH);

                ctx.fillStyle = BRAND.black;
                for (let p = -2; p <= 2; p++) {
                    ctx.fillRect(lhX + (p * 5) - 1, lanternY, 2, lanternH);
                }

                ctx.beginPath();
                ctx.moveTo(lhX - 16, lanternY); ctx.lineTo(lhX, lanternY - 12); ctx.lineTo(lhX + 16, lanternY);
                ctx.fill();
                ctx.fillRect(lhX - 1, lanternY - 14, 2, 4);

                const bY = lanternY + lanternH / 2;
                const bG = ctx.createRadialGradient(lhX, bY, 0, lhX, bY, 35);
                bG.addColorStop(0, BRAND.white);
                bG.addColorStop(0.5, (isNight ? BRAND.auroraBlue : BRAND.white) + '44');
                bG.addColorStop(1, 'transparent');
                ctx.fillStyle = bG;
                ctx.beginPath(); ctx.arc(lhX, bY, 35, 0, Math.PI * 2); ctx.fill();
            };

            // --- 5. BEAM ---
            ctx.save();
            ctx.beginPath(); ctx.rect(0, 0, w, horizonY + (isNight ? 100 : 50)); ctx.clip();
            const beaconY = lhBaseY - lhHeight - 10;
            const drawBeam = (angle, opacity) => {
                ctx.save();
                ctx.translate(lhX, beaconY); ctx.rotate(angle);
                const g = ctx.createLinearGradient(0, -5, 600, 0);
                g.addColorStop(0, BRAND.white); g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.globalAlpha = opacity;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(600, -40); ctx.lineTo(600, 40); ctx.closePath();
                ctx.fill();
                ctx.restore();
            };
            drawBeam(beamAngle, THEME.beamAlpha);
            ctx.restore();

            // --- 6. OCEAN ---
            ctx.fillStyle = THEME.waterBase;
            ctx.fillRect(0, horizonY, w, h - horizonY);

            const layers = [
                { depth: 0, amp: 1, freq: 0.005, speed: 0.1, offset: 2 },
                { depth: 1, amp: 2, freq: 0.009, speed: 0.2, offset: 12 },
                { depth: 2, amp: 3, freq: 0.013, speed: 0.35, offset: 28 },
                { depth: 3, amp: 4, freq: 0.018, speed: 0.55, offset: 52 },
                { depth: 4, amp: 6, freq: 0.024, speed: 0.8, offset: 84 },
                { depth: 5, amp: 8, freq: 0.030, speed: 1.1, offset: 124 },
                { depth: 6, amp: 10, freq: 0.037, speed: 1.45, offset: 172 },
                { depth: 7, amp: 14, freq: 0.045, speed: 1.85, offset: 228 }
            ];

            layers.forEach((layer, lIdx) => {
                const tLayer = THEME.waterLayers[lIdx];
                const hScroll = time * layer.speed * 20;
                ctx.fillStyle = tLayer.color;
                ctx.globalAlpha = tLayer.alpha;
                ctx.beginPath(); ctx.moveTo(-10, h);

                const step = 15;
                for (let x = -10; x <= w + step; x += step) {
                    const drawX = Math.min(x, w);
                    const vP = time * 0.8;
                    const xP = drawX + hScroll;
                    const s1 = Math.sin(xP * layer.freq + vP);
                    const s2 = Math.sin(xP * layer.freq * 1.8 - vP * 0.4);
                    const s3 = Math.cos(xP * layer.freq * 0.5 + vP * 1.1);
                    let combined = (s1 * 0.7 + s2 * 0.2 + s3 * 0.1);
                    let y = horizonY + layer.offset + (combined * layer.amp);
                    ctx.lineTo(drawX, y);

                    // GLARE
                    const dS = Math.abs(drawX - sunX);
                    if (dS < 120) {
                        ctx.save();
                        ctx.globalAlpha = (1 - dS / 120) * (isNight ? 0.4 : 0.25) * tLayer.alpha;
                        ctx.fillStyle = isNight ? BRAND.auroraBlue : BRAND.white;
                        ctx.fillRect(drawX - 2, y - 1, 4, 1.5);
                        ctx.restore();
                    }
                }
                ctx.lineTo(w, h); ctx.lineTo(-10, h); ctx.closePath(); ctx.fill();

                if (isNight && lIdx > 5) {
                    ctx.globalAlpha = 0.2;
                    ctx.fillStyle = BRAND.auroraMint;
                    for (let j = 0; j < 4; j++) {
                        const sx = ((time * 0.2 + j * 0.25) % 1) * w;
                        const sy = horizonY + layer.offset + 2;
                        ctx.fillRect(sx, sy, 2, 1);
                    }
                }
            });

            drawStoutLighthouse();

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
    }, [variant, starSettings, THEME, distantShips, starField]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#020205' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default LighthouseOceanBanner;
