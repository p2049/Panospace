import React, { useEffect, useRef, useMemo } from 'react';
import { fadeColor } from '@/core/utils/colorUtils';
import { BRAND_COLORS } from '@/core/constants/colorPacks';

/**
 * DIGITAL FOREST BANNER (V6 - Absolute World Engine)
 * 
 * A 100% seed-driven landscape generator:
 * - Deterministic Themes: Completely ignores user color input. Picks a World Theme (Sunset, Digital, Void) per seed.
 * - Dynamic Ground: Ground is usually deep black (~80%), but can occasionally be a tinted digital floor (~20%).
 * - Biome Rarity: From dense recursive woods to rare flower valleys (no trees).
 * - Ground Flowers: Strictly ground-only, rarity-controlled, non-glowing and small.
 * - Layered Depth: Atmospheric haze and tapered branching for a professional forest look.
 */

const DigitalForestBanner = ({
    seed = 'panospace'
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Seeded Random Number Generator
    const seededRandom = (s) => {
        let h = 0xdeadbeef;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
        return () => {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h >>> 0) / 4294967296;
        };
    };

    /**
     * BOTANICAL DRAWING HELPERS
     */
    const drawLeaf = (ctx, x, y, size, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
    };

    const drawFlower = (ctx, x, y, size, rng) => {
        const flowerColor = BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)];
        ctx.fillStyle = flowerColor;
        const petals = 5;
        const angleStep = (Math.PI * 2) / petals;
        for (let i = 0; i < petals; i++) {
            const angle = i * angleStep;
            ctx.beginPath();
            ctx.ellipse(x + Math.cos(angle) * size, y + Math.sin(angle) * size, size, size * 0.5, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
    };

    const drawTree = (ctx, startX, startY, height, depth, baseColor, rng, dist) => {
        ctx.save();
        ctx.translate(startX, startY);
        ctx.lineCap = 'round';

        const branch = (len, d, width) => {
            if (d <= 0) {
                const leafCount = 3 + Math.floor(rng() * 4);
                for (let i = 0; i < leafCount; i++) {
                    drawLeaf(ctx, (rng() - 0.5) * 10, -len + (rng() - 0.5) * 10, 1.2 + rng() * 1.5, baseColor);
                }
                return;
            }
            ctx.lineWidth = width;
            ctx.strokeStyle = baseColor;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len); ctx.stroke();
            ctx.translate(0, -len);
            const num = (rng() > 0.45) ? 2 : 3;
            for (let i = 0; i < num; i++) {
                ctx.save();
                ctx.rotate((rng() - 0.5) * 70 * Math.PI / 180);
                branch(len * (0.65 + rng() * 0.2), d - 1, width * 0.7);
                ctx.restore();
            }
        };

        const initialWidth = (1.5 + dist * 5) * (height / 80);
        branch(height, depth, initialWidth);
        ctx.restore();
    };

    const drawBush = (ctx, x, y, size, color, rng, dist) => {
        ctx.save();
        ctx.translate(x, y);
        const stems = 5 + Math.floor(rng() * 5);
        for (let i = 0; i < stems; i++) {
            ctx.save();
            ctx.rotate((rng() - 0.5) * 140 * Math.PI / 180);
            const len = size * (0.4 + rng() * 0.6);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1 + dist;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len); ctx.stroke();
            const leaves = 3 + Math.floor(rng() * 3);
            for (let j = 0; j < leaves; j++) drawLeaf(ctx, (rng() - 0.5) * 4, -len * (j / leaves), 1.2 + dist, color);
            ctx.restore();
        }
        ctx.restore();
    };

    /**
     * MAIN WORLD GENERATOR
     */
    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr; canvas.height = height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const rng = seededRandom(seed);

        // --- SEED-DRIVEN THEME ENGINE ---
        const primaryColor = BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)];
        const secondaryColor = BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)];

        const treeRoll = rng();
        const flowerRoll = rng();
        const plantRoll = rng();
        const skyRoll = rng();
        const groundRoll = rng();

        // 5% chance of no trees (Flower Valley / Meadows)
        const treeCount = treeRoll < 0.05 ? 0 : Math.floor(25 + treeRoll * 50);
        // Flowers are rare/contextual
        const flowerChance = flowerRoll < 0.25 ? 0 : (flowerRoll < 0.85 ? 0.04 : 0.25);
        const plantDensity = plantRoll < 0.15 ? 0 : plantRoll;

        // --- BACKGROUND GENERATOR ---
        let skyGradient;
        const horizonY = height * 0.7;

        if (skyRoll < 0.45) {
            // REALISTIC BRAND SUNSET
            skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
            skyGradient.addColorStop(0, '#020202');
            skyGradient.addColorStop(0.5, fadeColor(secondaryColor, 0.3));
            skyGradient.addColorStop(0.85, fadeColor(primaryColor, 0.6));
            skyGradient.addColorStop(1, primaryColor);
        } else if (skyRoll < 0.75) {
            // DIGITAL ATMOSPHERE
            skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
            skyGradient.addColorStop(0, '#000');
            skyGradient.addColorStop(1, fadeColor(primaryColor, 0.3));
        } else {
            // MONOCHROME SECTOR
            skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
            skyGradient.addColorStop(0, '#010101');
            skyGradient.addColorStop(1, fadeColor(primaryColor, 0.15));
        }

        ctx.fillStyle = '#010101';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, horizonY);

        /**
         * DYNAMIC GROUND GENERATOR
         * Usually black (~80%), occasionally tinted or gradient brand-colored (~20%).
         */
        let groundColor;
        if (groundRoll < 0.8) {
            groundColor = '#050505'; // Classic deep dark ground
        } else if (groundRoll < 0.9) {
            groundColor = fadeColor(primaryColor, 0.15); // Subtle brand tint
        } else {
            // Rare ground gradient
            const gGrad = ctx.createLinearGradient(0, horizonY, 0, height);
            gGrad.addColorStop(0, fadeColor(primaryColor, 0.2));
            gGrad.addColorStop(1, '#020202');
            groundColor = gGrad;
        }

        ctx.fillStyle = groundColor;
        ctx.fillRect(0, horizonY, width, height - horizonY);

        // Subtler Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.015)';
        ctx.beginPath();
        for (let i = 0; i <= width; i += width / 24) {
            ctx.moveTo(width / 2 + (i - width / 2) * 0.045, horizonY);
            ctx.lineTo(i, height);
        }
        ctx.stroke();

        // GENERATE ENTITIES
        const entities = [];
        for (let i = 0; i < treeCount + (110 * plantDensity); i++) {
            const dist = Math.pow(rng(), 1.6);
            const x = rng() * width;
            const y = horizonY + dist * (height - horizonY);
            let type = 'plant';
            if (i < treeCount) type = 'tree';
            else if (rng() > 0.65) type = 'bush';
            entities.push({ x, y, dist, type, rState: rng() });
        }

        entities.sort((a, b) => a.dist - b.dist);

        entities.forEach(e => {
            const erng = seededRandom(seed + e.rState);
            const opacity = 0.25 + e.dist * 0.75;
            const eColor = fadeColor(primaryColor, opacity);

            if (e.type === 'tree') {
                const h = 20 + e.dist * 130;
                const d = e.dist < 0.2 ? 3 : (e.dist < 0.6 ? 4 : 5);
                drawTree(ctx, e.x, e.y, h, d, eColor, erng, e.dist);
            } else if (e.type === 'bush') {
                const s = 10 + e.dist * 35;
                drawBush(ctx, e.x, e.y, s, eColor, erng, e.dist);
            } else if (flowerRoll > 0.35) {
                // Ground Flowers: Strictly ground-only
                const s = 1.2 + e.dist * 2.2;
                if (erng() < flowerChance * 2) {
                    drawFlower(ctx, e.x, e.y - s, s, erng);
                    ctx.strokeStyle = eColor; ctx.lineWidth = 0.5;
                    ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x, e.y - s); ctx.stroke();
                }
            }
        });

    }, [seed]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#000', overflow: 'hidden', position: 'relative' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default DigitalForestBanner;
