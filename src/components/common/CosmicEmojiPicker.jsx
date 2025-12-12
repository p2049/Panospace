import React, { useRef, useEffect } from 'react';
import { ALL_PICKER_EMOJIS } from '@/utils/emojiToCodeMap';

/**
 * CosmicEmojiPicker
 * Generic horizontal scroll emoji picker for PanoSpace custom emojis.
 */
const CosmicEmojiPicker = ({ visible, onSelect, style = {} }) => {
    const scrollContainerRef = useRef(null);

    // Desktop horizontal scroll support
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const handleWheel = (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        // Clean up
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    if (!visible) return null;

    return (
        <div
            className="cosmic-emoji-picker"
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 0.5rem',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                pointerEvents: 'auto',
                background: 'rgba(20, 20, 25, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                height: '50px',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                zIndex: 100,
                ...style
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >


            <div ref={scrollContainerRef} style={{ display: 'flex', gap: '8px', height: '100%', alignItems: 'center', minWidth: 'min-content' }}>
                {ALL_PICKER_EMOJIS.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelect(emoji);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.05)',
                            color: '#fff',
                            fontSize: '1.4rem',
                            cursor: 'pointer',
                            padding: '0',
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.1s',
                            flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CosmicEmojiPicker;
