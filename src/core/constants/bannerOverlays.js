/**
 * @file bannerOverlays.js
 * @description Definitions for the Visual Overlay (Lens) system for PanoSpace banners.
 * Inspired by retro console system display behavior and early digital capture characteristics.
 */

export const OVERLAY_CATEGORIES = {
    DISPLAY: {
        id: 'DISPLAY',
        label: 'Display / Signal',
        description: 'Simulates the medium through which the image is viewed.'
    },
    CAPTURE: {
        id: 'CAPTURE',
        label: 'Capture / Sensor',
        description: 'Simulates the characteristics of the recording device.'
    },
    OPTICAL: {
        id: 'OPTICAL',
        label: 'Optical / Material',
        description: 'Simulates physical light interaction and lens properties.'
    },
    GRADE: {
        id: 'GRADE',
        label: 'Color Grade / Post',
        description: 'Atmospheric color treatments and film simulations.'
    }
};

export const BANNER_OVERLAYS = [
    // --- DISPLAY / SIGNAL ---
    {
        id: 'crt_signal',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'CRT Signal',
        description: 'Phosphor bloom, scanlines, and RGB subpixel masking.',
        compatibleWith: ['standard_digital', 'bloom_optical', 'noise_material', 'warm_light', 'cool_light', 'soft_optics', 'monochrome'],
        settings: {
            scanlineOpacity: 0.15,
            chromaticAberration: '0.5px',
            glow: '0 0 5px rgba(255,255,255,0.2)'
        }
    },
    {
        id: 'signal_degradation',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Signal Loss',
        description: 'Analog signal interference and slight color bleeding.',
        compatibleWith: ['high_gain', 'soft_optics', 'monochrome'],
    },
    {
        id: 'display_glitch',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Digital Artifacts',
        description: 'Random data corruption and RGB block artifacts.',
        compatibleWith: ['standard_digital', 'monochrome', 'high_gain']
    },
    {
        id: 'display_interlace',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Field Interlace',
        description: 'Alternating scanlines simulating 480i video output.',
        compatibleWith: ['crt_signal', 'warm_light', 'soft_optics']
    },
    {
        id: 'display_matrix',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Data Stream',
        description: 'Vertical cascading digital artifacts.',
        compatibleWith: ['standard_digital', 'monochrome']
    },
    {
        id: 'display_hologram',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Holo-Grid',
        description: 'Projected light grid with cyan tint.',
        compatibleWith: ['bloom_optical', 'soft_optics']
    },
    {
        id: 'display_vhs',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'VHS Tape',
        description: 'Tracking errors, color bleeding, and magnetic noise.',
        compatibleWith: ['soft_optics', 'warm_light', 'grain']
    },
    {
        id: 'display_halftone',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Ink Press',
        description: 'CMYK halftone pattern simulation.',
        compatibleWith: ['soft_optics', 'monochrome']
    },
    {
        id: 'display_engine_v2',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Engine V2',
        description: '480i analog output warmth with ethereal signal noise.',
        compatibleWith: ['soft_optics', 'bloom_optical']
    },
    {
        id: 'display_handheld_dm',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Handheld DM',
        description: 'Dot-matrix LCD with signature olive green phosphor.',
        compatibleWith: ['standard_digital', 'monochrome']
    },
    {
        id: 'display_pocket_32',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Pocket 32',
        description: 'Reflective LCD grid with saturated gamma correction.',
        compatibleWith: ['standard_digital', 'film_flare']
    },
    {
        id: 'display_arcade_8',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Arcade 8',
        description: 'High-output CRT phosphor mask with scanline bloom.',
        compatibleWith: ['capture_pixel', 'high_gain', 'grade_nostalgia']
    },
    {
        id: 'display_vector',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Vector CRT',
        description: 'Geometric wireframe scan with luminous vector glow.',
        compatibleWith: ['standard_digital', 'soft_optics']
    },
    {
        id: 'display_red_zone',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Virtual Red',
        description: 'Stereoscopic red monochrome retinal display.',
        compatibleWith: ['capture_pixel', 'display_glitch']
    },
    {
        id: 'display_web_safe',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Web 1.0',
        description: 'Ordered dithering pattern (Bayer) simulating 256-color displays.',
        compatibleWith: ['standard_digital', 'monochrome']
    },
    {
        id: 'display_bit_rot',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'Bit Rot',
        description: 'Severe compression artifacts and digital signal decay.',
        compatibleWith: ['display_glitch', 'high_gain']
    },
    {
        id: 'display_vga',
        category: OVERLAY_CATEGORIES.DISPLAY.id,
        label: 'VGA Terminal',
        description: 'Sharp 720x400 text mode raster with shadow mask.',
        compatibleWith: ['standard_digital', 'display_glitch']
    },

    // --- CAPTURE / SENSOR ---
    {
        id: 'standard_digital',
        category: OVERLAY_CATEGORIES.CAPTURE.id,
        label: 'Standard Digital',
        description: 'Cool white balance and characteristic highlight clipping.',
        compatibleWith: ['crt_signal', 'bloom_optical', 'noise_material', 'vignette_optical'],
    },
    {
        id: 'limited_range',
        category: OVERLAY_CATEGORIES.CAPTURE.id,
        label: 'Limited Range',
        description: 'Crushed blacks and blown highlights with high midtone contrast.',
        compatibleWith: ['bloom_optical', 'soft_optics', 'crt_signal'],
    },
    {
        id: 'warm_light',
        category: OVERLAY_CATEGORIES.CAPTURE.id,
        label: 'Warm Light',
        description: 'Tungsten-biased sensor profile with reduced blue response.',
        compatibleWith: ['soft_optics', 'bloom_optical', 'crt_signal'],
    },
    {
        id: 'cool_light',
        category: OVERLAY_CATEGORIES.CAPTURE.id,
        label: 'Cool Light',
        description: 'Daylight-biased sensor with cyan/green color shift.',
        compatibleWith: ['soft_optics', 'bloom_optical', 'crt_signal'],
    },
    {
        id: 'high_gain',
        category: OVERLAY_CATEGORIES.CAPTURE.id,
        label: 'High Gain',
        description: 'Electronic sensor noise and shadow "crawling" artifacts.',
        compatibleWith: ['signal_degradation', 'soft_optics', 'bloom_optical'],
    },
    {
        id: 'soft_optics',
        category: OVERLAY_CATEGORIES.CAPTURE.id,
        label: 'Soft Optics',
        description: 'Reduced micro-contrast and edge-to-edge softness.',
        compatibleWith: ['warm_light', 'cool_light', 'high_gain', 'crt_signal', 'limited_range', 'monochrome'],
    },
    {
        id: 'capture_nightvision',
        category: OVERLAY_CATEGORIES.CAPTURE.id,
        label: 'Night Vision',
        description: 'Phosphor green amplification and high gain noise.',
        compatibleWith: ['crt_signal', 'signal_degradation', 'grain']
    },
    {
        id: 'capture_minidv',
        category: OVERLAY_CATEGORIES.CAPTURE.id,
        label: 'MiniDV Tape',
        description: 'Early digital tape format with cool white balance and sharpness.',
        compatibleWith: ['display_glitch', 'grade_bleach']
    },
    {
        id: 'capture_cctv',
        category: OVERLAY_CATEGORIES.CAPTURE.id,
        label: 'Surveillance',
        description: 'High-compression monochrome security feed with signal noise.',
        compatibleWith: ['display_interlace', 'grain', 'signal_degradation']
    },
    {
        id: 'capture_pixel',
        category: OVERLAY_CATEGORIES.CAPTURE.id,
        label: 'Sensor Pixel',
        description: 'Low-resolution sensor downsampling (8-bit Mode).',
        compatibleWith: ['standard_digital', 'monochrome', 'grade_flux']
    },


    // --- OPTICAL / MATERIAL ---
    {
        id: 'bloom_optical',
        category: OVERLAY_CATEGORIES.OPTICAL.id,
        label: 'Bloom',
        description: 'Light bleed from high-luminance areas.',
        compatibleWith: ['crt_signal', 'standard_digital', 'limited_range', 'warm_light', 'cool_light', 'high_gain', 'monochrome'],
    },
    {
        id: 'noise_material',
        category: OVERLAY_CATEGORIES.OPTICAL.id,
        label: 'Electronic Noise',
        description: 'Ambient sensor static and electronic interference.',
        compatibleWith: ['standard_digital', 'crt_signal', 'monochrome'],
    },
    {
        id: 'monochrome',
        category: OVERLAY_CATEGORIES.OPTICAL.id,
        label: 'Monochrome',
        description: 'Luminance-weighted grayscale conversion.',
        compatibleWith: ['bloom_optical', 'noise_material', 'soft_optics', 'crt_signal'],
    },
    {
        id: 'vignette_optical',
        category: OVERLAY_CATEGORIES.OPTICAL.id,
        label: 'Vignette',
        description: 'Subtle peripheral light falloff.',
        compatibleWith: ['standard_digital', 'soft_optics', 'warm_light', 'cool_light'],
    },
    {
        id: 'healing_silk',
        category: OVERLAY_CATEGORIES.OPTICAL.id,
        label: 'Healing Silk',
        description: 'Ultra-soft light diffusion and chromatic warmth.',
        compatibleWith: ['bloom_optical', 'warm_light', 'soft_optics'],
    },
    {
        id: 'grain',
        category: OVERLAY_CATEGORIES.OPTICAL.id,
        label: 'Grain',
        description: 'Physical film grain simulation with organic noise.',
        compatibleWith: ['standard_digital', 'soft_optics', 'warm_light', 'cool_light', 'monochrome', 'vignette_optical', 'bloom_optical'],
    },
    {
        id: 'film_flare',
        category: OVERLAY_CATEGORIES.OPTICAL.id,
        label: 'Film Flare',
        description: 'Physical light leak and anamorphic lens flare artifacts.',
        compatibleWith: ['grain', 'vignette_optical', 'soft_optics', 'warm_light', 'bloom_optical']
    },
    {
        id: 'optic_prism',
        category: OVERLAY_CATEGORIES.OPTICAL.id,
        label: 'Prism Refraction',
        description: 'Chromatic aberration and edge blur.',
        compatibleWith: ['standard_digital', 'soft_optics', 'bloom_optical']
    },
    {
        id: 'optic_holofoil',
        category: OVERLAY_CATEGORIES.OPTICAL.id,
        label: 'Security Foil',
        description: 'Iridescent authentication hologram verification sheen.',
        compatibleWith: ['standard_digital', 'monochrome']
    },

    // --- COLOR GRADE / POST ---
    {
        id: 'grade_magma',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Magma Grade',
        description: 'Intense red/orange scale with deep crushed shadows.',
        compatibleWith: ['grain', 'vignette_optical', 'crt_signal', 'soft_optics']
    },
    {
        id: 'grade_teal',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Oceanic Grade',
        description: 'Cinematic teal shadows with preserved skin tones.',
        compatibleWith: ['grain', 'bloom_optical', 'soft_optics', 'film_flare']
    },

    {
        id: 'grade_nostalgia',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Nostalgic Grade',
        description: 'Warm, faded vintage tones with lifted shadows.',
        compatibleWith: ['grain', 'vignette_optical', 'film_flare', 'soft_optics']
    },
    {
        id: 'film_slide',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Vivid Slide',
        description: 'Punchy saturation and contrast (Positive Film).',
        compatibleWith: ['grain', 'vignette_optical', 'bloom_optical', 'soft_optics']
    },
    {
        id: 'film_print',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Soft Print',
        description: 'Low contrast, lifted blacks, and pastel tones (Negative Film).',
        compatibleWith: ['grain', 'vignette_optical', 'film_flare', 'warm_light']
    },
    {
        id: 'film_instant',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Instant Film',
        description: 'Cool shadows and warm highlights with faded dynamic range.',
        compatibleWith: ['grain', 'vignette_optical', 'film_flare', 'soft_optics']
    },
    {
        id: 'grade_bleach',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Bleach Bypass',
        description: 'High-contrast silver retention process. Metallic and desaturated.',
        compatibleWith: ['grain', 'vignette_optical', 'film_flare']
    },
    {
        id: 'grade_vaporwave',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Vaporwave',
        description: 'Aesthetic pink and cyan gradient with nostalgic haze.',
        compatibleWith: ['grain', 'display_vhs', 'display_glitch']
    },
    {
        id: 'grade_cyber_chrome',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Cyber Chrome',
        description: 'High-gloss metallic sheen with cold, futuristic highlights.',
        compatibleWith: ['grain', 'bloom_optical', 'crt_signal', 'film_flare']
    },

    {
        id: 'grade_x_process',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Cross Labs',
        description: 'Chemical cross-processing. Green highlights, violet shadows.',
        compatibleWith: ['grain', 'soft_optics', 'film_flare']
    },


    {
        id: 'grade_cyber_zone',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Cyber Zone',
        description: 'Late 90s techno-optimism. Epcot blues, industrial grids, and CRT glow.',
        compatibleWith: ['bloom_optical', 'display_vga', 'display_red_zone']
    },

    {
        id: 'grade_anime',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Anime Cel',
        description: 'Vibrant cel-shaded aesthetic with soft diffusion bloom.',
        compatibleWith: ['bloom_optical', 'soft_optics', 'film_flare']
    },
    {
        id: 'grade_neon_noir',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Neon Noir',
        description: 'Deep, cinematic high-contrast with purple/cyan split toning.',
        compatibleWith: ['grain', 'vignette_optical', 'film_flare', 'soft_optics']
    },
    {
        id: 'grade_zenith',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Zenith',
        description: 'Bright, airy, ultra-modern high-key aesthetic.',
        compatibleWith: ['grain', 'soft_optics', 'bloom_optical']
    },
    {
        id: 'grade_velocity',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Velocity',
        description: 'Sleek, high-speed motion aesthetic with cool drift.',
        compatibleWith: ['grain', 'vignette_optical', 'film_flare']
    },
    {
        id: 'grade_replicant',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Replicant',
        description: 'Cinematic orange/teal split with dystopian atmosphere.',
        compatibleWith: ['grain', 'film_flare', 'soft_optics']
    },
    {
        id: 'grade_blueprint',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Blueprint',
        description: 'Technical cyanotype photogram aesthetic.',
        compatibleWith: ['soft_optics', 'display_matrix']
    },
    {
        id: 'grade_infra',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Infrared',
        description: 'False-color thermal inversion spectrum.',
        compatibleWith: ['grain', 'display_glitch']
    },
    {
        id: 'grade_flux',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Flux State',
        description: 'The signature Panospace aesthetic. Dynamic mint energy.',
        compatibleWith: ['grain', 'display_matrix', 'display_vhs']
    },
    {
        id: 'grade_deep_dive',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Deep Dive',
        description: 'Bioluminescent blues. Crushed shadows with electric cyan highlights.',
        compatibleWith: ['grain', 'film_flare', 'soft_optics']
    },
    {
        id: 'grade_hyper_mint',
        category: OVERLAY_CATEGORIES.GRADE.id,
        label: 'Hyper Mint',
        description: 'Pristine high-key clarity. Desaturated reality with mint injection.',
        compatibleWith: ['grain', 'bloom_optical', 'soft_optics']
    },


];

