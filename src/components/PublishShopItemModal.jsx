import React, { useState } from 'react';
import { FaTimes, FaExclamationTriangle, FaCheck } from 'react-icons/fa';

/**
 * PublishShopItemModal - Copyright confirmation modal for publishing shop items
 * 
 * Shows legal disclaimer and requires explicit confirmation before publishing
 */
const PublishShopItemModal = ({ isOpen, itemTitle, onConfirm, onCancel }) => {
    const [confirmed, setConfirmed] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublish = async () => {
        if (!confirmed) return;

        setIsPublishing(true);
        try {
            await onConfirm();
        } finally {
            setIsPublishing(false);
            setConfirmed(false);
        }
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
            zIndex: 2000,
            padding: '1rem'
        }}>
            <div style={{
                background: '#111',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '100%',
                border: '1px solid #333'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FaExclamationTriangle style={{ color: '#ffb84d', fontSize: '1.5rem' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                            Copyright Confirmation
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
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

                {/* Content */}
                <div style={{ padding: '1.5rem' }}>
                    {itemTitle && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '0.75rem',
                            background: 'rgba(127, 255, 212, 0.05)',
                            border: '1px solid rgba(127, 255, 212, 0.2)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.25rem' }}>
                                Publishing:
                            </div>
                            <div style={{ color: '#7FFFD4', fontWeight: '600' }}>
                                {itemTitle}
                            </div>
                        </div>
                    )}

                    <div style={{
                        padding: '1.25rem',
                        background: 'rgba(255, 165, 0, 0.1)',
                        border: '1px solid rgba(255, 165, 0, 0.3)',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                    }}>
                        <p style={{ color: '#ffb84d', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                            By publishing this item to your shop, you certify that:
                        </p>
                        <ul style={{ color: '#ccc', lineHeight: '1.8', margin: 0, paddingLeft: '1.5rem' }}>
                            <li>You own all rights to this content</li>
                            <li>This content does not infringe on any copyrights, trademarks, or intellectual property</li>
                            <li>You have the legal right to sell this content</li>
                            <li>You accept full responsibility for any copyright claims or legal issues</li>
                        </ul>
                    </div>

                    {/* Confirmation Checkbox */}
                    <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        padding: '1rem',
                        background: '#222',
                        borderRadius: '8px',
                        border: confirmed ? '1px solid #7FFFD4' : '1px solid #333',
                        marginBottom: '1.5rem',
                        transition: 'all 0.2s'
                    }}>
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                marginTop: '2px'
                            }}
                        />
                        <div>
                            <div style={{ color: '#fff', fontWeight: '600', marginBottom: '0.25rem' }}>
                                I certify the above statements are true
                            </div>
                            <div style={{ color: '#888', fontSize: '0.85rem' }}>
                                False certification may result in account suspension and legal action
                            </div>
                        </div>
                    </label>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            onClick={onCancel}
                            disabled={isPublishing}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#333',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: isPublishing ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                opacity: isPublishing ? 0.5 : 1
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={!confirmed || isPublishing}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: confirmed ? '#7FFFD4' : '#444',
                                border: 'none',
                                borderRadius: '8px',
                                color: confirmed ? '#000' : '#666',
                                cursor: (!confirmed || isPublishing) ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                opacity: isPublishing ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isPublishing ? (
                                <>Publishing...</>
                            ) : (
                                <>
                                    <FaCheck /> Publish Item
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublishShopItemModal;
