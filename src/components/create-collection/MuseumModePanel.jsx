import React from 'react';
import { FaImage, FaGlobe, FaUsers, FaLock } from 'react-icons/fa';

const MuseumModePanel = ({
    images,
    fileInputRef,
    description,
    setDescription,
    visibility,
    setVisibility
}) => {
    return (
        <>
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

            {/* Description */}
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this museum..."
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

export default MuseumModePanel;
