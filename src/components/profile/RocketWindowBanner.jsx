import React, { useRef, useEffect, useMemo } from 'react';

/**
 * RocketWindowBanner - Focuses on Interior "Walls" with Mint/Blue lighting.
 * The window shows a deep black starfield.
 */
const RocketWindowBanner = ({ variant = 'rocket_warp', starSettings }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const BRAND = {
        white: '#FFFFFF',
        starRed: '#FFB8B8',
        starBlue: '#B8DFFF',
        mint: '#8CFFE9',
        blue: '#1B82FF'
    };

    const PALETTES = {
        rocket_warp: { nebula: '#000', speed: 0.6 },
        rocket_nebula: { nebula: '#000', speed: 0.2 }
    };

    const palette = PALETTES[variant] || PALETTES.rocket_warp;

    const userStarColor = starSettings?.color || BRAND.white;
    const isBrand = userStarColor === 'brand';
    const brandColors = ['#8CFFE9', '#FF5C8A', '#5A3FFF', '#1B82FF', '#FF914D'];

    class Star {
        constructor() { this.reset(); }
        reset() {
            this.x = (Math.random() - 0.5) * 4000;
            this.y = (Math.random() - 0.5) * 4000;
            this.z = Math.random() * 2000;
            this.pz = this.z;
            this.speed = palette.speed * 15;

            if (isBrand) {
                this.color = brandColors[Math.floor(Math.random() * brandColors.length)];
            } else {
                this.color = userStarColor;
            }
        }
        update() {
            this.pz = this.z;
            this.z -= this.speed;
            if (this.z < 1) this.reset();
        }
    }

    const stars = useMemo(() => [...Array(200)].map(() => new Star()), [palette.speed, userStarColor, isBrand]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const render = () => {
            const w = canvas.width; const h = canvas.height;
            const centerX = w / 2; const centerY = h / 2.2;

            // 1. PITCH BLACK SPACE
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);

            // 2. STARS
            stars.forEach(s => {
                s.update();
                const x = (s.x / s.z) * w + centerX; const y = (s.y / s.z) * h + centerY;
                const alpha = Math.min(1.0, (2000 - s.z) / 1000);
                ctx.globalAlpha = alpha; ctx.fillStyle = s.color;
                ctx.fillRect(x, y, 1.2, 1.2);
            });

            ctx.globalAlpha = 1;
            animationRef.current = requestAnimationFrame(render);
        };

        const resize = () => {
            if (!canvasRef.current) return;
            canvasRef.current.width = canvasRef.current.offsetWidth;
            canvasRef.current.height = canvasRef.current.offsetHeight;
        };
        window.addEventListener('resize', resize); resize(); render();
        return () => { cancelAnimationFrame(animationRef.current); window.removeEventListener('resize', resize); };
    }, [stars, palette]);

    return (
        <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden', background: '#000',
            zIndex: 0
        }}>
            {/* --- SPACE VIEW --- */}
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

            {/* --- SHIP WALLS & INTERIOR --- */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
                <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="wallGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0a0a14" />
                            <stop offset="100%" stopColor="#1a1a2e" />
                        </linearGradient>
                        <linearGradient id="wallGradRight" x1="100%" y1="0%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#0a0a14" />
                            <stop offset="100%" stopColor="#1a1a2e" />
                        </linearGradient>
                    </defs>

                    {/* Window Frame Mask (The Viewport) */}
                    <path
                        d="M0,0 H800 V200 H0 Z M120,20 L300,10 L500,10 L680,20 L750,150 L50,150 Z"
                        fillRule="evenodd" fill="#050508"
                    />

                    {/* Left Wall Panel */}
                    <path d="M0,0 L120,20 L50,150 L0,200 Z" fill="url(#wallGradLeft)" />
                    {/* Right Wall Panel */}
                    <path d="M800,0 L680,20 L750,150 L800,200 Z" fill="url(#wallGradRight)" />
                    {/* Ceiling Part */}
                    <path d="M0,0 L800,0 L680,20 L300,10 L120,20 Z" fill="#08080c" />

                    {/* MINT LIGHTING (Left Wall) */}
                    <path d="M20,30 L40,140" stroke={BRAND.mint} strokeWidth="1" strokeOpacity="0.4" />
                    <path d="M30,35 L45,130" stroke={BRAND.mint} strokeWidth="0.5" strokeOpacity="0.2" />

                    {/* INTERIOR BUTTONS (Small Dots) */}
                    <g opacity="0.8">
                        {/* Left Wall Buttons */}
                        <circle cx="15" cy="50" r="1.5" fill="#FF5C8A" className="blink-alt" />
                        <circle cx="18" cy="65" r="1.5" fill={BRAND.mint} />
                        <circle cx="22" cy="80" r="1.5" fill={BRAND.blue} className="blink" />
                        <circle cx="25" cy="95" r="1.5" fill="#FF914D" />

                        {/* Right Wall Buttons */}
                        <circle cx="785" cy="50" r="1.5" fill={BRAND.mint} className="blink" />
                        <circle cx="782" cy="65" r="1.5" fill={BRAND.blue} />
                        <circle cx="778" cy="80" r="1.5" fill="#FF5C8A" className="blink-alt" />
                        <circle cx="775" cy="95" r="1.5" fill="#FF914D" />
                    </g>

                    {/* BLUE LIGHTING (Right Wall) */}
                    <path d="M780,30 L760,140" stroke={BRAND.blue} strokeWidth="1" strokeOpacity="0.4" />
                    <path d="M770,35 L755,130" stroke={BRAND.blue} strokeWidth="0.5" strokeOpacity="0.2" />

                    {/* Frame Edge Lighting */}
                    <path d="M120,20 L300,10 L500,10 L680,20 L750,150 L50,150 Z" fill="none" stroke={BRAND.mint} strokeWidth="0.5" strokeOpacity="0.1" />
                </svg>
            </div>

            {/* --- DASHBOARD (Lowered) --- */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '45px',
                background: 'linear-gradient(to bottom, #0a0a14, #000)',
                borderTop: `1px solid ${BRAND.mint}33`,
                zIndex: 20, display: 'flex', alignItems: 'center', padding: '0 50px', gap: '30px',
                boxShadow: `0 -10px 40px rgba(0,0,0,0.9)`
            }}>
                <div style={{ flex: 1 }} />
                {/* Minimalist Tech */}
                <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: '70%', background: BRAND.blue, boxShadow: `0 0 10px ${BRAND.blue}` }} />
                </div>
            </div>

            <style>{`
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.1; } }
                @keyframes blinkAlt { 0%, 100% { opacity: 0.1; } 50% { opacity: 1; } }
                .blink { animation: blink 6s infinite; }
                .blink-alt { animation: blinkAlt 9s infinite; }
            `}</style>
        </div>
    );
};

export default RocketWindowBanner;
