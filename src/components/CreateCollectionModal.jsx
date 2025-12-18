import React, { useState, useEffect } from 'react';
import { FaTimes, FaImage, FaLock, FaUsers, FaGlobe, FaCalendar, FaStore, FaRss } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useCreateCollection } from '@/hooks/useCollections';
import { checkContent } from '@/core/utils/moderation/moderator';

const CreateCollectionModal = ({ isOpen, onClose, onSuccess, userPosts = [] }) => {
    const { currentUser } = useAuth();
    const { createCollection, loading, error } = useCreateCollection();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'public',
        showInFeed: true,
        showInStore: false,
        bundlePrice: '',
        scheduledDropDate: '',
        selectedPostIds: [],
        isGallery: false
    });

    const [coverImageUrl, setCoverImageUrl] = useState('');

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setFormData({
                title: '',
                description: '',
                visibility: 'public',
                showInFeed: true,
                showInStore: false,
                bundlePrice: '',
                scheduledDropDate: '',
                selectedPostIds: [],
                isGallery: false
            });
            setCoverImageUrl('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Please enter a collection title');
            return;
        }

        // 🛡️ MODERATION CHECK
        const titleCheck = checkContent(formData.title);
        if (!titleCheck.allowed) {
            return alert("This content contains language that isn’t allowed on Panospace.");
        }

        if (formData.description) {
            const descCheck = checkContent(formData.description);
            if (!descCheck.allowed) {
                return alert("This content contains language that isn’t allowed on Panospace.");
            }
        }

        try {
            const collectionData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                coverImage: coverImageUrl || (userPosts.find(p => formData.selectedPostIds.includes(p.id))?.images?.[0]?.url || ''),
                ownerId: currentUser.uid,
                postIds: formData.selectedPostIds,
                visibility: formData.visibility,
                showInFeed: formData.showInFeed,
                showInStore: formData.showInStore,
                bundlePrice: formData.bundlePrice ? parseFloat(formData.bundlePrice) : null,
                scheduledDropDate: formData.scheduledDropDate ? new Date(formData.scheduledDropDate) : null,
                isGallery: formData.isGallery
            };

            const newCollection = await createCollection(collectionData);

            if (onSuccess) {
                onSuccess(newCollection);
            }

            onClose();
        } catch (err) {
            console.error('Failed to create collection:', err);
            alert('Failed to create collection. Please try again.');
        }
    };

    const togglePostSelection = (postId) => {
        setFormData(prev => ({
            ...prev,
            selectedPostIds: prev.selectedPostIds.includes(postId)
                ? prev.selectedPostIds.filter(id => id !== postId)
                : [...prev.selectedPostIds, postId]
        }));
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: '#111',
                borderRadius: '12px',
                maxWidth: '600px',
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
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: '#111',
                    zIndex: 10
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>Create Collection</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            fontSize: '1.5rem'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {/* Title */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                            Collection Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Summer 2024 Collection"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#222',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe this collection..."
                            rows={3}
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
                    </div>

                    {/* Visibility */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                            Visibility
                        </label>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                            Leave empty to sell items individually
                        </div>

                        {/* Copyright Warning for Store Items */}
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: 'rgba(255, 165, 0, 0.1)',
                            border: '1px solid rgba(255, 165, 0, 0.3)',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            color: '#ffb84d',
                            lineHeight: '1.4'
                        }}>
                            ⚠️ <strong>Copyright Notice:</strong> By listing this item, you certify that you own all rights to this content. Unauthorized sale of copyrighted material is prohibited.
                        </div>
                    </div>

                    {/* Scheduled Drop Date */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                            <FaCalendar style={{ marginRight: '0.5rem' }} />
                            Schedule Drop (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.scheduledDropDate}
                            onChange={(e) => setFormData({ ...formData, scheduledDropDate: e.target.value })}
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
                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                            Leave empty to publish immediately
                        </div>
                    </div>

                    {/* Select Posts */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', color: '#ccc', fontWeight: '600' }}>
                            Select Posts ({formData.selectedPostIds.length} selected)
                        </label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                            gap: '0.5rem',
                            maxHeight: '300px',
                            overflow: 'auto',
                            padding: '0.5rem',
                            background: '#0a0a0a',
                            borderRadius: '8px',
                            border: '1px solid #333'
                        }}>
                            {userPosts.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    No posts available. You can still create an empty collection.
                                </div>
                            ) : (
                                userPosts.map(post => {
                                    const isSelected = formData.selectedPostIds.includes(post.id);
                                    const imageUrl = post.images?.[0]?.url || post.imageUrl || post.items?.[0]?.url;

                                    return (
                                        <div
                                            key={post.id}
                                            onClick={() => togglePostSelection(post.id)}
                                            style={{
                                                aspectRatio: '1',
                                                background: '#222',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: isSelected ? '2px solid #7FFFD4' : '2px solid transparent',
                                                position: 'relative',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt=""
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        opacity: isSelected ? 1 : 0.7
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#666',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    Text
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    width: '20px',
                                                    height: '20px',
                                                    background: '#7FFFD4',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#000',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#ff4444',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#333',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#7FFFD4',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#000',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Collection'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCollectionModal;
