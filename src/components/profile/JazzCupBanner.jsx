import React, { useEffect, useRef } from 'react';
import { BRAND_COLORS } from '@/core/constants/colorPacks';

/**
 * JAZZ CUP BANNER - V3 (NEO-MEMPHIS ORGANIC)
 * 
 * Aesthetic Goals:
 * - "Organic Geometry": Fluid blobs mixed with sharp geometric accents.
 * - Balanced Composition: Distributed forms, avoiding clutter.
 * - Natural/Hand-drawn feel: Imperfect curves, slight wobbly lines.
 * - Brand Harmonic: Strict adherence to color palette with opacity layering.
 */

const JazzCupBanner = ({ seed = 'panospace' }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // ---------------------------------------------------------
    // UTILS
    // ---------------------------------------------------------

    // Consistent RNG
    const hash = (str) => {
        let h = 0xdeadbeef;
        for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
        return () => {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h >>> 0) / 4294967296;
        };
    };

    // Draw a smooth closed blob through points
    const drawBlob = (ctx, cx, cy, radius, distortion, color, rng) => {
        const points = [];
        const numPoints = 8;
        const angleStep = (Math.PI * 2) / numPoints;

        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep;
            const r = radius + (rng() - 0.5) * distortion;
            points.push({
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r
            });
        }

        ctx.beginPath();
        // Catmull-Rom or Quadratic interpolation for "Liquid" feel
        // Simple approach: Midpoints quadratic
        // Move to average of last and first
        const p0 = points[0];
        const pLast = points[numPoints - 1];
        const startX = (p0.x + pLast.x) / 2;
        const startY = (p0.y + pLast.y) / 2;

        ctx.moveTo(startX, startY);
        for (let i = 0; i < numPoints; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % numPoints];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
        }

        ctx.fillStyle = color;
        ctx.fill();
    };

    // Draw a "Wiggle" stroke
    const drawSquiggle = (ctx, x1, y1, x2, y2, color, thickness, frequency, amplitude) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);

        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1);

        const steps = dist / 5; // 5px segments
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const currentDist = t * dist;
            const perp = Math.sin(t * Math.PI * frequency) * amplitude;

            const px = x1 + Math.cos(angle) * currentDist - Math.sin(angle) * perp;
            const py = y1 + Math.sin(angle) * currentDist + Math.cos(angle) * perp;

            ctx.lineTo(px, py);
        }

        ctx.lineCap = 'round';
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    // Draw Geometric accent (Triangle, Circle, Cross)
    const drawGeo = (ctx, x, y, size, type, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        if (type === 'circle') {
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'triangle') {
            ctx.moveTo(x, y - size / 2);
            ctx.lineTo(x + size / 2, y + size / 2);
            ctx.lineTo(x - size / 2, y + size / 2);
            ctx.fill();
        } else if (type === 'donut') {
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = size / 4;
            ctx.stroke();
        }
    };

    // ---------------------------------------------------------
    // MAIN GENERATOR
    // ---------------------------------------------------------
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const rng = hash(seed);

        // 1. COLORS
        // Filter Brand colors for a harmonic set
        const colors = Object.values(BRAND_COLORS); // All options
        const bgChoice = rng();
        const baseBg = bgChoice > 0.8 ? '#111' : (bgChoice > 0.6 ? BRAND_COLORS.teal : '#fff');

        // Define palette based on BG contrast
        let palette = colors.filter(c => c !== baseBg);
        if (baseBg !== '#fff' && baseBg !== '#111') {
            // If colored BG, ensure we have white/black for contrast
            palette.push('#fff');
        }

        const pickCol = () => palette[Math.floor(rng() * palette.length)];

        // BG
        ctx.fillStyle = baseBg;
        ctx.fillRect(0, 0, width, height);

        // 2. ORGANIC LAYERS (Large Blobs)
        // We draw 3-5 large floating "Liquid" shapes
        const numBlobs = 3 + Math.floor(rng() * 3);
        ctx.save();
        ctx.globalCompositeOperation = 'source-over'; // Standard

        for (let i = 0; i < numBlobs; i++) {
            const x = rng() * width;
            const y = rng() * height;
            const r = 50 + rng() * 150;
            const col = pickCol();

            // Transparency for overlapping harmony
            ctx.globalAlpha = 0.8;
            drawBlob(ctx, x, y, r, r * 0.5, col, rng);
            ctx.globalAlpha = 1.0;
        }
        ctx.restore();

        // 3. GEOMETRIC ACCENTS (Small details)
        const numGeos = 10 + Math.floor(rng() * 10);
        for (let i = 0; i < numGeos; i++) {
            const x = rng() * width;
            const y = rng() * height;
            const size = 10 + rng() * 20;
            const type = rng() > 0.6 ? 'circle' : (rng() > 0.3 ? 'triangle' : 'donut');
            drawGeo(ctx, x, y, size, type, pickCol());
        }

        // 4. SQUIGGLES (The unifying energy)
        // Long strokes connecting areas
        const numSquiggles = 2 + Math.floor(rng() * 3);
        for (let i = 0; i < numSquiggles; i++) {
            const x1 = rng() * width;
            const y1 = rng() * height;
            const x2 = x1 + (rng() - 0.5) * 300;
            const y2 = y1 + (rng() - 0.5) * 300;
            const w = 4 + rng() * 6;
            drawSquiggle(ctx, x1, y1, x2, y2, pickCol(), w, 4 + rng() * 4, 10 + rng() * 10);
        }

        // 5. TEXTURE (Screen print grain)
        const imageData = ctx.getImageData(0, 0, width * dpr, height * dpr);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 20;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }
        ctx.putImageData(imageData, 0, 0);

    }, [seed]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#fff', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>
    );
};

export default JazzCupBanner;
