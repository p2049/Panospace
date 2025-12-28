
import React, { useEffect, useState } from 'react';

/**
 * SciFiUiBanner: "Space Car UI"
 * Aesthetic: Cinematic cockpit dashboard with realistic, random indicator logic.
 * Colors: Panospace Brand Spectrum.
 */
const SciFiUiBanner = () => {
    // Brand Palette
    const COLORS = [
        '#7FFFD4', // Mint
        '#FF5C8A', // Pink
        '#1B82FF', // Blue
        '#FF914D', // Orange
        '#5A3FFF'  // Purple
    ];

    // State for random button activity
    // We toggle a random index every few seconds to simulate "system activity" rather than constant blinking
    const [activeLight, setActiveLight] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly pick a light to "ping" or turn off
            const r = Math.random();
            if (r > 0.7) {
                setActiveLight(Math.floor(Math.random() * 8)); // Turn one on
            } else {
                setActiveLight(null); // All quiet
            }
        }, 1200); // Slower, more deliberate pace
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#020202',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Orbitron, monospace'
        }}>
            {/* 1. Cockpit Grid (Perspective) */}
            <div style={{
                position: 'absolute',
                inset: '-50%',
                top: 0,
                width: '200%',
                height: '100%',
                backgroundImage: `
                    linear-gradient(rgba(27, 130, 255, 0.15) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(27, 130, 255, 0.15) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px',
                transform: 'perspective(600px) rotateX(70deg) translateY(-50px)',
                maskImage: 'linear-gradient(to top, transparent, black 20%, black 80%, transparent)',
                opacity: 0.3
            }} />

            {/* 2. Main Dashboard Center Console */}
            <div style={{
                position: 'absolute',
                bottom: '15%',
                display: 'flex',
                gap: '8px',
                padding: '12px 24px',
                background: 'rgba(5, 10, 20, 0.9)',
                border: '1px solid rgba(27, 130, 255, 0.3)',
                borderRadius: '4px', // Boxier, retro-futurist look
                backdropFilter: 'blur(4px)',
                boxShadow: '0 0 30px rgba(0,0,0,0.8)'
            }}>
                {/* Button Row */}
                {[...Array(8)].map((_, i) => {
                    const color = COLORS[i % COLORS.length];
                    // Logic: Most lights are dim (standby). Active light is bright.
                    // Some lights are famously "always on" in cockpits, let's make indices 0 and 7 stable.
                    const isAlwaysOn = i === 0 || i === 7;
                    const isActive = activeLight === i;
                    const isOn = isAlwaysOn || isActive;

                    return (
                        <div key={i} style={{
                            width: '32px',
                            height: '16px', // Slightly taller chunky buttons
                            background: color,
                            borderRadius: '2px',
                            boxShadow: isOn ? `0 0 10px ${color}` : 'none',
                            opacity: isOn ? 1 : 0.2, // Contrast between on/off states
                            transition: 'opacity 0.2s ease-out, box-shadow 0.2s ease-out', // Realistic LED rise/fall time
                            borderBottom: `2px solid rgba(0,0,0,0.3)` // Physical button depth
                        }} />
                    );
                })}
            </div>

            {/* 3. Side Control Panels (Angled) */}
            {/* Left Panel - Power Gauges */}
            <div style={{
                position: 'absolute',
                left: '12%',
                top: '55%',
                transform: 'translateY(-50%) perspective(1000px) rotateY(25deg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                opacity: 0.9
            }}>
                {[100, 80, 60, 40, 20].map((w, i) => (
                    <div key={i} style={{
                        width: `${w}px`, height: '4px',
                        background: COLORS[2],
                        opacity: 0.2 + (i * 0.1),
                        boxShadow: i === 0 ? `0 0 5px ${COLORS[2]}` : 'none'
                    }} />
                ))}
            </div>

            {/* Right Panel - System Checks */}
            <div style={{
                position: 'absolute',
                right: '12%',
                top: '55%',
                transform: 'translateY(-50%) perspective(1000px) rotateY(-25deg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', background: COLORS[3], borderRadius: '50%', opacity: 0.4 }} />
                    <div style={{ width: '8px', height: '8px', background: COLORS[3], borderRadius: '50%', opacity: 1, boxShadow: `0 0 8px ${COLORS[3]}` }} />
                    <div style={{ width: '8px', height: '8px', background: COLORS[3], borderRadius: '50%', opacity: 0.4 }} />
                </div>
                <div style={{ width: '60px', height: '2px', background: 'rgba(255,255,255,0.3)' }} />
                <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.2)' }} />
            </div>

            {/* 4. Center HUD Ring (Static High-Tech) */}
            <div style={{
                position: 'absolute',
                top: '40%',
                width: '200px',
                height: '200px',
                border: `1px solid rgba(127, 255, 212, 0.2)`,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: `inset 0 0 30px rgba(127, 255, 212, 0.05)`
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '0', right: '0',
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, rgba(127, 255, 212, 0.5), transparent)`
                }} />
                {/* Aimpoint */}
                <div style={{ width: '4px', height: '4px', background: '#FFF', borderRadius: '50%', opacity: 0.8 }} />
            </div>

            {/* 5. Vignette */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle, transparent 50%, #020202 110%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default SciFiUiBanner;
