import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFeedStore } from '@/core/store/useFeedStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { FaPalette, FaUsers, FaCheckCircle, FaRocket, FaSmile, FaBan } from 'react-icons/fa';


const OnboardingPopup = () => {
    const { currentUser } = useAuth();
    const { setAllFeedDefaults, showHumor, toggleShowHumor } = useFeedStore();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [selectedMode, setSelectedMode] = useState('social');
    const [wantsHumor, setWantsHumor] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const checkUserStatus = async () => {
            if (!currentUser) return;

            try {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    // Check if onboarding is complete
                    if (!userData.hasCompletedOnboarding) {
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                console.error("Error checking onboarding status:", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            checkUserStatus();
        }
    }, [currentUser]);

    const handleNext = () => {
        setStep(2);
    };

    const handleConfirm = async () => {
        if (!currentUser) return;
        setSubmitting(true);

        try {
            // 1. Update Local Store
            setAllFeedDefaults(selectedMode);

            // Sync Humor Setting
            if (showHumor !== wantsHumor) {
                toggleShowHumor();
            }

            // 2. Update Firestore
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                hasCompletedOnboarding: true,
                defaultExperience: selectedMode,
                showHumor: wantsHumor
            });

            setIsVisible(false);
        } catch (error) {
            console.error("Error saving preferences:", error);
            alert("Failed to save preferences. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isVisible || loading) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-card, #050808)',
                border: '1px solid rgba(110, 255, 216, 0.2)',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 0 50px rgba(0,0,0,0.5), 0 0 20px rgba(110, 255, 216, 0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Decoration */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle at center, rgba(110, 255, 216, 0.03) 0%, transparent 50%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                <div style={{ zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7FFFD4 0%, #00BFA5 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        boxShadow: '0 0 20px rgba(127, 255, 212, 0.4)'
                    }}>
                        <FaRocket size={30} color="#000" />
                    </div>

                    <h1 style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#fff',
                        marginBottom: '8px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-family-heading)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>{step === 1 ? 'Welcome to PanoSpace' : 'One Last Thing...'}</h1>

                    <p style={{
                        color: 'var(--text-secondary, #8899ac)',
                        textAlign: 'center',
                        marginBottom: '32px',
                        maxWidth: '90%',
                        lineHeight: '1.5'
                    }}>
                        {step === 1
                            ? "Choose your default experience. You can always change this later in Settings."
                            : "Do you want to see humor, memes, and comedic content in your feed?"
                        }
                    </p>

                    {/* Step 1: Mode Selection */}
                    {step === 1 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            width: '100%',
                            marginBottom: '32px'
                        }}>
                            {/* Social Option */}
                            <button
                                onClick={() => setSelectedMode('social')}
                                style={{
                                    background: selectedMode === 'social' ? 'rgba(110, 255, 216, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                    border: selectedMode === 'social' ? '2px solid #7FFFD4' : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                    transform: selectedMode === 'social' ? 'scale(1.02)' : 'scale(1)',
                                    position: 'relative'
                                }}
                            >
                                {selectedMode === 'social' && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        <FaCheckCircle color="#7FFFD4" size={20} />
                                    </div>
                                )}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(110, 255, 216, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FaUsers size={24} color="#7FFFD4" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px', fontSize: '1rem' }}>Social</div>
                                    <div style={{ color: '#8899ac', fontSize: '0.8rem' }}>Community & Connection</div>
                                </div>
                            </button>

                            {/* Art Option */}
                            <button
                                onClick={() => setSelectedMode('art')}
                                style={{
                                    background: selectedMode === 'art' ? 'rgba(255, 107, 157, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                    border: selectedMode === 'art' ? '2px solid #FF6B9D' : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                    transform: selectedMode === 'art' ? 'scale(1.02)' : 'scale(1)',
                                    position: 'relative'
                                }}
                            >
                                {selectedMode === 'art' && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        <FaCheckCircle color="#FF6B9D" size={20} />
                                    </div>
                                )}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 107, 157, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FaPalette size={24} color="#FF6B9D" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px', fontSize: '1rem' }}>Art</div>
                                    <div style={{ color: '#8899ac', fontSize: '0.8rem' }}>Clean & Creative Scale</div>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Step 2: Humor Selection */}
                    {step === 2 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            width: '100%',
                            marginBottom: '32px'
                        }}>
                            {/* Show Humor */}
                            <button
                                onClick={() => setWantsHumor(true)}
                                style={{
                                    background: wantsHumor ? 'rgba(110, 255, 216, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                    border: wantsHumor ? '2px solid #7FFFD4' : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                    transform: wantsHumor ? 'scale(1.02)' : 'scale(1)',
                                    position: 'relative'
                                }}
                            >
                                {wantsHumor && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        <FaCheckCircle color="#7FFFD4" size={20} />
                                    </div>
                                )}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(110, 255, 216, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FaSmile size={24} color="#7FFFD4" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px', fontSize: '1rem' }}>Show Humor</div>
                                    <div style={{ color: '#8899ac', fontSize: '0.8rem' }}>Memes & Jokes</div>
                                </div>
                            </button>

                            {/* Hide Humor */}
                            <button
                                onClick={() => setWantsHumor(false)}
                                style={{
                                    background: !wantsHumor ? 'rgba(255, 92, 138, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                    border: !wantsHumor ? '2px solid #FF5C8A' : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                    transform: !wantsHumor ? 'scale(1.02)' : 'scale(1)',
                                    position: 'relative'
                                }}
                            >
                                {!wantsHumor && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        <FaCheckCircle color="#FF5C8A" size={20} />
                                    </div>
                                )}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 92, 138, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FaBan size={24} color="#FF5C8A" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px', fontSize: '1rem' }}>Hide Humor</div>
                                    <div style={{ color: '#8899ac', fontSize: '0.8rem' }}>Strictly Professional</div>
                                </div>
                            </button>
                        </div>
                    )}

                    <button
                        onClick={step === 1 ? handleNext : handleConfirm}
                        disabled={submitting}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: selectedMode === 'art'
                                ? 'linear-gradient(135deg, #FF6B9D 0%, #FF8FA3 100%)'
                                : 'linear-gradient(135deg, #7FFFD4 0%, #00BFA5 100%)',
                            color: selectedMode === 'art' ? '#fff' : '#000', // White text for pink, black for mint
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: submitting ? 'wait' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            boxShadow: selectedMode === 'art'
                                ? '0 4px 20px rgba(255, 107, 157, 0.4)'
                                : '0 4px 20px rgba(127, 255, 212, 0.4)',
                            transition: 'all 0.3s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        {step === 1 ? 'Next' : (submitting ? 'Setting up space...' : 'Start Exploring')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPopup;
