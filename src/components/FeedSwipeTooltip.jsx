/**
 * Feed Swipe Tooltip - First-time tooltip for feed switching
 * Shows once to teach users about swipe gesture
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedStore } from '../store/useFeedStore';

const FeedSwipeTooltip = () => {
    const { hasSeenSwipeTooltip, markTooltipSeen } = useFeedStore();
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Show tooltip after 2 seconds if user hasn't seen it
        if (!hasSeenSwipeTooltip) {
            const timer = setTimeout(() => {
                setShow(true);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [hasSeenSwipeTooltip]);

    useEffect(() => {
        // Auto-hide after 6 seconds
        if (show) {
            const timer = setTimeout(() => {
                setShow(false);
                markTooltipSeen();
            }, 6000);

            return () => clearTimeout(timer);
        }
    }, [show, markTooltipSeen]);

    if (!show || hasSeenSwipeTooltip) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{
                    position: 'fixed',
                    top: 'max(4.5rem, calc(env(safe-area-inset-top) + 3.5rem))',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    pointerEvents: 'none'
                }}
            >
                <div
                    style={{
                        background: 'linear-gradient(135deg, rgba(127, 255, 212, 0.95), rgba(0, 206, 209, 0.95))',
                        color: '#000',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        fontFamily: "'Rajdhani', sans-serif",
                        letterSpacing: '0.03em',
                        boxShadow: '0 4px 20px rgba(127, 255, 212, 0.4), 0 0 40px rgba(127, 255, 212, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>👈</span>
                    <span>Swipe left to view your Social Feed</span>
                    <span style={{ fontSize: '1.2rem' }}>👉</span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FeedSwipeTooltip;
