import React from 'react';
import { BANNER_OVERLAYS } from '../../core/constants/bannerOverlays';
import { useLayoutEngine } from '../../core/responsive/useLayoutEngine';

/**
 * BannerOverlayRenderer
 * Implements the Visual Overlay (Lens) system.
 * Applies display and capture simulations to the banner background.
 */
const BannerOverlayRenderer = ({ overlays = [], monochromeColor, children, target = 'banner' }) => {
    const { isPortrait, isMobile } = useLayoutEngine();
    const isSimplified = isPortrait && isMobile;

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
                <OverlayLayer key={`${ov.id}-${index}`} overlay={ov} index={index} monochromeColor={monochromeColor} target={target} isSimplified={isSimplified} />
            ))}
        </div>
    );
};

const OverlayLayer = ({ overlay, index, monochromeColor, target, isSimplified }) => {
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

        case 'display_plasma':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Plasma Glow: High saturation and temperature
                    filter: 'contrast(1.3) saturate(1.4) brightness(1.1)',
                    background: 'radial-gradient(circle at center, rgba(200, 0, 255, 0.05), transparent 80%)',
                    mixBlendMode: 'hard-light'
                }}>
                    {/* Gas Noise / Grain */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.08'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'overlay',
                        opacity: 0.6
                    }} />
                    {/* Subtle flicker/burn-in feel */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255,0,200,0.05), rgba(0,255,255,0.05))',
                        mixBlendMode: 'screen',
                        opacity: 0.4
                    }} />
                </div>
            );

        case 'display_led_wall':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Punchy LED output
                    filter: 'contrast(1.2) brightness(1.1) saturate(1.2)',
                }}>
                    {/* The Grid (Black gaps) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            linear-gradient(90deg, rgba(0,0,0,0.8) 1px, transparent 1px),
                            linear-gradient(0deg, rgba(0,0,0,0.8) 1px, transparent 1px)
                        `,
                        backgroundSize: '4px 4px', // Tight pixel pitch
                        zIndex: 10,
                        mixBlendMode: 'multiply',
                        opacity: 0.7
                    }} />
                    {/* RGB Subpixel Bloom */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1.5px)`,
                        backgroundSize: '4px 4px',
                        backgroundPosition: '0.5px 0.5px', // Center in grid
                        mixBlendMode: 'screen',
                        opacity: 0.5
                    }} />
                </div>
            );

        case 'display_e_ink':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // High contrast, stripped color applied to background
                    backdropFilter: 'grayscale(1) contrast(1.5) brightness(1.1)',
                    background: 'rgba(232, 232, 229, 0.5)', // #e8e8e5 with opacity
                    mixBlendMode: 'multiply'
                }}>
                    {/* Paper Texture */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'multiply',
                        opacity: 0.6
                    }} />
                    {/* Ghosting / Latency artifacts (offset inverted layer) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        transform: 'translate(1px, 1px)',
                        background: 'inherit',
                        filter: 'invert(1) opacity(0.05)',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        case 'display_fiber_bundle':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Soft light transmission
                    filter: 'contrast(1.1) brightness(0.95)',
                }}>
                    {/* Hexagonal Fiber Grid */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            radial-gradient(circle, transparent 60%, rgba(0,0,0,0.8) 120%)
                        `,
                        backgroundSize: '6px 6px',
                        backgroundPosition: '0 0, 3px 3px',
                        mixBlendMode: 'multiply',
                        opacity: 0.6
                    }} />

                    {/* Light Bleed between fibers */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backdropFilter: 'blur(2px)',
                        mixBlendMode: 'lighten'
                    }} />

                    {/* Vignetting inherent to plates */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.4) 120%)',
                        mixBlendMode: 'multiply'
                    }} />
                </div>
            );

        case 'display_scifi_ui':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Brand Mint Tint
                    background: 'rgba(127, 255, 212, 0.03)',
                    filter: 'contrast(1.1) brightness(1.1)',
                    fontFamily: 'Orbitron, monospace',
                }}>
                    {/* Fine Grid Background */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            linear-gradient(rgba(127, 255, 212, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(127, 255, 212, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        mixBlendMode: 'screen',
                        opacity: 0.5
                    }} />

                    {/* HUD Frame & Data SVG - Updated for Brand Colors & Layout */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 200' xmlns='http://www.w3.org/2000/svg'%3E%3C!-- Frame Corners (Wide) --%3E%3Cpath d='M10,40 V10 H50 M750,10 H790 V40 M790,160 V190 H750 M50,190 H10 V160' fill='none' stroke='%237FFFD4' stroke-width='1.5' opacity='0.8'/%3E%3C!-- Top Center Tick --%3E%3Cpath d='M395,5 H405 L400,15 Z' fill='%237FFFD4' opacity='0.6'/%3E%3C!-- Bottom Center Wide Bracket (The 'Lil Box' Restored) --%3E%3Cpath d='M300,185 V195 H500 V185' fill='none' stroke='%237FFFD4' stroke-width='1.5' opacity='0.8'/%3E%3C!-- Side Scales --%3E%3Cpath d='M5,60 H15 M5,70 H15 M5,80 H15 M5,90 H25 M5,100 H15 M5,110 H15 M5,120 H15 M5,130 H15' stroke='%237FFFD4' stroke-width='1' opacity='0.4'/%3E%3Cpath d='M795,60 H785 M795,70 H785 M795,80 H785 M795,90 H775 M795,100 H785 M795,110 H785 M795,120 H785 M795,130 H785' stroke='%237FFFD4' stroke-width='1' opacity='0.4'/%3E%3C!-- Dummy Graph Lines (Brand Mint) --%3E%3Cpolyline points='100,150 150,140 200,160 250,130 300,155 350,120' fill='none' stroke='%237FFFD4' stroke-width='1' opacity='0.3' stroke-dasharray='4,2'/%3E%3Cpolyline points='450,120 500,155 550,130 600,160 650,140 700,150' fill='none' stroke='%237FFFD4' stroke-width='1' opacity='0.3' stroke-dasharray='4,2'/%3E%3C/svg%3E")`,
                        backgroundSize: '100% 100%',
                        mixBlendMode: 'screen',
                        opacity: 0.9
                    }} />

                    {/* Static Scanline Texture */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 50, 50, 0.3) 3px)',
                        pointerEvents: 'none'
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

        case 'optic_caustics':
            return (
                <div style={{
                    ...fullCoverStyle,
                    mixBlendMode: 'overlay',
                    filter: 'contrast(1.2) brightness(1.2)',
                }}>
                    {/* Caustic Lines */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.03' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23c)' opacity='0.3'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'screen',
                        opacity: 0.6,
                        filter: 'blur(1px)'
                    }} />
                </div>
            );

        case 'optic_fresnel':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Center magnification feel via scale + mask
                    backdropFilter: 'brightness(1.1)',
                }}>
                    {/* Concentric Rings */}
                    <div style={{
                        position: 'absolute',
                        inset: -100, // Oversized for effect
                        backgroundImage: `repeating-radial-gradient(circle at center, transparent 0, transparent 4px, rgba(255,255,255,0.05) 5px)`,
                        mixBlendMode: 'overlay',
                        opacity: 0.5,
                        maskImage: 'radial-gradient(circle, black 30%, transparent 80%)'
                    }} />
                    {/* Subtle chromatic edges */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
                        mixBlendMode: 'multiply'
                    }} />
                </div>
            );

        case 'optic_oil':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // Brand-aligned Iridescence (Ice Mint -> Cyan -> Purple -> Pink)
                    background: `
                        linear-gradient(135deg, 
                            rgba(127, 255, 212, 0.3) 0%, 
                            rgba(76, 201, 240, 0.3) 33%, 
                            rgba(108, 92, 231, 0.3) 66%, 
                            rgba(255, 107, 157, 0.3) 100%
                        )
                    `,
                    mixBlendMode: 'color-dodge',
                    opacity: 0.8,
                    filter: 'contrast(1.2) saturate(1.2)'
                }}>
                    {/* Smoother Turbulence for "Fluid" feel */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='o'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23o)' opacity='0.5'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'overlay',
                        filter: 'blur(3px) contrast(1.2)'
                    }} />
                </div>
            );

        case 'optic_frost':
            return (
                <div style={{
                    ...fullCoverStyle,
                    backdropFilter: 'blur(3px) brightness(1.1)',
                }}>
                    {/* Ice Crystal Noise */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='0.3'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'screen',
                        opacity: 0.6
                    }} />
                    {/* Cold Tint */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(200, 230, 255, 0.15)',
                        mixBlendMode: 'soft-light'
                    }} />
                </div>
            );

        case 'optic_glacier':
            return (
                <div style={{
                    ...fullCoverStyle,
                    // The "Sheet of Ice" effect: Blur simulates the density/refraction of the ice layer
                    backdropFilter: 'blur(4px) contrast(1.1) brightness(1.2)',
                    // Brand Tint: Ice Mint (#7FFFD4) flowing into Brand Blue (#4CC9F0)
                    background: 'linear-gradient(160deg, rgba(127, 255, 212, 0.2) 0%, rgba(76, 201, 240, 0.35) 100%)',
                    mixBlendMode: 'hard-light', // Pushes the icy tint into the darks and lights
                    boxShadow: 'inset 0 0 50px rgba(76, 201, 240, 0.3)' // Inner glow
                }}>
                    {/* Surface Freeze Texture (High frequency noise) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='iceSheet'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23iceSheet)' opacity='0.25'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'overlay',
                        opacity: 0.6
                    }} />

                    {/* Top Surface Sheen/Gloss (The "Sheet" reflection) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(120deg, rgba(255, 255, 255, 0.3) 0%, transparent 40%, rgba(127, 255, 212, 0.1) 60%, transparent 100%)',
                        mixBlendMode: 'screen',
                        opacity: 0.7
                    }} />

                    {/* Frozen Edges Vignette */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at center, transparent 50%, rgba(76, 201, 240, 0.2) 100%)',
                        pointerEvents: 'none'
                    }} />
                </div>
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



        case 'display_viewfinder':
            if (target === 'profile') return null; // No HUD on profile
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Camera OSD: Minimalist White HUD */}
                    <div style={{
                        position: 'absolute', top: 0, bottom: 0, left: isSimplified ? '4%' : '8%', right: isSimplified ? '4%' : '8%',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 200' xmlns='http://www.w3.org/2000/svg'%3E%3C!-- Crop Marks --%3E%3Cpath d='M20,60 H50 M20,60 V90 M780,60 H750 M780,60 V90 M780,180 V150 M780,180 H750 M20,180 V150 M20,180 H50' fill='none' stroke='white' stroke-width='2' opacity='0.9'/%3E${!isSimplified ? `%3C!-- Data Info --%3E%3Ctext x='70' y='170' fill='white' font-family='monospace' font-size='12' opacity='0.8'%3ERAW%3C/text%3E%3Ctext x='110' y='170' fill='white' font-family='monospace' font-size='12' opacity='0.8'%3EISO 800%3C/text%3E` : ''}%3Ctext x='740' y='170' fill='%23FF5C8A' font-family='monospace' font-size='12' opacity='0.9'%3EREC%3C/text%3E%3Ccircle cx='730' cy='166' r='4' fill='%23FF5C8A' opacity='0.9'/%3E%3C/svg%3E")`,
                        backgroundSize: '100% 100%',
                        opacity: 0.9,
                        mixBlendMode: 'screen', // Ensure white text pops
                        filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))'
                    }} />
                </div>
            );

        case 'display_vhs_rec':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Retro Camcorder OSD - Hidden on Profile */}
                    {target !== 'profile' && (
                        <div style={{
                            position: 'absolute', top: 0, bottom: 0, left: '8%', right: '8%',
                            fontFamily: '"Courier New", Courier, monospace',
                            textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                            pointerEvents: 'none'
                        }}>
                            {/* Play Mode & Battery */}
                            <div style={{ position: 'absolute', top: '60px', left: '20px', color: 'white', fontSize: isSimplified ? '16px' : '24px', fontWeight: 'bold' }}>SP ▶</div>
                            {!isSimplified && <div style={{ position: 'absolute', top: '60px', right: '20px', color: 'white', fontSize: '24px', opacity: 0.8 }}>[||| ]</div>}

                            {/* Date Stamp */}
                            {!isSimplified && (
                                <div style={{ position: 'absolute', bottom: '20px', left: '30px', color: 'white', fontSize: '18px', opacity: 0.9 }}>
                                    JAN. 01 1999<br />12:00 PM
                                </div>
                            )}
                        </div>
                    )}
                    {/* Subtle Scanlines */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 3px)',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        case 'display_cinema_guide':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Cinema Framing Guides - Hidden on Profile */}
                    {target !== 'profile' && (
                        <div style={{
                            position: 'absolute', top: 0, bottom: 0, left: '6%', right: '6%',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 200' xmlns='http://www.w3.org/2000/svg'%3E%3C!-- 2.39:1 Letterbox Markers --%3Cline x1='0' y1='30' x2='800' y2='30' stroke='%237FFFD4' stroke-width='1' stroke-dasharray='5,5'/%3E%3Cline x1='0' y1='170' x2='800' y2='170' stroke='%237FFFD4' stroke-width='1' stroke-dasharray='5,5'/%3E%3C!-- Safe Area --%3E%3Crect x='40' y='50' width='720' height='130' fill='none' stroke='white' stroke-width='1.5' opacity='0.3'/%3E%3C!-- Info --%3E%3Ctext x='45' y='75' fill='%237FFFD4' font-family='sans-serif' font-size='10' opacity='0.7'%3E2.39:1 ANAMORPHIC%3C/text%3E%3Ctext x='700' y='185' fill='%231B82FF' font-family='sans-serif' font-size='10' opacity='0.7'%3E4K RAW%3C/text%3E%3C/svg%3E")`,
                            backgroundSize: '100% 100%',
                            mixBlendMode: 'screen'
                        }} />
                    )}
                    {/* Letterbox darken (very subtle) */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '15%', background: 'rgba(0,0,0,0.3)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '15%', background: 'rgba(0,0,0,0.3)' }} />
                </div>
            );

        case 'display_rangefinder':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Analog Rangefinder Marks - Hidden on Profile */}
                    {target !== 'profile' && (
                        <div style={{
                            position: 'absolute', top: 0, bottom: 0, left: '8%', right: '8%',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 200' xmlns='http://www.w3.org/2000/svg'%3E%3C!-- Bright Frame Lines --%3E%3Crect x='50' y='50' width='700' height='130' rx='10' fill='none' stroke='white' stroke-width='2' opacity='0.9'/%3E%3C!-- Parallax Correction Mark --%3E%3Cpath d='M730,70 H710 V90' fill='none' stroke='white' stroke-width='1' opacity='0.7' stroke-dasharray='2,2'/%3E%3C/svg%3E")`,
                            backgroundSize: '100% 100%',
                            mixBlendMode: 'plus-lighter',
                            filter: 'drop-shadow(0 0 2px white)'
                        }} />
                    )}
                    {/* Central Focus Patch Removed to clear Profile Pic */}
                </div>
            );

        case 'display_super_8':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Cine-Film 16 / Super 8 Gate Mask */}
                    {/* Rounded corners and slight gate weave intrusion */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle, transparent 65%, #050505 85%)',
                        mixBlendMode: 'normal',
                        zIndex: 10
                    }} />
                    {/* Film Grain */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'overlay',
                        opacity: 0.5
                    }} />
                    {/* Sprocket Hole Shadow (Simulated on left edge) */}
                    <div style={{
                        position: 'absolute', top: 0, bottom: 0, left: '-10px', width: '30px',
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 70%)',
                        backgroundSize: '100% 60px', // Spacing of sprockets
                        backgroundRepeat: 'repeat-y',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        case 'display_med_format':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* 6x6 Waist Level Viewfinder */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 200' xmlns='http://www.w3.org/2000/svg'%3E%3C!-- Grid Points --%3E%3Ccircle cx='200' cy='50' r='1' fill='black' opacity='0.3'/%3E%3Ccircle cx='600' cy='50' r='1' fill='black' opacity='0.3'/%3E%3Ccircle cx='200' cy='150' r='1' fill='black' opacity='0.3'/%3E%3Ccircle cx='600' cy='150' r='1' fill='black' opacity='0.3'/%3E%3C/svg%3E")`,
                        backgroundSize: '100% 100%'
                    }} />
                    {/* Subtle Matte Glass Texture */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, transparent 1px, transparent 4px)',
                        pointerEvents: 'none'
                    }} />
                    {/* Darker Corners (Looking into the box) */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle, transparent 70%, rgba(20,20,20,0.6) 100%)',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        case 'display_point_n_shoot':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Compact Auto Style OSD - Hidden on Profile */}
                    {target !== 'profile' && (
                        <div style={{
                            position: 'absolute', top: 0, bottom: 0, left: '8%', right: '8%',
                            fontFamily: '"Arial", sans-serif', // Default smooth font
                            pointerEvents: 'none'
                        }}>
                            {/* Center AF Frame Removed */}
                            {/* Flash Mode Symbol */}
                            <div style={{
                                position: 'absolute', top: '60px', left: '20px',
                                color: 'white', fontSize: isSimplified ? '12px' : '16px', fontWeight: 'bold',
                                textShadow: '0 0 2px black'
                            }}>↯ AUTO</div>
                            {/* Exposure Counter / Mode */}
                            {!isSimplified && (
                                <div style={{
                                    position: 'absolute', top: '60px', right: '20px',
                                    color: 'white', fontSize: '16px', fontWeight: 'bold',
                                    textShadow: '0 0 2px black',
                                    letterSpacing: '1px'
                                }}>P</div>
                            )}
                            {/* Green Focus Confirmation Dot */}
                            <div style={{
                                position: 'absolute', bottom: '20px', right: '50%',
                                width: '6px', height: '6px',
                                background: '#7FFFD4',
                                borderRadius: '50%',
                                boxShadow: '0 0 4px #7FFFD4'
                            }} />
                        </div>
                    )}
                </div>
            );

        case 'display_pro_reflex':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Pro Reflex - Classic DSLR Optical View */}
                    {target !== 'profile' && (
                        <div style={{
                            position: 'absolute', top: 0, bottom: 0, left: '8%', right: '8%',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 200' xmlns='http://www.w3.org/2000/svg'%3E%3C!-- Focus Points (Off-center array) --%3E%3Crect x='355' y='95' width='10' height='10' stroke='black' stroke-width='1' opacity='0.3' fill='none'/%3E%3Crect x='435' y='95' width='10' height='10' stroke='black' stroke-width='1' opacity='0.3' fill='none'/%3E%3C/svg%3E")`,
                            backgroundSize: '100% 100%',
                            mixBlendMode: 'multiply'
                        }} />
                    )}
                    {/* Bottom Info Bar - Illuminated LCD - Hidden on Profile/Small Screen */}
                    {target !== 'profile' && !isSimplified && (
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '24px',
                            background: 'black',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '20px',
                            fontFamily: '"Digital-7", monospace',
                            color: '#7FFFD4', // Brand Mint
                            fontSize: '14px',
                            letterSpacing: '1px',
                            textShadow: '0 0 2px #7FFFD4'
                        }}>
                            <span>1/4000</span>
                            <span>F2.8</span>
                            <span>ISO 100</span>
                            <span>[ . . . | . . . ]</span>
                            <span style={{ color: '#FF5C8A', textShadow: '0 0 2px #FF5C8A' }}>⚡</span>
                        </div>
                    )}
                </div>
            );

        case 'display_hybrid_info':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Hybrid Info - Modern Mirrorless EVF */}
                    {target !== 'profile' && (
                        <>
                            <div style={{
                                position: 'absolute', top: 0, bottom: 0, left: '8%', right: '8%',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 200' xmlns='http://www.w3.org/2000/svg'%3E%3C!-- Histogram Placeholder --%3E%3Cpath d='M750,150 L750,180 L790,180 L790,160 L780,150 Z' fill='white' opacity='0.4'/%3E%3C!-- Grids --%3E%3Cline x1='150' y1='0' x2='150' y2='200' stroke='white' stroke-width='0.5' opacity='0.2' stroke-dasharray='5,5'/%3E%3Cline x1='650' y1='0' x2='650' y2='200' stroke='white' stroke-width='0.5' opacity='0.2' stroke-dasharray='5,5'/%3E%3C/svg%3E")`,
                                backgroundSize: '100% 100%',
                                mixBlendMode: 'screen',
                                filter: 'drop-shadow(0 1px 1px black)'
                            }} />
                            {/* Corner Info */}
                            {!isSimplified && (
                                <>
                                    <div style={{
                                        position: 'absolute', top: 60, left: 10,
                                        color: 'white', fontFamily: 'sans-serif', fontSize: '11px', fontWeight: 'bold'
                                    }}>
                                        AF-C<br />WIDE
                                    </div>
                                    <div style={{
                                        position: 'absolute', top: 60, right: 10,
                                        color: 'white', fontFamily: 'sans-serif', fontSize: '11px', textAlign: 'right'
                                    }}>
                                        Standby<br />4K 60p
                                    </div>
                                </>
                            )}
                            {isSimplified && (
                                <div style={{
                                    position: 'absolute', top: 60, right: 10,
                                    color: '#7FFFD4', fontFamily: 'sans-serif', fontSize: '11px', fontWeight: 'bold'
                                }}>
                                    STANDBY
                                </div>
                            )}
                            {!isSimplified && (
                                <div style={{
                                    position: 'absolute', bottom: 10, left: 10,
                                    color: 'white', fontFamily: 'sans-serif', fontSize: '12px', display: 'flex', gap: '8px'
                                }}>
                                    <span>1/50</span>
                                    <span>F4.0</span>
                                    <span>+0.7</span>
                                    <span>ISO 3200</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            );

        case 'display_pano_optic':
            return (
                <div style={{ ...fullCoverStyle, display: 'flex', flexDirection: 'column', padding: '20px' }}>
                    {/* Main HUD Container - Hidden on Profile */}
                    {target !== 'profile' && (
                        <div style={{
                            position: 'absolute', top: '60px', left: '10%', right: '10%', bottom: '20px',
                            border: '1px solid rgba(127, 255, 212, 0.3)', // Mint low opacity
                            borderRadius: '16px',
                            pointerEvents: 'none'
                        }}>
                            {/* Corners */}
                            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corn => (
                                <div key={corn} style={{
                                    position: 'absolute',
                                    top: corn.includes('top') ? '-1px' : 'auto',
                                    bottom: corn.includes('bottom') ? '-1px' : 'auto',
                                    left: corn.includes('left') ? '-1px' : 'auto',
                                    right: corn.includes('right') ? '-1px' : 'auto',
                                    width: '20px', height: '20px',
                                    borderTop: corn.includes('top') ? '2px solid #7FFFD4' : 'none',
                                    borderBottom: corn.includes('bottom') ? '2px solid #7FFFD4' : 'none',
                                    borderLeft: corn.includes('left') ? '2px solid #7FFFD4' : 'none',
                                    borderRight: corn.includes('right') ? '2px solid #7FFFD4' : 'none',
                                    [corn.includes('top') ? 'borderTopLeftRadius' : (corn.includes('bottom') && corn.includes('left') ? 'borderBottomLeftRadius' : (corn.includes('top') && corn.includes('right') ? 'borderTopRightRadius' : 'borderBottomRightRadius'))]: '16px'
                                }} />
                            ))}

                            {/* Center Target Removed to clear Profile Pic */}

                            {/* Top Info Bar */}
                            <div style={{
                                position: 'absolute', top: '10px', left: '20px', right: '20px',
                                display: 'flex', justifyContent: 'space-between',
                                fontFamily: "'Courier New', monospace", fontSize: '10px', color: '#7FFFD4', fontWeight: 'bold'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '6px', height: '6px', background: '#FF5C8A', borderRadius: '50%', boxShadow: '0 0 5px #FF5C8A' }}></span>
                                    REC
                                </span>
                                {!isSimplified && <span>BATT 98%</span>}
                            </div>

                            {/* Bottom Info Bar */}
                            {!isSimplified && (
                                <div style={{
                                    position: 'absolute', bottom: '10px', left: '20px', right: '20px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                                    fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.5)'
                                }}>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <span style={{ color: '#1B82FF' }}>ISO <span style={{ color: '#fff' }}>800</span></span>
                                        <span style={{ color: '#1B82FF' }}>S <span style={{ color: '#fff' }}>1/250</span></span>
                                        <span style={{ color: '#1B82FF' }}>F <span style={{ color: '#fff' }}>2.8</span></span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        {/* Level Indicator shifted to side */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginRight: '10px' }}>
                                            {[...Array(10)].map((_, i) => (
                                                <div key={i} style={{
                                                    width: '4px', height: i === 4 || i === 5 ? '8px' : '4px',
                                                    background: i === 4 || i === 5 ? '#FF5C8A' : 'rgba(255,255,255,0.4)',
                                                    borderRadius: '1px'
                                                }} />
                                            ))}
                                        </div>
                                        <span>RAW</span>
                                        <span>[ AF ]</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Grid Lines (Subtle) */}
                    <div style={{
                        position: 'absolute', inset: '0',
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '33.333% 33.333%',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        case 'display_slr_prism':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Split Prism Focus Screen - Hidden on Profile to clear avatar */}
                    {target !== 'profile' && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '120px', height: '120px',
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            zIndex: 10
                        }}>
                            {/* The split line */}
                            <div style={{
                                position: 'absolute', top: '50%', left: 0, right: 0, height: '1px',
                                background: 'rgba(255,255,255,0.1)'
                            }} />
                            {/* Microprism texture ring */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'radial-gradient(circle, transparent 40%, rgba(255,255,255,0.05) 41%, rgba(255,255,255,0.05) 100%)',
                                mixBlendMode: 'overlay'
                            }} />
                        </div>
                    )}
                </div>
            );

        case 'display_datacam':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* DataCam EVF - High Tech Mint/Pink - Hidden on Profile */}
                    {target !== 'profile' && (
                        <div style={{
                            position: 'absolute', top: 0, bottom: 0, left: '8%', right: '8%',
                            fontFamily: '"Share Tech Mono", monospace',
                            color: '#7FFFD4', // Ice Mint
                            textShadow: '0 0 2px rgba(127, 255, 212, 0.5)',
                            fontSize: '11px',
                            pointerEvents: 'none'
                        }}>
                            {/* Top Info */}
                            <div style={{ position: 'absolute', top: 60, left: 15 }}>
                                <span style={{ color: '#FF5C8A' }}>REC</span> {!isSimplified && '[ 00:04:22 ]'}
                            </div>
                            {!isSimplified && (
                                <div style={{ position: 'absolute', top: 60, right: 15, textAlign: 'right' }}>
                                    BATT <span style={{ color: '#FF5C8A' }}>98%</span><br />
                                    MEM  <span style={{ color: '#7FFFD4' }}>4TB</span>
                                </div>
                            )}
                            {/* Waveform Placeholder */}
                            {!isSimplified && (
                                <div style={{
                                    position: 'absolute', bottom: 15, left: 15,
                                    width: '100px', height: '40px',
                                    border: '1px solid #7FFFD4',
                                    opacity: 0.5,
                                    backgroundImage: 'linear-gradient(to top, rgba(127,255,212,0.2) 0%, transparent 100%)'
                                }} />
                            )}
                            {/* Audio Meters */}
                            <div style={{
                                position: 'absolute', bottom: 15, right: 15,
                                display: 'flex', gap: '4px', alignItems: 'flex-end'
                            }}>
                                <div style={{ width: '6px', height: '30px', background: '#FF5C8A', opacity: 0.8 }} />
                                <div style={{ width: '6px', height: '45px', background: '#7FFFD4', opacity: 0.8 }} />
                            </div>
                            {/* Center Safe Area */}
                            <div style={{
                                position: 'absolute', inset: '30px',
                                border: '1px dashed rgba(127, 255, 212, 0.2)'
                            }} />
                        </div>
                    )}
                </div>
            );

        case 'display_neural_optic':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Neural Link - Bio-Digital Interface - Hidden on Profile */}
                    {target !== 'profile' && (
                        <>
                            <div style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 200' xmlns='http://www.w3.org/2000/svg'%3E%3C!-- Hex Grid --%3E%3Cdefs%3E%3Cpattern id='hex' width='20' height='20' patternUnits='userSpaceOnUse' patternTransform='scale(2)'%3E%3Cpath d='M10,0 L20,5 L20,15 L10,20 L0,15 L0,5 Z' fill='none' stroke='%235A3FFF' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23hex)'/%3E%3C!-- Retinal Arc --%3E%3Cpath d='M20,100 Q100,180 200,100' fill='none' stroke='%237FFFD4' stroke-width='1.5' opacity='0.4' stroke-dasharray='10,20'/%3E%3Cpath d='M780,100 Q700,180 600,100' fill='none' stroke='%237FFFD4' stroke-width='1.5' opacity='0.4' stroke-dasharray='10,20'/%3E%3C/svg%3E")`,
                                backgroundSize: '100% 100%',
                                mixBlendMode: 'screen'
                            }} />
                            <div style={{
                                position: 'absolute', top: '50%', left: '20px',
                                color: '#5A3FFF', fontFamily: 'monospace', fontSize: '10px',
                                transform: 'translateY(-50%)',
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed',
                                opacity: 0.8
                            }}>
                                NEURAL_SYNC_ACTIVE
                            </div>
                        </>
                    )}
                </div>
            );

        case 'display_toy_cam':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Disposable / Toy Cam Effect */}
                    {/* Heavy Vignette & Blur edges */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.4) 100%)',
                        mixBlendMode: 'multiply'
                    }} />
                    {/* Orange Date Stamp - Hidden on Profile */}
                    {target !== 'profile' && (
                        <div style={{
                            position: 'absolute', bottom: '15px', right: '20px',
                            color: '#ff4400', fontFamily: '"Courier New", monospace', fontSize: '16px', fontWeight: 'bold',
                            textShadow: '0 0 2px #ff8800, 1px 1px 0 rgba(0,0,0,0.5)',
                            letterSpacing: '-1px',
                            opacity: 0.8
                        }}>
                            '98 7 24
                        </div>
                    )}
                    {/* Plastic Lens Distortion / Chromatic Aberration Hint */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.2)',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        case 'display_cyber_cam':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Y2K Digicam UI - Hidden on Profile */}
                    {target !== 'profile' && (
                        <div style={{
                            position: 'absolute', top: 0, bottom: 0, left: '8%', right: '8%',
                            fontFamily: '"Verdana", sans-serif',
                            color: 'white',
                            textShadow: '1px 1px 0 black',
                            fontSize: '10px'
                        }}>
                            <div style={{ position: 'absolute', top: 60, left: 10, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 4px' }}>P</span>
                                {!isSimplified && (
                                    <>
                                        <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 4px' }}>FINE</span>
                                        <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 4px' }}>640</span>
                                    </>
                                )}
                            </div>
                            <div style={{ position: 'absolute', top: 60, right: 10 }}>
                                <span style={{ color: '#7FFFD4' }}>[||]</span>
                            </div>
                            {!isSimplified && (
                                <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
                                    102 / 512
                                </div>
                            )}
                            {/* Center AF Box Removed */}
                        </div>
                    )}
                </div>
            );

        case 'display_spectral':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Spectral Coating: Anti-Reflective Glare */}
                    {/* Simulates the purple/green reflection on high-end optics */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(135deg, rgba(100,0,255,0.15) 0%, transparent 40%, transparent 60%, rgba(0,255,150,0.1) 100%)',
                        mixBlendMode: 'color-dodge',
                        opacity: 0.8
                    }} />
                    {/* Surface Gloss */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.05), transparent 30%)',
                        mixBlendMode: 'screen'
                    }} />
                </div>
            );

        case 'display_terminal':
            return (
                <div style={{
                    ...fullCoverStyle,
                    background: 'rgba(255, 176, 0, 0.15)', // Amber tint
                    mixBlendMode: 'overlay', // Blend nicely with dark backgrounds
                    fontFamily: '"Courier New", Courier, monospace',
                }}>
                    {/* Text Grid Texture - Hidden on Profile (letters/numbers) */}
                    {target !== 'profile' && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='5' y='20' fill='%23FFB000' font-family='monospace' font-size='10' opacity='0.2'%3E_%3C/text%3E%3C/svg%3E")`,
                            opacity: 0.4
                        }} />
                    )}
                    {/* Scanline */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.3) 4px)',
                        pointerEvents: 'none'
                    }} />
                    {/* Subtle Glow */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        boxShadow: 'inset 0 0 50px rgba(255, 176, 0, 0.2)',
                        pointerEvents: 'none'
                    }} />
                </div>
            );

        // --- CAPTURE / SENSOR ---
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

        case 'grade_portrait_gold':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Natural Skin Tone Warmth */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(255, 220, 180, 0.15)',
                        mixBlendMode: 'soft-light'
                    }} />
                    {/* Slight Yellow-Green shadow tint */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, transparent 60%, rgba(200, 200, 100, 0.05))',
                        mixBlendMode: 'multiply'
                    }} />
                    {/* Contrast & Saturation Control */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backdropFilter: 'contrast(1.05) saturate(1.1) brightness(1.02)'
                    }} />
                </div>
            );

        case 'grade_cine_800':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Tungsten Cool Bias (Shadows) */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0, 100, 200, 0.1)',
                        mixBlendMode: 'color-burn'
                    }} />
                    {/* Halation / Highlight Warmth */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle, rgba(255, 100, 50, 0.15), transparent 70%)',
                        mixBlendMode: 'screen',
                        filter: 'blur(10px)'
                    }} />
                    {/* Overall Look */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backdropFilter: 'contrast(1.1) brightness(0.95) saturate(1.2)'
                    }} />
                </div>
            );

        case 'grade_vivid_50':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Vivid Magenta/Purple Shadows */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(100, 0, 100, 0.2), transparent)',
                        mixBlendMode: 'overlay'
                    }} />
                    {/* High Impact Saturation */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backdropFilter: 'contrast(1.25) saturate(1.4) brightness(0.95)'
                    }} />
                </div>
            );

        case 'grade_chrome_64':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Red/Yellow Punch */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(200, 50, 0, 0.08)',
                        mixBlendMode: 'soft-light'
                    }} />
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(135deg, rgba(255, 200, 0, 0.1), rgba(0,0,50,0.1))',
                        mixBlendMode: 'overlay'
                    }} />
                    {/* Deep Contrast */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backdropFilter: 'contrast(1.3) saturate(1.1) sepia(0.2)'
                    }} />
                </div>
            );

        case 'grade_mono_400':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* B&W Conversion */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backdropFilter: 'grayscale(1) contrast(1.4) brightness(0.9)'
                    }} />
                    {/* Matte Black Lift */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(20,20,20,0.2)',
                        mixBlendMode: 'lighten'
                    }} />
                </div>
            );

        case 'grade_pro_100':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Modern Vivid */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backdropFilter: 'saturate(1.5) contrast(1.15)'
                    }} />
                    {/* Smooth Finish */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,255,0.03)',
                        mixBlendMode: 'screen' // Cool off highlights slightly
                    }} />
                </div>
            );

        case 'grade_cine_teal':
            return (
                <div style={{ ...fullCoverStyle }}>
                    {/* Teal Shadows */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0, 150, 150, 0.3), transparent 60%)',
                        mixBlendMode: 'multiply'
                    }} />
                    {/* Orange Highlights */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, rgba(255, 150, 50, 0.2), transparent 60%)',
                        mixBlendMode: 'overlay'
                    }} />
                    {/* Cinematic Pop */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backdropFilter: 'contrast(1.2) saturate(1.1)'
                    }} />
                </div>
            );

        default:
            return null;
    }
};

export default BannerOverlayRenderer;
