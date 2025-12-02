import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import { formatDateForDisplay } from '../utils/dateHelpers';

const EventCard = ({ event }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/event/${event.id}`)}
            style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ aspectRatio: '3/2', background: '#111', position: 'relative' }}>
                {event.coverImage && (
                    <img src={event.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(0,0,0,0.8)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    textAlign: 'center',
                    minWidth: '50px'
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ice-mint)', fontWeight: 600 }}>
                        {event.date ? new Date(event.date.seconds * 1000).toLocaleString('default', { month: 'short' }).toUpperCase() : 'TBD'}
                    </div>
                    <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>
                        {event.date ? new Date(event.date.seconds * 1000).getDate() : '--'}
                    </div>
                </div>
            </div>
            <div style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.1rem' }}>{event.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <FaMapMarkerAlt size={12} />
                    <span>{event.location || 'Online'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem' }}>
                    <FaCalendar size={12} />
                    <span>{event.date ? formatDateForDisplay(new Date(event.date.seconds * 1000)) : 'Date TBD'}</span>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
