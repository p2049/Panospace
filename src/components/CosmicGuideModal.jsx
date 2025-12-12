import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { renderCosmicUsername } from '@/utils/usernameRenderer';

const SYMBOLS_DATA = [
    { symbol: '@', description: 'Planet', label: 'Planet' },
    { symbol: '*', description: 'Star', label: 'Star' },
    { symbol: '.', description: 'Moon', label: 'Moon' },
    { symbol: '/', description: 'Comet', label: 'Comet' },
    { symbol: '"', description: 'Sparkles', label: 'Sparkles' },
    { symbol: '_', description: 'Glowing Star', label: 'Glow Star' },
    { symbol: '<()', description: 'Sun', label: 'Sun' },
    { symbol: '()', description: 'Earth', label: 'Earth' },
    { symbol: '[]', description: 'Camera', label: 'Camera' },
    { symbol: '{}', description: 'Palette', label: 'Art' },
    { symbol: '-()', description: 'Flower', label: 'Flower' },
    { symbol: '%', description: 'Rocket', label: 'Rocket' },
    { symbol: '#', description: 'Fire', label: 'Fire' },
    { symbol: '^', description: 'Waves', label: 'Wave' },
    { symbol: '\\', description: 'Lightning', label: 'Bolt' },
    { symbol: '?', description: 'Mushroom', label: 'Shroom' },
    { symbol: ':)', description: 'Smile', label: 'Smile' },
    { symbol: '<3', description: 'Heart', label: 'Heart' },
    { symbol: '(:)', description: 'Music', label: 'Music' },
    { symbol: '(0)', description: 'Alien Ship', label: 'UFO' },
    { symbol: '(8)', description: 'Alien Head', label: 'Alien' },
    { symbol: '(@)', description: 'Galaxy', label: 'Galaxy' },
];

const CosmicGuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div style={{
                width: '90%',
                maxWidth: '500px',
                background: 'rgba(15, 15, 20, 0.95)',
                border: '1px solid rgba(127, 255, 212, 0.3)',
                borderRadius: '24px',
                padding: '24px',
                position: 'relative',
                boxShadow: '0 0 50px rgba(127, 255, 212, 0.1)',
                animation: 'fadeIn 0.2s ease-out'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        fontFamily: 'var(--font-family-heading)',
                        color: '#7FFFD4',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Cosmic Symbols
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex'
                        }}
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div style={{ color: '#888', marginBottom: '24px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Use these special characters in your username to create cosmic icons. They will be rendered automatically.
                </div>

                {/* Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '12px',
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    paddingRight: '8px'
                }}>
                    {SYMBOLS_DATA.map((item, idx) => (
                        <div key={idx} style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                            onClick={() => {
                                // Optional: Copy to clipboard logic could go here
                            }}
                        >
                            {/* Visual Preview */}
                            <div style={{
                                fontSize: '1.8rem',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                filter: 'drop-shadow(0 0 8px rgba(127, 255, 212, 0.2))'
                            }}>
                                {renderCosmicUsername(item.symbol, '#7FFFD4')}
                            </div>

                            {/* Code */}
                            <div style={{
                                fontFamily: 'monospace',
                                background: 'rgba(0, 0, 0, 0.4)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                color: '#7FFFD4',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {item.symbol}
                            </div>

                            {/* Label */}
                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#555', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                    Tap a symbol code to type it!
                </div>
            </div>
        </div>
    );
};

export default CosmicGuideModal;
