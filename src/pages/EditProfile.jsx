import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch, limit, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
// storage imports removed as they are handled by storageUploader
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { FaArrowLeft, FaCamera, FaSave, FaCheck, FaInfoCircle, FaLock, FaChevronLeft, FaChevronRight, FaStar, FaRegStar } from 'react-icons/fa';
import { ART_DISCIPLINES } from '@/core/constants/artDisciplines';
import { PROFILE_GRADIENTS, getGradientBackground, getCurrentGradientId, getUnlockedGradients } from '@/core/constants/gradients';
import { ALL_COLORS, BRAND_RAINBOW } from '@/core/constants/colorPacks';
import DisciplineSelector from '@/components/DisciplineSelector';
import { generateUserSearchKeywords } from '@/core/utils/searchKeywords';
import { fadeColor } from '@/core/utils/colorUtils';
import { sanitizeDisplayName, sanitizeBio } from '@/core/utils/sanitize';
import ImageCropper from '@/components/ImageCropper';
import CosmicGuideModal from '@/components/CosmicGuideModal';
import { getRenderedUsernameLength, renderCosmicUsername, CHAR_MAP, PATTERNS } from '@/utils/usernameRenderer';
import BannerTypeSelector from '@/components/edit-profile/BannerTypeSelector';
import BannerColorSelector from '@/components/edit-profile/BannerColorSelector';
import BannerOverlaySelector from '@/components/edit-profile/BannerOverlaySelector';
import PixelAvatarCreator from '@/components/pixel-avatar/PixelAvatarCreator';
import { FaTh } from 'react-icons/fa';
import BannerThemeRenderer from '@/components/profile/BannerThemeRenderer';
const BannerOverlayRenderer = React.lazy(() => import('@/components/profile/BannerOverlayRenderer'));
import { BANNER_OVERLAYS, OVERLAY_CATEGORIES } from '@/core/constants/bannerOverlays';
import { BANNER_TYPES } from '@/core/constants/bannerThemes';
import { invalidateProfileCache } from '@/hooks/useProfile';
import PlanetUserIcon from '@/components/PlanetUserIcon';
import { logger } from '@/core/utils/logger';
import StarBackground from '@/components/StarBackground';
import { uploadFile } from '@/services/storageUploader'; // Static import
import { checkContent } from '@/core/utils/moderation/moderator';

