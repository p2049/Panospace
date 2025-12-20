
import React, { useRef, useEffect, useMemo } from 'react';

const BRAND = {
    deepOrbit: '#5A3FFF',
    ionBlue: '#1B82FF',
    solarPink: '#FF5C8A',
    auroraMint: '#7FFFD4',
    white: '#FFFFFF',
    black: '#000000'
};

const generateCityLights = (lightColors = ['#FFB366', '#FFEECC', '#FFF']) => {
    const lights = [];

    // 1. SKEWED STREET GRIDS
    const sectors = 8;
    for (let s = 0; s < sectors; s++) {
        const gx = Math.random() * 4;
        const gz = 0.5 + Math.random() * 8;
        const angle = Math.random() * Math.PI;
        const rows = 12;
        const cols = 12;
        const spacing = 0.08;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const lx = (r * spacing * Math.cos(angle)) - (c * spacing * Math.sin(angle));
                const lz = (r * spacing * Math.sin(angle)) + (c * spacing * Math.cos(angle));

                if (Math.random() > 0.1) {
                    lights.push({
                        type: 'street',
                        x: gx + lx,
                        z: gz + lz,
                        baseSize: 0.6 + Math.random() * 0.4,
                        color: lightColors[Math.floor(Math.random() * lightColors.length)],
                        opacity: 0.3 + Math.random() * 0.4,
                    });
                }
            }
        }
    }

    // 2. DENSE DOWNTOWN CORES
    const coreCount = 12;
    for (let i = 0; i < coreCount; i++) {
        const cx = Math.random() * 4;
        const cz = 0.5 + Math.random() * 6;
        for (let j = 0; j < 25; j++) {
            lights.push({
                type: 'rect',
                x: cx + (Math.random() - 0.5) * 0.4,
                z: cz + (Math.random() - 0.5) * 0.4,
                w: 2 + Math.random() * 5,
                h: 2 + Math.random() * 3,
                baseSize: 1.2,
                color: lightColors[lightColors.length - 1], // Usually white or brightest
                opacity: 0.85,
                twinkle: Math.random() > 0.7
            });
        }
    }

    // 3. BACKGROUND CARPET
    for (let i = 0; i < 700; i++) {
        lights.push({
            type: 'dot',
            x: Math.random() * 6 - 2,
            z: Math.random() * 15,
            baseSize: 0.4 + Math.random() * 0.6,
            color: lightColors[Math.floor(Math.random() * lightColors.length)],
            opacity: 0.15 + Math.random() * 0.3,
            twinkle: Math.random() > 0.9
        });
    }

    return lights;
};

const PALETTES = {
    plane_night: {
        sky: ['#000008', '#050515'],
        ground: '#010103',
        haze: 'rgba(10,20,50,0.5)',
        bloom: BRAND.ionBlue,
        starAlpha: 0.2,
        lightColors: ['#FFB366', '#FFEECC', '#FFF']
    },
    plane_sunset: {
        sky: ['#1a051a', '#4a1a4a'],
        ground: '#100510',
        haze: 'rgba(70,20,100,0.3)',
        bloom: BRAND.solarPink,
        starAlpha: 0.1,
        lightColors: ['#FF914D', '#FFB366', '#FFD280']
    },
    plane_storm: {
        sky: ['#050010', '#1a0033'],
        ground: '#050005',
        haze: 'rgba(90,63,255,0.2)',
        bloom: BRAND.purple,
        starAlpha: 0.3,
        lightColors: ['#A7B6FF', '#1B82FF', '#7FFFD4']
    }
};

