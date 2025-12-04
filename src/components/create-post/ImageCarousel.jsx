import React from 'react';
import { FaImage, FaTimes, FaStore, FaCamera, FaPlus } from 'react-icons/fa';
import ThumbnailStrip from './ThumbnailStrip';

/**
 * ImageCarousel Component
 * 
 * Displays the main image carousel with:
 * - Empty state when no images
 * - Swipeable carousel track
 * - Remove button on each slide
 * - Shop toggle checkbox
 * - EXIF badge indicator
 * - Thumbnail strip
 * - Add more photos button
 * 
 * @param {Array} slides - Array of slide objects
 * @param {number} activeSlideIndex - Index of currently active slide
 * @param {Function} setActiveSlideIndex - Handler to change active slide
 * @param {Function} removeSlide - Handler to remove a slide
 * @param {Function} updateSlide - Handler to update slide properties
 * @param {Function} onTouchStart - Touch start handler for swipe
 * @param {Function} onTouchMove - Touch move handler for swipe
 * @param {Function} onTouchEnd - Touch end handler for swipe
 * @param {Function} handleDragStart - Drag start handler for thumbnails
 * @param {Function} handleDragOver - Drag over handler for thumbnails
 * @param {Function} handleDrop - Drop handler for thumbnails
 * @param {Function} moveSlide - Handler to move slide left/right
 * @param {Function} onAddMoreClick - Handler when "Add Another Photo" is clicked
 */
const ImageCarousel = ({
    slides,
    activeSlideIndex,
    setActiveSlideIndex,
    removeSlide,
    updateSlide,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    handleDragStart,
    handleDragOver,
    handleDrop,
    moveSlide,
    onAddMoreClick
}) => {
    // Empty state - no slides yet
    if (slides.length === 0) {
        return (
            <div className="empty-state" onClick={onAddMoreClick}>
                {/* Subtle floating elements */}
                <div style={{ position: 'absolute', top: '15%', left: '15%', width: '3px', height: '3px', background: 'var(--ice-mint)', borderRadius: '50%', boxShadow: '0 0 8px rgba(127, 255, 212, 0.6)', animation: 'float 3s infinite ease-in-out', opacity: 0.6 }}></div>
                <div style={{ position: 'absolute', top: '25%', right: '20%', width: '2px', height: '2px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 4px #fff', animation: 'float 4s infinite ease-in-out', animationDelay: '1s', opacity: 0.4 }}></div>
                <div style={{ position: 'absolute', bottom: '20%', left: '25%', width: '2px', height: '2px', background: 'var(--ice-mint)', borderRadius: '50%', boxShadow: '0 0 6px rgba(127, 255, 212, 0.5)', animation: 'pulse 2s infinite', opacity: 0.5 }}></div>

                <FaPlus size={32} color="var(--ice-mint)" style={{ filter: 'drop-shadow(0 0 10px rgba(127, 255, 212, 0.5))' }} />
                <p style={{ color: 'var(--ice-mint)', marginTop: '1rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Add Photos</p>
                <span style={{ fontSize: '0.8rem', color: 'rgba(127, 255, 212, 0.6)', marginTop: '0.5rem' }}>
                    or drag and drop
                </span>
                <div style={{
                    marginTop: '1.5rem',
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.4)',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '0.8rem',
                    display: 'flex',
                    gap: '0.8rem',
                    fontFamily: 'var(--font-family-mono)',
                    letterSpacing: '0.05em'
                }}>
                    <span>300 DPI RECOMMENDED</span>
                    <span>•</span>
                    <span>RAW SUPPORTED</span>
                    <span>•</span>
                    <span>UP TO 10 SLIDES</span>
                </div>
            </div>
        );
    }

    // Carousel with slides
    return (
        <div className="carousel-container">
            <div
                className="carousel-track"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                    transform: `translateX(-${activeSlideIndex * 100}%)`,
                    transition: 'transform 0.3s ease-out'
                }}
            >
                {slides.map((slide, idx) => (
                    <div key={idx} className="carousel-slide">
                        <img src={slide.preview} alt={`Slide ${idx + 1}`} />

                        <div className="carousel-overlay">
                            <button
                                className="slide-remove-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeSlide(idx, e);
                                }}
                            >
                                <FaTimes />
                            </button>

                            <div className="overlay-bottom-bar">
                                <label className="shop-toggle-small" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={slide.addToShop}
                                        onChange={(e) => updateSlide(idx, { addToShop: e.target.checked })}
                                    />
                                    <FaStore /> Shop
                                </label>
                                {(slide.exif || slide.manualExif) && (
                                    <span className="exif-badge"><FaCamera /></span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Thumbnail Scrollbar with Reorder Controls */}
            <ThumbnailStrip
                slides={slides}
                activeSlideIndex={activeSlideIndex}
                setActiveSlideIndex={setActiveSlideIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                moveSlide={moveSlide}
            />

            {/* Add More Button */}
            <button
                className="add-more-carousel-btn"
                onClick={onAddMoreClick}
            >
                <FaPlus /> Add Another Photo
            </button>
        </div>
    );
};

export default ImageCarousel;
