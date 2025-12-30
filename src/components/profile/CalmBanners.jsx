import React, { useRef, useEffect, useMemo } from 'react';

/**
 * 🧘 ULTRA ZEN & CALM BANNERS - ELITE 25 COLLECTION
 * Designed for maximum relaxation, high-end aesthetics, and creative brand colors.
 * NO TRAILS - Solid Clearing Only.
 */

const BRAND = {
    MINT: '#7FFFD4',
    BLUE: '#1B82FF',
    PINK: '#FF5C8A',
    PURPLE: '#5A3FFF',
    AURORA: '#7FDBFF',
    ORANGE: '#FF914D',
    WHITE: '#FFFFFF'
};

// 1. SILK FLOW - Premium Satin Physics
export const SilkFlowBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const brandPalette = [BRAND.MINT, BRAND.PINK, BRAND.BLUE, BRAND.PURPLE];

        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#050208';
            ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 15; i++) {
                const yBase = h * (0.2 + (i / 15) * 0.6), opacity = 0.05 + (i / 15) * 0.15;
                const actualColor = profileBorderColor === 'brand' ? brandPalette[i % brandPalette.length] : profileBorderColor;

                ctx.beginPath();
                ctx.strokeStyle = actualColor;
                ctx.globalAlpha = opacity;
                ctx.lineWidth = 1.5 * dpr;
                for (let j = 0; j <= 80; j++) {
                    const x = (j / 80) * w;
                    const y = yBase + Math.sin(j * 0.05 + time * 0.002 + i * 0.8) * 60 + Math.cos(j * 0.02 - time * 0.003 + i) * 30;
                    if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            ctx.globalAlpha = 1.0; time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#050208' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 2. ZEN RIPPLES
export const ZenRipplesBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const brandPalette = [BRAND.MINT, BRAND.PINK, BRAND.BLUE, BRAND.PURPLE];

        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#101014';
            ctx.fillRect(0, 0, w, h);
            const cx = w / 2, cy = h / 2;
            for (let r = 30; r < Math.max(w, h); r += 40) {
                const wave = Math.sin(r * 0.015 - time * 0.004) * 8, opacity = Math.max(0, 0.35 - (r / Math.max(w, h)) * 0.35);
                const actualColor = profileBorderColor === 'brand' ? brandPalette[(r / 40 | 0) % brandPalette.length] : profileBorderColor;

                ctx.beginPath();
                for (let i = 0; i <= 80; i++) {
                    const a = (i / 80) * Math.PI * 2, tr = r + wave + Math.sin(a * 4 + time * 0.002) * 5;
                    const x = cx + Math.cos(a) * tr, y = cy + Math.sin(a) * tr;
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = actualColor; ctx.globalAlpha = opacity; ctx.lineWidth = 1 * dpr; ctx.stroke();
            }
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#0a0a14' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 3. DREAMY BOKEH
export const DreamyBokehBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    const circles = useMemo(() => Array.from({ length: 25 }, () => ({ x: Math.random(), y: Math.random(), s: 60 + Math.random() * 80, vx: (Math.random() - 0.5) * 0.0003, vy: (Math.random() - 0.5) * 0.0003, o: 0.1 + Math.random() * 0.1 })), []);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;
        const brandPalette = [BRAND.MINT, BRAND.PINK, BRAND.BLUE, BRAND.PURPLE];

        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.fillStyle = '#060408';
            ctx.fillRect(0, 0, w, h);
            circles.forEach((c, i) => {
                c.x += c.vx * 0.5; c.y += c.vy * 0.5; if (c.x < -0.2) c.x = 1.2; if (c.x > 1.2) c.x = -0.2; if (c.y < -0.2) c.y = 1.2; if (c.y > 1.2) c.y = -0.2;
                const actualColor = profileBorderColor === 'brand' ? brandPalette[i % brandPalette.length] : profileBorderColor;

                const px = c.x * w, py = c.y * h, g = ctx.createRadialGradient(px, py, 0, px, py, c.s * dpr);
                g.addColorStop(0, actualColor); g.addColorStop(1, 'transparent');
                ctx.save(); ctx.globalAlpha = c.o; ctx.filter = `blur(${25 * dpr}px)`; ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(px, py, c.s * dpr, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            });
            animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [circles, profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#060408' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 4. MISTY CLOUDS
export const MistyCloudsBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    const clouds = useMemo(() => Array.from({ length: 10 }, () => ({ x: Math.random() * 120, y: Math.random() * 100, s: 200 + Math.random() * 300, v: 0.005 + Math.random() * 0.01, o: 0.1 + Math.random() * 0.1 })), []);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;
        const brandPalette = [BRAND.MINT, BRAND.PINK, BRAND.BLUE, BRAND.PURPLE];

        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.fillStyle = '#0a0a20';
            ctx.fillRect(0, 0, w, h);
            ctx.save(); ctx.filter = `blur(${60 * dpr}px)`;
            clouds.forEach((c, i) => {
                const actualColor = profileBorderColor === 'brand' ? brandPalette[i % brandPalette.length] : profileBorderColor;

                // Slower movement (0.4 multiplier)
                c.x += c.v * 0.4; if (c.x > 130) c.x = -30;
                const px = (c.x / 100) * w, py = (c.y / 100) * h, g = ctx.createRadialGradient(px, py, 0, px, py, c.s * dpr);
                g.addColorStop(0, actualColor); g.addColorStop(1, 'transparent');
                ctx.globalAlpha = c.o; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, c.s * dpr, 0, Math.PI * 2); ctx.fill();
            });
            ctx.restore(); animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [clouds, profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#0a0a20' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 5. SOOTHING STARS
export const SoothingStarsBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    const stars = useMemo(() => Array.from({ length: 100 }, () => ({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random(), p: Math.random() * Math.PI * 2, v: 0.01 + Math.random() * 0.02 })), []);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid ground
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#010103';
            ctx.fillRect(0, 0, w, h);
            stars.forEach(s => {
                const alpha = (Math.sin(time * s.v * 0.5 + s.p) + 1) / 2;
                ctx.globalAlpha = alpha * 0.6; ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.s * dpr, 0, Math.PI * 2); ctx.fill();
                if (alpha > 0.8) {
                    const g = ctx.createRadialGradient(s.x * w, s.y * h, 0, s.x * w, s.y * h, s.s * 8 * dpr);
                    g.addColorStop(0, profileBorderColor + '44'); g.addColorStop(1, 'transparent');
                    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.s * 8 * dpr, 0, Math.PI * 2); ctx.fill();
                }
            });
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [stars, profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#010103' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 6. ZEN MONOLITH
export const ZenMonolithBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const pts = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
        const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
        const render = () => {
            // Slower time (0.0006 multiplier)
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height, s = Math.min(w, h) * 0.2, t = time * 0.0006;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#030105';
            ctx.fillRect(0, 0, w, h);
            const proj = pts.map(p => {
                let y1 = p.y * Math.cos(t) - p.z * Math.sin(t), z1 = p.y * Math.sin(t) + p.z * Math.cos(t);
                let x1 = p.x * Math.cos(t * 0.6) - z1 * Math.sin(t * 0.6);
                return { x: w / 2 + x1 * s, y: h / 2 + y1 * s };
            });
            ctx.strokeStyle = profileBorderColor; ctx.lineWidth = 1 * dpr; ctx.globalAlpha = 0.3;
            e.forEach(([m, n]) => { ctx.beginPath(); ctx.moveTo(proj[m].x, proj[m].y); ctx.lineTo(proj[n].x, proj[n].y); ctx.stroke(); });
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#030105' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 7. ZEN LAVA
export const ZenLavaBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    const blobs = useMemo(() => Array.from({ length: 6 }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0004, vy: (Math.random() - 0.5) * 0.0004, r: 120 + Math.random() * 100 })), []);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.fillStyle = '#040206';
            ctx.fillRect(0, 0, w, h);
            ctx.save(); ctx.filter = `blur(${50 * dpr}px) contrast(150%)`;
            blobs.forEach(b => {
                // Slower movement (0.5 multiplier)
                b.x += b.vx * 0.5; b.y += b.vy * 0.5; if (b.x < 0 || b.x > 1) b.vx *= -1; if (b.y < 0 || b.y > 1) b.vy *= -1;
                const g = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, b.r * dpr);
                g.addColorStop(0, profileBorderColor); g.addColorStop(1, 'transparent');
                ctx.globalAlpha = 0.3; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x * w, b.y * h, b.r * dpr, 0, Math.PI * 2); ctx.fill();
            });
            ctx.restore(); animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [blobs, profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#040206' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 8. ZEN MANDALA
export const ZenMandalaBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2, br = Math.min(w, h) * 0.3;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#020005';
            ctx.fillRect(0, 0, w, h);
            // Slower breath (0.004 multiplier)
            const breath = Math.sin(time * 0.004) * 0.1 + 1;
            ctx.strokeStyle = profileBorderColor; ctx.lineWidth = 1.5 * dpr; ctx.globalAlpha = 0.2;
            for (let i = 0; i < 8; i++) {
                // Slower rotation (0.0008 multiplier)
                const a = (i / 8) * Math.PI * 2 + time * 0.0008, ox = Math.cos(a) * 40 * dpr, oy = Math.sin(a) * 40 * dpr;
                ctx.beginPath(); ctx.arc(cx + ox, cy + oy, br * breath, 0, Math.PI * 2); ctx.stroke();
            }
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#020005' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 9. ZEN AURORAS
export const ZenAurorasBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.fillStyle = '#010408';
            ctx.fillRect(0, 0, w, h);
            ctx.save(); ctx.filter = `blur(${40 * dpr}px)`;
            for (let i = 0; i < 4; i++) {
                // Slower movement (0.002 multiplier)
                const x = w * (0.2 + i * 0.2) + Math.sin(time * 0.002 + i) * 100 * dpr;
                const g = ctx.createLinearGradient(x - 100 * dpr, 0, x + 100 * dpr, 0);
                g.addColorStop(0, 'transparent'); g.addColorStop(0.5, profileBorderColor); g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.globalAlpha = 0.15; ctx.fillRect(x - 100 * dpr, 0, 200 * dpr, h);
            }
            ctx.restore(); time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#010408' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 10. ZEN PULSE
export const ZenPulseBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#040104';
            ctx.fillRect(0, 0, w, h);
            // Slower pulse (0.004 multiplier)
            const b = (Math.sin(time * 0.004) + 1) / 2, s = (w * 0.2 + b * w * 0.1) * dpr;
            const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, s);
            g.addColorStop(0, profileBorderColor); g.addColorStop(0.5, profileBorderColor + '44'); g.addColorStop(1, 'transparent');
            ctx.globalAlpha = 0.2; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(w / 2, h / 2, s, 0, Math.PI * 2); ctx.fill();
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#040104' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 11. LIQUID ZEN
export const LiquidZenBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    const b = useMemo(() => Array.from({ length: 12 }, () => ({ x: Math.random(), y: 1.2, vy: -0.0005 - Math.random() * 0.001, s: 10 + Math.random() * 30, o: 0.1 + Math.random() * 0.2 })), []);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#050a08';
            ctx.fillRect(0, 0, w, h);
            b.forEach(p => {
                // Slower ascent (0.5 multiplier)
                p.y += p.vy * 0.5; if (p.y < -0.2) p.y = 1.2;
                const g = ctx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, p.s * dpr);
                g.addColorStop(0, profileBorderColor); g.addColorStop(1, 'transparent');
                ctx.globalAlpha = p.o; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.s * dpr, 0, Math.PI * 2); ctx.fill();
            });
            animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [b, profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#050a08' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 12. NEURAL ZEN
export const NeuralZenBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#020008';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = profileBorderColor; ctx.lineWidth = 1 * dpr; ctx.globalAlpha = 0.1;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                for (let x = 0; x <= w; x += 10) {
                    // Slower oscillation (0.004 multiplier)
                    const y = h / 2 + Math.sin(x * 0.01 + time * 0.004 + i) * 60 * dpr;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#020008' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 13. COSMIC ZEN
export const CosmicZenBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#000005';
            ctx.fillRect(0, 0, w, h);
            // Slower breath (0.005 multiplier)
            const r = (100 + Math.sin(time * 0.005) * 20) * dpr, g = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 100 * dpr);
            g.addColorStop(0, 'transparent'); g.addColorStop(0.3, profileBorderColor); g.addColorStop(1, 'transparent');
            ctx.globalAlpha = 0.3; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r + 100 * dpr, 0, Math.PI * 2); ctx.fill();
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#000005' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 14. PRISMATIC ZEN
export const PrismaticZenBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#05050a';
            ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 6; i++) {
                // Slower rotation (0.002 multiplier)
                const a = time * 0.002 + (i / 6) * Math.PI * 2, g = ctx.createLinearGradient(w / 2, h / 2, w / 2 + Math.cos(a) * w, h / 2 + Math.sin(a) * w);
                g.addColorStop(0, profileBorderColor + '44'); g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.globalAlpha = 0.1; ctx.beginPath(); ctx.moveTo(w / 2, h / 2); ctx.arc(w / 2, h / 2, w, a - 0.2, a + 0.2); ctx.fill();
            }
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#05050a' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 15. FLORAL ZEN
export const FloralZenBanner = ({ profileBorderColor = BRAND.MINT }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
            // Solid background - NO TRAILS
            ctx.fillStyle = '#0a0508';
            ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 8; i++) {
                // Slower rotation (0.001multiplier) and bloom (0.004 multiplier)
                const a = (i / 8) * Math.PI * 2 + time * 0.001, s = 40 * dpr + Math.sin(time * 0.004) * 20 * dpr;
                ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.globalAlpha = 0.2;
                const g = ctx.createRadialGradient(s, 0, 0, s, 0, s * 2);
                g.addColorStop(0, profileBorderColor); g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(s, 0, s * 2, s * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            }
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [profileBorderColor]);
    return <div style={{ position: 'absolute', inset: 0, background: '#0a0508' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 16. ZEN RAIN
export const ZenRainBanner = () => {
    const canvasRef = useRef(null);
    const d = useMemo(() => Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), l: 50 + Math.random() * 100, v: 0.001 + Math.random() * 0.003, c: [BRAND.BLUE, BRAND.AURORA, BRAND.WHITE][Math.floor(Math.random() * 3)] })), []);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#010508';
            ctx.fillRect(0, 0, w, h);
            d.forEach(p => {
                // Slower fall (0.4 multiplier)
                p.y += p.v * 0.4; if (p.y > 1.2) p.y = -0.2;
                const g = ctx.createLinearGradient(p.x * w, p.y * h, p.x * w, p.y * h + p.l * dpr);
                g.addColorStop(0, 'transparent'); g.addColorStop(0.5, p.c); g.addColorStop(1, 'transparent');
                ctx.strokeStyle = g; ctx.lineWidth = 1 * dpr; ctx.globalAlpha = 0.2;
                ctx.beginPath(); ctx.moveTo(p.x * w, p.y * h); ctx.lineTo(p.x * w, p.y * h + p.l * dpr); ctx.stroke();
            });
            animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [d]);
    return <div style={{ position: 'absolute', inset: 0, background: '#010508' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 17. ZEN FIREFLIES
export const ZenFirefliesBanner = () => {
    const canvasRef = useRef(null);
    const f = useMemo(() => Array.from({ length: 30 }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.001, vy: (Math.random() - 0.5) * 0.001, s: 5 + Math.random() * 10, c: [BRAND.MINT, BRAND.ORANGE, BRAND.PINK][Math.floor(Math.random() * 3)] })), []);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, w, h);
            f.forEach(p => {
                // Slower movement (0.5 multiplier)
                p.x += p.vx * 0.5; p.y += p.vy * 0.5; if (p.x < 0 || p.x > 1) p.vx *= -1; if (p.y < 0 || p.y > 1) p.vy *= -1;
                // Slower pulse (0.02 multiplier)
                const alpha = (Math.sin(time * 0.02 + p.x * 10) + 1) / 2, g = ctx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, p.s * dpr * 4);
                g.addColorStop(0, p.c); g.addColorStop(1, 'transparent');
                ctx.globalAlpha = alpha * 0.3; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.s * dpr * 4, 0, Math.PI * 2); ctx.fill();
            });
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [f]);
    return <div style={{ position: 'absolute', inset: 0, background: '#050505' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 18. ZEN GRID
export const ZenGridBanner = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#020005';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = BRAND.PURPLE; ctx.lineWidth = 1.5 * dpr; ctx.globalAlpha = 0.1;
            for (let i = -10; i <= 10; i++) {
                ctx.beginPath(); ctx.moveTo(w / 2 + i * 150 * dpr, h); ctx.lineTo(w / 2 + i * 30 * dpr, h * 0.4); ctx.stroke();
            }
            for (let i = 0; i < 10; i++) {
                // Slower scroll (0.004 multiplier)
                const y = h - (Math.pow((i + time * 0.004) % 10, 1.4) * 40 * dpr);
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, []);
    return <div style={{ position: 'absolute', inset: 0, background: '#020005' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 19. ZEN HEARTBEAT
export const ZenHeartbeatBanner = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#050105';
            ctx.fillRect(0, 0, w, h);
            ctx.beginPath(); ctx.strokeStyle = BRAND.PINK; ctx.lineWidth = 2.5 * dpr; ctx.globalAlpha = 0.5;
            for (let x = 0; x <= w; x += 2) {
                const env = Math.exp(-Math.pow((x - w / 2) / (w / 5), 2));
                // Slower pulse (0.04 multiplier)
                const y = h / 2 + Math.sin(x * 0.02 - time * 0.04) * 30 * env * dpr;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke(); time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, []);
    return <div style={{ position: 'absolute', inset: 0, background: '#050105' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 20. ZEN RAINDROPS
export const ZenRaindropsBanner = () => {
    const canvasRef = useRef(null);
    const drops = useMemo(() => Array.from({ length: 8 }, () => ({ x: Math.random(), y: Math.random(), life: Math.random() * 200 })), []);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#080a15';
            ctx.fillRect(0, 0, w, h);
            drops.forEach(d => {
                // Slower growth (0.4 multiplier)
                d.life += 0.4; if (d.life > 200) { d.life = 0; d.x = Math.random(); d.y = Math.random(); }
                const r = (d.life / 200) * 200 * dpr; ctx.beginPath(); ctx.arc(d.x * w, d.y * h, r, 0, Math.PI * 2);
                ctx.strokeStyle = BRAND.AURORA; ctx.globalAlpha = (1 - d.life / 200) * 0.3; ctx.lineWidth = 1.5 * dpr; ctx.stroke();
            });
            animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [drops]);
    return <div style={{ position: 'absolute', inset: 0, background: '#080a15' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 21. ZEN LANTERNS
export const ZenLanternsBanner = () => {
    const canvasRef = useRef(null);
    const l = useMemo(() => Array.from({ length: 12 }, () => ({ x: Math.random(), y: 1.2, v: -0.0004 - Math.random() * 0.0006, vx: (Math.random() - 0.5) * 0.001, s: 20 + Math.random() * 20 })), []);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#0a0502';
            ctx.fillRect(0, 0, w, h);
            l.forEach(p => {
                // Slower flight (0.5 multiplier)
                p.y += p.v * 0.5; p.x += p.vx * 0.5; if (p.y < -0.2) { p.y = 1.2; p.x = Math.random(); }
                const g = ctx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, p.s * dpr * 3);
                g.addColorStop(0, BRAND.ORANGE); g.addColorStop(1, 'transparent');
                ctx.globalAlpha = 0.2; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.s * dpr * 3, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 0.4; ctx.fillStyle = BRAND.ORANGE; ctx.fillRect(p.x * w - p.s * dpr / 2, p.y * h - p.s * dpr / 2, p.s * dpr, p.s * dpr);
            });
            animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [l]);
    return <div style={{ position: 'absolute', inset: 0, background: '#0a0502' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 22. ZEN TUNNEL
export const ZenTunnelBanner = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#000208';
            ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 12; i++) {
                // Slower scroll (0.005 multiplier)
                const s = ((i + (time * 0.005) % 1) / 12) * Math.max(w, h);
                ctx.strokeStyle = BRAND.BLUE; ctx.lineWidth = 1.5 * dpr; ctx.globalAlpha = (1 - s / Math.max(w, h)) * 0.2;
                ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
            }
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, []);
    return <div style={{ position: 'absolute', inset: 0, background: '#000208' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 23. ZEN BOREALIS
export const ZenBorealisBanner = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#01050a';
            ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 3; i++) {
                const g = ctx.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'transparent'); g.addColorStop(0.5, [BRAND.MINT, BRAND.AURORA, BRAND.BLUE][i]); g.addColorStop(1, 'transparent');
                ctx.strokeStyle = g; ctx.lineWidth = 50 * dpr; ctx.globalAlpha = 0.15; ctx.beginPath();
                for (let x = 0; x <= w; x += 10) {
                    // Slower oscillation (0.006 multiplier)
                    const y = h * (0.3 + i * 0.2) + Math.sin(x * 0.005 + time * 0.006 + i) * 60 * dpr;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, []);
    return <div style={{ position: 'absolute', inset: 0, background: '#01050a' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 24. ZEN GEODESIC
export const ZenGeodesicBanner = () => {
    const canvasRef = useRef(null);
    const p = useMemo(() => Array.from({ length: 40 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 2 - 1 })), []);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame, time = 0;
        const render = () => {
            // Slower rotation (0.002 multiplier)
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height, s = Math.min(w, h) * 0.35, t = time * 0.002;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = BRAND.WHITE; ctx.lineWidth = 0.6 * dpr; ctx.globalAlpha = 0.15;
            const pr = p.map(a => {
                let y1 = a.y * Math.cos(t) - a.z * Math.sin(t), z1 = a.y * Math.sin(t) + a.z * Math.cos(t);
                let x1 = a.x * Math.cos(t * 0.7) - z1 * Math.sin(t * 0.7);
                return { x: w / 2 + x1 * s, y: h / 2 + y1 * s };
            });
            pr.forEach((p1, i) => {
                pr.forEach((p2, j) => {
                    if (i >= j) return; const d = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                    if (d < 100 * dpr) { ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); }
                });
            });
            time++; animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [p]);
    return <div style={{ position: 'absolute', inset: 0, background: '#000' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

// 25. ZEN MERCURY
export const ZenMercuryBanner = () => {
    const canvasRef = useRef(null);
    const b = useMemo(() => Array.from({ length: 5 }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0005, vy: (Math.random() - 0.5) * 0.0005, r: 120 + Math.random() * 100 })), []);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrame;
        const render = () => {
            const dpr = window.devicePixelRatio || 1, w = canvas.width, h = canvas.height;
            // Solid background - NO TRAILS
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, w, h);
            ctx.save(); ctx.filter = 'blur(40px) contrast(300%)';
            b.forEach(p => {
                // Slower movement (0.5 multiplier)
                p.x += p.vx * 0.5; p.y += p.vy * 0.5; if (p.x < 0 || p.x > 1) p.vx *= -1; if (p.y < 0 || p.y > 1) p.vy *= -1;
                const g = ctx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, p.r * dpr);
                g.addColorStop(0, '#fff'); g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2); ctx.fill();
            });
            ctx.restore(); animationFrame = requestAnimationFrame(render);
        };
        const res = () => { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
        window.addEventListener('resize', res); res(); render();
        return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', res); };
    }, [b]);
    return <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
};

const CalmBanners = {
    SilkFlowBanner, ZenRipplesBanner, DreamyBokehBanner, MistyCloudsBanner, SoothingStarsBanner,
    ZenMonolithBanner, ZenLavaBanner, ZenMandalaBanner, ZenAurorasBanner, ZenPulseBanner,
    LiquidZenBanner, NeuralZenBanner, CosmicZenBanner, PrismaticZenBanner, FloralZenBanner,
    ZenRainBanner, ZenFirefliesBanner, ZenGridBanner, ZenHeartbeatBanner, ZenRaindropsBanner,
    ZenLanternsBanner, ZenTunnelBanner, ZenBorealisBanner, ZenGeodesicBanner, ZenMercuryBanner
};

export default CalmBanners;
