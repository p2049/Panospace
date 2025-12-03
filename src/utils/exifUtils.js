/**
 * EXIF Utilities
 * 
 * Centralized logic for EXIF parsing, formatting, validation, and UI helpers.
 * Replaces logic in:
 * - src/domain/posts/exif.ts
 * - src/components/ManualExifForm.jsx
 * - src/components/Post.jsx
 * - src/components/create-post/FilmOptionsPanel.jsx
 */

import exifr from 'exifr';

// ============================================================================
// 1. PARSING
// ============================================================================

/**
 * Extract EXIF data from an image file
 * @param {File} file - The image file
 * @returns {Promise<Object|undefined>} Extracted EXIF data or undefined
 */
export async function extractExifData(file) {
    try {
        const data = await exifr.parse(file, {
            pick: [
                'Make',
                'Model',
                'LensModel',
                'FocalLength',
                'FNumber',
                'ISO',
                'ExposureTime',
                'DateTimeOriginal',
                'PixelXDimension',
                'PixelYDimension',
            ],
        });

        if (!data) {
            return undefined;
        }

        return {
            make: data.Make,
            model: data.Model,
            lensModel: data.LensModel,
            focalLength: data.FocalLength,
            fNumber: data.FNumber,
            iso: data.ISO,
            exposureTime: data.ExposureTime ? formatExposureTime(data.ExposureTime) : undefined,
            dateTime: data.DateTimeOriginal ? new Date(data.DateTimeOriginal).toISOString() : undefined,
            // Keep raw values if needed for editing
            rawExposureTime: data.ExposureTime
        };
    } catch (error) {
        console.warn('Failed to extract EXIF data:', error);
        return undefined;
    }
}

// ============================================================================
// 2. FORMATTING
// ============================================================================

/**
 * Format exposure time as fraction (e.g., "1/250") or seconds (e.g., "2s")
 * @param {number|string} value - Exposure time in seconds
 * @returns {string} Formatted exposure time
 */
export function formatExposureTime(value) {
    if (!value) return '';
    const num = Number(value);
    if (isNaN(num)) return value.toString();

    if (num >= 1) {
        return `${num}s`;
    }

    const denominator = Math.round(1 / num);
    return `1/${denominator}`;
}

/**
 * Format aperture (e.g., "f/2.8")
 * @param {number|string} value - Aperture value
 * @returns {string} Formatted aperture
 */
export function formatAperture(value) {
    if (!value) return '';
    return `f/${value}`;
}

/**
 * Format ISO (e.g., "ISO 400")
 * @param {number|string} value - ISO value
 * @returns {string} Formatted ISO
 */
export function formatISO(value) {
    if (!value) return '';
    return `ISO ${value}`;
}

/**
 * Format focal length (e.g., "50mm")
 * @param {number|string} value - Focal length
 * @returns {string} Formatted focal length
 */
export function formatFocalLength(value) {
    if (!value) return '';
    return `${value}mm`;
}

/**
 * Format camera make and model
 * @param {string} make 
 * @param {string} model 
 * @returns {string} Formatted camera string
 */
export function formatCameraModel(make, model) {
    if (!make && !model) return '';
    if (!make) return model;
    if (!model) return make;

    // Avoid "Canon Canon EOS R5"
    if (model.toLowerCase().startsWith(make.toLowerCase())) {
        return model;
    }
    return `${make} ${model}`;
}

/**
 * Format date for display
 * @param {string|Date} date 
 * @returns {string} Formatted date
 */
export function formatExifDate(date) {
    if (!date) return '';
    try {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return '';
    }
}

/**
 * Prepare EXIF object for display in Post component
 * @param {Object} exif 
 * @returns {Object} Formatted display object
 */
export function formatExifForDisplay(exif) {
    if (!exif) return null;

    return {
        camera: formatCameraModel(exif.make, exif.model),
        lens: exif.lensModel || exif.lens,
        specs: [
            exif.focalLength ? formatFocalLength(exif.focalLength) : null,
            exif.fNumber || exif.aperture ? formatAperture(exif.fNumber || exif.aperture) : null,
            exif.iso ? formatISO(exif.iso) : null,
            exif.exposureTime || exif.shutterSpeed ? (
                // Check if it's already formatted (string with 's' or '/') or raw number
                typeof (exif.exposureTime || exif.shutterSpeed) === 'number'
                    ? formatExposureTime(exif.exposureTime || exif.shutterSpeed)
                    : (exif.exposureTime || exif.shutterSpeed) + (String(exif.exposureTime || exif.shutterSpeed).includes('/') || String(exif.exposureTime || exif.shutterSpeed).endsWith('s') ? '' : 's')
            ) : null
        ].filter(Boolean),
        date: formatExifDate(exif.dateTime || exif.date)
    };
}

// ============================================================================
// 3. VALIDATION
// ============================================================================

/**
 * Validate EXIF data object
 * @param {Object} data 
 * @returns {boolean} True if at least one field is present
 */
export function validateExifData(data) {
    if (!data) return false;
    // Check if at least one relevant field has a value
    const fields = ['make', 'model', 'lensModel', 'focalLength', 'fNumber', 'exposureTime', 'iso', 'dateTime'];
    return fields.some(field => data[field] && data[field].toString().trim() !== '');
}

// ============================================================================
// 4. UI HELPERS (Quartz Date, etc.)
// ============================================================================

export const QUARTZ_DATE_FORMATS = [
    { value: "MM DD 'YY", label: "MM DD 'YY (US Classic - Default)" },
    { value: "YY.MM.DD", label: "YY.MM.DD" },
    { value: "MM.DD.YY", label: "MM.DD.YY (US)" },
    { value: "DD.MM.YY", label: "DD.MM.YY (EU)" },
    { value: "DD MM 'YY", label: "DD MM 'YY (Classic)" },
    { value: "YY MM DD", label: "YY MM DD (Classic)" }
];

/**
 * Generate Quartz Date string based on format
 * @param {string} format 
 * @param {Date} date 
 * @returns {string} Formatted quartz date string
 */
export function generateQuartzDateString(format, date = new Date()) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear()).slice(2);

    switch (format) {
        case 'YY.MM.DD': return `${y}.${m}.${d}`;
        case 'MM.DD.YY': return `${m}.${d}.${y}`;
        case 'DD.MM.YY': return `${d}.${m}.${y}`;
        case "DD MM 'YY": return `${date.getDate()} ${date.getMonth() + 1} '${y}`;
        case "MM DD 'YY": return `${date.getMonth() + 1} ${date.getDate()} '${y}`;
        case "YY MM DD": return `${y} ${m} ${d}`;
        default: return `${date.getMonth() + 1} ${date.getDate()} '${y}`;
    }
}
