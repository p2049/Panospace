import React from 'react';
import { FaMusic, FaWaveSquare } from 'react-icons/fa';

const SoundTagBadge = ({ hasSound = false, label = 'SoundTag', onClick, className = '' }) => {
    if (!hasSound) return null;

    const styles = {
        container: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: 'rgba(0, 255, 157, 0.1)', // PanoSpace Green tint
            border: '1px solid #00FF9D',
            color: '#00FF9D',
            backdropFilter: 'blur(4px)',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.2s ease'
        }
    };

    return (
        <div
            style={styles.container}
            className={className}
            onClick={onClick}
            title="Attached SoundTag"
        >
            <FaMusic size={10} />
            <span>{label}</span>
            <FaWaveSquare size={10} style={{ opacity: 0.7 }} />
        </div>
    );
};

export default SoundTagBadge;
