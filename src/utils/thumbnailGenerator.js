/**
 * Client-side thumbnail generation utility
 * Generates L0 (tiny), L1 (medium), and L2 (full) versions of images
 * 
 * This is a temporary client-side solution until Cloud Functions are deployed
 */

/**
 * Generate a thumbnail from an image file
 * @param {File} file - Original image file
 * @param {number} maxWidth - Maximum width for the thumbnail
 * @param {number} quality - JPEG quality (0-1)
 * @param {boolean} blur - Whether to apply blur effect
 * @returns {Promise<Blob>} - Thumbnail blob
 */
export const generateThumbnail = async (file, maxWidth, quality = 0.8, blur = false) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
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

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
};

/**
 * Generate all three thumbnail levels (L0, L1, L2)
 * @param {File} file - Original image file
 * @returns {Promise<{l0: Blob, l1: Blob, l2: File}>} - All thumbnail versions
 */
export const generateAllThumbnails = async (file) => {
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

/**
 * Generate thumbnail URLs from Firebase Storage paths
 * This creates the expected URL structure for L0/L1/L2
 * @param {string} originalUrl - Original image URL
 * @returns {object} - URLs for all thumbnail levels
 */
export const getThumbnailUrls = (originalUrl) => {
    if (!originalUrl) return { l0: null, l1: null, l2: originalUrl };

    // Extract path from URL
    const urlParts = originalUrl.split('/o/')[1]?.split('?')[0];
    if (!urlParts) return { l0: originalUrl, l1: originalUrl, l2: originalUrl };

    const decodedPath = decodeURIComponent(urlParts);
    const pathParts = decodedPath.split('/');
    const fileName = pathParts[pathParts.length - 1];
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
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} - Whether the URL is accessible
 */
export const checkThumbnailExists = async (url) => {
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
 * @param {object} urls - Object with l0, l1, l2 URLs
 * @param {string} preferredLevel - Preferred level ('l0', 'l1', or 'l2')
 * @returns {Promise<string>} - Best available URL
 */
export const getBestThumbnailUrl = async (urls, preferredLevel = 'l1') => {
    // Try preferred level first
    if (urls[preferredLevel]) {
        const exists = await checkThumbnailExists(urls[preferredLevel]);
        if (exists) return urls[preferredLevel];
    }

    // Fallback chain: l1 -> l2 -> l0
    const fallbackOrder = ['l1', 'l2', 'l0'];
    for (const level of fallbackOrder) {
        if (urls[level] && level !== preferredLevel) {
            const exists = await checkThumbnailExists(urls[level]);
            if (exists) return urls[level];
        }
    }

    // Final fallback to l2 (original)
    return urls.l2 || urls.l1 || urls.l0;
};
