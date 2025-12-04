import { useState, useEffect } from 'react';

/**
 * useOnlineStatus - Hook to detect online/offline status
 * Returns current online status and provides event listeners
 */
export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            console.log('🟢 Connection restored');
            setIsOnline(true);
        };

        const handleOffline = () => {
            console.log('🔴 Connection lost');
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check connection on mount
        setIsOnline(navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};

export default useOnlineStatus;
