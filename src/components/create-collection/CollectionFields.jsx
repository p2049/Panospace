import React from 'react';

/**
 * CollectionFields Component
 * Renders the title and description input fields
 */
const CollectionFields = ({
    creationMode,
    title,
    setTitle
}) => {
    const getPlaceholder = () => {
        switch (creationMode) {
            case 'museum':
                return 'e.g., Street Photography Museum';
            case 'gallery':
                return 'e.g., Summer 2024 Studio';
            case 'magazine':
                return 'e.g., Monthly Photography Magazine';
            default:
                return 'e.g., Summer 2024 Collection';
        }
    };

    const getLabel = () => {
        switch (creationMode) {
            case 'museum':
                return 'Museum Title *';
            case 'gallery':
                return 'Studio Title *';
            case 'magazine':
                return 'Magazine Title *';
            default:
                return 'Collection Title *';
        }
    };

    return (
        <div>
            <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#ccc',
                fontWeight: '600'
            }}>
                {getLabel()}
            </label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={getPlaceholder()}
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
    );
};

export default CollectionFields;
