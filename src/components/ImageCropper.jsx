import React, { useState, useRef, useEffect } from 'react';
import { FaCheck, FaTimes, FaMinus, FaPlus, FaUndo } from 'react-icons/fa';

const CROP_SIZE = 280;

const ImageCropper = ({ imageSrc, onCrop, onCancel }) => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });

    const containerRef = useRef(null);
    const imageRef = useRef(null);

    // Load image size on mount
    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            // Calculate base dimensions to 'cover' the crop area
            const aspect = img.naturalWidth / img.naturalHeight;
            let renderWidth, renderHeight;

            if (aspect > 1) {
                // Landscape
                renderHeight = CROP_SIZE;
                renderWidth = CROP_SIZE * aspect;
            } else {
                // Portrait
                renderWidth = CROP_SIZE;
                renderHeight = CROP_SIZE / aspect;
            }

            setImageSize({
                width: renderWidth,
                height: renderHeight,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
            });
        };
    }, [imageSrc]);

    const getClientPos = (e) => {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    };

    const handleStart = (e) => {
        e.preventDefault();
        const pos = getClientPos(e);
        setDragging(true);
        setDragStart({ x: pos.x - offset.x, y: pos.y - offset.y });
    };

    const handleMove = (e) => {
        if (!dragging) return;
        const pos = getClientPos(e);
        setOffset({
            x: pos.x - dragStart.x,
            y: pos.y - dragStart.y
        });
    };

    const handleEnd = () => {
        setDragging(false);
    };

    const handleCrop = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const OUTPUT_SIZE = 512;

        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;

        // Fill black (optional, mostly covered)
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

        // Calculate Scale Factor
        // The renderSize (imageSize.width) corresponds to naturalWidth
        // We displayed it in a window of CROP_SIZE (but actually overflowed).
        // The visible center is (CROP_SIZE/2, CROP_SIZE/2)
        // The image center is offsets from that.

        // Let's use the transform matrix approach which is robust.
        // Screen space: Center is (CROP_SIZE/2, CROP_SIZE/2)
        // Image is drawn at: (CROP_SIZE/2 + offset.x - renderWidth/2) * zoom? 
        // Wait, my CSS transform below is: translate(-50%, -50%) translate(offset.x, offset.y) scale(zoom)
        // on an image absolutely positioned at left: 50%, top: 50%.

        // So visually:
        // The image's center is at (ContainerCenter + Offset).
        // And it is scaled by Zoom.

        // Mapping to Canvas (OUTPUT_SIZE):
        // Scale ratio S = OUTPUT_SIZE / CROP_SIZE
        // Canvas Center = OUTPUT_SIZE / 2

        const S = OUTPUT_SIZE / CROP_SIZE;

        ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
        ctx.translate(offset.x * S, offset.y * S);
        ctx.scale(zoom, zoom);

        // We need to draw the image such that its own center is at (0,0) in current context,
        // scaled by the ratio of (RenderSize / CROP_SIZE) * S ?
        // No. If RenderSize = CROP_SIZE (at zoom 1), it fits exactly.
        // But the natural image is potentially huge.
        // We want to draw the natural image scaled down to "RenderSize" effectively.

        // Scale to map Natural -> CanvasPixels
        // If zoom=1, we want NaturalWidth to take up (RenderWidth * S) pixels.
        // So scale = (RenderWidth * S) / NaturalWidth

        const drawScale = (imageSize.width * S) / imageSize.naturalWidth;
        ctx.scale(drawScale, drawScale);

        ctx.drawImage(
            imageRef.current,
            -imageSize.naturalWidth / 2,
            -imageSize.naturalHeight / 2
        );

        canvas.toBlob((blob) => {
            onCrop(blob);
        }, 'image/jpeg', 0.9);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Adjust Profile Photo</h3>

            <div
                ref={containerRef}
                style={{
                    width: CROP_SIZE,
                    height: CROP_SIZE,
                    borderRadius: '40px',
                    border: '2px solid #7FFFD4',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#222',
                    cursor: dragging ? 'grabbing' : 'grab',
                    touchAction: 'none' // Prevent scrolling
                }}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            >
                {imageSrc && (
                    <img
                        ref={imageRef}
                        src={imageSrc}
                        alt="Crop Preview"
                        draggable={false}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            width: imageSize.width,
                            height: imageSize.height,
                            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                            transformOrigin: 'center',
                            pointerEvents: 'none', // Let container handle events
                            userSelect: 'none'
                        }}
                    />
                )}
            </div>

            {/* Controls */}
            <div style={{ marginTop: '2rem', width: '80%', maxWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#7FFFD4' }}>
                    <FaMinus size={12} />
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        style={{ flex: 1, accentColor: '#7FFFD4' }}
                    />
                    <FaPlus size={12} />
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <FaTimes /> Cancel
                </button>
                <button
                    onClick={handleCrop}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: '#7FFFD4',
                        color: '#000',
                        border: 'none',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <FaCheck /> Save Photo
                </button>
            </div>
        </div>
    );
};

export default ImageCropper;
