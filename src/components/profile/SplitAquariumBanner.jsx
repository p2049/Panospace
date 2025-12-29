import React from 'react';
import AquariumWindowBanner from './AquariumWindowBanner';

/**
 * SplitAquariumBanner
 * 
 * A "Dual Window" variation of the Aquarium.
 * Reuses the heavy canvas logic from AquariumWindowBanner but masks it 
 * with a UI overlay to create the illusion of two distinct observation ports.
 */
const SplitAquariumBanner = ({ variant = 'marine_blue' }) => {

    // Wall Color (Dark Architectural Interior)
    const WALL_COLOR = '#0a0a0c';
    const FRAME_COLOR = '#1a1a1e';

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: WALL_COLOR }}>

            {/* 1. THE AQUARIUM (Background Layer) */}
            {/* We render the full tank, even though parts are hidden. This ensures continuity (fish swim from one window to another). */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <AquariumWindowBanner variant={variant} />
            </div>

            {/* 2. THE WALL OVERLAY (Foreground Layer) */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 10,
                display: 'grid',
                // Grid: Margin | Window left | Pillar | Window Right | Margin
                gridTemplateColumns: 'minmax(20px, 1fr) 42% minmax(60px, 150px) 42% minmax(20px, 1fr)',
                gridTemplateRows: '1fr',
                pointerEvents: 'none' // Allow clicks to pass through if we want interactivity later
            }}>
                {/* Left Margin Wall */}
                <div style={{ background: WALL_COLOR, boxShadow: '5px 0 20px rgba(0,0,0,0.5)' }}></div>

                {/* Left Window Frame (Transparent Center) */}
                <div style={{ position: 'relative' }}>
                    {/* Top/Bottom opaque "Bezels" to shape the window vertically */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '15%', background: WALL_COLOR, borderBottom: `4px solid ${FRAME_COLOR}`, boxShadow: '0 5px 15px rgba(0,0,0,0.8)' }}>
                        {/* Metallic Plaque / Detail */}
                        <div style={{
                            position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
                            width: '40px', height: '4px', background: '#333', borderRadius: '2px'
                        }} />
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '15%', background: WALL_COLOR, borderTop: `4px solid ${FRAME_COLOR}`, boxShadow: '0 -5px 15px rgba(0,0,0,0.8)' }}>
                        {/* Label */}
                        <div style={{
                            position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)',
                            color: '#444', fontSize: '9px', fontFamily: 'monospace', letterSpacing: '2px'
                        }}>SECTOR A</div>
                    </div>

                    {/* Inner Shadow / Glass Reflection on the viewport itself */}
                    <div style={{
                        position: 'absolute',
                        top: '15%', bottom: '15%', left: 0, right: 0,
                        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), inset 0 0 10px rgba(0,0,0,1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        {/* Glass Gloss */}
                        <div style={{
                            position: 'absolute', top: 0, right: 0, width: '60%', height: '100%',
                            background: 'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.03) 45%, transparent 50%)',
                            pointerEvents: 'none'
                        }} />
                        {/* Dirt/Grunge Overlay (Optional) */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            backgroundImage: `radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,10,20,0.2) 100%)`
                        }} />
                    </div>
                </div>

                {/* Center Pillar */}
                <div style={{
                    background: WALL_COLOR,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                    zIndex: 20
                }}>
                    {/* Pillar Tech Details */}
                    <div style={{ width: '1px', height: '60%', background: 'linear-gradient(to bottom, transparent, #333, transparent)' }} />
                    {/* Status Light */}
                    <div style={{
                        width: '4px', height: '4px',
                        background: '#00ff88', borderRadius: '50%',
                        boxShadow: '0 0 5px #00ff88',
                        margin: '20px 0', opacity: 0.5
                    }} />
                    <div style={{ width: '1px', height: '60%', background: 'linear-gradient(to bottom, transparent, #333, transparent)' }} />
                </div>

                {/* Right Window Frame */}
                <div style={{ position: 'relative' }}>
                    {/* Top/Bottom opaque "Bezels" */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '15%', background: WALL_COLOR, borderBottom: `4px solid ${FRAME_COLOR}`, boxShadow: '0 5px 15px rgba(0,0,0,0.8)' }}>
                        <div style={{
                            position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
                            width: '40px', height: '4px', background: '#333', borderRadius: '2px'
                        }} />
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '15%', background: WALL_COLOR, borderTop: `4px solid ${FRAME_COLOR}`, boxShadow: '0 -5px 15px rgba(0,0,0,0.8)' }}>
                        <div style={{
                            position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)',
                            color: '#444', fontSize: '9px', fontFamily: 'monospace', letterSpacing: '2px'
                        }}>SECTOR B</div>
                    </div>

                    {/* Inner Shadow / Glass */}
                    <div style={{
                        position: 'absolute',
                        top: '15%', bottom: '15%', left: 0, right: 0,
                        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), inset 0 0 10px rgba(0,0,0,1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        {/* Glass Gloss */}
                        <div style={{
                            position: 'absolute', top: 0, right: 0, width: '60%', height: '100%',
                            background: 'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.03) 45%, transparent 50%)',
                            pointerEvents: 'none'
                        }} />
                    </div>
                </div>

                {/* Right Margin Wall */}
                <div style={{ background: WALL_COLOR, boxShadow: '-5px 0 20px rgba(0,0,0,0.5)' }}></div>
            </div>

        </div>
    );
};

export default SplitAquariumBanner;
