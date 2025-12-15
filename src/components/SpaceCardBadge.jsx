import React from 'react';
import { FaRocket, FaCrown } from 'react-icons/fa';
import { RARITY_TIERS } from '@/services/SpaceCardService';
import '@/styles/rarity-system.css';

const SpaceCardBadge = ({ type = 'owner', rarity = 'Common', className = '' }) => {
    const rarityInfo = RARITY_TIERS[rarity] || RARITY_TIERS.Common;
    const isGalactic = rarity === 'Galactic';

    const styles = {
        container: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: isGalactic ? 'var(--gradient-iridescent)' : 'rgba(0, 0, 0, 0.6)',
            backgroundSize: isGalactic ? '300% 300%' : 'auto',
            border: `1px solid ${rarityInfo.colorHex || rarityInfo.color}`,
            color: isGalactic ? '#000' : (rarityInfo.colorHex || rarityInfo.color),
            backdropFilter: 'blur(4px)',
            boxShadow: rarityInfo.glow ? `0 0 8px ${rarityInfo.colorHex}40` : 'none',
            animation: isGalactic ? 'rarity-galactic-shift 6s ease infinite' : 'none'
        }
    };

    return (
        <div style={styles.container} className={className} title={`${rarity} SpaceCard ${type === 'creator' ? 'Creator' : 'Owner'}`}>
            {type === 'creator' ? <FaCrown size={10} /> : <FaRocket size={10} />}
            <span>{type === 'creator' ? 'CREATOR' : 'OWNER'}</span>
        </div>
    );
};

export default SpaceCardBadge;

