
import React, { useRef, useEffect, useState } from 'react';
import { BRAND_COLORS as COLORS } from '@/core/constants/cityThemes';

// --- STATIC SYSTEM ENVIRONMENTS (MAX FIDELITY) ---
// High-detail, texture-rich, atmospheric renders. 
// No Animation. Pure Composition.

const RENDER_CACHE = new Map();

// --- NOISE GENERATOR ---
// High-performance static noise for texture
function applyNoise(ctx, width, height, balpha = 0.05) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const buffer32 = new Uint32Array(imageData.data.buffer);
    const len = buffer32.length;

    // We'll just draw noise on top separately to avoid slow per-pixel math if possible, 
    // but for "Max Effort" texture, per-pixel is best. 
    // Optimization: Draw noise to erratic canvas once and pattern it? 
    // Let's stick to simple overlay method for safety:

    // Actually, let's use a procedural approach for Grain:
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < len / 10; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillStyle = Math.random() > 0.5 ? '#FFF' : '#000';
        ctx.globalAlpha = Math.random() * balpha;
        ctx.fillRect(x, y, 2, 2);
    }
    ctx.restore();
}

// --- RENDERER: ORBITAL RESONANCE (Cosmic) ---
// Concept: A high-fidelity "Eclipse" event. Volumetric light wrapping around a dark body.
function renderOrbital(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 1920;
    const h = canvas.height = 1080;

    // 1. DEEP SPACE BASE
    const space = ctx.createRadialGradient(w / 2, h * 2, 0, w / 2, h * 2, w * 2);
    space.addColorStop(0, '#0a0a0a');
    space.addColorStop(1, '#000000');
    ctx.fillStyle = space;
    ctx.fillRect(0, 0, w, h);

    // 2. THE RIM LIGHT (The Event)
    // Massive, soft glow rising from bottom
    const cx = w * 0.5;
    const cy = h * 1.3;
    const r = w * 0.8;

    // Layer 1: The Corona (Deep Purple)
    const corona = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.2);
    corona.addColorStop(0, COLORS.black);
    corona.addColorStop(0.5, COLORS.deepOrbitPurple);
    corona.addColorStop(1, 'transparent');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = corona;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2); ctx.fill();

    // Layer 2: The Edge (Ion Blue/White Hot)
    const edge = ctx.createRadialGradient(cx, cy, r * 0.98, cx, cy, r * 1.05);
    edge.addColorStop(0, '#000');
    edge.addColorStop(0.5, COLORS.ionBlue);
    edge.addColorStop(0.8, COLORS.iceWhite);
    edge.addColorStop(1, 'transparent');
    ctx.globalCompositeOperation = 'add';
    ctx.fillStyle = edge;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2); ctx.fill();

    // 3. THE ACCRETION DISK (Debris Field)
    // Thousands of fine lines forming a ring
    ctx.globalCompositeOperation = 'screen';
    ctx.lineWidth = 1;
    for (let i = 0; i < 2000; i++) {
        const angle = Math.random() * Math.PI; // Top half arc
        const dist = r * (0.9 + Math.random() * 0.6);
        const x = cx + Math.cos(angle - Math.PI) * dist * 1.5; // Stretch horizontally
        const y = cy + Math.sin(angle - Math.PI) * (dist * 0.3); // Flatten vertically perspective

        // Only draw if on screen
        if (y < h && y > 0) {
            ctx.strokeStyle = Math.random() > 0.8 ? COLORS.iceWhite : COLORS.deepOrbitPurple;
            ctx.globalAlpha = Math.random() * 0.3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 5);
            ctx.stroke();
        }
    }

    // 4. ATMOSPHERIC HAZE
    applyNoise(ctx, w, h, 0.08);

    return canvas.toDataURL('image/webp', 0.95);
}

