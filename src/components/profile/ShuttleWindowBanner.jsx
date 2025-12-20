import React, { useRef, useEffect, useMemo } from 'react';

const BRAND = {
    deepOrbit: '#5A3FFF',
    ionBlue: '#1B82FF',
    solarPink: '#FF5C8A',
    auroraMint: '#7FFFD4',
    white: '#FFFFFF',
    black: '#000000'
};

// --- HELPER: GENERATE LAYERS ---
const generateLayers = (palette) => {
    const createLayer = (count, speed, zIndex, type, sizeRange = [0, 1]) => {
        const items = [];

        // Special Logic for Planets (No Overlap, Chance of None)
        if (type === 'planet') {
            if (Math.random() < 0.4) { // 40% chance of NO planets
                return { speed, zIndex, type, items: [] };
            }

            const planetCount = 1 + Math.floor(Math.random() * 2); // 1 or 2 planets max
            for (let i = 0; i < planetCount; i++) {
                let attempts = 0;
                let valid = false;
                let x, y, size;

                // Try 10 times to find non-overlapping spot
                while (attempts < 10 && !valid) {
                    x = 0.2 + Math.random() * 0.6; // Keep somewhat central horizontally
                    y = Math.random();
                    size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);

                    valid = true;
                    for (const item of items) {
                        const dx = item.x - x;
                        const dy = item.y - y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < (item.size + size) * 1.2) { // Ensure gap
                            valid = false;
                            break;
                        }
                    }
                    attempts++;
                }

                if (valid) {
                    items.push({
                        x, y, size,
                        colorIdx: Math.floor(Math.random() * palette.colors.length),
                        texture: Math.random() // For rendering variation
                    });
                }
            }
            return { speed, zIndex, type, items };
        }

        // Standard Layer Generation
        return {
            speed,
            zIndex,
            type,
            items: Array.from({ length: count }, () => ({
                x: Math.random(),
                y: Math.random(),
                size: Math.random(),
                colorIdx: Math.floor(Math.random() * palette.colors.length)
            }))
        };
    };

    const layersData = [];

    if (palette.elements.includes('cloud')) {
        layersData.push(createLayer(10, 0.2, 0, 'cloud'));
        layersData.push(createLayer(15, 0.5, 1, 'cloud'));
    }

    if (palette.elements.includes('star')) {
        layersData.push(createLayer(100, 0.05, 0, 'star'));
        layersData.push(createLayer(50, 0.1, 0, 'star'));
    }

    // Planets logic for Deep Space
    if (palette.elements.includes('planet')) {
        // Small planets, slow moving
        layersData.push(createLayer(0, 0.04, 1, 'planet', [0.05, 0.12]));
    }

    if (palette.elements.includes('debris')) {
        layersData.push(createLayer(20, 0.8, 2, 'debris'));
    }

    if (palette.elements.includes('nebula')) {
        layersData.push(createLayer(5, 0.02, 0, 'cloud'));
    }

    if (palette.elements.includes('streak')) {
        layersData.push(createLayer(20, 2.0, 1, 'streak'));
    }

    return layersData;
};


// --- POD WINDOW SUB-COMPONENT ---
const PodWindow = ({ palette, variant }) => {
    const canvasRef = useRef(null);

    // Generate Unique Layers for THIS window
    const layers = useMemo(() => generateLayers(palette), [palette, variant]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        const startTime = Date.now();

        const render = () => {
            const w = canvas.width;
            const h = canvas.height;
            const time = (Date.now() - startTime) * 0.001;

            // 1. CLEAR & BACKGROUND
            if (palette.bg.includes('gradient')) {
                ctx.clearRect(0, 0, w, h);
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, w, h);
            } else {
                ctx.fillStyle = palette.bg.startsWith('#') ? palette.bg : '#000';
                ctx.fillRect(0, 0, w, h);
            }

            if (variant === 'shuttle_deep') {
                const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w);
                g.addColorStop(0, '#2A0E61');
                g.addColorStop(1, '#000');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
            }

            // 2. DRAW LAYERS
            layers.forEach(layer => {
                const layerSpeed = layer.speed * palette.speedScale;
                layer.items.forEach(item => {
                    let yPos = (item.y + time * layerSpeed) % 1;
                    if (yPos < 0) yPos += 1;

                    const px = item.x * w;

                    // Allow wrapping for large objects so they don't pop
                    let py = yPos * h;

                    const sz = item.size;
                    ctx.fillStyle = palette.colors[item.colorIdx];

                    if (layer.type === 'star') {
                        const size = 1 + sz * 1.5;
                        ctx.beginPath(); ctx.arc(px, py, size / 2, 0, Math.PI * 2); ctx.fill();
                    } else if (layer.type === 'planet') {
                        // Draw detailed small planet
                        const radius = w * sz;

                        // Handle Wrapping (Draw twice if near edge? Simple vertical wrap is usually enough)
                        // Gradient shading
                        const g = ctx.createRadialGradient(px - radius * 0.3, py - radius * 0.3, 0, px, py, radius);
                        g.addColorStop(0, item.colorIdx === 0 ? '#ffb' : '#bef'); // Highlight
                        g.addColorStop(0.5, palette.colors[item.colorIdx]); // Base
                        g.addColorStop(1, '#000'); // Shadow

                        ctx.fillStyle = g;
                        ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2); ctx.fill();

                        // Ring or Moon?
                        if (item.texture > 0.7) {
                            ctx.beginPath();
                            ctx.ellipse(px, py, radius * 1.5, radius * 0.3, -0.2, 0, Math.PI * 2);
                            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }

                    } else if (layer.type === 'cloud') {
                        const size = 20 + sz * 40;
                        ctx.globalAlpha = 0.2;
                        ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fill();
                        ctx.globalAlpha = 1.0;
                    } else if (layer.type === 'debris') {
                        ctx.fillRect(px, py, 1 + sz * 2, 1 + sz * 2);
                    } else if (layer.type === 'streak') {
                        const len = 20 + sz * 80;
                        ctx.strokeStyle = ctx.fillStyle;
                        ctx.lineWidth = 1 + sz;
                        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - len); ctx.stroke();
                    }
                });
            });

            // 3. WINDOW FRAME & GLASS
            const pad = 8;
            const radius = 12;

            const path = new Path2D();
            path.roundRect(pad, pad, w - pad * 2, h - pad * 2, radius);

            // Mask outside
            ctx.globalCompositeOperation = 'destination-in';
            ctx.fill(path);
            ctx.globalCompositeOperation = 'source-over';

            // Metallic Frame
            const frameGrad = ctx.createLinearGradient(0, 0, w, h);
            frameGrad.addColorStop(0, '#666');
            frameGrad.addColorStop(0.5, '#222');
            frameGrad.addColorStop(1, '#444');

            ctx.strokeStyle = frameGrad;
            ctx.lineWidth = 6;
            ctx.stroke(path);

            // Inner Seal
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke(path);

            // Glass Surface
            const glassGrad = ctx.createLinearGradient(0, 0, w, h);
            glassGrad.addColorStop(0, 'rgba(200, 230, 255, 0.03)');
            glassGrad.addColorStop(0.5, 'transparent');
            glassGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
            ctx.fillStyle = glassGrad;
            ctx.fill(path);

            // Specular Highlight
            ctx.save();
            ctx.clip(path);
            ctx.beginPath();
            ctx.moveTo(w * 0.7, -10);
            ctx.lineTo(w + 10, -10);
            ctx.lineTo(w * 0.4, h + 10);
            ctx.lineTo(w * 0.1, h + 10);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fill();
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [variant, layers, palette]);

    return (
        <canvas
            ref={canvasRef} width={120} height={160}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
    );
};


