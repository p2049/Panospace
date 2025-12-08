import React from 'react';
import { FaRocket } from 'react-icons/fa';

export const RocketIcon = ({ size = 24, color = "currentColor" }) => (
    <FaRocket size={size} color={color} />
);

export const AstronautIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: size }}>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 1.25c-5.185 0-9.51 3.86-9.967 8.973A3.75 3.75 0 0 0 .75 13.75c0 1.96 1.503 3.57 3.415 3.735C5.7 20.84 8.6 22.75 12 22.75c3.4 0 6.3-1.91 7.835-5.265 1.912-.165 3.415-1.775 3.415-3.735a3.75 3.75 0 0 0-1.283-3.527C21.51 3.51 17.185 1.25 12 1.25zM12 5a6 6 0 0 0-6 6c0 3.314 2.686 6 6 6s6-2.686 6-6a6 6 0 0 0-6-6z"
            fill={color}
        />
    </svg>
);

export const PlanetIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(-20 16 16)">
            <ellipse cx="16" cy="16" rx="11" ry="3" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
            <circle cx="16" cy="16" r="6" fill={color} />
            <ellipse cx="16" cy="16" rx="11" ry="3" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 6" />
        </g>
    </svg>
);
