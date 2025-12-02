import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaLock } from 'react-icons/fa';

const BadgeCard = ({ badge, isLocked = false, onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick(badge);
        } else if (!isLocked && badge.relatedPostId) {
            navigate(`/post/${badge.relatedPostId}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: isLocked ? 'default' : 'pointer',
                border: isLocked ? '2px dashed #333' : '2px solid #444',
                background: isLocked ? '#0a0a0a' : '#111',
                transition: 'all 0.3s ease',
                filter: isLocked ? 'grayscale(100%)' : 'none',
                opacity: isLocked ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
                if (!isLocked) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.borderColor = '#7FFFD4';
                }
            }}
            onMouseLeave={(e) => {
                if (!isLocked) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = '#444';
                }
            }}
        >
            {/* Badge Image */}
            {!isLocked && badge.badgeImageUrl ? (
                <img
                    src={badge.badgeImageUrl}
                    alt={badge.subjectName}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            ) : (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
                }}>
                    <FaLock size={32} color="#333" />
                </div>
            )}

            {/* Rarity Stars */}
            {!isLocked && badge.rarityScore && (
                <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    display: 'flex',
                    gap: '2px'
                }}>
                    {[...Array(Math.min(badge.rarityScore, 10))].map((_, i) => (
                        <FaStar
                            key={i}
                            size={8}
                            color={badge.rarityScore >= 8 ? '#FFD700' : badge.rarityScore >= 6 ? '#7FFFD4' : '#888'}
                        />
                    ))}
                </div>
            )}

            {/* PP Badge */}
            {!isLocked && badge.pointsAwarded && (
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    padding: '1.5rem 0.5rem 0.5rem',
                    color: '#fff'
                }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', textAlign: 'center' }}>
                        {badge.subjectName}
                    </div>
                    <div style={{
                        fontSize: '0.6rem',
                        color: '#7FFFD4',
                        textAlign: 'center',
                        marginTop: '0.25rem'
                    }}>
                        +{badge.pointsAwarded} PP
                    </div>
                </div>
            )}

            {/* Locked State */}
            {isLocked && (
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '0.5rem',
                    color: '#666',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                }}>
                    ???
                </div>
            )}
        </div>
    );
};

export default BadgeCard;
