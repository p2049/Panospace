import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFeedStore } from '@/core/store/useFeedStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { FaRocket, FaArrowRight, FaTimes, FaPalette, FaUsers, FaCheckCircle, FaBars } from 'react-icons/fa';
// Fix: Import from parent directory
import { PlanetIcon } from '../SpaceIcons';
import PlanetUserIcon from '../PlanetUserIcon';

/**
 * OnboardingPopup
 * 
 * Two-phase onboarding for first-time users:
 * 1. Mode Selection (Art vs Social)
 * 2. Quick UI Tour with active UI element replication
 */
const OnboardingPopup = () => {
    const { currentUser } = useAuth();
    const { setAllFeedDefaults } = useFeedStore();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState('mode'); // 'mode' or 'tour'
    const [selectedMode, setSelectedMode] = useState('social');
    const [tourStep, setTourStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Tour steps
    const tourSteps = [
        {
            id: 'welcome',
            title: 'Quick Tour',
            description: 'Let\'s learn the main controls. You can skip anytime.',
        },
        {
            id: 'profile',
            title: 'Post Info & Profile',
            description: 'Tap the username to open the Post Info Panel. Tap the profile picture to visit their Profile.',
        },
        {
            id: 'planet',
            title: 'The Planet',
            description: 'Tap to return Home. If already home, it switches your orbit view.',
        },
        {
            id: 'menu',
            title: 'Main Menu',
            description: 'Tap the top-right button to access Search, Create, Account, Settings, and more.',
        }
    ];

    useEffect(() => {
        const checkUserStatus = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    if (!userData.hasCompletedOnboarding) {
                        setIsVisible(true);
                    }
                } else {
                    setIsVisible(true);
                }
            } catch (error) {
                console.error("Error checking onboarding status:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUserStatus();
    }, [currentUser]);

    const handleModeNext = () => {
        setAllFeedDefaults(selectedMode);
        setPhase('tour');
    };

    const handleTourNext = () => {
        if (tourStep < tourSteps.length - 1) {
            setTourStep(tourStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkipTour = () => {
        handleComplete();
    };

    const handleComplete = async () => {
        if (!currentUser) {
            setIsVisible(false);
            return;
        }
        setSubmitting(true);

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                hasCompletedOnboarding: true,
                defaultExperience: selectedMode,
                showHumor: true
            });
            setIsVisible(false);
        } catch (error) {
            console.error("Error saving preferences:", error);
            setIsVisible(false);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isVisible || loading) return null;

    // Phase 1: Mode Selection
    if (phase === 'mode') {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(0, 0, 0, 0.9)',
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
                        }}>Welcome to PanoSpace</h1>

                        <p style={{
                            color: 'var(--text-secondary, #8899ac)',
                            textAlign: 'center',
                            marginBottom: '32px',
                            maxWidth: '90%',
                            lineHeight: '1.5'
                        }}>
                            Choose your default experience. You can always change this later in Settings.
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            width: '100%',
                            marginBottom: '32px'
                        }}>
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
                                    <div style={{ color: '#8899ac', fontSize: '0.8rem' }}>Clean & Creative Focus</div>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={handleModeNext}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                border: 'none',
                                background: selectedMode === 'art'
                                    ? 'linear-gradient(135deg, #FF6B9D 0%, #FF8FA3 100%)'
                                    : 'linear-gradient(135deg, #7FFFD4 0%, #00BFA5 100%)',
                                color: selectedMode === 'art' ? '#fff' : '#000',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: selectedMode === 'art'
                                    ? '0 4px 20px rgba(255, 107, 157, 0.4)'
                                    : '0 4px 20px rgba(127, 255, 212, 0.4)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            Next <FaArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Phase 2: UI Tour
    const currentStep = tourSteps[tourStep];

    // Render the actual icon being displayed
    const renderTourIcon = () => {
        switch (currentStep.id) {
            case 'welcome':
                return (
                    <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7FFFD4 0%, #00BFA5 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(127, 255, 212, 0.4)'
                    }}>
                        <FaRocket size={32} color="#000" />
                    </div>
                );
            case 'profile':
                return (
                    // Replicated Author Chip
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 0 30px rgba(127, 255, 212, 0.3)'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <PlanetUserIcon size={28} color="#7FFFD4" />
                        </div>
                        <span style={{
                            color: '#7FFFD4',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            fontFamily: '"Rajdhani", monospace',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            @USERNAME
                        </span>
                    </div>
                );
            case 'planet':
                return (
                    // Replicated Planet Icon
                    <div style={{
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        filter: 'drop-shadow(0 0 10px rgba(127, 255, 212, 0.6))',
                        boxShadow: '0 0 30px rgba(127, 255, 212, 0.3)',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.3)'
                    }}>
                        <PlanetIcon size={40} color="#7FFFD4" />
                    </div>
                );
            case 'menu':
                return (
                    // Replicated Menu Button (Dot Style from MobileNavigation)
                    <div style={{
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {/* This replicates the visuals of the top-right menu trigger */}
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 20px rgba(127, 255, 212, 0.4)'
                            }}
                        >
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#7FFFD4',
                                boxShadow: '0 0 6px #7FFFD4',
                                opacity: 1
                            }} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(8px)',
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
                maxWidth: '420px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 0 50px rgba(0,0,0,0.5), 0 0 20px rgba(110, 255, 216, 0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <button
                    onClick={handleSkipTour}
                    disabled={submitting}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem'
                    }}
                >
                    Skip <FaTimes size={12} />
                </button>

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
                        marginBottom: '24px',
                        minHeight: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {renderTourIcon()}
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '20px'
                    }}>
                        {tourSteps.map((_, index) => (
                            <div
                                key={index}
                                style={{
                                    width: tourStep === index ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: tourStep >= index ? '#7FFFD4' : 'rgba(255,255,255,0.2)',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </div>

                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#fff',
                        marginBottom: '12px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-family-heading)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {currentStep.title}
                    </h1>

                    <p style={{
                        color: 'var(--text-secondary, #8899ac)',
                        textAlign: 'center',
                        marginBottom: '32px',
                        lineHeight: '1.6',
                        fontSize: '1rem',
                        maxWidth: '340px'
                    }}>
                        {currentStep.description}
                    </p>

                    <button
                        onClick={handleTourNext}
                        disabled={submitting}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #7FFFD4 0%, #00BFA5 100%)',
                            color: '#000',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: submitting ? 'wait' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            boxShadow: '0 4px 20px rgba(127, 255, 212, 0.4)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {tourStep < tourSteps.length - 1 ? (
                            <>Next <FaArrowRight size={14} /></>
                        ) : (
                            submitting ? 'Setting up...' : 'Start Exploring'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPopup;
