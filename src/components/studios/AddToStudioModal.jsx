import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMemberGalleries, addPostToGallery, addCollectionToGallery, validateContentForGallery } from '@/core/services/firestore/studios.service';
import { FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './AddToGalleryModal.css';

const AddToGalleryModal = ({ contentId, contentType, content, onClose }) => {
    const { currentUser } = useAuth();
    const [galleries, setGalleries] = useState([]);
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [validationResults, setValidationResults] = useState({});

    useEffect(() => {
        loadGalleries();
    }, [currentUser]);

    const loadGalleries = async () => {
        try {
            setLoading(true);
            const memberGalleries = await getMemberGalleries(currentUser.uid);

            // Filter galleries based on content type
            const filteredGalleries = memberGalleries.filter(gallery => {
                if (contentType === 'post') {
                    return gallery.contentType === 'posts' || gallery.contentType === 'both';
                } else if (contentType === 'collection') {
                    return gallery.contentType === 'collections' || gallery.contentType === 'both';
                }
                return false;
            });

            setGalleries(filteredGalleries);

            // Validate content against each gallery's criteria
            const results = {};
            filteredGalleries.forEach(gallery => {
                results[gallery.id] = validateContentForGallery(gallery, content);
            });
            setValidationResults(results);
        } catch (error) {
            console.error('Error loading galleries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToGallery = async () => {
        if (!selectedGallery) return;

        try {
            setAdding(true);

            if (contentType === 'post') {
                await addPostToGallery(selectedGallery, contentId, currentUser.uid);
            } else if (contentType === 'collection') {
                await addCollectionToGallery(selectedGallery, contentId, currentUser.uid);
            }

            onClose(true); // Pass true to indicate success
        } catch (error) {
            console.error('Error adding to gallery:', error);
            alert(`Failed to add to gallery: ${error.message}`);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="add-to-gallery-overlay" onClick={onClose}>
            <div className="add-to-gallery-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add to Studio</h2>
                    <button onClick={onClose} className="close-btn">
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your studios...</p>
                        </div>
                    ) : galleries.length === 0 ? (
                        <div className="empty-state">
                            <p>You're not a member of any studios yet</p>
                            <span>Join or create a studio to add {contentType}s</span>
                        </div>
                    ) : (
                        <div className="galleries-list">
                            {galleries.map(gallery => {
                                const validation = validationResults[gallery.id];
                                const isValid = validation?.valid !== false;

                                return (
                                    <label
                                        key={gallery.id}
                                        className={`gallery-item ${!isValid ? 'invalid' : ''} ${selectedGallery === gallery.id ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="gallery"
                                            value={gallery.id}
                                            checked={selectedGallery === gallery.id}
                                            onChange={() => setSelectedGallery(gallery.id)}
                                            disabled={!isValid}
                                        />
                                        <div className="gallery-item-content">
                                            <div className="gallery-item-header">
                                                <strong>{gallery.title}</strong>
                                                {isValid ? (
                                                    <FaCheck className="valid-icon" />
                                                ) : (
                                                    <FaExclamationTriangle className="invalid-icon" />
                                                )}
                                            </div>
                                            {gallery.description && (
                                                <p className="gallery-description">{gallery.description}</p>
                                            )}
                                            {!isValid && (
                                                <span className="validation-error">
                                                    {validation.reason}
                                                </span>
                                            )}
                                            <div className="gallery-meta">
                                                <span>{gallery.postsCount || 0} posts</span>
                                                <span>•</span>
                                                <span>{gallery.membersCount || 0} members</span>
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="cancel-btn">
                        Cancel
                    </button>
                    <button
                        onClick={handleAddToGallery}
                        disabled={!selectedGallery || adding}
                        className="add-btn"
                    >
                        {adding ? 'Adding...' : 'Add to Studio'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToGalleryModal;
