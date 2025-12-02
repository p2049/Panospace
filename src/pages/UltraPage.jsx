import React, { useState, useEffect } from 'react';
import { FaGem, FaCheck, FaTrophy, FaImage, FaPalette, FaStore, FaCrown } from 'react-icons/fa';
import { subscribeToUltra, getUserTier, USER_TIERS } from '../services/monetizationService';
import { useAuth } from '../context/AuthContext';
import UltraBadge from '../components/monetization/UltraBadge';

const UltraPage = () => {
    const { currentUser } = useAuth();
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

        // In a real app, we'd check balance here or open the wallet modal
        // For this page, we'll just redirect them to open their wallet
        alert("Please open your Wallet (top right) to upgrade to Space Creator!");
    };

    const features = [
        { icon: FaTrophy, title: 'Create Contests & Events', description: 'Host time-drop events and community challenges' },
        { icon: FaImage, title: 'Limited Edition Prints', description: 'Create PhotoDex cards with rarity tiers and provenance tracking' },
        { icon: FaPalette, title: 'RAW Editing Commissions', description: 'Accept paid editing requests from the community' },
        { icon: FaStore, title: 'Shop Upgrades', description: 'Higher royalty split (75% vs 60%) and gallery print packs' },
        { icon: FaCrown, title: 'Priority Feed Ranking', description: 'Small ethical boost in Explore feed' },
        { icon: FaGem, title: 'Profile Customization', description: 'Custom gradients, animated banners, and exclusive badges' }
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
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Hero Section */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <FaGem size={48} color="#FFD700" />
                        <h1 style={{
                            color: '#fff',
                            fontSize: '3rem',
                            margin: 0,
                            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Space Creator
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
                            <feature.icon size={32} color="#FFD700" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{feature.title}</h3>
                            <p style={{ color: '#888', lineHeight: '1.6' }}>{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Pricing */}
                <div style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    borderRadius: '16px',
                    padding: '3rem',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    <h2 style={{ color: '#000', fontSize: '2.5rem', marginBottom: '1rem' }}>
                        $5.00<span style={{ fontSize: '1.2rem' }}>/month</span>
                    </h2>
                    <p style={{ color: '#333', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        Cancel anytime. No long-term commitment.
                    </p>
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        style={{
                            padding: '1.2rem 3rem',
                            background: '#000',
                            color: '#FFD700',
                            border: 'none',
                            borderRadius: '30px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {loading ? 'Processing...' : 'Upgrade via Wallet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UltraPage;
