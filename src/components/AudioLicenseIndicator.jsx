import React from 'react';
import { FaCheckCircle, FaLock, FaShoppingCart } from 'react-icons/fa';

const AudioLicenseIndicator = ({ isLicensed = false, requiredCard = null, onPurchase, className = '' }) => {
    const styles = {
        container: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '500',
            background: isLicensed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            border: `1px solid ${isLicensed ? '#4CAF50' : '#F44336'}`,
            color: isLicensed ? '#4CAF50' : '#F44336',
        },
        button: {
            marginLeft: '8px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: '#F44336',
            color: 'white',
            border: 'none',
            fontSize: '0.7rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        }
    };

    if (isLicensed) {
        return (
            <div style={styles.container} className={className}>
                <FaCheckCircle size={10} />
                <span>Licensed</span>
            </div>
        );
    }

    return (
        <div style={styles.container} className={className}>
            <FaLock size={10} />
            <span>
                {requiredCard ? `Requires ${requiredCard.title || 'SpaceCard'}` : 'License Required'}
            </span>
            {onPurchase && (
                <button style={styles.button} onClick={(e) => { e.stopPropagation(); onPurchase(); }}>
                    <FaShoppingCart size={10} />
                    Get License
                </button>
            )}
        </div>
    );
};

export default AudioLicenseIndicator;
