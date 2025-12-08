import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCamera, FaSave, FaCheck, FaInfoCircle, FaLock } from 'react-icons/fa';
import { ART_DISCIPLINES } from '@/core/constants/artDisciplines';
import { PROFILE_GRADIENTS, getGradientBackground, getCurrentGradientId, getUnlockedGradients } from '@/core/constants/gradients';
import { ALL_COLORS } from '@/core/constants/colorPacks';
import DisciplineSelector from '@/components/DisciplineSelector';
import { generateUserSearchKeywords } from '@/core/utils/searchKeywords';
import { sanitizeDisplayName, sanitizeBio } from '@/core/utils/sanitize';
import ImageCropper from '@/components/ImageCropper';

const EditProfile = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    // Mock Premium Status check - In real app, check user subscription status
    const isPremiumUser = currentUser?.isPremium || false;

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
    const [selectedGradient, setSelectedGradient] = useState('aurora-horizon');
    const [unlockedGradients, setUnlockedGradients] = useState(['aurora-horizon']);
    const [starColor, setStarColor] = useState('#7FFFD4'); // Default ice-mint
    const [profileBorderColor, setProfileBorderColor] = useState('#7FFFD4');
    const [usernameColor, setUsernameColor] = useState('#FFFFFF'); // Default white
    const [bannerMode, setBannerMode] = useState('stars'); // 'stars' or 'gradient'
    const [useStarsOverlay, setUseStarsOverlay] = useState(false);
    const [textGlow, setTextGlow] = useState(false);

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
                        setSelectedGradient(data.profileTheme.gradientId || 'aurora-horizon');
                        setUnlockedGradients(data.profileTheme.unlockedGradients || ['aurora-horizon']);
                        setStarColor(data.profileTheme.starColor || '#7FFFD4');
                        setProfileBorderColor(data.profileTheme.borderColor || '#7FFFD4');
                        setUsernameColor(data.profileTheme.usernameColor || '#FFFFFF');
                        setBannerMode(data.profileTheme.bannerMode || 'stars');
                        setUseStarsOverlay(data.profileTheme.useStarsOverlay || false);
                        setTextGlow(data.profileTheme.textGlow || false);
                    }
                }
            }
        };
        fetchUserData();
    }, [currentUser]);

    const [showCropper, setShowCropper] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImageSrc(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        e.target.value = '';
    };

    const handleCropComplete = (blob) => {
        const croppedUrl = URL.createObjectURL(blob);
        setPreview(croppedUrl);

        // Convert blob to file for upload
        const file = new File([blob], "profile_photo.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setShowCropper(false);
        setTempImageSrc(null);
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
            // Add (no limit)
            setSelectedMain(prev => [...prev, discipline]);
            setExpandedDiscipline(discipline); // Auto-expand to show niches
        }
    };

    const toggleNiche = (discipline, niche) => {
        const isSelected = selectedNiches[discipline]?.includes(niche);

        if (isSelected) {
            // Remove
            setSelectedNiches(prev => ({
                ...prev,
                [discipline]: prev[discipline].filter(n => n !== niche)
            }));
        } else {
            // Add (no limit)
            setSelectedNiches(prev => ({
                ...prev,
                [discipline]: [...(prev[discipline] || []), niche]
            }));
        }
    };

    const [selectedFile, setSelectedFile] = useState(null);

    // Helper: Generate Bio Color based on Username Color
    const generateBioColor = (hexColor) => {
        // Default check
        if (!hexColor || hexColor === '#FFFFFF' || hexColor.toLowerCase() === '#fff') {
            return 'rgba(255, 255, 255, 0.7)'; // Standard soft white
        }

        // If gradient, we can't easily parse. Return standard white/gray for readability or take primary logic.
        // For UI simplicity if gradient string is passed, we fallback to our generic nice gray.
        if (hexColor.includes('gradient') || hexColor.includes('var')) {
            return 'rgba(255, 255, 255, 0.75)';
        }

        // Basic Hex Parsing
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexColor)) {
            c = hexColor.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');

            const r = (c >> 16) & 255;
            const g = (c >> 8) & 255;
            const b = c & 255;

            // Calculate Luma (Approx brightness)
            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            // Logic:
            // If Bright (> 200) -> Darken slightly? No, on black bg we want it bright still, but dimmer than username.
            // Actually, for a black background:
            // High brightness color -> reduce opacity significantly (0.7) or brightness (keep Hue).
            // Low brightness color (Dark Blue) -> It will be invisible on black. We need to Lighten it.

            if (luma < 60) {
                // Too dark for black background. Lighten it.
                // Simple approach: mix with white
                const mix = (c1, c2, w) => c1 + (c2 - c1) * w;
                const r2 = Math.round(mix(r, 255, 0.4));
                const g2 = Math.round(mix(g, 255, 0.4));
                const b2 = Math.round(mix(b, 255, 0.4));
                return `rgba(${r2}, ${g2}, ${b2}, 0.8)`;
            } else {
                // Bright enough. Just lower opacity to create hierarchy.
                return `rgba(${r}, ${g}, ${b}, 0.65)`;
            }
        }
        return 'rgba(255, 255, 255, 0.7)';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Starting profile save...");

        if (!currentUser) {
            console.error("No current user found.");
            return;
        }

        setLoading(true);

        try {
            let newPhotoURL = currentUser.photoURL;

            // 1. Handle Image Upload
            if (selectedFile) {
                console.log("Uploading file...", selectedFile.name);
                const storageRef = ref(storage, `profile_photos/${currentUser.uid}/${Date.now()}_${selectedFile.name}`);
                await uploadBytes(storageRef, selectedFile);
                newPhotoURL = await getDownloadURL(storageRef);
                console.log("File uploaded, URL:", newPhotoURL);
            }

            // 2. Sanitation
            const sanitizedDisplayName = sanitizeDisplayName(displayName);
            const sanitizedBio = sanitizeBio(bio);

            // 3. Auth Update
            console.log("Updating Auth profile...");
            await updateProfile(currentUser, {
                displayName: sanitizedDisplayName,
                photoURL: newPhotoURL
            });

            // 4. Firestore Update
            console.log("Updating Firestore...");

            // Auto-generate bio color
            const autoBioColor = generateBioColor(usernameColor);

            // Construct the update object carefully to avoid undefined values
            const userUpdate = {
                displayName: sanitizedDisplayName,
                photoURL: newPhotoURL,
                bio: sanitizedBio,
                profileBgColor: profileBgColor || '#000000',
                email: currentUser.email,
                updatedAt: new Date(),

                // Nested Objects - ensure they are complete
                disciplines: {
                    main: selectedMain || [],
                    niches: selectedNiches || {}
                },
                profileTheme: {
                    gradientId: selectedGradient || 'aurora-horizon',
                    unlockedGradients: unlockedGradients || ['aurora-horizon'],
                    starColor: starColor || '#7FFFD4',
                    borderColor: profileBorderColor || '#7FFFD4',
                    usernameColor: usernameColor || '#FFFFFF',
                    bioColor: autoBioColor,
                    bannerMode: bannerMode,
                    useStarsOverlay: useStarsOverlay,
                    textGlow: textGlow
                }
            };

            // Add search keywords
            userUpdate.searchKeywords = generateUserSearchKeywords({
                displayName: sanitizedDisplayName,
                email: currentUser.email,
                bio: sanitizedBio,
                artTypes: selectedMain || []
            });

            await setDoc(doc(db, 'users', currentUser.uid), userUpdate, { merge: true });
            console.log("Firestore updated.");

            navigate('/profile/me');
        } catch (error) {
            console.error("Save failed:", error);
            alert("Could not save profile: " + error.message);
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
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <button onClick={() => navigate('/profile/me')} style={{ background: 'transparent', border: 'none', color: '#7FFFD4', cursor: 'pointer', fontSize: '1.2rem' }}>
                    <FaArrowLeft />
                </button>
                <h1 style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: '#7FFFD4',
                    fontFamily: 'var(--font-family-heading)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    margin: 0
                }}>Edit Profile</h1>
            </div>

            <div style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Photo Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: `3px solid ${profileBorderColor}`,
                            background: '#111',
                            boxShadow: `0 0 20px ${profileBorderColor}40`
                        }}>
                            {preview ? (
                                <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>No Photo</div>
                            )}
                        </div>
                        <label style={{
                            cursor: 'pointer',
                            color: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            padding: '0.6rem 1.2rem',
                            background: '#7FFFD4',
                            borderRadius: '20px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            border: 'none'
                        }}>
                            <FaCamera /> Change Photo
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                    </div>

                    {/* Profile Picture Border Color Customization (Scrollable) */}
                    <div className="form-group" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                        <label style={{ display: 'block', color: '#7FFFD4', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center' }}>Profile Border</label>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            overflowX: 'auto',
                            padding: '0.5rem',
                            scrollBehavior: 'smooth',
                            justifyContent: 'flex-start',
                            maskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
                        }}>
                            {ALL_COLORS.map(option => {
                                const isPremiumLocked = option.isPremium && !isPremiumUser;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => !isPremiumLocked && setProfileBorderColor(option.color)}
                                        style={{
                                            flex: '0 0 auto',
                                            padding: '0',
                                            border: profileBorderColor === option.color ? '3px solid #fff' : '2px solid #333',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            overflow: 'hidden',
                                            cursor: isPremiumLocked ? 'not-allowed' : 'pointer',
                                            background: option.color,
                                            position: 'relative',
                                            boxShadow: profileBorderColor === option.color ? `0 0 10px ${option.color.includes('gradient') ? '#fff' : option.color}` : 'none',
                                            opacity: isPremiumLocked ? 0.6 : 1
                                        }}
                                        title={option.name}
                                    >
                                        {/* Lock Overlay */}
                                        {isPremiumLocked && (
                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FaLock size={12} color="#fff" />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="form-group">
                        <label style={{ display: 'block', color: '#7FFFD4', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: 'rgba(127, 255, 212, 0.05)',
                                border: '1px solid rgba(127, 255, 212, 0.2)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#7FFFD4';
                                e.target.style.background = 'rgba(127, 255, 212, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(127, 255, 212, 0.2)';
                                e.target.style.background = 'rgba(127, 255, 212, 0.05)';
                            }}
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', color: '#7FFFD4', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: 'rgba(127, 255, 212, 0.05)',
                                border: '1px solid rgba(127, 255, 212, 0.2)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                minHeight: '80px',
                                resize: 'vertical',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#7FFFD4';
                                e.target.style.background = 'rgba(127, 255, 212, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(127, 255, 212, 0.2)';
                                e.target.style.background = 'rgba(127, 255, 212, 0.05)';
                            }}
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

                    {/* Profile Theme (Username Color) - Slider Box */}
                    <div className="form-group" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>Profile Theme</label>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                            Choose a color for your username.
                        </p>

                        {/* Text Glow Toggle */}
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="textGlow"
                                checked={textGlow}
                                onChange={(e) => setTextGlow(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: '#7FFFD4', cursor: 'pointer' }}
                            />
                            <label htmlFor="textGlow" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>
                                Enable neon glow effect
                            </label>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            overflowX: 'auto',
                            padding: '0.5rem',
                            scrollBehavior: 'smooth',
                            justifyContent: 'flex-start',
                            maskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
                        }}>
                            {ALL_COLORS.filter(c => c.color !== '#000000').map(option => {
                                const isPremiumLocked = option.isPremium && !isPremiumUser;
                                const backgroundStyle = option.color.includes('gradient')
                                    ? { background: option.color }
                                    : { backgroundColor: option.color };

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => !isPremiumLocked && setUsernameColor(option.color)}
                                        style={{
                                            flex: '0 0 auto',
                                            width: '80px',
                                            padding: '0',
                                            border: usernameColor === option.color ? '3px solid var(--ice-mint)' : '2px solid #333',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            cursor: isPremiumLocked ? 'not-allowed' : 'pointer',
                                            background: 'transparent',
                                            position: 'relative',
                                            opacity: isPremiumLocked ? 0.6 : 1
                                        }}
                                    >
                                        <div style={{
                                            height: '40px',
                                            background: '#000',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            {isPremiumLocked && (
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FaLock size={16} color="#888" />
                                                </div>
                                            )}
                                            <span style={{
                                                fontSize: '1rem',
                                                fontWeight: '800',
                                                ...backgroundStyle,
                                                WebkitBackgroundClip: option.color.includes('gradient') ? 'text' : 'border-box',
                                                WebkitTextFillColor: option.color.includes('gradient') ? 'transparent' : option.color,
                                                color: option.color.includes('gradient') ? 'transparent' : option.color
                                            }}>Aa</span>
                                        </div>
                                        <div style={{
                                            padding: '0.4rem',
                                            background: '#111',
                                            textAlign: 'center',
                                            fontSize: '0.75rem',
                                            color: usernameColor === option.color ? '#fff' : '#888',
                                            fontWeight: usernameColor === option.color ? '600' : '400'
                                        }}>{option.name}</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Profile Banner Gradient - Slider Box */}
                    <div className="form-group" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>Profile Banner Gradient</label>
                            <FaInfoCircle size={14} color="#888" title="Unlock more gradients through achievements" />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                            Customize your profile with different gradient backgrounds.
                        </p>

                        {/* Banner Mode Switch */}
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', background: '#222', padding: '4px', borderRadius: '30px', width: 'fit-content' }}>
                            <button
                                type="button"
                                onClick={() => setBannerMode('stars')}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '20px',
                                    background: bannerMode === 'stars' ? '#7FFFD4' : 'transparent',
                                    color: bannerMode === 'stars' ? '#000' : '#888',
                                    border: 'none',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                Stars
                            </button>
                            <button
                                type="button"
                                onClick={() => setBannerMode('gradient')}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '20px',
                                    background: bannerMode === 'gradient' ? '#7FFFD4' : 'transparent',
                                    color: bannerMode === 'gradient' ? '#000' : '#888',
                                    border: 'none',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                Gradient
                            </button>
                        </div>

                        {/* Stars Overlay Toggle */}
                        {bannerMode === 'gradient' && (
                            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="useStarsOverlay"
                                    checked={useStarsOverlay}
                                    onChange={(e) => setUseStarsOverlay(e.target.checked)}
                                    style={{ width: '16px', height: '16px', accentColor: '#7FFFD4', cursor: 'pointer' }}
                                />
                                <label htmlFor="useStarsOverlay" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    Use stars overlay
                                </label>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            overflowX: 'auto',
                            padding: '0.5rem',
                            scrollBehavior: 'smooth',
                            justifyContent: 'flex-start',
                            maskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
                        }}>
                            {Object.values(PROFILE_GRADIENTS).map(gradient => {
                                const isUnlocked = unlockedGradients.includes(gradient.id) || gradient.unlockCondition === 'free' || gradient.isDefault;
                                const isSelected = selectedGradient === gradient.id;

                                return (
                                    <button
                                        key={gradient.id}
                                        type="button"
                                        onClick={() => isUnlocked && setSelectedGradient(gradient.id)}
                                        disabled={!isUnlocked}
                                        style={{
                                            flex: '0 0 auto',
                                            width: '140px',
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

                    {/* Star Color Customization - Slider Box */}
                    <div className="form-group" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>Profile Banner Star Color</label>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                            Customize the color of the animated stars on your profile banner.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            overflowX: 'auto',
                            padding: '0.5rem',
                            scrollBehavior: 'smooth',
                            justifyContent: 'flex-start',
                            maskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
                        }}>
                            {ALL_COLORS.map(option => {
                                const isPremiumLocked = option.isPremium && !isPremiumUser;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => !isPremiumLocked && setStarColor(option.color)}
                                        style={{
                                            flex: '0 0 auto',
                                            width: '80px',
                                            padding: '0',
                                            border: starColor === option.color ? '3px solid var(--ice-mint)' : '2px solid #333',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            cursor: isPremiumLocked ? 'not-allowed' : 'pointer',
                                            background: 'transparent',
                                            position: 'relative',
                                            opacity: isPremiumLocked ? 0.6 : 1
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
                                            {/* Premium Lock Overlay */}
                                            {isPremiumLocked && (
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FaLock size={16} color="#888" />
                                                </div>
                                            )}

                                            {/* Preview stars */}
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        position: 'absolute',
                                                        width: '2px',
                                                        height: '2px',
                                                        background: option.color, // Works for gradient string too on div background
                                                        borderRadius: '50%',
                                                        top: `${20 + i * 15}%`,
                                                        left: `${15 + i * 15}%`,
                                                        boxShadow: option.color.includes('gradient') ? 'none' : `0 0 3px ${option.color}`
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
                                )
                            })}
                        </div>
                    </div>

                    {/* Profile Border Color Customization */}




                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '1rem',
                            background: '#7FFFD4',
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
                            boxShadow: '0 4px 20px rgba(127, 255, 212, 0.3)',
                            transition: 'all 0.2s',
                            fontFamily: 'var(--font-family-heading)',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}
                    >
                        {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                    </button>
                </form>
            </div>

            {showCropper && tempImageSrc && (
                <ImageCropper
                    imageSrc={tempImageSrc}
                    onCrop={handleCropComplete}
                    onCancel={() => {
                        setShowCropper(false);
                        setTempImageSrc(null);
                    }}
                />
            )}
        </div>
    );
};

export default EditProfile;
