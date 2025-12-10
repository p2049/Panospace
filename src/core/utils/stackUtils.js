/**
 * Generates a preview image for a stack of photos.
 * 
 * @param {File[]} files - Array of image files.
 * @param {'vertical'|'horizontal'|'grid'} layout - The layout direction.
 * @returns {Promise<{previewUrl: string, blob: Blob}>} - The generated preview data URL and Blob.
 */
export const generateStackPreview = async (files, layout) => {
    // 1. Load all images
    const images = await Promise.all(files.map(file => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }));

    // 2. Validate & Calculate Dimensions

    // Note: Grid size validation removed as per user request to be more flexible.

    // Determine Normalization DIMENSIONS
    // To avoid "Noodle" stacks (super skinny/long) caused by mixing aspect ratios,
    // we use the MINIMUM dimension as the anchor and center-crop larger images.

    // Vertical: Anchor Width = Minimum Width of set.
    // Horizontal: Anchor Height = Minimum Height of set.



    // OPTIMIZATION:
    // If the anchor dimensions are huge (e.g. 6000px from a DSLR), the canvas operations will be slow.
    // We should cap the max dimension to something reasonable for web (e.g., 2500px width).
    // This dramatically speeds up toDataURL/toBlob.

    const MAX_DIMENSION = 2500;

    // 2. Determine Normalization DIMENSIONS
    // REVISED LOGIC (User Request): 
    // "Scale to the height of the square image" instead of cropping.
    // This means we should find the Maximum common dimension (Height for horizontal, Width for vertical)
    // and resize all images to match that dimension, maintaining aspect ratio.

    let anchorWidth = 0;
    let anchorHeight = 0;

    // First, find the MAX dimensions in the set (to preserve quality)
    images.forEach(img => {
        if (img.width > anchorWidth) anchorWidth = img.width;
        if (img.height > anchorHeight) anchorHeight = img.height;
    });

    // Check if we need to downscale the whole operation based on the anchor
    let globalScale = 1;

    // For Vertical Stack: We normalize to a common WIDTH.
    // For Horizontal Stack: We normalize to a common HEIGHT.

    if (layout === 'vertical') {
        if (anchorWidth > MAX_DIMENSION) {
            globalScale = MAX_DIMENSION / anchorWidth;
            anchorWidth = MAX_DIMENSION;
        }
    } else if (layout === 'horizontal') {
        if (anchorHeight > MAX_DIMENSION) {
            globalScale = MAX_DIMENSION / anchorHeight;
            anchorHeight = MAX_DIMENSION;
        }
    } else if (layout === 'grid') {
        const firstW = images[0].width;
        // Check grid total width (2 * firstW)
        if ((firstW * 2) > MAX_DIMENSION) {
            globalScale = (MAX_DIMENSION / 2) / firstW;
        }
    }

    // 3. Process Images (Calculate Coords)
    const processedImages = images.map(img => {
        if (layout === 'vertical') {
            // VERTICAL: Match Anchor WIDTH. Scale Height.
            // dw = anchorWidth (already scaled/clamped)
            // Scale Factor = anchorWidth / img.width (Wait, img.width is unscaled source)
            // Logic:
            // We want final width to be `anchorWidth`.
            // Source is `img.width`.
            // Scale = anchorWidth / img.width.
            // dh = img.height * Scale.

            // UNLESS anchorWidth was clamped by globalScale?
            // If anchorWidth is 2500 (clamped). img.width is 5000.
            // Scale = 0.5. Height becomes 0.5. Perfect.

            // What if anchorWidth is 2500 (clamped). img.width is 1000.
            // We are upscaling to match the common width? Yes.

            const scale = anchorWidth / img.width;

            return {
                sx: 0, sy: 0, sw: img.width, sh: img.height, // No cropping
                dx: 0, dy: 0, dw: anchorWidth, dh: img.height * scale,
                img
            };

        } else if (layout === 'horizontal') {
            // HORIZONTAL: Match Anchor HEIGHT. Scale Width.
            const scale = anchorHeight / img.height;

            return {
                sx: 0, sy: 0, sw: img.width, sh: img.height, // No cropping
                dx: 0, dy: 0, dw: img.width * scale, dh: anchorHeight,
                img
            };
        } else {
            // GRID LOGIC (Keep existing smart crop)
            const targetCellW = images[0].width;
            const targetCellH = images[0].height;
            const targetAspect = targetCellW / targetCellH;
            const imgAspect = img.width / img.height;

            let sx, sy, sw, sh;

            if (imgAspect > targetAspect) {
                sh = img.height;
                sw = img.height * targetAspect;
                sy = 0;
                sx = (img.width - sw) / 2;
            } else {
                sw = img.width;
                sh = img.width / targetAspect;
                sx = 0;
                sy = (img.height - sh) / 2;
            }

            return {
                sx, sy, sw, sh,
                dx: 0, dy: 0, dw: targetCellW * globalScale, dh: targetCellH * globalScale,
                img
            };
        }
    });

    // 4. Calculate Total Canvas Size
    let totalWidth, totalHeight;
    if (layout === 'vertical') {
        totalWidth = anchorWidth;
        totalHeight = Math.ceil(processedImages.reduce((acc, curr) => acc + curr.dh, 0));
    } else if (layout === 'horizontal') {
        totalWidth = Math.ceil(processedImages.reduce((acc, curr) => acc + curr.dw, 0));
        totalHeight = anchorHeight;
    } else if (layout === 'instant-grid') {
        // INSTANT GRID (Up to 3 images side-by-side)
        // Fixed dimensions for aesthetics
        const P_WIDTH = 600;
        const P_HEIGHT = 720; // 0.83 aspect roughly
        const GAP = 100;
        const SIDE_PADDING = 100;

        // Canvas Size
        totalWidth = (P_WIDTH * images.length) + (GAP * (images.length - 1)) + (SIDE_PADDING * 2);
        totalHeight = P_HEIGHT + (SIDE_PADDING * 2);
    } else {
        // Grid: 2x2
        const oneW = images[0].width * globalScale;
        const oneH = images[0].height * globalScale;
        totalWidth = Math.ceil(oneW * 2);
        totalHeight = Math.ceil(oneH * 2);
    }

    // 5. Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    // Background (Transparent for Instant Grid, Black for others)
    if (layout === 'instant-grid') {
        // Explicitly clear to ensure transparency (Canvas is transparent by default but good to be safe)
        ctx.clearRect(0, 0, totalWidth, totalHeight);
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, totalWidth, totalHeight);
    }

    // Better interpolation for scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let currentPos = 0;

    // Drawing Logic
    if (layout === 'instant-grid') {
        const P_WIDTH = 600;
        const P_HEIGHT = 720;
        const GAP = 100;
        const SIDE_PADDING = 100;

        // Draw each polaroid
        images.forEach((img, i) => {
            const x = SIDE_PADDING + (i * (P_WIDTH + GAP));
            const y = SIDE_PADDING;

            ctx.save();

            // Random rotation between -2 and 2 degrees
            const rot = (Math.random() * 4 - 2) * (Math.PI / 180);

            // Translate to center of card for rotation
            ctx.translate(x + P_WIDTH / 2, y + P_HEIGHT / 2);
            ctx.rotate(rot);
            ctx.translate(-(x + P_WIDTH / 2), -(y + P_HEIGHT / 2));

            // Shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 10;

            // White Card Bg
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x, y, P_WIDTH, P_HEIGHT);

            // Reset Shadow for image
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Inner Image (Padding: 24px sides/top, 120px bottom)
            const imgX = x + 24;
            const imgY = y + 24;
            const imgW = P_WIDTH - 48; // 600 - 48 = 552
            const imgH = P_HEIGHT - 144; // 720 - 144 = 576. Almost square.

            // Draw Black Image Bg
            ctx.fillStyle = "#111";
            ctx.fillRect(imgX, imgY, imgW, imgH);

            // Draw Image (Cover Fit)
            // Calculate source dimensions to center-crop
            const imgAspect = img.width / img.height;
            const frameAspect = imgW / imgH;
            let sx, sy, sw, sh;

            if (imgAspect > frameAspect) {
                // Image is wider than frame -> limit height, crop width
                sh = img.height;
                sw = img.height * frameAspect;
                sy = 0;
                sx = (img.width - sw) / 2;
            } else {
                // Image is taller -> limit width, crop height
                sw = img.width;
                sh = img.width / frameAspect;
                sx = 0;
                sy = (img.height - sh) / 2;
            }

            ctx.drawImage(img, sx, sy, sw, sh, imgX, imgY, imgW, imgH);

            // Texture Overlay (Noise) - Approximate with grain? 
            // Canvas doesn't support complex SVG filters easily without import. 
            // We'll skip noise for now or add simple grain if needed.

            // Bottom Text
            ctx.fillStyle = "#000"; // Darker (was #222)
            ctx.font = "bold 24px Courier New, Courier, monospace";
            ctx.globalAlpha = 1.0; // Full opacity
            ctx.fillText("PANOSPACE", x + 30, y + P_HEIGHT - 50);

            // Planet Logo (Simple drawing)
            const lx = x + P_WIDTH - 50;
            const ly = y + P_HEIGHT - 60;

            // Circle
            ctx.beginPath();
            ctx.arc(lx, ly, 12, 0, Math.PI * 2);
            ctx.fillStyle = "#111"; // Darker
            ctx.fill();

            // Ring
            ctx.beginPath();
            ctx.ellipse(lx, ly, 22, 6, -20 * Math.PI / 180, 0, Math.PI * 2);
            ctx.strokeStyle = "#000"; // Black stroke
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.globalAlpha = 1.0;
            ctx.restore();
        });

    } else if (layout === 'grid') {
        const cellWidth = totalWidth / 2;
        const cellHeight = totalHeight / 2;
        processedImages.forEach((item, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            ctx.drawImage(item.img, item.sx, item.sy, item.sw, item.sh, col * cellWidth, row * cellHeight, cellWidth, cellHeight);
        });
    } else {
        processedImages.forEach((item) => {
            if (layout === 'vertical') {
                ctx.drawImage(
                    item.img, item.sx, item.sy, item.sw, item.sh,
                    0, Math.floor(currentPos), Math.ceil(item.dw), Math.ceil(item.dh)
                );
                currentPos += item.dh;
            } else {
                ctx.drawImage(
                    item.img, item.sx, item.sy, item.sw, item.sh,
                    Math.floor(currentPos), 0, Math.ceil(item.dw), Math.ceil(item.dh)
                );
                currentPos += item.dw;
            }
        });
    }

    // 6. Return DataURL and Blob
    return new Promise((resolve) => {
        const previewUrl = canvas.toDataURL('image/jpeg', 0.85);
        canvas.toBlob((blob) => {
            resolve({ previewUrl, blob });
        }, 'image/jpeg', 0.85);
    });
};
