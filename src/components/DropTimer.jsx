import React, { useEffect, useState } from 'react';
import { getEventStatus, shouldShowSubmissions, canSubmitToEvent } from '../utils/eventValidation';
import { FaClock, FaCalendar, FaUsers, FaTrophy } from 'react-icons/fa';

/**
 * DropTimer Component
 * Shows countdown to drop reveal time
 */
const DropTimer = ({ event }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const dropTime = event.dropTime ? new Date(event.dropTime) : new Date(event.startTime);
            const diff = dropTime - now;

            if (diff <= 0) {
                setTimeLeft('DROP REVEALED!');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [event]);

    if (!event.isTimedDrop && event.eventType !== 'timed-drop') {
        return null;
    }

    const showSubmissions = shouldShowSubmissions(event);

    return (
        <div style={{
            background: showSubmissions ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255, 107, 53, 0.1)',
            border: `1px solid ${showSubmissions ? '#7FFFD4' : '#FF6B35'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FaClock size={20} color={showSubmissions ? '#7FFFD4' : '#FF6B35'} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: showSubmissions ? '#7FFFD4' : '#FF6B35' }}>
                    {showSubmissions ? 'TIMED DROP REVEALED' : 'TIMED DROP'}
                </h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>
                {timeLeft}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#888' }}>
                {showSubmissions ? 'All submissions are now visible' : 'Submissions will reveal at drop time'}
            </div>
        </div>
    );
};

/**
 * EventStatus Component
 * Shows event status and timing
 */
export const EventStatus = ({ event }) => {
    const status = getEventStatus(event);
    const { canSubmit, reason } = canSubmitToEvent(event);

    const statusColors = {
        upcoming: '#FFD700',
        open: '#7FFFD4',
        closed: '#888'
    };

    const statusLabels = {
        upcoming: 'Upcoming',
        open: 'Open for Submissions',
        closed: 'Closed'
    };

    return (
        <div style={{
            background: '#111',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                    background: statusColors[status],
                    color: '#000',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                }}>
                    {statusLabels[status]}
                </div>
                {!canSubmit && (
                    <div style={{ fontSize: '0.9rem', color: '#888' }}>
                        {reason}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                    <div style={{ color: '#888', marginBottom: '0.25rem' }}>Starts</div>
                    <div style={{ color: '#fff' }}>{new Date(event.startTime).toLocaleString()}</div>
                </div>
                <div>
                    <div style={{ color: '#888', marginBottom: '0.25rem' }}>Ends</div>
                    <div style={{ color: '#fff' }}>{new Date(event.expiresAt).toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
};

export default DropTimer;
