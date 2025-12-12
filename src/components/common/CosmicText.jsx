import React from 'react';
import { renderCosmicUsername } from '@/utils/usernameRenderer';

/**
 * CosmicText
 * Renders text with PanoSpace custom emojis mixed in.
 * reusable wrapper around usernameRenderer logic.
 */
const CosmicText = ({ text, color, glow, style, className }) => {
    return (
        <span className={className} style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
            {renderCosmicUsername(text, color, glow)}
        </span>
    );
};

export default CosmicText;
