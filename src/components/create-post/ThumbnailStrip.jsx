import React from 'react';

/**
 * ThumbnailStrip Component
 * 
 * Displays a horizontal scrollbar of image thumbnails with:
 * - Active slide indicator
 * - Drag-and-drop reordering
 * - Left/Right arrow buttons for reordering
 * - Click to select thumbnail
 * 
 * @param {Array} slides - Array of slide objects with preview URLs
 * @param {number} activeSlideIndex - Index of currently active slide
 * @param {Function} setActiveSlideIndex - Handler to change active slide
 * @param {Function} handleDragStart - Drag start handler
 * @param {Function} handleDragOver - Drag over handler
 * @param {Function} handleDrop - Drop handler
 * @param {Function} moveSlide - Handler to move slide left or right
 */
const ThumbnailStrip = ({
    slides,
    activeSlideIndex,
    setActiveSlideIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    moveSlide
}) => {
    // Only show if there's more than one slide
    if (slides.length <= 1) return null;

    return (
        <div className="thumbnail-scrollbar">
            {slides.map((slide, idx) => (
                <div
                    key={idx}
                    className={`thumbnail ${idx === activeSlideIndex ? 'active' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    onClick={() => setActiveSlideIndex(idx)}
                    style={{ position: 'relative', cursor: 'grab' }}
                >
                    <img
                        src={slide.preview}
                        alt={`Thumbnail ${idx + 1}`}
                        draggable={false}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    {idx === activeSlideIndex && (
                        <div className="thumbnail-indicator" />
                    )}
                    {/* Reorder arrows */}
                    <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        display: 'flex',
                        gap: '2px',
                        opacity: 0.8
                    }}>
                        {idx > 0 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    moveSlide(idx, 'left');
                                }}
                                style={{
                                    background: 'rgba(0,0,0,0.7)',
                                    border: 'none',
                                    borderRadius: '3px',
                                    color: '#7FFFD4',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '10px'
                                }}
                                title="Move left"
                            >
                                ←
                            </button>
                        )}
                        {idx < slides.length - 1 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    moveSlide(idx, 'right');
                                }}
                                style={{
                                    background: 'rgba(0,0,0,0.7)',
                                    border: 'none',
                                    borderRadius: '3px',
                                    color: '#7FFFD4',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '10px'
                                }}
                                title="Move right"
                            >
                                →
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ThumbnailStrip;
