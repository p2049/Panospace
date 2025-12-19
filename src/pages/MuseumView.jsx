import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, increment, collection, query, orderBy, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { useCollection } from '@/hooks/useCollections';
import { FaArrowLeft, FaUniversity, FaImage, FaUser, FaPlus, FaCheck, FaSearch, FaQuestionCircle } from 'react-icons/fa';
import SEO from '@/components/SEO';
import StudioCard from '@/components/ui/cards/StudioCard';
import Walkthrough from '@/components/common/Walkthrough';
import StarBackground from '@/components/StarBackground';
import CreateExhibitModal from '@/components/museums/CreateExhibitModal';
import { FaClock } from 'react-icons/fa';

const MuseumView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { collection: museum, loading: museumLoading, error: museumError } = useCollection(id);

    const [studios, setStudios] = useState([]);
    const [exhibits, setExhibits] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [contentLoading, setContentLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [showCreateExhibitModal, setShowCreateExhibitModal] = useState(false);
    const [showWalkthrough, setShowWalkthrough] = useState(false);

    const walkthroughSteps = [
        {
            title: "Museums",
            description: "Museums curate multiple Studios and/or Collections into one public hub. Use Museums to organize big bodies of work, collaborations, or themed worlds."
        },
        {
            title: "Join Museum",
            description: "Join the museum to show your support and get updates on new exhibits.",
            targetSelector: "#museum-join-btn"
        },
        {
            title: "Add Exhibit",
            description: "Add exhibits or featured content to your museum.",
            targetSelector: "#museum-add-exhibit-btn"
        }
    ];

    const isMember = museum?.members?.includes(currentUser?.uid);
    const isOwner = museum?.ownerId === currentUser?.uid;

    useEffect(() => {
        const fetchContent = async () => {
            if (!museum) return;

            setContentLoading(true);
            try {
                // Fetch Studios
                const studioPromises = (museum.galleryIds || []).map(gId => getDoc(doc(db, 'galleries', gId)));
                const studioSnaps = await Promise.all(studioPromises);
                const fetchedStudios = studioSnaps
                    .filter(snap => snap.exists())
                    .map(snap => ({ id: snap.id, ...snap.data() }));
                setStudios(fetchedStudios);

                // Fetch Profiles
                const profilePromises = (museum.profileIds || []).map(pId => getDoc(doc(db, 'users', pId)));
                const profileSnaps = await Promise.all(profilePromises);
                const fetchedProfiles = profileSnaps
                    .filter(snap => snap.exists())
                    .map(snap => ({ id: snap.id, ...snap.data() }));
                setStudios(fetchedStudios);

                // Fetch Exhibits
                const exhibitsRef = collection(db, 'museums', id, 'exhibits');
                const q = query(exhibitsRef, orderBy('createdAt', 'desc'));
                const exhibitsSnap = await getDocs(q);
                const now = new Date();
                const fetchedExhibits = exhibitsSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(exhibit => exhibit.expiresAt?.toDate() > now);
                setExhibits(fetchedExhibits);

                // Fetch Profiles

            } catch (err) {
                console.error("Error fetching museum content:", err);
            } finally {
                setContentLoading(false);
            }
        };

        if (museum) {
            fetchContent();
        }
    }, [museum]);

    const handleJoinMuseum = async () => {
        if (!currentUser || !museum || isMember || joining) return;

        try {
            setJoining(true);
            const museumRef = doc(db, 'museums', id);

            await updateDoc(museumRef, {
                members: arrayUnion(currentUser.uid),
                memberCount: increment(1)
            });

            // Optional: Update user's joinedMuseums if you want to track it on user profile
            // const userRef = doc(db, 'users', currentUser.uid);
            // await updateDoc(userRef, {
            //     joinedMuseums: arrayUnion(id)
            // });

            alert('Successfully joined the museum!');
        } catch (err) {
            console.error('Error joining museum:', err);
            alert('Failed to join museum');
        } finally {
            setJoining(false);
        }
    };

    if (museumLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading Museum...</div>;
    if (museumError || !museum) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Museum not found</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '4rem' }}>
            <SEO title={museum.title} description={museum.description} />

            {/* Hero Section */}
            <div style={{ position: 'relative', height: '40vh', minHeight: '300px' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    {museum.coverImage ? (
                        <img src={museum.coverImage} alt={museum.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <StarBackground />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), #000)' }} />
                </div>

                <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                        <FaArrowLeft />
                    </button>
                </div>

                {/* Header Actions */}
                <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => navigate(`/search?museumId=${id}`)}
                        style={{
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backdropFilter: 'blur(4px)',
                            transition: 'all 0.2s',
                            fontWeight: '500'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                    >
                        <FaSearch /> <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'inline' } }}>Search</span>
                    </button>

                    <button
                        className="help-icon-btn"
                        onClick={() => setShowWalkthrough(true)}
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', width: '40px', height: '40px' }}
                        title="Show tutorial"
                    >
                        <FaQuestionCircle />
                    </button>

                    {!isOwner && (
                        <button
                            id="museum-join-btn"
                            onClick={handleJoinMuseum}
                            disabled={isMember || joining}
                            style={{
                                background: isMember ? 'rgba(127, 255, 212, 0.2)' : '#7FFFD4',
                                color: isMember ? '#7FFFD4' : '#000',
                                border: isMember ? '1px solid #7FFFD4' : 'none',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                cursor: isMember ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backdropFilter: 'blur(4px)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isMember ? <FaCheck /> : <FaPlus />}
                            {isMember ? 'Member' : joining ? 'Joining...' : 'Join Museum'}
                        </button>
                    )}

                    {isOwner && (
                        <button
                            id="museum-add-exhibit-btn"
                            onClick={() => setShowCreateExhibitModal(true)}
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
                                gap: '0.5rem',
                                backdropFilter: 'blur(4px)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FaPlus /> Add Exhibit
                        </button>
                    )}
                </div>

                <div className="container-md" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', color: '#7FFFD4' }}>
                        <FaUniversity size={24} />
                        <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.9rem' }}>Museum</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0 0 1rem 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{museum.title}</h1>
                    <p style={{ fontSize: '1.1rem', color: '#ccc', maxWidth: '600px', lineHeight: '1.6' }}>{museum.description}</p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                            <FaImage style={{ color: '#7FFFD4' }} />
                            <span>{studios.length} Studios</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                            <FaUser style={{ color: '#7FFFD4' }} />
                            <span>{museum.memberCount || profiles.length} Members</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container-md" style={{ padding: '2rem 1rem' }}>

                {/* Exhibits */}
                {exhibits.length > 0 && (
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                            <FaClock style={{ color: '#7FFFD4' }} /> Current Exhibits
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {exhibits.map(exhibit => (
                                <div key={exhibit.id} style={{
                                    background: '#111',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #222'
                                }}>
                                    <div style={{ aspectRatio: '16/9', position: 'relative' }}>
                                        <img src={exhibit.imageUrl} alt={exhibit.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '0.5rem',
                                            right: '0.5rem',
                                            background: 'rgba(0,0,0,0.7)',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            color: '#7FFFD4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}>
                                            <FaClock size={10} />
                                            {Math.ceil((exhibit.expiresAt?.toDate() - new Date()) / (1000 * 60 * 60))}h left
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem' }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{exhibit.title}</h3>
                                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem', lineHeight: '1.5' }}>{exhibit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Studios */}
                {studios.length > 0 && (
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                            <FaImage style={{ color: '#7FFFD4' }} /> Featured Studios
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {studios.map(studio => (
                                <StudioCard key={studio.id} studio={studio} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Profiles */}
                {profiles.length > 0 && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                            <FaUser style={{ color: '#7FFFD4' }} /> Curators & Artists
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            {profiles.map(profile => (
                                <div
                                    key={profile.id}
                                    onClick={() => navigate(`/profile/${profile.id}`)}
                                    style={{
                                        background: '#111',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        border: '1px solid #222',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.borderColor = '#7FFFD4';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = '#222';
                                    }}
                                >
                                    <img
                                        src={profile.photoURL || 'https://via.placeholder.com/100'}
                                        alt={profile.displayName}
                                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '2px solid #333' }}
                                    />
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{profile.displayName}</h3>
                                    <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>@{profile.username || 'user'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {galleries.length === 0 && profiles.length === 0 && !contentLoading && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                        <FaUniversity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>This museum is currently empty.</p>
                    </div>
                )}
            </div>

            <CreateExhibitModal
                isOpen={showCreateExhibitModal}
                onClose={(shouldRefresh) => {
                    setShowCreateExhibitModal(false);
                    if (shouldRefresh) {
                        // Trigger refresh logic (e.g. by forcing re-mount or refetching)
                        // For simplicity, we can reload the page or add a refetch function to useEffect dependency
                        window.location.reload();
                    }
                }}
                museumId={id}
            />

            <Walkthrough
                steps={walkthroughSteps}
                onboardingKey="museums"
                forceShow={showWalkthrough}
                onClose={() => setShowWalkthrough(false)}
            />
        </div>
    );
};

export default MuseumView;
