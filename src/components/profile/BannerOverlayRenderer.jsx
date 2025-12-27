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

    // Check for pixelation overlay
    const pixelOverlay = activeOverlays.find(o => o.id === 'capture_pixel');

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
            {/* The actual banner content */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                filter: pixelOverlay ? `url(#pixelate-filter)` : undefined
            }}>
                {children}
            </div>

            {/* Pixelation Filter Definition */}
            {pixelOverlay && (
                <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
                    <defs>
                        <filter id="pixelate-filter" x="0" y="0">
                            <feFlood x="2" y="2" height="1" width="1" />
                            <feComposite width="4" height="4" />
                            <feTile result="a" />
                            <feComposite in="SourceGraphic" in2="a" operator="in" />
                            <feMorphology operator="dilate" radius="2" />
                        </filter>
                    </defs>
                </svg>
            )}

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

        case 'grade_blueprint':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'rgba(0, 50, 255, 0.2)',
                    mixBlendMode: 'exclusion',
                    filter: 'invert(0.8) sepia(1) hue-rotate(180deg) saturate(1.5) contrast(1.2) brightness(0.9)',
                }} />
            );

        case 'grade_infra':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'rgba(255,0,0,0.1)',
                    mixBlendMode: 'difference',
                    filter: 'invert(1) contrast(1.5) saturate(0) brightness(1.2)',
                }} />
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

        case 'display_glitch':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backgroundImage: `linear-gradient(90deg, rgba(255,0,0,0.4), rgba(0,255,0,0.1), rgba(0,0,255,0.4))`,
                    backgroundSize: '4px 2px',
                    mixBlendMode: 'exclusion',
                    filter: 'contrast(1.5)',
                    opacity: 0.5,
                    transform: 'scale(1.02)'
                }} />
            );

        case 'display_interlace':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.4) 2px)',
                    backgroundSize: '100% 3px',
                    zIndex: 110,
                    pointerEvents: 'none'
                }} />
            );

        case 'display_matrix':
            return (
                <div style={{
                    ...fullCoverStyle,
                    fontFamily: 'monospace',
                    background: 'linear-gradient(0deg, rgba(127, 255, 212, 0.1) 20%, transparent 80%)',
                    mixBlendMode: 'screen',
                    filter: 'contrast(1.2) drop-shadow(0 0 5px rgba(127, 255, 212, 0.3))'
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='5' y='15' fill='rgba(127, 255, 212, 0.15)' font-family='monospace' font-size='10' font-weight='bold'%3E1%3C/text%3E%3Ctext x='15' y='5' fill='rgba(127, 255, 212, 0.1)' font-family='monospace' font-size='10' font-weight='bold'%3E0%3C/text%3E%3C/svg%3E")`,
                        opacity: 0.6
                    }} />
                </div>
            );

        case 'display_hologram':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backgroundImage: `
                        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    boxShadow: 'inset 0 0 60px rgba(0, 255, 255, 0.2)',
                    mixBlendMode: 'screen',
                    filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.4))'
                }} />
            );

        case 'display_vhs':
            return (
                <div style={{
                    ...fullCoverStyle,
                    filter: 'contrast(1.1) saturate(1.2) blur(0.5px)',
                    mixBlendMode: 'overlay'
                }}>
                    {/* Color Bleed */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, rgba(255,0,0,0.1), rgba(0,255,0,0.05), rgba(0,0,255,0.1))',
                        mixBlendMode: 'screen',
                        transform: 'translateX(2px)'
                    }} />
                    {/* Tracking Lines */}
                    <div style={{
                        position: 'absolute',
                        bottom: '5%',
                        left: 0,
                        width: '100%',
                        height: '2px',
                        background: 'rgba(255,255,255,0.5)',
                        boxShadow: '0 0 4px rgba(255,255,255,0.8)',
                        opacity: 0.5
                    }} />
                </div>
            );

        case 'display_halftone':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.8) 1px, transparent 1.5px)`,
                    backgroundSize: '4px 4px',
                    mixBlendMode: 'overlay',
                    opacity: 0.4,
                    filter: 'contrast(1.2)'
                }} />
            );

        case 'display_handheld_dm':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Olive Green Tint
                    background: 'rgba(130, 140, 20, 0.4)',
                    mixBlendMode: 'hard-light',
                    filter: 'grayscale(1) contrast(1.2) brightness(0.9)',
                }}>
                    {/* Dot Matrix Grid */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `radial-gradient(circle, rgba(0,20,0,0.6) 1.5px, transparent 2px)`,
                        backgroundSize: '4px 4px',
                        mixBlendMode: 'multiply',
                        opacity: 0.8
                    }} />
                    {/* LCD Shadow */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        case 'display_vga':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Cool gray bias + dithering
                    filter: 'contrast(1.1) brightness(1.1) saturate(0.8)',
                }}>
                    {/* Shadow Mask (Checkerboard) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.1)),
                            linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.1))
                        `,
                        backgroundPosition: '0 0, 2px 2px',
                        backgroundSize: '4px 4px',
                        mixBlendMode: 'multiply'
                    }} />
                    {/* Scanlines */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 50%)',
                        backgroundSize: '100% 4px',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        case 'display_web_safe':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Posterize Logic simulation
                    filter: 'contrast(1.3) brightness(1.1) saturate(1.2)',
                }}>
                    {/* Bayer Dither Pattern */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            linear-gradient(45deg, rgba(0,0,0,0.5) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.5)),
                            linear-gradient(45deg, rgba(0,0,0,0.5) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.5))
                        `,
                        backgroundPosition: '0 0, 1px 1px',
                        backgroundSize: '2px 2px',
                        mixBlendMode: 'overlay',
                        opacity: 0.5
                    }} />
                </div>
            );

        case 'display_bit_rot':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Deep Fried
                    filter: 'contrast(2.0) saturate(1.5)',
                }}>
                    {/* Macroblocking Simulation */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                        backgroundSize: '8px 8px', // Chunky blocks
                        mixBlendMode: 'overlay'
                    }} />
                    {/* Color Banding noise */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'repeating-linear-gradient(45deg, rgba(255,0,0,0.05), rgba(0,0,255,0.05) 10px, transparent 20px)',
                        mixBlendMode: 'screen'
                    }} />
                </div>
            );

        case 'display_red_zone':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Deep Red Monochrome
                    background: 'rgba(255, 0, 0, 0.1)',
                    mixBlendMode: 'multiply',
                    filter: 'grayscale(1) contrast(1.5) brightness(0.8) drop-shadow(0 0 5px rgba(255,0,0,0.5))',
                }}>
                    {/* Scanlines for the HMD look */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 50%, transparent 50%)',
                        backgroundSize: '100% 4px',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        case 'display_engine_v2':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backdropFilter: 'blur(0.5px) contrast(1.1)',
                }}>
                    {/* 480i Interlace Lines */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 2px)',
                        backgroundSize: '100% 2px',
                        pointerEvents: 'none'
                    }} />
                    {/* Ethereal System Fog (Midnight Blue) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 50% 120%, rgba(0, 50, 100, 0.4), transparent 70%)',
                        mixBlendMode: 'screen'
                    }} />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,20,0.2), rgba(0,0,0,0.5))',
                        mixBlendMode: 'multiply'
                    }} />
                </div>
            );

        case 'display_pocket_32':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Gamma boost for "reflective screen" look
                    filter: 'contrast(1.15) brightness(1.1) saturate(1.3)',
                }}>
                    {/* LCD Pixel Grid */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px),
                            linear-gradient(0deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '3px 3px', // 240x160ish feel
                        pointerEvents: 'none',
                        mixBlendMode: 'multiply'
                    }} />
                    {/* Reflective Sheen */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(120deg, rgba(255,255,255,0.05) 0%, transparent 40%)',
                        mixBlendMode: 'screen'
                    }} />
                </div>
            );

        case 'display_arcade_8':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Arcade Bloom: Punchy saturation and brightness
                    filter: 'contrast(1.25) saturate(1.4) brightness(1.1)',
                }}>
                    {/* Shadow Mask (Phosphor Dots) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 120%)`,
                        backgroundSize: '3px 3px',
                        mixBlendMode: 'hard-light',
                        opacity: 0.6
                    }} />
                    {/* Sharp Scanlines */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.5) 50%)',
                        backgroundSize: '100% 3px',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        case 'display_vector':
            return (
                <div style={{
                    ...fullCoverStyle,
                    filter: 'contrast(1.3) brightness(0.9)',
                }}>
                    {/* Glowing Vector Grid */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            linear-gradient(rgba(0, 255, 100, 0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 255, 100, 0.15) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        boxShadow: 'inset 0 0 100px rgba(0,255,100,0.1)',
                        mixBlendMode: 'screen'
                    }} />
                    {/* Vector Beam Glow */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(0, 20, 10, 0.6) 100%)',
                        mixBlendMode: 'multiply'
                    }} />
                </div>
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
                }}>
                </div>
            );

        case 'capture_nightvision':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'radial-gradient(circle, transparent 40%, rgba(0,20,0,0.6) 100%), rgba(0,255,50,0.1)',
                    mixBlendMode: 'hard-light',
                    filter: 'contrast(1.4) brightness(1.1) grayscale(1) sepia(1) hue-rotate(50deg) saturate(3)',
                    boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,50,0,0.2) 2px)',
                        backgroundSize: '100% 3px',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        case 'capture_lidar':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Point cloud pattern: High contrast mint dots
                    backgroundImage: `radial-gradient(circle, rgba(127, 255, 212, 0.8) 1px, transparent 1.5px)`,
                    backgroundSize: '8px 8px',
                    // Hard mix to simulate projected laser data
                    mixBlendMode: 'hard-light',
                    // Strip color from reality to focus on the 'scan' data
                    backdropFilter: 'grayscale(1) contrast(1.1) brightness(0.9)',
                }}>
                    {/* Depth Falloff / Vignette */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 20, 30, 0.8) 100%)',
                        mixBlendMode: 'multiply'
                    }} />
                </div>
            );

        case 'optic_holofoil':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Iridescent Sheen
                    background: `
                        linear-gradient(115deg, 
                            transparent 20%, 
                            rgba(255,0,0,0.3) 25%, 
                            rgba(255,255,0,0.3) 30%, 
                            rgba(0,255,0,0.3) 35%, 
                            rgba(0,255,255,0.3) 40%, 
                            rgba(0,0,255,0.3) 45%, 
                            rgba(255,0,255,0.3) 50%,
                            transparent 55%
                        )
                    `,
                    backgroundSize: '300% 300%',
                    backgroundPosition: '0% 0%',
                    mixBlendMode: 'color-dodge',
                    opacity: 0.6,
                    filter: 'contrast(1.2)'
                }} />
            );

        case 'capture_minidv':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Cool digital WB + sharpening
                    filter: 'contrast(1.1) brightness(1.05) saturate(0.9) hue-rotate(-5deg)',
                }}>
                    {/* Digital Tape Dropouts (Horizontal Banding) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.03) 5px)',
                        backgroundSize: '100% 5px',
                        mixBlendMode: 'screen',
                        opacity: 0.5
                    }} />
                </div>
            );

        case 'capture_cctv':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Gritty monochrome security feed
                    filter: 'grayscale(1) contrast(1.4) brightness(0.9)',
                    mixBlendMode: 'luminosity'
                }}>
                    {/* Signal Noise */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
                        opacity: 0.5,
                        mixBlendMode: 'overlay'
                    }} />

                </div>
            );

        case 'capture_pixel':
            return null; // Effect applied via parent container filter

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
                    filter: 'contrast(1.1) brightness(1.1)', // Removed grayscale from self to allow color tint
                    // If color provided, mix it in
                    backgroundColor: monochromeColor || 'transparent',
                    mixBlendMode: monochromeColor ? 'color' : 'normal',
                    opacity: monochromeColor ? 0.8 : 1
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
                    mixBlendMode: 'overlay', // Changed from soft-light for better blending
                    opacity: 0.3, // Reduced from 0.8 to 0.3
                    filter: 'contrast(1.1) brightness(1.05) sepia(0.05)', // Reduced contrast from 1.4
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

        case 'optic_prism':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backdropFilter: 'blur(1px)',
                    // Simulated chromatic aberration via multi-shadow/gradient
                    background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(255,0,0,0.1) 62%, rgba(0,255,0,0.1) 64%, rgba(0,0,255,0.1) 66%)',
                    mixBlendMode: 'overlay',
                    filter: 'contrast(1.1) drop-shadow(-2px 0 0 rgba(255,0,0,0.3)) drop-shadow(2px 0 0 rgba(0,255,255,0.3))',
                    transform: 'scale(1.01)'
                }} />
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







        case 'grade_cyber_zone':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backdropFilter: 'contrast(1.2) brightness(1.1)',
                }}>
                    {/* The "Epcot" Blue Atmosphere */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0, 10, 50, 0.8) 0%, rgba(0, 100, 255, 0.4) 100%)',
                        mixBlendMode: 'hard-light'
                    }} />
                    {/* Industrial Truss Grid */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                        mixBlendMode: 'overlay',
                        opacity: 0.6
                    }} />
                    {/* CRT Glow Bloom */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.2), transparent 70%)',
                        mixBlendMode: 'screen'
                    }} />
                </div>
            );

        case 'grade_flux':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'linear-gradient(135deg, rgba(127, 255, 212, 0.25) 0%, rgba(100, 0, 255, 0.15) 100%)',
                    mixBlendMode: 'hard-light',
                    filter: 'contrast(1.1) saturate(1.1) drop-shadow(0 0 15px rgba(127, 255, 212, 0.3))',
                    backdropFilter: 'brightness(1.05)',
                    opacity: 0.9
                }}>
                </div>
            );

        case 'grade_deep_dive':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backdropFilter: 'contrast(1.1) brightness(0.9)',
                }}>
                    {/* Crush Shadows: Navy Blue Multiply */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(16, 0, 48, 0.4), rgba(0, 20, 40, 0.6))',
                        mixBlendMode: 'multiply'
                    }} />
                    {/* Electric Highlights: Cyan Color Dodge */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 50% 0%, rgba(0, 255, 255, 0.25), transparent 70%)',
                        mixBlendMode: 'color-dodge'
                    }} />
                </div>
            );

        case 'grade_bleach':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Silver Retention: High contrast, low saturation
                    filter: 'contrast(1.4) saturate(0.6) brightness(0.95)',
                    background: 'rgba(180, 190, 200, 0.2)', // Cool silver tint
                    mixBlendMode: 'overlay'
                }} />
            );



        case 'grade_x_process':
            return (
                <div style={{
                    ...fullCoverStyle,
                    mixBlendMode: 'overlay',
                    background: 'linear-gradient(to bottom right, rgba(0, 255, 100, 0.2), rgba(100, 0, 150, 0.3))',
                    filter: 'contrast(1.3) hue-rotate(-20deg) saturate(1.2)',
                }} />
            );

        case 'grade_anime':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // "Comix Wave" Style: High Saturation, Contrast, Soft Blur
                    filter: 'contrast(1.15) saturate(1.4) brightness(1.1)',
                }}>
                    {/* The "Glow" (Diffusion) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(3px)',
                        mixBlendMode: 'screen',
                        opacity: 0.6
                    }} />
                    {/* Sky Gradient Bias */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,100,255,0.1), transparent)',
                        mixBlendMode: 'soft-light'
                    }} />
                </div>
            );

        case 'grade_vaporwave':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'linear-gradient(to bottom right, rgba(255, 100, 200, 0.3), rgba(0, 255, 255, 0.3))',
                    mixBlendMode: 'soft-light',
                    filter: 'contrast(0.9) brightness(1.1) saturate(1.2)',
                    backdropFilter: 'blur(0.5px)'
                }} />
            );

        case 'grade_hyper_mint':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Clean up the image first
                    backdropFilter: 'grayscale(0.4) contrast(1.1) brightness(1.1)',
                }}>
                    {/* Tint Midtones: Soft Mint */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(127, 255, 212, 0.15)',
                        mixBlendMode: 'soft-light'
                    }} />
                    {/* Lift Highlights: Screen */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, transparent, rgba(127, 255, 212, 0.1))',
                        mixBlendMode: 'screen' // Lift highlights gently without destroying blacks
                    }} />
                </div>
            );

        // --- FUTURISTIC GRADES ---
        case 'grade_cyber_chrome':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'linear-gradient(135deg, rgba(230,240,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(100,200,255,0.2) 60%, rgba(200,240,255,0.3) 100%)',
                    mixBlendMode: 'hard-light',
                    filter: 'contrast(1.2) saturate(0.8) brightness(1.1) drop-shadow(0 0 10px rgba(255,255,255,0.2))',
                    backdropFilter: 'brightness(1.1)'
                }} />
            );

        case 'grade_neon_noir':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'radial-gradient(circle at 70% 30%, rgba(0,255,255,0.15), transparent 50%), linear-gradient(to bottom, rgba(50,0,100,0.2), rgba(0,0,0,0.4))',
                    mixBlendMode: 'overlay',
                    filter: 'contrast(1.3) saturate(1.4) hue-rotate(-10deg)',
                    backdropFilter: 'contrast(1.1)'
                }} />
            );

        case 'grade_zenith':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'linear-gradient(to top, rgba(200,230,255,0.1), rgba(255,255,255,0.3))',
                    mixBlendMode: 'soft-light',
                    filter: 'brightness(1.15) contrast(0.95) saturate(1.1)',
                    backdropFilter: 'blur(0.5px)'
                }} />
            );

        case 'grade_velocity':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'linear-gradient(90deg, rgba(0,255,255,0.05) 0%, transparent 50%, rgba(0,100,255,0.1) 100%)',
                    mixBlendMode: 'overlay',
                    filter: 'skewX(-10deg) contrast(1.15) brightness(1.05)',
                    backdropFilter: 'blur(0.3px)'
                }} />
            );

        default:
            return null;
    }
};

export default BannerOverlayRenderer;
