import React, { useEffect, useRef, useMemo } from 'react';

// Brand Colors (from colorPacks.ts)
const BRAND = {
    MINT: '#7FFFD4',
    ION_BLUE: '#1B82FF',
    SOLAR_PINK: '#FF5C8A',
    DEEP_PURPLE: '#5A3FFF',
    ORANGE: '#FF914D',
    NEBULA_PINK: '#FFB7D5',
    PERIWINKLE: '#A7B6FF',
    AURORA: '#7FDBFF'
};

const AttractorBanner = React.lazy(() => import('./AttractorBanner'));
const ManifoldBanner = React.lazy(() => import('./ManifoldBanner'));
const HyperplexBanner = React.lazy(() => import('./HyperplexBanner'));
const QuantumFluxBanner = React.lazy(() => import('./QuantumFluxBanner'));
const FloraBanner = React.lazy(() => import('./FloraBanner'));
const SymmetryBanner = React.lazy(() => import('./SymmetryBanner'));
const CosmicMathBanner = React.lazy(() => import('./CosmicMathBanner'));
const TranscendenceBanner = React.lazy(() => import('./TranscendenceBanner'));

const OscilloscopeBanner = ({ variant, color, profileBorderColor, starSettings, animationsEnabled = true }) => {
    if (variant?.startsWith('math_aizawa') || variant?.startsWith('math_lorenz') || variant?.startsWith('math_rossler')) {
        return <AttractorBanner color={variant} profileBorderColor={profileBorderColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
    }
    if (variant?.startsWith('math_knot') || variant?.startsWith('math_enneper') || variant?.startsWith('math_mobius')) {
        return <ManifoldBanner color={variant} profileBorderColor={profileBorderColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
    }
    if (variant?.startsWith('math_pentachoron') || variant?.startsWith('math_24cell') || variant?.startsWith('math_tesseract_4d')) {
        return <HyperplexBanner color={variant} profileBorderColor={profileBorderColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
    }
    if (variant?.startsWith('math_wave') || variant?.startsWith('math_interference') || variant?.startsWith('math_quantum_foam')) {
        return <QuantumFluxBanner color={variant} profileBorderColor={profileBorderColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
    }
    if (variant?.startsWith('math_phyllotaxis') || variant?.startsWith('math_fibonacci')) {
        return <FloraBanner color={variant} profileBorderColor={profileBorderColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
    }
    if (variant?.startsWith('math_lissajous') || variant?.startsWith('math_hypotrochoid') || variant?.startsWith('math_supershape')) {
        return <SymmetryBanner color={variant} profileBorderColor={profileBorderColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
    }
    if (variant?.startsWith('math_calabi') || variant?.startsWith('math_singularity') || variant?.startsWith('math_ribbon')) {
        return <CosmicMathBanner color={variant} profileBorderColor={profileBorderColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
    }
    if (variant?.startsWith('math_fire') || variant?.startsWith('math_mandala') || variant?.startsWith('math_nebula')) {
        return <TranscendenceBanner color={variant} profileBorderColor={profileBorderColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
    }

    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    // Build the star field memoized for performance (STATIC if animations disabled)
    const stars = useMemo(() => {
        if (!starSettings?.enabled) return null;
        const count = 40;
        const starColor = starSettings.color || BRAND.MINT;
        const isBrand = starColor === 'brand';
        const brandColors = [BRAND.MINT, BRAND.SOLAR_PINK, BRAND.ION_BLUE, BRAND.ORANGE];

        return [...Array(count)].map((_, i) => {
            const thisColor = isBrand ? brandColors[i % brandColors.length] : starColor;
            return (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: (Math.random() * 2 + 1) + 'px',
                        height: (Math.random() * 2 + 1) + 'px',
                        background: thisColor,
                        borderRadius: '50%',
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                        opacity: Math.random() * 0.7 + 0.3,
                        boxShadow: `0 0 ${Math.random() * 4 + 2}px ${thisColor}`,
                        animation: animationsEnabled ? `os-star-twinkle ${Math.random() * 3 + 2}s ease-in-out infinite` : 'none',
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            );
        });
    }, [starSettings?.enabled, starSettings?.color, animationsEnabled]);

    // Helper to get RGB from Hex for vignette
    const hexToRgba = (hex, alpha) => {
        if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(0,0,0,${alpha})`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        let animationFrame;

        const getVariantId = () => {
            if (['os_daft', 'os_cyan', 'os_amber', 'os_classic', 'os_tesseract'].includes(variant)) return variant;
            if (typeof color === 'string' && color.includes('gradient')) return 'os_daft';
            return 'os_classic';
        };

        const project = (x, y, z, w, h, fov = 400) => {
            const scale = fov / (fov + z);
            return {
                x: (w / 2) + x * scale,
                y: (h / 2) + y * scale,
                scale: scale
            };
        };

        const render = () => {
            // Only increment time if animations are enabled
            if (animationsEnabled) {
                stateRef.current.time += 0.008;
            }

            const t = stateRef.current.time;
            const w = canvas.width;
            const h = canvas.height;
            const dpr = window.devicePixelRatio || 1;
            const activeVariant = getVariantId();

            ctx.clearRect(0, 0, w, h);
            ctx.shadowBlur = 20 * dpr;

            if (activeVariant === 'os_tesseract') {
                const drawTesseract = (cX, cY, s, rotSpeed, mainColor) => {
                    const points = [];
                    for (let i = 0; i < 16; i++) points.push([(i & 1 ? 1 : -1), (i & 2 ? 1 : -1), (i & 4 ? 1 : -1), (i & 8 ? 1 : -1)]);
                    const r = t * rotSpeed;
                    const projected = points.map(p => {
                        let [x, y, z, w4] = p;
                        let nx = x * Math.cos(r) - y * Math.sin(r);
                        let ny = x * Math.sin(r) + y * Math.cos(r);
                        x = nx; y = ny;
                        let nz = z * Math.cos(r * 0.8) - w4 * Math.sin(r * 0.8);
                        let nw = z * Math.sin(r * 0.8) + w4 * Math.cos(r * 0.8);
                        z = nz; w4 = nw;
                        const s4 = 2 / (2 + w4);
                        return project(x * s * s4, y * s * s4, z * s * s4 + 300, w, h);
                    });
                    ctx.lineWidth = 2.5 * dpr;
                    for (let i = 0; i < 16; i++) {
                        for (let bit = 0; bit < 4; bit++) {
                            const j = i ^ (1 << bit);
                            if (j > i) {
                                ctx.beginPath();
                                ctx.strokeStyle = (i < 8 === j < 8) ? mainColor : BRAND.ION_BLUE;
                                ctx.shadowColor = ctx.strokeStyle;
                                ctx.globalAlpha = 0.8;
                                ctx.moveTo(projected[i].x + cX, projected[i].y + cY);
                                ctx.lineTo(projected[j].x + cX, projected[j].y + cY);
                                ctx.stroke();
                            }
                        }
                    }
                };
                drawTesseract(-w * 0.22, -h * 0.05, h * 0.35, 0.4, BRAND.SOLAR_PINK);
                drawTesseract(w * 0.22, -h * 0.05, h * 0.35, -0.3, BRAND.MINT);

            } else if (activeVariant === 'os_daft') {
                const points = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
                const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
                const drawCube = (cX, cY, s, rotSpeed, angleOffset) => {
                    const r = t * (rotSpeed * 0.5) + angleOffset;
                    const projected = points.map(p => {
                        let [x, y, z] = p;
                        let nx = x * Math.cos(r) - z * Math.sin(r);
                        let nz = x * Math.sin(r) + z * Math.cos(r);
                        x = nx; z = nz;
                        let ny = y * Math.cos(r * 0.7) - z * Math.sin(r * 0.7);
                        nz = y * Math.sin(r * 0.7) + z * Math.cos(r * 0.7);
                        y = ny; z = nz;
                        return project(x * s, y * s, z + 300, w, h);
                    });
                    edges.forEach(([m, n], idx) => {
                        ctx.beginPath();
                        const cls = [BRAND.SOLAR_PINK, BRAND.ION_BLUE, BRAND.MINT, BRAND.ORANGE];
                        ctx.strokeStyle = cls[idx % 4];
                        ctx.shadowColor = ctx.strokeStyle;
                        ctx.lineWidth = 3 * dpr;
                        ctx.globalAlpha = 0.9;
                        ctx.moveTo(projected[m].x + cX, projected[m].y + cY);
                        ctx.lineTo(projected[n].x + cX, projected[n].y + cY);
                        ctx.stroke();
                    });
                };
                drawCube(-w * 0.25, 0, h * 0.3, 0.6, 0);
                drawCube(w * 0.25, 0, h * 0.3, -0.5, Math.PI);

            } else {
                // DIGITAL (Cyan, Amber, Classic): Dual Spheres on Sides
                let activeColor = color;
                if (activeVariant === 'os_amber') activeColor = BRAND.ORANGE;
                else if (activeVariant === 'os_cyan') activeColor = BRAND.ION_BLUE;
                else if (activeVariant === 'os_classic') activeColor = BRAND.MINT;

                const r = Math.min(w, h) * 0.35;

                const drawGlobe = (cX, cY, rotSpeed, isOpposite) => {
                    const rotY = t * rotSpeed * (isOpposite ? -1 : 1);

                    // Vertical Segments (Longitude)
                    for (let j = 0; j < 10; j++) {
                        ctx.beginPath();
                        ctx.strokeStyle = activeColor;
                        ctx.shadowColor = activeColor;
                        ctx.lineWidth = 2 * dpr;
                        ctx.globalAlpha = 0.5;

                        const angle = rotY + (j * Math.PI / 5);
                        for (let a = 0; a <= Math.PI * 2; a += 0.15) {
                            const px = Math.sin(a) * Math.cos(angle) * r;
                            const py = Math.cos(a) * r;
                            const pz = Math.sin(a) * Math.sin(angle) * r;
                            const p = project(px, py, pz + 400, w, h);
                            if (a === 0) ctx.moveTo(p.x + cX, p.y + cY); else ctx.lineTo(p.x + cX, p.y + cY);
                        }
                        ctx.stroke();
                    }

                    // Horizontal Rings (Latitude) - USER REQUEST: "add bit more lines horizontally"
                    for (let j = 1; j < 8; j++) {
                        ctx.beginPath();
                        ctx.strokeStyle = activeColor;
                        ctx.shadowColor = activeColor;
                        ctx.lineWidth = 1.5 * dpr;
                        ctx.globalAlpha = 0.3;

                        const lat = (j / 8) * Math.PI;
                        const ringR = Math.sin(lat) * r;
                        const ringY = Math.cos(lat) * r;

                        for (let a = 0; a <= Math.PI * 2; a += 0.2) {
                            const px = Math.cos(a + rotY) * ringR;
                            const pz = Math.sin(a + rotY) * ringR;
                            const p = project(px, ringY, pz + 400, w, h);
                            if (a === 0) ctx.moveTo(p.x + cX, p.y + cY); else ctx.lineTo(p.x + cX, p.y + cY);
                        }
                        ctx.closePath();
                        ctx.stroke();
                    }
                };

                // USER REQUEST: "make it so there is 2 one on each side... spin slower and each side spins opposite"
                drawGlobe(-w * 0.25, 0, 0.4, false); // Left globe, slow spin
                drawGlobe(w * 0.25, 0, 0.4, true);  // Right globe, opposite slow spin
            }

            if (animationsEnabled) {
                animationFrame = requestAnimationFrame(render);
            }
        };

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            // Force re-render on resize regardless of animation state
            render();
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial render

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrame);
        };
    }, [color, variant, animationsEnabled]);

    const vColor = getVignetteColor(profileBorderColor, color);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                {stars}
            </div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: vColor
                    ? `radial-gradient(circle at center, transparent 30%, ${hexToRgba(vColor, 0.12)} 80%, rgba(0,0,0,0.95) 100%)`
                    : `radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0) 80%, rgba(0,0,0,1) 100%)`,
                pointerEvents: 'none',
                zIndex: 2
            }} />
            <style>{`
                @keyframes os-star-twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
};

// Helper for vignetting (moved outside component for clarity)
const getVignetteColor = (profileBorderColor, color) => {
    if (profileBorderColor && typeof profileBorderColor === 'string' && profileBorderColor.startsWith('#')) return profileBorderColor;
    if (typeof color === 'string' && color.startsWith('#')) return color;
    return null;
};

export default OscilloscopeBanner;
