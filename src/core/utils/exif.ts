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
import type { ExifData } from '@/types';

// Extended interface for internal use (includes raw values)
export interface ExtractedExif extends ExifData {
    rawExposureTime?: number;
    pixelXDimension?: number;
    pixelYDimension?: number;
}

// ============================================================================
// 1. PARSING
// ============================================================================

/**
 * Extract EXIF data from an image file
 */
export async function extractExifData(file: File): Promise<ExtractedExif | undefined> {
    try {
        const data = await exifr.parse(file, {
            // Only read the first 64KB - EXIF is always at the start
            firstChunkSize: 65536,
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
            rawExposureTime: data.ExposureTime,
            pixelXDimension: data.PixelXDimension,
            pixelYDimension: data.PixelYDimension
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
 */
export function formatExposureTime(value: number | string | undefined): string {
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
 */
export function formatAperture(value: number | string | undefined): string {
    if (!value) return '';
    return `f/${value}`;
}

/**
 * Format ISO (e.g., "ISO 400")
 */
export function formatISO(value: number | string | undefined): string {
    if (!value) return '';
    return `ISO ${value}`;
}

/**
 * Format focal length (e.g., "50mm")
 */
export function formatFocalLength(value: number | string | undefined): string {
    if (!value) return '';
    return `${value}mm`;
}

/**
 * Format camera make and model
 */
export function formatCameraModel(make?: string, model?: string): string {
    if (!make && !model) return '';
    if (!make) return model || '';
    if (!model) return make;

    // Avoid "Canon Canon EOS R5"
    if (model.toLowerCase().startsWith(make.toLowerCase())) {
        return model;
    }
    return `${make} ${model}`;
}

/**
 * Format date for display
 */
export function formatExifDate(date: string | Date | undefined): string {
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

export interface ExifDisplay {
    camera: string;
    lens: string;
    specs: string[];
    date: string;
}

/**
 * Prepare EXIF object for display in Post component
 */
export function formatExifForDisplay(exif: any): ExifDisplay | null {
    if (!exif) return null;

    return {
        camera: formatCameraModel(exif.make, exif.model),
        lens: exif.lensModel || exif.lens || '',
        specs: [
            exif.focalLength ? formatFocalLength(exif.focalLength) : null,
            exif.fNumber || exif.aperture ? formatAperture(exif.fNumber || exif.aperture) : null,
            exif.iso ? formatISO(exif.iso) : null,
            (exif.exposureTime || exif.shutterSpeed) ? (
                // Check if it's already formatted (string with 's' or '/') or raw number
                typeof (exif.exposureTime || exif.shutterSpeed) === 'number'
                    ? formatExposureTime(exif.exposureTime || exif.shutterSpeed)
                    : (exif.exposureTime || exif.shutterSpeed) + (String(exif.exposureTime || exif.shutterSpeed).includes('/') || String(exif.exposureTime || exif.shutterSpeed).endsWith('s') ? '' : 's')
            ) : null
        ].filter(Boolean) as string[],
        date: formatExifDate(exif.dateTime || exif.date)
    };
}

// ============================================================================
// 3. VALIDATION
// ============================================================================

/**
 * Validate EXIF data object
 */
export function validateExifData(data: any): boolean {
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
 */
export function generateQuartzDateString(format: string, date: Date = new Date()): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear()).slice(2);

    switch (format) {
        case 'YY.MM.DD': return `${y}.${m}.${d}`;
        case 'MM.DD.YY': return `${m}.${d}.${y}`;
        case 'DD.MM.YY': return `${d}.${m}.${y}`;
        case "DD MM 'YY": return `${date.getDate()} ${Number(m)} '${y}`; // Note: Month is number in js, logic was Number(date.getMonth() + 1).. wait
        // JS version: return `${date.getDate()} ${date.getMonth() + 1} '${y}`;
        // My previous code line 222: `${date.getDate()} ${date.getMonth() + 1} '${y}`. 
        // This outputs "15 1 '24" for Jan 15. The JS version did this.
        case "MM DD 'YY": return `${Number(m)} ${date.getDate()} '${y}`;
        case "YY MM DD": return `${y} ${m} ${d}`;
        default: return `${Number(m)} ${date.getDate()} '${y}`;
    }
}
