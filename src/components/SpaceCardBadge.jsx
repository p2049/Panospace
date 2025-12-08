import React from 'react';
import { FaRocket, FaCrown } from 'react-icons/fa';
import { RARITY_TIERS } from '@/services/SpaceCardService';

const SpaceCardBadge = ({ type = 'owner', rarity = 'Common', className = '' }) => {
    const rarityInfo = RARITY_TIERS[rarity] || RARITY_TIERS.Common;

    const styles = {
        container: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: 'rgba(0, 0, 0, 0.6)',
            border: `1px solid ${rarityInfo.color}`,
            color: rarityInfo.color,
            backdropFilter: 'blur(4px)',
            boxShadow: rarityInfo.glow ? `0 0 8px ${rarityInfo.color}40` : 'none',
            ...((rarityInfo.holographic) && {
                background: `linear-gradient(135deg, ${rarityInfo.color}20, rgba(255,255,255,0.1), ${rarityInfo.color}20)`,
                backgroundSize: '200% 200%',
                animation: 'holoShift 3s ease infinite'
            })
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
