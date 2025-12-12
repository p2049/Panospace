import React, { useRef, useEffect } from 'react';
import { ALL_PICKER_EMOJIS } from '@/utils/emojiToCodeMap';

const SearchEmojiPicker = ({ visible, onSelect, isMobile }) => {
    const scrollContainerRef = useRef(null);

    // Handle horizontal scroll with wheel on desktop
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
            className="search-emoji-picker"
            style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                height: '60px',
                background: 'rgba(10, 10, 12, 0.9)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                zIndex: 40, // Below header content (z-50) but presumably above page content
                display: 'flex',
                alignItems: 'center',
                padding: '0 1rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                pointerEvents: 'auto',
            }}
            // Prevent clicks from engaging other elements
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <style>{`
                .search-emoji-picker::-webkit-scrollbar { display: none; }
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            <div
                ref={scrollContainerRef}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '12px' : '16px',
                    height: '100%',
                    paddingRight: '1rem', // Safety padding
                    minWidth: 'min-content'
                }}
            >
                {ALL_PICKER_EMOJIS.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelect(emoji);
                        }}
                        // Prevent focus loss when clicking
                        onMouseDown={(e) => e.preventDefault()}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            minWidth: isMobile ? '44px' : '36px',
                            height: isMobile ? '44px' : '36px',
                            fontSize: isMobile ? '1.5rem' : '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy
                            color: '#fff',
                            textShadow: '0 0 10px rgba(127, 255, 212, 0.2)',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            outline: 'none',
                            userSelect: 'none'
                        }}
                        onMouseEnter={(e) => {
                            if (!isMobile) {
                                e.currentTarget.style.background = 'rgba(127, 255, 212, 0.2)';
                                e.currentTarget.style.borderColor = '#7FFFD4';
                                e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 5px 15px rgba(127, 255, 212, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isMobile) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }
                        }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchEmojiPicker;
