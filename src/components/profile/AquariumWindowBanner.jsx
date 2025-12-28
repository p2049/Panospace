import React, { useRef, useEffect, useMemo } from 'react';

/**
 * AquariumWindowBanner - Grand Aquarium Exhibit V8 (Y2K / 90s Aesthetic Update)
 * Features:
 * - Frameless Design: clean, full-width view of the deep sea ecosystem.
 * - Ultra-Dark Aesthetic: Deep, moody bioluminescent atmosphere.
 * - Deterministic Generation: Background and plants are locked to a fixed seed.
 * - Natural Sea Grass: Smoothly curved plants using quadratic Bézier paths.
 * - Atmospheric Perspective: Deep depth with realistic water physics and volumetric rays.
 */

// Stable palettes with Y2K influences (vibrant neons, translucent blues)
const PALETTES = {
    marine_blue: {
        water: ['#000000', '#00050a', '#000c1f'], // Ultra-dark midnight
        light: '#00F3FF',
        accent: '#002a33',
        rock: '#010103',
        rockShadow: '#000000',
        rockDetail: '#050a14',
        plant: '#002214',
        lava: '#D92600',
        jelly: 'rgba(0, 243, 255, 0.15)', // More subtle jelly
        corals: ['#D11547', '#059c99', '#CC7A00', '#CC294D', '#8014CC'], // Darker coral tones
        bezel: '#151518' // Almost black chrome
    },
    tropical_reef: {
        water: ['#000000', '#00080f', '#001421'],
        light: '#00D9B5',
        accent: '#001f1c',
        rock: '#050302',
        rockShadow: '#000000',
        rockDetail: '#0f0a07',
        plant: '#050f05',
        lava: '#CC6600',
        jelly: 'rgba(140, 255, 233, 0.15)',
        corals: ['#CC5E47', '#CCAA40', '#C26161', '#73AD9E', '#BACC90'],
        bezel: '#151518'
    },
    deep_abyss: {
        water: ['#000000', '#000000', '#010205'], // Void black
        light: '#1440CC',
        accent: '#000e29',
        rock: '#000000',
        rockShadow: '#000000',
        rockDetail: '#050505',
        plant: '#000505',
        lava: '#990000',
        jelly: 'rgba(20, 60, 200, 0.15)',
        corals: ['#3A094D', '#A62E47', '#CCA729', '#299178', '#087A49'],
        bezel: '#0a0a0a'
    }
};

const seededRandom = (s) => {
    const mask = 0xffffffff;
    let m_w = (123456789 + s) & mask;
    let m_z = (987654321 - s) & mask;
    return () => {
        m_z = (36969 * (m_z & 65535) + (m_z >>> 16)) & mask;
        m_w = (18000 * (m_w & 65535) + (m_w >>> 16)) & mask;
        let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
        return result / 4294967296;
    };
};

