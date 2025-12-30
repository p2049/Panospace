import React, { useEffect, useRef } from 'react';
import { BRAND_COLORS } from '@/core/constants/colorPacks';

/**
 * MEMPHIS PATTERN BANNER
 * 
 * Aesthetic: 80s/90s "Memphis Group" Pattern.
 * - High density geometric confetti.
 * - Thick distinct strokes.
 * - Black background (Pop style).
 * - Shapes: Zigzags, Squiggles, Triangles, Donuts, Pills.
 * - Grid-based distribution with jitter for "Organized Chaos".
 */

const MemphisPatternBanner = ({ seed = 'panospace' }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // MurmurHash3
    const hash = (str) => {
        let h = 0xdeadbeef;
        for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
        return () => {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h >>> 0) / 4294967296;
        };
    };

    // -------------------------------------------------------------
    // SHAPE RENDERERS (Maximal Fit)
    // -------------------------------------------------------------

    // Config: No padding inside boxes to ensure they "fit together" perfectly

    // Helper: Stroke or Fill
    const drawPath = (ctx, color, filled) => {
        if (filled) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.stroke();
        }
    };

    const drawBlock = (ctx, box, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(box.x, box.y, box.w, box.h);
    };

    const drawZigZag = (ctx, box, color, rng) => {
        const { x, y, w, h } = box;

        // If it's a "Fill" type, we fill the background with pattern
        // rather than just drawing a line in void
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();

        ctx.beginPath();
        const step = 10;
        const jaggedness = 5;

        // Fill entire box with dense zigzags
        for (let fy = y - 10; fy < y + h + 10; fy += 15) {
            ctx.moveTo(x, fy);
            for (let fx = 0; fx <= w; fx += step) {
                ctx.lineTo(x + fx, fy + (fx % (step * 2) === 0 ? -jaggedness : jaggedness));
            }
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    };

    const drawSquiggle = (ctx, box, color, rng) => {
        const { x, y, w, h } = box;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();

        ctx.beginPath();
        const freq = 0.5;
        const amp = 4;
        const spacing = 12;

        // Vertical or Horizontal fill based on aspect
        if (w > h) {
            for (let fy = y + 5; fy < y + h; fy += spacing) {
                ctx.moveTo(x, fy);
                for (let fx = 0; fx <= w; fx += 5) ctx.lineTo(x + fx, fy + Math.sin(fx * freq) * amp);
            }
        } else {
            for (let fx = x + 5; fx < x + w; fx += spacing) {
                ctx.moveTo(fx, y);
                for (let fy = 0; fy <= h; fy += 5) ctx.lineTo(fx + Math.sin(fy * freq) * amp, y + fy);
            }
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    };

    const drawTriangle = (ctx, box, color, rng) => {
        const { x, y, w, h } = box;

        // Fit perfectly to corners
        // 4 types: TL, TR, BL, BR fill
        const type = Math.floor(rng() * 4);

        ctx.beginPath();
        if (type === 0) { // Bottom Left Triangle
            ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h);
        } else if (type === 1) { // Bottom Right
            ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h);
        } else if (type === 2) { // Top Right
            ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h);
        } else { // Top Left
            ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x, y + h);
        }
        ctx.closePath();

        drawPath(ctx, color, true); // Always fill triangles for weight
    };

    const drawQuarterCircle = (ctx, box, color, rng) => {
        const { x, y, w, h } = box;
        const r = Math.min(w, h);

        ctx.beginPath();
        const corner = Math.floor(rng() * 4);
        let startA = 0, cx_ = x, cy_ = y;

        // 0: TopLeft Curve (Center is BottomRight) ? No
        // Standard "Corner Curve" means the arc is IN the corner.
        // Center is the OPPOSITE corner.
        // Top-Left Curve: Center at Bottom-Right (x+w, y+h). Arc from PI to 1.5PI

        if (corner === 0) { cx_ = x + w; cy_ = y + h; startA = Math.PI; }
        else if (corner === 1) { cx_ = x; cy_ = y + h; startA = Math.PI * 1.5; }
        else if (corner === 2) { cx_ = x; cy_ = y; startA = 0; }
        else { cx_ = x + w; cy_ = y; startA = Math.PI / 2; }

        ctx.moveTo(cx_, cy_);
        ctx.arc(cx_, cy_, r, startA, startA + Math.PI / 2);
        ctx.closePath();

        // Invert the concept? If we draw arc from center, we get a fan.
        // Let's stick to "Fan" shape (Sector) from corner.

        drawPath(ctx, color, true);
    };

    const drawStripes = (ctx, box, color) => {
        const { x, y, w, h } = box;
        // Background color?
        // drawBlock(ctx, box, color); // Draw BG? No, stick to black bg.

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();

        ctx.beginPath();
        const step = 8;
        // Thick stripes
        for (let i = -h; i < w + h; i += step) {
            ctx.moveTo(x + i, y);
            ctx.lineTo(x + i - h, y + h);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
    };

    const drawGridDots = (ctx, box, color) => {
        const { x, y, w, h } = box;
        ctx.fillStyle = color;
        const gap = 12;
        const r = 3;
        for (let fy = y + gap / 2; fy < y + h; fy += gap) {
            for (let fx = x + gap / 2; fx < x + w; fx += gap) {
                ctx.beginPath();
                ctx.arc(fx, fy, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };

    const SHAPES = [drawBlock, drawZigZag, drawSquiggle, drawTriangle, drawQuarterCircle, drawStripes, drawGridDots];

    // -------------------------------------------------------------
    // LAYOUT ENGINE (Recursive Subdivision)
    // -------------------------------------------------------------
    const generateLayout = (x, y, w, h, depth, rng) => {
        // Stop condition
        if ((depth <= 0) || (w < 40 && h < 40) || (depth < 6 && w < 60 && h < 60 && rng() > 0.5)) {
            return [{ x, y, w, h }];
        }

        // Favor roughly equal splits for nicer grid feel
        const isVert = (w > h * 1.1) ? true : (h > w * 1.1 ? false : rng() > 0.5);
        const split = 0.5; // Strict Halving for cleaner "Fitted" look? 
        // Or slight variation:
        // const split = 0.4 + rng() * 0.2;

        const gap = 2; // TIGHT GAP

        if (isVert) {
            const w1 = Math.floor(w * split);
            return [
                ...generateLayout(x, y, w1 - gap / 2, h, depth - 1, rng),
                ...generateLayout(x + w1 + gap / 2, y, w - w1 - gap / 2, h, depth - 1, rng)
            ];
        } else {
            const h1 = Math.floor(h * split);
            return [
                ...generateLayout(x, y, w, h1 - gap / 2, depth - 1, rng),
                ...generateLayout(x, y + h1 + gap / 2, w, h - h1 - gap / 2, depth - 1, rng)
            ];
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr; canvas.height = height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        const rng = hash(seed);

        // CONFIG
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Colors
        const colors = Object.values(BRAND_COLORS).filter(c => c !== '#000000' && c !== '#111111');
        colors.push('#ffffff');

        // Generate Boxes - Tighter fit, REMOVE TOP ROW (Start lower)
        const topMargin = height * 0.33; // Leave top 1/3 empty
        const boxes = generateLayout(2, topMargin, width - 4, height - topMargin - 4, 8, rng);

        boxes.forEach(box => {
            if (rng() > 0.95) return;

            const color = colors[Math.floor(rng() * colors.length)];
            const shapeFn = SHAPES[Math.floor(rng() * SHAPES.length)];

            shapeFn(ctx, box, color, rng);
        });

    }, [seed]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#000', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>
    );
};

export default MemphisPatternBanner;
