import React from 'react';
import { FaSatellite } from 'react-icons/fa';

const EarthBanner = () => {
    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#050505',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0
        }}>
            {/* Animated Stars embedded component for self-contained banner look */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0
            }}>
                {[...Array(40)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: Math.random() * 2 + 1 + 'px',
                            height: Math.random() * 2 + 1 + 'px',
                            background: '#7FFFD4', // Brand Ice Mint
                            borderRadius: '50%',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            opacity: Math.random() * 0.5 + 0.3,
                            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                            boxShadow: `0 0 ${Math.random() * 3 + 2}px rgba(127, 255, 212, 0.6)`,
                            willChange: 'opacity'
                        }}
                    />
                ))}
            </div>

            {/* Earth Container - Anchored to bottom */}
            <div style={{
                position: 'absolute',
                bottom: '-350px', // Matches Station offset
                left: '50%',
                transform: 'translateX(-50%)',
                width: '120%', // Wider for desktop profile
                minWidth: '800px',
                height: '500px', // Taller to accommodate larger widths
                borderRadius: '50%',
                zIndex: 1,
                // Day/Night Gradient (Bright Side Left, Dark Side Right)
                background: 'linear-gradient(110deg, #004a9f 0%, #000 60%)',
                boxShadow: '0 -15px 50px rgba(76, 201, 240, 0.3), inset 0 20px 40px rgba(76, 201, 240, 0.1)',
                borderTop: '2px solid rgba(76, 201, 240, 0.4)',
                overflow: 'hidden' // Clip city lights
            }}>
                {/* City Lights (Yellow Dots) on the Dark Side */}
                {[...Array(30)].map((_, i) => (
                    <div
                        key={`city-${i}`}
                        style={{
                            position: 'absolute',
                            // Position mainly on the right half (dark side)
                            left: `${50 + Math.random() * 40}%`,
                            top: `${10 + Math.random() * 40}%`,
                            width: Math.random() * 3 + 1 + 'px',
                            height: Math.random() * 3 + 1 + 'px',
                            background: '#FFD700', // Gold/Yellow
                            borderRadius: '50%',
                            opacity: Math.random() * 0.7 + 0.3,
                            boxShadow: '0 0 4px rgba(255, 215, 0, 0.8)',
                            animation: `pulse ${Math.random() * 2 + 2}s infinite ease-in-out`
                        }}
                    />
                ))}
            </div>

            {/* Atmosphere Haze */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100px',
                background: 'linear-gradient(to top, rgba(76, 201, 240, 0.15), transparent)',
                zIndex: 3,
                pointerEvents: 'none'
            }} />

            {/* Space Station - Reuse Station Logic but check sizing */}
            <div style={{
                position: 'absolute',
                top: '20%', // Relative positioning for responsive banner
                left: '70%', // Offset to right to avoid avatar overlap
                zIndex: 2,
                animation: 'ambient-float 8s ease-in-out infinite',
                filter: 'drop-shadow(0 0 12px rgba(76, 201, 240, 0.5))'
            }}>
                <span style={{ display: 'inline-block', transform: 'rotate(-30deg)' }}>
                    <FaSatellite size={48} color="#7FFFD4" style={{ opacity: 0.95 }} />
                </span>
            </div>

            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes ambient-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
};

export default EarthBanner;
