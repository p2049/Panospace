import React from 'react';
import { FaLayerGroup, FaTh, FaBuilding, FaBookOpen } from 'react-icons/fa';

const ModeSelector = ({ creationMode, setCreationMode, noPadding = false }) => {
    const modes = [
        { id: 'collection', label: 'Collection', icon: FaLayerGroup },
        { id: 'gallery', label: 'Studio', icon: FaTh },
        { id: 'museum', label: 'Museum', icon: FaBuilding },
        { id: 'magazine', label: 'Magazine', icon: FaBookOpen }
    ];

    return (
        <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: noPadding ? '0' : '0 1rem 1rem 1rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            borderBottom: noPadding ? 'none' : '1px solid rgba(255,255,255,0.1)'
        }}>
            {modes.map((mode) => {
                const isActive = creationMode === mode.id;
                const Icon = mode.icon;

                return (
                    <button
                        key={mode.id}
                        onClick={() => setCreationMode(mode.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1rem',
                            background: isActive ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                            border: isActive ? '1px solid #7FFFD4' : '1px solid transparent',
                            borderRadius: '20px',
                            color: isActive ? '#7FFFD4' : '#888',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: isActive ? '600' : '400',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                            fontFamily: 'var(--font-family-heading)'
                        }}
                    >
                        <Icon size={14} />
                        {mode.label}
                    </button>
                );
            })}
        </div>
    );
};

export default ModeSelector;