// --- MAIN COMPONENT ---
const ShuttleWindowBanner = ({ starSettings, variant = 'shuttle_orbit' }) => {
    // --- THEMES ---
    const PALETTES = {
        shuttle_orbit: {
            bg: '#000000',
            elements: ['star', 'debris'],
            colors: [BRAND.white, BRAND.ionBlue, BRAND.auroraMint],
            speedScale: 0.5
        },
        shuttle_deep: {
            bg: `radial-gradient(circle at 50% 50%, ${BRAND.deepOrbit}, #000)`,
            elements: ['star', 'nebula', 'planet'], // Added planet
            colors: [BRAND.solarPink, BRAND.deepOrbit],
            speedScale: 0.8
        },
        shuttle_warp: {
            bg: '#000',
            elements: ['streak'],
            colors: ['rgba(27, 130, 255, 0.4)', 'rgba(255,255,255,0.2)'],
            speedScale: 0.8
        }
    };

    const currentPalette = PALETTES[variant] || PALETTES.shuttle_orbit;

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#080808',
            // Clean Ship Interior - Composite Panels
            backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(20,20,24,0.4), #000 85%), 
                repeating-linear-gradient(90deg, transparent 0%, transparent 4px, rgba(0,0,0,0.5) 4px, rgba(0,0,0,0.5) 5px),
                linear-gradient(to bottom, #151515 0%, #0a0a0a 20%, #0a0a0a 80%, #151515 100%)
            `,
            backgroundBlendMode: 'normal, normal, normal',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12%',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 50px #000'
        }}>

            {/* Ambient Lighting Strips - More subtle */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: BRAND.ionBlue, opacity: 0.3, boxShadow: `0 0 10px ${BRAND.ionBlue}` }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: BRAND.ionBlue, opacity: 0.1 }} />

            {/* Left Pod Group */}
            <div style={{ display: 'flex', gap: '15px', height: '90%', width: '40%', justifyContent: 'flex-start', alignItems: 'center' }}>
                <div style={{ position: 'relative', zIndex: 1, width: '47%', height: '100%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))' }}>
                    <PodWindow palette={currentPalette} variant={variant} />
                </div>
                <div style={{ position: 'relative', zIndex: 1, width: '47%', height: '100%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))' }}>
                    <PodWindow palette={currentPalette} variant={variant} />
                </div>
            </div>

            {/* Right Pod Group */}
            <div style={{ display: 'flex', gap: '15px', height: '90%', width: '40%', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ position: 'relative', zIndex: 1, width: '47%', height: '100%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))' }}>
                    <PodWindow palette={currentPalette} variant={variant} />
                </div>
                <div style={{ position: 'relative', zIndex: 1, width: '47%', height: '100%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))' }}>
                    <PodWindow palette={currentPalette} variant={variant} />
                </div>
            </div>

            {/* Center Structural Panel (Subtle) */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '180px', height: '140px',
                border: '1px solid #1a1a1a',
                borderRadius: '8px',
                background: 'repeating-linear-gradient(45deg, #0e0e0e 0px, #0e0e0e 2px, #0a0a0a 2px, #0a0a0a 4px)',
                zIndex: 0,
                opacity: 0.4
            }} />

        </div>
    );
};

export default ShuttleWindowBanner;
