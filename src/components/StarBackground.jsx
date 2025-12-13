import React, { useMemo, useState, useEffect } from 'react';

// PanoSpace Brand Colors
const BRAND_COLORS = ['#7FFFD4', '#FF5C8A', '#5A3FFF', '#1B82FF', '#FF914D', '#FFB7D5'];

const StarBackground = ({ starColor = '#7FFFD4', multiColor = false, transparent = false, maskTop = false }) => {
    // Get a color for a star - if multiColor, pick randomly from brand palette
    const getStarColor = (index) => {
        if (multiColor) {
            return BRAND_COLORS[index % BRAND_COLORS.length];
        }
        return starColor;
    };
    // Detect if device is mobile to save battery
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                || window.innerWidth < 768;
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Create multiple layers of stars with different depths
    const starLayers = useMemo(() => {
        // Generate stars for all devices
        // if (isMobile) return { far: [], mid: [], near: [], hidden: [] };

        return {
            far: [...Array(30)].map((_, i) => ({
                id: `far-${i}`,
                size: Math.random() * 1 + 0.5,
                top: Math.random() * 100,
                left: Math.random() * 100,
                animationDuration: Math.random() * 5 + 8, // 8-13s
                animationDelay: Math.random() * 5,
                opacity: Math.random() * 0.3 + 0.2
            })),
            mid: [...Array(25)].map((_, i) => ({
                id: `mid-${i}`,
                size: Math.random() * 1.5 + 0.8,
                top: Math.random() * 100,
                left: Math.random() * 100,
                animationDuration: Math.random() * 5 + 6, // 6-11s
                animationDelay: Math.random() * 4,
                opacity: Math.random() * 0.4 + 0.3
            })),
            near: [...Array(15)].map((_, i) => ({
                id: `near-${i}`,
                size: Math.random() * 2 + 1,
                top: Math.random() * 100,
                left: Math.random() * 100,
                animationDuration: Math.random() * 4 + 5, // 5-9s
                animationDelay: Math.random() * 3,
                opacity: Math.random() * 0.6 + 0.4
            })),
            hidden: [...Array(20)].map((_, i) => ({ // New layer for emerging stars
                id: `hidden-${i}`,
                size: Math.random() * 1.5 + 0.5,
                top: Math.random() * 100,
                left: Math.random() * 100,
                animationDuration: Math.random() * 10 + 15, // 15-25s (rare)
                animationDelay: Math.random() * 20,
                opacity: 0 // Start invisible
            }))
        };
    }, [isMobile]);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0,
            overflow: 'hidden',
            background: transparent ? 'transparent' : 'radial-gradient(ellipse at center, rgba(10, 10, 20, 0.3) 0%, rgba(0, 0, 0, 0.95) 70%, #000 100%)',
            maskImage: maskTop ? 'linear-gradient(to bottom, black 0%, black 40%, transparent 60%)' : 'none',
            WebkitMaskImage: maskTop ? 'linear-gradient(to bottom, black 0%, black 40%, transparent 60%)' : 'none'
        }}>
            {/* Condition removed to show on mobile */}
            <>
                <style>{`
                        @keyframes slow-twinkle {
                            0% { opacity: 0.7; transform: scale(1); }
                            80% { opacity: 0.7; transform: scale(1); }
                            90% { opacity: 1; transform: scale(1.3); }
                            100% { opacity: 0.7; transform: scale(1); }
                        }
                        @keyframes emerge-twinkle {
                            0%, 85%, 100% { opacity: 0; transform: scale(0.5); }
                            92% { opacity: 1; transform: scale(1.2); }
                        }
                        .star-item {
                            position: absolute;
                            border-radius: 50%;
                            backface-visibility: hidden;
                            transform: translateZ(0);
                        }
                    `}</style>

                {/* Far layer - steady background stars */}
                {starLayers.far.map((star, i) => {
                    const color = getStarColor(i);
                    return (
                        <div
                            key={star.id}
                            className="star-item"
                            style={{
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                top: `${star.top}%`,
                                left: `${star.left}%`,
                                opacity: 0.6,
                                background: color,
                                boxShadow: `0 0 2px ${color}`,
                                animation: `slow-twinkle ${Math.random() * 10 + 12}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 20}s`
                            }}
                        />
                    );
                })}

                {/* Mid layer - occasional twinkle */}
                {starLayers.mid.map((star, i) => {
                    const color = getStarColor(i + 30); // Offset to get different colors
                    return (
                        <div
                            key={star.id}
                            className="star-item"
                            style={{
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                top: `${star.top}%`,
                                left: `${star.left}%`,
                                opacity: 0.7,
                                background: color,
                                boxShadow: `0 0 4px ${color}`,
                                animation: `slow-twinkle ${Math.random() * 8 + 10}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 15}s`
                            }}
                        />
                    );
                })}

                {/* Near layer - brighter, more active */}
                {starLayers.near.map((star, i) => {
                    const color = getStarColor(i + 55); // Offset to get different colors
                    return (
                        <div
                            key={star.id}
                            className="star-item"
                            style={{
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                top: `${star.top}%`,
                                left: `${star.left}%`,
                                opacity: 0.8,
                                background: color,
                                boxShadow: `0 0 6px ${color}, 0 0 12px ${color}`,
                                animation: `slow-twinkle ${Math.random() * 6 + 8}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 10}s`
                            }}
                        />
                    );
                })}

                {/* Hidden layer - emerge from nowhere */}
                {starLayers.hidden.map((star, i) => {
                    const color = getStarColor(i + 70); // Offset to get different colors
                    return (
                        <div
                            key={star.id}
                            className="star-item"
                            style={{
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                top: `${star.top}%`,
                                left: `${star.left}%`,
                                opacity: 0,
                                background: color,
                                boxShadow: `0 0 4px ${color}`,
                                animation: `emerge-twinkle ${star.animationDuration}s ease-in-out infinite`,
                                animationDelay: `${star.animationDelay}s`
                            }}
                        />
                    );
                })}
            </>
        </div>
    );
};

export default React.memo(StarBackground);
