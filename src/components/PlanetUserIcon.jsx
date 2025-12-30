import React, { Suspense } from 'react';

// Lazy load SeedOscillatorAvatar to split bundle
const SeedOscillatorAvatar = React.lazy(() => import('@/components/profile/SeedOscillatorAvatar'));

// Custom "Planet Head" Default Avatar
const PlanetUserIcon = ({ size = 32, color = "#7FFFD4", icon = "planet-head", glow = false, seed = 'panospace', ...rest }) => {
    // Check for Seed Oscillator
    if (icon === 'seed_oscillator') {
        return (
            <div style={{ width: size, height: size, position: 'relative' }}>
                <Suspense fallback={<div style={{ width: '100%', height: '100%', background: 'transparent' }} />}>
                    <SeedOscillatorAvatar seed={seed} color={color} />
                </Suspense>
            </div>
        );
    }

    // Ensure safe props
    const safeColor = (color && typeof color === 'string') ? color : "#7FFFD4";
    const safeIcon = (icon && typeof icon === 'string') ? icon : "planet-head";

    // Detect Text Gradient (e.g. Iridescent)
    const isGradient = safeColor.includes('gradient');
    const gradientId = `icon-grad-${Math.random().toString(36).substr(2, 9)}`;

    // Common props for consistency
    const strokeProps = {
        stroke: isGradient ? `url(#${gradientId})` : safeColor,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        fill: "none"
    };

    // Gradient Definitions
    const renderGradient = () => {
        if (!isGradient) return null;

        // Match Iridescent
        if (safeColor.includes('#6EFFD8') && safeColor.includes('#FF6E9A')) {
            return (
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6EFFD8" />
                        <stop offset="50%" stopColor="#8F6EFF" />
                        <stop offset="100%" stopColor="#FF6E9A" />
                    </linearGradient>
                </defs>
            );
        }
        // Match Brand
        if (safeColor === 'brand' || safeColor.includes('#5A3FFF')) {
            return (
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7FFFD4" />
                        <stop offset="25%" stopColor="#FF5C8A" />
                        <stop offset="50%" stopColor="#5A3FFF" />
                        <stop offset="75%" stopColor="#1B82FF" />
                        <stop offset="100%" stopColor="#FF914D" />
                    </linearGradient>
                </defs>
            );
        }

        // Fallback for unknown gradient - just use the first color found or white
        return (
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#7FFFD4" />
                </linearGradient>
            </defs>
        );
    };

    const renderIcon = () => {
        switch (safeIcon) {
            case 'planet': // Brand Planet Logo
                return (
                    <g>
                        <circle cx="16" cy="16" r="7" {...strokeProps} />
                        <ellipse cx="16" cy="16" rx="14" ry="4" {...strokeProps} transform="rotate(-20 16 16)" />
                    </g>
                );
            case 'star':
                return <path d="M16 2l3.09 6.26L26 9.27l-5 4.87 1.18 6.88L16 17.77l-6.18 3.25L11 14.14 6 9.27l6.91-1.01L16 2z" {...strokeProps} transform="translate(0, 4.5)" />;
            case 'sparkles':
                return (
                    <g transform="translate(0, 0)">
                        <path d="M16 4l2.5 5.5L24 12l-5.5 2.5L16 20l-2.5-5.5L8 12l5.5-2.5L16 4z" {...strokeProps} />
                        <path d="M6 4l1.5 2.5L10 8l-2.5 1.5L6 12l-1.5-2.5L2 8l2.5-1.5L6 4z" {...strokeProps} strokeWidth={1.5} transform="translate(2, 2)" />
                        <path d="M26 22l1.5 2.5L30 26l-2.5 1.5L26 30l-1.5-2.5L22 26l2.5-1.5L26 22z" {...strokeProps} strokeWidth={1.5} transform="translate(-2, -2)" />
                    </g>
                );
            case 'sun':
                return (
                    <g>
                        <circle cx="16" cy="16" r="6" {...strokeProps} />
                        <path d="M16 2V5M16 27V30M5.05 5.05L7.17 7.17M24.83 24.83L26.95 26.95M2 16H5M27 16H30M5.05 26.95L7.17 24.83M24.83 7.17L26.95 5.05" {...strokeProps} />
                    </g>
                );
            case 'fire':
                return (
                    <g>
                        <path d="M18 4c0 0-4.5 4.5-4.5 9.5c0 2.5 1.5 4.5 3 5.5c0 0-1 1.5-3 1.5c-4 0-7-3-7-8c0-5 6-10 11.5-12.5" {...strokeProps} />
                        <path d="M16 28c-4 0-7-3-7-7c0-3 1.5-5 3-6" {...strokeProps} />
                        <path d="M16 28c4 0 7-3 7-7c0-4-3-7-3-7" {...strokeProps} />
                    </g>
                );
            case 'lightning':
                return <path d="M12 2V13H15V26L21 11H17L21 2H12Z" {...strokeProps} transform="translate(-0.5, 2)" />;
            case 'rocket':
                return (
                    <g transform="rotate(45 16 16) translate(-0.5, -0.5)">
                        <path d="M16 2C16 2 11 9 11 15V21H21V15C21 9 16 2 16 2Z" {...strokeProps} />
                        <path d="M10 16L6 21V22H11" {...strokeProps} />
                        <path d="M22 16L26 21V22H21" {...strokeProps} />
                        <circle cx="16" cy="13" r="3" {...strokeProps} />
                    </g>
                );
            case 'smile':
                return (
                    <g>
                        <circle cx="16" cy="16" r="13" {...strokeProps} />
                        <circle cx="11" cy="12" r="1.5" fill={safeColor} stroke="none" />
                        <circle cx="21" cy="12" r="1.5" fill={safeColor} stroke="none" />
                        <path d="M9 19C9 19 12 22 16 22C20 22 23 19 23 19" {...strokeProps} />
                    </g>
                );
            case 'heart':
                return <path d="M16 28.5l-1.9-1.7C8.1 21.6 4 17.8 4 13.1C4 9.3 6.9 6.4 10.7 6.4c2.1 0 4.1 1 5.3 2.6c1.2-1.6 3.2-2.6 5.3-2.6C25.1 6.4 28 9.3 28 13.1c0 4.7-4.1 8.5-10.1 13.7L16 28.5z" {...strokeProps} transform="translate(0, -1)" />;
            case 'music':
                return <path d="M15 4V19.55C14.2 19.1 13.3 19 12.5 19C9.5 19 7 21.5 7 24.5C7 27.5 9.5 30 12.5 30C15.5 30 18 27.5 18 24.5V10H25V4H15Z" {...strokeProps} transform="translate(-1, -2)" />;
            case 'alien':
                return (
                    <g>
                        <path d="M16 2C9 2 4 6 4 13C4 20 9 29 16 29C23 29 28 20 28 13C28 6 23 2 16 2Z" {...strokeProps} />
                        <path d="M10 13C10 13 8 15 8 17" {...strokeProps} />
                        <path d="M22 13C22 13 24 15 24 17" {...strokeProps} />
                        <path d="M13 24H19" {...strokeProps} />
                    </g>
                );
            case 'ufo':
                return (
                    <g>
                        <path d="M16 4C13 4 10 6 9 9H23C22 6 19 4 16 4Z" {...strokeProps} />
                        <path d="M3 15C3 12 6 9 16 9C26 9 29 12 29 15C29 18 26 20 16 20C6 20 3 18 3 15Z" {...strokeProps} />
                        <path d="M9 16C9 16 12 19 16 19C20 19 23 16 23 16" {...strokeProps} strokeWidth={1} />
                    </g>
                );
            case 'planet-head':
            default:
                // Original Default
                return (
                    <g>
                        <path d="M6 31C6 24 10.5 21 16 21C21.5 21 26 24 26 31" {...strokeProps} />
                        <circle cx="16" cy="12" r="5" {...strokeProps} />
                        <ellipse cx="16" cy="12" rx="9" ry="2.5" {...strokeProps} transform="rotate(-15 16 12)" strokeWidth={1.5} />
                    </g>
                );
        }
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                filter: glow ? `drop-shadow(0 0 4px ${safeColor})` : 'none',
                transition: 'filter 0.3s ease'
            }}
        >
            {renderGradient()}
            {renderIcon()}
        </svg>
    );
};

export default PlanetUserIcon;
