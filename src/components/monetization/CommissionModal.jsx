import React, { useState, useEffect } from 'react';
import { FaTimes, FaFileUpload, FaWallet } from 'react-icons/fa';
import { createCommission } from '@/core/services/firestore/monetization.service';
import { useAuth } from '@/context/AuthContext';
import { WalletService } from '@/services/WalletService';

const CommissionModal = ({ editorId, editorName, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const [rawFile, setRawFile] = useState(null);
    const [rawFileUrl, setRawFileUrl] = useState('');
    const [price, setPrice] = useState(50);
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        if (currentUser) {
            loadWallet();
        }
    }, [currentUser]);

    const loadWallet = async () => {
        const balance = await WalletService.getWalletBalance(currentUser.uid);
        setWalletBalance(balance);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRawFile(file);
            // In production, upload to Firebase Storage and get URL
            // For MVP, we'll use a mock URL if no storage logic is ready, 
            // but ideally we should upload. 
            // Let's assume for now we just store the name as a placeholder if we don't have storage logic handy.
            setRawFileUrl(`https://mock-storage.com/${file.name}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            setError('You must be logged in');
            return;
        }

        if (!rawFileUrl) {
            setError('Please upload a RAW file');
            return;
        }

        if (walletBalance < price) {
            setError(`Insufficient funds. You have $${walletBalance.toFixed(2)}`);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await createCommission(editorId, currentUser.uid, rawFileUrl, price, instructions);
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to create commission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: '#1a1a1a',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                border: '1px solid #333'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ color: '#fff', margin: 0 }}>Request Commission</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1.5rem'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#222', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc' }}>
                            <FaWallet color="#7FFFD4" />
                            <span>Your Balance:</span>
                        </div>
                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            ${walletBalance.toFixed(2)}
                        </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>
                            Editor: <strong style={{ color: '#fff' }}>{editorName}</strong>
                        </label>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>
                            Upload RAW File *
                        </label>
                        <div style={{
                            border: '2px dashed #555',
                            borderRadius: '8px',
                            padding: '2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: rawFile ? '#2a2a2a' : 'transparent'
                        }}>
                            <input
                                type="file"
                                accept=".raw,.dng,.cr2,.nef,.arw,.jpg,.png"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                id="raw-file-input"
                            />
                            <label htmlFor="raw-file-input" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                                <FaFileUpload size={32} color="#888" />
                                <p style={{ color: '#888', marginTop: '0.5rem' }}>
                                    {rawFile ? rawFile.name : 'Click to upload RAW file'}
                                </p>
                            </label>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>
                            Your Offer (USD) *
                        </label>
                        <input
                            type="number"
                            min="10"
                            max="1000"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: '#2a2a2a',
                                border: '1px solid #555',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>
                            Editing Instructions
                        </label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Describe the editing style you want..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: '#2a2a2a',
                                border: '1px solid #555',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: '#ff000020',
                            border: '1px solid #ff0000',
                            borderRadius: '8px',
                            padding: '0.8rem',
                            color: '#ff6b6b',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: loading ? '#555' : '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Processing...' : `Pay $${price} & Request`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CommissionModal;
