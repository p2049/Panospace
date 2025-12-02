import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useCollection } from '../hooks/useCollections';
import { FaArrowLeft, FaUniversity, FaImage, FaUser, FaPlus, FaCheck, FaSearch } from 'react-icons/fa';
import SEO from '../components/SEO';
import GalleryCard from '../components/ui/cards/GalleryCard';
import StarBackground from '../components/StarBackground';

const MuseumView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { collection: museum, loading: museumLoading, error: museumError } = useCollection(id);

    const [galleries, setGalleries] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [contentLoading, setContentLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    const isMember = museum?.members?.includes(currentUser?.uid);
    const isOwner = museum?.ownerId === currentUser?.uid;

    useEffect(() => {
        const fetchContent = async () => {
            if (!museum) return;

            setContentLoading(true);
            try {
                // Fetch Galleries
                const galleryPromises = (museum.galleryIds || []).map(gId => getDoc(doc(db, 'galleries', gId)));
                const gallerySnaps = await Promise.all(galleryPromises);
                const fetchedGalleries = gallerySnaps
                    .filter(snap => snap.exists())
                    .map(snap => ({ id: snap.id, ...snap.data() }));
                setGalleries(fetchedGalleries);

                // Fetch Profiles
                const profilePromises = (museum.profileIds || []).map(pId => getDoc(doc(db, 'users', pId)));
                const profileSnaps = await Promise.all(profilePromises);
                const fetchedProfiles = profileSnaps
                    .filter(snap => snap.exists())
                    .map(snap => ({ id: snap.id, ...snap.data() }));
                setProfiles(fetchedProfiles);

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

                    {!isOwner && (
                        <button
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
                            <span>{galleries.length} Galleries</span>
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

                {/* Galleries */}
                {galleries.length > 0 && (
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                            <FaImage style={{ color: '#7FFFD4' }} /> Featured Galleries
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {galleries.map(gallery => (
                                <GalleryCard key={gallery.id} gallery={gallery} />
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
        </div>
    );
};

export default MuseumView;
