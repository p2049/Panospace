import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaShoppingCart, FaUser, FaClock, FaChartLine } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSpaceCard } from '@/hooks/useSpaceCard';
import { SpaceCardService, RARITY_TIERS } from '@/services/SpaceCardService';
import SpaceCardComponent from '@/components/SpaceCardComponent';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { isFeatureEnabled } from '@/config/featureFlags';

const CardDetailPage = () => {
    const { cardId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { showError, showSuccess, showWarning } = useToast();

    // Use custom hook for card data
    const { card, listings, loading, error } = useSpaceCard(cardId);

    const [minting, setMinting] = useState(false);

    const handleMint = async () => {
        if (!currentUser) {
            showWarning('Please log in to mint cards');
            return;
        }

        setMinting(true);
        try {
            await SpaceCardService.mintCard(
                cardId,
                currentUser.uid,
                currentUser.displayName || currentUser.email
            );
            showSuccess('Card minted successfully!');
            // Refresh card data
            const updatedCard = await SpaceCardService.getCard(cardId);
            setCard(updatedCard);
        } catch (error) {
            console.error('Error minting card:', error);
            showError('Failed to mint card: ' + error.message);
        } finally {
            setMinting(false);
        }
    };

    const handlePurchase = async (listingId) => {
        if (!currentUser) {
            showWarning('Please log in to purchase cards');
            return;
        }

        try {
            await SpaceCardService.purchaseCard(
                listingId,
                currentUser.uid,
                currentUser.displayName || currentUser.email
            );
            showSuccess('Card purchased successfully!');
            navigate('/profile/me');
        } catch (error) {
            console.error('Error purchasing card:', error);
            showError('Failed to purchase card: ' + error.message);
        }
    };



    if (loading) {
        return <PageSkeleton />;
    }

    if (!card) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--black)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Card not found
            </div>
        );
    }

    const rarityStyle = RARITY_TIERS[card.rarity];
    const isSoldOut = card.editionType === 'limited' && card.mintedCount >= card.editionSize;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--black)', color: '#fff', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                    }}
                >
                    <FaArrowLeft />
                </button>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Card Details</h1>
            </div>

            {/* Content */}
            <div className="container-md">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
                    {/* Card Preview */}
                    <div>
                        <SpaceCardComponent card={card} />
                    </div>

                    {/* Card Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{card.title}</h2>
                            <div style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaUser size={14} />
                                Created by {card.creatorName}
                            </div>
                        </div>

                        {card.description && (
                            <p style={{ color: '#ccc', lineHeight: '1.6' }}>{card.description}</p>
                        )}

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: '#111', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Rarity</div>
                                <div style={{ color: rarityStyle.color, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaStar /> {card.rarity}
                                </div>
                            </div>

                            <div style={{ background: '#111', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Edition</div>
                                <div style={{ fontWeight: 'bold' }}>
                                    {card.editionType === 'limited' ? `${card.mintedCount}/${card.editionSize}` : card.editionType}
                                </div>
                            </div>

                            <div style={{ background: '#111', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Owners</div>
                                <div style={{ fontWeight: 'bold' }}>{card.stats.totalOwners}</div>
                            </div>

                            <div style={{ background: '#111', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Floor Price</div>
                                <div style={{ fontWeight: 'bold', color: '#7FFFD4' }}>
                                    ${card.stats.floorPrice?.toFixed(2) || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Mint Button (Primary Sale) */}
                        {!isSoldOut && card.editionType !== 'unlimited' && isFeatureEnabled('SHOP') && (
                            <button
                                onClick={handleMint}
                                disabled={minting}
                                style={{
                                    padding: '1rem 2rem',
                                    background: minting ? '#333' : '#7FFFD4',
                                    color: minting ? '#888' : '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    cursor: minting ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <FaShoppingCart />
                                {minting ? 'Minting...' : `Mint for $${card.basePrice}`}
                            </button>
                        )}

                        {isSoldOut && (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255,0,0,0.1)',
                                border: '1px solid #ff0000',
                                borderRadius: '8px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#ff0000'
                            }}>
                                SOLD OUT
                            </div>
                        )}
                    </div>
                </div>

                {/* Marketplace Listings */}
                {listings.length > 0 && isFeatureEnabled('SPACECARDS_MARKETPLACE') && (
                    <div>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaChartLine /> Marketplace Listings
                        </h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {listings.map(listing => (
                                <div
                                    key={listing.listing.id}
                                    style={{
                                        background: '#111',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        padding: '1.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                            Edition #{listing.listing.editionNumber}
                                            {listing.editionSize && `/${listing.editionSize}`}
                                        </div>
                                        <div style={{ color: '#888', fontSize: '0.9rem' }}>
                                            Seller: {listing.listing.ownerName}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7FFFD4' }}>
                                            ${listing.listing.salePrice}
                                        </div>
                                        <button
                                            onClick={() => handlePurchase(listing.listing.id)}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                background: '#7FFFD4',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardDetailPage;
