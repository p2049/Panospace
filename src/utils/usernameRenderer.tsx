import React from 'react';

/**
 * Semantic/Cosmic Username Renderer
 * 
 * Replaces specific characters and patterns with corresponding emoji/icons.
 * UI-ONLY logic. Does not affect backend storage.
 */

// 1. Symbol Mapping
export const CHAR_MAP: Record<string, string> = {
    '@': '🪐',
    '.': '🌙',
    '*': '⭐',
    '/': '☄️',
    '"': '✨',
    '_': '🌟',
    '%': '🚀',
    '#': '🔥',
    '^': '🌊',
    '\\': '⚡',  // Backslash maps to Lightning
    '?': '🍄'
};

// 2. Pattern Mapping (Order matters: longer patterns first if overlapping)
export const PATTERNS = [
    { pattern: '<()', replacement: '☀️' },
    { pattern: '-()', replacement: '🌸' },
    { pattern: '[]', replacement: '📷' },
    { pattern: '()', replacement: '🌍' },
    { pattern: '{}', replacement: '🎨' },
    { pattern: ':)', replacement: '🙂' },
    { pattern: '<3', replacement: '❤️' },
    { pattern: '(0)', replacement: '🛸' },
    { pattern: '(8)', replacement: '👽' },
    { pattern: '(@)', replacement: '🌌' },
    { pattern: '(:)', replacement: '🎵' },
    { pattern: '<', replacement: ' ' }
];

// Helper: Collect all emoji characters for regex matching
const ALL_EMOJIS = new Set([
    ...Object.values(CHAR_MAP),
    ...PATTERNS.map(p => p.replacement).filter(r => r !== ' ') // Exclude space
]);

// Build a regex that matches any of the used emojis
// transforming ['🪐', '🌙'] into /🪐|🌙/g
const EMOJI_REGEX = new RegExp(`(${[...ALL_EMOJIS].join('|')})`, 'g');

/**
 * Renders a raw username into its Cosmic string equivalent (just text).
 * Use this for internal logic, length checks, etc.
 * @param {string} rawUsername 
 * @returns {string} rendered string
 */
export function renderCosmicString(rawUsername: string) {
    if (!rawUsername) return '';

    let processed = rawUsername;

    // A. Apply Multi-Character Patterns First
    for (const { pattern, replacement } of PATTERNS) {
        processed = processed.split(pattern).join(replacement);
    }

    // B. Apply Single-Character Symbols
    const result = Array.from(processed).map(char => {
        return CHAR_MAP[char] || char;
    }).join('');

    return result;
}

/**
 * Renders a raw username into a React Fragment with styled emojis.
 * Use this for UI display.
 * @param {string} rawUsername 
 * @returns {React.ReactNode} rendered JSX
 */
/**
 * Renders a raw username into a React Fragment with styled emojis.
 * Use this for UI display.
 * @param {string} rawUsername 
 * @param {string} [color] - Optional color override for specific symbols (planet/star)
 * @param {boolean} [glow] - Whether to apply neon glow effect
 * @returns {React.ReactNode} rendered JSX
 */
