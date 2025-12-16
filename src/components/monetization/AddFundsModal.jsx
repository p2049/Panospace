import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaGem, FaRocket } from 'react-icons/fa';
import { getUserTier, USER_TIERS } from '@/core/services/firestore/monetization.service';
import { useAuth } from '@/context/AuthContext';

const AddFundsModal = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
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

    // Body Scroll Lock
    useEffect(() => {
        // Save original overflow
        const originalStyle = window.getComputedStyle(document.body).overflow;
        // Lock body scroll
        document.body.style.overflow = 'hidden';

        return () => {
            // Restore original overflow
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const checkUserStatus = async () => {
        const tier = await getUserTier(currentUser.uid);
        setIsSpaceCreator(tier === USER_TIERS.ULTRA || tier === USER_TIERS.PARTNER);
    };

    const handleSubscribe = async () => {
        setLoading(true);
        setError('');

        try {
            // Call the Stripe Subscription Cloud Function
            // We use the function created in previous step: createCreatorSubscriptionCheckout
            const { httpsCallable, getFunctions } = await import('firebase/functions');
            const functions = getFunctions();
            const createCheckout = httpsCallable(functions, 'createCreatorSubscriptionCheckout');

            const { data } = await createCheckout();

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL returned");
            }

        } catch (err) {
            console.error("Subscription failed:", err);
            setError(err.message || "Failed to initiate upgrade.");
            setLoading(false);
        }
    };

    // Removed handlePayment, handleAmountSelect, handleCustomChange
    // This modal is now strictly for Membership Upgrades

    return createPortal(
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999, // Ensure it's on top of everything
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
                maxHeight: '90vh', // Prevent overflowing screen height
                overflowY: 'auto', // Allow scrolling within the box
                border: '2px solid #7FFFD4',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(127, 255, 212, 0.2)',
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
                    background: '#222',
                    position: 'sticky', // Keep header visible
                    top: 0,
                    zIndex: 2
                }}>
                    <h2 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem' }}>
                        <FaGem color="#7FFFD4" /> Space Creator Plan
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
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0, #e0b3ff)',
                                        backgroundSize: '300% 300%',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1,
                                        transition: 'transform 0.2s',
                                        animation: 'iridescent-button 6s ease infinite',
                                        boxShadow: '0 4px 20px rgba(224, 179, 255, 0.3)'
                                    }}
                                >
                                    {loading ? 'Redirecting to Stripe...' : 'Upgrade Now ($5/mo)'}
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

                    {/* Removed Pay Button */}

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
        </div>,
        document.body
    );
};

export default AddFundsModal;
