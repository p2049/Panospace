import React, { useEffect, useRef } from 'react';
import { FaImage, FaList } from 'react-icons/fa';
import { useFeedStore } from '@/core/store/useFeedStore';
import { useToast } from '@/context/ToastContext';

const FeedViewMenu = ({ anchorPoint, onClose, isMobile }) => {
    const { feedViewMode, setFeedViewMode } = useFeedStore();
    const { showToast } = useToast();
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        // Defer attachment to avoid immediate closing if triggered by click
        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('contextmenu', handleClickOutside); // also close on new right click
        }, 100);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('contextmenu', handleClickOutside);
        };
    }, [onClose]);

    const handleSelect = (mode) => {
        if (feedViewMode !== mode) {
            setFeedViewMode(mode);
            showToast(`Switched to ${mode === 'image' ? 'Visual Feed' : 'List View'}`);
        }
        onClose();
    };

    if (isMobile) {
        // Mobile Action Sheet (Bottom overlay)
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                animation: 'fadeIn 0.2s ease-out'
            }} onClick={onClose}>
                <div
                    ref={menuRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: '#1a1a1a',
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px',
                        padding: '1.5rem',
                        paddingBottom: '2.5rem', // Safe area
                        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <h3 style={{ margin: '0 0 1rem 0', color: '#888', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>View Mode</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <MenuOption
                            icon={FaImage}
                            label="Visual Feed"
                            active={feedViewMode === 'image'}
                            onClick={() => handleSelect('image')}
                        />
                        <MenuOption
                            icon={FaList}
                            label="List View"
                            active={feedViewMode === 'list'}
                            onClick={() => handleSelect('list')}
                        />
                    </div>
                </div>
                <style>{`
                    @keyframes slideUp {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    // Desktop Context Menu
    // Prevent menu from going off screen
    const x = Math.min(anchorPoint?.x || 0, window.innerWidth - 220);
    const y = Math.min(anchorPoint?.y || 0, window.innerHeight - 150);

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                top: y,
                left: x,
                zIndex: 9999,
                background: 'rgba(10, 10, 10, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.5rem',
                minWidth: '200px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                animation: 'fadeIn 0.1s ease-out'
            }}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div style={{ padding: '0.5rem 0.75rem', color: '#666', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                View Mode
            </div>
            <MenuOption
                icon={FaImage}
                label="Visual Feed"
                active={feedViewMode === 'image'}
                onClick={() => handleSelect('image')}
                desktop
            />
            <MenuOption
                icon={FaList}
                label="List View"
                active={feedViewMode === 'list'}
                onClick={() => handleSelect('list')}
                desktop
            />
        </div>
    );
};

const MenuOption = ({ icon: Icon, label, active, onClick, desktop }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            background: active ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
            border: 'none',
            padding: desktop ? '0.6rem 0.75rem' : '1rem',
            borderRadius: '8px',
            color: active ? '#7FFFD4' : '#fff',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: desktop ? '0.9rem' : '1rem',
            transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'transparent')}
    >
        <Icon size={desktop ? 14 : 18} />
        <span style={{ fontWeight: active ? '600' : '400' }}>{label}</span>
        {active && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7FFFD4', marginLeft: 'auto' }} />}
    </button>
);

export default FeedViewMenu;
