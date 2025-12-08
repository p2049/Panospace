import React from 'react';
import '@/styles/film-strip-35mm.css';

/**
 * FilmStrip35mm - Photorealistic 35mm Film Strip Simulation
 * 
 * This component creates an accurate photographic simulation of a real 35mm film negative strip.
 * NOT a UI element - this is meant to look like an actual scanned film strip on a light table.
 * 
 * Real 35mm film specifications:
 * - Frame size: 36mm × 24mm (3:2 aspect ratio)
 * - Sprocket holes: 1.98mm × 2.79mm, spaced 4.75mm apart
 * - Film width: 35mm total (including sprockets)
 * - Border thickness: ~2mm on each side
 * - Frame spacing: ~1mm between frames
 */
const FilmStrip35mm = ({
    images = [],
    filmStock = 'KODAK PORTRA 400',
    startFrame = 1,
    className = ''
}) => {

    // Generate frame numbers (1A, 2A, 3A, etc.)
    const getFrameNumber = (index) => {
        const frameNum = startFrame + index;
        return `${frameNum}A`;
    };

    return (
        <div className={`film-strip-35mm ${className}`}>
            {/* Top film edge with markings */}
            <div className="film-edge film-edge-top">
                <div className="film-stock-label">{filmStock}</div>
                <div className="safety-film-text">SAFETY FILM</div>
            </div>

            {/* Main film body with sprockets and frames */}
            <div className="film-body">
                {/* Top sprocket strip */}
                <div className="sprocket-track sprocket-track-top">
                    {images.map((_, index) => (
                        <div key={`top-sprocket-${index}`} className="sprocket-group">
                            <div className="sprocket-hole"></div>
                            <div className="sprocket-hole"></div>
                            <div className="sprocket-hole"></div>
                            <div className="sprocket-hole"></div>
                        </div>
                    ))}
                </div>

                {/* Image frames */}
                <div className="film-frames">
                    {images.map((image, index) => (
                        <React.Fragment key={index}>
                            <div className="film-frame">
                                <div className="frame-number frame-number-left">{getFrameNumber(index)}</div>
                                <div className="frame-image-container">
                                    <img
                                        src={image.url || image}
                                        alt={`Frame ${getFrameNumber(index)}`}
                                        className="frame-image"
                                    />
                                </div>
                                <div className="frame-number frame-number-right">{getFrameNumber(index)}</div>
                            </div>
                            {index < images.length - 1 && <div className="frame-separator"></div>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Bottom sprocket strip */}
                <div className="sprocket-track sprocket-track-bottom">
                    {images.map((_, index) => (
                        <div key={`bottom-sprocket-${index}`} className="sprocket-group">
                            <div className="sprocket-hole"></div>
                            <div className="sprocket-hole"></div>
                            <div className="sprocket-hole"></div>
                            <div className="sprocket-hole"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom film edge */}
            <div className="film-edge film-edge-bottom">
                <div className="edge-code">KODAK 5207</div>
            </div>
        </div>
    );
};

export default FilmStrip35mm;
