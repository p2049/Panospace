import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaDownload } from 'react-icons/fa';
import { getCommissions } from '@/core/services/firestore/monetization.service';

const CommissionList = ({ userId, role = 'editor' }) => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCommissions();
    }, [userId, role]);

    const loadCommissions = async () => {
        setLoading(true);
        try {
            const data = await getCommissions(userId, role);
            setCommissions(data);
        } catch (error) {
            console.error('Error loading commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#FFA500',
            accepted: '#3498DB',
            completed: '#2ECC71',
            rejected: '#E74C3C'
        };
        return colors[status] || '#888';
    };

    const getStatusLabel = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                Loading commissions...
            </div>
        );
    }

    if (commissions.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                No commissions yet.
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>
                {role === 'editor' ? 'Commission Requests' : 'My Commissions'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {commissions.map((commission) => (
                    <div
                        key={commission.id}
                        style={{
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                        }}>
                            <div>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    background: getStatusColor(commission.status) + '20',
                                    color: getStatusColor(commission.status),
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem'
                                }}>
                                    {getStatusLabel(commission.status)}
                                </div>
                                <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                                    {new Date(commission.createdAt?.toDate?.() || commission.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                                ${commission.price}
                            </div>
                        </div>

                        {commission.instructions && (
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ color: '#ccc', fontSize: '0.9rem', margin: 0 }}>
                                    <strong>Instructions:</strong> {commission.instructions}
                                </p>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {commission.rawFileUrl && (
                                <a
                                    href={commission.rawFileUrl}
                                    download
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.6rem 1rem',
                                        background: '#2a2a2a',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        border: '1px solid #555'
                                    }}
                                >
                                    <FaDownload /> Download RAW
                                </a>
                            )}

                            {commission.editedFileUrl && (
                                <a
                                    href={commission.editedFileUrl}
                                    download
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.6rem 1rem',
                                        background: '#2ECC71',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <FaDownload /> Download Edited
                                </a>
                            )}

                            {role === 'editor' && commission.status === 'pending' && (
                                <>
                                    <button
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.6rem 1rem',
                                            background: '#2ECC71',
                                            color: '#fff',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaCheck /> Accept
                                    </button>
                                    <button
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.6rem 1rem',
                                            background: '#E74C3C',
                                            color: '#fff',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaTimes /> Decline
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommissionList;
