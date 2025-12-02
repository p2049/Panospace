import React from 'react';
import { FaLayerGroup } from 'react-icons/fa';

/**
 * CollectionSelector Component
 * 
 * Displays a dropdown to select a collection for the post,
 * with an option to also show the post in the user's profile.
 * 
 * @param {Array} collections - Array of available collection objects
 * @param {string} selectedCollectionId - ID of the currently selected collection
 * @param {Function} setSelectedCollectionId - Handler to update selected collection
 * @param {boolean} showInProfile - Whether to also show in profile
 * @param {Function} setShowInProfile - Handler to toggle show in profile
 */
const CollectionSelector = ({
    collections,
    selectedCollectionId,
    setSelectedCollectionId,
    showInProfile,
    setShowInProfile
}) => {
    return (
        <div className="form-section" style={{ padding: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                    <FaLayerGroup style={{ marginRight: '0.5rem', color: '#7FFFD4' }} />
                    Collection
                </h3>
                {selectedCollectionId && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <input
                            type="checkbox"
                            checked={showInProfile}
                            onChange={(e) => setShowInProfile(e.target.checked)}
                            style={{ width: '14px', height: '14px' }}
                        />
                        Also show in profile
                    </label>
                )}
            </div>

            <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '0.4rem', fontSize: '0.9rem' }}
            >
                <option value="">Select a collection (optional)...</option>
                {collections.map(collection => (
                    <option key={collection.id} value={collection.id}>
                        {collection.title}
                    </option>
                ))}
            </select>

            {selectedCollectionId && (() => {
                const selectedCollection = collections.find(c => c.id === selectedCollectionId);
                return selectedCollection ? (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📌 {selectedCollection.title}</span>
                        <span style={{ color: '#444' }}>|</span>
                        <span>{selectedCollection.postToFeed ? 'Visible in Feed' : 'Hidden from Feed'}</span>
                    </div>
                ) : null;
            })()}
        </div>
    );
};

export default CollectionSelector;
