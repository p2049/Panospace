/**
 * ⚠️ CREATE POST LAYOUT CONTRACT ⚠️
 *
 * - Header must NEVER scroll
 * - Body is flex:1 with overflow hidden
 * - Left & Right columns own ALL vertical scrolling
 * - No height math (calc / max-height / 100%) inside columns
 *
 * Do not modify layout containers without understanding this contract.
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useCollections } from '@/hooks/useCollections';
import { isFeatureEnabled } from '@/config/featureFlags';
import { useDraftSaving } from '@/hooks/useDraftSaving';
import { useFeedStore } from '@/core/store/useFeedStore';

import ThumbnailStrip from '@/components/create-post/ThumbnailStrip';
import ImageCarousel from '@/components/create-post/ImageCarousel';
import TagCategoryPanel from '@/components/create-post/TagCategoryPanel';
import FilmOptionsPanel from '@/components/create-post/FilmOptionsPanel';
import ManualExifEditor from '@/components/create-post/ManualExifEditor';
import CollectionSelector from '@/components/create-post/CollectionSelector';
import RatingSystemSelector from '@/components/create-post/RatingSystemSelector';
import ShopOptionsPanel from '@/components/create-post/ShopOptionsPanel';
import SearchEmojiPicker from '@/components/SearchEmojiPicker';
import ImageSizeWarningModal from '@/components/ImageSizeWarningModal';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { SpaceCardService } from '@/services/SpaceCardService';
import PageHeader from '@/components/PageHeader';
import { FaTimes, FaPlus, FaTrash, FaMapMarkerAlt, FaRocket, FaImages, FaPen, FaCheckCircle, FaPalette, FaChevronLeft, FaChevronRight, FaArrowsAltV, FaArrowsAltH, FaThLarge, FaEye, FaArrowLeft, FaSmile, FaGlobe, FaAlignLeft } from 'react-icons/fa';
import Post from '@/components/Post';
import { extractDominantHue } from '@/core/utils/colorUtils';
import { generateStackPreview } from '@/core/utils/stackUtils';
import { logger } from '@/core/utils/logger';
import { validateImageSize, getMaxImageSizeMB, formatFileSizeMB, getMaxImageSize } from '@/core/constants/imageLimits';
import { scaleImageToFit } from '@/core/utils/imageScaler';






const WRITER_THEMES = {
    default: { name: 'Default', bg: '#121212', text: '#ffffff', border: '1px solid #333' },
    paper: { name: 'Paper', bg: '#fdfbf7', text: '#2a2a2a', border: '1px solid #e0d0b0' },
    night: { name: 'Night', bg: '#050510', text: '#e0e0ff', border: '1px solid #2a2a40' },
    mono: { name: 'Mono', bg: '#ffffff', text: '#000000', border: '1px solid #ccc' },
    aurora: { name: 'Aurora', bg: '#002b36', text: '#eee8d5', border: '1px solid #073642' }
};

const StackThumbnail = ({ file }) => {
    const [src, setSrc] = useState(null);
    useEffect(() => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setSrc(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    if (!src) return <div style={{ width: '100%', height: '100%', background: '#333' }}></div>;
    return <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumbnail" />;
};

const CreatePost = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { createPost, loading, error, progress } = useCreatePost();
    const { collections } = useCollections(currentUser?.uid);
    const { saveDraft, loadDraft, clearDraft, hasDraft } = useDraftSaving();
    const { createDefault, ratingSystemDefault, setFeedViewMode } = useFeedStore(); // Get default from settings
    const [selectedCollectionId, setSelectedCollectionId] = useState('');
    const fileInputRef = useRef(null);
    const submittingRef = useRef(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Generate stars once and memoize them
    const stars = useMemo(() => {
        return [...Array(100)].map((_, i) => ({
            id: i,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            top: Math.random() * 100,
            left: Math.random() * 100,
            opacity: Math.random() * 0.5 + 0.3,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            glow: Math.random() * 3 + 2
        }));
    }, []);

    // Global Post State
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    const [location, setLocation] = useState({ city: '', state: '', country: '' });
    const [primaryMode, setPrimaryMode] = useState(createDefault || 'social'); // Was postType (social/art)
    const [postType, setPostType] = useState('image'); // 'image' | 'text'
    const [textContent, setTextContent] = useState('');
    const [writerTheme, setWriterTheme] = useState('default'); // 'default' | 'paper' | 'night' | 'mono' | 'aurora'
    const [linkedPostIds, setLinkedPostIds] = useState([]);
    const [showLinkSelector, setShowLinkSelector] = useState(false);
    const [userPosts, setUserPosts] = useState([]); // For link selector
    const [isHumor, setIsHumor] = useState(false); // Humor Flag

    // Emoji Picker
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiSelect = (emoji) => {
        setTitle(prev => prev + emoji);
    };

    // Slides State
    const [slides, setSlides] = useState([]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    // Cinematic Background State
    const [atmosphereBackground, setAtmosphereBackground] = useState('black');
    const [extractedColor, setExtractedColor] = useState(null);
    const [calculatingColor, setCalculatingColor] = useState(false);

    useEffect(() => {
        if (slides.length === 1) {
            const slide = slides[0];
            // Use preview URL or create one temporarily
            const src = slide.preview;
            if (src) {
                // Avoid re-extracting if we already have it for this specific slide? 
                // Simple check: if extractedColor matches what we expect? 
                // Actually, just re-run is safer for now, performance is handled by utility canvas size.
                setCalculatingColor(true);
                extractDominantHue(src).then(color => {
                    setExtractedColor(color);
                    setCalculatingColor(false);
                });
            }
        } else {
            // Revert to black for multi-post
            if (atmosphereBackground !== 'black') setAtmosphereBackground('black');
        }
    }, [slides.length, slides[0]?.preview]); // Only re-run if length changes or first slide changes

    // Manual EXIF state
    const [showManualExif, setShowManualExif] = useState({});

    // Carousel/Swipe state
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Tag Panel State
    const [expandedCategories, setExpandedCategories] = useState({
        aesthetics: true,
        style: false,
        subject: false,
        technical: false
    });

    // Film Metadata State
    const [filmMetadata, setFilmMetadata] = useState({
        isFilm: false,
        stock: '',
        customStock: '',
        format: '',
        iso: '',
        cameraOverride: '',
        lensOverride: '',
        scanner: '',
        lab: ''
    });

    // Film UI Overlays State
    const [enableSprocketOverlay, setEnableSprocketOverlay] = useState(false);
    const [enableInstantPhotoOverlay, setEnableInstantPhotoOverlay] = useState(false);
    const [instantPhotoCount, setInstantPhotoCount] = useState(1); // 1, 2, or 3 images per slide
    const [instantPhotoStyle, setInstantPhotoStyle] = useState('thin'); // 'thin' or 'thick'
    const [filmMode, setFilmMode] = useState('continuous'); // 'continuous' or 'cut'
    const [enableQuartzDate, setEnableQuartzDate] = useState(false);
    const [enableRatings, setEnableRatings] = useState(ratingSystemDefault ? ratingSystemDefault === 'stars' : false); // Default based on settings (smiley = false)
    const [showInProfile, setShowInProfile] = useState(true); // Whether to show in user's profile feed
    const [quartzDateString, setQuartzDateString] = useState(() => {
        const today = new Date();
        const d = String(today.getDate());
        const m = String(today.getMonth() + 1);
        const y = String(today.getFullYear()).slice(2);
        return `${d.padStart(2, '0')} ${m.padStart(2, '0')} ${y}`;
    });
    const [quartzColor, setQuartzColor] = useState('#7FFFD4');
    const [quartzDateFormat, setQuartzDateFormat] = useState('DD MM YY');

    const [shareTitleAcrossImages, setShareTitleAcrossImages] = useState(true); // Share title across all images
    const [isProcessingStack, setIsProcessingStack] = useState(false); // Loading state for stack generation

    // Digital Collectibles State
    const [createSpaceCard, setCreateSpaceCard] = useState(false);
    const [showFeedPreview, setShowFeedPreview] = useState(false);

    // Mobile Optimization State
    const [isMobile, setIsMobile] = useState(false);
    const [isLocationExpanded, setIsLocationExpanded] = useState(false);
    const [isTagsPanelExpanded, setIsTagsPanelExpanded] = useState(true);

    // Initial Mobile Check
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 900;
            setIsMobile(mobile);
            // On mobile, collapse tags by default
            if (mobile) {
                setIsTagsPanelExpanded(false);
            } else {
                setIsTagsPanelExpanded(true);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    const [spaceCardData, setSpaceCardData] = useState({
        title: '',
        price: 0,
        rarity: 'Common',
        editionType: 'unlimited',
        editionSize: 100,
        collaborators: []
    });

    // Image Size Warning Modal State
    const [sizeWarningModal, setSizeWarningModal] = useState({
        isOpen: false,
        file: null,
        fileIndex: null,
        imageName: '',
        actualSize: '',
        isPremium: false,
        isScaling: false,
        pendingFiles: [],  // Queue of files to process after current
    });
    const [userIsPremium, setUserIsPremium] = useState(false);
    const [sellerStatus, setSellerStatus] = useState('none');

    // Check if user is premium on mount
    useEffect(() => {
        const checkPremiumStatus = async () => {
            if (!currentUser?.uid) return;
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserIsPremium(data.isUltra || false);
                    setSellerStatus(data.sellerStatus || 'none');
                }
            } catch (e) {
                logger.warn('Could not check premium status:', e);
            }
        };
        checkPremiumStatus();
    }, [currentUser?.uid]);

    // Toggle Handlers
    const handleSprocketToggle = (val) => {
        setEnableSprocketOverlay(val);
        if (val) setEnableInstantPhotoOverlay(false);
    };

    const handleInstantPhotoToggle = (val) => {
        setEnableInstantPhotoOverlay(val);
        if (val) {
            setEnableSprocketOverlay(false);
            setQuartzColor('#333333'); // Dark Gray for white border
        } else {
            setQuartzColor('#7FFFD4'); // Revert to Ice Mint
        }
    };

    // Handle file selection with size validation
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Enforce 10 image limit
        if (slides.length + files.length > 10) {
            alert('You can only upload up to 10 images per post.');
            return;
        }

        // Get ALL EXIF from first slide to auto-fill new slides
        const firstSlideExif = slides.length > 0 ? (slides[0].manualExif || slides[0].exif) : null;
        const commonExif = firstSlideExif ? { ...firstSlideExif } : null;

        // Check each file for size limits
        const validFiles = [];
        let oversizedFile = null;
        let remainingFiles = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const validation = validateImageSize(file.size, userIsPremium);

            if (validation.isValid) {
                validFiles.push(file);
            } else {
                // Found an oversized file - show modal
                oversizedFile = file;
                remainingFiles = files.slice(i + 1); // Files after this one
                break;
            }
        }

        // Add valid files as slides
        if (validFiles.length > 0) {
            const newSlides = validFiles.map(file => ({
                type: 'image',
                file,
                preview: URL.createObjectURL(file),
                title: '',
                exif: null,
                manualExif: commonExif
            }));

            setSlides(prev => {
                const updated = [...prev, ...newSlides];
                if (prev.length === 0) setActiveSlideIndex(0);
                return updated;
            });
        }

        // If there's an oversized file, show the warning modal
        if (oversizedFile) {
            const validation = validateImageSize(oversizedFile.size, userIsPremium);
            setSizeWarningModal({
                isOpen: true,
                file: oversizedFile,
                fileIndex: slides.length + validFiles.length,
                imageName: oversizedFile.name,
                actualSize: validation.actualMB,
                isPremium: userIsPremium,
                isScaling: false,
                pendingFiles: remainingFiles,
                commonExif: commonExif,
            });
        }
    };

    // Handle scaling the oversized image
    const handleScaleDown = async () => {
        const { file, pendingFiles, commonExif } = sizeWarningModal;
        if (!file) return;

        setSizeWarningModal(prev => ({ ...prev, isScaling: true }));

        try {
            const maxSize = getMaxImageSize(userIsPremium);
            const result = await scaleImageToFit(file, maxSize);

            if (result.success) {
                // Add the scaled file as a slide
                const newSlide = {
                    type: 'image',
                    file: result.file,
                    preview: URL.createObjectURL(result.file),
                    title: '',
                    exif: null,
                    manualExif: commonExif || null,
                    wasScaled: true,
                    originalSize: formatFileSizeMB(result.originalSize),
                    scaledSize: formatFileSizeMB(result.finalSize),
                };

                setSlides(prev => {
                    const updated = [...prev, newSlide];
                    if (prev.length === 0) setActiveSlideIndex(0);
                    return updated;
                });

                // Show success feedback
                logger.log(`[CreatePost] Scaled image from ${formatFileSizeMB(result.originalSize)} to ${formatFileSizeMB(result.finalSize)}`);

                // Close modal and process remaining files
                setSizeWarningModal({
                    isOpen: false,
                    file: null,
                    fileIndex: null,
                    imageName: '',
                    actualSize: '',
                    isPremium: false,
                    isScaling: false,
                    pendingFiles: [],
                });

                // Process any remaining files
                if (pendingFiles && pendingFiles.length > 0) {
                    // Create a synthetic event to trigger handleFileSelect
                    const dataTransfer = new DataTransfer();
                    pendingFiles.forEach(f => dataTransfer.items.add(f));
                    handleFileSelect({ target: { files: dataTransfer.files } });
                }
            } else {
                alert(`Could not scale image to fit within limit: ${result.error}`);
                setSizeWarningModal(prev => ({ ...prev, isScaling: false }));
            }
        } catch (err) {
            logger.error('[CreatePost] Scaling failed:', err);
            alert(`Scaling failed: ${err.message}`);
            setSizeWarningModal(prev => ({ ...prev, isScaling: false }));
        }
    };

    // Handle upgrade navigation
    const handleUpgrade = () => {
        setSizeWarningModal({
            isOpen: false,
            file: null,
            fileIndex: null,
            imageName: '',
            actualSize: '',
            isPremium: false,
            isScaling: false,
            pendingFiles: [],
        });
        navigate('/subscribe'); // Navigate to subscription page
    };

    // Handle cancel - skip this file and continue with the rest
    const handleCancelOversized = () => {
        const { pendingFiles, commonExif } = sizeWarningModal;

        setSizeWarningModal({
            isOpen: false,
            file: null,
            fileIndex: null,
            imageName: '',
            actualSize: '',
            isPremium: false,
            isScaling: false,
            pendingFiles: [],
        });

        // Process remaining files if any
        if (pendingFiles && pendingFiles.length > 0) {
            const dataTransfer = new DataTransfer();
            pendingFiles.forEach(f => dataTransfer.items.add(f));
            handleFileSelect({ target: { files: dataTransfer.files } });
        }
    };

    // Handle removing a slide
    const removeSlide = (index, e) => {
        e.stopPropagation();
        const newSlides = [...slides];
        if (newSlides[index].preview) {
            URL.revokeObjectURL(newSlides[index].preview);
        }
        newSlides.splice(index, 1);
        setSlides(newSlides);

        const newShowManualExif = { ...showManualExif };
        delete newShowManualExif[index];
        setShowManualExif(newShowManualExif);

        if (index === activeSlideIndex) {
            setActiveSlideIndex(Math.max(0, index - 1));
        } else if (index < activeSlideIndex) {
            setActiveSlideIndex(activeSlideIndex - 1);
        }
    };

    // Handle slide updates
    const updateSlide = (index, updates) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], ...updates };
        setSlides(newSlides);
    };

    // Handle manual EXIF save for active slide
    const handleManualExifSave = (exifData) => {
        // Safe Merge: Preserve any existing fields in manualExif that aren't in exifData
        const existingManualExif = slides[activeSlideIndex].manualExif || {};
        const mergedExif = { ...existingManualExif, ...exifData };

        updateSlide(activeSlideIndex, { manualExif: mergedExif });
        setShowManualExif(prev => ({ ...prev, [activeSlideIndex]: false }));
    };

    // Photo reordering functions
    const moveSlide = (fromIndex, direction) => {
        const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;

        if (toIndex < 0 || toIndex >= slides.length) return;

        const newSlides = [...slides];
        [newSlides[fromIndex], newSlides[toIndex]] = [newSlides[toIndex], newSlides[fromIndex]];

        setSlides(newSlides);

        // Update active slide index
        if (activeSlideIndex === fromIndex) {
            setActiveSlideIndex(toIndex);
        } else if (activeSlideIndex === toIndex) {
            setActiveSlideIndex(fromIndex);
        }
    };

    const reorderStackItems = async (slideIndex, itemIndex, direction) => {
        const slide = slides[slideIndex];
        if (!slide || slide.type !== 'stack' || !slide.items) return;

        const toIndex = direction === 'left' ? itemIndex - 1 : itemIndex + 1;
        if (toIndex < 0 || toIndex >= slide.items.length) return;

        setIsProcessingStack(true);

        try {
            const newItems = [...slide.items];
            // Swap
            [newItems[itemIndex], newItems[toIndex]] = [newItems[toIndex], newItems[itemIndex]];

            // Regenerate
            const { previewUrl, blob } = await generateStackPreview(newItems, slide.layout);
            const collageFile = new File([blob], `stack_${slide.layout}_${Date.now()}.jpg`, { type: 'image/jpeg' });

            updateSlide(slideIndex, {
                items: newItems,
                file: collageFile,
                preview: previewUrl
            });
        } catch (err) {
            logger.error("Stack reorder error:", err);
            alert("Failed to reorder: " + err.message);
        } finally {
            setIsProcessingStack(false);
        }
    };

    const handleDragStart = (e, index) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

        if (dragIndex === dropIndex || isNaN(dragIndex)) return;

        const newSlides = [...slides];
        const [draggedSlide] = newSlides.splice(dragIndex, 1);
        newSlides.splice(dropIndex, 0, draggedSlide);

        setSlides(newSlides);

        // Adjust active slide index
        if (activeSlideIndex === dragIndex) {
            setActiveSlideIndex(dropIndex);
        } else if (dragIndex < activeSlideIndex && dropIndex >= activeSlideIndex) {
            setActiveSlideIndex(activeSlideIndex - 1);
        } else if (dragIndex > activeSlideIndex && dropIndex <= activeSlideIndex) {
            setActiveSlideIndex(activeSlideIndex + 1);
        }
    };

    // Tag Handling
    const handleTagToggle = (tag) => {
        setTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            }
            if (prev.length >= 20) return prev;
            return [...prev, tag];
        });
    };

    const toggleCategory = (catId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [catId]: !prev[catId]
        }));
    };

    // Swipe handlers for carousel
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && activeSlideIndex < slides.length - 1) {
            setActiveSlideIndex(activeSlideIndex + 1);
        }
        if (isRightSwipe && activeSlideIndex > 0) {
            setActiveSlideIndex(activeSlideIndex - 1);
        }
    };



    // Handle form submission
    const handleSubmit = async () => {
        // 🔒 DOUBLE-POST PREVENTION
        if (submittingRef.current || loading) {
            logger.warn('Submit blocked: already submitting');
            return;
        }
        submittingRef.current = true;

        if (postType === 'image' && slides.length === 0) {
            submittingRef.current = false;
            return alert("Add at least one image");
        }

        if (postType === 'text' && !textContent.trim()) {
            submittingRef.current = false;
            return alert("Text post body cannot be empty");
        }

        // Rate Limiting Check
        try {
            const postsRef = collection(db, 'posts');
            const q = query(
                postsRef,
                where('authorId', '==', currentUser.uid),
                orderBy('createdAt', 'desc'),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const lastPost = snapshot.docs[0].data();
                if (lastPost.createdAt) {
                    const lastPostTime = lastPost.createdAt.toDate();
                    const now = new Date();
                    const timeDiff = now - lastPostTime;
                    const oneMinute = 60 * 1000;

                    if (timeDiff < oneMinute) {
                        const remainingSeconds = Math.ceil((oneMinute - timeDiff) / 1000);
                        alert(`Please wait ${remainingSeconds} seconds before posting again.`);
                        submittingRef.current = false;
                        return;
                    }
                }
            }
        } catch (err) {
            logger.error('Error checking rate limit:', err);
            // Continue if check fails, don't block user for error
        }

        try {
            logger.log('🚀 Starting post creation...');
            // Get collection's postToFeed setting if a collection is selected
            const selectedCollection = selectedCollectionId
                ? collections.find(c => c.id === selectedCollectionId)
                : null;

            logger.log('📝 Processing slides...', slides.length);
            // Apply shared title logic
            const processedSlides = shareTitleAcrossImages
                ? slides.map(slide => ({ ...slide, title: title }))
                : slides;

            logger.log('📤 Calling createPost...');
            await createPost({
                title,
                tags,
                type: primaryMode, // Legacy compatibility (Art/Social)
                postType: postType, // 'image' or 'text'
                primaryMode: primaryMode, // 'social' or 'art'
                isHumor: isHumor,
                location,
                // Image specific
                filmMetadata: (postType === 'image' && filmMetadata.isFilm) ? filmMetadata : null,
                enableRatings: enableRatings,
                collectionId: selectedCollectionId || null,
                collectionPostToFeed: selectedCollection?.postToFeed ?? null,
                showInProfile: showInProfile,
                uiOverlays: postType === 'image' ? {
                    sprocketBorder: enableSprocketOverlay || false,
                    instantPhotoBorder: enableInstantPhotoOverlay || false,
                    instantPhotoCount: (enableInstantPhotoOverlay && instantPhotoCount) ? instantPhotoCount : 1,
                    instantPhotoStyle: (enableInstantPhotoOverlay && instantPhotoStyle) ? instantPhotoStyle : 'thin',
                    filmMode: filmMode || 'continuous',
                    quartzDate: enableQuartzDate ? {
                        text: quartzDateString || '',
                        color: quartzColor || '#000000',
                        format: quartzDateFormat || 'DD MM YY'
                    } : null
                } : null,
                atmosphereBackground: (postType === 'image' && slides.length === 1 && atmosphereBackground) ? atmosphereBackground : 'black',
                gradientColor: (postType === 'image' && slides.length === 1 && extractedColor) ? extractedColor : null,
                // Text specific
                body: postType === 'text' ? textContent : null,
                writerTheme: postType === 'text' ? writerTheme : null,
                linkedPostIds: postType === 'text' ? linkedPostIds : null,
            }, postType === 'image' ? processedSlides : []);

            // Create SpaceCard if requested
            if (createSpaceCard) {
                try {
                    // We need the postId from the created post. 
                    // However, useCreatePost hook doesn't return it directly in the current implementation shown.
                    // It likely returns it or we need to query for it.
                    // Based on the previous code, it seemed to rely on querying the last post.
                    // Let's assume for now we query the last post again or if createPost returns it.
                    // Checking useCreatePost usage: const { createPost } = useCreatePost();
                    // Usually these hooks return the ID. If not, we fall back to the query method used in rate limiting.

                    // Let's query for the latest post by this user to link it
                    const postsRef = collection(db, 'posts');
                    const q = query(
                        postsRef,
                        where('authorId', '==', currentUser.uid),
                        orderBy('createdAt', 'desc'),
                        limit(1)
                    );
                    const snapshot = await getDocs(q);

                    if (!snapshot.empty) {
                        const newPostId = snapshot.docs[0].id;

                        const cardData = {
                            creatorUid: currentUser.uid,
                            creatorName: currentUser.displayName || 'Anonymous',
                            frontImage: slides[0].preview, // Note: In real app, use the uploaded URL from post
                            title: spaceCardData.title || title || 'Untitled Card',
                            description: title,
                            rarity: spaceCardData.rarity,
                            editionType: spaceCardData.editionType,
                            editionSize: spaceCardData.editionSize,
                            linkedPostId: newPostId,
                            basePrice: spaceCardData.price,
                            soundTag: null,
                            isAudioCard: false
                        };

                        await SpaceCardService.createCard(cardData);
                        // console.log("SpaceCard created successfully");
                    }
                } catch (cardError) {
                    logger.error("Error creating SpaceCard:", cardError);
                    alert("Post created, but SpaceCard creation failed: " + cardError.message);
                }
            }

            // ✅ Clear draft on successful post
            clearDraft();
            setHasUnsavedChanges(false);

            // If text post, switch feed to list view so user can see it
            if (postType === 'text') {
                setFeedViewMode('list');
            }

            // Navigate directly to feed without alert
            navigate('/');
        } catch (err) {
            logger.error('Error creating post:', err);
            alert(`Failed to create post: ${err.message}`);
        } finally {
            submittingRef.current = false;
        }
    };

    const activeSlide = slides[activeSlideIndex];
    const hasExif = activeSlide?.exif || activeSlide?.manualExif;

    const getPublishButtonState = () => {
        if (loading) return { text: "Publishing...", disabled: true };
        if (postType === 'image') {
            if (slides.length === 0) {
                return { text: 'Add Images', disabled: true };
            }
        } else {
            // Text mode
            if (!textContent.trim()) {
                return { text: 'Write Something', disabled: true };
            }
        }
        // Title no longer required
        return { text: "Publish", action: handleSubmit, disabled: false };
    };

    // --- Stack Handler ---
    const handleStackSelect = async (e, layout) => {
        setIsProcessingStack(true);
        try {
            // Check slide limit
            if (slides.length >= 10) {
                alert("Maximum 10 slides allowed per post.");
                return;
            }

            const files = Array.from(e.target.files);
            if (files.length < 2) {
                alert("Please select at least 2 images for a stack.");
                return;
            }
            if (files.length > 4) {
                alert("Maximum 4 images allowed per stack.");
                return;
            }

            // Generate collage
            const { previewUrl, blob } = await generateStackPreview(files, layout);

            // Create a File object from the blob for the main "slide" image
            const collageFile = new File([blob], `stack_${layout}_${Date.now()}.jpg`, { type: 'image/jpeg' });

            const newSlide = {
                id: Date.now().toString(),
                type: 'stack', // New Type
                layout: layout,
                items: files, // The original files
                file: collageFile, // The collage (for upload/preview)
                preview: previewUrl,
                caption: '',
                filter: 'normal',
                aspectRatio: layout === 'vertical' ? 'auto' : 'auto', // Will be calculated
            };

            setSlides(prev => [...prev, newSlide]);
            setActiveSlideIndex(slides.length); // Point to new slide

            // Reset input
            e.target.value = '';
        } catch (err) {
            alert(err.message);
            logger.error("Stack generation error:", err);
            e.target.value = ''; // Reset input to allow retrying
        } finally {
            setIsProcessingStack(false);
        }
    };

    // --- Scroll Lock for Feed Preview ---
    useEffect(() => {
        if (showFeedPreview) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [showFeedPreview]);

    // --- Feed Preview Data and Overlay ---
    const previewPostData = useMemo(() => {
        return {
            id: 'preview-id',
            userId: currentUser?.uid,
            username: currentUser?.displayName || 'Post Preview',
            authorPhotoUrl: currentUser?.photoURL,
            title: title,
            location: location,
            // Map slides to the structure Post expects
            items: slides.map((s) => {
                if (s.type === 'stack') {
                    // For stacks, return the collage preview URL (not the items array)
                    return {
                        type: 'image', // Treat as image for rendering
                        url: s.preview, // The generated collage blob URL
                        aspectRatio: s.aspectRatio
                    };
                }
                return {
                    type: 'image',
                    url: s.preview,
                    manualExif: s.manualExif,
                };
            }),
            uiOverlays: {
                sprocketBorder: enableSprocketOverlay,
                instantPhotoBorder: enableInstantPhotoOverlay,
                quartzDate: enableQuartzDate ? {
                    text: quartzDateString,
                    color: quartzColor,
                    format: quartzDateFormat
                } : null,
                filmMode: filmMode,
                instantPhotoStyle: instantPhotoStyle
            },
            atmosphereBackground: slides.length === 1 ? atmosphereBackground : 'black',
            gradientColor: extractedColor,
            spaceCardId: createSpaceCard ? 'preview-card' : null,
            isSpaceCardCreator: true,
            spaceCardRarity: spaceCardData.rarity,
            tags: tags,
            createdAt: { toDate: () => new Date() },
            likes: 0,
            comments: 0
        };
    }, [currentUser, title, location, slides, enableSprocketOverlay, enableInstantPhotoOverlay, enableQuartzDate, quartzDateString, quartzColor, quartzDateFormat, filmMode, instantPhotoStyle, atmosphereBackground, extractedColor, createSpaceCard, spaceCardData, tags]);



    return (
        <div className="create-post-container">
            <PageHeader
                title="CREATE POST"
                leftAction={
                    <button onClick={() => navigate(-1)} className="header-btn">
                        <FaTimes /> <span className="cancel-text">Cancel</span>
                    </button>
                }
                rightAction={
                    <button
                        onClick={() => {
                            const state = getPublishButtonState();
                            if (!state.disabled && state.action) state.action();
                        }}
                        disabled={getPublishButtonState().disabled}
                        className="publish-btn-premium desktop-publish"
                    >
                        {loading ? (
                            <span>{Math.round(progress)}%</span>
                        ) : (
                            <>
                                {getPublishButtonState().text === 'Publish' && <FaRocket size={14} />}
                                {getPublishButtonState().text}
                            </>
                        )}
                    </button>
                }
                showProgress={loading}
                progress={progress}
                style={{ zIndex: 2000 }}
            />

            {/* Progress Dots removed to fix layout gap */}

            {/* Mobile Publish Button - Positioned via CSS */}
            <button
                onClick={() => {
                    const state = getPublishButtonState();
                    if (!state.disabled && state.action) state.action();
                }}
                disabled={getPublishButtonState().disabled}
                className="mobile-publish-btn"
            >
                {loading ? `Uploading ${Math.round(progress)}%` : getPublishButtonState().text}
            </button>



            {/* Format Selector */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '1rem 0 0.5rem',
                gap: '1rem'
            }}>
                <button
                    onClick={() => setPostType('image')}
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '20px',
                        border: postType === 'image' ? '1px solid #7FFFD4' : '1px solid rgba(255,255,255,0.1)',
                        background: postType === 'image' ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                        color: postType === 'image' ? '#7FFFD4' : '#888',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <FaImages /> IMAGE POST
                </button>
                <button
                    onClick={() => setPostType('text')}
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '20px',
                        border: postType === 'text' ? '1px solid #7FFFD4' : '1px solid rgba(255,255,255,0.1)',
                        background: postType === 'text' ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                        color: postType === 'text' ? '#7FFFD4' : '#888',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <FaAlignLeft /> TEXT POST
                </button>
            </div>

            <div className="create-post-layout">
                {/* LEFT COLUMN: Content (Image Previews OR Text Editor) */}
                <div className="preview-column">

                    {/* TEXT COMPOSER */}
                    {postType === 'text' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                            {/* Theme Selector */}
                            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                {Object.entries(WRITER_THEMES).map(([key, theme]) => (
                                    <button
                                        key={key}
                                        onClick={() => setWriterTheme(key)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: theme.bg,
                                            border: writerTheme === key ? '2px solid #7FFFD4' : '1px solid #555',
                                            cursor: 'pointer',
                                            flexShrink: 0
                                        }}
                                        title={theme.name}
                                    />
                                ))}
                            </div>

                            {/* Writer Canvas */}
                            <div style={{
                                flex: 1,
                                background: WRITER_THEMES[writerTheme].bg,
                                border: WRITER_THEMES[writerTheme].border,
                                borderRadius: '12px',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                minHeight: '400px',
                                transition: 'all 0.3s ease'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Title (Optional)"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: '1.8rem',
                                        fontWeight: '800',
                                        color: WRITER_THEMES[writerTheme].text,
                                        fontFamily: '"Rajdhani", sans-serif',
                                        width: '100%',
                                        outline: 'none'
                                    }}
                                />
                                <textarea
                                    placeholder="Write your story..."
                                    value={textContent}
                                    onChange={(e) => setTextContent(e.target.value)}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        resize: 'none',
                                        fontSize: '1.1rem',
                                        lineHeight: '1.6',
                                        color: WRITER_THEMES[writerTheme].text,
                                        fontFamily: 'var(--font-family-body)',
                                        outline: 'none',
                                        minHeight: '300px'
                                    }}
                                />
                            </div>

                            <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                                Text posts appear in List View. Linked posts appear in the post info panel.
                            </p>
                        </div>
                    )}

                    {/* IMAGE PREVIEW COLUMN Content (Only show if Image mode) */}
                    {postType === 'image' && (
                        <>
                            {/* MOBILE TITLE INPUT (Visible only on Mobile Portrait) */}
                            <div className="mobile-only-title" style={{ marginBottom: '1rem', display: 'none' }}>
                                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            placeholder="Title your post"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="form-input"
                                            style={{
                                                fontSize: '1.2rem',
                                                fontWeight: '700',
                                                border: 'none',
                                                borderBottom: '1px solid #333',
                                                borderRadius: 0,
                                                padding: '0.5rem 0',
                                                background: 'transparent',
                                                color: '#7FFFD4',
                                                transition: 'all 110ms ease-out',
                                                boxShadow: 'none',
                                                width: '100%',
                                                fontFamily: '"Rajdhani", sans-serif',
                                                textTransform: 'uppercase',
                                                flex: 1
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0.5rem',
                                                color: showEmojiPicker ? '#7FFFD4' : '#666',
                                                transition: 'color 0.2s',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <FaSmile size={24} />
                                        </button>
                                    </div>
                                    <SearchEmojiPicker
                                        visible={showEmojiPicker}
                                        onSelect={handleEmojiSelect}
                                        isMobile={true}
                                    />
                                </div>

                                {/* Mobile Post Type Toggle */}
                                <div className="post-type-toggle" style={{ display: 'flex', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => setPrimaryMode("art")}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            marginRight: '0.5rem',
                                            borderRadius: '6px',
                                            border: primaryMode === "art" ? '1px solid #7FFFD4' : '1px solid rgba(255,255,255,0.1)',
                                            background: primaryMode === "art" ? 'rgba(127, 255, 212, 0.15)' : 'transparent',
                                            color: primaryMode === "art" ? '#7FFFD4' : '#888',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        Art
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPrimaryMode("social")}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '6px',
                                            border: primaryMode === "social" ? '1px solid #7FFFD4' : '1px solid rgba(255,255,255,0.1)',
                                            background: primaryMode === "social" ? 'rgba(127, 255, 212, 0.15)' : 'transparent',
                                            color: primaryMode === "social" ? '#7FFFD4' : '#888',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        Social
                                    </button>
                                    {/* Humor Checkbox (Mobile) */}
                                    <label title="Memes, jokes, or comedic content" style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: '0.4rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', color: isHumor ? '#7FFFD4' : '#888' }}>
                                        <input
                                            type="checkbox"
                                            checked={isHumor}
                                            onChange={(e) => setIsHumor(e.target.checked)}
                                            style={{ accentColor: '#7FFFD4', transform: 'scale(1.1)' }}
                                        />
                                        HUMOR
                                    </label>
                                </div>
                            </div>

                            {/* Loading Indicator for Photo Processing */}
                            {isProcessingStack && (
                                <div style={{
                                    width: '100%',
                                    height: '2px',
                                    background: 'rgba(255,255,255,0.1)',
                                    marginBottom: '1rem',
                                    overflow: 'hidden',
                                    borderRadius: '2px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        width: '50%',
                                        height: '100%',
                                        background: 'var(--ice-mint)',
                                        position: 'absolute',
                                        animation: 'loading-line 1s infinite linear',
                                    }}></div>
                                    <style>{`
                                @keyframes loading-line {
                                    0% { left: -50%; width: 50%; }
                                    50% { left: 25%; width: 75%; }
                                    100% { left: 100%; width: 50%; }
                                }
                            `}</style>
                                </div>
                            )}

                            {/* 1. Image Carousel & Stack Controls */}
                            <div className="stack-controls-row" style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', opacity: isProcessingStack ? 0.5 : 1, pointerEvents: isProcessingStack ? 'none' : 'auto' }}>

                                {/* Vertical Stack Button */}
                                <label className="stack-btn" style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    padding: '0.6rem 0.8rem', /* Reduced horizontal padding */
                                    color: '#e0e0e0',
                                    display: 'flex', alignItems: 'center', gap: '0.4rem', /* Reduced gap */
                                    cursor: 'pointer', fontSize: '0.85rem',
                                    position: 'relative',
                                    whiteSpace: 'nowrap' /* Prevent text wrap */
                                }}>
                                    <FaArrowsAltV size={16} />
                                    <span className="stack-btn-text">Vertical Stack</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleStackSelect(e, 'vertical')}
                                    />
                                </label>

                                {/* Horizontal Row Button */}
                                <label className="stack-btn" style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    padding: '0.6rem 0.8rem',
                                    color: '#e0e0e0',
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    cursor: 'pointer', fontSize: '0.85rem',
                                    whiteSpace: 'nowrap'
                                }}>
                                    <FaArrowsAltH size={16} />
                                    <span className="stack-btn-text">Horizontal Row</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleStackSelect(e, 'horizontal')}
                                    />
                                </label>

                                {/* Grid Collage Button */}
                                <label className="stack-btn" style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    padding: '0.6rem 0.8rem',
                                    color: '#e0e0e0',
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    cursor: 'pointer', fontSize: '0.85rem',
                                    whiteSpace: 'nowrap'
                                }}>
                                    <FaThLarge size={14} />
                                    <span className="stack-btn-text">Grid Collage</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleStackSelect(e, 'grid')}
                                    />
                                </label>
                            </div>

                            <ImageCarousel
                                slides={slides}
                                activeSlideIndex={activeSlideIndex}
                                setActiveSlideIndex={setActiveSlideIndex}
                                removeSlide={removeSlide}
                                updateSlide={updateSlide}
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                                handleDragStart={handleDragStart}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop}
                                moveSlide={moveSlide}
                                onAddMoreClick={() => fileInputRef.current?.click()}
                            />


                            {/* Stack Order Settings - Below Image Preview */}
                            {activeSlide?.type === 'stack' && activeSlide?.items && (
                                <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600' }}>Stack Order</span>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{activeSlide.items.length} items</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                        {activeSlide.items.map((file, idx) => (
                                            <div key={idx} style={{
                                                position: 'relative',
                                                width: '70px',
                                                flexShrink: 0,
                                                opacity: isProcessingStack ? 0.5 : 1
                                            }}>
                                                <div style={{
                                                    width: '70px',
                                                    height: '70px',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    marginBottom: '0.3rem',
                                                    border: '1px solid rgba(255,255,255,0.2)'
                                                }}>
                                                    <StackThumbnail file={file} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.25rem' }}>
                                                    <button
                                                        onClick={() => reorderStackItems(activeSlideIndex, idx, 'left')}
                                                        disabled={idx === 0 || isProcessingStack}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.1)',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            color: '#fff',
                                                            width: '32px',
                                                            height: '26px',
                                                            cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            opacity: idx === 0 ? 0.3 : 1,
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <FaChevronLeft size={10} />
                                                    </button>
                                                    <button
                                                        onClick={() => reorderStackItems(activeSlideIndex, idx, 'right')}
                                                        disabled={idx === activeSlide.items.length - 1 || isProcessingStack}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.1)',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            color: '#fff',
                                                            width: '32px',
                                                            height: '26px',
                                                            cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            opacity: idx === activeSlide.items.length - 1 ? 0.3 : 1,
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <FaChevronRight size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {isProcessingStack && <div style={{ fontSize: '0.75rem', color: 'var(--ice-mint)', marginTop: '0.5rem', textAlign: 'center' }}>Updating stack...</div>}
                                </div>
                            )}

                            {/* FEED PREVIEW BUTTON */}
                            {slides.length > 0 && (
                                <button
                                    onClick={() => setShowFeedPreview(true)}
                                    style={{
                                        width: '100%',
                                        marginTop: '0.5rem',
                                        padding: '0.75rem',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s'
                                    }}
                                    className="preview-feed-btn"
                                >
                                    <FaEye /> Feed Preview
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />

                            {/* 2. Tags & Categories (Moved to Left) */}
                            {/* 2. Tags & Categories (Moved to Left) - Collapsible on Mobile */}
                            {/* 2. Tags & Categories */}
                            <div style={{ marginTop: '1rem' }}>
                                <TagCategoryPanel
                                    tags={tags}
                                    handleTagToggle={handleTagToggle}
                                    expandedCategories={expandedCategories}
                                    toggleCategory={toggleCategory}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT COLUMN: Post Details & Settings */}
                <div className="form-column">
                    <div className="form-section" style={{
                        padding: '0.75rem 0.75rem 0.75rem',
                        border: '1px solid rgba(127, 255, 212, 0.15)',
                        boxShadow: '0 0 8px rgba(127, 255, 212, 0.08)'
                    }}>
                        <style>{`
                            input::placeholder {
                                color: rgba(255, 255, 255, 0.45);
                            }
                        `}</style>

                        {/* Post Type Toggle */}
                        <div className="post-type-toggle desktop-only-post-type" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '0.75rem', fontSize: '0.8rem', opacity: 0.8, fontWeight: 600, color: '#aaa' }}>
                                POST TYPE:
                            </span>
                            <button
                                type="button"
                                onClick={() => setPostType("art")}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    marginRight: '0.5rem',
                                    borderRadius: '6px',
                                    border: postType === "art" ? '1px solid #7FFFD4' : '1px solid rgba(255,255,255,0.1)',
                                    background: postType === "art" ? 'rgba(127, 255, 212, 0.15)' : 'transparent',
                                    color: postType === "art" ? '#7FFFD4' : '#888',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                Art
                            </button>
                            <button
                                type="button"
                                onClick={() => setPostType("social")}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    border: postType === "social" ? '1px solid #7FFFD4' : '1px solid rgba(255,255,255,0.1)',
                                    background: postType === "social" ? 'rgba(127, 255, 212, 0.15)' : 'transparent',
                                    color: postType === "social" ? '#7FFFD4' : '#888',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                Social
                            </button>
                            {/* Humor Checkbox (Desktop) */}
                            <label title="Memes, jokes, or comedic content" style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: '0.4rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', color: isHumor ? '#7FFFD4' : '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <input
                                    type="checkbox"
                                    checked={isHumor}
                                    onChange={(e) => setIsHumor(e.target.checked)}
                                    style={{ accentColor: '#7FFFD4', transform: 'scale(1.1)', cursor: 'pointer' }}
                                />
                                Humor
                            </label>
                        </div>

                        {/* Cinematic Background Toggle (Single Photo Only) */}
                        {slides.length === 1 && extractedColor && (
                            <div className="form-section-item" style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.6rem',
                                    paddingTop: '0.8rem',
                                    borderTop: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 600, color: '#aaa', textTransform: 'uppercase' }}>
                                        BACKGROUND STYLE
                                    </span>
                                    {calculatingColor && <span style={{ fontSize: '0.7rem', color: '#7FFFD4', fontStyle: 'italic' }}>Extracting color...</span>}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>

                                    {/* Black Option */}
                                    <button
                                        type="button"
                                        onClick={() => setAtmosphereBackground('black')}
                                        style={{
                                            flex: 1,
                                            padding: '0.6rem',
                                            borderRadius: '8px',
                                            border: atmosphereBackground === 'black' ? '1px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(0,0,0,0.5)',
                                            color: '#fff',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#000', border: '1px solid #555' }}></div>
                                        Standard
                                    </button>

                                    {/* Cinematic Gradient Option */}
                                    <button
                                        type="button"
                                        onClick={() => setAtmosphereBackground('cinematic-gradient')}
                                        style={{
                                            flex: 1,
                                            padding: '0.6rem',
                                            borderRadius: '8px',
                                            border: atmosphereBackground === 'cinematic-gradient' ? '1px solid #7FFFD4' : '1px solid rgba(255,255,255,0.1)',
                                            background: atmosphereBackground === 'cinematic-gradient' ? 'rgba(127, 255, 212, 0.1)' : 'rgba(0,0,0,0.5)',
                                            color: atmosphereBackground === 'cinematic-gradient' ? '#7FFFD4' : '#888',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${extractedColor}, #000)`,
                                            boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                                        }}></div>
                                        Cinematic
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="desktop-only-title" style={{ marginBottom: '0.5rem', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Title your post"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="form-input"
                                    style={{
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        border: 'none',
                                        borderBottom: '1px solid #333',
                                        borderRadius: 0,
                                        padding: '0.5rem 0',
                                        background: 'transparent',
                                        color: '#7FFFD4',
                                        transition: 'all 110ms ease-out',
                                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                                        flex: 1
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        color: showEmojiPicker ? '#7FFFD4' : '#666',
                                        transition: 'color 0.2s',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <FaSmile size={18} />
                                </button>
                            </div>
                            <SearchEmojiPicker
                                visible={showEmojiPicker}
                                onSelect={handleEmojiSelect}
                                isMobile={false}
                            />
                        </div>

                        {/* Share Title Toggle */}
                        <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#aaa' }}>
                                <style>{`
                                    input::placeholder {
                                        color: rgba(255, 255, 255, 0.45);
                                    }
                                `}</style>
                                <div style={{ position: 'relative', width: '36px', height: '18px' }}>
                                    <input
                                        type="checkbox"
                                        checked={shareTitleAcrossImages}
                                        onChange={(e) => setShareTitleAcrossImages(e.target.checked)}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        background: shareTitleAcrossImages ? '#7FFFD4' : '#333',
                                        borderRadius: '18px', transition: '0.3s'
                                    }}></div>
                                    <div style={{
                                        position: 'absolute', top: '2px', left: shareTitleAcrossImages ? '20px' : '2px',
                                        width: '14px', height: '14px', background: '#fff',
                                        borderRadius: '50%', transition: '0.3s'
                                    }}></div>
                                </div>
                                Use one title for all photos
                            </label>
                        </div>

                        {/* Collapsible Location Grid */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div
                                onClick={() => setIsLocationExpanded(!isLocationExpanded)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#aaa',
                                    marginBottom: isLocationExpanded ? '0.5rem' : '0',
                                    cursor: 'pointer',
                                    padding: '0.5rem 0'
                                }}
                            >
                                <FaMapMarkerAlt />
                                {isLocationExpanded ? 'Location' : 'Add Location'}
                                <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>
                                    {isLocationExpanded ? '▲' : '▼'}
                                </span>
                            </div>

                            {isLocationExpanded && (
                                <div className="location-grid" style={{ gap: '0.5rem', animation: 'fadeIn 0.2s ease' }}>
                                    <div className="location-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={location.city}
                                            onChange={(e) => setLocation({ ...location, city: e.target.value })}
                                            className="form-input location-input"
                                        />
                                    </div>
                                    <div className="location-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={location.state}
                                            onChange={(e) => setLocation({ ...location, state: e.target.value })}
                                            className="form-input location-input"
                                        />
                                    </div>
                                    <div className="location-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="Country"
                                            value={location.country}
                                            onChange={(e) => setLocation({ ...location, country: e.target.value })}
                                            className="form-input location-input"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Collection Selection (Common) */}
                    <CollectionSelector
                        collections={collections}
                        selectedCollectionId={selectedCollectionId}
                        setSelectedCollectionId={setSelectedCollectionId}
                        showInProfile={showInProfile}
                        setShowInProfile={setShowInProfile}
                    />

                    {/* Linked Posts Selector (Text Mode Only) */}
                    {postType === 'text' && (
                        <div className="form-section markdown-section" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>
                                Linked Posts
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                {linkedPostIds.map(id => (
                                    <div key={id} style={{ background: 'rgba(127,255,212,0.1)', color: '#7FFFD4', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>Post {id.slice(0, 5)}...</span>
                                        <button onClick={() => setLinkedPostIds(prev => prev.filter(pid => pid !== id))} style={{ background: 'none', border: 'none', color: '#7FFFD4', cursor: 'pointer' }}>×</button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={async () => {
                                    if (userPosts.length === 0) {
                                        try {
                                            const q = query(collection(db, 'posts'), where('authorId', '==', currentUser.uid), orderBy('createdAt', 'desc'), limit(10));
                                            const snap = await getDocs(q);
                                            setUserPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                                        } catch (e) {
                                            console.error("Error fetching user posts", e);
                                        }
                                    }
                                    setShowLinkSelector(true);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px dashed rgba(255,255,255,0.2)',
                                    color: '#ccc',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                }}
                            >
                                + Link Existing Post
                            </button>

                            {/* Simple Modal for Selection */}
                            {showLinkSelector && (
                                <div style={{
                                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <div style={{ width: '400px', maxHeight: '80vh', background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '1rem', overflowY: 'auto' }}>
                                        <h3 style={{ color: '#fff', marginTop: 0 }}>Select Post to Link</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {userPosts.map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        if (!linkedPostIds.includes(p.id)) {
                                                            setLinkedPostIds(prev => [...prev, p.id]);
                                                        }
                                                        setShowLinkSelector(false);
                                                    }}
                                                    style={{
                                                        padding: '0.5rem',
                                                        border: '1px solid #333',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        background: linkedPostIds.includes(p.id) ? 'rgba(127,255,212,0.1)' : 'transparent'
                                                    }}
                                                >
                                                    {/* Abstract Thumbnail */}
                                                    <div style={{ width: 40, height: 40, background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                                                        {p.thumbnailUrls?.[0] || p.images?.[0]?.url ? (
                                                            <img src={p.thumbnailUrls?.[0] || p.images?.[0]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '0.6rem' }}>TXT</div>
                                                        )}
                                                    </div>
                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                        <div style={{ color: '#fff', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title || 'Untitled'}</div>
                                                        <div style={{ color: '#666', fontSize: '0.75rem' }}>{new Date(p.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => setShowLinkSelector(false)} style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Film Options Panel (Image Mode Only) */}
                    {postType === 'image' && (
                        <FilmOptionsPanel
                            filmMetadata={filmMetadata}
                            setFilmMetadata={setFilmMetadata}
                            enableQuartzDate={enableQuartzDate}
                            setEnableQuartzDate={setEnableQuartzDate}
                            quartzDateString={quartzDateString}
                            setQuartzDateString={setQuartzDateString}
                            quartzColor={quartzColor}
                            setQuartzColor={setQuartzColor}
                            quartzDateFormat={quartzDateFormat}
                            setQuartzDateFormat={setQuartzDateFormat}
                            enableSprocketOverlay={enableSprocketOverlay}
                            setEnableSprocketOverlay={handleSprocketToggle}
                            enableInstantPhotoOverlay={enableInstantPhotoOverlay}
                            setEnableInstantPhotoOverlay={handleInstantPhotoToggle}
                            instantPhotoStyle={instantPhotoStyle}
                            setInstantPhotoStyle={setInstantPhotoStyle}
                        />
                    )}
                    {/* Rating System Toggle */}
                    <RatingSystemSelector
                        enableRatings={enableRatings}
                        setEnableRatings={setEnableRatings}
                    />

                    {/* Shop Options (Phase 6) */}
                    {activeSlide && activeSlide.type === 'image' && (
                        <ShopOptionsPanel
                            activeSlide={activeSlide}
                            updateSlide={(updates) => updateSlide(activeSlideIndex, updates)}
                            sellerStatus={sellerStatus}
                            isPremium={userIsPremium}
                        />
                    )}


                    {/* Active Image Settings (Contextual) */}
                    {activeSlide && (
                        <div className="form-section">
                            <h3>Image Settings</h3>

                            {/* Stack Reordering Controls - Moved to bottomSlot in PageHeader */}

                            {/* Per-Image Title (only shown when shareTitleAcrossImages is false) */}
                            {!shareTitleAcrossImages && (
                                <div className="form-field">
                                    <label>Image Title</label>
                                    <input
                                        type="text"
                                        placeholder="Title for this image..."
                                        value={activeSlide.title || ''}
                                        onChange={(e) => updateSlide(activeSlideIndex, { title: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                            )}


                            {/* EXIF Controls */}
                            <ManualExifEditor
                                activeSlide={activeSlide}
                                activeSlideIndex={activeSlideIndex}
                                showManualExif={showManualExif}
                                setShowManualExif={setShowManualExif}
                                handleManualExifSave={handleManualExifSave}
                                hasExif={hasExif}
                            />
                        </div>
                    )}
                </div>
            </div >

            {/* Animated Stars Background */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 0
            }}>
                {
                    stars.map((star) => (
                        <div
                            key={star.id}
                            style={{
                                position: 'absolute',
                                width: star.width + 'px',
                                height: star.height + 'px',
                                background: '#7FFFD4',
                                borderRadius: '50%',
                                top: star.top + '%',
                                left: star.left + '%',
                                opacity: star.opacity,
                                animation: `twinkle ${star.duration}s ease-in-out infinite`,
                                animationDelay: `${star.delay}s`,
                                boxShadow: `0 0 ${star.glow}px #7FFFD4`
                            }}
                        />
                    ))
                }
            </div>

            {/* FEED PREVIEW OVERLAY */}
            {showFeedPreview && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100dvh', // Dynamic viewport height
                    background: '#000',
                    zIndex: 9999,
                    overflow: 'hidden', // Lock scroll
                    overscrollBehavior: 'none', // Prevent bounce
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 'max(env(safe-area-inset-top), 20px)',
                        left: '20px',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        pointerEvents: 'auto'
                    }}>
                        <button
                            onClick={() => setShowFeedPreview(false)}
                            style={{
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            }}
                        >
                            <FaArrowLeft />
                        </button>
                        <span style={{
                            color: 'rgba(255,255,255,0.8)',
                            fontWeight: '600',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            background: 'rgba(0,0,0,0.4)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px'
                        }}>
                            Preview Mode
                        </span>
                    </div>
                    {/* Render Post with full height/width */}
                    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                        <Post post={previewPostData} priority="high" />
                    </div>
                </div>
            )}

            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                
                body {
                    overflow-x: hidden;
                    max-width: 100vw;
                }
                
                .create-post-container * { box-sizing: border-box; }
                .create-post-container {
                    height: 100vh; /* 🔒 ROOT LOCK */
                    background: var(--black);
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden; /* 🔒 NO SCROLL ON ROOT */
                    width: 100%;
                }
                .header-btn, .header-btn-primary {
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: none;
                    line-height: 1;
                    transition: all 0.2s ease;
                }
                .header-btn { 
                    background: transparent; 
                    color: rgba(255, 255, 255, 0.85);
                    font-weight: 650;
                    letter-spacing: 0.02em;
                }
                .header-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.95);
                    box-shadow: 0 0 6px rgba(255, 255, 255, 0.1);
                }
                .header-btn svg {
                    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.3));
                }
                .header-btn-primary { background: var(--ice-mint); color: var(--black); }
                .header-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                
                /* Mobile publish button - hidden by default */
                .mobile-publish-btn {
                    display: none;
                }

                /* Desktop: Make space for hamburger menu */
                @media (min-width: 901px) {
                    .page-header-container {
                        padding-left: 80px !important;
                        padding-right: 80px !important;
                    }
                    .page-header-content {
                        justify-content: space-between !important;
                    }
                }

                .create-post-layout {
                    flex: 1 1 auto; /* 🔒 FILL REMAINING SPACE */
                    display: grid;
                    grid-template-columns: 480px 1fr; /* Restored column widths */
                    gap: 2.75rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0; /* 🔒 NO PADDING ON WRAPPER */
                    width: 100%;
                    height: auto; /* 🔒 NO HEIGHT MATH */
                    overflow: hidden; /* 🔒 TRAP CHILD SCROLL */
                    position: relative;
                    z-index: 1;
                }

                .preview-column {
                    height: 100%; /* 🔒 FULL HEIGHT */
                    overflow-y: auto; /* 🔒 INDEPENDENT SCROLL */
                    overflow-x: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding: 1.5rem 1rem 4rem 0.5rem; /* Gap at top, spacing at bottom */
                    box-sizing: border-box;
                    scrollbar-gutter: stable; /* 🔒 PREVENTS LAYOUT SHIFT/BLINKING */
                }

                .form-column {
                    height: 100%; /* 🔒 FULL HEIGHT */
                    overflow-y: auto; /* 🔒 INDEPENDENT SCROLL */
                    overflow-x: hidden;
                    padding: 1.5rem 1rem 4rem 0.5rem; /* Gap at top, spacing at bottom */
                    box-sizing: border-box;
                    scrollbar-gutter: stable; /* 🔒 PREVENTS LAYOUT SHIFT/BLINKING */
                }

                .form-section {
                    background: var(--graphite);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.25rem 1.5rem;
                    margin-bottom: 1.5rem;
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                }
                .form-section h3 { margin-top: 0; color: var(--ice-mint); font-size: 1.1rem; margin-bottom: 1.5rem; }
                
                .form-input, .form-textarea {
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                    transition: all 110ms ease-out;
                }
                .form-input:focus, .form-textarea:focus {
                    outline: none;
                    border-color: rgba(127, 255, 212, 0.5) !important;
                    box-shadow: 0 0 8px rgba(127, 255, 212, 0.2), inset 0 1px 3px rgba(0,0,0,0.15);
                    background: radial-gradient(circle at center, rgba(127, 255, 212, 0.02), transparent 70%) !important;
                }

                .location-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                }
                
                .collectible-section {
                    background: rgba(0, 255, 157, 0.05);
                    border: 1px solid rgba(0, 255, 157, 0.2);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .collectible-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--ice-mint);
                    margin-bottom: 1rem;
                    font-weight: 600;
                }

                .toggle-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .sound-tag-search {
                    position: relative;
                    margin-top: 1rem;
                }

                .sound-results {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 10;
                    margin-top: 0.5rem;
                }

                .sound-result-item {
                    padding: 0.75rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border-bottom: 1px solid #333;
                }
                .sound-result-item:hover { background: #333; }

                /* Carousel & Thumbnails */
                .carousel-container { width: 100%; position: relative; z-index: 1; background: var(--black); }
                .carousel-track { display: flex; width: 100%; }
                .carousel-slide { 
                    min-width: 100%; 
                    aspect-ratio: 1; 
                    background: var(--graphite); 
                    border-radius: 12px; 
                    overflow: hidden; 
                    position: relative; 
                    border: 2px solid rgba(255, 255, 255, 0.1); 
                }
                .carousel-slide img { width: 100%; height: 100%; object-fit: contain; user-select: none; }
                .carousel-overlay { position: absolute; inset: 0; pointer-events: none; }
                .carousel-overlay button, .carousel-overlay label { pointer-events: auto; }
                
                .carousel-dots { display: flex; justify-content: center; gap: 0.5rem; padding: 1rem 0; }
                .carousel-dots .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.3); border: none; cursor: pointer; padding: 0; transition: all 0.2s; }
                .carousel-dots .dot.active { background: var(--ice-mint); width: 24px; border-radius: 4px; }

                .thumbnail-scrollbar { display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.5rem 0; margin: 0.5rem 0; }
                .thumbnail-scrollbar::-webkit-scrollbar { height: 8px; }
                .thumbnail-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
                .thumbnail-scrollbar::-webkit-scrollbar-thumb { background: rgba(127, 255, 212, 0.6); border-radius: 4px; }
                .thumbnail { min-width: 40px; height: 40px; border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; border: 2px solid rgba(255, 255, 255, 0.2); transition: all 0.2s; }
                .thumbnail:hover { border-color: var(--ice-mint); transform: scale(1.05); }
                .thumbnail.active { border-color: var(--ice-mint); box-shadow: 0 0 10px rgba(127, 255, 212, 0.3); }

                .slide-remove-btn { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                .overlay-bottom-bar { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.9)); padding: 1rem; display: flex; justify-content: space-between; align-items: center; }
                
                .shop-toggle-small { display: flex; align-items: center; gap: 0.5rem; color: #fff; cursor: pointer; font-size: 0.8rem; }
                .exif-badge { background: var(--ice-mint); color: #000; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; }
                
                .empty-state { 
                    padding: 3rem; 
                    text-align: center; 
                    color: var(--slate); 
                    border: 1px solid var(--ice-mint); 
                    box-shadow: 0 0 12px rgba(127, 255, 212, 0.12), inset 0 0 15px rgba(127, 255, 212, 0.04), 0 4px 12px rgba(0, 0, 0, 0.2);
                    border-radius: 12px; 
                    cursor: pointer;
                    aspect-ratio: auto;
                    min-height: 282px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    position: relative;
                    overflow: hidden;
                    transition: all 110ms ease-out;
                }
                .empty-state:hover {
                    box-shadow: 0 0 18px rgba(127, 255, 212, 0.18), inset 0 0 20px rgba(127, 255, 212, 0.06), 0 6px 16px rgba(0, 0, 0, 0.25);
                    transform: translateY(-2px);
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.5); opacity: 1; }
                }
                
                .add-more-carousel-btn {
                    width: 100%;
                    padding: 0.75rem;
                    margin-top: 0.5rem;
                    background: rgba(127, 255, 212, 0.1);
                    border: 1px dashed var(--ice-mint);
                    color: var(--ice-mint);
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .add-more-carousel-btn:hover {
                    background: rgba(127, 255, 212, 0.2);
                }

                .sprocket-overlay { position: absolute; inset: 0; background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><pattern id="sprocket" x="0" y="0" width="10" height="100" patternUnits="userSpaceOnUse"><rect x="2" y="0" width="6" height="4" fill="rgba(0,0,0,0.85)" /><rect x="2" y="96" width="6" height="4" fill="rgba(0,0,0,0.85)" /></pattern></defs><rect width="100" height="100" fill="url(%23sprocket)" /></svg>'); background-size: 100% 100%; background-repeat: no-repeat; pointer-events: none; z-index: 5; }
                .quartz-date-stamp { position: absolute; bottom: 12px; right: 12px; font-family: 'Courier New', 'Courier', monospace; font-size: 16px; font-weight: bold; letter-spacing: 2px; text-shadow: 0 0 4px rgba(0,0,0,0.9), 1px 1px 2px rgba(0,0,0,0.8); pointer-events: none; z-index: 6; padding: 4px 6px; background: rgba(0,0,0,0.3); border-radius: 2px; }

                /* 🔹 UNIVERSAL RESPONSIVE ALGORITHM - MOBILE IMPLEMENTATION */
                @media (max-width: 900px) and (orientation: landscape) {
                    .create-post-layout {
                        display: grid !important;
                        grid-template-columns: 300px 1fr !important;
                        padding: 1rem !important;
                        gap: 1rem !important;
                        height: 100dvh !important;
                        overflow: hidden !important;
                    }
                    .preview-column, .form-column {
                        height: 100% !important;
                        overflow-y: auto !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    /* Reorder for mobile landscape too if needed, but keeping separate */
                    .desktop-publish { display: flex !important; }
                    .mobile-publish-btn { display: none !important; }
                    
                    /* Ensure tags scroll in landscape too */
                    .tags-grid {
                        display: grid !important;
                        grid-auto-flow: column !important;
                        overflow-x: auto !important;
                        max-width: 100% !important;
                        gap: 0.5rem !important;
                    }
                    .tag-filter-panel, .panel-content {
                        max-width: 100% !important;
                        overflow: hidden !important;
                    }
                }

                @media (max-width: 900px) and (orientation: portrait) {
                    .create-post-layout {
                        display: flex !important;
                        flex-direction: column !important;
                        height: auto !important;
                        overflow: visible;
                        padding: 1.5rem;
                        padding-top: max(1.5rem, env(safe-area-inset-top));
                        padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
                        gap: 1.5rem;
                        max-width: 100vw;
                        box-sizing: border-box;
                    }
                    .preview-column, .form-column {
                        height: auto;
                        overflow: visible;
                        padding: 0;
                        width: 100%;
                        max-width: 100%;
                    }
                    /* Move form to top on mobile portrait - REMOVED to keep Photos below Title (via duplication) */
                    /* .form-column { order: -1; } */
                    
                    .create-post-container {
                        overflow-x: hidden;
                        overflow-y: auto;
                        height: auto;
                        min-height: 100dvh;
                        padding-bottom: 80px; /* Space for mobile nav if needed */
                    }
                    
                    /* Carousel Sizing - 16:9 Aspect Ratio */
                    .carousel-slide { 
                        aspect-ratio: 16/9;
                        max-height: 50vh;
                    }
                    .empty-state {
                        aspect-ratio: auto;
                        min-height: 250px;
                        height: auto;
                        padding: 2rem;
                    }
                    .empty-state svg {
                        width: 48px;
                        height: 48px;
                    }
                    .empty-state p {
                        font-size: 1rem;
                        margin: 0.5rem 0 0 0;
                    }
                    .empty-state span {
                        font-size: 0.85rem;
                    }
                    
                    .form-section {
                        padding: 1.5rem;
                        margin-left: 0;
                        margin-right: 0;
                        margin-bottom: 1.5rem;
                        width: 100%;
                    }
                    
                    /* Hide desktop publish, show mobile publish */
                    .desktop-publish {
                        display: none !important;
                    }

                    .mobile-publish-btn {
                        display: block !important;
                        position: static !important;
                        transform: none !important;
                        width: 100% !important;
                        min-width: auto !important;
                        margin-top: 1.5rem !important;
                        margin-bottom: 1.5rem !important;
                        left: auto !important;
                        bottom: auto !important;
                        
                        height: 50px;
                        font-size: 1rem;
                        
                        background: var(--ice-mint);
                        color: #000;
                        border: none;
                        border-radius: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                    }

                    /* --- MOBILE TITLES & ICONS --- */
                    .mobile-only-title {
                        display: block !important;
                    }
                    .desktop-only-title {
                        display: none !important;
                    }
                    .desktop-only-post-type {
                        display: none !important;
                    }
                    .stack-btn-text {
                        display: none !important;
                    }
                    .stack-btn {
                        padding: 0.8rem !important;
                        justify-content: center !important;
                        gap: 0 !important;
                    }

                    /* Hide Cancel text, keep icon */
                    .cancel-text {
                        display: none;
                    }
                    
                    /* Adjust header title alignment */
                    .page-header-title {
                        text-align: left !important;
                        font-size: 1.1rem !important;
                    }
                    
                    /* Tag Panels - Compact & Scaled */
                    .tag-filter-panel {
                        margin-bottom: 1rem !important;
                        border-radius: 12px !important;
                        max-width: 100% !important;
                        overflow: hidden !important;
                    }
                    .panel-header {
                        padding: 1rem 1.25rem !important;
                    }
                    .panel-header span:first-child {
                        font-size: 0.95rem !important;
                    }
                    .panel-header span:last-child {
                        font-size: 0.8rem !important;
                    }
                    .panel-content {
                        padding: 1rem 1.25rem 1.25rem !important;
                        max-width: 100% !important;
                        overflow: hidden !important;
                    }
                    .tags-grid {
                        display: grid !important;
                        grid-auto-flow: column !important;
                        overflow-x: auto !important;
                        max-width: 100% !important;
                        gap: 0.75rem !important;
                    }
                    .tags-grid button {
                        padding: 0.6rem 1rem !important;
                        font-size: 0.85rem !important;
                        border-radius: 6px !important;
                    }
                    
                    .location-grid { 
                        grid-template-columns: 1fr;
                        gap: 0.75rem;
                    }
                    
                    .add-more-carousel-btn {
                        padding: 1rem;
                        font-size: 0.9rem;
                    }
                }

                @media (max-width: 480px) {
                    /* Additional tweaks for very small screens if needed, 
                       but the vw-unit scaling should handle most of it automatically! */
                    
                    /* Ensure carousel doesn't get too tall on very wide/short phones */
                    .carousel-slide {
                        max-height: 30vh;
                    }
                    .empty-state {
                        max-height: 30vh;
                    }
                }
                /* Premium Publish Button */
                .publish-btn-premium {
                    background: linear-gradient(135deg, #7FFFD4, #40E0D0);
                    color: #000;
                    border: none;
                    border-radius: 12px;
                    padding: 0.6rem 1.5rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: all 140ms cubic-bezier(0.2, 0.8, 0.2, 1);
                    box-shadow: 0 0 6px rgba(127, 255, 212, 0.18), 0 4px 12px rgba(0, 0, 0, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    line-height: 1;
                    height: fit-content;
                }
                .publish-btn-premium:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 0 12px rgba(127, 255, 212, 0.3), 0 6px 20px rgba(0, 0, 0, 0.4);
                }
                .publish-btn-premium:active {
                    transform: translateY(0px) scale(0.98);
                    transition: all 70ms ease-out;
                }
                .publish-btn-premium::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    animation: shimmer 3s infinite;
                }
                @keyframes shimmer {
                    0% { left: -100%; }
                    20% { left: 100%; }
                    100% { left: 100%; }
                }

                /* Progress Dots */
                .progress-dots-container {
                    position: fixed;
                    right: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 100;
                }
                .progress-dot {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255,255,255,0.3);
                    transition: all 0.3s ease;
                    position: relative;
                }
                .progress-dot.active {
                    background: rgba(127, 255, 212, 0.2);
                    color: var(--ice-mint);
                    box-shadow: 0 0 10px rgba(127, 255, 212, 0.2);
                }
                .progress-dot.completed {
                    background: var(--ice-mint);
                    color: #000;
                    box-shadow: 0 0 15px rgba(127, 255, 212, 0.4);
                }
                .dot-line {
                    position: absolute;
                    bottom: -10px;
                    width: 2px;
                    height: 10px;
                    background: rgba(255,255,255,0.1);
                }
                .progress-dot.completed .dot-line {
                    background: var(--ice-mint);
                }
                @media (max-width: 900px) {
                    .progress-dots-container { display: none; }
                }

                /* Location Inputs */
                .location-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    background: rgba(255,255,255,0.03);
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.2s;
                }
                .location-input-wrapper:focus-within {
                    border-color: var(--ice-mint);
                    box-shadow: 0 0 10px rgba(127, 255, 212, 0.1);
                }
                .location-icon {
                    margin-left: 0.8rem;
                    color: var(--ice-mint);
                    opacity: 0.7;
                }
                .location-input {
                    background: transparent !important;
                    border: none !important;
                    padding: 0.6rem !important;
                    color: #fff !important;
                    width: 100%;
                }
                .location-input:focus {
                    outline: none;
                }

                /* Mobile Publish Button Style Update */
                .mobile-publish-btn {
                    background: linear-gradient(135deg, #7FFFD4, #40E0D0) !important;
                    color: #000 !important;
                    box-shadow: 0 4px 20px rgba(127, 255, 212, 0.3) !important;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
            `}</style>

            {/* Image Size Warning Modal */}
            <ImageSizeWarningModal
                isOpen={sizeWarningModal.isOpen}
                imageName={sizeWarningModal.imageName}
                actualSize={sizeWarningModal.actualSize}
                limitSize={getMaxImageSizeMB(userIsPremium)}
                isPremium={userIsPremium}
                onScaleDown={handleScaleDown}
                onUpgrade={handleUpgrade}
                onCancel={handleCancelOversized}
                isScaling={sizeWarningModal.isScaling}
            />
        </div>
    );
};

export default CreatePost;
