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
    }
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

