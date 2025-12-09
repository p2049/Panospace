import React from 'react';

// Custom "Planet Head" Default Avatar
const PlanetUserIcon = ({ size = 32, color = "#7FFFD4" }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Torso */}
        <path d="M6 31C6 24 10.5 21 16 21C21.5 21 26 24 26 31" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Planet Head */}
        <circle cx="16" cy="12" r="5" stroke={color} strokeWidth="2" />
        {/* Ring */}
        <ellipse cx="16" cy="12" rx="9" ry="2.5" stroke={color} strokeWidth="1.5" transform="rotate(-15 16 12)" />
    </svg>
);

export default PlanetUserIcon;
