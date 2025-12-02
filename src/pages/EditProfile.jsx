import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCamera, FaSave, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { ART_DISCIPLINES } from '../constants/artDisciplines';

const EditProfile = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [bio, setBio] = useState('');
    const [profileBgColor, setProfileBgColor] = useState('#000000');
    const [preview, setPreview] = useState(currentUser?.photoURL || '');

    // New Discipline State
    const [selectedMain, setSelectedMain] = useState([]); // Array of strings
    const [selectedNiches, setSelectedNiches] = useState({}); // Object: { "Photography": ["Landscape"] }
    const [expandedDiscipline, setExpandedDiscipline] = useState(null); // For UI accordion

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setBio(data.bio || '');
                    setProfileBgColor(data.profileBgColor || '#000000');

                    // Load disciplines if they exist
                    if (data.disciplines) {
                        setSelectedMain(data.disciplines.main || []);
                        setSelectedNiches(data.disciplines.niches || {});
                    }
                }
            }
        };
        fetchUserData();
    }, [currentUser]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            setSelectedFile(file);
        }
    };

    // Discipline Logic
    const toggleMainDiscipline = (discipline) => {
        if (selectedMain.includes(discipline)) {
            // Remove
            setSelectedMain(prev => prev.filter(d => d !== discipline));
            // Also remove associated niches
            const newNiches = { ...selectedNiches };
            delete newNiches[discipline];
            setSelectedNiches(newNiches);
            if (expandedDiscipline === discipline) setExpandedDiscipline(null);
        } else {
            // Add (Limit 3)
            if (selectedMain.length >= 3) {
                alert("You can select up to 3 main disciplines.");
                return;
            }
            setSelectedMain(prev => [...prev, discipline]);
            setExpandedDiscipline(discipline); // Auto-expand to show niches
        }
    };

    const toggleNiche = (discipline, niche) => {
        // Calculate total niches count
        const currentTotalNiches = Object.values(selectedNiches).flat().length;
        const isSelected = selectedNiches[discipline]?.includes(niche);

        if (isSelected) {
            // Remove
            setSelectedNiches(prev => ({
                ...prev,
                [discipline]: prev[discipline].filter(n => n !== niche)
            }));
        } else {
            // Add (Limit 5 total)
            if (currentTotalNiches >= 5) {
                alert("You can select up to 5 sub-niches total.");
                return;
            }
            setSelectedNiches(prev => ({
                ...prev,
                [discipline]: [...(prev[discipline] || []), niche]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let newPhotoURL = currentUser.photoURL;

            if (selectedFile) {
                const file = selectedFile;
                const storageRef = ref(storage, `profile_photos/${currentUser.uid}/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                newPhotoURL = await getDownloadURL(storageRef);
            }

            // Update Auth Profile
            await updateProfile(currentUser, {
                displayName,
                photoURL: newPhotoURL
            });

            // Update Firestore Document
            await setDoc(doc(db, 'users', currentUser.uid), {
                displayName,
                photoURL: newPhotoURL,
                bio,
                profileBgColor,
                disciplines: {
                    main: selectedMain,
                    niches: selectedNiches
                },
                email: currentUser.email,
                updatedAt: new Date()
            }, { merge: true });

            navigate('/profile/me');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(20, 20, 20, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <button onClick={() => navigate('/profile/me')} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>
                    <FaArrowLeft />
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '500' }}>Edit Profile</h1>
            </div>

            <div style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Photo Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid #333',
                            background: '#111'
                        }}>
                            {preview ? (
                                <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>No Photo</div>
                            )}
                        </div>
                        <label style={{ cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem', background: '#333', borderRadius: '20px' }}>
                            <FaCamera /> Change Photo
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                    </div>

                    {/* Basic Info */}
                    <div className="form-group">
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1rem', minHeight: '80px', resize: 'vertical' }}
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    {/* Discipline Selection */}
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>Art Disciplines</label>
                            <span style={{ fontSize: '0.8rem', color: selectedMain.length >= 3 ? '#ff4444' : '#888' }}>
                                {selectedMain.length}/3 Main
                            </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                            Select up to 3 main disciplines. Tap one to reveal sub-niches.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {Object.keys(ART_DISCIPLINES).map(discipline => {
                                const isSelected = selectedMain.includes(discipline);
                                const isExpanded = expandedDiscipline === discipline;
                                const nicheCount = selectedNiches[discipline]?.length || 0;

                                return (
                                    <div key={discipline} style={{
                                        background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        borderRadius: '12px',
                                        border: isSelected ? '1px solid #444' : '1px solid transparent',
                                        overflow: 'hidden'
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!isSelected) toggleMainDiscipline(discipline);
                                                else setExpandedDiscipline(isExpanded ? null : discipline);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: isSelected ? '#222' : '#111',
                                                border: 'none',
                                                color: isSelected ? '#fff' : '#aaa',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontSize: '0.95rem',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {isSelected && <FaCheck size={12} color="#4CAF50" />}
                                                {discipline}
                                            </div>
                                            {isSelected && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {nicheCount > 0 && (
                                                        <span style={{ fontSize: '0.75rem', background: '#333', padding: '2px 6px', borderRadius: '10px' }}>
                                                            {nicheCount} niches
                                                        </span>
                                                    )}
                                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                                        {isExpanded ? '▼' : '▶'}
                                                    </span>
                                                </div>
                                            )}
                                        </button>

                                        {/* Sub-niches Accordion */}
                                        {isExpanded && isSelected && (
                                            <div style={{ padding: '1rem', borderTop: '1px solid #333', background: '#1a1a1a' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>Select specific niches</span>
                                                    <span style={{ fontSize: '0.8rem', color: Object.values(selectedNiches).flat().length >= 5 ? '#ff4444' : '#888' }}>
                                                        {Object.values(selectedNiches).flat().length}/5 Total
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {ART_DISCIPLINES[discipline].map(niche => {
                                                        const isNicheSelected = selectedNiches[discipline]?.includes(niche);
                                                        return (
                                                            <button
                                                                key={niche}
                                                                type="button"
                                                                onClick={() => toggleNiche(discipline, niche)}
                                                                style={{
                                                                    padding: '0.4rem 0.8rem',
                                                                    fontSize: '0.8rem',
                                                                    borderRadius: '20px',
                                                                    border: isNicheSelected ? '1px solid #fff' : '1px solid #444',
                                                                    background: isNicheSelected ? '#fff' : 'transparent',
                                                                    color: isNicheSelected ? '#000' : '#ccc',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {niche}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '1rem',
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '30px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginTop: '1rem',
                            opacity: loading ? 0.7 : 1,
                            position: 'sticky',
                            bottom: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                    >
                        {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
