import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMagazine, getMagazineIssue } from '../services/magazineService';
import { getIssueSubmissions, updateSubmissionStatus, approveSubmissionImages } from '../services/submissionService';
import { notifySubmissionApproved, notifySubmissionRejected } from '../services/notificationService';
import { FaArrowLeft, FaCheck, FaTimes, FaImage, FaUsers, FaClock } from 'react-icons/fa';

const MagazineCuration = () => {
    const { magazineId, issueId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [magazine, setMagazine] = useState(null);
    const [issue, setIssue] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImages, setSelectedImages] = useState(new Set());
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadData();
    }, [magazineId, issueId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load magazine
            const mag = await getMagazine(magazineId);

            // Check ownership
            if (mag.ownerId !== currentUser?.uid) {
                alert('You do not have permission to curate this magazine');
                navigate(`/magazine/${magazineId}`);
                return;
            }

            setMagazine(mag);

            // Load issue
            const iss = await getMagazineIssue(issueId);
            setIssue(iss);

            // Load submissions
            const subs = await getIssueSubmissions(issueId);
            setSubmissions(subs);
        } catch (err) {
            console.error('Error loading data:', err);
            alert('Failed to load submissions');
            navigate(`/magazine/${magazineId}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleImageSelection = (submissionId, imageIndex) => {
        const key = `${submissionId}-${imageIndex}`;
        const newSelected = new Set(selectedImages);

        if (newSelected.has(key)) {
            newSelected.delete(key);
        } else {
            newSelected.add(key);
        }

        setSelectedImages(newSelected);
    };

    const isImageSelected = (submissionId, imageIndex) => {
        return selectedImages.has(`${submissionId}-${imageIndex}`);
    };

    const handleApproveSubmission = async (submissionId) => {
        try {
            setProcessing(true);

            // Get selected images for this submission
            const selectedForSubmission = Array.from(selectedImages)
                .filter(key => key.startsWith(`${submissionId}-`))
                .map(key => parseInt(key.split('-')[1]));

            if (selectedForSubmission.length === 0) {
                alert('Please select at least one image to approve');
                return;
            }

            await approveSubmissionImages(submissionId, selectedForSubmission);

            // Notify contributor
            const submission = submissions.find(s => s.id === submissionId);
            if (submission) {
                await notifySubmissionApproved(submission.userId, magazine.title, issue.issueNumber);
            }

            await loadData();

            // Clear selections for this submission
            const newSelected = new Set(
                Array.from(selectedImages).filter(key => !key.startsWith(`${submissionId}-`))
            );
            setSelectedImages(newSelected);
        } catch (err) {
            console.error('Error approving submission:', err);
            alert('Failed to approve submission');
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectSubmission = async (submissionId) => {
        if (!confirm('Are you sure you want to reject this submission?')) return;

        try {
            setProcessing(true);

            // Get submission for notification
            const submission = submissions.find(s => s.id === submissionId);

            await updateSubmissionStatus(submissionId, 'rejected');

            // Notify contributor
            if (submission) {
                await notifySubmissionRejected(submission.userId, magazine.title, issue.issueNumber);
            }

            await loadData();
        } catch (err) {
            console.error('Error rejecting submission:', err);
            alert('Failed to reject submission');
        } finally {
            setProcessing(false);
        }
    };

    const getSubmissionStats = () => {
        const total = submissions.length;
        const pending = submissions.filter(s => s.status === 'pending').length;
        const approved = submissions.filter(s => s.status === 'approved').length;
        const rejected = submissions.filter(s => s.status === 'rejected').length;

        return { total, pending, approved, rejected };
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#000' }}>
                Loading submissions...
            </div>
        );
    }

    const stats = getSubmissionStats();
    const pendingSubmissions = submissions.filter(s => s.status === 'pending');

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid #333',
                position: 'sticky',
                top: 0,
                background: '#000',
                zIndex: 100
            }}>
                <button
                    onClick={() => navigate(`/magazine/${magazineId}`)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}
                >
                    <FaArrowLeft /> Back to Magazine
                </button>

                <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>
                    Curate Issue #{issue?.issueNumber}
                </h1>
                <p style={{ margin: 0, color: '#888' }}>{magazine?.title}</p>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7FFFD4' }}>{stats.total}</div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Total Submissions</div>
                    </div>
                    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffaa00' }}>{stats.pending}</div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Pending Review</div>
                    </div>
                    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7FFFD4' }}>{stats.approved}</div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Approved</div>
                    </div>
                    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff4444' }}>{stats.rejected}</div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Rejected</div>
                    </div>
                </div>

                {/* Submissions */}
                {pendingSubmissions.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '12px'
                    }}>
                        <FaImage style={{ fontSize: '3rem', color: '#666', marginBottom: '1rem' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#888' }}>No Pending Submissions</h3>
                        <p style={{ margin: 0, color: '#666' }}>
                            {stats.total === 0 ? 'No submissions received yet' : 'All submissions have been reviewed'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {pendingSubmissions.map(submission => (
                            <div
                                key={submission.id}
                                style={{
                                    background: '#111',
                                    border: '1px solid #333',
                                    borderRadius: '12px',
                                    padding: '1.5rem'
                                }}
                            >
                                {/* Submission Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>
                                            {submission.userName}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#888' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FaImage /> {submission.images?.length || 0} images
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FaClock /> {submission.submittedAt?.toDate ? submission.submittedAt.toDate().toLocaleDateString() : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleApproveSubmission(submission.id)}
                                            disabled={processing}
                                            style={{
                                                background: '#7FFFD4',
                                                color: '#000',
                                                border: 'none',
                                                padding: '0.5rem 1.5rem',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: processing ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                opacity: processing ? 0.5 : 1
                                            }}
                                        >
                                            <FaCheck /> Approve Selected
                                        </button>
                                        <button
                                            onClick={() => handleRejectSubmission(submission.id)}
                                            disabled={processing}
                                            style={{
                                                background: 'rgba(255, 68, 68, 0.2)',
                                                color: '#ff4444',
                                                border: '1px solid rgba(255, 68, 68, 0.5)',
                                                padding: '0.5rem 1.5rem',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: processing ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                opacity: processing ? 0.5 : 1
                                            }}
                                        >
                                            <FaTimes /> Reject All
                                        </button>
                                    </div>
                                </div>

                                {/* Images Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {submission.images?.map((image, index) => (
                                        <div
                                            key={index}
                                            onClick={() => toggleImageSelection(submission.id, index)}
                                            style={{
                                                position: 'relative',
                                                cursor: 'pointer',
                                                border: isImageSelected(submission.id, index) ? '3px solid #7FFFD4' : '1px solid #333',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                aspectRatio: '1',
                                                background: `url(${image.imageUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }} />

                                            {isImageSelected(submission.id, index) && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: '#7FFFD4',
                                                    color: '#000',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold'
                                                }}>
                                                    <FaCheck />
                                                </div>
                                            )}

                                            {image.caption && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    background: 'rgba(0,0,0,0.8)',
                                                    padding: '0.5rem',
                                                    fontSize: '0.85rem',
                                                    color: '#ccc'
                                                }}>
                                                    {image.caption}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MagazineCuration;
