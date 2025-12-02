import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaArrowLeft, FaMapMarkerAlt, FaCalendar, FaImage, FaUser } from 'react-icons/fa';
import GridPostCard from '../components/GridPostCard';

const MuseumPage = () => {
    const { museumId } = useParams();
    const navigate = useNavigate();
    const [museum, setMuseum] = useState(null);
    const [galleries, setGalleries] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMuseum();
    }, [museumId]);

    const loadMuseum = async () => {
        try {
            // Try fetching from collections first (new standard)
            let museumDoc = await getDoc(doc(db, 'collections', museumId));

            // Fallback to museums collection if not found (legacy/partner support)
            if (!museumDoc.exists()) {
                museumDoc = await getDoc(doc(db, 'museums', museumId));
            }

            if (museumDoc.exists()) {
                const data = museumDoc.data();
                setMuseum({ id: museumDoc.id, ...data });

                // Fetch referenced galleries
                if (data.galleryIds && data.galleryIds.length > 0) {
                    const galleryPromises = data.galleryIds.map(id =>
                        getDoc(doc(db, 'collections', id))
                    );
                    const galleryDocs = await Promise.all(galleryPromises);
                    const fetchedGalleries = galleryDocs
                        .filter(d => d.exists())
                        .map(d => ({ id: d.id, ...d.data() }));
                    setGalleries(fetchedGalleries);
                } else if (data.galleries && Array.isArray(data.galleries)) {
                    // Handle legacy structure where galleries might be embedded
                    setGalleries(data.galleries);
                }

                // Fetch referenced profiles
                if (data.profileIds && data.profileIds.length > 0) {
                    const profilePromises = data.profileIds.map(id =>
                        getDoc(doc(db, 'users', id))
                    );
                    const profileDocs = await Promise.all(profilePromises);
                    const fetchedProfiles = profileDocs
                        .filter(d => d.exists())
                        .map(d => ({ id: d.id, ...d.data() }));
                    setProfiles(fetchedProfiles);
                }
            }
        } catch (error) {
            console.error('Error loading museum:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>
                Loading museum...
            </div>
        );
    }

    if (!museum) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>
                Museum not found
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#000', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        color: '#fff',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <FaArrowLeft />
                </button>

                {museum.coverImage || museum.bannerImage ? (
                    <div style={{
                        height: '300px',
                        background: `url(${museum.coverImage || museum.bannerImage}) center/cover`,
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                            padding: '3rem 2rem 2rem'
                        }}>
                            <h1 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
                                {museum.title || museum.name}
                            </h1>
                            <div style={{ color: '#888', fontSize: '0.9rem' }}>
                                {museum.description}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        padding: '3rem 2rem 2rem',
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end'
                    }}>
                        <h1 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
                            {museum.title || museum.name}
                        </h1>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>
                            {museum.description}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="container-md">

                {/* Galleries Section */}
                {galleries.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaImage style={{ color: '#7FFFD4' }} />
                            Galleries
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {galleries.map((gallery) => (
                                <div
                                    key={gallery.id}
                                    style={{
                                        background: '#1a1a1a',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '1px solid #333',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s'
                                    }}
                                    onClick={() => navigate(`/collection/${gallery.id}`)}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ height: '180px', background: '#222', position: 'relative' }}>
                                        {gallery.coverImage ? (
                                            <img src={gallery.coverImage} alt={gallery.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                                                <FaImage size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '1rem' }}>
                                        <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                                            {gallery.title || gallery.name}
                                        </h3 >
                                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {gallery.description || 'No description'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Profiles Section */}
                {profiles.length > 0 && (
                    <div>
                        <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaUser style={{ color: '#7FFFD4' }} />
                            Curators & Artists
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1rem'
                        }}>
                            {profiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    style={{
                                        background: '#1a1a1a',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        border: '1px solid #333',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        transition: 'background 0.2s'
                                    }}
                                    onClick={() => navigate(`/profile/${profile.id}`)}
                                    onMouseEnter={e => e.currentTarget.style.background = '#222'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
                                >
                                    <img
                                        src={profile.photoURL || 'https://via.placeholder.com/50'}
                                        alt={profile.displayName}
                                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ color: '#fff', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {profile.displayName}
                                        </div>
                                        <div style={{ color: '#666', fontSize: '0.8rem' }}>
                                            @{profile.username || 'user'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {galleries.length === 0 && profiles.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666', border: '1px dashed #333', borderRadius: '12px' }}>
                        <FaUniversity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>This museum is empty</h3>
                        <p>No galleries or profiles have been added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MuseumPage;
