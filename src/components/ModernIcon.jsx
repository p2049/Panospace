import React from 'react';

const ModernIcon = ({ icon: Icon, size = 24, color = 'var(--ice-mint)', glow = true }) => {
    return (
        <div style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size * 1.8,
            height: size * 1.8,
            borderRadius: '12px',
            background: 'rgba(127, 255, 212, 0.05)',
            border: '1px solid rgba(127, 255, 212, 0.2)',
            backdropFilter: 'blur(4px)',
            boxShadow: glow ? '0 0 10px rgba(127, 255, 212, 0.1), inset 0 0 5px rgba(127, 255, 212, 0.05)' : 'none',
            transition: 'all 0.3s ease'
        }}>
            <Icon
                size={size}
                color={color}
                style={{
                    filter: glow ? 'drop-shadow(0 0 2px rgba(127, 255, 212, 0.5))' : 'none'
                }}
            />
        </div>
    );
};

export default ModernIcon;
