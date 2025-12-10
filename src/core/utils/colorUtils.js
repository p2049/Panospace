/**
 * Utility functions for color extraction and manipulation
 */

/**
 * Extracts the dominant color from an image URL and returns it as a darkened hex color
 * suitable for a cinematic background gradient.
 * 
 * @param {string} imageSrc - The URL of the image
 * @returns {Promise<string|null>} - The darkened hex color or null if failure
 */
export const extractDominantHue = async (imageSrc) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageSrc;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Downscale for performance
                canvas.width = 50;
                canvas.height = 50;

                ctx.drawImage(img, 0, 0, 50, 50);

                const imageData = ctx.getImageData(0, 0, 50, 50);
                const data = imageData.data;

                let r = 0, g = 0, b = 0;
                let count = 0;

                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }

                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);

                // Convert to HSL to adjust
                const hsl = rgbToHsl(r, g, b);

                // Apply Darkening & Desaturation Rules
                // Rule: Saturation -20% to -40%, Lightness -40% to -60%
                // We aim for a subtler, darker "atmosphere" color (L around 10-15%)

                let h = hsl[0];
                let s = hsl[1];
                let l = hsl[2];

                // Dampen saturation slightly to avoid neons but maintain color
                s = Math.max(0.2, Math.min(0.9, s));

                // Adjust Lightness:
                // User Feedback: "Inbetween"
                // New Target: 0.20 (Deep Atmosphere) to 0.45 (Visible Glow)
                l = Math.max(0.20, Math.min(0.45, l * 0.75));

                // Check for "Too White/Grey/Black" (Low Saturation)
                // If S is very low, it's basically grey. We can keep it grey (black gradient) or push slightly to blue-grey?
                // Let's stick to true color or fallback if undefined.

                const finalHex = hslToHex(h, s, l);
                resolve(finalHex);
            } catch (e) {
                console.error("Color extraction failed", e);
                resolve(null);
            }
        };

        img.onerror = (e) => {
            console.error("Image load failed for color extraction", e);
            resolve(null);
        };
    });
};

/**
 * Helpers
 */

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function hslToHex(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