/**
 * Checks if two overlays are compatible.
 * @param {string} id1 
 * @param {string} id2 
 * @returns {boolean}
 */
export const areOverlaysCompatible = (id1, id2) => {
    if (!id1 || !id2) return true;
    if (id1 === id2) return false; // Cannot stack the same overlay

    const ov1 = BANNER_OVERLAYS.find(o => o.id === id1);
    const ov2 = BANNER_OVERLAYS.find(o => o.id === id2);

    if (!ov1 || !ov2) return false;

    // Check if ov1 explicitly allows ov2 or vice versa
    return ov1.compatibleWith?.includes(id2) || ov2.compatibleWith?.includes(id1);
};

/**
 * GUIDELINES FOR ADDING FUTURE OVERLAYS:
 * 1. Define ID and Category: Ensure ID is snake_case and Category is from OVERLAY_CATEGORIES.
 * 2. Compatibility Matrix: 
 *    - New overlays must explicitly list compatible IDs in `compatibleWith`.
 *    - Avoid stacking effects that manipulate the same properties (e.g., two heavy blurs).
 *    - Sensor characteristics (CAPTURE) should usually be compatible with viewing characteristics (DISPLAY).
 * 3. Implementation in BannerOverlayRenderer.jsx:
 *    - Use CSS properties that are GPU-accelerated: filter, opacity, mix-blend-mode, backdrop-filter.
 *    - For complex noise or masks, use SVG data URIs to keep the system code-based and asset-free.
 *    - Ensure `pointerEvents: 'none'` is kept to allow interaction with UI below (though z-stacking usually handles this).
 * 4. Performance:
 *    - Limit heavy animations. Use steps() for digital artifacts or very long transition times (30s+).
 */

