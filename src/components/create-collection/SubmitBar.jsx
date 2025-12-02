import React from 'react';

/**
 * SubmitBar Component
 * Renders the status indicator showing image count and validation state
 */
const SubmitBar = ({ creationMode, images }) => {
    const isMuseum = creationMode === 'museum';
    const isMagazine = creationMode === 'magazine';
    const hasImages = images.length > 0;
    const isValid = isMuseum || isMagazine || hasImages;

    return (
        <div style={{
            padding: '1rem',
            background: isValid ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255, 68, 68, 0.1)',
            border: `1px solid ${isValid ? 'rgba(127, 255, 212, 0.3)' : 'rgba(255, 68, 68, 0.3)'}`,
            borderRadius: '8px',
            color: isValid ? '#7FFFD4' : '#ff4444',
            fontSize: '0.9rem'
        }}>
            {isMuseum ? (
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Ready to Create Museum
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                        Museums can contain galleries and profiles
                    </div>
                </div>
            ) : isMagazine ? (
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Ready to Create Magazine
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                        Configure your magazine settings and schedule
                    </div>
                </div>
            ) : (
                <>
                    {images.length} / 10 images added
                    {images.length === 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                            Add at least 1 image to create {creationMode}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SubmitBar;
