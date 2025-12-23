import React from 'react';
import { BANNER_OVERLAYS } from '../../core/constants/bannerOverlays';

/**
 * BannerOverlayRenderer
 * Implements the Visual Overlay (Lens) system.
 * Applies display and capture simulations to the banner background.
 */
const BannerOverlayRenderer = ({ overlays = [], monochromeColor, children }) => {
    if (!overlays || overlays.length === 0) return children;

    // Filter out invalid or duplicate overlays (limit to 2 as per system rules)
    const activeOverlays = overlays
        .filter(Boolean)
        .slice(0, 2)
        .map(ov => typeof ov === 'string' ? BANNER_OVERLAYS.find(o => o.id === ov) : ov)
        .filter(Boolean);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
            {/* The actual banner content */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                {children}
            </div>

            {/* Overlay Layers */}
            {activeOverlays.map((ov, index) => (
                <OverlayLayer key={`${ov.id}-${index}`} overlay={ov} index={index} monochromeColor={monochromeColor} />
            ))}
        </div>
    );
};

const OverlayLayer = ({ overlay, index, monochromeColor }) => {
    const { id } = overlay;

    // Common style for full-cover overlays
    // We use high base zIndex to ensure we stay above any theme-specific layers
    const fullCoverStyle = {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100 + index // Guaranteed to be above content
    };

    switch (id) {
        case 'crt_signal':
            return (
                <>
                    {/* Scanlines */}
                    <div style={{
                        ...fullCoverStyle,
                        background: 'linear-gradient(rgba(18, 16, 16, 0.15) 50%, rgba(0, 0, 0, 0.3) 50%)',
                        backgroundSize: '100% 4px',
                        mixBlendMode: 'multiply',
                        opacity: 0.6
                    }} />
                    {/* RGB Subpixel Mask */}
                    <div style={{
                        ...fullCoverStyle,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='2' height='6' fill='rgba(255,0,0,0.1)'/%3E%3Crect x='2' width='2' height='6' fill='rgba(0,255,0,0.1)'/%3E%3Crect x='4' width='2' height='6' fill='rgba(0,0,255,0.1)'/%3E%3C/svg%3E")`,
                        backgroundSize: '3px 100%',
                        mixBlendMode: 'screen',
                        opacity: 0.7
                    }} />
                    {/* Chromatic Aberration & Slight Bloom */}
                    <div style={{
                        ...fullCoverStyle,
                        backdropFilter: 'blur(0.8px)',
                        filter: 'contrast(1.2) brightness(1.1) saturate(1.1)',
                        boxShadow: 'inset 0 0 120px rgba(0,0,0,0.3)'
                    }} />
                </>
            );

        case 'signal_degradation':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.01 0.4' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay',
                    opacity: 0.4,
                    filter: 'hue-rotate(5deg) contrast(1.1)'
                }} />
            );

        case 'standard_digital':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'rgba(0, 100, 255, 0.03)', // Cool bias
                    filter: 'contrast(1.05) brightness(1.02) saturate(0.95)',
                    backdropFilter: 'contrast(1.1) brightness(1.05)', // Clipper feel
                }} />
            );

        case 'limited_range':
            return (
                <div style={{
                    ...fullCoverStyle,
                    filter: 'contrast(1.4) brightness(0.9) saturate(1.1)',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent 40%, rgba(0,0,0,0.2) 90%)',
                    mixBlendMode: 'soft-light'
                }} />
            );

        case 'warm_light':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'rgba(255, 180, 50, 0.12)',
                    mixBlendMode: 'overlay',
                    filter: 'sepia(0.2) saturate(1.1)'
                }} />
            );

        case 'cool_light':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'rgba(50, 200, 255, 0.1)',
                    mixBlendMode: 'overlay',
                    filter: 'hue-rotate(-10deg) saturate(0.9)'
                }} />
            );

        case 'high_gain':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`,
                    opacity: 0.5,
                    mixBlendMode: 'screen',
                    filter: 'contrast(1.2) brightness(1.2)',
                    animation: 'retroShadowCrawl 0.2s steps(2) infinite'
                }}>
                    <style>{`
                        @keyframes retroShadowCrawl {
                            0% { transform: translate(0,0); background-position: 0 0; }
                            50% { transform: translate(1px,-1px); background-position: 5px 5px; }
                            100% { transform: translate(-1px,1px); background-position: -5px -5px; }
                        }
                    `}</style>
                </div>
            );

        case 'soft_optics':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backdropFilter: 'blur(1.5px)',
                    filter: 'contrast(0.9) brightness(1.05)',
                    opacity: 0.8
                }} />
            );

        case 'bloom_optical':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backdropFilter: 'blur(8px) brightness(1.2)',
                    maskImage: 'radial-gradient(circle at center, transparent 30%, black 100%)',
                    mixBlendMode: 'screen',
                    opacity: 0.5
                }} />
            );

        case 'noise_material':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay',
                    opacity: 0.35
                }} />
            );

        case 'monochrome':
            // If color is present, we do a tint map.
            // 1. Grayscale the background.
            // 2. Overlay color with Screen (for shadows->color) or Multiply (for highlights->color)?
            // Standard "Tint": Grayscale -> Multiply with Color.
            return (
                <div style={{
                    ...fullCoverStyle,
                    backdropFilter: 'grayscale(1) contrast(1.1)',
                    filter: 'grayscale(1) contrast(1.2) brightness(0.95)',
                    // If color provided, mix it in
                    backgroundColor: monochromeColor || 'transparent',
                    mixBlendMode: monochromeColor ? 'hard-light' : 'normal' // hard-light or overlay works well for tint
                }} />
            );

        case 'vignette_optical':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.5) 150%)',
                    mixBlendMode: 'multiply'
                }} />
            );

        case 'healing_silk':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backdropFilter: 'blur(12px) saturate(1.1)',
                    background: 'radial-gradient(circle at center, rgba(255,200,200,0.05), rgba(200,200,255,0.05))',
                    mixBlendMode: 'soft-light',
                    opacity: 0.8
                }} />
            );
        case 'grain':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grainy'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grainy)' opacity='1'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'soft-light',
                    opacity: 0.8,
                    filter: 'contrast(1.4) brightness(1.05) sepia(0.05)',
                    pointerEvents: 'none'
                }} />
            );

        case 'film_flare':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: `
                        radial-gradient(circle at -10% -10%, rgba(255, 80, 0, 0.2) 0%, transparent 60%),
                        radial-gradient(circle at 110% 110%, rgba(0, 120, 255, 0.15) 0%, transparent 60%),
                        radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.1) 0%, transparent 30%)
                    `,
                    mixBlendMode: 'screen',
                    opacity: 0.85
                }}>
                    {/* Anamorphic Horizontal Flare */}
                    <div style={{
                        position: 'absolute',
                        top: '42%',
                        left: '-20%',
                        width: '140%',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(135, 206, 250, 0.6) 50%, transparent 100%)',
                        boxShadow: '0 0 20px 2px rgba(72, 191, 248, 0.4)',
                        filter: 'blur(1.5px)',
                        opacity: 0.8,
                        transform: 'rotate(-1.5deg)'
                    }} />
                    {/* Warm Vertical Light Leak */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '12%',
                        width: '25%',
                        height: '100%',
                        background: 'linear-gradient(to right, transparent, rgba(255, 100, 0, 0.08), transparent)',
                        filter: 'blur(30px)',
                        opacity: 0.6
                    }} />
                </div>
            );

        // --- NEW GRADES ---
        case 'grade_magma':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'linear-gradient(to bottom, rgba(255, 69, 0, 0.2), rgba(139, 0, 0, 0.4))',
                    mixBlendMode: 'overlay',
                    filter: 'contrast(1.3) sepia(0.4) saturate(1.5)'
                }} />
            );

        case 'grade_teal':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'radial-gradient(circle at 50% 50%, transparent, rgba(0, 50, 60, 0.5))',
                    mixBlendMode: 'hard-light',
                    filter: 'sepia(0.3) hue-rotate(150deg) saturate(0.8) contrast(1.1)'
                }} />
            );



        case 'grade_nostalgia':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'radial-gradient(circle, rgba(255, 220, 180, 0.1), rgba(180, 140, 100, 0.15))',
                    backdropFilter: 'sepia(0.15) contrast(0.95)',
                    mixBlendMode: 'soft-light',
                    opacity: 0.7
                }} />
            );

        case 'film_slide':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Positive Film: Cool shadows, punchy greens/magentas
                    background: 'linear-gradient(to bottom right, rgba(0, 255, 128, 0.1), rgba(128, 0, 128, 0.15))',
                    filter: 'contrast(1.2) saturate(1.5)',
                    mixBlendMode: 'overlay'
                }} />
            );

        case 'film_print':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'contrast(0.95) brightness(1.05)',
                    filter: 'sepia(0.05) saturate(0.9)',
                    mixBlendMode: 'screen',
                    opacity: 0.6
                }} />
            );

        case 'film_instant':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'radial-gradient(circle, rgba(255, 240, 200, 0.1), rgba(0,0,20, 0.2))',
                    backdropFilter: 'sepia(0.2) contrast(1.1)',
                    filter: 'brightness(1.1) saturate(0.8)',
                    mixBlendMode: 'hard-light'
                }} />
            );

        default:
            return null;
    }
};

export default BannerOverlayRenderer;
