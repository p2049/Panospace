import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountdown } from '@/hooks/useCountdown';
import { getContestStats, getAllWinners } from '@/services/contestService';
import type { ContestStats, MonthlyWinner } from '@/core/types/contest';
import { FaTrophy, FaCrown, FaFire, FaInfoCircle, FaPlus } from 'react-icons/fa';
import SmartImage from '@/components/SmartImage';
import { useAuth } from '@/context/AuthContext';
import { getUserTier, USER_TIERS } from '@/core/services/firestore/monetization.service';
import PaywallModal from '@/components/monetization/PaywallModal';

const Contest = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [stats, setStats] = useState<ContestStats | null>(null);
    const [winners, setWinners] = useState<MonthlyWinner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaywall, setShowPaywall] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contestStats, allWinners] = await Promise.all([
                    getContestStats(),
                    getAllWinners()
                ]);
                setStats(contestStats);
                setWinners(allWinners);
            } catch (error) {
                console.error('Error loading contest data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleHostClick = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const tier = await getUserTier(currentUser.uid);
        if (tier === USER_TIERS.ULTRA || tier === USER_TIERS.PARTNER) {
            // Navigate to the unified event creator with contest type pre-selected
            navigate('/event/create?type=contest');
        } else {
            setShowPaywall(true);
        }
    };

    const monthName = new Date(2024, (stats?.currentMonth || 1) - 1).toLocaleDateString('en-US', { month: 'long' });

    // Countdown for current month
    const targetDate = stats ? new Date(stats.currentYear, stats.currentMonth, 0) : null;
    const { total } = useCountdown(targetDate);
    const daysRemaining = Math.ceil(total / (1000 * 60 * 60 * 24));

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Loading contest...
            </div>
        );
    }



    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
            {/* Hero Section */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '4rem 2rem', textAlign: 'center', borderBottom: '2px solid #7FFFD4', position: 'relative' }}>

                {/* Host Button (Top Right) */}
                <button
                    onClick={handleHostClick}
                    style={{
                        position: 'absolute',
                        top: '2rem',
                        right: '2rem',
                        background: 'rgba(255, 215, 0, 0.15)',
                        border: '1px solid #FFD700',
                        color: '#FFD700',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.3)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.15)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <FaPlus /> Host a Contest
                </button>

                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
                <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', background: 'linear-gradient(90deg, #7FFFD4, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Photo of the Month
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '600px', margin: '0 auto' }}>
                    Post your best work. Get votes. Win monthly glory.
                </p>

                {/* Countdown */}
                {stats && (
                    <div style={{ marginTop: '2rem', padding: '1rem 2rem', background: 'rgba(127, 255, 212, 0.1)', border: '1px solid #7FFFD4', borderRadius: '12px', display: 'inline-block' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#7FFFD4' }}>
                            {daysRemaining}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#888' }}>
                            days left in {monthName}
                        </div>
                    </div>
                )}
            </div>

            {/* How It Works */}
            <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 2rem' }}>
                <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '2rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                        <FaInfoCircle style={{ color: '#7FFFD4' }} /> How It Works
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#aaa' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: '#7FFFD4', color: '#000', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold' }}>1</div>
                            <div>
                                <strong style={{ color: '#fff' }}>Post your photo</strong> — Any post you create is automatically entered
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: '#7FFFD4', color: '#000', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold' }}>2</div>
                            <div>
                                <strong style={{ color: '#fff' }}>Share & get votes</strong> — Tap the smiley on posts to vote
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: '#7FFFD4', color: '#000', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold' }}>3</div>
                            <div>
                                <strong style={{ color: '#fff' }}>Win the month</strong> — Top post wins Verified Artist badge & Hall of Fame
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Leaderboard */}
            {stats && stats.topPosts.length > 0 && (
                <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaFire style={{ color: '#FF4500' }} /> Current Leaders
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {stats.topPosts.slice(0, 20).map(entry => (
                            <div
                                key={entry.postId}
                                onClick={() => navigate(`/post/${entry.postId}`)}
                                style={{
                                    position: 'relative',
                                    aspectRatio: '1',
                                    background: '#111',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: entry.rank <= 3 ? '2px solid #FFD700' : '1px solid #222'
                                }}
                            >
                                {/* @ts-ignore */}
                                <SmartImage src={entry.imageUrl} alt={entry.title} />
                                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: entry.rank === 1 ? '#FFD700' : '#000', color: entry.rank === 1 ? '#000' : '#fff', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    #{entry.rank}
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.8)', padding: '0.8rem', color: '#fff' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{entry.likeCount} 😊</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{entry.userName}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Previous Winner */}
            {stats?.previousWinner && (
                <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaCrown style={{ color: '#FFD700' }} /> Last Month's Champion
                    </h2>
                    <div
                        onClick={() => navigate(`/post/${stats.previousWinner!.postId}`)}
                        style={{
                            background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
                            border: '3px solid #FFD700',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)'
                        }}
                    >
                        <div style={{ aspectRatio: '16/9', position: 'relative' }}>
                            {/* @ts-ignore */}
                            <SmartImage src={stats.previousWinner.imageUrl} alt={stats.previousWinner.title} />
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#FFD700', color: '#000', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaTrophy /> WINNER
                            </div>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{stats.previousWinner.title}</h3>
                            <div style={{ color: '#888', marginBottom: '1rem' }}>by {stats.previousWinner.userName}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '1.2rem' }}>
                                <span>{stats.previousWinner.likeCount} 😊</span>
                                <span style={{ color: '#7FFFD4' }}>{stats.previousWinner.monthLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hall of Fame */}
            {winners.length > 0 && (
                <div style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center', background: 'linear-gradient(90deg, #7FFFD4, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        🏛️ Hall of Fame
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                        {winners.map(winner => (
                            <div
                                key={winner.id}
                                onClick={() => navigate(`/post/${winner.postId}`)}
                                style={{
                                    background: '#111',
                                    border: '2px solid #333',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#7FFFD4';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#333';
                                }}
                            >
                                <div style={{ aspectRatio: '1', position: 'relative' }}>
                                    {/* @ts-ignore */}
                                    <SmartImage src={winner.imageUrl} alt={winner.title} />
                                    <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#FFD700', color: '#000', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                        <FaTrophy />
                                    </div>
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{winner.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>by {winner.userName}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#7FFFD4', marginBottom: '0.3rem' }}>{winner.monthLabel}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{winner.likeCount} votes</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            {showPaywall && (
                <PaywallModal
                    featureName="Host Contests"
                    onClose={() => setShowPaywall(false)}
                />
            )}
        </div>
    );
};

export default Contest;
