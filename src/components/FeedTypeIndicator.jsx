import React, { useState, useEffect } from 'react';
import { getFeedLabel } from '@/config/feedConfig';

/**
 * FeedTypeIndicator - Shows which feed is active when switching
 * Displays for 1.5 seconds then fades out
 */
const FeedTypeIndicator = ({ feedType, show, switchCount }) => {
    const [visible, setVisible] = useState(false);

    // Use switchCount to trigger on every switch, not just when show changes
    useEffect(() => {
        if (show && switchCount > 0) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [switchCount]); // Trigger on switchCount change

    if (!visible) return null;

    return (
        <>
            <style>
                {`
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    }
                `}
            </style>
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0, 0, 0, 0.95)',
                padding: '2rem 3rem',
                borderRadius: '16px',
                border: '2px solid #7FFFD4',
                boxShadow: '0 0 30px rgba(127, 255, 212, 0.3)',
                zIndex: 9999,
                animation: 'fadeInOut 1.5s ease-in-out',
                backdropFilter: 'blur(10px)'
            }}>
                <h2 style={{
                    color: '#7FFFD4',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    margin: 0,
                    textAlign: 'center',
                    textShadow: '0 0 10px rgba(127, 255, 212, 0.5)'
                }}>
                    {feedType === 'art' ? 'Art Feed' : 'Social Feed'}
                </h2>
            </div>
        </>
    );
};

export default FeedTypeIndicator;
