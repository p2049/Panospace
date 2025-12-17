// 10. NORTHERN LIGHTS - Standalone Intense Aurora (Wide Span)
if (mode === 'northern-lights') {
    const starColor = '#E0FFFF';

    return (
        <div style={overlayStyle}>
            {/* 1. Deep Cold Space Background */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 120%, #001529 0%, #000510 60%, #000000 100%)', zIndex: 0 }} />

            {/* 2. Stars */}
            {starSettings?.enabled && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    {React.useMemo(() => [...Array(60)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                width: Math.random() * 2 + 1 + 'px',
                                height: Math.random() * 2 + 1 + 'px',
                                background: starColor,
                                borderRadius: '50%',
                                top: Math.random() * 90 + '%',
                                left: Math.random() * 100 + '%',
                                opacity: Math.random() * 0.7 + 0.3,
                                boxShadow: `0 0 ${Math.random() * 4 + 1}px ${starColor}`,
                                animation: `twinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 5}s`
                            }}
                        />
                    )), [])}
                </div>
            )}

            {/* 4. The ICE PLANET Horizon (Base) */}
            <div style={{
                position: 'absolute',
                bottom: '-930px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '1000px',
                height: '1000px',
                borderRadius: '50%',
                zIndex: 2,
                boxShadow: `
                        0 -5px 30px rgba(127, 255, 212, 0.6),
                        0 -20px 80px rgba(27, 130, 255, 0.5),
                        inset 0 10px 50px rgba(255, 255, 255, 0.4)
                    `
            }}>
                <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'radial-gradient(circle at 50% 0%, #D4F1F9 0%, #7FDBFF 20%, #1B82FF 50%, #001529 100%)',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.3'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'overlay', opacity: 0.5
                    }} />
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'repeating-conic-gradient(from 0deg at 50% -20%, transparent 0deg, rgba(255,255,255,0.1) 2deg, transparent 4deg)',
                        opacity: 0.3, mixBlendMode: 'screen'
                    }} />
                    <div style={{
                        position: 'absolute', top: 0, left: '20%', right: '20%', height: '150px',
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 100%)',
                        filter: 'blur(20px)', borderRadius: '50%'
                    }} />
                </div>
            </div>

            {/* THE AURORA BOREALIS - WIDE SPAN & PURPLE/PINK */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', mixBlendMode: 'screen', overflow: 'hidden'
            }}>
                <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                    <defs>
                        <filter id="aurora-spikes-northern">
                            <feTurbulence type="fractalNoise" baseFrequency="0.003 0.02" numOctaves="4" result="noise" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="90" yChannelSelector="R" />
                            <feGaussianBlur stdDeviation="3" />
                        </filter>
                    </defs>
                </svg>

                {/* Green Glow Base */}
                <div style={{
                    position: 'absolute', left: '50%', bottom: '-900px', width: '1020px', height: '1020px', transform: 'translateX(-50%)', borderRadius: '50%',
                    boxShadow: `0 -10px 40px rgba(0, 255, 136, 0.6), 0 -20px 80px rgba(127, 255, 212, 0.4), inset 0 10px 40px rgba(0, 255, 136, 0.2)`,
                    opacity: 0.8
                }} />

                {/* Wide Purple Background Haze */}
                <div style={{
                    position: 'absolute', left: '50%', bottom: '-430px', width: '2000px', height: '2000px', transform: 'translateX(-50%)', borderRadius: '50%',
                    filter: 'blur(60px)',
                    // Wide span of purple
                    background: `conic-gradient(
                            from 100deg at 50% 50%, 
                            transparent 0deg, 
                            rgba(90, 63, 255, 0.0) 10deg, 
                            rgba(90, 63, 255, 0.3) 30deg, /* Start Purple */
                            rgba(90, 63, 255, 0.5) 80deg, /* Peak Purple */
                            rgba(90, 63, 255, 0.3) 130deg, 
                            rgba(90, 63, 255, 0.0) 160deg
                        )`,
                    maskImage: 'radial-gradient(circle at 50% 50%, transparent 50%, black 55%, transparent 75%)',
                    WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 50%, black 55%, transparent 75%)',
                    opacity: 0.9, mixBlendMode: 'screen'
                }} />

                {/* Wide Green Spiky Curtains */}
                <div style={{
                    position: 'absolute', left: '50%', bottom: '-430px', width: '2000px', height: '2000px', transform: 'translateX(-50%)', borderRadius: '50%',
                    filter: 'url(#aurora-spikes-northern) brightness(1.3) contrast(1.2)',
                    // Random Green pillars across the sky
                    background: `conic-gradient(
                            from 100deg at 50% 50%, 
                            transparent 0deg, 
                            rgba(0, 255, 136, 0) 10deg,
                            rgba(0, 255, 136, 0.6) 20deg,
                            rgba(127, 255, 212, 0.8) 35deg, 
                            rgba(0, 255, 136, 0.2) 45deg,
                            transparent 60deg,
                            rgba(0, 255, 136, 0.8) 75deg,   /* Center */
                            rgba(127, 255, 212, 0.5) 90deg,
                            transparent 105deg,
                            rgba(0, 255, 136, 0.5) 120deg,
                            rgba(127, 255, 212, 0.7) 135deg,
                            transparent 160deg
                        )`,
                    maskImage: 'radial-gradient(circle at 50% 50%, transparent 51%, black 53%, black 60%, transparent 68%)',
                    WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 51%, black 53%, black 60%, transparent 68%)',
                    opacity: 1.0, mixBlendMode: 'normal'
                }} />

                {/* Pink Streaks (Overlay) */}
                <div style={{
                    position: 'absolute', left: '50%', bottom: '-430px', width: '2000px', height: '2000px', transform: 'translateX(-50%)', borderRadius: '50%',
                    filter: 'url(#aurora-spikes-northern) blur(1px)',
                    // Sharp pink bolts
                    background: `conic-gradient(
                            from 100deg at 50% 50%, 
                            transparent 0deg,
                            transparent 25deg,
                            rgba(255, 42, 109, 0.9) 28deg, /* Pink Bolt 1 */
                            transparent 30deg,
                            transparent 60deg,
                            rgba(255, 42, 109, 0.7) 65deg, /* Pink Bolt 2 */
                            transparent 70deg,
                            transparent 110deg,
                            rgba(255, 42, 109, 0.8) 115deg, /* Pink Bolt 3 */
                            transparent 120deg
                        )`,
                    maskImage: 'radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 62%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 62%, transparent 70%)',
                    opacity: 0.9, mixBlendMode: 'screen'
                }} />
            </div>
        </div>
    );
}
