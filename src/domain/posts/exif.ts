/**
 * EXIF Data Extraction
 * 
 * Extracts camera metadata from image files using exifr library.
 */

import { extractExifData as jsExtract } from '@/core/utils/exif';
import type { ExifData } from '@/types';

/**
 * Extract EXIF data from an image file
 */
export async function extractExifData(file: File): Promise<ExifData | undefined> {
    return jsExtract(file) as Promise<ExifData | undefined>;
}

