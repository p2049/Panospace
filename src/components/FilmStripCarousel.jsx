import React, { useRef } from 'react';
import '@/styles/film-strip-carousel.css';

/**
 * FilmStripCarousel - Clean, modern film strip UI for post viewer/**
 * FilmStripCarousel
 * A subtle, aesthetic film strip container for multi-image posts.
 * NOT a photorealistic simulation - just a clean, modern UI inspired by film.
 */
const FilmStripCarousel = ({ images = [], className = '', showSprockets = true }) => {
    const scrollRef = useRef(null);

    return (
        <div className={`film-strip-wrapper ${className} ${!showSprockets ? 'no-sprockets' : ''}`}>
            <div className="film-strip-container">
                {/* Top sprocket border - 8% of container height */}
                {showSprockets && (
                    <div className="film-strip-border film-strip-border-top">
                        <div className="sprocket-holes" />
                    </div>
                )}

                {/* Image row - 84% of container height */}
                <div className="film-strip-images-row" ref={scrollRef}>
                    {images.map((item, index) => (
                        <div key={index} className="film-frame">
                            {item.url || (typeof item === 'string' && item.match(/^http/)) ? (
                                <img
                                    src={item.url || item}
                                    alt={`Frame ${index + 1}`}
                                    className="film-frame-image"
                                />
                            ) : (
                                <div className="film-frame-text">
                                    {item.content || item.text || (typeof item === 'string' ? item : JSON.stringify(item))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom sprocket border - 8% of container height */}
                {showSprockets && (
                    <div className="film-strip-border film-strip-border-bottom">
                        <div className="sprocket-holes" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilmStripCarousel;
