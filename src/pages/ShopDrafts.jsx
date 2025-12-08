import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShopService } from '@/core/services/firestore/studios.service';
import PublishShopItemModal from '@/components/PublishShopItemModal';
import SmartImage from '@/components/SmartImage';
import { FaStore, FaEye, FaTrash, FaExclamationCircle } from 'react-icons/fa';

const ShopDrafts = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Publish modal state
    const [publishModalOpen, setPublishModalOpen] = useState(false);
    const [selectedDraft, setSelectedDraft] = useState(null);

    useEffect(() => {
        loadDrafts();
    }, [currentUser]);

    const loadDrafts = async () => {
        if (!currentUser) return;

        setLoading(true);
        setError('');

        try {
            const userDrafts = await ShopService.getDrafts(currentUser.uid);
            setDrafts(userDrafts);
        } catch (err) {
            console.error('Error loading drafts:', err);
            setError('Failed to load drafts');
        } finally {
            setLoading(false);
        }
    };

    const handlePublishClick = (draft) => {
        setSelectedDraft(draft);
        setPublishModalOpen(true);
    };

    const handlePublishConfirm = async () => {
        if (!selectedDraft) return;

        try {
            await ShopService.publishDraft(selectedDraft.id, currentUser.uid, true);
            setPublishModalOpen(false);
            setSelectedDraft(null);

            // Reload drafts
            await loadDrafts();

            // Show success message (you could add a toast notification here)
            alert('Item published successfully!');
        } catch (err) {
            console.error('Error publishing draft:', err);
            alert('Failed to publish item: ' + err.message);
        }
    };

    const handleDelete = async (draftId) => {
        if (!confirm('Are you sure you want to delete this draft?')) return;

        try {
            await ShopService.deleteDraft(draftId, currentUser.uid);
            await loadDrafts();
        } catch (err) {
            console.error('Error deleting draft:', err);
            alert('Failed to delete draft');
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0a',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ color: '#888', fontSize: '1.1rem' }}>
                    Loading drafts...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            padding: '2rem 1rem'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <FaStore style={{ color: '#7FFFD4' }} />
                            Shop Drafts
                        </h1>
                        <p style={{ color: '#888', fontSize: '1rem' }}>
                            Publish your drafts to make them available in your shop
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/shop')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#333',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaEye /> View Shop
                    </button>
                </div>

                {/* Info Banner */}
                <div style={{
                    background: 'rgba(127, 255, 212, 0.1)',
                    border: '1px solid rgba(127, 255, 212, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                }}>
                    <FaExclamationCircle style={{ color: '#7FFFD4', fontSize: '1.25rem', marginTop: '2px' }} />
                    <div>
                        <div style={{ color: '#7FFFD4', fontWeight: '600', marginBottom: '0.25rem' }}>
                            About Shop Drafts
                        </div>
                        <div style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            When you create a post with "Sell this image" enabled, it creates a draft here. Drafts are not visible in your public shop until you publish them and confirm copyright ownership.
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(255, 68, 68, 0.1)',
                        border: '1px solid rgba(255, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#ff4444',
                        marginBottom: '2rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Drafts Grid */}
                {drafts.length === 0 ? (
                    <div style={{
                        background: '#111',
                        borderRadius: '12px',
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        border: '1px solid #333'
                    }}>
                        <FaStore style={{
                            fontSize: '4rem',
                            color: '#444',
                            marginBottom: '1rem'
                        }} />
                        <h3 style={{
                            fontSize: '1.5rem',
                            color: '#666',
                            marginBottom: '0.5rem'
                        }}>
                            No drafts yet
                        </h3>
                        <p style={{ color: '#555', marginBottom: '2rem' }}>
                            Create a post with "Sell this image" enabled to create shop drafts
                        </p>
                        <button
                            onClick={() => navigate('/create')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#7FFFD4',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#000',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Create Post
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {drafts.map(draft => (
                            <div
                                key={draft.id}
                                style={{
                                    background: '#111',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #333',
                                    transition: 'transform 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {/* Image */}
                                <div style={{
                                    aspectRatio: '1',
                                    background: '#222',
                                    overflow: 'hidden'
                                }}>
                                    <SmartImage
                                        src={draft.imageUrl}
                                        alt={draft.title}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>

                                {/* Info */}
                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{
                                        color: '#fff',
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {draft.title || 'Untitled'}
                                    </h3>

                                    <div style={{
                                        color: '#888',
                                        fontSize: '0.85rem',
                                        marginBottom: '1rem'
                                    }}>
                                        {draft.productTier && (
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.25rem 0.5rem',
                                                background: '#222',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase'
                                            }}>
                                                {draft.productTier}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}>
                                        <button
                                            onClick={() => handlePublishClick(draft)}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                background: '#7FFFD4',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: '#000',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Publish
                                        </button>
                                        <button
                                            onClick={() => handleDelete(draft.id)}
                                            style={{
                                                padding: '0.75rem',
                                                background: '#333',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: '#ff4444',
                                                cursor: 'pointer',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Publish Modal */}
            <PublishShopItemModal
                isOpen={publishModalOpen}
                itemTitle={selectedDraft?.title}
                onConfirm={handlePublishConfirm}
                onCancel={() => {
                    setPublishModalOpen(false);
                    setSelectedDraft(null);
                }}
            />
        </div>
    );
};

export default ShopDrafts;
