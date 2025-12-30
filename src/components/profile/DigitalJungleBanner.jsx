import React, { useEffect, useRef } from 'react';
import { fadeColor, lightenColor } from '@/core/utils/colorUtils';
import { BRAND_COLORS } from '@/core/constants/colorPacks';

/**
 * DIGITAL JUNGLE BANNER (V4 - "TOTAL BRAND COLOR")
 * 
 * Strict Brand Color Enforcement:
 * - Foliage, Wildlife, Trees, Sky, and Sun only use Panospace Brand Colors.
 * - Naturally evolved ecosystem using the brand's vibrant spectrum.
 */

const DigitalJungleBanner = ({
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
     * ASSET HELPERS
     */

    const drawJungleLeaf = (ctx, x, y, size, angle, color, type = 'broad') => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;

        if (type === 'fern') {
            const leaflets = 8;
            for (let i = 0; i < leaflets; i++) {
                const ly = (i / leaflets) * size * 1.5;
                const lw = size * 0.4 * (1 - i / leaflets);
                ctx.beginPath();
                ctx.ellipse(-lw, ly, lw, lw * 0.5, -0.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath();
                ctx.ellipse(lw, ly, lw, lw * 0.5, 0.5, 0, Math.PI * 2); ctx.fill();
            }
        } else if (type === 'palm') {
            const fronds = 12;
            ctx.lineWidth = size * 0.12;
            ctx.strokeStyle = color;
            for (let i = 0; i < fronds; i++) {
                ctx.save();
                ctx.rotate((i / fronds) * Math.PI * 0.6 - Math.PI * 0.3);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(size * 0.3, size * 0.8, 0, size * 2.2);
                ctx.stroke();
                ctx.restore();
            }
        } else {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-size * 0.6, size * 0.2, -size * 0.5, size * 1.3, 0, size * 1.6);
            ctx.bezierCurveTo(size * 0.5, size * 1.3, size * 0.6, size * 0.2, 0, 0);
            ctx.fill();

            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, size * 1.5); ctx.stroke();
        }
        ctx.restore();
    };

    const drawBranchingTree = (ctx, x, y, height, width, rng, depth, opacity, leafColors) => {
        if (depth <= 0) {
            // Leaf clusters at tips
            const leafType = rng() > 0.6 ? (rng() > 0.5 ? 'fern' : 'palm') : 'broad';
            // Increased leaf count for dense canopy
            for (let i = 0; i < 8; i++) {
                const lx = x + (rng() - 0.5) * 25;
                const ly = y + (rng() - 0.5) * 25;
                const col = leafColors[Math.floor(rng() * leafColors.length)];
                // Smaller leaves for realism
                drawJungleLeaf(ctx, lx, ly, 3 + rng() * 12, rng() * Math.PI * 2, fadeColor(col, opacity), leafType);
            }
            return;
        }

        // More organic angle variation
        const angle = (rng() - 0.5) * 0.7;
        const nx = x + Math.sin(angle) * height;
        const ny = y - Math.cos(angle) * height;

        // Trunk uses a desaturated/dark brand color (Deep Orbit Purple / Event Horizon Black)
        ctx.strokeStyle = `rgba(10, 5, 20, ${opacity})`;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        // More complex branching: 2-4 branches
        const branchRoll = rng();
        const branchCount = branchRoll > 0.9 ? 4 : (branchRoll > 0.6 ? 3 : 2);

        for (let i = 0; i < branchCount; i++) {
            // Taper width more for realism (0.65)
            drawBranchingTree(
                ctx, nx, ny,
                height * (0.5 + rng() * 0.5), // Varied length
                width * 0.65,
                rng,
                depth - 1,
                opacity,
                leafColors
            );
        }
    };

    const drawHangingVine = (ctx, x, y, length, rng, opacity, vineColor) => {
        ctx.strokeStyle = fadeColor(vineColor, opacity * 0.6);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        let cx = x; let cy = y;
        const segments = 14;
        const segmentLen = length / segments;
        for (let i = 0; i < segments; i++) {
            const tx = cx + Math.sin(i * 0.5 + rng() * 10) * 10;
            const ty = cy + segmentLen;
            ctx.quadraticCurveTo(cx, cy, tx, ty);
            cx = tx; cy = ty;
            if (rng() > 0.6) {
                drawJungleLeaf(ctx, cx, cy, 4 + rng() * 7, rng() * Math.PI, fadeColor(vineColor, opacity), 'broad');
            }
        }
        ctx.stroke();
    };

    const drawCuteAnimal = (ctx, x, y, size, type, rng, opacity) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = opacity;

        const animalCol = BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)];

        if (type === 'monkey') {
            ctx.fillStyle = animalCol;
            ctx.strokeStyle = animalCol;
            ctx.lineWidth = size * 0.3; // Thicker, cuter limbs
            ctx.lineCap = 'round'; // Essential for soft look

            // Tail (Curled up behind)
            ctx.beginPath(); ctx.moveTo(0, size * 0.5); ctx.bezierCurveTo(-size * 2.2, size * 0.5, -size * 2.2, -size * 1.5, -size * 0.5, -size * 0.8); ctx.stroke();

            // Legs (Sitting pose with knees)
            ctx.beginPath();
            ctx.moveTo(-size * 0.4, size * 0.8);
            ctx.quadraticCurveTo(-size * 1.3, size * 1.0, -size * 1.0, size * 1.8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(size * 0.4, size * 0.8);
            ctx.quadraticCurveTo(size * 1.3, size * 1.0, size * 1.0, size * 1.8);
            ctx.stroke();

            // Feet (Round paws)
            ctx.beginPath(); ctx.arc(-size * 1.05, size * 1.8, size * 0.25, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(size * 1.05, size * 1.8, size * 0.25, 0, Math.PI * 2); ctx.fill();

            // Body (Chunky potato)
            ctx.beginPath(); ctx.ellipse(0, size * 0.2, size * 1.05, size * 1.1, 0, 0, Math.PI * 2); ctx.fill();

            // Arms (Hugging/Resting on belly)
            ctx.beginPath(); ctx.moveTo(-size * 0.9, -size * 0.3); ctx.quadraticCurveTo(-size * 1.5, 0, -size * 0.5, size * 0.6); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(size * 0.9, -size * 0.3); ctx.quadraticCurveTo(size * 1.5, 0, size * 0.5, size * 0.6); ctx.stroke();

            // Hands (Round paws)
            ctx.beginPath(); ctx.arc(-size * 0.5, size * 0.6, size * 0.25, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(size * 0.5, size * 0.6, size * 0.25, 0, Math.PI * 2); ctx.fill();

            // Head (Large & Cute)
            ctx.beginPath(); ctx.arc(0, -size * 1.5, size * 1.0, 0, Math.PI * 2); ctx.fill();

            // Ears
            ctx.beginPath(); ctx.arc(-size * 1.15, -size * 1.5, size * 0.45, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(size * 1.15, -size * 1.5, size * 0.45, 0, Math.PI * 2); ctx.fill();

            // Face mask
            ctx.fillStyle = lightenColor(animalCol, 75);
            ctx.beginPath(); ctx.arc(0, -size * 1.4, size * 0.75, 0, Math.PI * 2); ctx.fill();

            // Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(-size * 0.28, -size * 1.5, size * 0.14, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(size * 0.28, -size * 1.5, size * 0.14, 0, Math.PI * 2); ctx.fill();

            // Smile
            ctx.strokeStyle = '#000';
            ctx.lineWidth = size * 0.1;
            ctx.beginPath();
            ctx.arc(0, -size * 1.4, size * 0.3, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.stroke();
        } else if (type === 'parrot') {
            // "Parakeet" Style - Smaller, sleek, long tail
            ctx.fillStyle = animalCol;

            // Scale down visually to satisfy "make birds smaller"
            const s = size * 0.7;

            // Long Tail Feathers (Hanging down)
            ctx.beginPath();
            ctx.moveTo(0, s * 0.5);
            ctx.lineTo(-s * 0.4, s * 3.5); // Long tip
            ctx.lineTo(s * 0.4, s * 0.5);
            ctx.fill();

            // Body (Sleek oval, angled)
            ctx.save();
            ctx.rotate(-0.2); // Slight perk up
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.7, s * 1.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Wing (Folded)
            ctx.fillStyle = lightenColor(animalCol, 30); // Lighter wing
            ctx.beginPath();
            ctx.ellipse(s * 0.2, s * 0.2, s * 0.5, s * 1.0, -0.4, 0, Math.PI * 2);
            ctx.fill();

            // Head (Smaller, distinct)
            ctx.fillStyle = animalCol;
            ctx.beginPath();
            ctx.arc(0, -s * 1.2, s * 0.65, 0, Math.PI * 2);
            ctx.fill();

            // Beak (Curved hook)
            ctx.fillStyle = '#eee'; // Off-white/Bone
            ctx.beginPath();
            ctx.moveTo(s * 0.4, -s * 1.3);
            ctx.quadraticCurveTo(s * 0.9, -s * 1.1, s * 0.5, -s * 0.8); // Hook down
            ctx.lineTo(s * 0.4, -s * 1.1);
            ctx.fill();

            // Eye (Tiny and realistic)
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(s * 0.1, -s * 1.35, s * 0.1, 0, Math.PI * 2); // Tiny dot
            ctx.fill();

            // White eye ring (optional detail for realism)
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = s * 0.05;
            ctx.beginPath();
            ctx.arc(s * 0.1, -s * 1.35, s * 0.18, 0, Math.PI * 2);
            ctx.stroke();
        } else if (type === 'frog') {
            ctx.fillStyle = animalCol;
            ctx.strokeStyle = animalCol;
            ctx.lineWidth = size * 0.35;
            // Hind Legs
            ctx.beginPath(); ctx.arc(-size, size * 0.6, size, Math.PI, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(size, size * 0.6, size, Math.PI, Math.PI * 2); ctx.stroke();
            // Body
            ctx.beginPath(); ctx.ellipse(0, 0, size * 1.6, size * 1.1, 0, 0, Math.PI * 2); ctx.fill();
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(-size * 0.8, -size * 0.9, size * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(size * 0.8, -size * 0.9, size * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(-size * 0.8, -size * 0.9, size * 0.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(size * 0.8, -size * 0.9, size * 0.2, 0, Math.PI * 2); ctx.fill();
        }

        ctx.restore();
    };

    /**
     * WORLD GENERATOR
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

        // --- STRICT BRAND PALETTE ---
        // Pick primary, secondary, and accent colors for the world from BRAND_COLORS
        const p1 = BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)];
        const p2 = BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)];
        const p3 = BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)];
        const starCol = BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)];

        const horizonY = height * 0.68;

        // Sky Gradient (Using Brand Colors)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#000');
        skyGrad.addColorStop(0.4, fadeColor(p1, 0.2));
        skyGrad.addColorStop(1, fadeColor(p2, 0.4));
        ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, width, horizonY);

        // Stellar Sun
        const sx = rng() * width; const sy = rng() * horizonY * 0.6; const sr = 30 + rng() * 60;
        const sunGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3);
        sunGrad.addColorStop(0, fadeColor(starCol, 0.6));
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad; ctx.beginPath(); ctx.arc(sx, sy, sr * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = starCol; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();

        // Distant Horizon Layer
        for (let i = 0; i < 2; i++) {
            ctx.fillStyle = fadeColor(p1, 0.15 - i * 0.05);
            ctx.beginPath(); ctx.moveTo(0, horizonY);
            let curX = 0; while (curX < width) { curX += 40 + rng() * 80; ctx.lineTo(curX, horizonY - (rng() * 40 + (1 - i) * 30)); }
            ctx.lineTo(width, horizonY); ctx.fill();
        }

        // Ground (Dark Brand Blend)
        const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
        groundGrad.addColorStop(0, fadeColor(p3, 0.1));
        groundGrad.addColorStop(1, '#000');
        ctx.fillStyle = groundGrad; ctx.fillRect(0, horizonY, width, height - horizonY);

        const entities = [];
        const count = 120 + Math.floor(rng() * 100);
        for (let i = 0; i < count; i++) {
            const dist = Math.pow(rng(), 1.4);
            const x = rng() * width;
            const y = horizonY + dist * (height - horizonY);
            const rState = rng();
            let type = rng() > 0.4 ? 'plant' : 'tree';
            if (rng() > 0.93) type = 'animal';
            entities.push({ x, y, dist, type, rState });
        }

        entities.sort((a, b) => a.dist - b.dist);

        entities.forEach(e => {
            const erng = seededRandom(seed + e.rState);
            const opacity = 0.35 + e.dist * 0.65;

            if (e.type === 'tree') {
                const trunkW = (2 + e.dist * 14);
                const treeBaseH = 18 + e.dist * 50;
                // Tree foliage uses brand colors
                const foliageCols = [p1, p2, BRAND_COLORS[Math.floor(erng() * BRAND_COLORS.length)]];
                drawBranchingTree(ctx, e.x, e.y, treeBaseH, trunkW, erng, Math.floor(2 + e.dist * 3), opacity, foliageCols);
                if (erng() > 0.45) drawHangingVine(ctx, e.x + (erng() - 0.5) * 50, e.y - treeBaseH * 2.8, 30 + erng() * 140 * e.dist, erng, opacity, p1);
            } else if (e.type === 'plant') {
                const type = ['broad', 'fern', 'palm'][Math.floor(erng() * 3)];
                // SIGNIFICANTLY REDUCED SIZE: Was 12 + dist*45, Now 5 + dist*20
                const plantSize = 5 + e.dist * 20;
                const col = BRAND_COLORS[Math.floor(erng() * BRAND_COLORS.length)];
                // More leaves per plant to compensate for smaller size
                for (let j = 0; j < 8; j++) {
                    const pa = (erng() - 0.5) * 3.0; // Wider spread
                    drawJungleLeaf(ctx, e.x, e.y, plantSize, pa, fadeColor(col, opacity), type);
                    if (erng() > 0.85) { // Exotic brand accents (Flowers)
                        ctx.fillStyle = BRAND_COLORS[Math.floor(erng() * BRAND_COLORS.length)];
                        ctx.beginPath(); ctx.arc(e.x + (erng() - 0.5) * 10, e.y - erng() * plantSize, 3 * (0.2 + e.dist * 0.8), 0, Math.PI * 2); ctx.fill();
                    }
                }
            } else if (e.type === 'animal') {
                const animalType = ['monkey', 'parrot', 'frog', 'monkey'][Math.floor(erng() * 4)];
                const aSize = 3.5 + e.dist * 8.5;
                drawCuteAnimal(ctx, e.x, e.y - aSize, aSize, animalType, erng, opacity);
            }
        });

        const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.95);
        vignette.addColorStop(0, 'transparent'); vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height);

    }, [seed]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#000', overflow: 'hidden', position: 'relative' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
    );
};

export default DigitalJungleBanner;
