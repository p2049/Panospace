import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaFire, FaTrophy, FaLeaf, FaStar, FaArrowRight, FaPlusSquare } from 'react-icons/fa';
import { EventService } from '@/services/EventService';
import { useThemeStore } from '@/core/store/useThemeStore';

const CATEGORIES = [
    { id: 'all', label: 'All Events', icon: FaStar },
    { id: 'weekly', label: 'Weekly Style', icon: FaFire },
    { id: 'daily', label: 'Daily Feature', icon: FaCalendarAlt },
    { id: 'contest', label: 'Contests', icon: FaTrophy },
    { id: 'seasonal', label: 'Seasonal', icon: FaLeaf },
    { id: 'special', label: 'Special', icon: FaStar },
];

const CurrentAppEventsBox = () => {
    const navigate = useNavigate();
    const { accentColor } = useThemeStore();
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);
            const data = await EventService.getVisibleEvents();
            setEvents(data);
            setLoading(false);
        };
        loadEvents();
    }, []);

    const filteredEvents = events.filter(e => {
        if (filter === 'all') return true;
        return e.category === filter;
    });

    if (!loading && events.length === 0) return null;

    return (
        <div style={{
            marginBottom: '1.5rem',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '16px',
            border: `1px solid ${accentColor}40`, // Slightly more visible border
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(127, 255, 212, 0.05)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            overflow: 'hidden',
            padding: '1rem'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <h2 style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-family-heading)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <FaStar size={14} /> Current App Events
                </h2>
            </div>

            {/* Category Chips */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isActive = filter === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '20px',
                                background: isActive ? accentColor : 'rgba(255,255,255,0.05)',
                                color: isActive ? '#000' : '#fff',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: isActive ? 'bold' : 'normal',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Icon size={12} /> {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Event Tiles - Horizontal Scroll */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                scrollbarWidth: 'thin',
                scrollbarColor: `${accentColor}40 transparent`
            }}>
                {filteredEvents.length === 0 ? (
                    <div style={{ padding: '1rem', color: '#888', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        No active events in this category.
                    </div>
                ) : (
                    filteredEvents.map(event => (
                        <div key={event.id} style={{
                            minWidth: '240px',
                            maxWidth: '240px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            {/* Simple Visual Banner (can be image if event has one) */}
                            <div style={{
                                height: '60px',
                                background: `linear-gradient(135deg, ${accentColor}20 0%, transparent 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <span style={{ fontSize: '2rem', opacity: 0.2 }}>
                                    {event.category === 'daily' ? <FaCalendarAlt /> : <FaTrophy />}
                                </span>
                            </div>

                            <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <div style={{
                                    textTransform: 'uppercase',
                                    fontSize: '0.65rem',
                                    color: accentColor,
                                    fontWeight: 'bold',
                                    marginBottom: '0.3rem'
                                }}>
                                    {event.category}
                                </div>
                                <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#fff' }}>
                                    {event.name}
                                </h3>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    {event.tag && (
                                        <div style={{
                                            color: '#aaa',
                                            fontSize: '0.8rem',
                                            fontFamily: 'monospace'
                                        }}>
                                            #{event.tag}
                                        </div>
                                    )}
                                    {event.startDate && (
                                        <div style={{ fontSize: '0.7rem', color: '#888' }}>
                                            {/* Simple date formatter */}
                                            {event.startDate.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            {event.endDate && ` - ${event.endDate.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                                        </div>
                                    )}
                                </div>
                                <p style={{
                                    margin: '0 0 0.8rem 0',
                                    fontSize: '0.75rem',
                                    color: '#ccc',
                                    lineHeight: '1.4',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {event.description}
                                </p>

                                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => navigate(`/events/${event.id}`)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        View Feed
                                    </button>

                                    {/* Show Create Post if active and has tag */}
                                    {event.active && event.tag && (
                                        <button
                                            onClick={() => navigate(`/create-post?tag=${event.tag}`)}
                                            style={{
                                                padding: '0.5rem',
                                                background: accentColor,
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: '#000',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Create Post for Event"
                                        >
                                            <FaPlusSquare />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CurrentAppEventsBox;
