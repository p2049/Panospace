import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents, useFollowingEvents } from '@/hooks/useEvents';
import { EventService } from '@/services/EventService';

import { FaPlus, FaChevronLeft, FaChevronRight, FaCalendar, FaUsers, FaSearch, FaList, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import PlanetUserIcon from '@/components/PlanetUserIcon';
import { formatDateForInput } from '@/core/utils/dates';
import { generateCalendarDays } from '@/core/utils/dates';

const Calendar = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // 'calendar' or 'events'
    const [pageTab, setPageTab] = useState('calendar');

    // Calendar Grid Data
    const monthStart = useMemo(() => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        date.setHours(0, 0, 0, 0);
        return date;
    }, [currentDate]);

    const monthEnd = useMemo(() => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        date.setHours(23, 59, 59, 999);
        return date;
    }, [currentDate]);

    const { events: gridEvents, loading: loadingGrid } = useEvents(monthStart, monthEnd);
    const calendarDays = useMemo(() => generateCalendarDays(currentDate), [currentDate]);

    // Events List Data
    const [listEvents, setListEvents] = useState([]);
    const [loadingList, setLoadingList] = useState(false);

    useEffect(() => {
        if (pageTab === 'events') {
            const fetchList = async () => {
                setLoadingList(true);
                try {
                    const events = await EventService.getVisibleEvents();
                    // Sort by upcoming Date
                    events.sort((a, b) => {
                        const dateA = a.eventDate ? new Date(a.eventDate) : new Date(0);
                        const dateB = b.eventDate ? new Date(b.eventDate) : new Date(0);
                        return dateA - dateB;
                    });
                    setListEvents(events);
                } catch (err) {
                    console.error("Error fetching event list:", err);
                } finally {
                    setLoadingList(false);
                }
            };
            fetchList();
        }
    }, [pageTab]);

    const getEventsForDay = (date) => {
        return gridEvents.filter(event => {
            let raw = event.dateUTC || event.date || event.eventDate;
            let d = null;
            if (raw && raw.toDate) d = raw.toDate();
            else if (raw) d = new Date(raw);
            if (!d) return false;
            return d.getFullYear() === date.getFullYear() &&
                d.getMonth() === date.getMonth() &&
                d.getDate() === date.getDate();
        });
    };

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const handleToday = () => setCurrentDate(new Date());

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem', position: 'relative', overflowX: 'hidden' }}>
            {/* Stars Background */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                {[...Array(30)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: Math.random() * 2 + 'px',
                        height: Math.random() * 2 + 'px',
                        background: '#7FFFD4',
                        opacity: Math.random() * 0.5 + 0.2,
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                        borderRadius: '50%'
                    }} />
                ))}
            </div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{
                    padding: '1rem',
                    paddingTop: 'max(1rem, env(safe-area-inset-top))',
                    borderBottom: '1px solid #333',
                    background: 'rgba(0,0,0,0.9)',
                    backdropFilter: 'blur(10px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                    {/* Top Row: Brand & Create */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PlanetUserIcon size={28} color="#7FFFD4" icon="planet" />
                            <span style={{
                                fontFamily: '"Rajdhani", sans-serif',
                                fontWeight: '800',
                                fontSize: '1.2rem',
                                letterSpacing: '1px'
                            }}>
                                PANOSPACE
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                                onClick={() => navigate('/event/create')}
                                style={{
                                    background: '#7FFFD4',
                                    color: '#000',
                                    border: 'none',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <FaPlus /> Create
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={() => setPageTab('calendar')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: pageTab === 'calendar' ? '2px solid #7FFFD4' : '2px solid transparent',
                                color: pageTab === 'calendar' ? '#7FFFD4' : '#888',
                                padding: '0.5rem 0',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                letterSpacing: '1px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaCalendar /> CALENDAR
                        </button>
                        <button
                            onClick={() => setPageTab('events')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: pageTab === 'events' ? '2px solid #7FFFD4' : '2px solid transparent',
                                color: pageTab === 'events' ? '#7FFFD4' : '#888',
                                padding: '0.5rem 0',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                letterSpacing: '1px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaList /> EVENTS
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: '1rem' }}>

                    {/* CALENDAR VIEW */}
                    {pageTab === 'calendar' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            {/* Month Navigation */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem',
                                background: '#111',
                                padding: '0.5rem',
                                borderRadius: '12px',
                                border: '1px solid #222'
                            }}>
                                <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}><FaChevronLeft /></button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </h2>
                                    <button onClick={handleToday} style={{ background: 'rgba(127, 255, 212, 0.1)', border: 'none', borderRadius: '4px', color: '#7FFFD4', fontSize: '0.7rem', padding: '2px 8px', cursor: 'pointer', fontWeight: 'bold' }}>TODAY</button>
                                </div>
                                <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}><FaChevronRight /></button>
                            </div>

                            {/* Grid Headers */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem', textAlign: 'center' }}>
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                    <div key={d} style={{ color: '#666', fontSize: '0.75rem', fontWeight: 'bold' }}>{d}</div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                {calendarDays.map((day, i) => {
                                    const dayEvents = getEventsForDay(day.date);
                                    const isToday = day.date.toDateString() === new Date().toDateString();
                                    const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedDate(day.date)}
                                            style={{
                                                aspectRatio: '1',
                                                background: isSelected ? 'rgba(127, 255, 212, 0.2)' : (day.isCurrentMonth ? '#1a1a1a' : '#0a0a0a'),
                                                border: isToday ? '1px solid #7FFFD4' : (isSelected ? '1px solid rgba(127, 255, 212, 0.5)' : '1px solid #222'),
                                                borderRadius: '8px',
                                                padding: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                opacity: day.isCurrentMonth ? 1 : 0.4
                                            }}
                                        >
                                            <span style={{ fontSize: '0.8rem', color: isToday ? '#7FFFD4' : '#888', fontWeight: isToday ? 'bold' : 'normal' }}>{day.date.getDate()}</span>
                                            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', content: 'center', justifyContent: 'center', gap: '2px', alignContent: 'center' }}>
                                                {dayEvents.slice(0, 4).map((evt, idx) => (
                                                    <div key={idx} style={{ width: '4px', height: '4px', borderRadius: '50%', background: evt.color || '#7FFFD4' }} />
                                                ))}
                                                {dayEvents.length > 4 && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#666' }} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Selected Date Detail */}
                            {selectedDate && (
                                <div style={{ marginTop: '2rem', padding: '1rem', background: '#111', borderRadius: '12px', border: '1px solid #222', animation: 'fadeIn 0.2s ease' }}>
                                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#7FFFD4' }}>
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h3>

                                    {getEventsForDay(selectedDate).length === 0 ? (
                                        <div style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>No events scheduled</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {getEventsForDay(selectedDate).map(evt => (
                                                <div key={evt.id} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                                                    <div style={{ background: 'rgba(127, 255, 212, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#7FFFD4' }}>
                                                        <FaClock />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{evt.title || evt.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                                            {new Date(evt.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        {evt.location && <div style={{ fontSize: '0.8rem', color: '#666' }}>📍 {evt.location}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* EVENTS LIST VIEW */}
                    {pageTab === 'events' && (
                        <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {loadingList ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading upcoming events...</div>
                            ) : listEvents.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#666', border: '1px dashed #333', borderRadius: '12px' }}>
                                    No upcoming events found.
                                </div>
                            ) : (
                                listEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => navigate(`/event/${event.id}`)}
                                        style={{
                                            background: '#111',
                                            border: '1px solid #222',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            gap: '1rem',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            minWidth: '50px'
                                        }}>
                                            <span style={{ fontSize: '0.7rem', color: '#7FFFD4', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                {new Date(event.eventDate).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                                                {new Date(event.eventDate).getDate()}
                                            </span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1rem', color: '#fff' }}>{event.name || event.title}</h3>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#888' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaClock size={10} /> {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {event.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaMapMarkerAlt size={10} /> {event.location}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Calendar;
