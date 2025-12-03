import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCamera, FaSave, FaCheck, FaInfoCircle, FaLock } from 'react-icons/fa';
import { ART_DISCIPLINES } from '../constants/artDisciplines';
import { PROFILE_GRADIENTS, getGradientBackground, getCurrentGradientId, getUnlockedGradients } from '../constants/gradients';
import DisciplineSelector from '../components/DisciplineSelector';

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

    // Profile Theme State
    const [selectedGradient, setSelectedGradient] = useState('green-default');
    const [unlockedGradients, setUnlockedGradients] = useState(['green-default']);
    const [starColor, setStarColor] = useState('#7FFFD4'); // Default ice-mint

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

                    // Load profile theme
                    if (data.profileTheme) {
                        setSelectedGradient(data.profileTheme.gradientId || 'green-default');
                        setUnlockedGradients(data.profileTheme.unlockedGradients || ['green-default']);
                        setStarColor(data.profileTheme.starColor || '#7FFFD4');
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
                profileTheme: {
                    gradientId: selectedGradient,
                    unlockedGradients: unlockedGradients,
                    starColor: starColor
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
                    <DisciplineSelector
                        selectedMain={selectedMain}
                        selectedNiches={selectedNiches}
                        expandedDiscipline={expandedDiscipline}
                        setExpandedDiscipline={setExpandedDiscipline}
                        toggleMainDiscipline={toggleMainDiscipline}
                        toggleNiche={toggleNiche}
                    />

                    {/* Profile Theme Section */}
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>Profile Theme</label>
                            <FaInfoCircle size={14} color="#888" title="Unlock more gradients through achievements" />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                            Customize your profile with different gradient backgrounds.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                            {Object.values(PROFILE_GRADIENTS).map(gradient => {
                                const isUnlocked = unlockedGradients.includes(gradient.id);
                                const isSelected = selectedGradient === gradient.id;

                                return (
                                    <button
                                        key={gradient.id}
                                        type="button"
                                        onClick={() => isUnlocked && setSelectedGradient(gradient.id)}
                                        disabled={!isUnlocked}
                                        style={{
                                            padding: '0',
                                            border: isSelected ? '2px solid var(--ice-mint)' : '2px solid #333',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            cursor: isUnlocked ? 'pointer' : 'not-allowed',
                                            opacity: isUnlocked ? 1 : 0.4,
                                            position: 'relative',
                                            background: 'transparent'
                                        }}
                                    >
                                        <div style={{
                                            height: '80px',
                                            background: gradient.background,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}>
                                            {!isUnlocked && (
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'rgba(0,0,0,0.7)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <FaLock color="#666" size={20} />
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: 'var(--ice-mint)',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <FaCheck color="#000" size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{
                                            padding: '0.5rem',
                                            background: '#111',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: isUnlocked ? '#fff' : '#666' }}>
                                                {gradient.name}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '2px' }}>
                                                {gradient.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Star Color Customization */}
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>Profile Banner Star Color</label>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                            Customize the color of the animated stars on your profile banner.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
                            {[
                                { name: 'Ice Mint', color: '#7FFFD4' },
                                { name: 'Purple', color: '#9D4EDD' },
                                { name: 'Blue', color: '#4CC9F0' },
                                { name: 'Pink', color: '#FF006E' },
                                { name: 'Gold', color: '#FFD60A' },
                                { name: 'Orange', color: '#FF9E00' },
                                { name: 'Red', color: '#FF4D4D' },
                                { name: 'Green', color: '#06FFA5' },
                                { name: 'Cyan', color: '#00F5FF' },
                                { name: 'White', color: '#FFFFFF' }
                            ].map(option => (
                                <button
                                    key={option.color}
                                    type="button"
                                    onClick={() => setStarColor(option.color)}
                                    style={{
                                        padding: '0',
                                        border: starColor === option.color ? '3px solid var(--ice-mint)' : '2px solid #333',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        background: 'transparent',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{
                                        height: '60px',
                                        background: '#000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Preview stars */}
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    position: 'absolute',
                                                    width: '2px',
                                                    height: '2px',
                                                    background: option.color,
                                                    borderRadius: '50%',
                                                    top: `${20 + i * 15}%`,
                                                    left: `${15 + i * 15}%`,
                                                    boxShadow: `0 0 3px ${option.color}`
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div style={{
                                        padding: '0.4rem',
                                        background: '#111',
                                        textAlign: 'center',
                                        fontSize: '0.75rem',
                                        color: starColor === option.color ? '#fff' : '#888',
                                        fontWeight: starColor === option.color ? '600' : '400'
                                    }}>
                                        {option.name}
                                    </div>
                                </button>
                            ))}
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
