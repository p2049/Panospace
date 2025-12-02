import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCreateEvent } from '../hooks/useEvents';
import { FaTimes, FaCalendar, FaTag } from 'react-icons/fa';

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
    const { currentUser } = useAuth();
    const { createEvent, loading } = useCreateEvent();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventType, setEventType] = useState('user');
    const [tags, setTags] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Please enter an event title');
            return;
        }

        if (!eventDate) {
            alert('Please select an event date');
            return;
        }

        try {
            const eventData = {
                creatorId: currentUser.uid,
                title: title.trim(),
                description: description.trim(),
                eventDate: new Date(eventDate),
                eventType,
                tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
            };

            const newEvent = await createEvent(eventData);

            // Reset form
            setTitle('');
            setDescription('');
            setEventDate('');
            setEventType('user');
            setTags('');

            if (onEventCreated) {
                onEventCreated(newEvent);
            }

            onClose();
        } catch (err) {
            console.error('Error creating event:', err);
            alert('Failed to create event. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: '#111',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: '1px solid #333'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                        Create Event
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            padding: 0
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Title */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                Event Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Summer Photo Contest"
                                maxLength={100}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your event..."
                                rows={4}
                                maxLength={500}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                {description.length}/500
                            </div>
                        </div>

                        {/* Event Date */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                Event Date *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FaCalendar style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#7FFFD4',
                                    pointerEvents: 'none'
                                }} />
                                <input
                                    type="datetime-local"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        background: '#222',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Event Type */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                Event Type
                            </label>
                            <select
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="user">User Event</option>
                                <option value="contest">Contest</option>
                                <option value="seasonal">Seasonal Event</option>
                                <option value="drop">Featured Drop</option>
                                <option value="scheduled_post">Scheduled Post</option>
                                <option value="scheduled_collection">Scheduled Collection</option>
                            </select>
                        </div>

                        {/* Tags */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                Tags (comma-separated)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FaTag style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#7FFFD4',
                                    pointerEvents: 'none'
                                }} />
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="e.g., photography, contest, landscape"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        background: '#222',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !title.trim() || !eventDate}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: loading || !title.trim() || !eventDate ? '#333' : '#7FFFD4',
                                color: loading || !title.trim() || !eventDate ? '#666' : '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: loading || !title.trim() || !eventDate ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;
