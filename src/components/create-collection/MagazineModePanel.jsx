import React from 'react';
import { FaImage, FaCalendar, FaClock, FaGlobe, FaUsers, FaLock } from 'react-icons/fa';
import { RELEASE_FREQUENCIES } from '@/core/constants/magazineConfig';

const MagazineModePanel = ({
    images,
    fileInputRef,
    releaseFrequency,
    setReleaseFrequency,
    releaseDay,
    setReleaseDay,
    releaseTime,
    setReleaseTime,
    linkedGalleryId,
    setLinkedGalleryId,
    description,
    setDescription,
    visibility,
    setVisibility
}) => {
    return (
        <>
            {/* Cover Image Upload */}
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                    Cover Image (Optional)
                </label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#111',
                        border: '1px dashed #333',
                        borderRadius: '8px',
                        color: '#888',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <FaImage />
                    {images.length > 0 ? 'Change Cover Image' : 'Upload Cover Image'}
                </div>
                {images.length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#7FFFD4' }}>
                        Selected: {images[0].file.name}
                    </div>
                )}
            </div>

            {/* Release Frequency */}
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                    Release Frequency *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {RELEASE_FREQUENCIES.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setReleaseFrequency(value)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: releaseFrequency === value ? 'rgba(127, 255, 212, 0.2)' : '#111',
                                border: releaseFrequency === value ? '1px solid #7FFFD4' : '1px solid #333',
                                borderRadius: '8px',
                                color: releaseFrequency === value ? '#7FFFD4' : '#888',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Release Day */}
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                    <FaCalendar style={{ marginRight: '0.5rem' }} />
                    Release Day of Month *
                </label>
                <input
                    type="number"
                    min="1"
                    max="31"
                    value={releaseDay}
                    onChange={(e) => setReleaseDay(parseInt(e.target.value) || 1)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                />
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                    Day 1-31 (if month doesn't have this day, it will use the last day)
                </div>
            </div>

            {/* Release Time */}
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                    <FaClock style={{ marginRight: '0.5rem' }} />
                    Release Time *
                </label>
                <input
                    type="time"
                    value={releaseTime}
                    onChange={(e) => setReleaseTime(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                />
            </div>

            {/* Gallery Link (Optional) */}
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                    Link to Studio (Optional)
                </label>
                <input
                    type="text"
                    value={linkedGalleryId}
                    onChange={(e) => setLinkedGalleryId(e.target.value)}
                    placeholder="Enter Studio ID to link..."
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                />
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                    Linking a studio allows contributors to submit photos to your magazine issues.
                </div>
            </div>

            {/* Description */}
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this magazine..."
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '1rem',
                        resize: 'vertical'
                    }}
                />
            </div>

            {/* Visibility */}
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                    Visibility
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                        { value: 'public', icon: FaGlobe, label: 'Public' },
                        { value: 'followers', icon: FaUsers, label: 'Followers' },
                        { value: 'private', icon: FaLock, label: 'Private' }
                    ].map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setVisibility(value)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: visibility === value ? 'rgba(127, 255, 212, 0.2)' : '#111',
                                border: visibility === value ? '1px solid #7FFFD4' : '1px solid #333',
                                borderRadius: '8px',
                                color: visibility === value ? '#7FFFD4' : '#888',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontWeight: '600'
                            }}
                        >
                            <Icon /> {label}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

export default MagazineModePanel;
