/**
 * Client-side thumbnail generation utility
 * Generates L0 (tiny), L1 (medium), and L2 (full) versions of images
 * 
 * This is a temporary client-side solution until Cloud Functions are deployed
 */

/**
 * Generate a thumbnail from an image file
 */
export const generateThumbnail = async (file: File, maxWidth: number, quality: number = 0.8, blur: boolean = false): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

        // Add timeout protection (10 seconds for thumbnail generation)
        const timeout = setTimeout(() => {
            reject(new Error('Thumbnail generation timeout'));
        }, 10000);

        img.onload = () => {
            clearTimeout(timeout);
            // Calculate dimensions maintaining aspect ratio
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            // Apply blur if requested (for L0)
            if (blur) {
                ctx.filter = 'blur(20px)';
            }

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to generate thumbnail'));
                    }
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Failed to load image'));
        };
        img.src = URL.createObjectURL(file);
    });
};

export interface Thumbnails {
    l0: Blob;
    l1: Blob;
    l2: File;
}

/**
 * Generate all three thumbnail levels (L0, L1, L2)
 */
export const generateAllThumbnails = async (file: File): Promise<Thumbnails> => {
    const [l0, l1] = await Promise.all([
        generateThumbnail(file, 60, 0.5, true),  // L0: 60px, low quality, blurred
        generateThumbnail(file, 600, 0.85, false) // L1: 600px, good quality
    ]);

    return {
        l0,
        l1,
        l2: file // L2 is the original file
    };
};

export interface ThumbnailUrls {
    l0: string | null;
    l1: string | null;
    l2: string | null;
}

/**
 * Generate thumbnail URLs from Firebase Storage paths
 * This creates the expected URL structure for L0/L1/L2
 */
export const getThumbnailUrls = (originalUrl: string | null | undefined): ThumbnailUrls => {
    if (!originalUrl) return { l0: null, l1: null, l2: originalUrl || null };

    // Extract path from URL
    const urlParts = originalUrl.split('/o/')[1]?.split('?')[0];
    if (!urlParts) return { l0: originalUrl, l1: originalUrl, l2: originalUrl };

    const decodedPath = decodeURIComponent(urlParts);
    const pathParts = decodedPath.split('/');
    const fileName = pathParts[pathParts.length - 1] || '';
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const ext = fileName.split('.').pop();

    // Construct thumbnail paths
    const basePath = pathParts.slice(0, -1).join('/');
    const l0Path = `${basePath}/thumbnails/${fileNameWithoutExt}_l0.${ext}`;
    const l1Path = `${basePath}/thumbnails/${fileNameWithoutExt}_l1.${ext}`;

    // Reconstruct URLs
    const baseUrl = originalUrl.split('/o/')[0];
    const token = originalUrl.split('token=')[1];

    return {
        l0: token ? `${baseUrl}/o/${encodeURIComponent(l0Path)}?alt=media&token=${token}` : null,
        l1: token ? `${baseUrl}/o/${encodeURIComponent(l1Path)}?alt=media&token=${token}` : null,
        l2: originalUrl
    };
};

/**
 * Check if thumbnail URLs exist
 */
export const checkThumbnailExists = async (url: string | null): Promise<boolean> => {
    if (!url) return false;

    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

/**
 * Get best available thumbnail URL with fallback
 */
export const getBestThumbnailUrl = async (urls: ThumbnailUrls, preferredLevel: keyof ThumbnailUrls = 'l1'): Promise<string | null> => {
    // Try preferred level first
    if (urls[preferredLevel]) {
        const exists = await checkThumbnailExists(urls[preferredLevel]);
        if (exists) return urls[preferredLevel];
    }

    // Fallback chain: l1 -> l2 -> l0
    const fallbackOrder: (keyof ThumbnailUrls)[] = ['l1', 'l2', 'l0'];
    for (const level of fallbackOrder) {
        if (urls[level] && level !== preferredLevel) {
            const exists = await checkThumbnailExists(urls[level]);
            if (exists) return urls[level];
        }
    }

    // Final fallback to l2 (original)
    return urls.l2 || urls.l1 || urls.l0;
};
