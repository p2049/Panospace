import React, { useState } from 'react';
import { FaTimes, FaFlag, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { ModerationService } from '../services/ModerationService';
import { REPORT_CATEGORIES, REPORT_REASONS } from '../constants/moderationConstants';

const ReportModal = ({ isOpen, targetType, targetId, targetTitle, onClose }) => {
    if (!isOpen) return null;
    const { currentUser } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedReason, setSelectedReason] = useState('');
    const [detail, setDetail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCategory || !selectedReason) {
            alert('Please select a category and reason');
            return;
        }

        setSubmitting(true);
        try {
            await ModerationService.reportContent(targetType, targetId, {
                reporterUid: currentUser.uid,
                reporterName: currentUser.displayName || currentUser.email,
                category: selectedCategory,
                reason: selectedReason,
                detail
            });

            // Update moderation flags
            await ModerationService.checkReportThresholds(targetType, targetId);

            setSubmitted(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error submitting report:', error);
            alert(error.message || 'Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    const categories = [
        { id: REPORT_CATEGORIES.SAFETY, label: 'Safety & Content', icon: '⚠️' },
        { id: REPORT_CATEGORIES.ART_INTEGRITY, label: 'Art Integrity', icon: '🎨' },
        { id: REPORT_CATEGORIES.TAG_MISUSE, label: 'Tag Misuse', icon: '🏷️' },
        { id: REPORT_CATEGORIES.MARKETPLACE_FRAUD, label: 'Marketplace Fraud', icon: '💰' }
    ];

    if (submitted) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.9)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '1rem'
            }}>
                <div style={{
                    background: '#1a1a1a',
                    border: '1px solid #7FFFD4',
                    borderRadius: '16px',
                    padding: '3rem',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#7FFFD4' }}>Report Submitted</h3>
                    <p style={{ color: '#888', margin: 0 }}>Thank you for helping keep PanoSpace safe</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
        }}>
            <div style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaFlag color="#ff6b6b" /> Report Content
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '1.5rem'
                    }}>
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {targetTitle && (
                        <div style={{
                            padding: '1rem',
                            background: '#222',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: '#888'
                        }}>
                            Reporting: <strong style={{ color: '#fff' }}>{targetTitle}</strong>
                        </div>
                    )}

                    {/* Category Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>
                            Why are you reporting this?
                        </label>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(cat.id);
                                        setSelectedReason('');
                                    }}
                                    style={{
                                        padding: '1rem',
                                        background: selectedCategory === cat.id ? 'rgba(127, 255, 212, 0.1)' : '#222',
                                        border: selectedCategory === cat.id ? '2px solid #7FFFD4' : '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        fontSize: '1rem',
                                        fontWeight: selectedCategory === cat.id ? '600' : '400'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reason Selection */}
                    {selectedCategory && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>
                                Select specific reason
                            </label>
                            <select
                                value={selectedReason}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="">Choose a reason...</option>
                                {Object.entries(REPORT_REASONS[selectedCategory]).map(([key, value]) => (
                                    <option key={key} value={key}>{value.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Additional Details */}
                    {selectedReason && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>
                                Additional details (optional)
                            </label>
                            <textarea
                                value={detail}
                                onChange={(e) => setDetail(e.target.value)}
                                placeholder="Provide any additional context..."
                                rows={4}
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
                    )}

                    {/* Warning */}
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '0.75rem',
                        fontSize: '0.85rem',
                        color: '#ff6b6b'
                    }}>
                        <FaExclamationTriangle style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            False reports may result in restrictions on your account. Only report content that violates our guidelines.
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <button
                        onClick={onClose}
                        type="button"
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#333',
                            border: '1px solid #444',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedCategory || !selectedReason || submitting}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: (!selectedCategory || !selectedReason || submitting) ? '#333' : '#ff6b6b',
                            border: 'none',
                            borderRadius: '8px',
                            color: (!selectedCategory || !selectedReason || submitting) ? '#666' : '#fff',
                            cursor: (!selectedCategory || !selectedReason || submitting) ? 'not-allowed' : 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
