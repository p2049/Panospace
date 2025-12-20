
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * TECHNICOLOR SEE-THROUGH TECH BANNER
 * (Y2K Translucent Hardware / Coded Materiality)
 * 
 * Features:
 * - Layered translucency using backdrop-filters
 * - Procedural internal hardware (PCB, ribs, screws)
 * - Slow-powered motion and parallax
 * - Technicolor plastic injection aesthetic
 */

const PALETTES = {
    // 🌈 DEFAULT: BRAND RAINBOW
    brand_rainbow: {
        primary: '#1B82FF',    // Ion Blue
        secondary: '#FF5C8A',  // Solar Pink
        accent: '#7FFFD4',     // Classic Mint
        extra: '#5A3FFF',      // Deep Orbit Purple
        glow: 'rgba(27, 130, 255, 0.5)',
        plastic: 'rgba(27, 130, 255, 0.15)',
        isRainbow: true
    },
    // BRAND COLORS
    classic_mint: {
        primary: '#7FFFD4',
        secondary: '#8CFFE9',
        accent: '#FFFFFF',
        glow: 'rgba(127, 255, 212, 0.5)',
        plastic: 'rgba(127, 255, 212, 0.15)'
    },
    solar_pink: {
        primary: '#FF5C8A',
        secondary: '#FFB7D5',
        accent: '#FFFFFF',
        glow: 'rgba(255, 92, 138, 0.5)',
        plastic: 'rgba(255, 92, 138, 0.15)'
    },
    ion_blue: {
        primary: '#1B82FF',
        secondary: '#7FDBFF',
        accent: '#FFFFFF',
        glow: 'rgba(27, 130, 255, 0.5)',
        plastic: 'rgba(27, 130, 255, 0.15)'
    },
    deep_orbit: {
        primary: '#5A3FFF',
        secondary: '#A7B6FF',
        accent: '#FFFFFF',
        glow: 'rgba(90, 63, 255, 0.5)',
        plastic: 'rgba(90, 63, 255, 0.15)'
    },
    stellar_orange: {
        primary: '#FF914D',
        secondary: '#FFB7D5',
        accent: '#FFFFFF',
        glow: 'rgba(255, 145, 77, 0.5)',
        plastic: 'rgba(255, 145, 77, 0.15)'
    },
    // LEGACY / EXTRA
    electric_grape: {
        primary: '#8000FF',
        secondary: '#FF69B4',
        accent: '#FF00FF',
        glow: 'rgba(128, 0, 255, 0.5)',
        plastic: 'rgba(128, 0, 255, 0.15)'
    }
};

