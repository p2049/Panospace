import React, { useState, useEffect } from 'react';
import { FaTrophy, FaTimes, FaCheck, FaExclamationTriangle, FaWallet } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useContestEntry } from '../../hooks/useContestEntry';
import { WalletService } from '../../services/WalletService';

const ContestEntryModal = ({ contest, post, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const { enterContest, loading, error } = useContestEntry();
    const [walletBalance, setWalletBalance] = useState(0);
    const [validationErrors, setValidationErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchWallet = async () => {
            if (currentUser) {
                const wallet = await WalletService.getWallet(currentUser.uid);
                setWalletBalance(wallet?.balance || 0);
            }
        };
        fetchWallet();
    }, [currentUser]);

    useEffect(() => {
        // Client-side validation checks
        const errors = [];

        if (contest.requireOriginalContent && post.isResold) {
            errors.push('Contest requires original content only');
        }

        if (!contest.allowAIArt && post.isAIGenerated) {
            errors.push('AI-generated art not allowed');
        }

        if (contest.requiredTags && contest.requiredTags.length > 0) {
            const postTags = (post.tags || []).map(t => t.toLowerCase());
            const hasAllTags = contest.requiredTags.every(tag =>
                postTags.includes(tag.toLowerCase())
            );
            if (!hasAllTags) {
                errors.push(`Missing required tags: ${contest.requiredTags.join(', ')}`);
            }
        }

        if (contest.entryType === 'paid' && walletBalance < contest.entryFee) {
            errors.push('Insufficient wallet balance');
        }

        setValidationErrors(errors);
    }, [contest, post, walletBalance]);

    const handleSubmit = async () => {
        if (validationErrors.length > 0) {
            return;
        }

        setSubmitting(true);
        try {
            await enterContest(post.id, contest.id);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Entry error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = validationErrors.length === 0 && !loading && !submitting;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div style={{
                background: '#111',
                borderRadius: '16px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: '2px solid #333'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #222',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FaTrophy style={{ color: '#FFD700', fontSize: '1.5rem' }} />
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Enter Contest</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            padding: '0.5rem'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Contest Info */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{contest.title}</h3>
                    <p style={{ margin: '0 0 1rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                        {contest.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(127, 255, 212, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid var(--ice-mint)'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#888' }}>Prize Pool</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--ice-mint)' }}>
                                ${contest.totalPrizePool || contest.prizePool}
                            </div>
                        </div>
                        {contest.entryType === 'paid' && (
                            <div style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255, 215, 0, 0.1)',
                                borderRadius: '8px',
                                border: '1px solid #FFD700'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#888' }}>Entry Fee</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFD700' }}>
                                    ${contest.entryFee}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Post Preview */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Your Entry</h4>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img
                            src={post.imageUrl || post.items?.[0]?.url}
                            alt={post.title}
                            style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.25rem' }}>
                                {post.title || 'Untitled'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                {post.tags?.slice(0, 3).map(tag => `#${tag}`).join(' ')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Validation Status */}
                <div style={{ padding: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Entry Requirements</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {validationErrors.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem',
                                background: 'rgba(0, 255, 0, 0.1)',
                                borderRadius: '8px',
                                color: '#0f0'
                            }}>
                                <FaCheck />
                                <span>All requirements met!</span>
                            </div>
                        ) : (
                            validationErrors.map((err, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    background: 'rgba(255, 0, 0, 0.1)',
                                    borderRadius: '8px',
                                    color: '#ff4444'
                                }}>
                                    <FaExclamationTriangle />
                                    <span>{err}</span>
                                </div>
                            ))
                        )}
                    </div>

                    {contest.entryType === 'paid' && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#aaa' }}>
                                <FaWallet />
                                <span>Wallet Balance:</span>
                            </div>
                            <span style={{ fontWeight: 'bold', color: walletBalance >= contest.entryFee ? 'var(--ice-mint)' : '#ff4444' }}>
                                ${walletBalance.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid #222',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#222',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: canSubmit ? 'var(--ice-mint)' : '#333',
                            border: 'none',
                            borderRadius: '8px',
                            color: canSubmit ? '#000' : '#666',
                            cursor: canSubmit ? 'pointer' : 'not-allowed',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {submitting ? 'Submitting...' : 'Enter Contest'}
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem 1.5rem',
                        background: 'rgba(255, 0, 0, 0.1)',
                        borderTop: '1px solid rgba(255, 0, 0, 0.3)',
                        color: '#ff4444'
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestEntryModal;
