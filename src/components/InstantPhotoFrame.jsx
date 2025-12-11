import React, { memo } from 'react';

// --- SEPARATE STYLE CONSTANTS ---

/* THIN PRESET - Tuned Square/Vertical Hybrid */
const instantPhotoStyleThin = {
    padding: '2.5% 2.5% 7.5% 2.5%', // Balanced chin
    aspectRatio: '1 / 1.15',
    imageAspectRatio: '1 / 1.05',
    bottomAreaBottom: '1.2%',
    bottomAreaHeight: '6%',
    brandFontSize: '1rem', // Significantly larger
    quartzFontSize: '0.8rem',
    logoWidth: "28", // Significantly larger
    logoHeight: "24"
};

/* THICK PRESET - Classic "Polaroid" Square Look (UNCHANGED) */
const instantPhotoStyleThick = {
    padding: '5% 5% 25% 5%',
    aspectRatio: '3.5 / 4.2',
    imageAspectRatio: '1 / 1', // Strict Square
    bottomAreaBottom: '2%',
    bottomAreaHeight: '20%',
    brandFontSize: '1.2rem',
    quartzFontSize: '0.9rem',
    logoWidth: "34",
    logoHeight: "28"
};

/**
 * PolaroidFrame - Instant Photo Style
 * Adds a classic instant photo border with bottom text area.
 */
const InstantPhotoFrame = memo(({ children, quartzDate, style = 'thick' }) => {
    // Select the separate style object based on prop - NO MERGING
    const activeStyle = style === 'thin' ? instantPhotoStyleThin : instantPhotoStyleThick;

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
                padding: activeStyle.padding,
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                width: '100%',
                aspectRatio: activeStyle.aspectRatio,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
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

                {/* Inner Image Wrapper - Dynamic Aspect Ratio */}
                <div className="polaroid-image-wrapper" style={{
                    width: '100%',
                    aspectRatio: activeStyle.imageAspectRatio, // 3:4 for Thin, 1:1 for Thick
                    background: '#111',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.1)'
                }}>
                    {/* Children must object-fit: cover inside this frame */}
                    {children}
                </div>

                {/* Bottom Text Area */}
                <div style={{
                    position: 'absolute',
                    bottom: activeStyle.bottomAreaBottom,
                    left: '5%',
                    right: '5%',
                    height: activeStyle.bottomAreaHeight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: '"Courier New", Courier, monospace',
                    color: '#000',
                    zIndex: 3,
                    padding: '0 1%'
                }}>
                    <span style={{
                        fontSize: activeStyle.brandFontSize,
                        fontWeight: 'bold',
                        letterSpacing: '0.05em',
                        opacity: 1
                    }}>
                        PANOSPACE
                    </span>

                    {/* Quartz Date on Border */}
                    {quartzDate && (
                        <div style={{
                            fontFamily: '"DSEG14", "DSEG7", "Courier New", monospace',
                            color: quartzDate.color || '#F6D88B',
                            fontSize: activeStyle.quartzFontSize,
                            fontWeight: '700',
                            letterSpacing: '0.05em',
                            opacity: 0.8,
                            textShadow: '0px 1px 1px rgba(0,0,0,0.2)'
                        }}>
                            {quartzDate.text}
                        </div>
                    )}

                    {/* Planet Logo */}
                    <svg width={activeStyle.logoWidth} height={activeStyle.logoHeight} viewBox="0 0 32 24" style={{ opacity: 1 }}>
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
