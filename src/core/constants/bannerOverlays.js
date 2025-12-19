/**
 * @file bannerOverlays.js
 * @description Definitions for the Visual Overlay (Lens) system for PanoSpace banners.
 * Inspired by PS2 system display behavior and early digital capture characteristics.
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
