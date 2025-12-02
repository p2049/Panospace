/**
 * EXIF Data Extraction
 * 
 * Extracts camera metadata from image files using exifr library.
 */

import exifr from 'exifr';
import type { ExifData } from '../../types';

/**
 * Extract EXIF data from an image file
 */
export async function extractExifData(file: File): Promise<ExifData | undefined> {
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
            dateTime: data.DateTimeOriginal?.toISOString(),
        };
    } catch (error) {
        console.warn('Failed to extract EXIF data:', error);
        return undefined;
    }
}

/**
 * Format exposure time as fraction (e.g., "1/250")
 */
function formatExposureTime(value: number): string {
    if (value >= 1) {
        return `${value}s`;
    }

    const denominator = Math.round(1 / value);
    return `1/${denominator}`;
}
