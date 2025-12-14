/**
 * Image Scaler Utility
 * Scales down images that exceed size limits while preserving quality
 */

import { IMAGE_SCALING_CONFIG, formatFileSizeMB } from '../constants/imageLimits';
import { logger } from './logger';

export interface ScaleResult {
    success: boolean;
    file: File | Blob;
    originalSize: number;
    finalSize: number;
    scaleFactor: number;
    quality: number;
    error?: string;
}

/**
 * Scale down an image to fit within a target size limit
 * Uses canvas-based resizing with iterative quality adjustment
 * 
 * @param file - The image file to scale
 * @param targetMaxBytes - Maximum allowed size in bytes
 * @param preserveType - Whether to preserve original format (falls back to JPEG if needed)
 * @returns Promise with scaling result
 */
export const scaleImageToFit = async (
    file: File | Blob,
    targetMaxBytes: number,
    preserveType: boolean = false
): Promise<ScaleResult> => {
    const originalSize = file.size;

    // If already under limit, return as-is
    if (originalSize <= targetMaxBytes) {
        return {
            success: true,
            file,
            originalSize,
            finalSize: originalSize,
            scaleFactor: 1,
            quality: 1,
        };
    }

    const { TARGET_SIZE_RATIO, MIN_QUALITY, QUALITY_STEP, MAX_SCALING_ATTEMPTS, INITIAL_QUALITY } = IMAGE_SCALING_CONFIG;

    // Target a size slightly below limit for safety margin
    const targetSize = Math.floor(targetMaxBytes * TARGET_SIZE_RATIO);

    logger.log(`[ImageScaler] Scaling from ${formatFileSizeMB(originalSize)} to target ${formatFileSizeMB(targetSize)}`);

    try {
        // Load image to get dimensions
        const img = await loadImage(file);
        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;

        // Calculate initial scale factor based on size ratio
        // Start with a proportional guess based on byte size difference
        const sizeRatio = targetSize / originalSize;
        // For images, bytes scale roughly with area, so take sqrt
        let dimensionScale = Math.sqrt(sizeRatio) * 1.1; // 1.1 buffer to avoid over-scaling
        dimensionScale = Math.min(dimensionScale, 1); // Never upscale

        let quality = INITIAL_QUALITY;
        let finalBlob: Blob | null = null;
        let attempts = 0;

        // Iterative scaling: adjust dimensions and quality until target is reached
        while (attempts < MAX_SCALING_ATTEMPTS) {
            attempts++;

            const newWidth = Math.round(originalWidth * dimensionScale);
            const newHeight = Math.round(originalHeight * dimensionScale);

            logger.log(`[ImageScaler] Attempt ${attempts}: ${newWidth}x${newHeight} @ quality ${quality.toFixed(2)}`);

            // Create scaled canvas
            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Failed to get canvas context');
            }

            // Use high-quality image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Export to blob
            // Use JPEG for best compression control, unless preserving PNG for transparency
            const outputType = preserveType && (file as File).type === 'image/png'
                ? 'image/png'
                : 'image/jpeg';

            finalBlob = await canvasToBlob(canvas, outputType, quality);

            logger.log(`[ImageScaler] Result: ${formatFileSizeMB(finalBlob.size)}`);

            // Check if we've reached target
            if (finalBlob.size <= targetMaxBytes) {
                logger.log(`[ImageScaler] Success after ${attempts} attempts`);

                // Convert blob back to File with original name
                const fileName = (file as File).name || 'scaled_image.jpg';
                const scaledFile = new File([finalBlob], fileName, { type: outputType });

                return {
                    success: true,
                    file: scaledFile,
                    originalSize,
                    finalSize: finalBlob.size,
                    scaleFactor: dimensionScale,
                    quality,
                };
            }

            // Adjust for next iteration
            if (quality > MIN_QUALITY) {
                // First, try reducing quality
                quality -= QUALITY_STEP;
            } else {
                // Quality at minimum, reduce dimensions
                dimensionScale *= 0.85; // Reduce by 15%
                quality = INITIAL_QUALITY; // Reset quality for new dimension
            }

            // Safety check: don't scale too small
            if (dimensionScale < 0.2) {
                break;
            }
        }

        // If we got here, scaling didn't reach target but we have a smaller result
        if (finalBlob && finalBlob.size < originalSize) {
            logger.warn(`[ImageScaler] Could not reach target, best effort: ${formatFileSizeMB(finalBlob.size)}`);

            const fileName = (file as File).name || 'scaled_image.jpg';
            const outputType = (file as File).type === 'image/png' ? 'image/png' : 'image/jpeg';
            const scaledFile = new File([finalBlob], fileName, { type: outputType });

            return {
                success: false,
                file: scaledFile,
                originalSize,
                finalSize: finalBlob.size,
                scaleFactor: dimensionScale,
                quality,
                error: `Could not scale below ${formatFileSizeMB(targetMaxBytes)} - reached ${formatFileSizeMB(finalBlob.size)}`,
            };
        }

        return {
            success: false,
            file,
            originalSize,
            finalSize: originalSize,
            scaleFactor: 1,
            quality: 1,
            error: 'Scaling failed - could not reduce file size',
        };

    } catch (error) {
        logger.error('[ImageScaler] Error:', error);
        return {
            success: false,
            file,
            originalSize,
            finalSize: originalSize,
            scaleFactor: 1,
            quality: 1,
            error: error instanceof Error ? error.message : 'Unknown scaling error',
        };
    }
};

/**
 * Load an image file into an HTMLImageElement
 */
const loadImage = (file: File | Blob): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
};

/**
 * Convert canvas to blob with specified format and quality
 */
const canvasToBlob = (
    canvas: HTMLCanvasElement,
    type: string,
    quality: number
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob from canvas'));
                }
            },
            type,
            quality
        );
    });
};

/**
 * Quick check if an image likely needs scaling
 * Used for UI feedback before full scaling attempt
 */
export const estimateScalingNeeded = (fileSize: number, targetMaxBytes: number): {
    needsScaling: boolean;
    estimatedReduction: string;
} => {
    if (fileSize <= targetMaxBytes) {
        return { needsScaling: false, estimatedReduction: '0%' };
    }

    const reductionNeeded = ((fileSize - targetMaxBytes) / fileSize) * 100;
    return {
        needsScaling: true,
        estimatedReduction: `~${Math.ceil(reductionNeeded)}%`,
    };
};
