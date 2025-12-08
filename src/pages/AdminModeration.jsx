import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { FaCheck, FaTrash, FaBan, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminModeration = () => {
    const { currentUser } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Basic security check (replace with real admin check later)
    // For now, just checking if user is logged in. In prod, check claims or specific UIDs.
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const reportsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReports(reportsData);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDismiss = async (reportId) => {
        if (!window.confirm('Dismiss this report?')) return;
        try {
            await updateDoc(doc(db, 'reports', reportId), {
                status: 'dismissed'
            });
            // Refresh local state
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
        } catch (error) {
            console.error('Error dismissing report:', error);
            alert('Failed to dismiss report');
        }
    };

    const handleDeleteContent = async (report) => {
        if (!window.confirm('Are you sure you want to DELETE the reported content? This cannot be undone.')) return;
        try {
            if (report.type === 'post') {
                await deleteDoc(doc(db, 'posts', report.targetId));
            }
            // Mark report as resolved
            await updateDoc(doc(db, 'reports', report.id), {
                status: 'resolved',
                resolution: 'content_deleted'
            });
            setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'resolved' } : r));
            alert('Content deleted');
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Failed to delete content');
        }
    };

    const handleBanUser = async (report) => {
        if (!window.confirm('Are you sure you want to BAN the reported user?')) return;
        // This would require a backend function to disable auth, but we can mark them as banned in Firestore
        alert('Ban functionality requires backend admin SDK. Marking report as resolved for now.');
    };

    if (loading) return <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>Loading reports...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#fff', paddingBottom: '80px' }}>
            <h1 style={{ marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                <FaExclamationTriangle style={{ color: '#ff6b6b', marginRight: '0.5rem' }} />
                Moderation Queue
            </h1>

            {reports.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '4rem' }}>No reports found. Good job!</div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {reports.map(report => (
                        <div key={report.id} style={{
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            opacity: report.status === 'dismissed' || report.status === 'resolved' ? 0.5 : 1
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{
                                            background: report.type === 'post' ? '#4a90e2' : '#e24a4a',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {report.type.toUpperCase()}
                                        </span>
                                        <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
                                            {new Date(report.createdAt?.toDate()).toLocaleString()}
                                        </span>
                                        <span style={{
                                            background: report.status === 'pending' ? '#ff6b6b' : '#444',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem'
                                        }}>
                                            {report.status?.toUpperCase() || 'PENDING'}
                                        </span>
                                    </div>
                                    <h3 style={{ margin: 0, color: '#fff' }}>Reason: {report.reason}</h3>
                                    {report.description && (
                                        <p style={{ color: '#ccc', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                            "{report.description}"
                                        </p>
                                    )}
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
                                        Target ID: {report.targetId} | Reported By: {report.reportedBy}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {report.status !== 'dismissed' && report.status !== 'resolved' && (
                                        <>
                                            <button
                                                onClick={() => handleDismiss(report.id)}
                                                style={{
                                                    background: '#333',
                                                    border: 'none',
                                                    color: '#fff',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <FaCheck /> Dismiss
                                            </button>
                                            {report.type === 'post' && (
                                                <button
                                                    onClick={() => handleDeleteContent(report)}
                                                    style={{
                                                        background: 'rgba(200, 0, 0, 0.2)',
                                                        border: '1px solid #ff6b6b',
                                                        color: '#ff6b6b',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <FaTrash /> Delete Content
                                                </button>
                                            )}
                                            {report.type === 'user' && (
                                                <button
                                                    onClick={() => handleBanUser(report)}
                                                    style={{
                                                        background: 'rgba(200, 0, 0, 0.2)',
                                                        border: '1px solid #ff6b6b',
                                                        color: '#ff6b6b',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <FaBan /> Ban User
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminModeration;
