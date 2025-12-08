import React, { useState, useEffect } from 'react';
import { FaTimes, FaRocket, FaWallet } from 'react-icons/fa';
import { purchaseBoost, BOOST_LEVELS } from '@/core/services/firestore/monetization.service';
import { WalletService } from '@/services/WalletService';
import { useAuth } from '@/context/AuthContext';

const BoostModal = ({ postId, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        if (currentUser) {
            loadWallet();
        }
    }, [currentUser]);

    const loadWallet = async () => {
        try {
            const wallet = await WalletService.getWallet(currentUser.uid);
            setWalletBalance(wallet?.balance || 0);
        } catch (err) {
            console.error('Error loading wallet:', err);
        }
    };

    const handlePurchase = async () => {
        const boostConfig = BOOST_LEVELS[selectedLevel];
        const price = boostConfig.priceCents / 100;

        if (walletBalance < price) {
            setError('Insufficient funds. Please add money to your wallet.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await purchaseBoost(currentUser.uid, postId, selectedLevel);
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to purchase boost');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: '#1a1a1a',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '100%',
                position: 'relative'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaRocket /> Boost Your Post
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1.5rem'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {/* Wallet Balance */}
                    <div style={{
                        background: 'rgba(127, 255, 212, 0.1)',
                        border: '1px solid rgba(127, 255, 212, 0.3)',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <FaWallet color="#7FFFD4" />
                        <span style={{ color: '#ccc' }}>Wallet Balance:</span>
                        <span style={{ color: '#7FFFD4', fontWeight: 'bold' }}>${walletBalance.toFixed(2)}</span>
                    </div>

                    <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>
                        Increase your post's visibility in the Explore feed. Boosts are temporary and ethical—they won't dominate the feed.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        {Object.entries(BOOST_LEVELS).map(([level, config]) => (
                            <div
                                key={level}
                                onClick={() => setSelectedLevel(Number(level))}
                                style={{
                                    padding: '1.5rem',
                                    background: selectedLevel === Number(level) ? '#2a2a2a' : '#1a1a1a',
                                    border: selectedLevel === Number(level) ? '2px solid #fff' : '1px solid #555',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ color: '#fff', margin: 0 }}>{config.label}</h3>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                                        ${(config.priceCents / 100).toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ color: '#888', fontSize: '0.9rem' }}>
                                    {config.multiplier}x multiplier • {config.durationHours} hours
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div style={{
                            background: '#ff000020',
                            border: '1px solid #ff0000',
                            borderRadius: '8px',
                            padding: '0.8rem',
                            color: '#ff6b6b',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePurchase}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: loading ? '#555' : '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <FaRocket /> Purchase Boost - ${(BOOST_LEVELS[selectedLevel].priceCents / 100).toFixed(2)}
                            </>
                        )}
                    </button>

                    <p style={{ color: '#666', fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem' }}>
                        Boosts are non-refundable and expire after the duration.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BoostModal;
