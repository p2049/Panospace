import React, { useState, useEffect, useRef } from 'react';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import useOnlineStatus from '@/hooks/useOnlineStatus';
import { OfflineQueue } from '@/services/OfflineQueue';

/**
 * OfflineBanner - Minimal banner shown when connection is lost
 * Automatically processes queued actions when connection is restored
 */
const OfflineBanner = () => {
    const isOnline = useOnlineStatus();
    const [queueLength, setQueueLength] = useState(0);
    const [showReconnected, setShowReconnected] = useState(false);
    const prevOnlineRef = useRef(isOnline); // Track previous state
    const hasShownInitialRef = useRef(false); // Track if we've shown initial state

    useEffect(() => {
        // Update queue length
        const updateQueueLength = () => {
            setQueueLength(OfflineQueue.getQueueLength());
        };

        updateQueueLength();
        const interval = setInterval(updateQueueLength, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Skip showing reconnected message on initial mount
        if (!hasShownInitialRef.current) {
            hasShownInitialRef.current = true;
            prevOnlineRef.current = isOnline;
            return;
        }

        // Only show "reconnected" if we were previously offline and are now online
        const wasOffline = prevOnlineRef.current === false;
        const isNowOnline = isOnline === true;

        if (wasOffline && isNowOnline) {
            // Connection restored - process queue
            const processOfflineQueue = async () => {
                const queueLen = OfflineQueue.getQueueLength();
                if (queueLen > 0) {
                    console.log(`🔄 Processing ${queueLen} queued actions...`);
                    await OfflineQueue.processQueue();
                    setQueueLength(0);
                }
            };

            processOfflineQueue();

            // Show "reconnected" message briefly
            setShowReconnected(true);
            const timer = setTimeout(() => setShowReconnected(false), 3000);

            prevOnlineRef.current = isOnline;
            return () => clearTimeout(timer);
        }

        // Update previous state
        prevOnlineRef.current = isOnline;
    }, [isOnline]);

    // Don't show anything if online and no reconnection message
    if (isOnline && !showReconnected) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9998,
            background: isOnline ? 'rgba(127, 255, 212, 0.95)' : 'rgba(255, 107, 107, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: isOnline ? '#000' : '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            animation: 'slideDown 0.3s ease-out',
            paddingTop: 'max(0.75rem, env(safe-area-inset-top))'
        }}>
            {isOnline ? (
                <>
                    <FaWifi size={16} />
                    <span>Connection restored</span>
                    {queueLength > 0 && (
                        <span style={{ opacity: 0.8, fontSize: '0.85rem' }}>
                            • Syncing {queueLength} action{queueLength !== 1 ? 's' : ''}...
                        </span>
                    )}
                </>
            ) : (
                <>
                    <FaExclamationTriangle size={16} />
                    <span>No connection. Some features may not work.</span>
                    {queueLength > 0 && (
                        <span style={{ opacity: 0.8, fontSize: '0.85rem' }}>
                            • {queueLength} action{queueLength !== 1 ? 's' : ''} queued
                        </span>
                    )}
                </>
            )}

            <style>{`
                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default OfflineBanner;
