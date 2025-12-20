
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '../../core/constants/cityThemes';

// --- DIGITAL SERAPHIM (The "Insane" Creative Banner) ---
// Concept: A "Biblically Accurate Angel" made of pure data and cyberpunk energy.
// Elements:
// 1. The Core (The Eye of the Machine)
// 2. The Ophanim (Interlocking Gyroscopic Rings of Code)
// 3. The Wings (Six massive wings of light/data streaks)
// 4. The Eyes (Floating observant orbs everywhere)
// Vibe: Overwhelming, Divine, Glitch-Tech, Hyper-Detailed.

const SeraphimBanner = () => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = 3840;
        const h = 2160;
        canvas.width = w;
        canvas.height = h;

        const cx = w * 0.5;
        const cy = h * 0.45; // Slightly up to allow wings to drape

        // 1. VOID BG
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#020002');
        grad.addColorStop(1, '#0b0210');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 2. THE WINGS (6 Massive Energy Arcs)
        const drawWing = (angle, scale, color) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.scale(scale, scale);

            // Wing comprised of hundreds of lines
            for (let i = 0; i < 80; i++) {
                ctx.beginPath();
                const spread = (Math.random() - 0.5) * 200;
                const len = 600 + Math.random() * 800;

                ctx.moveTo(0, 0);

                // Bezier curve out
                ctx.bezierCurveTo(
                    200 + spread, 100,
                    400 + spread, 300,
                    50 + spread, len
                );

                ctx.strokeStyle = color;
                ctx.lineWidth = 1 + Math.random() * 2;
                ctx.globalAlpha = 0.1 + Math.random() * 0.3;
                ctx.globalCompositeOperation = 'screen';
                ctx.stroke();
            }

            // Wing "Eyes" (Orbs on the feathers)
            for (let i = 0; i < 5; i++) {
                const x = 100 + Math.random() * 400;
                const y = 200 + Math.random() * 600;

                const eyeColor = '#FFF';
                ctx.fillStyle = eyeColor;
                ctx.globalAlpha = 0.8;
                ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();

                // Glow
                ctx.shadowBlur = 20;
                ctx.shadowColor = color;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            ctx.restore();
        };

        // Draw 6 wings (Seraphim style) manual symmetry
        // Draw 6 wings (Seraphim style) - Perfect Symmetry
        // 0 = Down, 90 = Right, 180 = Up, 270 = Left? No, canvas 0 angle is Right.
        // Let's use explicit degrees for placement.
        const degToRad = (d) => d * Math.PI / 180;

        // Helper to draw a symmetric pair (Left Side + Right Side)
        // Assume angle is for Right side (0-180), then mirror it.
        const drawPair = (angleDeg, color, scale = 1.0) => {
            // Right Wing
            drawWing(degToRad(angleDeg), scale, color);
            // Left Wing (Mirror across vertical Y axis = 180 - angle, or -angle + 180)
            // Actually, simplest is just Math.PI - angle
            drawWing(Math.PI - degToRad(angleDeg), scale, color);
        };

        // Top Pair (Upward) - Angle ~290 (Right Up) / ~250 (Left Up) ?
        // 0 is Right. 270 is Up. 
        // Right Top = 300 deg. Left Top = 240 deg.
        drawWing(degToRad(300), 1.2, COLORS.solarPink); // Right Top
        drawWing(degToRad(240), 1.2, COLORS.solarPink); // Left Top

        // Middle Pair (Spreading Wide)
        // Right = 350 deg. Left = 190 deg.
        drawWing(degToRad(350), 1.3, COLORS.ionBlue);
        drawWing(degToRad(190), 1.3, COLORS.ionBlue);

        // Bottom Pair (Downward)
        // Right Bot = 50 deg. Left Bot = 130 deg.
        drawWing(degToRad(50), 1.1, COLORS.auroraMint);
        drawWing(degToRad(130), 1.1, COLORS.auroraMint);

        // 3. THE OPHANIM (Gyroscope Rings)
        const drawRing = (rad, axisRotate, color) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(axisRotate);
            ctx.scale(1, 0.3); // Flatten to circle

            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.lineWidth = 15;
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.6;
            ctx.globalCompositeOperation = 'screen';
            ctx.stroke();

            // Runes/Data on ring
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFF';
            ctx.globalAlpha = 0.9;
            ctx.stroke();

            // Eyes on the ring
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                const x = rad * Math.cos(a);
                const y = rad * Math.sin(a);
                ctx.beginPath();
                ctx.fillStyle = '#FFF';
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        };

        drawRing(400, 0, COLORS.stellarOrange);
        drawRing(350, Math.PI / 3, COLORS.ionBlue);
        drawRing(300, -Math.PI / 3, COLORS.solarPink);
        drawRing(500, Math.PI / 2, COLORS.deepOrbitPurple); // Vertical big ring

        // 4. THE CORE (Eye of the Machine)
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
        core.addColorStop(0, '#FFFFFF');
        core.addColorStop(0.2, COLORS.auroraMint);
        core.addColorStop(0.6, COLORS.deepOrbitPurple);
        core.addColorStop(1, 'transparent');

        ctx.fillStyle = core;
        ctx.globalCompositeOperation = 'source-over'; // Opaque center
        ctx.beginPath();
        ctx.arc(cx, cy, 120, 0, Math.PI * 2);
        ctx.fill();

        // Pupil slit - REMOVED
        // ctx.fillStyle = '#000';
        // ctx.beginPath();
        // ctx.ellipse(cx, cy, 20, 80, 0, 0, Math.PI * 2);
        // ctx.fill();

        // 5. CHROMATIC ABERRATION GLITCH
        for (let i = 0; i < 50; i++) {
            const y = Math.random() * h;
            const hLine = Math.random() * 5;
            ctx.fillStyle = Math.random() > 0.5 ? COLORS.ionBlue : COLORS.stellarOrange;
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(0, y, w, hLine);
        }

        // 6. VIGNETTE
        ctx.globalCompositeOperation = 'multiply';
        const vig = ctx.createLinearGradient(0, 0, 0, h);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(0.6, 'transparent');
        vig.addColorStop(1, '#000');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        setBgImage(canvas.toDataURL('image/webp', 0.95));

    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#020002',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default SeraphimBanner;
