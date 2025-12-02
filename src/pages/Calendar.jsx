import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents, useFollowingEvents } from '../hooks/useEvents';
import CreateEventModal from '../components/CreateEventModal';
import { FaPlus, FaChevronLeft, FaChevronRight, FaCalendar, FaUsers } from 'react-icons/fa';

const Calendar = () => {
    const { currentUser } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'following'

    // Calculate month boundaries
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

    // Fetch events
    const { events: allEvents, loading: loadingAll, refetch: refetchAll } = useEvents(monthStart, monthEnd);

    // For following view - would need to get following list from user profile
    // For now, just show empty array
    const { events: followingEvents, loading: loadingFollowing } = useFollowingEvents([], monthStart, monthEnd);

    const events = viewMode === 'all' ? allEvents : followingEvents;
    const loading = viewMode === 'all' ? loadingAll : loadingFollowing;

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const days = [];
        const firstDayOfMonth = monthStart.getDay();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        // Previous month days
        const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push({
                date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i),
                isCurrentMonth: false
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
                isCurrentMonth: true
            });
        }

        // Next month days to fill grid
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
                isCurrentMonth: false
            });
        }

        return days;
    }, [currentDate]);

    // Get events for a specific day
    const getEventsForDay = (date) => {
        return events.filter(event => {
            const eventDate = new Date(event.eventDate);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDayClick = (date) => {
        setSelectedDate(date);
    };

    const handleEventCreated = () => {
        refetchAll();
    };

    const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid #333',
                position: 'sticky',
                top: 0,
                background: '#000',
                zIndex: 100
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                            <FaCalendar style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Community Calendar
                        </h1>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                background: '#7FFFD4',
                                color: '#000',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaPlus /> Create Event
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setViewMode('all')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: viewMode === 'all' ? 'rgba(127, 255, 212, 0.2)' : 'transparent',
                                border: viewMode === 'all' ? '1px solid #7FFFD4' : '1px solid #333',
                                borderRadius: '20px',
                                color: viewMode === 'all' ? '#7FFFD4' : '#888',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            <FaCalendar style={{ marginRight: '0.5rem' }} />
                            All Events
                        </button>
                        <button
                            onClick={() => setViewMode('following')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: viewMode === 'following' ? 'rgba(127, 255, 212, 0.2)' : 'transparent',
                                border: viewMode === 'following' ? '1px solid #7FFFD4' : '1px solid #333',
                                borderRadius: '20px',
                                color: viewMode === 'following' ? '#7FFFD4' : '#888',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            <FaUsers style={{ marginRight: '0.5rem' }} />
                            Following
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '2fr 1fr' : '1fr', gap: '2rem' }}>
                    {/* Calendar Grid */}
                    <div>
                        {/* Month Navigation */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <button
                                onClick={handlePrevMonth}
                                style={{
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1rem',
                                    color: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaChevronLeft />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h2>
                                <button
                                    onClick={handleToday}
                                    style={{
                                        background: '#222',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        padding: '0.5rem 1rem',
                                        color: '#7FFFD4',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Today
                                </button>
                            </div>

                            <button
                                onClick={handleNextMonth}
                                style={{
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1rem',
                                    color: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaChevronRight />
                            </button>
                        </div>

                        {/* Weekday Headers */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                        }}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} style={{
                                    textAlign: 'center',
                                    color: '#888',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    padding: '0.5rem'
                                }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '0.5rem'
                        }}>
                            {calendarDays.map((day, index) => {
                                const dayEvents = getEventsForDay(day.date);
                                const isToday = day.date.toDateString() === new Date().toDateString();
                                const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleDayClick(day.date)}
                                        style={{
                                            background: isSelected ? 'rgba(127, 255, 212, 0.2)' : '#111',
                                            border: isToday ? '2px solid #7FFFD4' : '1px solid #333',
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            minHeight: '100px',
                                            cursor: 'pointer',
                                            opacity: day.isCurrentMonth ? 1 : 0.5,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = '#1a1a1a';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = '#111';
                                            }
                                        }}
                                    >
                                        <div style={{
                                            fontWeight: 'bold',
                                            marginBottom: '0.5rem',
                                            color: isToday ? '#7FFFD4' : '#fff'
                                        }}>
                                            {day.date.getDate()}
                                        </div>
                                        {dayEvents.length > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#7FFFD4' }}>
                                                {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Day Events */}
                    {selectedDate && (
                        <div>
                            <div style={{
                                background: '#111',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                position: 'sticky',
                                top: '100px'
                            }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                                    {selectedDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </h3>

                                {selectedDayEvents.length === 0 ? (
                                    <div style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>
                                        No events on this day
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {selectedDayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                style={{
                                                    background: '#222',
                                                    border: '1px solid #333',
                                                    borderRadius: '8px',
                                                    padding: '1rem'
                                                }}
                                            >
                                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                                    {event.title}
                                                </div>
                                                {event.description && (
                                                    <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '0.5rem' }}>
                                                        {event.description}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '0.8rem', color: '#7FFFD4' }}>
                                                    {new Date(event.eventDate).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                {event.eventType && (
                                                    <div style={{
                                                        display: 'inline-block',
                                                        marginTop: '0.5rem',
                                                        padding: '0.25rem 0.75rem',
                                                        background: 'rgba(127, 255, 212, 0.2)',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        color: '#7FFFD4'
                                                    }}>
                                                        {event.eventType}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Event Modal */}
            <CreateEventModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onEventCreated={handleEventCreated}
            />
        </div>
    );
};

export default Calendar;
