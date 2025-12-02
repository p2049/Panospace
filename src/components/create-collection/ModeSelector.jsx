import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaBook } from 'react-icons/fa';

/**
 * ModeSelector Component
 * Renders the Collection/Gallery/Museum/Magazine toggle buttons
 */
const ModeSelector = ({ creationMode, setCreationMode }) => {
    const navigate = useNavigate();

    const buttonStyle = (isActive) => ({
        flex: 1,
        padding: '0.75rem',
        background: isActive ? '#7FFFD4' : '#111',
        border: isActive ? '1px solid #7FFFD4' : '1px solid #333',
        borderRadius: '8px',
        color: isActive ? '#000' : '#888',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '1rem',
        transition: 'all 0.2s'
    });

    const iconButtonStyle = (isActive) => ({
        ...buttonStyle(isActive),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem 0 2rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                    type="button"
                    onClick={() => setCreationMode('collection')}
                    style={buttonStyle(creationMode === 'collection')}
                >
                    Collection
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/gallery/create')}
                    style={buttonStyle(false)}
                >
                    Gallery
                </button>
                <button
                    type="button"
                    onClick={() => setCreationMode('museum')}
                    style={iconButtonStyle(creationMode === 'museum')}
                >
                    <FaUniversity /> Museum
                </button>
                <button
                    type="button"
                    onClick={() => setCreationMode('magazine')}
                    style={iconButtonStyle(creationMode === 'magazine')}
                >
                    <FaBook /> Magazine
                </button>
            </div>
        </div>
    );
};

export default ModeSelector;
