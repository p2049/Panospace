import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaWallet, FaCreditCard, FaLock, FaGem, FaRocket } from 'react-icons/fa';
import { WalletService } from '../../services/WalletService';
import { subscribeToUltra, getUserTier, USER_TIERS } from '../../services/monetizationService';
import { useAuth } from '../../context/AuthContext';

const PRESET_AMOUNTS = [10, 25, 50, 100];

const AddFundsModal = ({ onClose, onSuccess, currentBalance }) => {
    const { currentUser } = useAuth();
    const [selectedAmount, setSelectedAmount] = useState(25);
    const [customAmount, setCustomAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [error, setError] = useState('');
    const [isSpaceCreator, setIsSpaceCreator] = useState(false);

    // Generate stars once and memoize them
    const stars = useMemo(() => {
        return [...Array(80)].map((_, i) => ({
            id: i,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            top: Math.random() * 100,
            left: Math.random() * 100,
            opacity: Math.random() * 0.5 + 0.3,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            glow: Math.random() * 3 + 2
        }));
    }, []);

    useEffect(() => {
        if (currentUser) {
            checkUserStatus();
        }
    }, [currentUser]);

    const checkUserStatus = async () => {
        const tier = await getUserTier(currentUser.uid);
        setIsSpaceCreator(tier === USER_TIERS.ULTRA || tier === USER_TIERS.PARTNER);
    };

    const handleSubscribe = async () => {
        if (currentBalance < 5) {
            setError("Insufficient wallet balance. Please add funds first.");
            return;
        }

        setSubscribing(true);
        setError('');

        try {
            await subscribeToUltra(currentUser.uid);
            setIsSpaceCreator(true);
            onSuccess?.(0); // Refresh balance (0 added, but balance changed)
        } catch (err) {
            console.error("Subscription failed:", err);
            setError(err.message || "Failed to subscribe.");
        } finally {
            setSubscribing(false);
        }
    };

    const handleAmountSelect = (amount) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    const handleCustomChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
            setCustomAmount(val);
            setSelectedAmount(null);
        }
    };

    const getFinalAmount = () => {
        if (customAmount) return parseFloat(customAmount);
        return selectedAmount;
    };

    const handlePayment = async () => {
        const amount = getFinalAmount();

        if (!amount || amount < 5) {
            setError('Minimum deposit is $5.00');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // SIMULATED PAYMENT DELAY
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Add funds to wallet
            await WalletService.addFunds(
                currentUser.uid,
                amount,
                'deposit',
                'Added funds to wallet'
            );

            onSuccess?.(amount);
            onClose();
        } catch (err) {
            console.error("Payment failed:", err);
            setError("Payment failed. Please try again.");
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
            zIndex: 2000,
            padding: '1rem',
            backdropFilter: 'blur(5px)',
            overflow: 'hidden'
        }}>
            {/* Animated Stars Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 0
            }}>
                {stars.map((star) => (
                    <div
                        key={star.id}
                        style={{
                            position: 'absolute',
                            width: star.width + 'px',
                            height: star.height + 'px',
                            background: '#7FFFD4',
                            borderRadius: '50%',
                            top: star.top + '%',
                            left: star.left + '%',
                            opacity: star.opacity,
                            animation: `twinkle ${star.duration}s ease-in-out infinite`,
                            animationDelay: `${star.delay}s`,
                            boxShadow: `0 0 ${star.glow}px #7FFFD4`
                        }}
                    />
                ))}
            </div>

            <div style={{
                background: '#000',
                borderRadius: '16px',
                maxWidth: '450px',
                width: '100%',
                border: '2px solid #7FFFD4',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(127, 255, 212, 0.2)',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#222'
                }}>
                    <h2 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem' }}>
                        <FaWallet color="#7FFFD4" /> Add Funds
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', position: 'relative' }}>
                    {/* Stars behind content */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        opacity: 0.3,
                        overflow: 'hidden'
                    }}>
                        {stars.slice(0, 30).map((star) => (
                            <div
                                key={`content-${star.id}`}
                                style={{
                                    position: 'absolute',
                                    width: star.width + 'px',
                                    height: star.height + 'px',
                                    background: '#7FFFD4',
                                    borderRadius: '50%',
                                    top: star.top + '%',
                                    left: star.left + '%',
                                    opacity: star.opacity * 0.5,
                                    animation: `twinkle ${star.duration}s ease-in-out infinite`,
                                    animationDelay: `${star.delay}s`,
                                    boxShadow: `0 0 ${star.glow}px #7FFFD4`
                                }}
                            />
                        ))}
                    </div>

                    {/* Current Balance */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Current Balance</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
                            ${currentBalance?.toFixed(2) || '0.00'}
                        </div>
                    </div>

                    {/* Amount Selection */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '1rem', fontWeight: 'bold' }}>Select Amount</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', marginBottom: '1rem' }}>
                            {PRESET_AMOUNTS.map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => handleAmountSelect(amount)}
                                    style={{
                                        padding: '0.8rem',
                                        background: selectedAmount === amount ? '#7FFFD4' : '#333',
                                        color: selectedAmount === amount ? '#000' : '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ${amount}
                                </button>
                            ))}
                        </div>

                        {/* Custom Amount */}
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>$</span>
                            <input
                                type="text"
                                placeholder="Custom Amount"
                                value={customAmount}
                                onChange={handleCustomChange}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 2.5rem',
                                    background: '#111',
                                    border: customAmount ? '1px solid #7FFFD4' : '1px solid #444',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Payment Method Stub */}
                    <div style={{ marginBottom: '2rem', padding: '1rem', background: '#252525', borderRadius: '8px', border: '1px solid #333' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#ccc', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaCreditCard /> Payment Method
                            </span>
                            <span style={{ color: '#888', fontSize: '0.8rem' }}>Mock Payment</span>
                        </div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                            •••• •••• •••• 4242 (Visa)
                        </div>
                    </div>

                    {/* Space Creator Subscription Section */}
                    <div style={{
                        marginBottom: '2rem',
                        position: 'relative'
                    }}>
                        {/* Iridescent animated border outline */}
                        <div style={{
                            position: 'absolute',
                            inset: '-2px',
                            borderRadius: '16px',
                            padding: '2px',
                            background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0, #e0b3ff)',
                            backgroundSize: '300% 300%',
                            animation: 'iridescent-border 6s ease infinite',
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                            pointerEvents: 'none'
                        }} />

                        {/* Glass content box */}
                        <div style={{
                            padding: '1.5rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            backdropFilter: 'blur(40px) saturate(180%) brightness(1.15) contrast(1.1)',
                            WebkitBackdropFilter: 'blur(40px) saturate(180%) brightness(1.15) contrast(1.1)',
                            borderRadius: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: `
                                inset 0 1px 1px rgba(255, 255, 255, 0.3),
                                inset 0 -1px 1px rgba(255, 255, 255, 0.1),
                                0 8px 32px rgba(127, 255, 212, 0.1)
                            `
                        }}>
                            {/* Distortion overlay - creates refraction effect */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `
                                    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
                                    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                                    linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)
                                `,
                                pointerEvents: 'none',
                                mixBlendMode: 'overlay'
                            }} />

                            {/* Subtle noise texture for realism */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                opacity: 0.03,
                                pointerEvents: 'none',
                                mixBlendMode: 'overlay'
                            }} />


                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                width: '60px',
                                height: '60px',
                                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                                filter: 'blur(30px)',
                                opacity: 0.2
                            }} />

                            {/* Glass reflection effect */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '50%',
                                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                                pointerEvents: 'none',
                                borderRadius: '12px 12px 0 0'
                            }} />


                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, color: '#7FFFD4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaRocket style={{
                                        background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0, #e0b3ff)',
                                        backgroundSize: '300% 300%',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        animation: 'iridescent-shimmer 6s ease infinite',
                                        filter: 'brightness(1.2)'
                                    }} /> Space Creator
                                </h3>
                                {isSpaceCreator ? (
                                    <span style={{
                                        background: 'rgba(255, 215, 0, 0.2)',
                                        color: '#FFD700',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        border: '1px solid rgba(255, 215, 0, 0.4)'
                                    }}>
                                        ACTIVE
                                    </span>
                                ) : (
                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>$5.00/mo</span>
                                )}
                            </div>

                            <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                {isSpaceCreator
                                    ? "You have full access to all Space Creator features."
                                    : "Unlock exclusive features, contests, and monetization tools."}
                            </p>

                            {!isSpaceCreator && (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribing || loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0, #e0b3ff)',
                                        backgroundSize: '300% 300%',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: (subscribing || loading) ? 'not-allowed' : 'pointer',
                                        opacity: (subscribing || loading) ? 0.7 : 1,
                                        transition: 'transform 0.2s',
                                        animation: 'iridescent-button 6s ease infinite',
                                        boxShadow: '0 4px 20px rgba(224, 179, 255, 0.3)'
                                    }}
                                >
                                    {subscribing ? 'Activating...' : 'Upgrade to Space Creator'}
                                </button>
                            )}
                        </div>
                    </div>


                    {error && (
                        <div style={{
                            background: 'rgba(255, 107, 107, 0.1)',
                            border: '1px solid rgba(255, 107, 107, 0.3)',
                            color: '#ff6b6b',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={loading || subscribing}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: (loading || subscribing) ? '#555' : '#7FFFD4',
                            color: (loading || subscribing) ? '#ccc' : '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: (loading || subscribing) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.8rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? (
                            'Processing...'
                        ) : (
                            <>
                                <FaLock size={14} /> Pay ${getFinalAmount()?.toFixed(2) || '0.00'}
                            </>
                        )}
                    </button>

                    <p style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem', marginTop: '1rem' }}>
                        Secure, encrypted transaction. Funds are available immediately.
                    </p>
                </div>
            </div>


            {/* Iridescent Animations */}
            <style>{`
                @keyframes iridescent-border {
                    0% { background-position: 0% 50%; }
                    25% { background-position: 50% 100%; }
                    50% { background-position: 100% 50%; }
                    75% { background-position: 50% 0%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes iridescent-shimmer {
                    0% { background-position: 0% 50%; }
                    25% { background-position: 50% 100%; }
                    50% { background-position: 100% 50%; }
                    75% { background-position: 50% 0%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes iridescent-button {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
};

export default AddFundsModal;
