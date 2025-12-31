import React from 'react';
import { FaCheck } from 'react-icons/fa';

/**
 * SubmitBar Component
 * Renders the floating create button if valid, or status indicator if not
 */
const SubmitBar = ({ creationMode, images, onSubmit, uploading }) => {
    const isMuseum = creationMode === 'museum';
    const isMagazine = creationMode === 'magazine';
    const hasImages = images.length > 0;
    const isValid = isMuseum || isMagazine || hasImages;

    if (isValid) {
        return (
            <button
                onClick={onSubmit}
                disabled={uploading}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'calc(100% - 32px)',
                    maxWidth: '400px',
                    padding: '1rem',
                    background: 'var(--ice-mint)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '30px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: uploading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    zIndex: 1000,
                    boxShadow: '0 4px 20px rgba(127, 255, 212, 0.3)',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-family-heading)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                }}
            >
                {uploading ? 'Creating...' : (
                    <>
                        <FaCheck /> Create {creationMode === 'gallery' ? 'Studio' : creationMode}
                    </>
                )}
            </button>
        );
    }

    return (
        <div style={{
            padding: '1rem',
            background: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid rgba(255, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ff4444',
            fontSize: '0.9rem',
            textAlign: 'center',
            marginBottom: '2rem'
        }}>
            {images.length} / 10 images added
            {images.length === 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    Add at least 1 image to create {creationMode === 'gallery' ? 'studio' : creationMode}
                </div>
            )}
        </div>
    );
};

export default SubmitBar;
