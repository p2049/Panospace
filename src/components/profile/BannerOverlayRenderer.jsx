import React from 'react';
import { BANNER_OVERLAYS } from '@/core/constants/bannerOverlays';

/**
 * BannerOverlayRenderer
 * Implements the Visual Overlay (Lens) system.
 * Applies display and capture simulations to the banner background.
 */
const BannerOverlayRenderer = ({ overlays = [], children }) => {
    if (!overlays || overlays.length === 0) return children;

    // Filter out invalid or duplicate overlays (limit to 2 as per system rules)
    const activeOverlays = overlays
        .filter(Boolean)
        .slice(0, 2)
        .map(ov => typeof ov === 'string' ? BANNER_OVERLAYS.find(o => o.id === ov) : ov)
        .filter(Boolean);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {/* The actual banner content */}
            <div style={{ position: 'absolute', inset: 0 }}>
                {children}
            </div>

            {/* Overlay Layers */}
            {activeOverlays.map((ov, index) => (
                <OverlayLayer key={`${ov.id}-${index}`} overlay={ov} />
            ))}
        </div>
    );
};

const OverlayLayer = ({ overlay }) => {
    const { id } = overlay;

    // Common style for full-cover overlays
    const fullCoverStyle = {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10 + BANNER_OVERLAYS.findIndex(o => o.id === id) // Dynamic z-stacking based on definition order
    };

    switch (id) {
        case 'crt_signal':
            return (
                <>
                    {/* Scanlines */}
                    <div style={{
                        ...fullCoverStyle,
                        background: 'linear-gradient(rgba(18, 16, 16, 0.1) 50%, rgba(0, 0, 0, 0.2) 50%)',
                        backgroundSize: '100% 4px',
                        mixBlendMode: 'multiply',
                        opacity: 0.4
                    }} />
                    {/* RGB Subpixel Mask (Simulated with fine noise) */}
                    <div style={{
                        ...fullCoverStyle,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='2' height='6' fill='rgba(255,0,0,0.05)'/%3E%3Crect x='2' width='2' height='6' fill='rgba(0,255,0,0.05)'/%3E%3Crect x='4' width='2' height='6' fill='rgba(0,0,255,0.05)'/%3E%3C/svg%3E")`,
                        backgroundSize: '3px 100%',
                        mixBlendMode: 'screen'
                    }} />
                    {/* Chromatic Aberration & Slight Bloom */}
                    <div style={{
                        ...fullCoverStyle,
                        backdropFilter: 'blur(0.5px)',
                        filter: 'contrast(1.1) brightness(1.1)',
                        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.2)'
                    }} />
                </>
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
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`,
                    opacity: 0.4,
                    mixBlendMode: 'screen',
                    filter: 'contrast(1.2) brightness(1.1)',
                    animation: 'ps2ShadowCrawl 2s steps(4) infinite'
                }}>
                    <style>{`
                        @keyframes ps2ShadowCrawl {
                            0% { transform: translate(0,0); }
                            25% { transform: translate(1px,-1px); }
                            50% { transform: translate(-1px,1px); }
                            75% { transform: translate(1px,1px); }
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
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay',
                    opacity: 0.3
                }} />
            );

        case 'monochrome':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backdropFilter: 'grayscale(1) contrast(1.1)',
                    filter: 'grayscale(1) contrast(1.2) brightness(0.95)'
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

        default:
            return null;
    }
};

export default BannerOverlayRenderer;
