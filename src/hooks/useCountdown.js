import { useState, useEffect } from 'react';

export const useCountdown = (targetDate) => {
    const calculateTimeLeft = () => {
        if (!targetDate) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isExpired: false, // Default to false if no date provided? Or true? 
                // If no date, there is no countdown, so maybe isExpired=false (not expired, just non-existent)
                // But let's stick to safe defaults.
                total: 0
            };
        }

        const now = new Date();
        let target;

        // Handle Firestore Timestamp
        if (targetDate && typeof targetDate.toDate === 'function') {
            target = targetDate.toDate();
        } else {
            target = new Date(targetDate);
        }

        // Check for invalid date
        if (isNaN(target.getTime())) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isExpired: false,
                total: 0
            };
        }

        const diff = target - now;

        if (diff <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isExpired: true,
                total: 0
            };
        }

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
            isExpired: false,
            total: diff
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        // Initial calculation
        const initial = calculateTimeLeft();
        setTimeLeft(initial);

        // If already expired or invalid, don't start interval
        if (initial.isExpired || !targetDate) return;

        const timer = setInterval(() => {
            const current = calculateTimeLeft();
            setTimeLeft(current);
            if (current.isExpired) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]); // Re-run if targetDate changes

    return timeLeft;
};
