import React from 'react';

/**
 * FilmSprockets Component
 * Wraps content (usually an image) in a container that looks like a strip of film.
 * Renders sprocket holes on the left and right sides.
 */
const FilmSprockets = ({ children, className = '', style = {} }) => {
    return (
        <div className={`film-sprocket-container ${className}`} style={style}>
            {/* Left Sprocket Strip */}
            <div className="sprocket-strip sprocket-left"></div>

            {/* Content Area */}
            <div className="sprocket-content">
                {children}
            </div>

            {/* Right Sprocket Strip */}
            <div className="sprocket-strip sprocket-right"></div>
        </div>
    );
};

export default FilmSprockets;
