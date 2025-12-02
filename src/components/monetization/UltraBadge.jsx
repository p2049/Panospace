import React from 'react';
import { FaGem } from 'react-icons/fa';

const UltraBadge = ({ size = 'sm' }) => {
    const styles = {
        sm: { fontSize: '0.8rem', padding: '2px 6px' },
        md: { fontSize: '1rem', padding: '4px 8px' },
        lg: { fontSize: '1.2rem', padding: '6px 12px' }
    };

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            color: '#000',
            borderRadius: '12px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            ...styles[size]
        }}>
            <FaGem /> Ultra
        </span>
    );
};

export default UltraBadge;