const AquariumWindowBanner = ({ variant = 'marine_blue' }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const palette = PALETTES[variant] || PALETTES.marine_blue;
    const FLOOR_Y = 162;

    class RockPeak {
        constructor(xP, y, w, h, depth, rand) {
            this.xP = xP; this.y = y; this.w = w; this.h = h; this.depth = depth;
            this.points = [];
            const steps = 10 + Math.floor(rand() * 8);
            for (let i = 0; i <= steps; i++) {
                const stepXP = (i / steps) * 2 - 1;
                const noise = (rand() - 0.5) * (h * 0.4);
                this.points.push({ dx: stepXP * w, dy: -Math.max(0, (1 - Math.pow(stepXP, 2)) * h + noise) });
            }
            this.cracks = [...Array(4)].map(() => ({ x: (rand() - 0.5) * w, y: -rand() * h, l: 15 + rand() * 25, a: rand() * Math.PI }));
            this.blur = Math.max(0, (1.1 - this.depth) * 4);
        }
        draw(ctx, w) {
            const realX = this.xP * w;
            ctx.save(); ctx.translate(realX, this.y); ctx.globalAlpha = 0.05 + (0.95 * this.depth);
            if (this.blur > 0.5) ctx.filter = `blur(${this.blur}px)`;
            ctx.fillStyle = palette.rock; ctx.beginPath(); ctx.moveTo(this.points[0].dx, 10);
            for (let p of this.points) ctx.lineTo(p.dx, p.dy);
            ctx.lineTo(this.points[this.points.length - 1].dx, 10); ctx.fill();
            if (this.depth > 0.4) {
                ctx.fillStyle = palette.rockShadow; ctx.beginPath(); ctx.moveTo(0, -this.h); ctx.lineTo(this.w * 0.45, 0); ctx.lineTo(-this.w * 0.25, 0); ctx.globalAlpha *= 0.55; ctx.fill();
            }
            ctx.restore();
        }
    }

    class Coral {
        constructor(xP, y, size, depth, color, rand) {
            this.xP = xP; this.y = y; this.size = size; this.depth = depth; this.color = color;
            this.type = rand() > 0.5 ? 'branch' : 'fan';
            this.blur = Math.max(0, (1.1 - this.depth) * 2.5);
            this.seed = rand() * 100;
            if (this.type === 'fan') this.ribbons = [...Array(6)].map(() => 0.8 + rand() * 0.4);
        }
        draw(ctx, w) {
            const realX = this.xP * w;
            ctx.save(); ctx.translate(realX, this.y); ctx.globalAlpha = 0.1 + (0.9 * this.depth);
            if (this.blur > 0.5) ctx.filter = `blur(${this.blur}px)`;
            ctx.fillStyle = this.color; ctx.strokeStyle = this.color;
            if (this.type === 'branch') {
                ctx.lineWidth = 4.5 * this.depth; ctx.lineCap = 'round';
                const drawBranch = (len, angle, depth) => {
                    if (depth <= 0) return;
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len); ctx.stroke();
                    ctx.translate(0, -len);
                    ctx.save(); ctx.rotate(0.3 + Math.sin(this.seed) * 0.1); drawBranch(len * 0.75, angle, depth - 1); ctx.restore();
                    ctx.save(); ctx.rotate(-0.35 - Math.cos(this.seed) * 0.1); drawBranch(len * 0.7, angle, depth - 1); ctx.restore();
                };
                drawBranch(this.size * 0.4, 0.4, 4);
            } else {
                ctx.beginPath(); ctx.moveTo(0, 0);
                for (let i = 0; i < 6; i++) {
                    const angle = -Math.PI * 0.15 - (i * Math.PI * 0.14);
                    const len = this.size * this.ribbons[i];
                    ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
                    ctx.lineTo(Math.cos(angle + 0.1) * len * 0.2, Math.sin(angle + 0.1) * len * 0.2);
                }
                ctx.fill();
            }
            ctx.restore();
        }
    }

    class Plant {
        constructor(xPercent, y, h, depth, color, rand) {
            this.xPercent = xPercent; this.y = y; this.h = h * depth; this.depth = depth; this.color = color;
            this.blur = Math.max(0, (1.0 - this.depth) * 2.0);
            this.points = [...Array(3)].map((_, i) => ({
                cx: (rand() - 0.5) * 15 * (i + 1),
                cy: -(this.h / 3) * (i + 1)
            }));
        }
        draw(ctx, w) {
            const realX = this.xPercent * w; ctx.save(); ctx.translate(realX, this.y);
            ctx.globalAlpha = 0.05 + (0.9 * this.depth);
            if (this.blur > 0.4) ctx.filter = `blur(${this.blur}px)`;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.strokeStyle = this.color; ctx.lineWidth = 1.8 + 3.5 * this.depth; ctx.lineCap = 'round';
            ctx.quadraticCurveTo(this.points[0].cx, this.points[0].cy * 0.5, this.points[0].cx, this.points[0].cy);
            ctx.quadraticCurveTo(this.points[1].cx, this.points[1].cy * 0.8, this.points[1].cx, this.points[1].cy);
            ctx.quadraticCurveTo(this.points[2].cx, this.points[2].cy * 0.9, this.points[2].cx, this.points[2].cy);
            ctx.stroke(); ctx.restore();
        }
    }

    class MoonJelly {
        constructor(depth) { this.depth = depth; this.reset(); }
        reset() { this.xP = Math.random(); this.y = 20 + Math.random() * (FLOOR_Y - 40); this.size = (15 + Math.random() * 15) * this.depth; this.speed = (0.00001 + Math.random() * 0.000015) * this.depth; this.pulseBase = Math.random() * Math.PI * 2; this.blur = Math.max(0, (1.2 - this.depth) * 3); }
        update() { this.y -= this.speed * 40; this.xP += Math.sin(this.y * 0.01) * 0.0001; if (this.y < -50) this.y = FLOOR_Y + 50; }
        draw(ctx, w) {
            const time = Date.now() * 0.0004;
            const pulse = 1 + Math.sin(time + this.pulseBase) * 0.12;
            const realX = this.xP * w;
            ctx.save(); ctx.translate(realX, this.y); ctx.globalAlpha = 0.2 + (0.7 * this.depth); if (this.blur > 0.5) ctx.filter = `blur(${this.blur}px)`;
            ctx.strokeStyle = palette.jelly; ctx.lineWidth = 1 * this.depth;
            for (let i = 0; i < 4; i++) {
                ctx.beginPath(); ctx.moveTo((i - 1.5) * (this.size * 0.2), 0);
                for (let j = 1; j <= 8; j++) {
                    const step = (this.size * 1.5 / 8) * j;
                    const sway = Math.sin(time * 2 + j * 0.5 + i) * (step * 0.12 * pulse);
                    ctx.bezierCurveTo((i - 1.5) * (this.size * 0.2), step - 2, (i - 1.5) * (this.size * 0.2) + sway, step - 2, (i - 1.5) * (this.size * 0.2) + sway, step);
                }
                ctx.stroke();
            }
            const grad = ctx.createRadialGradient(0, -this.size * 0.1, 0, 0, -this.size * 0.1, this.size * pulse);
            grad.addColorStop(0, palette.light + '99'); grad.addColorStop(0.6, palette.light + '44'); grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, this.size * pulse, Math.PI, 0); ctx.fill();
            ctx.restore();
        }
    }

    class Fish {
        constructor(depth) {
            this.depth = depth; this.xP = Math.random(); this.y = 20 + Math.random() * (FLOOR_Y - 45); this.type = Math.random() > 0.6 ? 'sleek' : 'tall';
            this.size = (this.type === 'sleek' ? 9 + Math.random() * 6 : 11 + Math.random() * 6) * this.depth;
            this.speed = (0.000008 + Math.random() * 0.000015) * (this.depth * this.depth);
            this.dir = Math.random() > 0.5 ? 1 : -1; this.phase = Math.random() * Math.PI * 2;
            const hue = Math.random() * 40 + 190; const saturation = 30 + 70 * (this.depth / 1.5); const lightness = 30 + 40 * (this.depth / 1.5); this.baseColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`; this.bellyColor = `hsl(${hue}, ${saturation}%, ${lightness + 15}%)`; this.finColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;
            this.blur = Math.max(0, (1.2 - this.depth) * 2.8);
        }
        update() { this.xP += this.speed * this.dir; if (this.xP > 1.2) this.xP = -0.2; if (this.xP < -0.2) this.xP = 1.2; }
        draw(ctx, w) {
            const realX = this.xP * w; const tailWag = Math.sin(Date.now() * 0.005 + this.phase) * 0.15;
            const realY = this.y + Math.sin(realX * 0.015 + this.phase) * 0.3 * (this.depth * 2);
            ctx.save(); ctx.translate(realX, realY); ctx.scale(this.dir, 1); ctx.globalAlpha = 0.1 + (0.9 * (this.depth / 1.5)); if (this.blur > 0.5) ctx.filter = `blur(${this.blur}px)`;
            ctx.beginPath(); ctx.fillStyle = this.finColor;
            if (this.type === 'sleek') { ctx.moveTo(-this.size * 0.8, 0); ctx.lineTo(-this.size * 1.4, -this.size * (0.6 + tailWag)); ctx.lineTo(-this.size * 1.1, 0); ctx.lineTo(-this.size * 1.4, this.size * (0.6 - tailWag)); }
            else { ctx.moveTo(-this.size * 0.3, 0); ctx.lineTo(-this.size * 1.1, -this.size * (0.9 + tailWag)); ctx.lineTo(-this.size * 0.8, 0); ctx.lineTo(-this.size * 1.1, this.size * (0.9 - tailWag)); }
            ctx.fill(); const bodyGrad = ctx.createLinearGradient(0, -this.size, 0, this.size); bodyGrad.addColorStop(0, this.baseColor); bodyGrad.addColorStop(1, this.bellyColor); ctx.fillStyle = bodyGrad; ctx.beginPath();
            if (this.type === 'sleek') { ctx.moveTo(this.size, 0); ctx.quadraticCurveTo(0, -this.size * 0.5, -this.size, 0); ctx.quadraticCurveTo(0, this.size * 0.5, this.size, 0); }
            else { ctx.moveTo(this.size * 0.6, 0); ctx.quadraticCurveTo(0, -this.size * 1.0, -this.size * 0.4, 0); ctx.quadraticCurveTo(0, this.size * 1.0, this.size * 0.6, 0); }
            ctx.fill(); ctx.restore();
        }
    }

    class Volcano {
        constructor(xPercent, y, size, rand) { this.xPercent = xPercent; this.y = y; this.size = size; this.bubbles = [...Array(18)].map(() => ({ rx: (rand() - 0.5) * (size * 0.5), yPercent: rand(), r: 0.6 + rand() * 1.8, s: 0.0008 + rand() * 0.0015, o: rand() * Math.PI * 2 })); }
        update() { this.bubbles.forEach(b => { b.yPercent -= b.s; if (b.yPercent < -0.1) { b.yPercent = 1.0; b.rx = (Math.random() - 0.5) * (this.size * 0.5); } }); }
        draw(ctx, w) {
            const realX = this.xPercent * w; const craterY = this.y - this.size * 0.7; ctx.fillStyle = palette.rock;
            ctx.beginPath(); ctx.moveTo(realX - this.size, this.y); ctx.lineTo(realX - this.size * 0.35, craterY); ctx.lineTo(realX + 0.35 * this.size, craterY); ctx.lineTo(realX + this.size, this.y); ctx.fill();
            ctx.fillStyle = palette.lava; ctx.beginPath(); ctx.ellipse(realX, craterY, this.size * 0.22, this.size * 0.08, 0, 0, Math.PI * 2); ctx.fill();
            const lavaGlow = ctx.createRadialGradient(realX, craterY, 0, realX, craterY, this.size * 2); lavaGlow.addColorStop(0, palette.lava + '88'); lavaGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = lavaGlow; ctx.beginPath(); ctx.arc(realX, craterY, this.size * 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.4)'; this.bubbles.forEach(b => {
                const bY = b.yPercent * (craterY + 20); ctx.beginPath(); ctx.arc(realX + b.rx + Math.sin(bY * 0.04 + b.o) * 4, bY, b.r, 0, Math.PI * 2); ctx.fill();
            });
        }
    }

    const staticData = useMemo(() => {
        const rand = seededRandom(42);
        const mountainLayers = [
            { id: 'haze', count: 14, depth: 0.05, baseH: 20, varH: 25, baseW: 40, varW: 60 },
            { id: 'ultra', count: 12, depth: 0.15, baseH: 40, varH: 35, baseW: 60, varW: 80 },
            { id: 'far', count: 10, depth: 0.35, baseH: 60, varH: 45, baseW: 80, varW: 100 },
            { id: 'mid', count: 8, depth: 0.65, baseH: 100, varH: 50, baseW: 130, varW: 70 },
            { id: 'near', count: 6, depth: 0.85, baseH: 30, varH: 25, baseW: 50, varW: 60 }
        ];
        const peaks = mountainLayers.map(l => ({ id: l.id, depth: l.depth, data: [...Array(l.count)].map((_, i) => new RockPeak((i / l.count) + (rand() * 0.2 - 0.1), FLOOR_Y + 5, l.baseW + rand() * l.varW, l.baseH + rand() * l.varH, l.depth, rand)) }));
        const plants = {
            distant: [...Array(40)].map(() => new Plant(rand(), FLOOR_Y + 12, 35, 0.3, palette.plant, rand)),
            mid: [...Array(30)].map(() => new Plant(rand(), FLOOR_Y + 6, 55, 0.7, palette.plant, rand)),
            near: [...Array(20)].map(() => new Plant(rand(), FLOOR_Y + 4, 85, 1.1, palette.plant, rand))
        };
        const corals = [...Array(18)].map(() => new Coral(rand(), FLOOR_Y + 5, 20 + rand() * 30, 0.4 + rand() * 0.7, palette.corals[Math.floor(rand() * palette.corals.length)], rand));
        const marineSnow = [...Array(150)].map(() => ({ xP: rand(), yP: rand(), s: 0.3 + rand() * 0.4 }));
        const volcano = new Volcano(0.85, FLOOR_Y + 6, 34, rand);
        return { peaks, plants, corals, marineSnow, volcano };
    }, [variant]);

    const lifeData = useMemo(() => {
        return {
            ultraDistant: [...Array(12)].map(() => new Fish(0.2)),
            distantFish: [...Array(14)].map(() => new Fish(0.45)),
            midFish: [...Array(10)].map(() => new Fish(0.85)),
            heroFish: [...Array(6)].map(() => new Fish(1.4)),
            midJellies: [...Array(3)].map(() => new MoonJelly(0.6)),
            heroJellies: [...Array(2)].map(() => new MoonJelly(1.2))
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const render = () => {
            const w = canvas.width; const h = canvas.height; const time = Date.now() * 0.001;
            const grad = ctx.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, palette.water[2]); grad.addColorStop(0.5, palette.water[1]); grad.addColorStop(1, palette.water[0]); ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

            // Scanline effect (90s / Y2K feel) - darker and subtler
            ctx.save();
            ctx.globalAlpha = 0.02; // Reduced alpha
            ctx.fillStyle = '#000';
            for (let i = 0; i < h; i += 3) ctx.fillRect(0, i, w, 1);
            ctx.restore();

            const lightPulse = 0.1 + Math.sin(time * 0.5) * 0.03; // Dimmer pulse
            const topGrad = ctx.createLinearGradient(0, 0, 0, 45);
            topGrad.addColorStop(0, palette.light + '22'); // Subtler bloom
            topGrad.addColorStop(1, 'transparent'); ctx.fillStyle = topGrad; ctx.fillRect(0, 0, w, 45);

            ctx.save(); ctx.globalCompositeOperation = 'screen';
            for (let i = 0; i < 3; i++) {
                const rayPulse = 0.04 + Math.sin(time * 0.3 + i) * 0.02; // Dimmer rays
                const rayX = (w * 0.2 + (i * w * 0.3));
                const rayG = ctx.createLinearGradient(rayX - 100, 0, rayX + 200, h);
                rayG.addColorStop(0, palette.light + Math.floor(rayPulse * 255).toString(16).padStart(2, '0'));
                rayG.addColorStop(0.5, palette.light + '05'); // Very faint tail
                rayG.addColorStop(1, 'transparent'); ctx.fillStyle = rayG; ctx.beginPath(); ctx.moveTo(rayX - 40, 0); ctx.lineTo(rayX + 40, 0); ctx.lineTo(rayX + 250, h); ctx.lineTo(rayX - 250, h); ctx.fill();
            }
            ctx.restore();

            staticData.peaks.forEach(layer => {
                if (layer.id === 'haze') {
                    ctx.save(); ctx.globalAlpha = 0.05; ctx.filter = 'blur(14px)'; ctx.fillStyle = palette.light; layer.data.forEach(p => p.draw(ctx, w)); ctx.restore();
                } else if (layer.id === 'ultra') {
                    ctx.save(); ctx.globalAlpha = 0.12; ctx.filter = 'blur(10px)'; layer.data.forEach(p => p.draw(ctx, w)); ctx.restore();
                    ctx.fillStyle = 'rgba(255,255,255,0.12)';
                    staticData.marineSnow.slice(0, 75).forEach(p => {
                        const py = ((p.yP + time * 0.005) % 1) * h; ctx.beginPath(); ctx.arc(p.xP * w, py, p.s, 0, Math.PI * 2); ctx.fill();
                    });
                    lifeData.ultraDistant.forEach(f => { f.update(); f.draw(ctx, w); });
                    staticData.plants.distant.forEach(p => p.draw(ctx, w));
                } else if (layer.id === 'far') {
                    layer.data.forEach(p => p.draw(ctx, w));
                    lifeData.distantFish.forEach(f => { f.update(); f.draw(ctx, w); });
                } else if (layer.id === 'mid') {
                    layer.data.forEach(p => p.draw(ctx, w));
                    lifeData.midJellies.forEach(j => { j.update(); j.draw(ctx, w); });
                    staticData.plants.mid.forEach(p => p.draw(ctx, w));
                    staticData.corals.forEach(c => c.draw(ctx, w));
                    lifeData.midFish.forEach(f => { f.update(); f.draw(ctx, w); });
                } else {
                    layer.data.forEach(p => p.draw(ctx, w));
                }
            });

            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            staticData.marineSnow.slice(75).forEach(p => {
                const py = ((p.yP + time * 0.01) % 1) * h; ctx.beginPath(); ctx.arc(p.xP * w, py, p.s * 1.5, 0, Math.PI * 2); ctx.fill();
            });
            staticData.volcano.update(); staticData.volcano.draw(ctx, w);
            staticData.plants.near.forEach(p => p.draw(ctx, w));
            lifeData.heroJellies.forEach(j => { j.update(); j.draw(ctx, w); });
            lifeData.heroFish.forEach(f => { f.update(); f.draw(ctx, w); });
            animationRef.current = requestAnimationFrame(render);
        };
        const rs = () => { if (canvasRef.current) { canvasRef.current.width = canvasRef.current.offsetWidth; canvasRef.current.height = canvasRef.current.offsetHeight; } };
        window.addEventListener('resize', rs); rs(); render();
        return () => { cancelAnimationFrame(animationRef.current); window.removeEventListener('resize', rs); };
    }, [staticData, lifeData, palette]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000', zIndex: 0 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default AquariumWindowBanner;