const TechnicolorTechBanner = ({ variant = 'brand_rainbow' }) => {
    const p = PALETTES[variant] || PALETTES.brand_rainbow;

    const internalComponents = useMemo(() => {
        // Generate a set of random chips and traces
        return Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            x: Math.random() * 80 + 10 + '%',
            y: Math.random() * 60 + 20 + '%',
            w: Math.random() * 60 + 40 + 'px',
            h: Math.random() * 40 + 30 + 'px',
            delay: Math.random() * 5,
            duration: 3 + Math.random() * 4,
            depth: 1 + Math.random() * 2
        }));
    }, []);

    const vents = useMemo(() => {
        return Array.from({ length: 4 }).map((_, i) => ({
            id: i,
            x: (i * 25) + 5 + '%',
            y: '70%',
            w: '100px',
            h: '40px'
        }));
    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#0a0a0a',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
        }}>
            {/* 1. INTERNAL SUBSTRATE (PCB Layer) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.8,
                background: `
                    radial-gradient(circle at 50% 50%, ${p.primary}11 0%, transparent 70%),
                    linear-gradient(to right, #111 1px, transparent 1px) 0 0 / 40px 40px,
                    linear-gradient(to bottom, #111 1px, transparent 1px) 0 0 / 40px 40px
                `
            }} />

            {/* 2. CHIPS & CIRCUITRY (Background depth) */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {internalComponents.map((comp) => (
                    <motion.div
                        key={comp.id}
                        initial={{ opacity: 0.3 }}
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                            x: [0, 5, 0],
                            y: [0, -3, 0]
                        }}
                        transition={{
                            duration: comp.duration * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: comp.delay
                        }}
                        style={{
                            position: 'absolute',
                            left: comp.x,
                            top: comp.y,
                            width: comp.w,
                            height: comp.h,
                            background: '#151515',
                            border: `1px solid ${p.primary}33`,
                            borderRadius: '2px',
                            boxShadow: `0 0 15px ${p.primary}11`
                        }}
                    >
                        {/* Chip Pins */}
                        <div style={{
                            position: 'absolute',
                            top: '-4px', left: '10%', right: '10%', height: '4px',
                            background: `repeating-linear-gradient(90deg, ${p.accent}44, ${p.accent}44 1px, transparent 1px, transparent 4px)`
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-4px', left: '10%', right: '10%', height: '4px',
                            background: `repeating-linear-gradient(90deg, ${p.accent}44, ${p.accent}44 1px, transparent 1px, transparent 4px)`
                        }} />
                    </motion.div>
                ))}
            </div>

            {/* 3. STRUCTURAL RIBS / VENTS (Mid depth) */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
                {vents.map((v) => (
                    <div
                        key={v.id}
                        style={{
                            position: 'absolute',
                            left: v.x,
                            top: v.y,
                            width: v.w,
                            height: v.h,
                            background: `repeating-linear-gradient(45deg, #222, #222 2px, transparent 2px, transparent 8px)`,
                            border: '1px solid #333'
                        }}
                    />
                ))}
            </div>

            {/* 4. THE PLASTIC SHELL (Translucent Casing) */}
            <motion.div
                animate={{
                    background: p.isRainbow ? [
                        `linear-gradient(135deg, ${p.primary}22 0%, ${p.secondary}11 100%)`,
                        `linear-gradient(135deg, ${p.secondary}22 0%, ${p.accent}11 100%)`,
                        `linear-gradient(135deg, ${p.accent}22 0%, ${p.extra}11 100%)`,
                        `linear-gradient(135deg, ${p.extra}22 0%, ${p.primary}11 100%)`
                    ] : [
                        `linear-gradient(135deg, ${p.primary}22 0%, ${p.secondary}11 100%)`,
                        `linear-gradient(135deg, ${p.secondary}22 0%, ${p.primary}11 100%)`,
                        `linear-gradient(135deg, ${p.primary}22 0%, ${p.secondary}11 100%)`
                    ]
                }}
                transition={{ duration: p.isRainbow ? 15 : 10, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    inset: '10px',
                    borderRadius: '8px',
                    backdropFilter: 'blur(12px) saturate(1.8) contrast(1.1)',
                    WebkitBackdropFilter: 'blur(12px) saturate(1.8) contrast(1.1)',
                    border: `1px solid ${p.primary}33`,
                    boxShadow: `inset 0 0 40px ${p.primary}11, 0 0 20px rgba(0,0,0,0.5)`,
                    overflow: 'hidden'
                }}
            >
                {/* Surface Reflection Shimmer */}
                <motion.div
                    animate={{
                        x: ['-100%', '200%'],
                        opacity: [0, 0.3, 0]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    style={{
                        position: 'absolute',
                        top: 0, bottom: 0, width: '40%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transform: 'skewX(-20deg)',
                        pointerEvents: 'none'
                    }}
                />

                {/* Internal LEDs (Pulsing through the plastic) */}
                <div style={{ position: 'absolute', inset: 0 }}>
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: [0.2, 0.6, 0.2],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 4 + i,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i
                            }}
                            style={{
                                position: 'absolute',
                                width: '150px',
                                height: '150px',
                                left: `${20 + i * 25}%`,
                                top: `${30 + (i % 2) * 20}%`,
                                background: `radial-gradient(circle, ${p.primary}33 0%, transparent 70%)`,
                                filter: 'blur(20px)'
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* 5. SURFACE HARDWARE (Front depth - Screws & Details) */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {/* Corner Screws */}
                {[
                    { t: '20px', l: '20px' },
                    { t: '20px', r: '20px' },
                    { b: '20px', l: '20px' },
                    { b: '20px', r: '20px' }
                ].map((pos, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            ...pos,
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#333',
                            border: '2px solid #444',
                            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)'
                        }}
                    >
                        {/* Screw slot */}
                        <div style={{
                            position: 'absolute',
                            top: '50%', left: '10%', right: '10%', height: '1.5px',
                            background: '#222',
                            transform: `translateY(-50%) rotate(${i * 45}deg)`
                        }} />
                    </div>
                ))}
            </div>

            {/* 6. SYSTEM INTERFERENCE (Scanlines & Noise) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                opacity: 0.05,
                background: `repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)`
            }} />

            <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                opacity: 0.1,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                mixBlendMode: 'overlay'
            }} />

            {/* MASTER BLOOM / GLOW */}
            <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: `radial-gradient(ellipse at 50% 0%, ${p.primary}11 0%, transparent 60%)`
            }} />
        </div>
    );
};

export default TechnicolorTechBanner;
