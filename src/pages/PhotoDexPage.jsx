import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTrophy, FaStar, FaGift, FaArrowLeft } from 'react-icons/fa';
import { PhotoDexService } from '../services/PhotoDexService';
import { PHOTODEX_SUBJECTS, PHOTODEX_TYPES } from '../constants/photoDexSubjects';
import BadgeCard from '../components/BadgeCard';

const PhotoDexPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [badges, setBadges] = useState([]);
    const [photoPoints, setPhotoPoints] = useState(0);
    const [stats, setStats] = useState({});
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        if (currentUser) {
            fetchPhotoDexData();
        }
    }, [currentUser]);

    const fetchPhotoDexData = async () => {
        setLoading(true);
        try {
            // Fetch user badges
            const userBadges = await PhotoDexService.getUserBadges(currentUser.uid);
            setBadges(userBadges);

            // Fetch photo points and stats
            const ppData = await PhotoDexService.getUserPhotoPoints(currentUser.uid);
            setPhotoPoints(ppData.photoPoints);
            setStats(ppData.stats);

            // Fetch rewards
            const userRewards = await PhotoDexService.getUserRewards(currentUser.uid);
            setRewards(userRewards);
        } catch (error) {
            console.error('Error fetching PhotoDex data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get all possible badges (unlocked + locked)
    const getAllBadges = () => {
        const unlockedKeys = new Set(badges.map(b => b.subjectKey));
        const allBadges = [];

        // Add unlocked badges
        badges.forEach(badge => {
            allBadges.push({ ...badge, isLocked: false });
        });

        // Add locked badges (subjects not yet captured)
        Object.entries(PHOTODEX_SUBJECTS).forEach(([key, subject]) => {
            if (!unlockedKeys.has(key)) {
                if (activeFilter === 'all' || activeFilter === subject.type) {
                    allBadges.push({
                        subjectKey: key,
                        subjectName: subject.name,
                        type: subject.type,
                        rarityScore: subject.rarity,
                        isLocked: true
                    });
                }
            }
        });

        return allBadges;
    };

    const filteredBadges = getAllBadges().filter(badge => {
        if (activeFilter === 'all') return true;
        return badge.type === activeFilter;
    });

    const filters = [
        { id: 'all', label: 'All', icon: FaTrophy },
        { id: PHOTODEX_TYPES.ANIMAL, label: 'Animals', icon: '🦌' },
        { id: PHOTODEX_TYPES.BIRD, label: 'Birds', icon: '🦅' },
        { id: PHOTODEX_TYPES.PARK, label: 'Parks', icon: '🏞️' },
        { id: PHOTODEX_TYPES.CELESTIAL, label: 'Celestial', icon: '✨' },
        { id: PHOTODEX_TYPES.PLANT, label: 'Plants', icon: '🌸' },
        { id: PHOTODEX_TYPES.LANDSCAPE, label: 'Landscapes', icon: '🏔️' }
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--black)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Loading PhotoDex...
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--black)', color: '#fff', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        marginBottom: '1rem'
                    }}
                >
                    <FaArrowLeft />
                </button>

                <h1 style={{ margin: '0 0 1rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaTrophy color="#FFD700" /> PhotoDex
                </h1>

                {/* Photo Points Display */}
                <div style={{
                    background: 'linear-gradient(135deg, #7FFFD4 0%, #00CED1 100%)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1rem'
                }}>
                    <div style={{ fontSize: '0.9rem', color: '#000', marginBottom: '0.5rem' }}>Total Photo Points</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#000' }}>{photoPoints.toLocaleString()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#000', marginTop: '0.5rem' }}>
                        {stats.totalBadges || 0} / {Object.keys(PHOTODEX_SUBJECTS).length} Badges Collected
                    </div>
                </div>

                {/* Rewards */}
                {rewards.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaGift /> Rewards
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {rewards.filter(r => !r.claimedAt).map(reward => (
                                <div
                                    key={reward.id}
                                    style={{
                                        background: '#222',
                                        border: '1px solid #7FFFD4',
                                        borderRadius: '8px',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.8rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <span>{reward.icon}</span>
                                    <span>{reward.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid #333',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                display: 'flex',
                gap: '0.5rem'
            }}>
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: activeFilter === filter.id ? '#7FFFD4' : '#222',
                            color: activeFilter === filter.id ? '#000' : '#fff',
                            border: activeFilter === filter.id ? 'none' : '1px solid #333',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: activeFilter === filter.id ? 'bold' : 'normal',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        {typeof filter.icon === 'string' ? filter.icon : <filter.icon />}
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Badge Grid */}
            <div style={{ padding: '1rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '1rem'
                }}>
                    {filteredBadges.map((badge, index) => (
                        <BadgeCard
                            key={badge.id || `locked-${badge.subjectKey}-${index}`}
                            badge={badge}
                            isLocked={badge.isLocked}
                        />
                    ))}
                </div>

                {filteredBadges.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                        <FaStar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <div>No badges in this category yet</div>
                        <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Start posting to collect badges!
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoDexPage;
