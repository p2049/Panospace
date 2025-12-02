import React from 'react';
import { FaTimes, FaStar, FaTrophy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { SpaceCardService } from '../services/SpaceCardService';

const BadgeUnlockedModal = ({ badges, onClose, userId, userName }) => {
    const navigate = useNavigate();

    if (!badges || badges.length === 0) return null;

    const badge = badges[0]; // Show first badge

    const handleGenerateCard = async () => {
        try {
            // Map PhotoDex rarity to SpaceCard rarity
            const mapRarity = (photoDexRarity) => {
                if (photoDexRarity <= 3) return 'Common';
                if (photoDexRarity <= 5) return 'Uncommon';
                if (photoDexRarity <= 7) return 'Rare';
                if (photoDexRarity === 8) return 'Epic';
                if (photoDexRarity === 9) return 'Legendary';
                return 'Mythic';
            };

            const cardData = {
                creatorUid: userId,
                creatorName: userName,
                frontImage: badge.badgeImageUrl,
                title: `${badge.subjectName} Badge`,
                description: `PhotoDex badge for capturing ${badge.subjectName}`,
                discipline: badge.type,
                rarity: mapRarity(badge.rarityScore),
                editionType: 'limited',
                editionSize: 100,
                linkedPhotoDexEntryId: badge.badgeId,
                cardStyle: 'wildlife',
                basePrice: badge.pointsAwarded / 10
            };

            await SpaceCardService.createCard(cardData);
            alert('SpaceCard created successfully!');
            navigate('/profile/me');
        } catch (error) {
            console.error('Error creating card:', error);
            alert('Failed to create card: ' + error.message);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                border: '2px solid #7FFFD4',
                borderRadius: '16px',
                maxWidth: '500px',
                width: '100%',
                padding: '2rem',
                position: 'relative',
                animation: 'slideUp 0.5s ease'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '1.5rem'
                    }}
                >
                    <FaTimes />
                </button>

                {/* Celebration Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <FaTrophy size={48} color="#FFD700" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#7FFFD4' }}>
                        Badge Unlocked!
                    </h2>
                </div>

                {/* Badge Display */}
                <div style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '3px solid #7FFFD4',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    boxShadow: '0 0 30px rgba(127, 255, 212, 0.3)'
                }}>
                    <img
                        src={badge.badgeImageUrl}
                        alt={badge.subjectName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Rarity Stars */}
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        display: 'flex',
                        gap: '4px'
                    }}>
                        {[...Array(Math.min(badge.rarityScore, 10))].map((_, i) => (
                            <FaStar
                                key={i}
                                size={16}
                                color={badge.rarityScore >= 8 ? '#FFD700' : '#7FFFD4'}
                            />
                        ))}
                    </div>
                </div>

                {/* Badge Info */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#fff' }}>
                        {badge.subjectName}
                    </h3>
                    <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {badge.type.charAt(0).toUpperCase() + badge.type.slice(1)}
                    </div>
                    <div style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #7FFFD4 0%, #00CED1 100%)',
                        color: '#000',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    }}>
                        +{badge.pointsAwarded} Photo Points
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={handleGenerateCard}
                        style={{
                            padding: '1rem',
                            background: '#7FFFD4',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        🎴 Generate SpaceCard from Badge
                    </button>

                    <button
                        onClick={() => navigate('/photodex')}
                        style={{
                            padding: '1rem',
                            background: '#222',
                            color: '#fff',
                            border: '1px solid #444',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        View PhotoDex
                    </button>

                    <button
                        onClick={onClose}
                        style={{
                            padding: '1rem',
                            background: 'transparent',
                            color: '#888',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Continue
                    </button>
                </div>

                {badges.length > 1 && (
                    <div style={{
                        marginTop: '1rem',
                        textAlign: 'center',
                        color: '#7FFFD4',
                        fontSize: '0.9rem'
                    }}>
                        +{badges.length - 1} more badge{badges.length > 2 ? 's' : ''} unlocked!
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default BadgeUnlockedModal;