export function renderCosmicUsername(rawUsername: string, color?: string, glow?: boolean) {
    const cosmicString = renderCosmicString(rawUsername);

    // Split by regex to separate emojis from text
    const parts = cosmicString.split(EMOJI_REGEX);

    // Brand Palette
    const brandColors = ['#7FFFD4', '#FF5C8A', '#5A3FFF', '#1B82FF', '#FF914D'];
    let symbolCounter = 0;

    return (
        <span className="cosmic-username" style={{ fontFamily: 'inherit' }}>
            {parts.map((part, index) => {
                if (ALL_EMOJIS.has(part)) {
                    // Decide which color to use
                    const isBrand = color === 'brand';
                    const activeColor = isBrand ? brandColors[symbolCounter % brandColors.length] : (color || 'inherit');

                    if (isBrand) symbolCounter++;

                    if (color) {
                        const styleBase: React.CSSProperties = {
                            fontSize: '0.8em',
                            verticalAlign: '0.1em',
                            margin: '0 1px',
                            display: 'inline-block',
                            position: 'relative',
                            width: '1em',
                            height: '1em',
                            filter: glow ? `drop-shadow(0 0 5px ${activeColor})` : 'none'
                        };

                        // 1. Planet (Custom Two-Tone)
                        if (part === '🪐') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        <circle cx="16" cy="16" r="7" fill={activeColor} />
                                        <ellipse cx="16" cy="16" rx="14" ry="4" stroke={activeColor} strokeWidth="3" transform="rotate(-20 16 16)" />
                                    </svg>
                                </span>
                            );
                        }

                        // 2. Stars (Classic Star)
                        if (part === '⭐') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill={activeColor} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </span>
                            );
                        }

                        // 3. Glowing Star (Radiant)
                        if (part === '🌟') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke={activeColor} strokeWidth="2" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        <path d="M12 2L15 9L22 9L17 14L19 21L12 17L5 21L7 14L2 9L9 9L12 2Z" fill={activeColor} opacity="0.8" />
                                        <path d="M12 0L14 7L21 7L16 12L18 19L12 15L6 19L8 12L3 7L10 7L12 0Z" stroke={activeColor} strokeWidth="1" opacity="0.5" transform="scale(1.2) translate(-2 -2)" />
                                    </svg>
                                </span>
                            );
                        }

                        // 4. Sparkles (Three stars)
                        if (part === '✨') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill={activeColor} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" transform="scale(0.6) translate(8 8)" />
                                        <path d="M12 0L13.5 5.5L19 7L13.5 8.5L12 14L10.5 8.5L5 7L10.5 5.5L12 0Z" transform="scale(0.4) translate(40 0)" />
                                        <path d="M12 0L13.5 5.5L19 7L13.5 8.5L12 14L10.5 8.5L5 7L10.5 5.5L12 0Z" transform="scale(0.3) translate(0 40)" />
                                    </svg>
                                </span>
                            );
                        }

                        // 5. Sun (Circle with rays)
                        if (part === '☀️') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill={activeColor} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        <circle cx="12" cy="12" r="5" />
                                        <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={activeColor} strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </span>
                            );
                        }

                        // 6. Fire (Flame)
                        if (part === '🔥') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill={activeColor} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        <path d="M13.5 3C13.5 3 10 6.5 10 10.5C10 12.5 11.2 14.2 12.5 14.8C12.5 14.8 11.7 13.5 12.5 12.1C12.5 12.1 15.5 13.5 15.5 16.5C15.5 17.8 14.5 19.5 12 20C15.5 20 18 17.5 18 14.5C18 10.5 13.5 3 13.5 3Z" />
                                        <path d="M12 21C9 20.5 7 18.5 7 15C7 12 8.5 9.5 8.5 9.5C8.5 9.5 4 14.5 4 16.5C4 18.5 6 20.5 6 20.5H12Z" opacity="0.8" />
                                    </svg>
                                </span>
                            );
                        }

                        // 7. Lightning (Bolt)
                        if (part === '⚡') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill={activeColor} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        <path d="M7 2V13H10V22L17 10H13L17 2H7Z" />
                                    </svg>
                                </span>
                            );
                        }

                        // 8. Rocket (Ship) - Red parts match border color
                        if (part === '🚀') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        {/* Flame */}
                                        <path d="M12 22C12 22 10 20 10 18H14C14 20 12 22 12 22Z" fill={activeColor} opacity="0.8" />

                                        {/* Fins (Custom Color) */}
                                        <path d="M7 14L4 18V19H8V14H7Z" fill={activeColor} />
                                        <path d="M17 14L20 18V19H16V14H17Z" fill={activeColor} />

                                        {/* Body (White/Silver) */}
                                        <path d="M12 2C12 2 8 8 8 13V18H16V13C16 8 12 2 12 2Z" fill="#E6E6E6" />

                                        {/* Window */}
                                        <circle cx="12" cy="11" r="2.5" fill="#333" stroke={activeColor} strokeWidth="1" />

                                        {/* Tip/Nose (Custom Color) */}
                                        <path d="M12 2C12 2 9.5 6 9 8H15C14.5 6 12 2 12 2Z" fill={activeColor} />
                                    </svg>
                                </span>
                            );
                        }

                        // 9. Smile (Custom Face) - Uses activeColor
                        if (part === '🙂') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke={activeColor} strokeWidth="2" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        <circle cx="12" cy="12" r="10" />
                                        {/* Cute Eyes (Vertical ovals or simple dots but slightly larger feel) */}
                                        <circle cx="8" cy="9" r="1.5" fill={activeColor} stroke="none" />
                                        <circle cx="16" cy="9" r="1.5" fill={activeColor} stroke="none" />
                                        {/* Friendly Smile */}
                                        <path d="M7 14.5C7 14.5 9 17 12 17C15 17 17 14.5 17 14.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            );
                        }

                        // 10. Heart (Love)
                        if (part === '❤️') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill={activeColor} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </span>
                            );
                        }

                        // 11. Music (Note)
                        if (part === '🎵') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill={activeColor} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        <path d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z" />
                                    </svg>
                                </span>
                            );
                        }

                        // 14. Alien Head (Face)
                        if (part === '👽') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        {/* Head Shape */}
                                        <path d="M12 2C7 2 2 5 2 10C2 16 7 22 12 22C17 22 22 16 22 10C22 5 17 2 12 2Z" fill={activeColor} />

                                        {/* Classic Large Black Eyes */}
                                        <path d="M7 10C7 10 5 12 5 14C5 16 7 17 8.5 17C10 17 11 15 11 13C11 11 9 10 7 10Z" fill="black" />
                                        <path d="M17 10C17 10 19 12 19 14C19 16 17 17 15.5 17C14 17 13 15 13 13C13 11 15 10 17 10Z" fill="black" />

                                        {/* Small Mouth */}
                                        <path d="M10 19H14" stroke="black" strokeWidth="1" strokeLinecap="round" />
                                    </svg>
                                </span>
                            );
                        }

                        // 12. Alien Ship (UFO)
                        if (part === '🛸') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        {/* Dome (Light) */}
                                        <path d="M12 2C10 2 8 3.5 7 6H17C16 3.5 14 2 12 2Z" fill="#E0E0E0" opacity="0.9" />

                                        {/* Saucer Body (Silver) */}
                                        <path d="M2 11C2 9 4 7 12 7C20 7 22 9 22 11C22 13 20 14 12 14C4 14 2 13 2 11Z" fill="#B0B0B0" />

                                        {/* Lights/Glow Ring (Custom Color) */}
                                        <circle cx="5" cy="11" r="1.5" fill={activeColor} />
                                        <circle cx="9" cy="12" r="1.5" fill={activeColor} />
                                        <circle cx="15" cy="12" r="1.5" fill={activeColor} />
                                        <circle cx="19" cy="11" r="1.5" fill={activeColor} />

                                        {/* Bottom Ring (Darker Silver) */}
                                        <path d="M7 12C7 12 9 15 12 15C15 15 17 12 17 12" stroke="#666" strokeWidth="1" fill="none" opacity="0.5" />
                                    </svg>
                                </span>
                            );
                        }

                        // 13. Galaxy (Spiral)
                        if (part === '🌌') {
                            return (
                                <span key={index} style={styleBase}>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', verticalAlign: 'top' }}>
                                        <defs>
                                            <radialGradient id={`galaxyGlow_${index}`} cx="0.5" cy="0.5" r="0.5">
                                                <stop offset="0%" stopColor={activeColor} stopOpacity="0.6" />
                                                <stop offset="100%" stopColor={activeColor} stopOpacity="0" />
                                            </radialGradient>
                                        </defs>

                                        {/* Cosmic Glow Background */}
                                        <circle cx="12" cy="12" r="9" fill={`url(#galaxyGlow_${index})`} opacity="0.5" />

                                        {/* Swirling Spiral Arms - Primary Color */}
                                        <path d="M12 12C13.5 13.5 16 14 19 11" stroke={activeColor} strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M12 12C10.5 10.5 8 10 5 13" stroke={activeColor} strokeWidth="1.5" strokeLinecap="round" />

                                        {/* Secondary Arms - White/Stardust */}
                                        <path d="M12 12C13 11 16 9 18 5" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.6" />
                                        <path d="M12 12C11 13 8 15 6 19" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.6" />

                                        {/* Bright Core */}
                                        <circle cx="12" cy="12" r="2.5" fill="white" filter="drop-shadow(0 0 3px white)" />

                                        {/* Scattered Stars (Multi-colored for depth) */}
                                        <circle cx="4" cy="4" r="0.8" fill={activeColor} opacity="0.8" />
                                        <circle cx="20" cy="20" r="0.8" fill={activeColor} opacity="0.8" />
                                        <circle cx="20" cy="4" r="0.5" fill="white" opacity="0.6" />
                                        <circle cx="4" cy="20" r="0.5" fill="white" opacity="0.6" />
                                        <circle cx="16" cy="16" r="0.5" fill="white" opacity="0.4" />
                                        <circle cx="8" cy="8" r="0.5" fill="white" opacity="0.4" />
                                        <circle cx="12" cy="6" r="0.5" fill={activeColor} opacity="0.5" />
                                        <circle cx="12" cy="18" r="0.5" fill={activeColor} opacity="0.5" />
                                    </svg>
                                </span>
                            );
                        }
                    }

                    return (
                        <span key={index} style={{
                            fontSize: '0.8em',
                            verticalAlign: '0.1em',
                            margin: '0 1px',
                            display: 'inline-block',
                            position: 'relative',
                            lineHeight: 'normal',
                            overflow: 'visible'
                        }}>
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </span>
    );
}

/**
 * Calculates the length of the rendered username (visual length).
 * @param {string} rawUsername 
 * @returns {number}
 */
export function getRenderedUsernameLength(rawUsername: string) {
    const rendered = renderCosmicString(rawUsername);
    return Array.from(rendered).length;
}
