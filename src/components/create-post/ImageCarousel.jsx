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
                <FaImage size={48} />
                <p>Click to select images</p>
                <span>Up to 10 images</span>
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
