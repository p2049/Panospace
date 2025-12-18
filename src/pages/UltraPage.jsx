import React, { useState, useEffect } from 'react';
import { FaGem, FaCheck, FaTrophy, FaImage, FaPalette, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { subscribeToUltra, getUserTier, USER_TIERS } from '@/core/services/firestore/monetization.service';
import { useAuth } from '@/context/AuthContext';
import UltraBadge from '@/components/monetization/UltraBadge';

const UltraPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [tier, setTier] = useState(USER_TIERS.FREE);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            loadUserTier();
        }
    }, [currentUser]);

    const loadUserTier = async () => {
        const userTier = await getUserTier(currentUser.uid);
        setTier(userTier);
    };

    const handleSubscribe = async () => {
        if (!currentUser) return;
        setLoading(true);

        try {
            console.log('[UltraPage] Initiating checkout for user:', currentUser.uid);
            const res = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid
                    // Not passing customerId here to keep it simple, backend handles defaults
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('[UltraPage] API Error:', res.status, errorText);
                throw new Error(`Checkout API missing or failed (${res.status}): ${errorText}`);
            }

            const { url } = await res.json();
            if (!url) throw new Error("No checkout URL returned from API");

            console.log('[UltraPage] Redirecting to:', url);
            window.location.href = url;
        } catch (error) {
            console.error('[UltraPage] Checkout Critical Error:', error);
            alert('Checkout Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: FaTrophy, title: 'Create Contests & Events', description: 'Host time-drop events and community challenges' },
        { icon: FaImage, title: 'Limited Edition Prints', description: 'Create PhotoDex cards with rarity tiers and provenance tracking' },
        { icon: FaPalette, title: 'Commissions', description: 'Accept paid requests from the community' }
    ];

    if (tier === USER_TIERS.ULTRA || tier === USER_TIERS.PARTNER) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#000',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                    <UltraBadge size="lg" />
                    <h1 style={{ color: '#fff', marginTop: '2rem', fontSize: '2.5rem' }}>
                        You're a Space Creator!
                    </h1>
                    <p style={{ color: '#ccc', fontSize: '1.2rem', marginTop: '1rem' }}>
                        Enjoy all the premium features PanoSpace has to offer.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #000 0%, #1a1a1a 100%)',
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: '#fff',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                    <FaArrowLeft size={18} />
                </button>

                {/* Hero Section */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <FaGem size={48} style={{
                            background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0, #e0b3ff)',
                            backgroundSize: '300% 300%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'iridescent-shimmer 6s ease infinite'
                        }} />
                        <h1 style={{
                            color: '#fff',
                            fontSize: '3rem',
                            margin: 0,
                            background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0, #e0b3ff)',
                            backgroundSize: '300% 300%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'iridescent-shimmer 6s ease infinite'
                        }}>
                            Ultra
                        </h1>
                    </div>
                    <p style={{ color: '#ccc', fontSize: '1.3rem', maxWidth: '600px', margin: '0 auto' }}>
                        Unlock exclusive features, contests, and monetization tools for professional photographers.
                    </p>
                </div>

                {/* Features Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    marginBottom: '4rem'
                }}>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            style={{
                                background: '#1a1a1a',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                padding: '2rem',
                                transition: 'transform 0.2s',
                                cursor: 'default'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <feature.icon size={32} style={{
                                marginBottom: '1rem',
                                background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }} />
                            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{feature.title}</h3>
                            <p style={{ color: '#888', lineHeight: '1.6' }}>{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Pricing */}
                <div style={{
                    position: 'relative',
                    borderRadius: '16px',
                    padding: '3rem',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '0 auto',
                    background: '#1a1a1a',
                    overflow: 'hidden'
                }}>
                    {/* Iridescent animated border */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '16px',
                        padding: '2px',
                        background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0, #e0b3ff)',
                        backgroundSize: '300% 300%',
                        animation: 'iridescent-shimmer 6s ease infinite',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        pointerEvents: 'none'
                    }} />

                    <h2 style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        $5.00<span style={{ fontSize: '1.2rem' }}>/month</span>
                    </h2>
                    <p style={{ color: '#888', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        Cancel anytime. No long-term commitment.
                    </p>
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        style={{
                            padding: '1.2rem 3rem',
                            background: 'linear-gradient(135deg, #e0b3ff, #b3e5fc, #c5f5e8, #ffd6f0, #e0b3ff)',
                            backgroundSize: '300% 300%',
                            color: '#000',
                            border: 'none',
                            borderRadius: '30px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s',
                            opacity: loading ? 0.7 : 1,
                            animation: 'iridescent-shimmer 6s ease infinite'
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {loading ? 'Processing...' : 'Upgrade with Card'}
                    </button>
                </div>

                {/* Iridescent Animation Keyframes */}
                <style>{`
                    @keyframes iridescent-shimmer {
                        0% { background-position: 0% 50%; }
                        25% { background-position: 50% 100%; }
                        50% { background-position: 100% 50%; }
                        75% { background-position: 50% 0%; }
                        100% { background-position: 0% 50%; }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default UltraPage;
