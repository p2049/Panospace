import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch, limit, orderBy } from 'firebase/firestore';
import { db, storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { FaArrowLeft, FaCamera, FaSave, FaCheck, FaInfoCircle, FaLock } from 'react-icons/fa';
import { ART_DISCIPLINES } from '@/core/constants/artDisciplines';
import { PROFILE_GRADIENTS, getGradientBackground, getCurrentGradientId, getUnlockedGradients } from '@/core/constants/gradients';
import { ALL_COLORS } from '@/core/constants/colorPacks';
import DisciplineSelector from '@/components/DisciplineSelector';
import { generateUserSearchKeywords } from '@/core/utils/searchKeywords';
import { sanitizeDisplayName, sanitizeBio } from '@/core/utils/sanitize';
import ImageCropper from '@/components/ImageCropper';
import CosmicGuideModal from '@/components/CosmicGuideModal';
import { getRenderedUsernameLength, renderCosmicUsername, CHAR_MAP, PATTERNS } from '@/utils/usernameRenderer';
import BannerTypeSelector from '@/components/edit-profile/BannerTypeSelector';
import BannerColorSelector from '@/components/edit-profile/BannerColorSelector';
import { BANNER_TYPES } from '@/core/constants/bannerThemes';
import { invalidateProfileCache } from '@/hooks/useProfile';
import { logger } from '@/core/utils/logger';

const EditProfile = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    // Mock Premium Status check - In real app, check user subscription status
    const isPremiumUser = currentUser?.isPremium || false;

    const [showSymbolGuide, setShowSymbolGuide] = useState(false);

    // ... (existing state init)
    const [loading, setLoading] = useState(false);
    // Removed separate displayName state as username is now the source of truth
    const [username, setUsername] = useState('');
    const [originalUsername, setOriginalUsername] = useState(''); // To check for changes
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
    const [bannerColor, setBannerColor] = useState('#7FFFD4'); // Separate from border color
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
                    // Fetch username
                    const fetchedUsername = data.username || currentUser.displayName || '';
                    setUsername(fetchedUsername);
                    setOriginalUsername(fetchedUsername);

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
                        setBannerColor(data.profileTheme.bannerColor || data.profileTheme.borderColor || '#7FFFD4'); // Fallback for legacy
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

    const usernameInputRef = useRef(null);

    const handleInsertSymbol = (symbolCode) => {
        const input = usernameInputRef.current;
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;

        // Insert symbol at cursor
        const newValue = username.substring(0, start) + symbolCode + username.substring(end);

        // Update state
        setUsername(newValue);

        // Restore cursor position after the inserted symbol
        // Need to wait for render or standard React batched update? 
        // Typically safest is requestAnimationFrame or setTimeout for cursor moves after state change in controlled inputs
        setTimeout(() => {
            input.focus();
            input.setSelectionRange(start + symbolCode.length, start + symbolCode.length);
        }, 0);
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
        // Starting profile save...

        if (!currentUser) {
            logger.error("No current user found.");
            return;
        }

        setLoading(true);

        try {
            let newPhotoURL = currentUser.photoURL;

            // 1. Handle Image Upload
            if (selectedFile) {
                try {
                    // CRITICAL: Path must match storage.rules structure: profile_photos/{userId}/{filename}
                    const storageRef = ref(storage, `profile_photos/${currentUser.uid}/${Date.now()}_profile`);
                    logger.log('[EditProfile] Uploading to:', storageRef.fullPath);
                    await uploadBytes(storageRef, selectedFile);
                    newPhotoURL = await getDownloadURL(storageRef);
                    logger.log('[EditProfile] Upload success, URL:', newPhotoURL);
                } catch (uploadError) {
                    logger.error("[EditProfile] Image upload failed:", uploadError);
                    logger.error("[EditProfile] Error code:", uploadError.code);
                    logger.error("[EditProfile] Error message:", uploadError.message);
                    alert("Failed to upload image: " + (uploadError.message || "Unknown error"));
                    setLoading(false);
                    return; // Don't save profile if upload failed
                }
            }

            // 2. Sanitation Checks
            const sanitizedUsername = sanitizeDisplayName(username); // Use sanitizeDisplayName for username too as it handles basic trim
            const sanitizedBio = sanitizeBio(bio);

            // 2.5 Username Validation (If changed)
            if (username !== originalUsername) {
                // Length Check
                const renderedLen = getRenderedUsernameLength(username);
                if (renderedLen < 3 || renderedLen > 20) {
                    alert(`Username length must be 3-20 characters (currently ${renderedLen}).`);
                    setLoading(false);
                    return;
                }

                // Char Check
                // Explicitly allow ONLY alphanumeric and our specific symbols.
                // This regex excludes all high-byte characters (like emojis).
                const usernameRegex = /^[a-zA-Z0-9_@.*/"%#^\\?[\](){}< \-:]+$/;
                if (!usernameRegex.test(username)) {
                    // Check if it's potentially an emoji
                    if (/[^\x00-\x7F]/.test(username)) {
                        alert('External emojis are not allowed. Please use the provided cosmic symbols.');
                    } else {
                        alert('Username contains invalid characters.');
                    }
                    setLoading(false);
                    return;
                }

                // **NEW: Emoji Usage Validation**
                // 1. Check for Emoji-Only (must have at least one alphanumeric char)
                if (!/[a-zA-Z0-9]/.test(username)) {
                    alert('Username must contain at least one letter or number.');
                    setLoading(false);
                    return;
                }

                // 2. Check for Back-to-Back Emojis without text/numbers in between
                // Logic: 
                // - Scan string.
                // - If we find a symbol/pattern, trigger "inEmoji" state.
                // - If we find another symbol/pattern while "inEmoji" is true, FAIL.
                // - If we find alphanumeric, reset "inEmoji" to false.

                // Simplified Regex Approach for "Back-to-Back Symbols"
                // Matches any two symbolic characters/groups next to each other.
                // Symbols: @ . * / " _ % # ^ \ ? [ ] ( ) { } < -
                // NOTE: Some symbols like [] and () are multi-char patterns, but raw input is what we check.
                // We want to prevent: "@*" or "[]()" or "@."

                // Let's define "Symbolic Block" as any contiguous run of non-alphanumeric characters.
                // If a symbolic block length > 1 (and it's not a valid single multi-char pattern itself, actually just ban consecutive separate symbols).

                // Better Rule: "No consecutive cosmic symbols allowed unless separated by text/numbers."
                // Regex for a single cosmic symbol char:
                const symbolCharPattern = /[@.*/"%#^\\?[\](){}< \-]/;

                let lastWasSymbol = false;
                for (let i = 0; i < username.length; i++) {
                    const char = username[i];
                    const isSymbol = symbolCharPattern.test(char);

                    if (isSymbol) {
                        if (lastWasSymbol) {
                            // Special allowance for specific multi-char patterns if we want to support them
                            // But request says "do not allow emojis to be used back to back without text", 
                            // and raw input like "()" is technically back to back chars.
                            // However, "()" becomes ONE emoji. So "()" is fine. "()()" is bad.

                            // We need to parse strictly based on "Entities".
                            // Let's defer to a smarter logic.
                        }
                        // This simple loop is too naive for multi-char patterns like "()".
                    }
                    // lastWasSymbol = isSymbol;
                }

                // Smart Entity Validation
                // 1. Tokenize username into "Text" and "Emoji" blocks using our Renderer Logic
                const { renderCosmicString } = await import('@/utils/usernameRenderer'); // Dynamic import to be safe or use what we have
                // Actually we can just implement a quick tokenizer here or standard regex.

                // Regex to find ALL distinct emoji patterns in the raw string.
                // We must match longer patterns first.
                // Patterns: <() -( [] () {} < @ . * / " _ % # ^ \ ? -
                const cosmicPatternRegex = /(:\)|<3|\(:\)|\(8\)|\(0\)|\(@\)|<\(\)|-\(\)|\[\]|\(\)|\{\}|@|\.|-|\*|\/|"|_|%|#|\^|\\|\?|<)/g;

                const tokens = username.split(cosmicPatternRegex).filter(Boolean);

                let consecutiveEmojiCount = 0;
                let emojiCount = 0;
                let textCount = 0;

                for (const token of tokens) {
                    if (cosmicPatternRegex.test(token)) {
                        // It's an emoji/symbol
                        consecutiveEmojiCount++;
                        if (consecutiveEmojiCount > 3) {
                            alert('You can only use up to 3 cosmic symbols in a row.');
                            setLoading(false);
                            return;
                        }
                        emojiCount++;
                    } else {
                        // It's text/numbers
                        consecutiveEmojiCount = 0; // Reset consecutive count
                        textCount++;
                    }
                }

                // Uniqueness Check
                const q = query(collection(db, 'users'), where('username', '==', username));
                const existingDocs = await getDocs(q);
                if (!existingDocs.empty) {
                    alert('Username is already taken.');
                    setLoading(false);
                    return;
                }
            }

            // 3. Auth Update & Consistency
            // User requested "Username and Display Name are the same thing".
            // So we set displayName to username.
            await updateProfile(currentUser, {
                displayName: sanitizedUsername,
                photoURL: newPhotoURL
            });

            // 4. Firestore Update

            // Auto-generate bio color
            const autoBioColor = generateBioColor(usernameColor);

            // Construct the update object carefully to avoid undefined values
            const userUpdate = {
                username: sanitizedUsername, // Update username
                displayName: sanitizedUsername, // Sync display name
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
                    bannerColor: bannerColor,
                    useStarsOverlay: useStarsOverlay,
                    textGlow: textGlow
                }
            };

            // Add search keywords
            userUpdate.searchKeywords = generateUserSearchKeywords({
                displayName: sanitizedUsername,
                email: currentUser.email,
                bio: sanitizedBio,
                artTypes: selectedMain || []
            });

            await setDoc(doc(db, 'users', currentUser.uid), userUpdate, { merge: true });

            // Propagate updates to past content (Fire & Forget to avoid UI block)
            updatePastContent(currentUser.uid, newPhotoURL, sanitizedUsername);

            // Invalidate cache so Profile page refetches
            invalidateProfileCache(currentUser.uid);

            showToast('Profile updated successfully!', 'success');
            navigate('/profile/me');
        } catch (error) {
            console.error("Save failed:", error);
            showToast("Could not save profile: " + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helper to propagate updates to recent posts/comments
    const updatePastContent = async (uid, photoURL, displayName) => {
        try {
            const batch = writeBatch(db);
            let opCount = 0;

            // 1. Posts (Try with sort, fallback without if index missing)
            const postsRef = collection(db, 'posts');
            let qPosts;
            try {
                qPosts = query(postsRef, where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(50));
            } catch (e) {
                qPosts = query(postsRef, where('userId', '==', uid), limit(50));
            }

            // Execute query safely
            let postSnaps;
            try {
                postSnaps = await getDocs(qPosts);
            } catch (e) {
                // If index missing error, fallback to unsorted
                const qFallback = query(postsRef, where('userId', '==', uid), limit(50));
                postSnaps = await getDocs(qFallback);
            }

            postSnaps.forEach(doc => {
                const p = doc.data();
                if (p.authorPhotoUrl !== photoURL || p.authorName !== displayName) {
                    batch.update(doc.ref, {
                        authorPhotoUrl: photoURL,
                        authorName: displayName,
                        // Update legacy fields just in case
                        userPhotoUrl: photoURL,
                        userAvatar: photoURL
                    });
                    opCount++;
                }
            });

            // 2. Comments
            const commentsRef = collection(db, 'comments');
            const qComments = query(commentsRef, where('userId', '==', uid), limit(50));
            const commentSnaps = await getDocs(qComments);

            commentSnaps.forEach(doc => {
                batch.update(doc.ref, {
                    authorPhotoUrl: photoURL,
                    authorName: displayName,
                    userPhotoUrl: photoURL
                });
                opCount++;
            });

            if (opCount > 0) {
                await batch.commit();
                console.log(`Updated ${opCount} past documents.`);
            }
        } catch (e) {
            console.warn("Background update of past content failed (non-critical):", e);
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
                <CosmicGuideModal isOpen={showSymbolGuide} onClose={() => setShowSymbolGuide(false)} />

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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ display: 'block', color: '#7FFFD4', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Username</label>

                            {/* Live Character Count */}
                            <span style={{ fontSize: '0.7rem', color: '#666' }}>
                                {getRenderedUsernameLength(username)} / 20
                            </span>
                        </div>

                        {/* LIVE VISUAL PREVIEW */}
                        <div style={{
                            padding: '1rem',
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            marginBottom: '1rem',
                            textAlign: 'center',
                            minHeight: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                fontFamily: 'var(--font-family-heading)',
                                color: usernameColor,
                                textShadow: textGlow ? `0 0 10px ${usernameColor}80` : 'none'
                            }}>
                                {renderCosmicUsername(username, bannerColor, textGlow)}
                            </span>
                        </div>

                        {/* EMOJI SCROLLBAR */}
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem',
                            overflowX: 'auto',
                            padding: '0.5rem 0',
                            marginBottom: '0.75rem',
                            maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)'
                        }}>
                            {/* Render PATTERNS first (multi-char) */}
                            {PATTERNS.filter(p => p.replacement !== ' ').map((p, i) => (
                                <button
                                    key={`pat-${i}`}
                                    type="button"
                                    onClick={() => handleInsertSymbol(p.pattern)}
                                    style={{
                                        flex: '0 0 auto',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(127, 255, 212, 0.2)',
                                        background: 'rgba(127, 255, 212, 0.05)',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff'
                                    }}
                                >
                                    {p.replacement}
                                </button>
                            ))}
                            {/* Render CHAR_MAP symbols */}
                            {Object.entries(CHAR_MAP).map(([char, emoji], i) => (
                                <button
                                    key={`char-${i}`}
                                    type="button"
                                    onClick={() => handleInsertSymbol(char)}
                                    style={{
                                        flex: '0 0 auto',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(127, 255, 212, 0.2)',
                                        background: 'rgba(127, 255, 212, 0.05)',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff'
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        {/* Hidden Inputs (Logic) */}
                        <input
                            ref={usernameInputRef}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: 'rgba(127, 255, 212, 0.05)',
                                border: '1px solid rgba(127, 255, 212, 0.2)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#7FFFD4';
                                e.target.style.background = 'rgba(127, 255, 212, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(127, 255, 212, 0.2)';
                                e.target.style.background = 'rgba(127, 255, 212, 0.05)';
                            }}
                            placeholder="@username"
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
                            {ALL_COLORS.filter(c => c.color !== '#000000' && c.color !== 'brand').map(option => {
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

                    {/* Profile Banner Theme - Slider Box */}
                    <div className="form-group" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>Profile Banner Theme</label>
                            <FaInfoCircle size={14} color="#888" title="Unlock more gradients through achievements" />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                            Customize your profile with different themes and gradients.
                        </p>

                        {/* Modular Banner Theme Selectors */}
                        <div style={{ marginBottom: '1rem' }}>
                            <BannerTypeSelector
                                selectedType={bannerMode}
                                onSelect={setBannerMode}
                            />
                        </div>

                        {/* Contextual Color Selector */}
                        {BANNER_TYPES.find(t => t.id === bannerMode)?.needsColor && (
                            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                                    Theme Accent Color
                                </label>
                                <BannerColorSelector
                                    selectedColor={bannerColor}
                                    onSelect={setBannerColor}
                                />
                            </div>
                        )}

                        {/* Stars Overlay Toggle - Only for Star Modes if needed, or remove? 
                            Prompt says "Do NOT modify unrelated features". 
                            But this toggle was tied to 'gradient' mode in previous code to ADD stars.
                            If I have 'stars' mode, it has stars. 
                            If I have 'gradient' mode, user might want stars.
                            Let's keep it but styling might need tweak. 
                            Actually, 'stars' IS a mode now.
                        */}
                        {/* Stars Overlay & Color - Expanded to Cities & Oceans */}
                        {(bannerMode === 'gradient' || bannerMode === 'neonGrid' || bannerMode.startsWith('city') || (bannerMode.startsWith('ocean') && bannerMode !== 'underwaterY2K')) && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        id="useStarsOverlay"
                                        checked={useStarsOverlay}
                                        onChange={(e) => setUseStarsOverlay(e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#7FFFD4', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="useStarsOverlay" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        {bannerMode.startsWith('city') ? 'Show Stars' : 'Overlay Stars'}
                                    </label>
                                </div>


                            </div>
                        )}

                        {/* Legacy Gradient Selector - Shown only when 'gradient' mode is active */}
                        {bannerMode === 'gradient' && (
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
                        )}
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
                                            {option.color === 'brand' ? (
                                                // Multi-color brand stars preview
                                                <>
                                                    <style>{`
                                                        @keyframes star-preview-twinkle-1 { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                                                        @keyframes star-preview-twinkle-2 { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                                                    `}</style>
                                                    {['#7FFFD4', '#FF5C8A', '#5A3FFF', '#1B82FF', '#FF914D'].map((c, i) => (
                                                        <div
                                                            key={i}
                                                            style={{
                                                                position: 'absolute',
                                                                width: '3px',
                                                                height: '3px',
                                                                background: c,
                                                                borderRadius: '50%',
                                                                top: `${15 + i * 14}%`,
                                                                left: `${12 + i * 16}%`,
                                                                boxShadow: `0 0 4px ${c}`,
                                                                animation: `star-preview-twinkle-${(i % 2) + 1} ${1.2 + i * 0.2}s infinite`
                                                            }}
                                                        />
                                                    ))}
                                                </>
                                            ) : (
                                                // Single color stars preview
                                                [...Array(5)].map((_, i) => (
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
                                                ))
                                            )}
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
