import React, { memo } from 'react';

/**
 * PolaroidFrame - Instant Photo Style
 * Adds a classic instant photo border with bottom text area.
 */
const InstantPhotoFrame = memo(({ children }) => {
    return (
        <div style={{
            width: '100%',
            height: 'auto', // Allow aspect-ratio to determine height, preventing stretch
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem', // Reduced padding for larger appearance
            boxSizing: 'border-box'
        }}>
            <div className="instant-photo-card" style={{
                background: '#fff',
                padding: '5% 5% 25% 5%', // Keeps bottom margin ~25% of height
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                width: '100%',
                // aspect-ratio: 3.5 / 4.2 is approx 0.8333. User asked for 3.5 / 4.2 explicitly.
                aspectRatio: '3.5 / 4.2',
                display: 'flex',
                flexDirection: 'column', // Stack image and bottom area physically (or just padding)
                // Actually, the current padding-box approach is fine if inner content fills the top area.
                // But user asked for "fixed-ratio container" and "inner image crop".
                // Our current structure: 
                // outer div (white) with padding. 
                // inner div (image) fills available space (100% width/height of content box).
                // If aspect ratio of OUTER is 3.5/4.2 (~0.833), and padding reduces height...
                // The inner image ratio is determined by remaining space.
                // 100% width = W. Total Height = W / 0.833 = 1.2W.
                // Top/Left/Right padding = 0.05W. 
                // Content Width = 0.9W.
                // Bottom padding = 0.25W. Top padding = 0.05W.
                // Content Height = 1.2W - 0.25W - 0.05W = 0.9W.
                // Ratio of content area = 0.9W / 0.9W = 1:1.
                // PERFECT. The padding logic naturally results in a SQUARE image area.
                // So I will keep the padding and outer aspect-ratio exactly as calculated above.

                alignItems: 'center',
                justifyContent: 'flex-start', // Top align content
                position: 'relative',
                boxSizing: 'border-box'
            }}>
                {/* Texture overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
                    pointerEvents: 'none',
                    zIndex: 2
                }}></div>

                {/* Inner Image Wrapper - Strictly Square */}
                <div className="polaroid-image-wrapper" style={{
                    width: '100%',
                    aspectRatio: '1 / 1', // Enforce square crop
                    background: '#111',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.1)'
                }}>
                    {/* Children must object-fit: cover inside this square */}
                    {children}
                </div>

                {/* Bottom Text Area - Scalable Position */}
                <div style={{
                    position: 'absolute',
                    bottom: '2%',
                    left: '5%',
                    right: '5%',
                    height: '20%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: '"Courier New", Courier, monospace',
                    color: '#000',
                    zIndex: 3,
                    padding: '0 1%'
                }}>
                    <span style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em',
                        opacity: 1 // Darker (was 0.8)
                    }}>
                        PANOSPACE
                    </span>

                    {/* Planet Logo - Fixed Clipping & Darker */}
                    <svg width="34" height="28" viewBox="0 0 32 24" style={{ opacity: 1 }}>
                        <defs>
                            <radialGradient id="instantPlanetGrad" cx="40%" cy="40%">
                                <stop offset="0%" style={{ stopColor: '#111', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#000', stopOpacity: 1 }} />
                            </radialGradient>
                        </defs>
                        {/* Centered at 16, 12 to fit in 32 width */}
                        <circle cx="16" cy="12" r="7" fill="url(#instantPlanetGrad)" />
                        <ellipse cx="16" cy="12" rx="14" ry="4" fill="none" stroke="#000" strokeWidth="1.8" transform="rotate(-20 16 12)" />
                    </svg>
                </div>
            </div>
        </div>
    );
});

export default InstantPhotoFrame;
