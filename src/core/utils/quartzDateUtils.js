/**
 * Quartz Date Style Calculator
 * 
 * Calculates the exact positioning and sizing for the Quartz Date Overlay
 * so it stays attached to the image content (not the viewport) and scales consistently
 * regardless of device size or aspect ratio.
 */
export const getQuartzDateStyle = (containerWidth, containerHeight, imageWidth, imageHeight) => {
    // If dimensions are missing, fallback to relative viewport positioning (safe default)
    if (!containerWidth || !containerHeight || !imageWidth || !imageHeight) {
        return {
            fontSize: 'max(14px, 3vh)',
            bottom: '4%',
            right: '4%'
        };
    }

    const containerAspect = containerWidth / containerHeight;
    const imageAspect = imageWidth / imageHeight;

    let renderedWidth, renderedHeight;

    // Simulate object-fit: contain logic to find actual image rect
    if (imageAspect > containerAspect) {
        // Image is wider than container (relative to aspect) -> Limited by Width
        renderedWidth = containerWidth;
        renderedHeight = containerWidth / imageAspect;
    } else {
        // Image is taller than container -> Limited by Height
        renderedHeight = containerHeight;
        renderedWidth = renderedHeight * imageAspect;
    }

    // User-specified ratios
    // dateHeight = imageHeight * 0.045
    // datePadding = imageHeight * 0.03
    const fontSize = renderedHeight * 0.045;
    const padding = renderedHeight * 0.03;

    // Calculate offsets from the CONTAINER edges
    // The image is centered, so the gap is (ContainerDim - ImageDim) / 2
    const marginBottom = (containerHeight - renderedHeight) / 2;
    const marginRight = (containerWidth - renderedWidth) / 2;

    return {
        fontSize: `${Math.max(10, fontSize)}px`, // Enforce minimum legibility
        bottom: `${marginBottom + padding}px`,
        right: `${marginRight + padding}px`,
        // Ensure standard positioning props are reset if needed
        left: 'auto',
        top: 'auto',
        transform: 'none'
    };
};