const PlaneWindowSub = ({ palette, variant }) => {
    const canvasRef = useRef(null);
    const lights = useMemo(() => generateCityLights(palette.lightColors), [palette]);
    const stars = useMemo(() => Array.from({ length: 50 }, () => ({
        x: Math.random(),
        y: Math.random() * 0.4,
        size: Math.random() * 1.5
    })), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        const startTime = Date.now();

        const render = () => {
            const w = canvas.width;
            const h = canvas.height;
            const time = (Date.now() - startTime) * 0.001;
            const horizon = h * 0.45;

            // 1. SKY
            const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
            skyGrad.addColorStop(0, palette.sky[0]);
            skyGrad.addColorStop(1, palette.sky[1]);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, w, horizon);

            ctx.fillStyle = '#FFF';
            stars.forEach(s => {
                ctx.globalAlpha = palette.starAlpha + Math.sin(time + s.x * 5) * (palette.starAlpha * 0.5);
                ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2); ctx.fill();
            });

            // 2. GROUND BASE
            ctx.fillStyle = palette.ground;
            ctx.fillRect(0, horizon, w, h - horizon);

            // 3. PROJECTED CITYSCAPE (With pronounced parallax)
            const flightSpeed = 0.6; // Base motion speed
            lights.forEach(light => {
                // Perspective: smaller Z is closer
                // We use perspective to scale both size AND horizontal speed
                const perspective = 1 / (light.z + 0.5);

                // Horizontal Move logic: displace proportional to perspective
                // This makes closer objects (larger perspective) move FASTER
                let xNorm = (light.x - time * flightSpeed * perspective) % 5;
                if (xNorm < 0) xNorm += 5;
                const pxBase = (xNorm - 1.5) * w;

                // py mapping: closer objects (low z) are at bottom (y ~ h)
                const py = horizon + (h - horizon) * perspective;
                const px = w / 2 + (pxBase - w / 2) * perspective;

                const finalSize = light.baseSize * perspective * 4;
                if (finalSize < 0.05 || py < horizon || py > h + 50) return;

                let op = light.opacity * perspective * 3;
                if (light.twinkle) op *= (0.7 + Math.sin(time * 6 + light.x) * 0.3);

                ctx.globalAlpha = Math.min(op, 1);
                ctx.fillStyle = light.color;

                if (light.type === 'rect') {
                    const rw = light.w * perspective * 3.5;
                    const rh = light.h * perspective * 3.5;
                    ctx.fillRect(px - rw / 2, py, rw, rh);
                } else {
                    ctx.beginPath(); ctx.arc(px, py, finalSize, 0, Math.PI * 2); ctx.fill();
                }
            });

            // 4. HAZE & VIGNETTE
            const haze = ctx.createLinearGradient(0, horizon - 10, 0, horizon + 40);
            haze.addColorStop(0, '#000');
            haze.addColorStop(0.2, palette.haze);
            haze.addColorStop(1, 'transparent');
            ctx.fillStyle = haze;
            ctx.fillRect(0, horizon - 10, w, 50);

            ctx.globalAlpha = 1.0;

            // 5. WINDOW FRAME & GLASS
            const path = new Path2D();
            const pad = 8;
            const r = 40;
            path.moveTo(pad + r, pad);
            path.lineTo(w - pad - r, pad);
            path.arcTo(w - pad, pad, w - pad, pad + r, r);
            path.lineTo(w - pad, h - pad - r);
            path.arcTo(w - pad, h - pad, w - pad - r, h - pad, r);
            path.lineTo(pad + r, h - pad);
            path.arcTo(pad, h - pad, pad, h - pad - r, r);
            path.lineTo(pad, pad + r);
            path.arcTo(pad, pad, pad + r, pad, r);

            ctx.globalCompositeOperation = 'destination-in';
            ctx.fill(path);
            ctx.globalCompositeOperation = 'source-over';

            const frameGrad = ctx.createLinearGradient(0, 0, w, h);
            frameGrad.addColorStop(0, '#151515');
            frameGrad.addColorStop(0.5, '#0a0a0a');
            frameGrad.addColorStop(1, '#111');
            ctx.strokeStyle = frameGrad;
            ctx.lineWidth = 10;
            ctx.stroke(path);

            const glassGrad = ctx.createLinearGradient(0, 0, w, h * 0.4);
            glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
            glassGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = glassGrad;
            ctx.fill(path);

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [palette, variant]);

    return (
        <canvas
            ref={canvasRef} width={120} height={160}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
    );
};

const PlaneWindowBanner = ({ variant = 'plane_night' }) => {
    const p = PALETTES[variant] || PALETTES.plane_night;

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#050505',
            backgroundImage: `
                radial-gradient(circle at 50% 50%, ${p.bloom}11, #000 85%),
                linear-gradient(to bottom, #101010 0%, #050505 20%, #050505 80%, #101010 100%)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12%',
            overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: p.bloom, opacity: 0.1, boxShadow: `0 0 15px ${p.bloom}44`
            }} />

            <div style={{ display: 'flex', gap: '20px', height: '85%', width: '40%', justifyContent: 'flex-start', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '46%', height: '100%', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.9))' }}>
                    <PlaneWindowSub palette={p} variant={variant} />
                </div>
                <div style={{ position: 'relative', width: '46%', height: '100%', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.9))' }}>
                    <PlaneWindowSub palette={p} variant={variant} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', height: '85%', width: '40%', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '46%', height: '100%', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.9))' }}>
                    <PlaneWindowSub palette={p} variant={variant} />
                </div>
                <div style={{ position: 'relative', width: '46%', height: '100%', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.9))' }}>
                    <PlaneWindowSub palette={p} variant={variant} />
                </div>
            </div>

            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '140px', height: '100px',
                border: '1px solid #111',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.01)',
                opacity: 0.5
            }} />
        </div>
    );
};

export default PlaneWindowBanner;
