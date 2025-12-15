import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaUser } from 'react-icons/fa';
import { RARITY_TIERS } from '@/services/SpaceCardService';
import '@/styles/rarity-system.css';

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
    const isGalactic = card.rarity === 'Galactic';
    const isUltra = card.rarity === 'Ultra';

    // Get the CSS class for this rarity
    const rarityClass = rarityStyle.cssClass || 'rarity-common';
    const glowClass = rarityStyle.glow ? `space-card-${rarityClass}` : '';

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
                <div
                    className={`${rarityClass} ${isUltra ? 'rarity-animated' : ''}`}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#000',
                        boxShadow: rarityStyle.glow ? `0 0 20px ${rarityStyle.colorHex}40` : '0 4px 8px rgba(0,0,0,0.3)'
                    }}
                >
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
                    <div
                        className={`rarity-badge rarity-badge-${card.rarity?.toLowerCase() || 'common'}`}
                        style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem'
                        }}
                    >
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
                            background: 'var(--brand-mint)',
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
                            background: 'var(--ice-mint-alpha-20)',
                            backdropFilter: 'blur(8px)',
                            color: 'var(--brand-mint)',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            border: '1px solid var(--brand-mint)'
                        }}>
                            ${card.basePrice}
                        </div>
                    )}
                </div>

                {/* Back (if exists) */}
                {card.images.back && (
                    <div
                        className={`${rarityClass} ${isUltra ? 'rarity-animated' : ''}`}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            background: '#000',
                            boxShadow: rarityStyle.glow ? `0 0 20px ${rarityStyle.colorHex}40` : '0 4px 8px rgba(0,0,0,0.3)'
                        }}
                    >
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

            {/* Holographic Effect for Galactic */}
            {isGalactic && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '12px',
                    background: 'var(--gradient-iridescent)',
                    backgroundSize: '300% 300%',
                    animation: 'rarity-galactic-shift 8s ease infinite',
                    opacity: 0.15,
                    pointerEvents: 'none'
                }} />
            )}
        </div>
    );
};

export default SpaceCardComponent;

