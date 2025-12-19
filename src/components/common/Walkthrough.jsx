import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import '@/styles/walkthrough.css';

/**
 * Reusable Walkthrough Component
 * @param {Array} steps - [{ title, description, targetSelector }]
 * @param {string} onboardingKey - Key for Firestore/localStorage persistence
 * @param {Function} onClose - Callback when closed
 * @param {boolean} forceShow - If true, ignores persistence
 */
const Walkthrough = ({ steps, onboardingKey, onClose, forceShow = false }) => {
    const { currentUser } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [spotlightRect, setSpotlightRect] = useState(null);
    const [loading, setLoading] = useState(!forceShow);

    const checkPersistence = useCallback(async () => {
        if (forceShow) {
            setIsVisible(true);
            setLoading(false);
            return;
        }

        // 1. Check localStorage first (fast)
        const localFlag = localStorage.getItem(`onboarding_${onboardingKey}`);
        if (localFlag === 'true') {
            setLoading(false);
            return;
        }

        // 2. Check Firestore if logged in
        if (currentUser) {
            try {
                const settingsRef = doc(db, 'userSettings', currentUser.uid);
                const settingsSnap = await getDoc(settingsRef);

                if (settingsSnap.exists()) {
                    const data = settingsSnap.data();
                    if (data.onboarding?.[onboardingKey]) {
                        setLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking walkthrough persistence:', error);
            }
        }

        setIsVisible(true);
        setLoading(false);
    }, [currentUser, onboardingKey, forceShow]);

    useEffect(() => {
        checkPersistence();
    }, [checkPersistence]);

    const updateSpotlight = useCallback(() => {
        const step = steps[currentStepIndex];
        if (step?.targetSelector) {
            const el = document.querySelector(step.targetSelector);
            if (el) {
                const rect = el.getBoundingClientRect();
                setSpotlightRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
                return;
            }
        }
        setSpotlightRect(null);
    }, [steps, currentStepIndex]);

    useEffect(() => {
        if (isVisible) {
            updateSpotlight();
            window.addEventListener('resize', updateSpotlight);
            // Lock scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            window.removeEventListener('resize', updateSpotlight);
            document.body.style.overflow = '';
        };
    }, [isVisible, updateSpotlight]);

    const handleComplete = async (dontShowAgain = false) => {
        setIsVisible(false);
        if (onClose) onClose();

        if (dontShowAgain) {
            localStorage.setItem(`onboarding_${onboardingKey}`, 'true');
            if (currentUser) {
                try {
                    const settingsRef = doc(db, 'userSettings', currentUser.uid);
                    await setDoc(settingsRef, {
                        onboarding: {
                            [onboardingKey]: true
                        }
                    }, { merge: true });
                } catch (error) {
                    console.error('Error saving walkthrough preference:', error);
                }
            }
        }
    };

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            handleComplete(true);
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    if (loading || !isVisible) return null;

    const currentStep = steps[currentStepIndex];

    return (
        <AnimatePresence>
            <div className="walkthrough-overlay">
                {spotlightRect && (
                    <motion.div
                        className="walkthrough-spotlight"
                        initial={false}
                        animate={{
                            top: spotlightRect.top - 4,
                            left: spotlightRect.left - 4,
                            width: spotlightRect.width + 8,
                            height: spotlightRect.height + 8
                        }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    />
                )}

                <motion.div
                    className="walkthrough-card"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    style={spotlightRect ? {
                        position: 'fixed',
                        top: spotlightRect.top > window.innerHeight / 2 ? 'auto' : spotlightRect.bottom + 20,
                        bottom: spotlightRect.top > window.innerHeight / 2 ? (window.innerHeight - spotlightRect.top) + 20 : 'auto',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    } : {}}
                >
                    <button className="walkthrough-close" onClick={() => handleComplete(false)}>
                        <FaTimes />
                    </button>

                    <div className="walkthrough-step-indicator">
                        {steps.map((_, i) => (
                            <div key={i} className={`walkthrough-dot ${i === currentStepIndex ? 'active' : ''}`} />
                        ))}
                    </div>

                    <h3 className="walkthrough-title">{currentStep.title}</h3>
                    <p className="walkthrough-description">{currentStep.description}</p>

                    <div className="walkthrough-footer">
                        <button className="walkthrough-skip" onClick={() => handleComplete(true)}>
                            Don't show again
                        </button>

                        <div className="walkthrough-btns-right">
                            {currentStepIndex > 0 && (
                                <button className="walkthrough-btn" onClick={prevStep}>
                                    Back
                                </button>
                            )}
                            <button className="walkthrough-btn primary" onClick={nextStep}>
                                {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default Walkthrough;
