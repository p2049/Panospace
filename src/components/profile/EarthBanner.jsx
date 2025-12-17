import React from 'react';

const EarthBanner = ({ color = '#7FFFD4', starSettings }) => {
    const isBrand = starSettings?.color === 'brand';
    const starColor = (starSettings?.color && !isBrand) ? starSettings.color : color;

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#050505',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0
        }}>
            {/* Animated Stars - Colored by User Profile */}
            {/* Animated Stars - Colored by User Profile */}
            {starSettings?.enabled && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0
                }}>
                    {React.useMemo(() => {
                        const brandColors = ['#7FFFD4', '#FF5C8A', '#5A3FFF', '#1B82FF', '#FF914D'];
                        return [...Array(40)].map((_, i) => {
                            const thisStarColor = isBrand
                                ? brandColors[Math.floor(Math.random() * brandColors.length)]
                                : starColor;

                            return (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        width: Math.random() * 2 + 1 + 'px',
                                        height: Math.random() * 2 + 1 + 'px',
                                        background: thisStarColor, // User's chosen highlight color
                                        borderRadius: '50%',
                                        top: Math.random() * 100 + '%',
                                        left: Math.random() * 100 + '%',
                                        opacity: Math.random() * 0.5 + 0.3,
                                        animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        boxShadow: `0 0 ${Math.random() * 3 + 2}px ${thisStarColor}`,
                                        willChange: 'opacity'
                                    }}
                                />
                            );
                        });
                    }, [isBrand, starColor])}
                </div>
            )}

            {/* Earth Container */}
            <div style={{
                position: 'absolute',
                bottom: '-930px', // Top visible peak at ~70px (mid-avatar)
                left: '50%',
                transform: 'translateX(-50%)',
                width: '1000px', // Spanning more than 600px
                height: '1000px',
                borderRadius: '50%',
                zIndex: 1,
                // Solid Deep Blue as requested, no dark side
                background: '#004a9f',
                boxShadow: '0 -15px 50px rgba(0, 74, 159, 0.5), inset 0 20px 40px rgba(255, 255, 255, 0.2)',
                borderTop: '2px solid rgba(0, 74, 159, 0.6)',
                overflow: 'hidden'
            }}>
                {/* Surface Texture / Atmosphere Hint (Optional) */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2), transparent 70%)',
                    borderRadius: '50%'
                }} />
            </div>

            {/* Atmosphere Haze */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100px',
                background: 'linear-gradient(to top, rgba(0, 74, 159, 0.15), transparent)',
                zIndex: 3,
                pointerEvents: 'none'
            }} />

            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
};

export default EarthBanner;
