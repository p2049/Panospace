/**
 * PANOSPACE COLORS UTILITIES
 * 
 * Logic for color extraction, conversion (HEX/RGB/HSL), and comparison.
 */

// ============================================================================
// 1. CONVERSION HELPERS
// ============================================================================

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface HSL {
    h: number;
    s: number;
    l: number;
}

/**
 * Convert RGB to HEX
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
};

/**
 * Convert HEX to RGB
 */
export const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16)
    } : null;
};

/**
 * Convert RGB to HSL
 */
export const rgbToHsl = (r: number, g: number, b: number): HSL => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
};

// ============================================================================
// 2. EXTRACTION LOGIC
// ============================================================================

export interface ExtractedColor {
    hex: string;
    rgb: RGB;
    hsl: HSL;
}

/**
 * Extract dominant color from an image
 */
export const extractDominantColor = async (imageSource: string | File | Blob): Promise<ExtractedColor> => {
    return new Promise(async (resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            try {
                // Create canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // Resize for performance (max 100x100)
                const maxSize = 100;
                const scale = Math.min(maxSize / img.width, maxSize / img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                // Draw image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;

                // Color buckets for quantization
                const colorMap: Record<string, number> = {};
                const skipPixels = 5; // Sample every 5th pixel for performance

                // Collect colors
                for (let i = 0; i < pixels.length; i += 4 * skipPixels) {
                    const r = pixels[i] || 0;
                    const g = pixels[i + 1] || 0;
                    const b = pixels[i + 2] || 0;
                    const a = pixels[i + 3] || 0;

                    // Skip transparent pixels
                    if (a < 125) continue;

                    // Skip very dark or very light pixels (likely shadows/highlights)
                    const brightness = (r + g + b) / 3;
                    if (brightness < 20 || brightness > 235) continue;

                    // Quantize to reduce color variations (group similar colors)
                    const quantize = 30;
                    const qr = Math.round(r / quantize) * quantize;
                    const qg = Math.round(g / quantize) * quantize;
                    const qb = Math.round(b / quantize) * quantize;

                    const key = `${qr},${qg},${qb}`;
                    colorMap[key] = (colorMap[key] || 0) + 1;
                }

                // Find most common color
                let maxCount = 0;
                let dominantColor: string | null = null;

                for (const [color, count] of Object.entries(colorMap)) {
                    if (count > maxCount) {
                        maxCount = count;
                        dominantColor = color;
                    }
                }

                if (!dominantColor) {
                    // Fallback to center pixel
                    const centerX = Math.floor(canvas.width / 2);
                    const centerY = Math.floor(canvas.height / 2);
                    const centerIndex = (centerY * canvas.width + centerX) * 4;
                    dominantColor = `${pixels[centerIndex]},${pixels[centerIndex + 1]},${pixels[centerIndex + 2]}`;
                }

                const parts = dominantColor.split(',').map(Number);
                const r = parts[0] || 0;
                const g = parts[1] || 0;
                const b = parts[2] || 0;
                const hex = rgbToHex(r, g, b);
                const hsl = rgbToHsl(r, g, b);

                resolve({
                    hex,
                    rgb: { r, g, b },
                    hsl
                });
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        // Handle different input types
        if (typeof imageSource === 'string') {
            // For URLs (especially Firebase Storage), fetch as blob first to avoid CORS taint
            if (imageSource.startsWith('http')) {
                try {
                    const response = await fetch(imageSource);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (e.target?.result) {
                            img.src = e.target.result as string;
                        }
                    };
                    reader.onerror = () => reject(new Error('Failed to read blob'));
                    reader.readAsDataURL(blob);
                } catch (fetchError: any) {
                    reject(new Error(`Failed to fetch image: ${fetchError.message}`));
                }
            } else {
                img.src = imageSource;
            }
        } else if (imageSource instanceof File || imageSource instanceof Blob) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    img.src = e.target.result as string;
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(imageSource);
        } else {
            reject(new Error('Invalid image source'));
        }
    });
};

// ============================================================================
// 3. COLOR COMPARISON & NAMING
// ============================================================================

/**
 * Calculate color similarity (0-100, 100 = identical)
 */
export const colorSimilarity = (color1: string | RGB, color2: string | RGB): number => {
    const c1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
    const c2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;

    if (!c1 || !c2) return 0;

    // Euclidean distance in RGB space
    const distance = Math.sqrt(
        Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );

    // Max distance in RGB space is sqrt(255^2 * 3) ≈ 441
    const maxDistance = 441;
    const similarity = 100 - (distance / maxDistance * 100);

    return Math.max(0, Math.min(100, similarity));
};

/**
 * Get color name from hex
 */
export const getColorName = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 'Unknown';

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Check for grayscale
    if (hsl.s < 10) {
        if (hsl.l < 20) return 'Black';
        if (hsl.l < 40) return 'Dark Gray';
        if (hsl.l < 60) return 'Gray';
        if (hsl.l < 80) return 'Light Gray';
        return 'White';
    }

    // Color hue ranges
    const h = hsl.h;
    if (h < 15 || h >= 345) return 'Red';
    if (h < 45) return 'Orange';
    if (h < 75) return 'Yellow';
    if (h < 150) return 'Green';
    if (h < 200) return 'Cyan';
    if (h < 260) return 'Blue';
    if (h < 290) return 'Purple';
    if (h < 330) return 'Magenta';
    return 'Pink';
};

/**
 * Predefined color palette for search
 */
export const COLOR_PALETTE = [
    { name: 'Red', hex: '#FF0000', hue: 0 },
    { name: 'Orange', hex: '#FF8800', hue: 30 },
    { name: 'Yellow', hex: '#FFFF00', hue: 60 },
    { name: 'Lime', hex: '#88FF00', hue: 90 },
    { name: 'Green', hex: '#00FF00', hue: 120 },
    { name: 'Teal', hex: '#00FF88', hue: 150 },
    { name: 'Cyan', hex: '#00FFFF', hue: 180 },
    { name: 'Sky', hex: '#0088FF', hue: 210 },
    { name: 'Blue', hex: '#0000FF', hue: 240 },
    { name: 'Purple', hex: '#8800FF', hue: 270 },
    { name: 'Magenta', hex: '#FF00FF', hue: 300 },
    { name: 'Pink', hex: '#FF0088', hue: 330 },
    { name: 'Black', hex: '#000000', hue: null },
    { name: 'Gray', hex: '#808080', hue: null },
    { name: 'White', hex: '#FFFFFF', hue: null }
];
