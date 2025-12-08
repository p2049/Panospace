import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShopService } from '@/core/services/firestore/studios.service';
import { FaStore, FaCheck, FaShieldAlt, FaGavel } from 'react-icons/fa';

const ShopSetup = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Welcome, 2: Legal, 3: Profile
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Legal agreements
    const [acceptedCopyright, setAcceptedCopyright] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // Shop profile
    const [shopName, setShopName] = useState('');
    const [shopBio, setShopBio] = useState('');

    const handleComplete = async () => {
        if (!acceptedCopyright || !acceptedTerms) {
            setError('You must accept all agreements to continue');
            return;
        }

        if (!shopName.trim()) {
            setError('Shop name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await ShopService.completeShopSetup(currentUser.uid, {
                shopName: shopName.trim(),
                bio: shopBio.trim()
            });

            // Redirect to shop drafts or profile
            navigate('/shop/drafts');
        } catch (err) {
            console.error('Error completing shop setup:', err);
            setError('Failed to complete shop setup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            padding: '2rem 1rem'
        }}>
            <div style={{
                maxWidth: '700px',
                margin: '0 auto'
            }}>
                {/* Progress Indicator */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '3rem'
                }}>
                    {[1, 2, 3].map(num => (
                        <div
                            key={num}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: step >= num ? '#7FFFD4' : '#333',
                                color: step >= num ? '#000' : '#666',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                            }}
                        >
                            {step > num ? <FaCheck /> : num}
                        </div>
                    ))}
                </div>

                {/* Step 1: Welcome */}
                {step === 1 && (
                    <div style={{
                        background: '#111',
                        borderRadius: '12px',
                        padding: '3rem 2rem',
                        border: '1px solid #333',
                        textAlign: 'center'
                    }}>
                        <FaStore style={{
                            fontSize: '4rem',
                            color: '#7FFFD4',
                            marginBottom: '1.5rem'
                        }} />
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            marginBottom: '1rem'
                        }}>
                            Welcome to PanoSpace Shop
                        </h1>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#ccc',
                            lineHeight: '1.6',
                            marginBottom: '2rem'
                        }}>
                            Set up your shop to sell your photography as prints, digital downloads, and collectibles.
                        </p>

                        <div style={{
                            background: '#222',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            textAlign: 'left'
                        }}>
                            <h3 style={{ color: '#7FFFD4', marginBottom: '1rem', fontSize: '1.1rem' }}>
                                What you'll need:
                            </h3>
                            <ul style={{ color: '#ccc', lineHeight: '2', paddingLeft: '1.5rem' }}>
                                <li>Accept copyright and seller agreements</li>
                                <li>Create your shop profile</li>
                                <li>Confirm you own rights to your content</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            style={{
                                padding: '1rem 2rem',
                                background: '#7FFFD4',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#000',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                width: '100%',
                                maxWidth: '300px'
                            }}
                        >
                            Get Started
                        </button>
                    </div>
                )}

                {/* Step 2: Legal Agreements */}
                {step === 2 && (
                    <div style={{
                        background: '#111',
                        borderRadius: '12px',
                        padding: '2rem',
                        border: '1px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <FaGavel style={{ color: '#7FFFD4' }} />
                            Legal Agreements
                        </h2>

                        {/* Copyright Agreement */}
                        <div style={{
                            background: '#222',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            border: acceptedCopyright ? '1px solid #7FFFD4' : '1px solid #333'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1rem',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={acceptedCopyright}
                                    onChange={(e) => setAcceptedCopyright(e.target.checked)}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        cursor: 'pointer',
                                        marginTop: '2px'
                                    }}
                                />
                                <div>
                                    <div style={{
                                        color: '#fff',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem',
                                        fontSize: '1.05rem'
                                    }}>
                                        <FaShieldAlt style={{ color: '#7FFFD4', marginRight: '0.5rem' }} />
                                        Copyright & Ownership Certification
                                    </div>
                                    <p style={{ color: '#ccc', lineHeight: '1.6', margin: 0 }}>
                                        I certify that I own all rights to the content I sell on PanoSpace. I understand that selling copyrighted material without permission is illegal and may result in account suspension, legal action, and financial penalties. I accept full responsibility for any copyright claims.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Seller Terms */}
                        <div style={{
                            background: '#222',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            border: acceptedTerms ? '1px solid #7FFFD4' : '1px solid #333'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1rem',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        cursor: 'pointer',
                                        marginTop: '2px'
                                    }}
                                />
                                <div>
                                    <div style={{
                                        color: '#fff',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem',
                                        fontSize: '1.05rem'
                                    }}>
                                        PanoSpace Seller Terms
                                    </div>
                                    <p style={{ color: '#ccc', lineHeight: '1.6', margin: 0 }}>
                                        I accept the PanoSpace Seller Terms of Service, including payment processing fees, content guidelines, and dispute resolution procedures. I understand that PanoSpace may remove content that violates these terms.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {error && (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255, 68, 68, 0.1)',
                                border: '1px solid rgba(255, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#ff4444',
                                marginBottom: '1.5rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: '#333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!acceptedCopyright || !acceptedTerms}
                                style={{
                                    flex: 2,
                                    padding: '0.75rem',
                                    background: (acceptedCopyright && acceptedTerms) ? '#7FFFD4' : '#444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: (acceptedCopyright && acceptedTerms) ? '#000' : '#666',
                                    fontWeight: 'bold',
                                    cursor: (acceptedCopyright && acceptedTerms) ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Shop Profile */}
                {step === 3 && (
                    <div style={{
                        background: '#111',
                        borderRadius: '12px',
                        padding: '2rem',
                        border: '1px solid #333'
                    }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            marginBottom: '1.5rem'
                        }}>
                            Create Your Shop Profile
                        </h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                color: '#ccc',
                                fontWeight: '600',
                                marginBottom: '0.5rem'
                            }}>
                                Shop Name *
                            </label>
                            <input
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="e.g., Mountain Photography Studio"
                                maxLength={50}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            />
                            <div style={{
                                fontSize: '0.85rem',
                                color: '#666',
                                marginTop: '0.5rem'
                            }}>
                                {shopName.length}/50 characters
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{
                                display: 'block',
                                color: '#ccc',
                                fontWeight: '600',
                                marginBottom: '0.5rem'
                            }}>
                                Shop Bio (Optional)
                            </label>
                            <textarea
                                value={shopBio}
                                onChange={(e) => setShopBio(e.target.value)}
                                placeholder="Tell customers about your photography style and what makes your work unique..."
                                maxLength={500}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{
                                fontSize: '0.85rem',
                                color: '#666',
                                marginTop: '0.5rem'
                            }}>
                                {shopBio.length}/500 characters
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255, 68, 68, 0.1)',
                                border: '1px solid rgba(255, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#ff4444',
                                marginBottom: '1.5rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setStep(2)}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: '#333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.5 : 1
                                }}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={loading || !shopName.trim()}
                                style={{
                                    flex: 2,
                                    padding: '0.75rem',
                                    background: shopName.trim() ? '#7FFFD4' : '#444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: shopName.trim() ? '#000' : '#666',
                                    fontWeight: 'bold',
                                    cursor: (loading || !shopName.trim()) ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.5 : 1
                                }}
                            >
                                {loading ? 'Setting up...' : 'Complete Setup'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopSetup;