const DEFAULT_ICONS = [
    'planet-head', 'planet', 'star', 'sparkles', 'sun',
    'lightning', 'rocket', 'smile', 'heart', 'music'
];

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
    const [selectedOverlays, setSelectedOverlays] = useState([]); // This tracks Banner Overlays (legacy name kept for safety)
    const [profileOverlays, setProfileOverlays] = useState([]); // Tracks Profile Picture Overlays
    const [overlayTarget, setOverlayTarget] = useState('both'); // 'both' | 'banner' | 'profile'
    const [defaultIconId, setDefaultIconId] = useState('planet-head'); // New state for default icon

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setBio(data.bio || '');
                    setProfileBgColor(data.profileBgColor || '#000000');
                    // Improve initialization to ensure valid icon
                    const savedIcon = data.defaultIconId || 'planet-head';
                    setDefaultIconId(DEFAULT_ICONS.includes(savedIcon) ? savedIcon : 'planet-head');
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
                        setPixelGlow(data.profileTheme.pixelGlow || false);
                        setPixelGrid(data.profileTheme.pixelGrid !== false); // Default to true if undefined
                        setSelectedOverlays(data.profileTheme.overlays || []);
                        setProfileOverlays(data.profileTheme.profileOverlays || data.profileTheme.overlays || []); // Fallback to matching banner if new
                        setPixelAvatarData(data.pixel_avatar_data || null); // Load raw pixel data if exists
                    }
                }
            }
        };
        fetchUserData();
    }, [currentUser]);

    const [showCropper, setShowCropper] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState(null);
    const [showPixelCreator, setShowPixelCreator] = useState(false);
    const [pixelGlow, setPixelGlow] = useState(false); // Track pixel glow status
    const [pixelGrid, setPixelGrid] = useState(true); // Track grid/gap status
    const [pixelAvatarData, setPixelAvatarData] = useState(null); // The raw pixel array (256 length)
    const [showDefaultIconPopup, setShowDefaultIconPopup] = useState(false); // Popup state for default icons

    const cycleBorderColor = (direction) => {
        const currentIndex = ALL_COLORS.findIndex(c => c.color === profileBorderColor);
        let nextIndex = (currentIndex !== -1 ? currentIndex : 0) + direction;

        if (nextIndex < 0) nextIndex = ALL_COLORS.length - 1;
        if (nextIndex >= ALL_COLORS.length) nextIndex = 0;

        setProfileBorderColor(ALL_COLORS[nextIndex].color);
    };

    const cycleDefaultIcon = (direction) => {
        const currentIndex = DEFAULT_ICONS.indexOf(defaultIconId);
        let nextIndex = currentIndex + direction;
        if (nextIndex < 0) nextIndex = DEFAULT_ICONS.length - 1;
        if (nextIndex >= DEFAULT_ICONS.length) nextIndex = 0;
        setDefaultIconId(DEFAULT_ICONS[nextIndex]);
    };

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

    const handleUsernameKeyDown = (e) => {
        if (e.key === 'Backspace') {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;

            // Only handle if it's a single cursor (no selection range)
            if (start === end && start > 0) {
                // Check against multi-char patterns from usernameRenderer
                // We only care about patterns with length > 1
                const multiCharPatterns = PATTERNS.filter(p => p.pattern.length > 1);

                for (const { pattern } of multiCharPatterns) {
                    const beforeCursor = username.substring(start - pattern.length, start);
                    if (beforeCursor === pattern) {
                        e.preventDefault();
                        const newValue = username.substring(0, start - pattern.length) + username.substring(start);
                        setUsername(newValue);

                        // Restore cursor position
                        setTimeout(() => {
                            e.target.setSelectionRange(start - pattern.length, start - pattern.length);
                        }, 0);
                        return;
                    }
                }
            }
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

    // --- Banner Theme Logic ---
    const NORTHERN_LIGHTS_STAR_DEFAULTS = {
        aurora_borealis: '#E0FFFF',
        aurora_australis: '#FFFFFF',
        aurora_polar: '#FFFFFF',
        aurora_deep: '#7FFFD4',
        aurora_plasma: '#FFFFFF',
        aurora_neon: '#7FFFD4',
        aurora_synth: '#7FFFD4',
        aurora_rose: '#FF5C8A',
        aurora_mint: '#7FFFD4',
        aurora_azure: '#7FDBFF',
        aurora_void: '#A7B6FF',
        aurora_prism: '#FFFFFF'
    };

    const handleBannerModeChange = (mode) => {
        setBannerMode(mode);
        // If switching to Northern Lights, ensure stars are ON and default color is set (Borealis default)
        if (mode === 'northern_lights') {
            setUseStarsOverlay(true);
            setStarColor(NORTHERN_LIGHTS_STAR_DEFAULTS['aurora_borealis']); // Default to first variant
        }
    };

    const handleBannerColorChange = (colorId) => {
        setBannerColor(colorId);
        // If in Northern Lights mode, snap star color to the variant's design default
        if (bannerMode === 'northern_lights' && NORTHERN_LIGHTS_STAR_DEFAULTS[colorId]) {
            setStarColor(NORTHERN_LIGHTS_STAR_DEFAULTS[colorId]);
            setUseStarsOverlay(true);
        }
    };

    const handleSavePixelAvatar = async (payload) => {
        try {
            // 1. Setup SVG Constants
            const MASTER_SIZE = 1024;
            const MARGIN = 0; // Removed margin so pixels fill the box
            const DRAW_SIZE = MASTER_SIZE;
            const GRID_SIZE = 16;
            const BLOCK_SIZE = 1024 / 16; // Exactly 64px per block

            const isGridActive = payload.showGrid !== false;
            const GAP = isGridActive ? 4 : 0; // Increased gap (8px total) for visibility
            const RADIUS = isGridActive ? 16 : 0; // Slightly more rounding for the coded look

            // 2. Generate SVG String
            let svgContent = `<svg width="${MASTER_SIZE}" height="${MASTER_SIZE}" viewBox="0 0 ${MASTER_SIZE} ${MASTER_SIZE}" xmlns="http://www.w3.org/2000/svg" style="background:transparent;">`;

            // Add High-End Neon Filter
            if (payload.showGlow) {
                svgContent += `
                <defs>
                    <filter id="neon-glow" x="-200%" y="-200%" width="500%" height="500%">
                        {/* Layered Drop Shadows create a dense, localized bloom without washing out the center */}
                        <feDropShadow dx="0" dy="0" stdDeviation="15" flood-color="currentColor" flood-opacity="1" />
                        <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="currentColor" flood-opacity="1" />
                        <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#fff" flood-opacity="0.4" />
                    </filter>
                </defs>`;
            }

            // Render Pixels
            payload.data.forEach((color, i) => {
                if (color) {
                    const row = Math.floor(i / GRID_SIZE);
                    const col = i % GRID_SIZE;

                    const x = MARGIN + (col * BLOCK_SIZE) + GAP;
                    const y = MARGIN + (row * BLOCK_SIZE) + GAP;
                    const w = BLOCK_SIZE - (GAP * 2);
                    const h = BLOCK_SIZE - (GAP * 2);

                    // Use 'style="color: ${color}"' so the filter's currentColor matches the pixel
                    const filterAttr = payload.showGlow ? `filter="url(#neon-glow)" style="color: ${color};"` : '';
                    svgContent += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${RADIUS}" fill="${color}" ${filterAttr} />`;
                }
            });

            svgContent += `</svg>`;

            // 3. Convert Target to Data URL for Preview
            const encoded = encodeURIComponent(svgContent);
            const dataUrl = `data:image/svg+xml;charset=utf-8,${encoded}`;
            setPreview(dataUrl);

            // Save the states for persistence
            setPixelAvatarData(payload.data);
            if (payload.showGlow !== undefined) setPixelGlow(payload.showGlow);
            if (payload.showGrid !== undefined) setPixelGrid(payload.showGrid);

            // 4. Create File for Upload
            const blob = new Blob([svgContent], { type: "image/svg+xml" });
            const file = new File([blob], "pixel_avatar.svg", { type: "image/svg+xml" });
            setSelectedFile(file);

            setShowPixelCreator(false);
        } catch (err) {
            console.error("[SVG_GEN] Error:", err);
            showToast("Failed to create SVG avatar", 'error');
        }
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
                    // Extract info from selectedFile to be dynamic
                    const fileExt = selectedFile.name.split('.').pop() || 'png';
                    const mimeType = selectedFile.type || 'image/png';
                    const path = `profile_photos/${currentUser.uid}/profile_current.${fileExt}`;

                    const result = await uploadFile({
                        file: selectedFile,
                        path: path,
                        metadata: {
                            contentType: mimeType,
                            customMetadata: {
                                originalName: selectedFile.name,
                                uploadedVia: 'EditProfile_Canonical'
                            }
                        }
                    });

                    newPhotoURL = result.downloadURL;

                } catch (uploadError) {
                    logger.error("[EditProfile] Image upload failed:", uploadError);
                    alert("Failed to upload image: " + (uploadError.message || "Unknown error"));
                    setLoading(false);
                    return; // Don't save profile if upload failed
                }
            } else if (!preview) {
                // User removed the photo
                newPhotoURL = "";
            }

            // 2. Sanitation Checks
            const sanitizedUsername = sanitizeDisplayName(username); // Use sanitizeDisplayName for username too as it handles basic trim
            const sanitizedBio = sanitizeBio(bio);

            // 🛡️ MODERATION CHECK (Username & Bio)
            const usernameModeration = checkContent(sanitizedUsername);
            if (!usernameModeration.allowed) {
                setLoading(false);
                return alert("This content contains language that isn’t allowed on Panospace.");
            }

            const bioModeration = checkContent(sanitizedBio);
            if (!bioModeration.allowed) {
                setLoading(false);
                return alert("This content contains language that isn’t allowed on Panospace.");
            }

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
                        // lastWasSymbol = isSymbol;
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
                photoURL: newPhotoURL // This can now be null
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
                    bannerMode: bannerMode || 'stars',
                    bannerColor: bannerColor || '#7FFFD4',
                    useStarsOverlay: useStarsOverlay || false,
                    textGlow: textGlow || false,
                    pixelGlow: pixelGlow || false, // Persist pixel glow
                    pixelGrid: pixelGrid, // Persist grid preference
                    overlays: selectedOverlays || [],
                    profileOverlays: profileOverlays || []
                },
                pixel_avatar_data: pixelAvatarData, // Save raw pixels for re-editing
                defaultIconId: defaultIconId // Save the selected default icon
            };

            // Add search keywords
            userUpdate.searchKeywords = generateUserSearchKeywords({
                displayName: sanitizedUsername,
                email: currentUser.email,
                bio: sanitizedBio,
                artTypes: selectedMain || []
            });

            try {

                await setDoc(doc(db, 'users', currentUser.uid), userUpdate, { merge: true });

            } catch (profileErr) {

                throw profileErr;
            }

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
                // Increased limit to 500 to cover more history since we overwrite the file now
                qPosts = query(postsRef, where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(500));
            } catch (e) {
                qPosts = query(postsRef, where('userId', '==', uid), limit(500));
            }

            // Execute query safely
            let postSnaps;
            try {
                postSnaps = await getDocs(qPosts);
            } catch (e) {
                // If index missing error, fallback to unsorted
                const qFallback = query(postsRef, where('userId', '==', uid), limit(500));
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
            const qComments = query(commentsRef, where('userId', '==', uid), limit(500));
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
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', paddingBottom: '100px', position: 'relative' }}>
            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar {
                        height: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: ${profileBorderColor || '#7FFFD4'};
                        border-radius: 3px;
                    }
                    .custom-scrollbar {
                        scrollbar-color: ${profileBorderColor || '#7FFFD4'} rgba(255, 255, 255, 0.05);
                        scrollbar-width: thin;
                    }
                `}
            </style>
            {/* Dynamic Star Background for Edit Profile */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <StarBackground
                    starColor={starColor === 'brand' ? '#7FFFD4' : starColor}
                    multiColor={starColor === 'brand'}
                    numStars={50} // Less dense for editing focus
                />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
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
                    <button onClick={() => navigate('/profile/me')} style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        ...(usernameColor && usernameColor.includes('gradient') ? {
                            backgroundImage: usernameColor,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent'
                        } : { color: usernameColor || '#7FFFD4' })
                    }}>
                        <FaArrowLeft />
                    </button>
                    <h1 style={{
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        fontFamily: 'var(--font-family-heading)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        margin: 0,
                        ...(usernameColor && usernameColor.includes('gradient') ? {
                            backgroundImage: usernameColor,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent',
                            display: 'inline-block'
                        } : { color: usernameColor || '#7FFFD4' })
                    }}>Edit Profile</h1>
                </div>

                <div style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
                    <CosmicGuideModal isOpen={showSymbolGuide} onClose={() => setShowSymbolGuide(false)} />

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>



                        {/* Unified Username Input/Preview w/ Built-in Color Picker */}
                        <div className="form-group" style={{ order: -1 }}> {/* Move to top */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    background: (usernameColor && usernameColor.includes('gradient')) ? usernameColor : undefined,
                                    WebkitBackgroundClip: (usernameColor && usernameColor.includes('gradient')) ? 'text' : undefined,
                                    WebkitTextFillColor: (usernameColor && usernameColor.includes('gradient')) ? 'transparent' : (usernameColor || '#7FFFD4'),
                                    color: (usernameColor && !usernameColor.includes('gradient')) ? usernameColor : 'transparent',
                                    fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase'
                                }}>Username</label>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Activate Glow Toggle - Compact */}
                                    <div
                                        onClick={() => setTextGlow(!textGlow)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: textGlow ? 'rgba(255,255,255,0.2)' : 'transparent',
                                            border: `1px solid ${textGlow ? ((usernameColor && !usernameColor.includes('gradient')) ? usernameColor : '#7FFFD4') : 'rgba(255,255,255,0.2)'}`,
                                            fontSize: '0.65rem',
                                            color: '#fff',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        GLOW {textGlow ? 'ON' : 'OFF'}
                                    </div>

                                    {/* Live Character Count */}
                                    <span style={{ fontSize: '0.7rem', color: '#666' }}>
                                        {getRenderedUsernameLength(username)} / 20
                                    </span>
                                </div>
                            </div>

                            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                                {/* Iridescent Border Effect */}
                                {(profileBorderColor === 'brand' || (profileBorderColor && profileBorderColor.includes('gradient'))) && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: '-2px',
                                        borderRadius: '14px',
                                        padding: '2px', // Size of the border
                                        background: profileBorderColor === 'brand' ? BRAND_RAINBOW : profileBorderColor,
                                    }} />
                                )}

                                <div style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                    backdropFilter: 'blur(7px)',
                                    WebkitBackdropFilter: 'blur(7px)',
                                    border: (profileBorderColor === 'brand' || (profileBorderColor && profileBorderColor.includes('gradient')))
                                        ? 'none'
                                        : `2px solid ${(profileBorderColor === 'transparent' || profileBorderColor === 'transparent-border') ? '#7FFFD4' : profileBorderColor}`,
                                    borderRadius: '12px',
                                    minHeight: '60px', // Tighter height
                                    display: 'flex',
                                    alignItems: 'center', // Center vertically
                                    justifyContent: 'center',
                                    padding: '0 3rem', // Add padding for arrows
                                    boxShadow: (profileBorderColor === 'brand' || (profileBorderColor && profileBorderColor.includes('gradient')))
                                        ? '0 0 20px rgba(0,0,0,0.5)'
                                        : `0 0 15px ${(profileBorderColor === 'transparent' || profileBorderColor === 'transparent-border') ? '#7FFFD4' : profileBorderColor}40, 0 8px 32px rgba(0,0,0,0.5)`,
                                    transition: 'all 0.3s'
                                }}>

                                    {/* Left Arrow Color Picker */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const colors = ALL_COLORS.filter(c => c.color !== '#000000' && c.color !== 'brand' && c.id !== 'transparent-border');
                                            const currentIndex = colors.findIndex(c => c.color === usernameColor);
                                            let nextIndex = currentIndex - 1;
                                            if (nextIndex < 0) nextIndex = colors.length - 1;
                                            // Skip locked if necessary, for now just simple cycle
                                            // Handle premium skipping if needed, for now assuming user sees all or we skip locked logic here
                                            // Let's simple cycle
                                            setUsernameColor(colors[nextIndex].color);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            left: '10px',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            color: 'rgba(255,255,255,0.5)',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            zIndex: 20
                                        }}
                                    >
                                        <FaChevronLeft size={12} />
                                    </button>

                                    {/* The "Visual Layer" - rendered emojis and text */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        pointerEvents: 'none',
                                        fontSize: '1.5rem',
                                        fontWeight: '800',
                                        fontFamily: 'var(--font-family-heading)',
                                        // Gradient Handling
                                        ...(usernameColor && usernameColor.includes('gradient') ? {
                                            backgroundImage: usernameColor,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            color: 'transparent'
                                        } : { color: usernameColor || '#7FFFD4' }),
                                        textShadow: textGlow ? `0 0 10px ${(usernameColor && usernameColor.includes('gradient')) ? '#fff' : (usernameColor || '#7FFFD4')}80` : 'none',
                                        width: '100%',
                                        zIndex: 1
                                    }}>
                                        {renderCosmicUsername(username, usernameColor, textGlow)}
                                    </div>

                                    {/* The "Interactive Layer" - transparent input */}
                                    <input
                                        ref={usernameInputRef}
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                        onKeyDown={handleUsernameKeyDown}
                                        onFocus={() => setShowSymbolGuide(true)} // Using existing state or new one for emoji bar? User said "emoji bar only pops up when active"
                                        onBlur={() => setTimeout(() => setShowSymbolGuide(false), 200)} // Delay for click
                                        placeholder="@yourname"
                                        style={{
                                            width: 'calc(100% - 80px)', // Avoid arrows
                                            height: '100%',
                                            position: 'absolute',
                                            top: 0,
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            textAlign: 'center',
                                            fontSize: '1.5rem',
                                            fontWeight: '800',
                                            fontFamily: 'var(--font-family-heading)',
                                            color: 'transparent', // Text is rendered by the layer below
                                            caretColor: (usernameColor && !usernameColor.includes('gradient')) ? usernameColor : '#7FFFD4', // Show the caret though!
                                            zIndex: 5, // Above visual, below arrows? No arrows need to be clickable.
                                            // Arrows Z is 20. Input Z is 5. Visual Z is 1.
                                            textTransform: 'lowercase'
                                        }}
                                    />

                                    {/* Right Arrow Color Picker */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const colors = ALL_COLORS.filter(c => c.color !== '#000000' && c.color !== 'brand' && c.id !== 'transparent-border');
                                            const currentIndex = colors.findIndex(c => c.color === usernameColor);
                                            let nextIndex = currentIndex + 1;
                                            if (nextIndex >= colors.length) nextIndex = 0;
                                            setUsernameColor(colors[nextIndex].color);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            color: 'rgba(255,255,255,0.5)',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            zIndex: 20
                                        }}
                                    >
                                        <FaChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* EMOJI SCROLLBAR - Conditional */}
                        {showSymbolGuide && (
                            <div className="custom-scrollbar" style={{
                                display: 'flex',
                                gap: '0.75rem',
                                overflowX: 'auto',
                                padding: '0.5rem 0',
                                marginBottom: '1.5rem',
                                marginTop: '-0.5rem',
                                maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
                                animation: 'fadeIn 0.3s ease'
                            }}>
                                {/* Render PATTERNS first (multi-char) */}
                                {PATTERNS.filter(p => p.replacement !== ' ').map((p, i) => (
                                    <button
                                        key={`pat-${i}`}
                                        type="button" // Important to prevent form submit
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent blur
                                            handleInsertSymbol(p.pattern);
                                        }}
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
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleInsertSymbol(char);
                                        }}
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
                        )}

                        {/* Photo Section - Moved Down */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                {/* Left Arrow - Profile Border Cycle */}
                                <button
                                    type="button"
                                    onClick={() => cycleBorderColor(-1)}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        backdropFilter: 'blur(4px)'
                                    }}
                                >
                                    <FaChevronLeft size={16} />
                                </button>

                                <div style={{
                                    position: 'relative',
                                    width: '120px',
                                    height: '120px'
                                }}>
                                    {/* Rainbow Border Gradient (Behind) */}
                                    {(profileBorderColor === 'brand' || (profileBorderColor && profileBorderColor.includes('gradient'))) && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: '-3px',
                                            borderRadius: '19px',
                                            padding: '3px',
                                            background: profileBorderColor === 'brand' ? BRAND_RAINBOW : profileBorderColor,
                                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                            WebkitMaskComposite: 'xor',
                                            maskComposite: 'exclude',
                                            zIndex: 0 // Behind the inner box
                                        }} />
                                    )}

                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        border: (profileBorderColor === 'brand' || (profileBorderColor && profileBorderColor.includes('gradient')))
                                            ? '1px solid rgba(255,255,255,0.2)'
                                            : `2.5px solid ${profileBorderColor}`,
                                        background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                        backdropFilter: 'blur(16px)',
                                        WebkitBackdropFilter: 'blur(16px)',
                                        position: 'relative',
                                        zIndex: 1,
                                        boxShadow: (profileBorderColor === 'brand' || (profileBorderColor && profileBorderColor.includes('gradient')))
                                            ? '0 0 15px rgba(0,0,0,0.5)'
                                            : `0 0 15px ${profileBorderColor}40`
                                    }}>
                                        <React.Suspense fallback={null}>
                                            {/* We use profileOverlays here. We pass empty monchromeColor if it's 'brand' to avoid unwanted tinting */}
                                            <BannerOverlayRenderer
                                                overlays={profileOverlays}
                                                monochromeColor={(profileBorderColor && !profileBorderColor.includes('gradient') && profileBorderColor !== 'brand') ? profileBorderColor : null}
                                                target="profile"
                                            >
                                                {preview ? (
                                                    <img
                                                        src={preview}
                                                        alt="Profile"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            imageRendering: 'pixelated' // Keeps pixel art crisp
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10, opacity: 1 }}>
                                                        <PlanetUserIcon
                                                            size={64}
                                                            color={usernameColor && !usernameColor.includes('gradient') ? usernameColor : '#7FFFD4'}
                                                            icon={defaultIconId}
                                                            glow={textGlow}
                                                        />
                                                    </div>
                                                )}
                                            </BannerOverlayRenderer>
                                        </React.Suspense>
                                    </div>
                                </div>

                                {/* Right Arrow - Profile Border Cycle */}
                                <button
                                    type="button"
                                    onClick={() => cycleBorderColor(1)}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        backdropFilter: 'blur(4px)'
                                    }}
                                >
                                    <FaChevronRight size={16} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                                <label style={{
                                    cursor: 'pointer',
                                    color: '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.85rem',
                                    padding: '0.6rem 1.2rem',
                                    background: (usernameColor && !usernameColor.includes('gradient')) ? usernameColor : '#7FFFD4',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    border: 'none',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                }}>
                                    <FaCamera /> {preview ? 'Change' : 'Upload'}
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPixelCreator(true)}
                                    style={{
                                        cursor: 'pointer',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.85rem',
                                        padding: '0.6rem 1.2rem',
                                        background: 'rgba(255,255,255,0.1)', // Glassy look
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '20px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <FaTh /> Pixel Art
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDefaultIconPopup(!showDefaultIconPopup)}
                                    style={{
                                        cursor: 'pointer',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.85rem',
                                        padding: '0.6rem 1.2rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '20px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    Default
                                </button>

                                {showDefaultIconPopup && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '110%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '16px',
                                        padding: '1rem',
                                        zIndex: 1000,
                                        width: '280px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(5, 1fr)',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#888', fontWeight: '600' }}>SELECT ICON</div>
                                        {DEFAULT_ICONS.map(iconId => (
                                            <button
                                                key={iconId}
                                                type="button"
                                                onClick={() => {
                                                    setDefaultIconId(iconId);
                                                    setPreview(null);
                                                    setShowDefaultIconPopup(false);
                                                }}
                                                style={{
                                                    background: defaultIconId === iconId ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                    border: defaultIconId === iconId ? `1px solid ${usernameColor}` : '1px solid transparent',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <PlanetUserIcon
                                                    size={24}
                                                    color={defaultIconId === iconId ? usernameColor : '#666'}
                                                    icon={iconId}
                                                    glow={false}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {preview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreview(null);
                                            setSelectedFile(null); // Explicitly clear selected file
                                            // Clear file selection if any
                                            const fileInput = document.querySelector('input[type="file"]');
                                            if (fileInput) fileInput.value = '';
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.85rem',
                                            padding: '0.6rem 1.2rem',
                                            background: 'rgba(255, 50, 50, 0.2)',
                                            border: '1px solid rgba(255, 50, 50, 0.5)',
                                            borderRadius: '20px',
                                            fontWeight: '600',
                                            transition: 'all 0.2s',
                                        }}>
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>










                        {/* Profile Banner Theme - Slider Box */}
                        <div className="form-group" style={{ maxWidth: '100%', overflow: 'hidden' }}>


                            {/* Visual Overlays (Lens) Selection - MOVED ABOVE PREVIEW */}

                            <BannerOverlaySelector
                                selectedOverlays={overlayTarget === 'profile' ? profileOverlays : selectedOverlays} // 'Both' defaults to showing current banner overlays as primary source of truth for display
                                onSelect={(newVal) => {
                                    if (overlayTarget === 'both') {
                                        setSelectedOverlays(newVal);
                                        // Filter out Viewfinder UIs for profile to ensure they only apply to Banner
                                        const profileSafe = newVal.filter(id => {
                                            const ov = BANNER_OVERLAYS.find(o => o.id === id);
                                            if (!ov) return true;
                                            const isViewfinderUI = ov.category === OVERLAY_CATEGORIES.CAMERA.id || ov.id === 'display_terminal';
                                            return !isViewfinderUI;
                                        });
                                        setProfileOverlays(profileSafe);
                                    } else if (overlayTarget === 'banner') {
                                        setSelectedOverlays(newVal);
                                    } else {
                                        setProfileOverlays(newVal);
                                    }
                                }}
                                highlightColor={usernameColor}
                                overlayTarget={overlayTarget}
                                setOverlayTarget={setOverlayTarget}
                            />

                            {/* Live Banner Preview */}
                            <div style={{
                                width: '100%',
                                height: '140px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative',
                                marginBottom: '1.5rem',
                                border: `1px solid ${profileBorderColor}40`,
                                background: '#000',
                                boxShadow: `0 8px 32px rgba(0,0,0,0.4)`
                            }}>
                                <BannerThemeRenderer
                                    mode={bannerMode}
                                    color={bannerColor}
                                    starSettings={{
                                        enabled: useStarsOverlay,
                                        color: starColor
                                    }}
                                    overlays={selectedOverlays}
                                />
                                <div style={{ position: 'absolute', top: '8px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.6rem', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', zIndex: 1000 }}>
                                    Live Preview
                                </div>
                            </div>

                            {/* Modular Banner Theme Selectors */}
                            <div style={{ marginBottom: '1rem' }}>
                                <BannerTypeSelector
                                    selectedType={bannerMode}
                                    onSelect={handleBannerModeChange}
                                    highlightColor={profileBorderColor}
                                    bannerColor={bannerColor}
                                    onColorSelect={handleBannerColorChange}
                                />
                            </div>





                            {/* Stars Overlay Toggle - Only for Star Modes if needed, or remove? 
                            Prompt says "Do NOT modify unrelated features". 
                            But this toggle was tied to 'gradient' mode in previous code to ADD stars.
                            If I have 'stars' mode, it has stars. 
                            If I have 'gradient' mode, user might want stars.
                            Let's keep it but styling might need tweak. 
                            Actually, 'stars' IS a mode now.
                        */}
                            {/* Stars Overlay & Color - Expanded to Cities, Oceans, & Cosmic */}
                            {(bannerMode === 'gradient' || bannerMode === 'neonGrid' || bannerMode === 'cosmic-earth' || bannerMode === 'northern_lights' || bannerMode.startsWith('city') || (bannerMode.startsWith('ocean') && bannerMode !== 'underwaterY2K')) && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <button
                                            type="button"
                                            id="useStarsOverlay"
                                            onClick={() => setUseStarsOverlay(!useStarsOverlay)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                transform: useStarsOverlay ? 'scale(1.1)' : 'scale(1)',
                                                filter: useStarsOverlay ? `drop-shadow(0 0 8px ${starColor === 'brand' ? '#7FFFD4' : starColor})` : 'none',
                                                color: useStarsOverlay ? (starColor === 'brand' ? '#7FFFD4' : starColor) : 'rgba(255,255,255,0.3)'
                                            }}
                                        >
                                            {useStarsOverlay ? <FaStar size={20} /> : <FaRegStar size={20} />}
                                        </button>
                                        <label
                                            htmlFor="useStarsOverlay"
                                            onClick={() => setUseStarsOverlay(!useStarsOverlay)}
                                            style={{
                                                color: useStarsOverlay ? '#fff' : 'rgba(255,255,255,0.5)',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                fontWeight: useStarsOverlay ? '700' : '500',
                                                letterSpacing: '0.05em',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {bannerMode.startsWith('city') ? 'Show Stars' : 'Overlay Stars'}
                                        </label>
                                    </div>


                                </div>
                            )}

                            {/* Legacy Gradient Selector - Shown only when 'gradient' mode is active */}
                            {bannerMode === 'gradient' && (
                                <div className="custom-gradient-scrollbar" style={{
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
                                <label style={{
                                    background: (usernameColor && usernameColor.includes('gradient')) ? usernameColor : undefined,
                                    WebkitBackgroundClip: (usernameColor && usernameColor.includes('gradient')) ? 'text' : undefined,
                                    WebkitTextFillColor: (usernameColor && usernameColor.includes('gradient')) ? 'transparent' : (usernameColor || '#fff'),
                                    color: (usernameColor && !usernameColor.includes('gradient')) ? usernameColor : 'transparent',
                                    fontSize: '1rem', fontWeight: '600'
                                }}>Profile Banner Star Color</label>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                                Customize the color of the animated stars on your profile banner.
                            </p>

                            <div className="custom-gradient-scrollbar" style={{
                                display: 'flex',
                                gap: '1rem',
                                overflowX: 'auto',
                                padding: '0.5rem',
                                scrollBehavior: 'smooth',
                                justifyContent: 'flex-start',
                                maskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
                            }}>
                                {ALL_COLORS.filter(o => o.color !== 'transparent').map(option => {
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
                                                border: starColor === option.color ? `3px solid ${(profileBorderColor && profileBorderColor.includes('gradient')) ? '#fff' : (profileBorderColor === 'transparent' || profileBorderColor === 'transparent-border' ? '#7FFFD4' : profileBorderColor)}` : '2px solid #333',
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



                        {/* Discipline Selection - Moved to Bottom */}
                        <DisciplineSelector
                            selectedMain={selectedMain}
                            selectedNiches={selectedNiches}
                            expandedDiscipline={expandedDiscipline}
                            setExpandedDiscipline={setExpandedDiscipline}
                            toggleMainDiscipline={toggleMainDiscipline}
                            toggleNiche={toggleNiche}
                            accentColor={usernameColor} // Passing as accentColor for clarity
                        />

                        {/* Final Save Button */}                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '1rem',
                                background: usernameColor,
                                color: (usernameColor === '#FFFFFF' || usernameColor === '#fff') ? '#000' : '#000',
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
                                zIndex: 1000,
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

                {
                    showCropper && tempImageSrc && (
                        <ImageCropper
                            imageSrc={tempImageSrc}
                            onCrop={handleCropComplete}
                            onCancel={() => {
                                setShowCropper(false);
                                setTempImageSrc(null);
                            }}
                        />
                    )
                }

            </div > {/* End wrapper */}
            {/* Pixel Avatar Modal */}
            {
                showPixelCreator && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 2000,
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        padding: '5vh 2rem 2rem 2rem',
                        overflowY: 'auto'
                    }}>
                        {/* Back Arrow - Outside the box */}
                        <button
                            onClick={() => setShowPixelCreator(false)}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                width: '48px',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginBottom: '16px',
                                color: '#fff',
                                fontSize: '1.5rem',
                                transition: 'all 0.2s'
                            }}
                            title="Close Pixel Lab"
                        >
                            ←
                        </button>
                        <div>
                            <PixelAvatarCreator
                                initialData={pixelAvatarData}
                                initialGlow={pixelGlow}
                                initialGrid={pixelGrid}
                                onSave={handleSavePixelAvatar}
                                onClose={() => setShowPixelCreator(false)}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default EditProfile;
