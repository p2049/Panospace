import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvent, useEventSubmissions } from '@/hooks/useEventSystem';
import EventSubmissionModal from '@/components/EventSubmissionModal';
import { useCountdown } from '@/hooks/useCountdown';
import { FaClock, FaTag, FaUser, FaCamera, FaLock } from 'react-icons/fa';
import SmartImage from '@/components/SmartImage';

const EventPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { event, loading: eventLoading, error } = useEvent(eventId);

    // We pass event data to the hook to handle timed drop logic
    const { submissions, loading: subsLoading, isRevealed } = useEventSubmissions(
        eventId,
        event?.isTimedDrop,
        event?.dropTime
    );

    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Countdown timer for timed drops
    const { hours, minutes, seconds, isExpired } = useCountdown(
        (event?.isTimedDrop && event?.dropTime && !isRevealed) ? event.dropTime : null
    );

    const timeLeft = isExpired ? 'Live Now' : `${hours}h ${minutes}m ${seconds}s`;

    if (eventLoading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading event...</div>;
    if (error) return <div style={{ padding: '2rem', color: '#ff4444' }}>Error: {error}</div>;
    if (!event) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Hero Section */}
            <div style={{
                padding: '3rem 2rem',
                background: 'linear-gradient(to bottom, #1a1a1a, #000)',
                borderBottom: '1px solid #333'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: event.isExpired ? '#ff4444' : (event.isContest ? '#FFD700' : '#7FFFD4'),
                        color: event.isExpired ? '#fff' : '#000',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem'
                    }}>
                        {event.isExpired ? 'EVENT CLOSED' : (event.isContest ? 'CONTEST' : 'EVENT')}
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{event.title}</h1>
                    <p style={{ fontSize: '1.1rem', color: '#ccc', maxWidth: '600px', lineHeight: '1.6' }}>{event.description}</p>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888' }}>
                            <FaUser /> Created by {event.creatorName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7FFFD4', fontFamily: 'var(--font-family-tag)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            <FaTag /> {event.autoTag}
                        </div>
                        {event.isTimedDrop && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isRevealed ? '#7FFFD4' : '#ff4444' }}>
                                <FaClock /> {isRevealed ? 'Drop Live' : `Drops in: ${timeLeft}`}
                            </div>
                        )}
                    </div>

                    {!event.isExpired ? (
                        <button
                            onClick={() => setShowSubmitModal(true)}
                            style={{
                                marginTop: '2rem',
                                padding: '0.8rem 2rem',
                                background: '#fff',
                                color: '#000',
                                border: 'none',
                                borderRadius: '30px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaCamera /> Submit Photo
                        </button>
                    ) : (
                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', borderRadius: '8px', color: '#ff4444' }}>
                            This event has ended. Submissions are closed.
                        </div>
                    )}
                </div>
            </div>

            {/* Submissions Grid */}
            <div className="container-md">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                    Submissions ({submissions.length})
                </h2>

                {event.isTimedDrop && !isRevealed ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        background: '#111',
                        borderRadius: '12px',
                        border: '1px dashed #333'
                    }}>
                        <FaLock style={{ fontSize: '3rem', color: '#333', marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Studio Locked</h3>
                        <p style={{ color: '#888' }}>Submissions will be revealed when the drop goes live.</p>
                        <div style={{
                            marginTop: '1.5rem',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#7FFFD4',
                            fontFamily: 'monospace'
                        }}>
                            {timeLeft}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                        {submissions.map(sub => (
                            <div key={sub.id} style={{ aspectRatio: '1', background: '#111', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                                <SmartImage
                                    src={sub.postImage}
                                    alt="Submission"
                                    onClick={() => navigate(`/post/${sub.postId}`)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    padding: '0.5rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                    fontSize: '0.8rem'
                                }}>
                                    by {sub.creatorName}
                                </div>
                            </div>
                        ))}
                        {submissions.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#666' }}>
                                No submissions yet. Be the first!
                            </div>
                        )}
                    </div>
                )}
            </div>

            <EventSubmissionModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                eventId={eventId}
                eventTitle={event.title}
                isExpired={event.isExpired}
            />
        </div>
    );
};

export default EventPage;
