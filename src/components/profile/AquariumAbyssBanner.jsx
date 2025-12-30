import React, { useEffect, useRef, useMemo } from 'react';
import { fadeColor } from '@/core/utils/colorUtils';
import { BRAND_COLORS } from '@/core/constants/colorPacks';

/**
 * AQUARIUM ABYSS BANNER (V3 - Hyper-Gen Edition)
 * 
 * A high-entropy seed-driven underwater world generator:
 * - Dynamic Water Logic: 70% Realistic Abyss, 20% Brand Tints, 10% Multi-Color Rainbow.
 * - Mega-Fauna: Rare Sharks and even rarer Giant Jellyfish.
 * - Diverse Life: Multi-species fish (Sleek, Tall, Neon), Corals (Branch, Fan), and swaying sea plants.
 * - Rare Geological Wonders: Deterministic Volcanic Vents with real-time bubble emitters.
 * - Deterministic Ecosystem: Seed locks every rock, plant, and volcano placement.
 */

const AquariumAbyssBanner = ({
    seed = 'panospace'
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Stable Seeded Random
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
     * LIFE CLASSES
     */
    class Fish {
        constructor(depth, rng, primaryColor) {
            this.depth = depth;
            this.xP = rng();
            this.y = 0.1 + rng() * 0.75;
            this.type = rng() > 0.6 ? 'tall' : 'sleek';
            this.size = (this.type === 'tall' ? 10 : 8) * depth * (1 + rng() * 0.5);
            this.speed = (0.00001 + rng() * 0.00002) * depth;
            this.dir = rng() > 0.5 ? 1 : -1;
            this.phase = rng() * Math.PI * 2;

            // Color variation
            const hueShift = (rng() - 0.5) * 40;
            this.color = fadeColor(primaryColor, 0.4 + rng() * 0.6);
            this.accent = BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)];
        }
        update() {
            this.xP += this.speed * this.dir;
            if (this.xP > 1.1) { this.dir = -1; this.xP = 1.1; }
            if (this.xP < -0.1) { this.dir = 1; this.xP = -0.1; }
        }
        draw(ctx, w, h) {
            const time = Date.now() * 0.005;
            const wag = Math.sin(time + this.phase) * 0.2;
            const realX = this.xP * w;
            const realY = this.y * h + Math.sin(this.xP * 20 + this.phase) * 4;

            ctx.save();
            ctx.translate(realX, realY);
            ctx.scale(this.dir, 1);
            ctx.globalAlpha = 0.2 + this.depth * 0.8;

            // 1. Tail (Balanced proportions)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const tailStart = this.type === 'sleek' ? -this.size * 0.7 : -this.size * 0.3;
            ctx.moveTo(tailStart, 0);
            const tailSpread = this.type === 'tall' ? 0.7 : 0.6; // Shrunk from 1.1
            const tailLen = this.size * (this.type === 'tall' ? 1.1 : 1.3); // Shrunk from 1.6
            ctx.lineTo(-tailLen, -this.size * (tailSpread + wag));
            ctx.lineTo(-tailLen * 0.8, 0);
            ctx.lineTo(-tailLen, this.size * (tailSpread - wag));
            ctx.fill();

            // 2. Body (Rounder and Cuter)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            if (this.type === 'sleek') {
                ctx.moveTo(this.size, 0);
                ctx.quadraticCurveTo(0, -this.size * 0.5, -this.size, 0);
                ctx.quadraticCurveTo(0, this.size * 0.5, this.size, 0);
            } else {
                ctx.moveTo(this.size * 0.6, 0);
                // Even rounder for the 'tall' type
                ctx.quadraticCurveTo(0, -this.size * 1.1, -this.size * 0.4, 0);
                ctx.quadraticCurveTo(0, this.size * 1.1, this.size * 0.6, 0);
            }
            ctx.fill();

            // 3. Eye (Scaled to Body)
            ctx.fillStyle = '#000';
            ctx.beginPath();
            const eyeX = this.type === 'sleek' ? this.size * 0.6 : this.size * 0.3;
            const eyeR = this.size * 0.18;
            ctx.arc(eyeX, -this.size * 0.1, eyeR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(eyeX + eyeR * 0.3, -this.size * 0.1 - eyeR * 0.3, eyeR * 0.35, 0, Math.PI * 2);
            ctx.fill();

            // 4. Fins / Detail (Accent)
            ctx.fillStyle = this.accent;
            ctx.globalAlpha *= 0.6;
            ctx.beginPath();
            ctx.arc(this.size * 0.2, 0, this.size * 0.15, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    class Plant {
        constructor(xP, y, height, depth, color, rng) {
            this.xP = xP; this.y = y; this.h = height * depth * 1.5; this.depth = depth; this.color = color;
            this.swaySeed = rng() * Math.PI * 2;
            this.strands = Array.from({ length: 3 + Math.floor(rng() * 3) }, () => ({
                offset: (rng() - 0.5) * 12 * depth,
                hMult: 0.7 + rng() * 0.5,
                sMult: 0.8 + rng() * 0.4
            }));
        }
        draw(ctx, w, time) {
            const realX = this.xP * w;
            ctx.save();
            ctx.translate(realX, this.y);
            ctx.strokeStyle = this.color;
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.2 + this.depth * 0.8;

            this.strands.forEach(s => {
                const sway = Math.sin(time * s.sMult + this.swaySeed) * 12 * this.depth;
                const h = this.h * s.hMult;
                ctx.lineWidth = (1.0 + 2 * this.depth);
                ctx.beginPath();
                ctx.moveTo(s.offset, 0);
                ctx.quadraticCurveTo(s.offset + sway, -h * 0.5, s.offset + sway * 0.5, -h);
                ctx.stroke();
            });
            ctx.restore();
        }
    }

    class Shark {
        constructor(depth, rng, color) {
            this.depth = depth;
            this.xP = rng() > 0.5 ? -0.3 : 1.3;
            this.y = 0.3 + rng() * 0.4;
            this.size = (50 + rng() * 40) * depth;
            this.speed = (0.00003 + rng() * 0.00005) * depth;
            this.dir = this.xP < 0 ? 1 : -1;
            this.phase = rng() * Math.PI * 2;
            this.color = fadeColor(color, 0.8);
        }
        update() {
            this.xP += this.speed * this.dir;
            if (this.xP > 1.2) { this.dir = -1; this.xP = 1.2; }
            if (this.xP < -0.2) { this.dir = 1; this.xP = -0.2; }
        }
        draw(ctx, w, h) {
            const time = Date.now() * 0.003;
            const wag = Math.sin(time + this.phase) * 0.15;
            const realX = this.xP * w;
            const realY = this.y * h + Math.sin(this.xP * 10 + this.phase) * 10;
            ctx.save();
            ctx.translate(realX, realY);
            ctx.scale(this.dir, 1);
            ctx.globalAlpha = 0.3 + this.depth * 0.7;

            ctx.fillStyle = this.color;
            // Tail First
            ctx.beginPath();
            ctx.moveTo(-this.size * 0.6, 0);
            ctx.lineTo(-this.size * 1.7, -this.size * (0.9 + wag));
            ctx.lineTo(-this.size * 1.3, 0);
            ctx.lineTo(-this.size * 1.7, this.size * (0.7 - wag));
            ctx.fill();

            // Body
            ctx.beginPath();
            ctx.moveTo(this.size, 0);
            ctx.quadraticCurveTo(this.size * 0.2, -this.size * 0.6, -this.size, -this.size * 0.1);
            ctx.quadraticCurveTo(this.size * 0.2, this.size * 0.5, this.size, 0);
            ctx.fill();
            // Fin
            ctx.beginPath();
            ctx.moveTo(this.size * 0.2, -this.size * 0.3);
            ctx.quadraticCurveTo(-this.size * 0.2, -this.size * 0.7, -this.size * 0.4, -this.size * 0.25);
            ctx.fill();

            // Tiny Shark Eye (Scaled)
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.size * 0.8, -this.size * 0.1, this.size * 0.03, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }
    class Axolotl {
        constructor(depth, rng, color) {
            this.depth = depth;
            this.xP = rng();
            this.y = 0.82 + rng() * 0.05;
            this.size = (12 + rng() * 6) * depth; // Smaller size for cuteness
            this.speed = (0.000008 + rng() * 0.000012) * depth;
            this.dir = rng() > 0.5 ? 1 : -1;
            this.phase = rng() * Math.PI * 2;
            this.color = '#FFB6C1';
            this.frillColor = '#FF1493';
        }
        update() {
            this.xP += this.speed * this.dir;
            if (this.xP > 1.05) { this.dir = -1; this.xP = 1.05; }
            if (this.xP < -0.05) { this.dir = 1; this.xP = -0.05; }
        }
        draw(ctx, w, h) {
            const time = Date.now() * 0.004;
            const legWag = Math.sin(time * 1.5 + this.phase) * 5; // Slower leg paddling
            const realX = this.xP * w;
            const realY = this.y * h + Math.sin(time + this.phase) * 2;

            ctx.save();
            ctx.translate(realX, realY);
            ctx.scale(this.dir, 1);
            ctx.globalAlpha = 0.5 + this.depth * 0.5;

            // 1. Tiny Legs (Front and Back)
            ctx.fillStyle = this.color;
            // Front Legs
            ctx.beginPath();
            ctx.ellipse(this.size * 0.2, this.size * 0.3, this.size * 0.1, this.size * 0.2 + legWag * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Back Legs
            ctx.beginPath();
            ctx.ellipse(-this.size * 0.6, this.size * 0.3, this.size * 0.1, this.size * 0.2 - legWag * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Tail/Body (Flattened - no twisting)
            ctx.beginPath();
            ctx.moveTo(this.size * 0.5, 0);
            ctx.quadraticCurveTo(0, -this.size * 0.35, -this.size * 2.5, 0);
            ctx.quadraticCurveTo(0, this.size * 0.35, this.size * 0.5, 0);
            ctx.fill();

            // 3. Head (Large and Rounded)
            ctx.beginPath();
            ctx.arc(this.size * 0.7, 0, this.size * 0.55, 0, Math.PI * 2);
            ctx.fill();

            // 4. Frills (Gills) - SLOWED DOWN
            ctx.strokeStyle = this.frillColor;
            ctx.lineWidth = 3 * this.depth;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.size * 0.5, -this.size * 0.1);
                const fx = this.size * 1.1 + Math.sin(time * 1.2 + i) * 3; // Reduced from * 3
                const fy = -this.size * 0.4 - i * (this.size * 0.2);
                ctx.quadraticCurveTo(this.size * 0.8, fy, fx, fy);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(this.size * 0.5, this.size * 0.1);
                const fy2 = this.size * 0.4 + i * (this.size * 0.2);
                ctx.quadraticCurveTo(this.size * 0.8, fy2, fx, fy2);
                ctx.stroke();
            }

            // 5. Cuter Eyes (Scaled with Glint)
            ctx.fillStyle = '#000';
            const eyeR = this.size * 0.22;
            ctx.beginPath();
            ctx.arc(this.size * 0.9, -this.size * 0.15, eyeR, 0, Math.PI * 2);
            ctx.arc(this.size * 0.9, this.size * 0.15, eyeR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.size * 0.9 + eyeR * 0.3, -this.size * 0.15 - eyeR * 0.3, eyeR * 0.35, 0, Math.PI * 2);
            ctx.arc(this.size * 0.9 + eyeR * 0.3, this.size * 0.15 - eyeR * 0.3, eyeR * 0.35, 0, Math.PI * 2);
            ctx.fill();

            // 6. Smile
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.size * 1.0, 0, 4, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();

            ctx.restore();
        }
    }

    class Coral {
        constructor(xP, y, size, depth, color, rng) {
            this.xP = xP; this.y = y; this.size = size; this.depth = depth; this.color = color;
            this.type = rng() > 0.5 ? 'branch' : 'fan';
            this.points = Array.from({ length: 5 }, () => rng() * 0.5 + 0.5);
        }
        draw(ctx, w) {
            const realX = this.xP * w;
            ctx.save(); ctx.translate(realX, this.y); ctx.globalAlpha = 0.15 + 0.85 * this.depth;
            ctx.fillStyle = this.color; ctx.strokeStyle = this.color;
            if (this.type === 'branch') {
                ctx.lineWidth = 3 * this.depth;
                const drawBranch = (len, d) => {
                    if (d <= 0) return;
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len); ctx.stroke();
                    ctx.translate(0, -len);
                    ctx.save(); ctx.rotate(0.4); drawBranch(len * 0.7, d - 1); ctx.restore();
                    ctx.save(); ctx.rotate(-0.4); drawBranch(len * 0.7, d - 1); ctx.restore();
                };
                drawBranch(this.size, 4);
            } else {
                ctx.beginPath(); ctx.moveTo(0, 0);
                for (let i = 0; i < 5; i++) {
                    const angle = -Math.PI * 0.1 - (i * Math.PI * 0.2);
                    const len = this.size * this.points[i];
                    ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
                }
                ctx.fill();
            }
            ctx.restore();
        }
    }

    class Volcano {
        constructor(xP, y, size, rng) {
            this.xP = xP; this.y = y; this.size = size;
            this.bubbles = Array.from({ length: 15 }, () => ({
                rx: (rng() - 0.5) * (size * 0.4),
                yP: rng(),
                r: 0.5 + rng() * 1.5,
                s: 0.001 + rng() * 0.002,
                o: rng() * 10
            }));
        }
        update() {
            this.bubbles.forEach(b => {
                b.yP -= b.s;
                if (b.yP < 0) { b.yP = 1.0; b.rx = (Math.random() - 0.5) * (this.size * 0.4); }
            });
        }
        draw(ctx, w, h) {
            const realX = this.xP * w;
            const craterY = this.y - this.size * 0.6;
            ctx.fillStyle = '#050505';
            ctx.beginPath();
            ctx.moveTo(realX - this.size, this.y);
            ctx.lineTo(realX - this.size * 0.3, craterY);
            ctx.lineTo(realX + this.size * 0.3, craterY);
            ctx.lineTo(realX + this.size, this.y);
            ctx.fill();

            // Lava Glow
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.ellipse(realX, craterY, this.size * 0.2, this.size * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();

            // Bubbles
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            this.bubbles.forEach(b => {
                const bY = craterY - (1.0 - b.yP) * h * 0.8;
                ctx.beginPath();
                ctx.arc(realX + b.rx + Math.sin(bY * 0.05 + b.o) * 5, bY, b.r, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    /**
     * WORLD GENERATION LOGIC
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

        // --- THEME COLORS ---
        const backgroundTints = [
            BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)],
            BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)]
        ];
        const pCol = backgroundTints[0];
        const sCol = backgroundTints[1];

        // FILTER COLORS FOR LIFE (Ensure contrast)
        // We pick colors for the fish that are NOT the background tints
        const lifeColors = BRAND_COLORS.filter(c => !backgroundTints.includes(c));
        const getLifeColor = (rr) => lifeColors.length > 0
            ? lifeColors[Math.floor(rr * lifeColors.length)]
            : BRAND_COLORS[Math.floor(rr * BRAND_COLORS.length)];

        // WORLD PARAMETERS
        const waterRoll = rng(); // 0.0-0.7 Realistic, 0.7-0.9 Brand, 0.9-1.0 Multi
        const volcanoRoll = rng();
        const lifeRoll = rng();
        const sharkRoll = rng();

        const horizonY = height * 0.85;

        // ENTITIES
        const fish = Array.from({ length: 15 + Math.floor(lifeRoll * 25) }, () => {
            const fColor = getLifeColor(rng());
            return new Fish(0.2 + rng() * 1.3, rng, fColor);
        });
        const sharks = sharkRoll > 0.75 ? Array.from({ length: 1 + Math.floor(rng() * 2) }, () => {
            const sColor = getLifeColor(rng());
            return new Shark(0.6 + rng() * 0.8, rng, sColor);
        }) : [];
        const axolotlRoll = rng();
        const axolotls = axolotlRoll > 0.85 ? Array.from({ length: 1 }, () => {
            const aColor = getLifeColor(rng());
            return new Axolotl(0.8 + rng() * 0.4, rng, aColor);
        }) : [];
        const corals = Array.from({ length: 12 + Math.floor(lifeRoll * 10) }, () => {
            const dist = rng();
            const x = rng();
            const y = horizonY + dist * (height - horizonY);
            return new Coral(x, y, 15 + rng() * 25, dist, BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)], rng);
        });
        const plants = Array.from({ length: 25 + Math.floor(lifeRoll * 20) }, () => {
            const dist = rng();
            const x = rng();
            const y = horizonY + dist * (height - horizonY);
            return new Plant(x, y, 30 + rng() * 80, dist, BRAND_COLORS[Math.floor(rng() * BRAND_COLORS.length)], rng);
        });
        const volcano = volcanoRoll > 0.85 ? new Volcano(0.2 + rng() * 0.6, horizonY + 10, 30 + rng() * 20, rng) : null;

        const marineSnow = Array.from({ length: 120 }, () => ({ x: rng(), y: rng(), s: 0.4 + rng() * 0.6 }));

        let animationFrame;
        const render = () => {
            const time = Date.now() * 0.001;

            // 1. WATER RENDERING
            let bgGrad = ctx.createLinearGradient(0, 0, 0, height);
            if (waterRoll < 0.7) {
                // Realistic Deep Water
                bgGrad.addColorStop(0, '#000810');
                bgGrad.addColorStop(1, '#000000');
            } else if (waterRoll < 0.9) {
                // Brand Tinted
                bgGrad.addColorStop(0, fadeColor(pCol, 0.2));
                bgGrad.addColorStop(1, '#020202');
            } else {
                // Multi-Color / Rainbow Deep
                bgGrad.addColorStop(0, fadeColor(pCol, 0.3));
                bgGrad.addColorStop(0.5, fadeColor(sCol, 0.2));
                bgGrad.addColorStop(1, '#000');
            }
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            // 2. LIGHT RAYS
            if (waterRoll < 0.8) {
                ctx.save(); ctx.globalCompositeOperation = 'screen';
                for (let i = 0; i < 3; i++) {
                    const rx = width * (0.2 + i * 0.3) + Math.sin(time * 0.5 + i) * 60;
                    const rAlpha = 0.03 + Math.sin(time * 0.3 + i) * 0.02;
                    const rGrad = ctx.createLinearGradient(rx - 60, 0, rx + 60, height);
                    rGrad.addColorStop(0, fadeColor(pCol, rAlpha * 5));
                    rGrad.addColorStop(1, 'transparent');
                    ctx.fillStyle = rGrad;
                    ctx.beginPath();
                    ctx.moveTo(rx - 40, 0); ctx.lineTo(rx + 40, 0); ctx.lineTo(rx + 150, height); ctx.lineTo(rx - 150, height);
                    ctx.fill();
                }
                ctx.restore();
            }

            // 3. UNDERWATER SNOW
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            marineSnow.forEach(p => {
                const py = ((p.y + time * 0.015) % 1) * height;
                ctx.beginPath(); ctx.arc(p.x * width, py, p.s, 0, Math.PI * 2); ctx.fill();
            });

            // 3.5 HORIZON GROUND LINE
            const gGrad = ctx.createLinearGradient(0, horizonY, 0, height);
            gGrad.addColorStop(0, '#00080f');
            gGrad.addColorStop(1, '#000000');
            ctx.fillStyle = gGrad;
            ctx.fillRect(0, horizonY, width, height - horizonY);

            // Ground Line Polish
            ctx.strokeStyle = fadeColor(pCol, 0.2);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, horizonY);
            ctx.lineTo(width, horizonY);
            ctx.stroke();

            // 4. DEPTH SORTED ENTITIES
            if (volcano) { volcano.update(); volcano.draw(ctx, width, height); }

            const layers = [
                { min: 0.0, max: 0.5 },
                { min: 0.5, max: 0.9 },
                { min: 0.9, max: 2.5 }
            ];

            layers.forEach(l => {
                plants.forEach(p => { if (p.depth >= l.min && p.depth < l.max) p.draw(ctx, width, time); });
                corals.forEach(c => { if (c.depth >= l.min && c.depth < l.max) c.draw(ctx, width); });
                fish.forEach(f => { if (f.depth >= l.min && f.depth < l.max) { f.update(); f.draw(ctx, width, height); } });
                sharks.forEach(s => { if (s.depth >= l.min && s.depth < l.max) { s.update(); s.draw(ctx, width, height); } });
                axolotls.forEach(a => { if (a.depth >= l.min && a.depth < l.max) { a.update(); a.draw(ctx, width, height); } });
            });

            animationFrame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [seed]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#000', overflow: 'hidden', position: 'relative' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.8) 100%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default AquariumAbyssBanner;
