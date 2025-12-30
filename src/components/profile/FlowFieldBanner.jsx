import React, { useRef, useEffect, useMemo } from 'react';

// Hash function: String -> Number
const hashStr = (str) => {
    let hash = 0;
    if (!str) return 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// Seeded Random Generator (Mulberry32)
const mulberry32 = (a) => {
    return () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

// Simple Simplex-like Noise Implementation
// Based on a deterministic grid to avoid external dependencies
class SimpleNoise {
    constructor(seed) {
        this.p = new Uint8Array(256);
        const rand = mulberry32(seed);
        for (let i = 0; i < 256; i++) this.p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }
        this.perm = new Uint8Array(512);
        for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
    }

    lerp(t, a, b) { return a + t * (b - a); }
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const a = this.perm[X] + Y, aa = this.perm[a], ab = this.perm[a + 1];
        const b = this.perm[X + 1] + Y, ba = this.perm[b], bb = this.perm[b + 1];

        return this.lerp(v, this.lerp(u, this.grad(this.perm[aa], x, y),
            this.grad(this.perm[ba], x - 1, y)),
            this.lerp(u, this.grad(this.perm[ab], x, y - 1),
                this.grad(this.perm[bb], x - 1, y - 1)));
    }
}

const FlowFieldBanner = ({ seed = 'panospace', color: activeColor, speed = 1.0, animationsEnabled = true }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const stateRef = useRef({ time: 0 });

    // 1. Generate deterministic parameters from seed
    const params = useMemo(() => {
        const numericSeed = hashStr(seed);
        const rand = mulberry32(numericSeed);

        const palettes = [
            { id: 'deep_sea', colors: ['#005F73', '#0A9396', '#94D2BD', '#E9D8A6'], bg: '#001219' },
            { id: 'neon_sunset', colors: ['#FF5C8A', '#5A3FFF', '#1B82FF', '#FF914D'], bg: '#020002' },
            { id: 'emerald_frost', colors: ['#7FFFD4', '#8CFFE9', '#1B82FF', '#FFFFFF'], bg: '#010505' },
            { id: 'volcano', colors: ['#FF914D', '#FF5C8A', '#5A3FFF', '#000000'], bg: '#080000' },
            { id: 'cosmic_pulse', colors: ['#A7B6FF', '#FFB7D5', '#7FDBFF', '#7FFFD4'], bg: '#000205' }
        ];

        const palette = palettes[Math.floor(rand() * palettes.length)];

        return {
            palette,
            noiseScale: 0.003 + rand() * 0.01,
            particleSpeed: (0.2 + rand() * 0.3) * speed, // Slightly faster movement
            density: 200 + Math.floor(rand() * 300), // Fewer, clearer particles
            curliness: 2 + rand() * 6,
            lineWidth: 2 + rand() * 2, // Slightly thicker for visibility without trails
            opacity: 0.7 + rand() * 0.3,
            numericSeed: numericSeed
        };
    }, [seed, speed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrame;
        const noiseGen = new SimpleNoise(params.numericSeed);

        // Initialize particles
        const initParticles = () => {
            const w = canvas.width;
            const h = canvas.height;
            particlesRef.current = Array.from({ length: params.density }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: 0,
                vy: 0,
                age: Math.random() * 100,
                color: params.palette.colors[Math.floor(Math.random() * params.palette.colors.length)]
            }));
            // Clear canvas once on start
            ctx.fillStyle = params.palette.bg;
            ctx.fillRect(0, 0, w, h);
        };

        const render = () => {
            if (animationsEnabled) {
                stateRef.current.time += 0.0008 * speed; // Slightly faster noise evolution
            }
            const t = stateRef.current.time;
            const w = canvas.width;
            const h = canvas.height;
            const dpr = window.devicePixelRatio || 1;

            // NO TRAILS: Clear completely every frame
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = params.palette.bg;
            ctx.fillRect(0, 0, w, h);

            // DRAWING LOGIC: Use screen or lighter for vibrant overlay
            ctx.globalCompositeOperation = 'screen';

            const isMultiColor = activeColor && (activeColor.includes('gradient') || activeColor === 'brand');

            particlesRef.current.forEach(p => {
                // Flow Field Logic
                const noiseVal = noiseGen.noise(p.x * params.noiseScale, p.y * params.noiseScale + t);
                const angle = noiseVal * Math.PI * params.curliness;

                if (animationsEnabled) {
                    p.vx = Math.cos(angle) * params.particleSpeed;
                    p.vy = Math.sin(angle) * params.particleSpeed;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.age += 0.3;
                }

                // Wrap around or Respawn
                if (p.x < 0 || p.x > w || p.y < 0 || p.y > h || p.age > 200) {
                    p.x = Math.random() * w;
                    p.y = Math.random() * h;
                    p.age = 0;
                }

                ctx.beginPath();

                let strokeColor = p.color;
                if (activeColor && activeColor.startsWith('#')) {
                    strokeColor = activeColor;
                } else if (isMultiColor) {
                    const h_val = (noiseVal * 360 + t * 40) % 360;
                    strokeColor = `hsl(${h_val}, 80%, 70%)`;
                }

                const size = params.lineWidth * dpr;
                ctx.fillStyle = strokeColor;
                ctx.globalAlpha = params.opacity;

                ctx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            });

            if (animationsEnabled) {
                animationFrame = requestAnimationFrame(render);
            }
        };

        const res = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            initParticles();
            if (!animationsEnabled) render(); // Render once if static
        };

        window.addEventListener('resize', res);
        res();
        if (animationsEnabled) render();

        return () => {
            window.removeEventListener('resize', res);
            cancelAnimationFrame(animationFrame);
        };
    }, [params, activeColor, animationsEnabled]);

    return (
        <div
            style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: params.palette.bg }}
        >
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
            />
        </div>
    );
};

export default FlowFieldBanner;
