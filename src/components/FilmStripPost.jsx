import React, { useMemo } from 'react';
import '../styles/film-strip-post.css';
import DateStampOverlay from './DateStampOverlay';
import SmartImage from './SmartImage';

// Static sprockets renderer to avoid re-creation
const Sprockets = React.memo(() => (
    <div className="cyber-sprockets">
        {/* 8 holes per frame is standard for 35mm */}
        {[...Array(8)].map((_, i) => (
            <span key={i}></span>
        ))}
    </div>
));

/**
 * FilmStripPost - Authentic 35mm Film Edition
 * Realistic film structure with authentic markings and subtle grain.
 */
const FilmStripPost = ({ images = [], uiOverlays = null, priority = 'normal' }) => {
    // Generate authentic frame numbers (like real film: 22A, 23, 24A, etc.)
    const getFrameNumber = (index) => {
        const frameNum = index + 1;
        // Alternate between A suffix and no suffix for authenticity
        return frameNum % 2 === 0 ? `${frameNum}` : `${frameNum}A`;
    };

    // Generate edge codes (authentic film marking system)
    const getEdgeCode = (index) => {
        // Format: Letter + 3 digits (e.g., K127, K128)
        return `K${(index + 100).toString()}`;
    };

    // Stock name - simple and clean
    const getStockName = () => {
        return 'PANOSPACE';
    };

    return (
        <div className="cyber-film-strip-wrapper">
            <div className="cyber-film-strip-scroll-container">
                {/* Film Leader (Start) */}
                <div className="cyber-leader">
                </div>

                {images.map((item, index) => (
                    <div key={index} className="cyber-frame-unit">
                        {/* Top Film Edge */}
                        <div className="cyber-track top">
                            <span className="cyber-micro-text">{getStockName()}</span>
                            <span className="cyber-frame-number">{getFrameNumber(index)}</span>
                            <Sprockets />
                        </div>

                        {/* Main Content Area */}
                        <div className="cyber-content-row">
                            <div className="cyber-marker left">
                                <span className="vertical-text">{getFrameNumber(index)}</span>
                            </div>

                            <div className="cyber-image-container">
                                {item.url || (typeof item === 'string' && item.match(/^http/)) ? (
                                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                        <SmartImage
                                            src={item.url || item}
                                            alt={`Frame ${index + 1}`}
                                            className="cyber-image"
                                            priority={priority}
                                            objectFit="cover"
                                            keepLoaded={true}
                                        />
                                        {uiOverlays?.quartzDate && (
                                            <DateStampOverlay quartzDate={uiOverlays.quartzDate} />
                                        )}
                                    </div>
                                ) : (
                                    <div className="cyber-text-fallback">
                                        {item.content || item.text || (typeof item === 'string' ? item : 'VOID')}
                                    </div>
                                )}
                            </div>

                            <div className="cyber-marker right">
                                {/* Only show right marker if it's the last item */}
                                {index === images.length - 1 && <span className="vertical-text">END</span>}
                            </div>
                        </div>

                        {/* Bottom Film Edge */}
                        <div className="cyber-track bottom">
                            <span className="cyber-edge-code">{getEdgeCode(index)}</span>
                            <Sprockets />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'absolute', bottom: '8px', right: '16px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                    <defs>
                                        <radialGradient id="filmPlanetGrad" cx="40%" cy="40%">
                                            <stop offset="0%" style={{ stopColor: '#7FFFD4', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#00CED1', stopOpacity: 1 }} />
                                        </radialGradient>
                                    </defs>
                                    <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />
                                    <circle cx="12" cy="12" r="7" fill="url(#filmPlanetGrad)" opacity="0.95" />
                                    <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)" strokeDasharray="0,8,20,100" />
                                </svg>
                                <span className="cyber-micro-text" style={{ position: 'static' }}>2025</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Film Trailer (End) */}
                <div className="cyber-leader trailer">
                </div>
            </div>
        </div>
    );
};

export default React.memo(FilmStripPost);
