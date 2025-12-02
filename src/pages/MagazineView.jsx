import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { getMagazineIssues } from '../services/magazineService';
import { FaArrowLeft, FaBook, FaClock, FaCalendar, FaImage, FaUsers, FaEye } from 'react-icons/fa';
import SEO from '../components/SEO';
import StarBackground from '../components/StarBackground';

const MagazineView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [magazine, setMagazine] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMagazine = async () => {
            try {
                const magazineRef = doc(db, 'magazines', id);
                const magazineSnap = await getDoc(magazineRef);

                if (magazineSnap.exists()) {
                    setMagazine({ id: magazineSnap.id, ...magazineSnap.data() });

                    // Fetch issues
                    const fetchedIssues = await getMagazineIssues(id);
                    setIssues(fetchedIssues);
                } else {
                    setError('Magazine not found');
                }
            } catch (err) {
                console.error('Error fetching magazine:', err);
                setError('Failed to load magazine');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMagazine();
        }
    }, [id]);

    const formatReleaseFrequency = (frequency) => {
        return frequency === 'monthly' ? 'Monthly' : 'Bi-Monthly';
    };

    const formatNextReleaseDate = (date) => {
        if (!date) return 'Not scheduled';
        const releaseDate = date.toDate ? date.toDate() : new Date(date);
        return releaseDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOwner = magazine?.ownerId === currentUser?.uid;

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading Magazine...</div>;
    if (error || !magazine) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{error || 'Magazine not found'}</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '4rem', position: 'relative', overflow: 'hidden' }}>
            <SEO title={magazine.title} description={magazine.description} />
            <StarBackground />

            {/* Hero Section */}
            <div style={{ position: 'relative', height: '40vh', minHeight: '300px' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    {magazine.coverImage ? (
                        <img src={magazine.coverImage} alt={magazine.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }} />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), #000)' }} />
                </div>

                <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                        <FaArrowLeft />
                    </button>
                </div>

                {isOwner && (
                    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
                        <button
                            onClick={() => navigate(`/magazine/${id}/create-issue`)}
                            style={{
                                background: '#7FFFD4',
                                color: '#000',
                                border: 'none',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaImage /> Create Issue
                        </button>
                    </div>
                )}

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', color: '#7FFFD4' }}>
                        <FaBook size={24} />
                        <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.9rem' }}>Magazine</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0 0 1rem 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{magazine.title}</h1>
                    <p style={{ fontSize: '1.1rem', color: '#ccc', maxWidth: '600px', lineHeight: '1.6' }}>{magazine.description}</p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                            <FaClock style={{ color: '#7FFFD4' }} />
                            <span>{formatReleaseFrequency(magazine.releaseFrequency)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                            <FaCalendar style={{ color: '#7FFFD4' }} />
                            <span>Next: {formatNextReleaseDate(magazine.nextReleaseDate)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                            <FaBook style={{ color: '#7FFFD4' }} />
                            <span>{magazine.issueCount || 0} Issues</span>
                        </div>
                        {magazine.collaborationEnabled && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(127, 255, 212, 0.2)', padding: '0.5rem 1rem', borderRadius: '20px', backdropFilter: 'blur(4px)', border: '1px solid #7FFFD4' }}>
                                <FaUsers style={{ color: '#7FFFD4' }} />
                                <span style={{ color: '#7FFFD4' }}>Collaborative</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                {issues.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                        <FaBook size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No issues yet.</p>
                        {isOwner && (
                            <button
                                onClick={() => navigate(`/magazine/${id}/create-issue`)}
                                style={{
                                    marginTop: '1rem',
                                    background: '#7FFFD4',
                                    color: '#000',
                                    border: 'none',
                                    padding: '0.75rem 2rem',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Create Your First Issue
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2 style={{ marginBottom: '1.5rem' }}>Issues</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {issues.map(issue => (
                                <div
                                    key={issue.id}
                                    style={{
                                        background: '#111',
                                        border: '1px solid #333',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
                                            Issue #{issue.issueNumber}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#888' }}>
                                            <span>{issue.slides?.length || 0} slides</span>
                                            <span>•</span>
                                            <span style={{
                                                color: issue.status === 'published' ? '#7FFFD4' :
                                                    issue.status === 'queued' ? '#ffaa00' : '#888'
                                            }}>
                                                {issue.status === 'published' ? 'Published' :
                                                    issue.status === 'queued' ? 'Queued' : 'Draft'}
                                            </span>
                                            {issue.scheduledPublishDate && (
                                                <>
                                                    <span>•</span>
                                                    <span>
                                                        {issue.status === 'queued' ? 'Publishes' : 'Published'} {
                                                            issue.scheduledPublishDate.toDate ?
                                                                issue.scheduledPublishDate.toDate().toLocaleDateString() :
                                                                'Unknown'
                                                        }
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {isOwner && issue.status === 'queued' && (
                                        <button
                                            onClick={() => navigate(`/magazine/${id}/issue/${issue.id}/curate`)}
                                            style={{
                                                background: 'rgba(127, 255, 212, 0.2)',
                                                color: '#7FFFD4',
                                                border: '1px solid #7FFFD4',
                                                padding: '0.5rem 1.5rem',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <FaEye /> Review Submissions
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MagazineView;