// --- RENDERER: MEMORY FIELD (Abstract) ---
// Concept: Infinite Recursion / The "Machine City" from above. 
// A dense, structured texture of data blocks.
function renderMemory(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 1920;
    const h = canvas.height = 1080;

    // 1. MOTHERBOARD BLACK
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    // 2. RECURSIVE SUBDIVISION (The Data)
    ctx.strokeStyle = COLORS.ionBlue;
    ctx.lineWidth = 1;

    const drawBlock = (x, y, sw, sh, depth) => {
        if (depth > 4 || sw < 10 || sh < 10) {
            // Render Leaf Node (A data block)
            const luminance = Math.random();
            if (luminance > 0.90) { // Rare bright nodes
                ctx.fillStyle = COLORS.iceWhite;
                ctx.shadowBlur = 10;
                ctx.shadowColor = COLORS.iceWhite;
                ctx.globalAlpha = 0.8;
                ctx.fillRect(x, y, sw - 1, sh - 1);
                ctx.shadowBlur = 0;
            } else if (luminance > 0.7) { // Active nodes
                ctx.fillStyle = COLORS.ionBlue;
                ctx.globalAlpha = 0.3;
                ctx.fillRect(x, y, sw - 1, sh - 1);
            } else { // Dormant nodes (texture)
                ctx.strokeStyle = '#FFFFFF11';
                ctx.strokeRect(x, y, sw, sh);
            }
            return;
        }

        // Split
        const splitX = Math.random() > 0.5;
        if (splitX) {
            const split = sw * (0.3 + Math.random() * 0.4);
            drawBlock(x, y, split, sh, depth + 1);
            drawBlock(x + split, y, sw - split, sh, depth + 1);
        } else {
            const split = sh * (0.3 + Math.random() * 0.4);
            drawBlock(x, y, sw, split, depth + 1);
            drawBlock(x, y + split, sw, sh - split, depth + 1);
        }
    };

    // Draw grid of recursive blocks
    // Tilted perspective? No, purely flat orthographic map is more "system"
    // Let's make it look like dense RAM

    // Layer 1: Background Density
    ctx.globalCompositeOperation = 'screen';
    drawBlock(0, 0, w, h, 0);

    // Layer 2: The "Current" (Flow of data)
    // A subtle gradient wash
    const flow = ctx.createLinearGradient(0, 0, w, h);
    flow.addColorStop(0, COLORS.deepOrbitPurple + '00');
    flow.addColorStop(0.5, COLORS.ionBlue + '33');
    flow.addColorStop(1, COLORS.deepOrbitPurple + '00');
    ctx.fillStyle = flow;
    ctx.fillRect(0, 0, w, h);

    // 3. VIGNETTE & GRAIN
    applyNoise(ctx, w, h, 0.05);

    const vig = ctx.createRadialGradient(w / 2, h / 2, h / 2, w / 2, h / 2, w);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, '#000');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    return canvas.toDataURL('image/webp', 0.95);
}

// --- RENDERER: IDLE STATE (Liminal) ---
// Concept: Brutalist Architecture. A concrete room waiting for an event.
// High texture, stark lighting.
function renderIdle(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 1920;
    const h = canvas.height = 1080;

    // 1. CONCRETE DARK
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);

    // 2. LIGHT SHAFT (The "Pause")
    // A single, harsh rectangular light source hitting the floor/wall
    ctx.save();
    ctx.translate(w * 0.6, h * 0.0);
    ctx.rotate(Math.PI / 6);

    const beam = ctx.createLinearGradient(0, 0, 400, 1000);
    beam.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    beam.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = beam;
    ctx.fillRect(-200, 0, 600, h * 1.5);
    ctx.restore();

    // 3. GEOMETRY (The Walls)
    // Simple, massive shapes obscured by shadow
    const wallGrad = ctx.createLinearGradient(0, 0, w, 0);
    wallGrad.addColorStop(0, '#000');
    wallGrad.addColorStop(0.3, '#1a1a1a');
    wallGrad.addColorStop(1, '#050505');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, h * 0.6, w, h * 0.4); // Floor?

    // 4. HEAVY GRAIN (The Atmosphere)
    // Liminal spaces are defined by their "air"
    applyNoise(ctx, w, h, 0.15); // Heavy grain

    // 5. THE PROMPT (Subtle Blinking Line - Static capture of it on)
    ctx.fillStyle = COLORS.auroraMint;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.auroraMint;
    ctx.fillRect(w * 0.1, h * 0.8, 40, 6);

    return canvas.toDataURL('image/webp', 0.95);
}


const StaticSystemBanners = ({ variant }) => {
    const canvasRef = useRef(null);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const cvs = canvasRef.current;
        if (!cvs) return;

        let url = '';
        if (variant === 'system_orbital') url = renderOrbital(cvs);
        if (variant === 'system_memory') url = renderMemory(cvs);
        if (variant === 'liminal_idle') url = renderIdle(cvs);

        setBgImage(url);
    }, [variant]);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            overflow: 'hidden'
        }}>
            {/* 100% STATIC, HIGH-FIDELITY IMAGE */}
            {bgImage && (
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }} />
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default StaticSystemBanners;
