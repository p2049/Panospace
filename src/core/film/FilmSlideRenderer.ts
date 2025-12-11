// Image loader import removed - using native Image for canvas drawing

interface RenderOptions {
    postId: string;
    slideIndex: number;
    images: string[]; // URLs of images to include (usually 1, sometimes multi)
    frameNumber: string;
    edgeCode: string;
    width?: number; // Target width, default 1080 or window width
}

/**
 * FilmSlideRenderer
 * 
 * Composites images and film borders into a single OffscreenCanvas (or Canvas).
 * Returns a Blob URL.
 */
export const FilmSlideRenderer = {
    renderSlide: async ({ postId, slideIndex, images, frameNumber, edgeCode, width = 1080 }: RenderOptions): Promise<string> => {
        // 1. Setup Canvas
        const canvas = document.createElement('canvas');
        // Aspect Ratio for film frame roughly 1080x1350 or similar vertical usage
        // A single frame unit in FilmStripPost includes tracks. Let's approximate a 4:5 ratio or match source.
        const height = Math.round(width * 1.25);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context not supported");

        // 2. Load Image(s)
        const imgSrc = images[0]; // Focusing on primary image for the slide
        let imgBitmap: HTMLImageElement | ImageBitmap | null = null;

        try {
            // Attempt to get from cache first via imageLoader logic or just load
            // imageLoader/preloadImage returns void, we generally need the element.
            // We'll create a new Image.
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = resolve; // Fallback to black if fail
                img.src = imgSrc;
            });
            imgBitmap = img;
        } catch (e) {
            console.warn("Failed to load image for render", imgSrc);
        }

        // 3. Draw Cyber-Film Layout
        // Background
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        // Dimensions
        const trackHeight = height * 0.08; // 8% top and bottom
        const contentHeight = height - (2 * trackHeight);

        // --- CONTENT AREA ---
        if (imgBitmap) {
            // Draw Image (ObjectFit: Cover equivalent)
            const imgRatio = (imgBitmap as HTMLImageElement).naturalWidth / (imgBitmap as HTMLImageElement).naturalHeight;
            const targetRatio = width / contentHeight;
            let drawW, drawH, offsetX, offsetY;

            if (imgRatio > targetRatio) {
                drawH = contentHeight;
                drawW = contentHeight * imgRatio;
                displayPosition:
                offsetX = (width - drawW) / 2;
                offsetY = trackHeight;
            } else {
                drawW = width;
                drawH = width / imgRatio;
                offsetX = 0;
                offsetY = trackHeight + (contentHeight - drawH) / 2;
            }

            // Clip to content area
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, trackHeight, width, contentHeight);
            ctx.clip();
            ctx.drawImage(imgBitmap as HTMLImageElement, offsetX, offsetY, drawW, drawH);
            ctx.restore();
        }

        // --- OVERLAYS ---
        const accentColor = "#7FFFD4";
        ctx.fillStyle = accentColor;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.font = `bold ${Math.round(width * 0.03)}px monospace`;

        // Top Track
        // Text: PANOSPACE
        ctx.fillText("PANOSPACE", width * 0.05, trackHeight * 0.6);
        // Frame Number
        ctx.fillText(frameNumber, width * 0.4, trackHeight * 0.6);

        // Sprockets (Circles)
        const sprocketRadius = trackHeight * 0.2;
        const sprocketY = trackHeight / 2;
        const numSprockets = 8;
        const noteSpacing = width / numSprockets;

        ctx.fillStyle = "#000"; // Holes are black
        // Actually sprockets in design are often white/transparent on black. 
        // In FilmStripPost.css, they are holes.
        // Let's draw white outlines or empty holes.
        // Since background is black, "holes" mean seeing black.
        // But the track isn't colored solid locally. It's usually translucent.
        // The previous design had a "track" div.
        // Let's just draw the accent graphic elements.

        for (let i = 0; i < numSprockets; i++) {
            // Top
            ctx.beginPath();
            ctx.arc(i * noteSpacing + (noteSpacing / 2), sprocketY, sprocketRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#111"; // slight dark grey hole
            ctx.fill();
            ctx.stroke();

            // Bottom
            ctx.beginPath();
            ctx.arc(i * noteSpacing + (noteSpacing / 2), height - sprocketY, sprocketRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Bottom Track
        ctx.fillStyle = accentColor;
        ctx.fillText(edgeCode, width * 0.05, height - (trackHeight * 0.4));
        ctx.fillText("2025", width * 0.85, height - (trackHeight * 0.4));

        // Side Markers
        // Left
        ctx.save();
        ctx.translate(width * 0.03, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(frameNumber, 0, 0);
        ctx.restore();

        // 4. Export
        return new Promise((resolve) => {
            canvas.toBlob(blob => {
                if (blob) {
                    resolve(URL.createObjectURL(blob));
                } else {
                    resolve("");
                }
            }, 'image/jpeg', 0.9);
        });
    }
};
