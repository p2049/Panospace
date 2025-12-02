import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaUser } from 'react-icons/fa';
import { RARITY_TIERS } from '../services/SpaceCardService';

// Add keyframes for iridescent border animation
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes iridescent-border {
    0% { border-color: #FF00FF; box-shadow: 0 0 20px #FF00FF, inset 0 0 20px rgba(255,0,255,0.3); }
    16% { border-color: #FF0080; box-shadow: 0 0 20px #FF0080, inset 0 0 20px rgba(255,0,128,0.3); }
    33% { border-color: #FF0000; box-shadow: 0 0 20px #FF0000, inset 0 0 20px rgba(255,0,0,0.3); }
    50% { border-color: #FFD700; box-shadow: 0 0 20px #FFD700, inset 0 0 20px rgba(255,215,0,0.3); }
    66% { border-color: #00FFFF; box-shadow: 0 0 20px #00FFFF, inset 0 0 20px rgba(0,255,255,0.3); }
    83% { border-color: #0080FF; box-shadow: 0 0 20px #0080FF, inset 0 0 20px rgba(0,128,255,0.3); }
    100% { border-color: #FF00FF; box-shadow: 0 0 20px #FF00FF, inset 0 0 20px rgba(255,0,255,0.3); }
}

@keyframes holographic {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
`;

try {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
} catch (e) {
    // Animation already exists or error inserting
}

const SpaceCardComponent = ({ card, ownership, showPrice = false, compact = false }) => {
    const navigate = useNavigate();
    const [isFlipped, setIsFlipped] = useState(false);

    const handleClick = () => {
        if (card.images.back) {
            setIsFlipped(!isFlipped);
        } else {
            navigate(`/cards/${card.id}`);
        }
    };

    const rarityStyle = RARITY_TIERS[card.rarity] || RARITY_TIERS.Common;
    const isMythic = card.rarity === 'mythic' || card.rarity === 'Mythic';

    return (
        <div
            onClick={handleClick}
            style={{
                position: 'relative',
                aspectRatio: '2.5/3.5',
                cursor: 'pointer',
                perspective: '1000px'
            }}
        >
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}>
                {/* Front */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: isMythic ? '4px solid #FF00FF' : rarityStyle.border,
                    boxShadow: rarityStyle.glow ? `0 0 20px ${rarityStyle.color}` : '0 4px 8px rgba(0,0,0,0.3)',
                    background: '#000',
                    animation: isMythic ? 'iridescent-border 3s ease-in-out infinite' : 'none'
                }}>
                    <img
                        src={card.images.front}
                        alt={card.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />

                    {/* Overlay Info */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                        padding: '1rem 0.75rem 0.75rem',
                        color: '#fff'
                    }}>
                        <div style={{ fontSize: compact ? '0.8rem' : '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {card.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaUser size={10} />
                            {card.creatorName}
                        </div>
                    </div>

                    {/* Rarity Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: rarityStyle.color,
                        color: '#000',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        <FaStar size={10} />
                        {card.rarity}
                    </div>

                    {/* Edition Number */}
                    {ownership && (
                        <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            left: '0.5rem',
                            background: 'rgba(0,0,0,0.8)',
                            color: '#fff',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                        }}>
                            {ownership.isCreatorCopy ? 'Creator' : `#${ownership.editionNumber}`}
                            {card.editionSize && !ownership.isCreatorCopy && `/${card.editionSize}`}
                        </div>
                    )}

                    {/* For Sale Indicator */}
                    {ownership?.forSale && (
                        <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#7FFFD4',
                            color: '#000',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            <FaShoppingCart size={10} />
                            ${ownership.salePrice}
                        </div>
                    )}

                    {/* Price (for marketplace) */}
                    {showPrice && !ownership?.forSale && card.basePrice > 0 && (
                        <div style={{
                            position: 'absolute',
                            bottom: '3.5rem',
                            left: '0.75rem',
                            background: 'rgba(127, 255, 212, 0.9)',
                            color: '#000',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                        }}>
                            ${card.basePrice}
                        </div>
                    )}
                </div>

                {/* Back (if exists) */}
                {card.images.back && (
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: isMythic ? '4px solid #FF00FF' : rarityStyle.border,
                        boxShadow: rarityStyle.glow ? `0 0 20px ${rarityStyle.color}` : '0 4px 8px rgba(0,0,0,0.3)',
                        background: '#000',
                        animation: isMythic ? 'iridescent-border 3s ease-in-out infinite' : 'none'
                    }}>
                        <img
                            src={card.images.back}
                            alt={`${card.title} - Back`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Holographic Effect for Mythic */}
            {card.rarity === 'Mythic' && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '12px',
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,0,255,0.3) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                    animation: 'holographic 3s ease infinite',
                    pointerEvents: 'none'
                }} />
            )}
        </div>
    );
};

export default SpaceCardComponent;
