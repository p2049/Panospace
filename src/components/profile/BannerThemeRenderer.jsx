import React from 'react';



import CityscapeBanner from './CityscapeBanner';
import OceanBanner from './OceanBanner';
import EarthBanner from './EarthBanner';

const BannerThemeRenderer = ({ mode, color, starSettings }) => {
    const overlayStyle = {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
    };

    // ... (rest is unchanged) ...

    // 5. CITYSCAPE PACK
    if (mode.startsWith('city') || mode === 'panospace_beyond') {
        return <CityscapeBanner themeId={mode} starSettings={starSettings} />;
    }

    // 6. OCEAN PACK
    if (mode.startsWith('ocean') && mode !== 'ocean_depths') {
        return <OceanBanner themeId={mode} starSettings={starSettings} />;
    }

    // 7. COSMIC EARTH (Station Theme)
    if (mode === 'cosmic-earth') {
        return <EarthBanner color={color} starSettings={starSettings} />;
    }

    // 8. PLANET - Apple-style abstract cosmic border (Over-Designed Premium)
    if (mode === 'planet') {
        const isBrand = starSettings?.color === 'brand';
        const starColor = (starSettings?.color && !isBrand) ? starSettings.color : color;

        return (
            <div style={overlayStyle}>
                <div style={{ position: 'absolute', inset: 0, background: '#020202', zIndex: 0 }} />

                {/* Animated Stars */}
                {starSettings?.enabled && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 0
                    }}>
                        {React.useMemo(() => {
                            const brandColors = ['#7FFFD4', '#FF5C8A', '#5A3FFF', '#1B82FF', '#FF914D'];
                            return [...Array(50)].map((_, i) => {
                                const thisStarColor = isBrand
                                    ? brandColors[Math.floor(Math.random() * brandColors.length)]
                                    : starColor;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            width: Math.random() * 2 + 1 + 'px',
                                            height: Math.random() * 2 + 1 + 'px',
                                            background: thisStarColor,
                                            borderRadius: '50%',
                                            top: Math.random() * 90 + '%', // Keep stars slightly higher
                                            left: Math.random() * 100 + '%',
                                            opacity: Math.random() * 0.6 + 0.2,
                                            animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
                                            animationDelay: `${Math.random() * 3}s`,
                                            boxShadow: `0 0 ${Math.random() * 4 + 2}px ${thisStarColor}`,
                                            willChange: 'opacity'
                                        }}
                                    />
                                );
                            });
                        }, [isBrand, starColor])}
                    </div>
                )}

                {/* 
                    THE PLANET HORIZON
                    "Over-designed the f*** out of it"
                */}
                <div style={{
                    position: 'absolute',
                    bottom: '-930px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '1000px',
                    height: '1000px',
                    borderRadius: '50%',
                    zIndex: 2,
                    padding: '4px', // Thicker premium bezel
                    // Complex Conic Gradient for "Space Age" metallic lighting (Blue & Purple Only)
                    background: 'conic-gradient(from 180deg at 50% 50%, #000000 120deg, #1B82FF 160deg, #5A3FFF 200deg, #000000 240deg)',
                    // Multi-layered "Shocking" Glow
                    boxShadow: `
                        0 -2px 10px rgba(27, 130, 255, 0.5),   /* Sharp Blue Highlight */
                        0 -10px 40px rgba(90, 63, 255, 0.4),   /* Deep Purple Atmosphere */
                        0 -30px 100px rgba(27, 130, 255, 0.3), /* Wide Blue Ambience */
                        inset 0 2px 20px rgba(255, 255, 255, 0.1) /* Inner Rim Light */
                    `
                }}>
                    {/* Inner Void - Pitch Black with Gloss */}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#000',
                        borderRadius: '50%',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Glossy Reflection on the dark side */}
                        <div style={{
                            position: 'absolute',
                            top: '0', left: '10%', right: '10%', height: '200px',
                            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 60%)',
                            filter: 'blur(10px)'
                        }} />
                    </div>
                </div>

                {/* Atmospheric Haze Layer - SIGNIFICANTLY DARKENED */}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0, height: '150px',
                    // Reduced opacity from 0.15/0.05 to 0.08/0.02 for subtler effect
                    background: 'linear-gradient(to top, rgba(27, 130, 255, 0.08) 0%, rgba(90, 63, 255, 0.02) 40%, transparent 100%)',
                    zIndex: 1,
                    pointerEvents: 'none',
                    mixBlendMode: 'screen'
                }} />

                <style>{`
                    @keyframes twinkle {
                        0%, 100% { opacity: 0.3; transform: scale(1); }
                        50% { opacity: 1; transform: scale(1.2); }
                    }
                `}</style>
            </div>
        );
    }

    // 9. ICE PLANET - Frozen World with Aurora
    if (mode === 'ice-planet') {
        const starColor = '#E0FFFF'; // Force Light Cyan (Ice) stars

        return (
            <div style={overlayStyle}>
                {/* 1. Deep Cold Space Background */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 120%, #001529 0%, #000510 60%, #000000 100%)', zIndex: 0 }} />

                {/* 2. Stars (Ice Cold) */}
                {starSettings?.enabled && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                        {React.useMemo(() => [...Array(60)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    width: Math.random() * 2 + 1 + 'px',
                                    height: Math.random() * 2 + 1 + 'px',
                                    background: starColor,
                                    borderRadius: '50%',
                                    top: Math.random() * 90 + '%',
                                    left: Math.random() * 100 + '%',
                                    opacity: Math.random() * 0.7 + 0.3,
                                    boxShadow: `0 0 ${Math.random() * 4 + 1}px ${starColor}`,
                                    animation: `twinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 5}s`
                                }}
                            />
                        )), [])}
                    </div>
                )}

                {/* 3. The Aurora Borealis (Matched Geometry to Planet) */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 3, // ON TOP of the planet
                    pointerEvents: 'none',
                    mixBlendMode: 'screen',
                    overflow: 'hidden'
                }}>
                    <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                        <defs>
                            <filter id="aurora-spikes">
                                <feTurbulence type="fractalNoise" baseFrequency="0.004 0.04" numOctaves="5" result="noise" />
                                <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" yChannelSelector="R" />
                                <feGaussianBlur stdDeviation="2" />
                            </filter>
                        </defs>
                    </svg>

                    {/* Green Glow Base (Atmosphere) */}
                    <div style={{
                        position: 'absolute', left: '50%', bottom: '-930px', width: '1020px', height: '1020px', transform: 'translateX(-50%)', borderRadius: '50%',
                        boxShadow: `0 -10px 80px rgba(0, 255, 136, 0.4), inset 0 20px 60px rgba(0, 255, 136, 0.2)`,
                        opacity: 0.8
                    }} />

                    {/* Main Green Spiky Curtains (Mathematically aligned to surface) */}
                    <div style={{
                        // Center Alignment: Planet Center Y ~ -430px. Div Height 1600. Bottom = -430 - 800 = -1230.
                        position: 'absolute', left: '50%', bottom: '-1230px', width: '1600px', height: '1600px',
                        transform: 'translateX(-50%)',
                        borderRadius: '50%',
                        filter: 'url(#aurora-spikes) brightness(1.3) contrast(1.2)',
                        background: `conic-gradient(
                            from 170deg at 50% 50%, 
                            transparent 0deg, 
                            rgba(0, 255, 136, 0) 5deg, 
                            rgba(0, 255, 136, 0.9) 15deg, 
                            rgba(127, 255, 212, 0.6) 25deg, 
                            rgba(0, 255, 136, 0.8) 35deg, 
                            rgba(127, 255, 212, 0) 45deg
                        )`,
                        // Mask Start: Radius 500px (Planet Surface). 500/800 = 62.5%
                        maskImage: 'radial-gradient(circle at 50% 50%, transparent 62%, black 63%, black 70%, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 62%, black 63%, black 70%, transparent 80%)',
                        opacity: 1.0, mixBlendMode: 'normal'
                    }} />

                    {/* Purple Background Haze */}
                    <div style={{
                        position: 'absolute', left: '50%', bottom: '-1230px', width: '1800px', height: '1800px', transform: 'translateX(-50%) rotate(10deg)', borderRadius: '50%',
                        filter: 'blur(50px)',
                        background: `conic-gradient(from 150deg at 50% 50%, transparent 0deg, rgba(90, 63, 255, 0.0) 10deg, rgba(90, 63, 255, 0.6) 30deg, rgba(90, 63, 255, 0.0) 70deg)`,
                        // Wider mask for haze
                        maskImage: 'radial-gradient(circle at 50% 50%, transparent 55%, black 60%, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 55%, black 60%, transparent 80%)',
                        opacity: 0.8, mixBlendMode: 'screen'
                    }} />

                    {/* Pink Shimmers */}
                    <div style={{
                        position: 'absolute', left: '50%', bottom: '-1230px', width: '1600px', height: '1600px', transform: 'translateX(-50%)', borderRadius: '50%',
                        filter: 'url(#aurora-spikes) blur(1px)',
                        background: `conic-gradient(
                            from 165deg at 50% 50%, 
                            transparent 0deg, 
                            transparent 15deg, 
                            rgba(255, 42, 109, 0.9) 18deg, 
                            transparent 20deg, 
                            transparent 35deg, 
                            rgba(255, 42, 109, 0.7) 38deg, 
                            transparent 42deg
                        )`,
                        maskImage: 'radial-gradient(circle at 50% 50%, transparent 62%, black 63%, black 70%, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 62%, black 63%, black 70%, transparent 80%)',
                        opacity: 0.9, mixBlendMode: 'screen'
                    }} />
                </div>


                {/* 4. The ICE PLANET Horizon */}
                <div style={{
                    position: 'absolute',
                    bottom: '-930px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '1000px',
                    height: '1000px',
                    borderRadius: '50%',
                    zIndex: 2,
                    padding: '0', // No border, the glow is the border

                    // FROZEN GLOW
                    boxShadow: `
                        0 -5px 30px rgba(127, 255, 212, 0.6),   /* Intense Mint Rim */
                        0 -20px 80px rgba(27, 130, 255, 0.5),   /* Deep Blue Atmosphere */
                        inset 0 10px 50px rgba(255, 255, 255, 0.4) /* Inner Ice Reflection */
                    `
                }}>
                    {/* Planet Surface Texture */}
                    <div style={{
                        width: '100%', height: '100%', borderRadius: '50%',
                        overflow: 'hidden',
                        position: 'relative',
                        // Base Ice Gradient
                        background: 'radial-gradient(circle at 50% 0%, #D4F1F9 0%, #7FDBFF 20%, #1B82FF 50%, #001529 100%)',
                    }}>
                        {/* Crushed Ice Texture Overlay */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.3'/%3E%3C/svg%3E")`,
                            mixBlendMode: 'overlay',
                            opacity: 0.5
                        }} />

                        {/* Frozen Cracks / Veins (CSS Pattern) */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'repeating-conic-gradient(from 0deg at 50% -20%, transparent 0deg, rgba(255,255,255,0.1) 2deg, transparent 4deg)',
                            opacity: 0.3,
                            mixBlendMode: 'screen'
                        }} />

                        {/* Glossy Top Shine */}
                        <div style={{
                            position: 'absolute', top: 0, left: '20%', right: '20%', height: '150px',
                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 100%)',
                            filter: 'blur(20px)',
                            borderRadius: '50%'
                        }} />
                    </div>
                </div>
            </div>
        );
    }


    // 10. NORTHERN LIGHTS - Standalone Intense Aurora (NO PLANET - REALISTIC CURTAINS)
    if (mode === 'northern-lights') {
        const starColor = '#E0FFFF';

        return (
            <div style={overlayStyle}>
                {/* 1. Deep Night Sky Background */}
                <div style={{ position: 'absolute', inset: 0, background: '#020205', zIndex: 0 }} />

                {/* Stars */}
                {starSettings?.enabled && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                        {React.useMemo(() => [...Array(80)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    width: Math.random() * 2 + 1 + 'px',
                                    height: Math.random() * 2 + 1 + 'px',
                                    background: starColor,
                                    borderRadius: '50%',
                                    top: Math.random() * 100 + '%',
                                    left: Math.random() * 100 + '%',
                                    opacity: Math.random() * 0.7 + 0.3,
                                    boxShadow: `0 0 ${Math.random() * 3 + 1}px ${starColor}`,
                                    animation: `twinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 5}s`
                                }}
                            />
                        )), [])}
                    </div>
                )}

                {/* THE AURORA BOREALIS - Full Sky Curtains */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', mixBlendMode: 'screen', overflow: 'hidden'
                }}>
                    <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                        <defs>
                            <filter id="aurora-curtains">
                                {/* Vertical stretch for curtain look */}
                                <feTurbulence type="fractalNoise" baseFrequency="0.002 0.04" numOctaves="3" result="noise" />
                                {/* Extreme horizontal displacement to shred it into curtains */}
                                <feDisplacementMap in="SourceGraphic" in2="noise" scale="200" xChannelSelector="R" yChannelSelector="G" />
                                <feGaussianBlur stdDeviation="8" />
                            </filter>
                        </defs>
                    </svg>

                    {/* Layer 1: Purple/Blue Deep Atmosphere wash */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'linear-gradient(to top, rgba(90, 63, 255, 0.1) 0%, rgba(27, 130, 255, 0.0) 50%, rgba(90, 63, 255, 0.4) 100%)',
                        filter: 'blur(30px)', opacity: 0.8
                    }} />

                    {/* Layer 2: Main Green Ribbon (Wavy Curtains) */}
                    <div style={{
                        position: 'absolute', top: '-20%', left: '-20%', right: '-20%', bottom: '-20%',
                        transform: 'perspective(500px) rotateX(10deg) skewY(-5deg)',
                        filter: 'url(#aurora-curtains) brightness(1.4)',
                        // Vertical Stripes = Curtains
                        background: 'repeating-linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1) 5%, rgba(0, 255, 136, 0.8) 15%, rgba(127, 255, 212, 0.5) 25%, transparent 35%, transparent 60%)',
                        opacity: 0.9,
                        mixBlendMode: 'normal'
                    }} />

                    {/* Layer 3: Secondary Curtains (Offset) */}
                    <div style={{
                        position: 'absolute', top: '20%', left: '-20%', right: '-20%', bottom: '-20%',
                        transform: 'perspective(500px) rotateX(20deg) skewY(2deg)',
                        filter: 'url(#aurora-curtains) hue-rotate(30deg)',
                        background: 'repeating-linear-gradient(90deg, transparent, transparent 30%, rgba(0, 255, 136, 0.5) 45%, transparent 60%)',
                        opacity: 0.7, mixBlendMode: 'screen'
                    }} />

                    {/* Layer 4: Pink Ionization Spikes */}
                    <div style={{
                        position: 'absolute', top: '-10%', left: '-10%', right: '-10%', bottom: '0',
                        transform: 'perspective(500px) rotateX(15deg) skewY(-2deg)',
                        filter: 'url(#aurora-curtains) blur(2px)',
                        background: 'repeating-linear-gradient(90deg, transparent, transparent 40%, rgba(255, 42, 109, 0.7) 42%, transparent 45%, transparent 80%, rgba(255, 42, 109, 0.6) 82%, transparent 85%)',
                        opacity: 1, mixBlendMode: 'screen'
                    }} />

                    {/* Layer 5: Bright White Bottom Definition */}
                    <div style={{
                        position: 'absolute', bottom: '10%', left: '-20%', right: '-20%', height: '30%',
                        filter: 'blur(15px)',
                        background: 'radial-gradient(ellipse at 50% 100%, rgba(127, 255, 212, 0.4) 0%, transparent 60%)',
                        opacity: 0.6, mixBlendMode: 'overlay'
                    }} />
                </div>
            </div>
        );
    }




    // 1. CYBERPUNK LINES - Futurstic HUD style
    if (mode === 'cyberpunkLines') {
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 255, 255';
        };
        const colorRgb = hexToRgb(color);

        return (
            <div style={overlayStyle}>
                {/* Tech Background Grid (Subtle) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(${colorRgb}, 0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(${colorRgb}, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)'
                }} />

                {/* SVG HUD Frame */}
                <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Top Left Bracket */}
                    <path d="M10,40 V10 H40" fill="none" stroke={color} strokeWidth="2" filter="url(#glow)" />
                    <circle cx="10" cy="10" r="2" fill={color} filter="url(#glow)" />

                    {/* Top Right Bracket */}
                    <path d="Mcalc(100% - 40),10 Hcalc(100% - 10) V40" fill="none" stroke={color} strokeWidth="2" filter="url(#glow)" />
                    <circle cx="calc(100% - 10)" cy="10" r="2" fill={color} filter="url(#glow)" />

                    {/* Bottom Left Bracket */}
                    <path d="M10,calc(100% - 40) Vcalc(100% - 10) H40" fill="none" stroke={color} strokeWidth="2" filter="url(#glow)" />
                    <circle cx="10" cy="calc(100% - 10)" r="2" fill={color} filter="url(#glow)" />

                    {/* Connecting Data Lines - Thin & Low Opacity */}
                    <path d="M60,10 Hcalc(100% - 60)" stroke={color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5 5" />
                    <path d="M10,60 Vcalc(100% - 60)" stroke={color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5 5" />
                    <path d="Mcalc(100% - 10),60 Vcalc(100% - 60)" stroke={color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5 5" />

                    {/* Decorative Circuit Nodes */}
                    <circle cx="50" cy="20" r="1.5" fill={color} fillOpacity="0.5" />
                    <circle cx="70" cy="20" r="1.5" fill={color} fillOpacity="0.5" />
                    <line x1="50" y1="20" x2="80" y2="20" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
                </svg>

                {/* Central Pulse */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '60%', height: '60%',
                    background: `radial-gradient(circle, rgba(${colorRgb}, 0.1) 0%, transparent 70%)`,
                    animation: 'gentlePulse 4s infinite ease-in-out'
                }} />
                <style>{`@keyframes gentlePulse { 0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); } }`}</style>
            </div>
        );
    }

    // 2. NEON GRID - Retrowave
    if (mode === 'neonGrid') {
        return (
            <div style={overlayStyle}>
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(to top, ${color}20 0%, transparent 60%)`
                }} />
                {/* Grid */}
                <div style={{
                    position: 'absolute',
                    inset: '-50% -50%',
                    width: '200%',
                    height: '200%',
                    backgroundImage: `
                        linear-gradient(${color}40 1px, transparent 1px),
                        linear-gradient(90deg, ${color}40 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    transform: 'perspective(300px) rotateX(60deg) translateY(-100px) translateZ(-100px)',
                    animation: 'gridScroll 20s linear infinite',
                    opacity: 0.5,
                    maskImage: 'linear-gradient(to top, black 20%, transparent 80%)'
                }} />
                <style>{`@keyframes gridScroll { from { background-position: 0 0; } to { background-position: 0 40px; } }`}</style>
            </div>
        );
    }

    // 3. UNDERWATER - Classic Mario Atmospheric Depth
    if (mode === 'underwaterY2K') {
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 255, 255';
        };
        const colorRgb = hexToRgb(color);

        return (
            <div style={overlayStyle}>
                {/* 1. Base Gradient: Lighter Top -> Deep Dark Bottom */}
                <div style={{
                    position: 'absolute', inset: 0,
                    // Linear gradient from theme color (mixed with light) to deep black-mix
                    background: `linear-gradient(to bottom, 
                        rgba(${colorRgb}, 0.6) 0%, 
                        rgba(${colorRgb}, 0.3) 40%, 
                        rgba(0,0,0,0.8) 100%)`,
                    backgroundColor: '#000', // Fallback base
                    zIndex: 1
                }} />

                {/* 2. Surface Water Glow (The top "waterline" effect) */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '30%',
                    background: `linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 100%)`,
                    filter: 'blur(10px)',
                    zIndex: 2,
                    mixBlendMode: 'screen'
                }} />

                {/* 3. Caustic Light Pattern (The "swimming pool" reflection look) - STATIC */}
                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: 0.15,
                    backgroundImage: `
                        radial-gradient(circle at 50% 50%, white 0%, transparent 10%),
                        radial-gradient(circle at 20% 40%, white 0%, transparent 10%),
                        radial-gradient(circle at 80% 60%, white 0%, transparent 10%),
                        radial-gradient(circle at 40% 10%, white 0%, transparent 15%),
                        radial-gradient(circle at 70% 80%, white 0%, transparent 12%)
                    `,
                    backgroundSize: '120px 120px', // Repeating pattern size
                    backgroundRepeat: 'repeat',
                    mixBlendMode: 'overlay',
                    filter: 'blur(5px)',
                    zIndex: 2
                }} />

                {/* 4. Deep Depth Vignette (Darkens the corners and bottom heavily) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at 50% 0%, transparent 40%, #000 120%)',
                    zIndex: 3,
                    opacity: 0.7
                }} />

                {/* 5. Subtle Wavy Distortion Overlay (Simulated via repeating gradient) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: 0.05,
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 20px)`,
                    filter: 'blur(20px)',
                    mixBlendMode: 'overlay',
                    zIndex: 2
                }} />

                {/* 6. Soft Light Rays (Diagonal, top-left to center) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `
                        linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%),
                        linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.03) 30%, transparent 40%)
                    `,
                    mixBlendMode: 'screen',
                    zIndex: 3
                }} />

            </div>
        );
    }



    if (mode === 'simple_gradient') {
        return (
            <div style={{
                ...overlayStyle,
                background: `linear-gradient(to bottom, #000000 0%, #111111 40%, ${color} 100%)`
            }} />
        )
    }

    if (mode === 'nebula') {
        return (
            <div style={{ ...overlayStyle, background: 'radial-gradient(circle at 50% 120%, #4a148c 0%, transparent 60%), radial-gradient(circle at 80% 20%, #311b92 0%, transparent 50%)', opacity: 0.6 }} />
        );
    }

    // 4. ORBITAL - Signature PanoSpace Cosmic Aesthetic
    if (mode === 'orbital') {
        const spaceColors = {
            deepVoid: '#050B14', // Darker than dark nebula
            nebulaDark: '#0A1A3A',
            ionBlue: '#1B82FF',
            auroraMint: '#8CFFE9',
            starlight: '#F2F7FA'
        };

        return (
            <div style={overlayStyle}>
                {/* 1. Deep Space Void Background */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(to bottom, ${spaceColors.nebulaDark} 0%, ${spaceColors.deepVoid} 100%)`,
                    zIndex: 0
                }} />

                {/* 2. The Planetary Horizon (Massive Atmospheric Glow) */}
                {/* This curves upward from the bottom, framing the content area */}
                <div style={{
                    position: 'absolute',
                    bottom: '-150%', left: '-20%', right: '-20%', height: '200%',
                    background: `radial-gradient(ellipse at 50% 0%, ${spaceColors.auroraMint} 0%, ${spaceColors.ionBlue} 20%, transparent 60%)`,
                    opacity: 0.6,
                    filter: 'blur(60px)',
                    zIndex: 1,
                    mixBlendMode: 'screen'
                }} />

                {/* 3. Orbital Ring Segment (Geometric Arc) */}
                <div style={{
                    position: 'absolute',
                    bottom: '-80%', left: '-10%', right: '-10%', height: '100%',
                    borderRadius: '50%',
                    borderTop: `1px solid ${spaceColors.starlight}`,
                    boxShadow: `0 -2px 20px ${spaceColors.ionBlue}`,
                    opacity: 0.4,
                    transform: 'scaleY(0.4)', // Flatten to look like a ring
                    zIndex: 2
                }} />

                {/* 4. Secondary Ring (Fainter, Mint) */}
                <div style={{
                    position: 'absolute',
                    bottom: '-78%', left: '-5%', right: '-5%', height: '100%',
                    borderRadius: '50%',
                    borderTop: `1px solid ${spaceColors.auroraMint}`,
                    opacity: 0.2,
                    transform: 'scaleY(0.4)',
                    zIndex: 2
                }} />

                {/* 5. Cosmic Dust / Noise Texture */}
                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: 0.15,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay',
                    zIndex: 3
                }} />

                {/* 6. Distant Star/Lens Flare Highlights */}
                <div style={{
                    position: 'absolute', top: '20%', right: '15%',
                    width: '2px', height: '2px',
                    background: 'white',
                    boxShadow: `0 0 10px 2px white, 0 0 20px 10px ${spaceColors.ionBlue}`,
                    borderRadius: '50%',
                    zIndex: 2,
                    opacity: 0.8
                }} />
                <div style={{
                    position: 'absolute', top: '40%', left: '10%',
                    width: '1px', height: '1px',
                    background: 'white',
                    boxShadow: `0 0 8px 1px ${spaceColors.auroraMint}`,
                    borderRadius: '50%',
                    zIndex: 2,
                    opacity: 0.6
                }} />

            </div>
        );
    }



    // 4. PANO OCEAN - Signature Deep Sea Palette
    if (mode === 'ocean_depths') {
        const panospaceColors = {
            iceWhite: '#F2F7FA',
            auroraBlue: '#7FDBFF',
            classicMint: '#7FFFD4',
            auroraMint: '#8CFFE9',
            ionBlue: '#1B82FF',
            darkNebula: '#0A1A3A',
            black: '#000000'
        };

        return (
            <div style={overlayStyle}>
                {/* 1. Base Gradient: Aggressively Top-Heavy for Text Readability */}
                <div style={{
                    position: 'absolute', inset: 0,
                    // Ellipse flattens the light so it doesn't reach down to the username
                    background: `radial-gradient(ellipse at 50% 0%, 
                        ${panospaceColors.iceWhite} 0%, 
                        ${panospaceColors.auroraBlue} 5%, 
                        ${panospaceColors.classicMint} 15%, 
                        ${panospaceColors.ionBlue} 25%, 
                        ${panospaceColors.darkNebula} 50%, 
                        ${panospaceColors.black} 100%)`,
                    zIndex: 1
                }} />

                {/* 2. Turbulent Water Texture (Restricted to Top Only) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: 0.3,
                    mixBlendMode: 'overlay',
                    backgroundImage: `
                        radial-gradient(circle at 20% 10%, ${panospaceColors.classicMint} 0%, transparent 30%),
                        radial-gradient(circle at 80% 15%, ${panospaceColors.auroraBlue} 0%, transparent 25%),
                        radial-gradient(circle at 50% 5%, ${panospaceColors.iceWhite} 0%, transparent 20%)
                    `,
                    filter: 'blur(30px)',
                    zIndex: 2,
                    transform: 'scaleY(0.8)'
                }} />



                {/* 4. Deep Depth Vignette (Dark Nebular + Black) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(circle at 50% 0%, transparent 40%, ${panospaceColors.black} 120%)`,
                    zIndex: 3,
                    opacity: 0.8
                }} />

                {/* 5. Subtle Wavy Distortion (Mint tinted) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: 0.1,
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${panospaceColors.auroraMint} 10px, ${panospaceColors.auroraMint} 20px)`,
                    filter: 'blur(20px)',
                    mixBlendMode: 'overlay',
                    zIndex: 2
                }} />

                {/* 6. Realistic Scattered Light Beams (Green Mint Only, Thin, Spread) */}
                <div style={{
                    position: 'absolute', inset: '-50%', // Oversize to allow rotation without edges
                    background: `repeating-conic-gradient(
                        from 0deg at 50% -20%, 
                        transparent 0deg, 
                        transparent 10deg, 
                        ${panospaceColors.auroraMint} 15deg, 
                        transparent 20deg
                    )`,
                    opacity: 0.15, // Dim beams
                    filter: 'blur(8px)', // Soften edges
                    mixBlendMode: 'overlay', // Realistic blending
                    zIndex: 3,
                    transform: 'rotate(-10deg) scale(1.5)' // Angle and spread
                }} />

                {/* 7. Secondary Faint Rays for texture */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `repeating-linear-gradient(
                        100deg, 
                        transparent, 
                        transparent 40px, 
                        ${panospaceColors.auroraMint} 42px, 
                        transparent 45px
                    )`,
                    opacity: 0.05,
                    filter: 'blur(2px)',
                    mixBlendMode: 'overlay',
                    zIndex: 2
                }} />

            </div>
        );
    }




    return null;
};

export default BannerThemeRenderer;
