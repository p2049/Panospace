import React, { useState, useEffect } from 'react';
import { FaTimes, FaEnvelope, FaGlobe, FaBriefcase, FaMapMarkerAlt, FaCopy, FaCheck, FaImage, FaExchangeAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import SmartImage from './SmartImage';
import { getGradientBackground, getCurrentGradientId } from '@/core/constants/gradients';

const BusinessCardModal = ({ isOpen, onClose, user }) => {
    const { currentUser } = useAuth();
    const [copiedField, setCopiedField] = useState(null);

    // Form state (editable only by owner)
    const [isEditing, setIsEditing] = useState(false);
    const [cardData, setCardData] = useState({
        email: '',
        website: '',
        portfolioUrl: '',
        businessType: '',
        availableForCommission: false,
        cardImageUrl: '',
        fullCardImageUrl: '',
        layoutMode: 'split', // 'split' or 'full'
        bio: '' // New Bio field
    });

    // Initialize data from user profile
    useEffect(() => {
        if (user) {
            setCardData({
                email: user.email || '',
                website: user.website || '',
                portfolioUrl: user.portfolioUrl || '',
                businessType: user.businessType || '',
                availableForCommission: user.availableForCommission || false,
                cardImageUrl: user.cardImageUrl || '',
                fullCardImageUrl: user.fullCardImageUrl || '',
                layoutMode: user.cardLayoutMode || 'split',
                bio: user.bio || ''
            });
        }
    }, [user]);

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSave = async () => {
        if (!currentUser || !user) return;

        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                email: cardData.email,
                website: cardData.website,
                portfolioUrl: cardData.portfolioUrl,
                businessType: cardData.businessType,
                availableForCommission: cardData.availableForCommission,
                cardImageUrl: cardData.cardImageUrl,
                fullCardImageUrl: cardData.fullCardImageUrl,
                cardLayoutMode: cardData.layoutMode,
                bio: cardData.bio // Save Bio
            });
            setIsEditing(false);
            // Optional: Show success toast
        } catch (error) {
            console.error("Error saving business card:", error);
            alert("Failed to save business card changes.");
        }
    };

    if (!isOpen || !user) return null;

    const isOwner = currentUser && currentUser.uid === user.id;
    // Use user's chosen gradient or fallback
    const userGradient = getGradientBackground(user.profileTheme?.gradientId || user.gradientId || 'green-default');

    // Color Logic
    const usernameColor = (user.profileTheme?.usernameColor && !user.profileTheme.usernameColor.includes('gradient'))
        ? user.profileTheme.usernameColor
        : '#FFFFFF';

    const bioColor = user.profileTheme?.bioColor || 'rgba(255, 255, 255, 0.7)';
    const borderColor = usernameColor;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
        }}>
            {/* Card Container - 3.5 x 2 Ratio (1.75) */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                aspectRatio: '1.75 / 1',
                background: userGradient,
                borderRadius: '12px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                border: `2px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        color: '#fff',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 20
                    }}
                >
                    <FaTimes size={12} />
                </button>

                {/* FULL CARD MODE */}
                {cardData.layoutMode === 'full' ? (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        {cardData.fullCardImageUrl ? (
                            <SmartImage
                                src={cardData.fullCardImageUrl}
                                alt="Full Business Card"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#222',
                                color: '#666'
                            }}>
                                <FaImage size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <div>No Full Card Image Uploaded</div>
                            </div>
                        )}

                        {isOwner && isEditing && (
                            <div style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: '0.5rem'
                            }}>
                                <button style={{
                                    background: 'rgba(0,0,0,0.7)',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer'
                                }}>
                                    Upload Full Card
                                </button>
                                <button
                                    onClick={() => setCardData(prev => ({ ...prev, layoutMode: 'split' }))}
                                    style={{
                                        background: 'rgba(0,0,0,0.7)',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <FaExchangeAlt size={10} /> Switch to Split View
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* SPLIT MODE (Standard) with Bio on Left */
                    <div style={{ display: 'flex', width: '100%', height: '100%' }}>

                        {/* Left Side: Bio (40%) */}
                        <div style={{
                            width: '40%',
                            height: '100%',
                            padding: '1.5rem',
                            borderRight: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0,0,0,0.2)', // Slight tint for readability
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            overflowY: 'auto'
                        }}>
                            {isEditing ? (
                                <textarea
                                    value={cardData.bio}
                                    onChange={(e) => setCardData({ ...cardData, bio: e.target.value })}
                                    placeholder="Enter your professional bio..."
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: '#fff',
                                        borderRadius: '4px',
                                        padding: '0.5rem',
                                        resize: 'none',
                                        fontSize: '0.85rem'
                                    }}
                                />
                            ) : (
                                <p style={{
                                    margin: 0,
                                    color: bioColor,
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'var(--font-family-body)'
                                }}>
                                    {cardData.bio || 'No bio added.'}
                                </p>
                            )}
                        </div>

                        {/* Right Side: Content (60%) */}
                        <div style={{
                            width: '60%',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            {/* Name & Title */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h2 style={{
                                    margin: '0 0 0.25rem 0',
                                    fontSize: '1.4rem',
                                    color: usernameColor,
                                    fontWeight: '800',
                                    lineHeight: '1.2',
                                    fontFamily: 'var(--font-family-heading)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.02em'
                                }}>
                                    {user.displayName || user.username}
                                </h2>
                                <div style={{
                                    color: bioColor, // Use bioColor for subtitle too for coherence
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    opacity: 0.9
                                }}>
                                    {cardData.businessType || 'Creator'}
                                </div>
                            </div>

                            {/* Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#ccc' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: usernameColor, width: '16px', opacity: 0.7 }}>@</span>
                                    <span>{user.username}</span>
                                </div>

                                {user.location && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaMapMarkerAlt size={12} style={{ color: usernameColor, opacity: 0.7 }} />
                                        <span>{user.location}</span>
                                    </div>
                                )}

                                {cardData.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '100%' }}>
                                        <FaEnvelope size={12} style={{ color: usernameColor, opacity: 0.7, minWidth: '12px' }} />
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cardData.email}</span>
                                        <button
                                            onClick={() => handleCopy(cardData.email, 'email')}
                                            style={{ background: 'none', border: 'none', color: copiedField === 'email' ? 'var(--ice-mint)' : '#444', cursor: 'pointer', padding: 0 }}
                                        >
                                            {copiedField === 'email' ? <FaCheck size={10} /> : <FaCopy size={10} />}
                                        </button>
                                    </div>
                                )}

                                {cardData.website && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '100%' }}>
                                        <FaGlobe size={12} style={{ color: usernameColor, opacity: 0.7, minWidth: '12px' }} />
                                        <a
                                            href={cardData.website.startsWith('http') ? cardData.website : `https://${cardData.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#ccc', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                        >
                                            {cardData.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Footer / Status */}
                            {cardData.availableForCommission && (
                                <div style={{
                                    marginTop: 'auto',
                                    paddingTop: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontSize: '0.7rem',
                                    color: 'var(--ice-mint)'
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ice-mint)' }}></div>
                                    Available for Commission
                                </div>
                            )}

                            {/* Edit Toggle */}
                            {isOwner && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    display: 'flex',
                                    gap: '10px',
                                    alignItems: 'center'
                                }}>
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => setCardData(prev => ({ ...prev, layoutMode: 'full' }))}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#888',
                                                    fontSize: '0.7rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <FaExchangeAlt size={10} /> Use Full Card
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--ice-mint)',
                                                    fontSize: '0.7rem',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Save
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#444',
                                                fontSize: '0.7rem',
                                                cursor: 'pointer',
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessCardModal;
