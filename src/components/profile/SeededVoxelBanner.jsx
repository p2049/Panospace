import React, { useRef, useEffect, useMemo, useState } from 'react';

// --- Utils ---

// Deterministic PRNG
const hashStr = (str) => {
    let hash = 0;
    if (!str) return 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return hash;
};

const mulberry32 = (a) => {
    return () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

// Brand Colors
const PANO = {
    MINT: '#7FFFD4',
    BLUE: '#1B82FF',
    PURPLE: '#5A3FFF',
    PINK: '#FF5C8A',
    ORANGE: '#FF914D',
    PERIWINKLE: '#A7B6FF',
    AURORA: '#7FDBFF',
    NEBULA: '#FFB7D5',
    VOID: '#020205',
    WHITE: '#FFFFFF'
};

const BIOMES = [
    {
        id: 'mint_shard',
        top: PANO.MINT,
        side: '#2E8B57',
        sky: '#E0F7FA',
        bg_top: '#E0F7FA',
        bg_bottom: PANO.MINT,
        glow: PANO.MINT
    },
    {
        id: 'cyber_night',
        top: PANO.BLUE, // Ion Blue
        side: '#0D47A1', // Dark Blue
        sky: PANO.VOID,
        bg_top: '#000000',
        bg_bottom: '#1B82FF40',
        glow: PANO.PURPLE
    },
    {
        id: 'solar_flare',
        top: PANO.ORANGE,
        side: '#BF360C', // Dark Orange
        sky: '#FFF3E0',
        bg_top: '#210505',
        bg_bottom: PANO.ORANGE,
        glow: PANO.PINK
    },
    {
        id: 'nebula_dream',
        top: PANO.PERIWINKLE,
        side: PANO.PURPLE,
        sky: '#F3E5F5',
        bg_top: '#120521',
        bg_bottom: PANO.PERIWINKLE,
        glow: PANO.NEBULA
    },
    {
        id: 'neon_core',
        top: PANO.PINK,
        side: '#880E4F', // Dark Pink
        sky: '#000000',
        bg_top: '#1a050d',
        bg_bottom: PANO.PINK,
        glow: PANO.AURORA
    }
];

const shade = (col, amt) => {
    let usePound = false;
    if (col[0] === '#') {
        col = col.slice(1);
        usePound = true;
    }
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let b = ((num >> 8) & 0x00FF) + amt;
    let g = (num & 0x0000FF) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
};

const SeededVoxelBanner = ({ seed = 'voxel', animationsEnabled = true }) => {
    const canvasRef = useRef(null);
    const [lastSeed, setLastSeed] = useState(seed);
    const [buildProgress, setBuildProgress] = useState(0);

    useEffect(() => {
        if (seed !== lastSeed) {
            setLastSeed(seed);
            setBuildProgress(0);
        }
    }, [seed, lastSeed]);

    useEffect(() => {
        if (buildProgress < 1) {
            const timer = requestAnimationFrame(() => {
                setBuildProgress(prev => Math.min(prev + 0.05, 1));
            });
            return () => cancelAnimationFrame(timer);
        }
    }, [buildProgress]);

    const world = useMemo(() => {
        const numericSeed = hashStr(seed);
        const rand = mulberry32(numericSeed);

        const biome = BIOMES[Math.floor(rand() * BIOMES.length)];
        const size = 10; // Slightly smaller for better fit
        const blocks = [];
        const cx = size / 2;
        const cy = size / 2;

        const heroX = Math.floor(rand() * (size - 4) + 2);
        const heroY = Math.floor(rand() * (size - 4) + 2);

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let h = Math.floor(rand() * 2) + 1;
                // Noise
                h += Math.floor(Math.sin((x + rand() * 10) * 0.8) * 1.5);
                h += Math.floor(Math.cos((y + rand() * 10) * 0.8) * 1.5);

                const maxDist = size / 2 - 0.5;
                if (dist > maxDist) {
                    if (dist > maxDist + 1.2) continue; // Skip corners
                    h -= 2; // Taper edges
                }

                let baseHeight = Math.max(1, h);

                blocks.push({ x, y, z: 0, height: baseHeight, type: 'ground' });

                // Add Hero or Prop
                if (x === heroX && y === heroY) {
                    blocks.push({ x, y, z: baseHeight, height: 3, type: 'hero' });
                } else if (dist < maxDist && rand() > 0.85) {
                    blocks.push({ x, y, z: baseHeight, height: 1, type: 'prop' });
                }
            }
        }

        blocks.sort((a, b) => {
            return (a.x + a.y) - (b.x + b.y) || (a.z - b.z);
        });

        return { biome, blocks };
    }, [seed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrame;
        const startTime = Date.now();

        const render = () => {
            const t = animationsEnabled ? (Date.now() - startTime) * 0.001 : 0;
            const w = canvas.width;
            const h = canvas.height;

            // Background
            const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, world.biome.bg_top || world.biome.sky);
            if (world.biome.id === 'cyber_night') {
                skyGrad.addColorStop(1, '#001020'); // Dark Fade
            } else if (world.biome.bg_bottom) {
                skyGrad.addColorStop(1, world.biome.bg_bottom);
            } else {
                skyGrad.addColorStop(1, '#ffffff');
            }

            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, w, h);

            // Positioning
            const tileW = 36;
            const tileH = 18;

            // Center the island. 
            const originX = w / 2;
            const fixedOriginY = h / 2 - 20;

            world.blocks.forEach((block, i) => {
                const stagger = (block.x + block.y) * 0.05;
                const effectiveProgress = Math.min(1, Math.max(0, (buildProgress * 1.5) - stagger));

                // Falling animation
                const dropOffset = (1 - effectiveProgress) * -300;
                const alpha = effectiveProgress;

                if (alpha <= 0) return;

                const drawX = (block.x - block.y) * tileW + originX;
                const drawY = (block.x + block.y) * tileH + fixedOriginY - (block.z * tileH * 1.2) + dropOffset;

                let bHeight = block.height * 14;
                const baseDrawY = drawY;
                const topDrawY = drawY - bHeight;

                let topColor, rightColor, leftColor;

                if (block.type === 'ground') {
                    topColor = world.biome.top;
                    rightColor = world.biome.side;
                    leftColor = shade(rightColor, -20);
                } else if (block.type === 'hero') {
                    // Hero object color contrast
                    topColor = shade(world.biome.glow, 40);
                    rightColor = shade(world.biome.glow, -20);
                    leftColor = shade(world.biome.glow, -40);
                } else {
                    // Prop
                    topColor = shade(world.biome.side, 40);
                    rightColor = shade(world.biome.side, -10);
                    leftColor = shade(world.biome.side, -30);
                }

                ctx.globalAlpha = alpha;

                // Left Face
                ctx.beginPath();
                ctx.moveTo(drawX - tileW, baseDrawY);
                ctx.lineTo(drawX, baseDrawY + tileH);
                ctx.lineTo(drawX, topDrawY + tileH);
                ctx.lineTo(drawX - tileW, topDrawY);
                ctx.closePath();
                ctx.fillStyle = leftColor;
                ctx.fill();

                // Right Face
                ctx.beginPath();
                ctx.moveTo(drawX + tileW, baseDrawY);
                ctx.lineTo(drawX, baseDrawY + tileH);
                ctx.lineTo(drawX, topDrawY + tileH);
                ctx.lineTo(drawX + tileW, topDrawY);
                ctx.closePath();
                ctx.fillStyle = rightColor;
                ctx.fill();

                // Top Face
                ctx.beginPath();
                ctx.moveTo(drawX, topDrawY - tileH);
                ctx.lineTo(drawX + tileW, topDrawY);
                ctx.lineTo(drawX, topDrawY + tileH);
                ctx.lineTo(drawX - tileW, topDrawY);
                ctx.closePath();
                ctx.fillStyle = topColor;
                ctx.fill();

                // Highlight Edges
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Glow Particles / Details
                if (Math.random() > 0.8 || block.type === 'hero') {
                    // Deterministic rand check based on coords
                    if (((block.x * block.y + i) % 7) === 0 || block.type === 'hero') {
                        ctx.shadowColor = world.biome.glow;
                        ctx.shadowBlur = 10;
                        ctx.fillStyle = world.biome.glow;
                        ctx.beginPath();
                        if (block.type === 'hero') {
                            // Beam?
                            ctx.rect(drawX - 2, topDrawY - 40, 4, 40);
                        } else {
                            ctx.arc(drawX, topDrawY, 3, 0, Math.PI * 2);
                        }
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }
            });

            ctx.globalAlpha = 1.0;

            if (animationsEnabled && buildProgress >= 1) {
                // Stop rendering loop if built and animations disabled or just static needed
                // But if we want glow animation we keep going
                animationFrame = requestAnimationFrame(render);
            } else if (buildProgress < 1) {
                animationFrame = requestAnimationFrame(render);
            }
        };

        const onResize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
            if (!animationsEnabled) render(); // Render once if static
        };

        window.addEventListener('resize', onResize);
        onResize();
        if (animationsEnabled) render();

        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(animationFrame);
        };
    }, [world, buildProgress, animationsEnabled]);


    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default SeededVoxelBanner;
