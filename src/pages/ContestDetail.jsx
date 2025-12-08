import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTrophy, FaClock, FaUsers, FaDollarSign, FaArrowLeft } from 'react-icons/fa';
import { useContest } from '@/hooks/useContest';
import { useAuth } from '@/context/AuthContext';
import SmartImage from '@/components/SmartImage';
import ContestEntryModal from '@/components/contests/ContestEntryModal';
import { PageSkeleton } from '@/components/ui/Skeleton';

const ContestDetail = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Use custom hook for contest data
    const { contest, leaderboard, loading, error } = useContest(contestId);

    const [showEntryModal, setShowEntryModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);



    if (loading) {
        return <PageSkeleton />;
    }

    if (!contest) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '3rem' }}>🏆</div>
                <div>Contest not found</div>
                <button onClick={() => navigate('/search')} style={{ padding: '0.75rem 1.5rem', background: 'var(--ice-mint)', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Browse Contests
                </button>
            </div>
        );
    }

    const timeRemaining = contest.endAt.toMillis() - Date.now();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    const isActive = contest.status === 'active';
    const isClosed = contest.status === 'closed';

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '2rem', borderBottom: '2px solid #7FFFD4' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: '1px solid #333',
                        color: '#fff',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}
                >
                    <FaArrowLeft /> Back
                </button>

                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <FaTrophy style={{ fontSize: '3rem', color: '#FFD700' }} />
                        <div style={{ flex: 1 }}>
                            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem' }}>{contest.title}</h1>
                            <p style={{ margin: 0, color: '#aaa', fontSize: '1.1rem' }}>{contest.description}</p>
                        </div>
                        <div style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            background: isActive ? 'rgba(127, 255, 212, 0.1)' : isClosed ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                            color: isActive ? 'var(--ice-mint)' : isClosed ? '#ff4444' : '#888',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            {isActive ? 'ACTIVE' : isClosed ? 'CLOSED' : 'UPCOMING'}
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                        <div style={{ padding: '1rem 1.5rem', background: 'rgba(127, 255, 212, 0.1)', borderRadius: '12px', border: '1px solid var(--ice-mint)' }}>
                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.25rem' }}>Prize Pool</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--ice-mint)' }}>
                                ${contest.totalPrizePool || contest.prizePool}
                            </div>
                        </div>
                        {isActive && (
                            <div style={{ padding: '1rem 1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid #333' }}>
                                <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.25rem' }}>Time Remaining</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaClock /> {daysRemaining} days
                                </div>
                            </div>
                        )}
                        <div style={{ padding: '1rem 1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid #333' }}>
                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.25rem' }}>Entries</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaUsers /> {contest.entryCount || leaderboard.length}
                            </div>
                        </div>
                        {contest.entryType === 'paid' && (
                            <div style={{ padding: '1rem 1.5rem', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '12px', border: '1px solid #FFD700' }}>
                                <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.25rem' }}>Entry Fee</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#FFD700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaDollarSign /> {contest.entryFee}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Entry Requirements */}
            {(contest.requireOriginalContent || !contest.allowAIArt || contest.requiredTags?.length > 0) && (
                <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
                    <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0' }}>Entry Requirements</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#aaa' }}>
                            {contest.requireOriginalContent && <div>✓ Original content only (no resold posts)</div>}
                            {!contest.allowAIArt && <div>✓ No AI-generated art</div>}
                            {contest.requiredTags && contest.requiredTags.length > 0 && (
                                <div>✓ Must include tags: {contest.requiredTags.map(t => `#${t}`).join(', ')}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                    {isClosed ? '🏆 Final Results' : '📊 Current Leaderboard'}
                </h2>
                {leaderboard.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {leaderboard.map(entry => (
                            <div
                                key={entry.id}
                                onClick={() => navigate(`/post/${entry.postId}`)}
                                style={{
                                    position: 'relative',
                                    aspectRatio: '1',
                                    background: '#111',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: entry.finalRank <= 3 ? '2px solid #FFD700' : '1px solid #222'
                                }}
                            >
                                <SmartImage src={entry.imageUrl} alt={entry.title} />
                                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: entry.finalRank === 1 ? '#FFD700' : '#000', color: entry.finalRank === 1 ? '#000' : '#fff', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    #{entry.finalRank}
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.8)', padding: '0.8rem', color: '#fff' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                                        {entry.validLikeCount ?? entry.likeCount ?? 0} 😊
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{entry.userName}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
                        <p>No entries yet. Be the first to enter!</p>
                    </div>
                )}
            </div>

            {/* Entry Modal */}
            {showEntryModal && selectedPost && (
                <ContestEntryModal
                    contest={contest}
                    post={selectedPost}
                    onClose={() => {
                        setShowEntryModal(false);
                        setSelectedPost(null);
                    }}
                    onSuccess={() => {
                        // Refresh leaderboard
                        getContestLeaderboard(contestId).then(setLeaderboard);
                    }}
                />
            )}
        </div>
    );
};

export default ContestDetail;
