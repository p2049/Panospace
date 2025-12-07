import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCreatePost } from '../hooks/useCreatePost';
import { useCollections } from '../hooks/useCollections';
import { PRINT_TIERS } from '../utils/printifyPricing';
import { isFeatureEnabled } from '../config/featureFlags';
import { useDraftSaving } from '../hooks/useDraftSaving';

import ThumbnailStrip from '../components/create-post/ThumbnailStrip';
import ImageCarousel from '../components/create-post/ImageCarousel';
import TagCategoryPanel from '../components/create-post/TagCategoryPanel';
import FilmOptionsPanel from '../components/create-post/FilmOptionsPanel';
import ManualExifEditor from '../components/create-post/ManualExifEditor';
import ShopConfiguration from '../components/create-post/ShopConfiguration';
import CollectionSelector from '../components/create-post/CollectionSelector';
import RatingSystemSelector from '../components/create-post/RatingSystemSelector';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { SpaceCardService } from '../services/SpaceCardService';
import PageHeader from '../components/PageHeader';
import { FaTimes, FaPlus, FaTrash, FaMapMarkerAlt, FaRocket, FaImages, FaPen, FaCheckCircle } from 'react-icons/fa';





const CreatePost = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { createPost, loading, error, progress } = useCreatePost();
    const { collections } = useCollections(currentUser?.uid);
    const { saveDraft, loadDraft, clearDraft, hasDraft } = useDraftSaving();
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
    const [postType, setPostType] = useState('art'); // Unified Post Type State

    // Slides State
    const [slides, setSlides] = useState([]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    // Manual EXIF state
    const [showManualExif, setShowManualExif] = useState({});

    // Carousel/Swipe state
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Tag Panel State
    const [expandedCategories, setExpandedCategories] = useState({
        aesthetic: true,
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
    const [enableSprocketOverlay, setEnableSprocketOverlay] = useState(true);
    const [filmMode, setFilmMode] = useState('continuous'); // 'continuous' or 'cut'
    const [enableQuartzDate, setEnableQuartzDate] = useState(false);
    const [enableRatings, setEnableRatings] = useState(true); // true = 5-star rating, false = simple like
    const [showInProfile, setShowInProfile] = useState(false); // Whether to show in user's profile feed
    const [quartzDateString, setQuartzDateString] = useState(() => {
        const today = new Date();
        const d = String(today.getDate());
        const m = String(today.getMonth() + 1);
        const y = String(today.getFullYear()).slice(2);
        return `${m} ${d} '${y}`; // Default MM DD 'YY (US classic)
    });
    const [quartzColor, setQuartzColor] = useState('#7FFFD4'); // PanoSpace signature green
    const [quartzDateFormat, setQuartzDateFormat] = useState("MM DD 'YY"); // Default format (US classic)

    const [shareTitleAcrossImages, setShareTitleAcrossImages] = useState(true); // Share title across all images

    // Digital Collectibles State
    const [createSpaceCard, setCreateSpaceCard] = useState(false);
    const [spaceCardData, setSpaceCardData] = useState({
        title: '',
        price: 0,
        rarity: 'Common',
        editionType: 'unlimited',
        editionSize: 100,
        collaborators: []
    });

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Enforce 10 image limit
        if (slides.length + files.length > 10) {
            alert('You can only upload up to 10 images per post.');
            return;
        }

        // Get ALL EXIF from first slide to auto-fill new slides
        const firstSlideExif = slides.length > 0 ? (slides[0].manualExif || slides[0].exif) : null;
        // Copy all fields from first slide's EXIF
        const commonExif = firstSlideExif ? { ...firstSlideExif } : null;

        const newSlides = files.map(file => ({
            type: 'image',
            file,
            preview: URL.createObjectURL(file),
            title: '', // Changed from caption to title
            addToShop: false,
            productTier: PRINT_TIERS.ECONOMY,
            includeStickers: false,
            exif: null,
            manualExif: commonExif // Auto-fill with ALL EXIF fields from first slide
        }));

        setSlides(prev => {
            const updated = [...prev, ...newSlides];
            if (prev.length === 0) setActiveSlideIndex(0);
            return updated;
        });
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
        updateSlide(activeSlideIndex, { manualExif: exifData });
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

    // Handle "Add All to Shop"
    const handleAddAllToShop = () => {
        const allInShop = slides.every(s => s.addToShop);
        const newState = !allInShop;

        const updatedSlides = slides.map(slide => ({
            ...slide,
            addToShop: newState,
            // Default to Economy if enabling and no tier set, otherwise keep existing
            productTier: newState ? (slide.productTier || PRINT_TIERS.ECONOMY) : slide.productTier
        }));
        setSlides(updatedSlides);
    };

    // Handle form submission
    const handleSubmit = async () => {
        // 🔒 DOUBLE-POST PREVENTION
        if (submittingRef.current || loading) {
            console.warn('Submit blocked: already submitting');
            return;
        }
        submittingRef.current = true;

        if (slides.length === 0) {
            submittingRef.current = false;
            return alert("Add at least one image");
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
            console.error('Error checking rate limit:', err);
            // Continue if check fails, don't block user for error
        }

        try {
            console.log('🚀 Starting post creation...');
            // Get collection's postToFeed setting if a collection is selected
            const selectedCollection = selectedCollectionId
                ? collections.find(c => c.id === selectedCollectionId)
                : null;

            console.log('📝 Processing slides...', slides.length);
            // Apply shared title logic
            const processedSlides = shareTitleAcrossImages
                ? slides.map(slide => ({ ...slide, title: title }))
                : slides;

            console.log('📤 Calling createPost...');
            await createPost({
                title,
                tags,
                type: postType, // Pass selected type
                location,
                filmMetadata: filmMetadata.isFilm ? filmMetadata : null,
                enableRatings: enableRatings,
                collectionId: selectedCollectionId || null,
                collectionPostToFeed: selectedCollection?.postToFeed ?? null,
                showInProfile: showInProfile,
                uiOverlays: {
                    sprocketBorder: enableSprocketOverlay,
                    filmMode: filmMode, // 'continuous' or 'cut'
                    quartzDate: enableQuartzDate ? {
                        text: quartzDateString,
                        color: quartzColor,
                        format: quartzDateFormat
                    } : null
                }
            }, processedSlides);

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
                    console.error("Error creating SpaceCard:", cardError);
                    alert("Post created, but SpaceCard creation failed: " + cardError.message);
                }
            }

            // ✅ Clear draft on successful post
            clearDraft();
            setHasUnsavedChanges(false);

            // Navigate directly to feed without alert
            navigate('/');
        } catch (err) {
            console.error('Error creating post:', err);
            alert(`Failed to create post: ${err.message}`);
        } finally {
            submittingRef.current = false;
        }
    };

    const activeSlide = slides[activeSlideIndex];
    const hasExif = activeSlide?.exif || activeSlide?.manualExif;

    const getPublishButtonState = () => {
        if (loading) return { text: "Publishing...", disabled: true };
        if (slides.length === 0) return { text: "Add Images", action: () => fileInputRef.current?.click(), disabled: false };
        if (!title.trim()) return { text: "Add Title", action: () => document.querySelector('input[placeholder="Write a title..."]')?.focus(), disabled: false };
        return { text: "Publish", action: handleSubmit, disabled: false };
    };

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
                bottomSlot={
                    slides.length > 0 && (
                        <div style={{
                            width: '100%',
                            padding: '0.5rem 1rem',
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(10px)',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <ThumbnailStrip
                                slides={slides}
                                activeSlideIndex={activeSlideIndex}
                                setActiveSlideIndex={setActiveSlideIndex}
                                handleDragStart={handleDragStart}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop}
                                moveSlide={moveSlide}
                            />
                        </div>
                    )
                }
            />

            {/* Progress Dots (Desktop Fixed) */}
            <div className="progress-dots-container">
                <div className={`progress-dot ${slides.length > 0 ? 'completed' : 'active'}`} title="Add Images">
                    <div className="dot-icon"><FaImages size={12} /></div>
                    <div className="dot-line"></div>
                </div>
                <div className={`progress-dot ${slides.length > 0 ? (title.trim().length > 0 ? 'completed' : 'active') : ''}`} title="Add Title">
                    <div className="dot-icon"><FaPen size={12} /></div>
                    <div className="dot-line"></div>
                </div>
                <div className={`progress-dot ${title.trim().length > 0 ? 'active' : ''}`} title="Ready">
                    <div className="dot-icon"><FaCheckCircle size={12} /></div>
                </div>
            </div>

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



            <div className="create-post-layout">
                {/* LEFT COLUMN: Images, Previews, Tags */}
                <div className="left-column">
                    {/* 1. Image Carousel */}
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
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {/* 2. Tags & Categories (Moved to Left) */}
                    <TagCategoryPanel
                        tags={tags}
                        handleTagToggle={handleTagToggle}
                        expandedCategories={expandedCategories}
                        toggleCategory={toggleCategory}
                    />
                </div>

                {/* RIGHT COLUMN: Post Details & Settings */}
                <div className="right-column">
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
                        <div className="post-type-toggle" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
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
                                🎨 Art
                            </button>
                            <button
                                type="button"
                                onClick={() => setPostType("social")}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    border: postType === "social" ? '1px solid #FF6B9D' : '1px solid rgba(255,255,255,0.1)',
                                    background: postType === "social" ? 'rgba(255, 107, 157, 0.15)' : 'transparent',
                                    color: postType === "social" ? '#FF6B9D' : '#888',
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
                                👥 Social
                            </button>
                        </div>

                        <div style={{ marginBottom: '0.5rem' }}>
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
                                    transition: 'all 110ms ease-out',
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                                }}
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

                        <div className="location-grid" style={{ gap: '0.5rem' }}>
                            <div className="location-input-wrapper">
                                <FaMapMarkerAlt className="location-icon" />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={location.city}
                                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                                    className="form-input location-input"
                                />
                            </div>
                            <div className="location-input-wrapper">
                                <FaMapMarkerAlt className="location-icon" />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={location.state}
                                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                                    className="form-input location-input"
                                />
                            </div>
                            <div className="location-input-wrapper">
                                <FaMapMarkerAlt className="location-icon" />
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={location.country}
                                    onChange={(e) => setLocation({ ...location, country: e.target.value })}
                                    className="form-input location-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Collection Selection - Compact */}
                    <CollectionSelector
                        collections={collections}
                        selectedCollectionId={selectedCollectionId}
                        setSelectedCollectionId={setSelectedCollectionId}
                        showInProfile={showInProfile}
                        setShowInProfile={setShowInProfile}
                    />

                    {/* Film Control Center */}
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
                        setEnableSprocketOverlay={setEnableSprocketOverlay}
                    />

                    {/* Rating System Toggle */}
                    <RatingSystemSelector
                        enableRatings={enableRatings}
                        setEnableRatings={setEnableRatings}
                    />


                    {/* Active Image Settings (Contextual) */}
                    {activeSlide && (
                        <div className="form-section">
                            <h3>Image Settings</h3>

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



                            {/* Shop Configuration */}
                            {/* Shop Configuration */}
                            {isFeatureEnabled('SHOP') && (
                                <ShopConfiguration
                                    activeSlide={activeSlide}
                                    activeSlideIndex={activeSlideIndex}
                                    slides={slides}
                                    updateSlide={updateSlide}
                                    handleAddAllToShop={handleAddAllToShop}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div >

            {/* Animated Stars Background */}
            < div style={{
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
            </div >

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
                    min-height: 100dvh;
                    background: var(--black);
                    color: #fff;
                    padding-bottom: 80px;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow-x: hidden;
                    overflow-x: hidden;
                    width: 100%;
                    max-width: 100vw;
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
                    display: grid;
                    grid-template-columns: 480px 1fr;
                    gap: 2.75rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    margin-top: 1rem;
                    padding: 2rem;
                    width: 100%;
                    height: calc(100dvh - 70px);
                    overflow: hidden;
                    overflow-y: hidden;
                    position: relative;
                    z-index: 1;
                }

                .left-column {
                    height: 100%;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding-right: 0.5rem;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                }

                .right-column {
                    height: 100%;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
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
                    .left-column, .right-column {
                        height: 100% !important;
                        overflow-y: auto !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
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
                        /* Rule: horizontal padding = 4vw */
                        padding: 4vw; 
                        padding-top: max(4vw, env(safe-area-inset-top));
                        padding-bottom: max(4vw, env(safe-area-inset-bottom));
                        gap: 4vw;
                        max-width: 100vw;
                        box-sizing: border-box;
                    }
                    .left-column, .right-column {
                        height: auto;
                        overflow: visible;
                        padding-right: 0;
                        width: 100%;
                        max-width: 100%;
                    }
                    .create-post-container {
                        overflow-x: hidden;
                        overflow-y: auto;
                        height: auto;
                        min-height: 100dvh;
                        padding-bottom: 2rem;
                    }
                    
                    /* Carousel Sizing - 16:9 Aspect Ratio */
                    .carousel-slide { 
                        aspect-ratio: 16/9;
                        max-height: 35vh;
                    }
                    .empty-state {
                        aspect-ratio: auto;
                        min-height: 30vh;
                        height: auto;
                        padding: 6vw 4vw;
                    }
                    .empty-state svg {
                        /* Rule: icon-size = max(4vw, 18px) - scaled up slightly for main icon */
                        width: max(8vw, 32px);
                        height: max(8vw, 32px);
                    }
                    .empty-state p {
                        /* Rule: font-size = max(3.5vw, 14px) */
                        font-size: max(3.5vw, 14px);
                        margin: 0.5rem 0 0 0;
                    }
                    .empty-state span {
                        font-size: max(3vw, 12px);
                    }
                    
                    .form-section {
                        /* Rule: horizontal padding = 4vw */
                        padding: 4vw;
                        margin-left: 0;
                        margin-right: 0;
                        margin-bottom: 4vw;
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
                        margin-top: 4vw !important;
                        margin-bottom: 4vw !important;
                        left: auto !important;
                        bottom: auto !important;
                        
                        /* Rule: height = 12vw (capped at 60px) */
                        height: min(12vw, 60px);
                        /* Rule: font-size = max(3.5vw, 14px) */
                        font-size: max(3.5vw, 14px);
                        
                        background: var(--ice-mint);
                        color: #000;
                        border: none;
                        border-radius: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                    }
                    
                    /* Hide Cancel text, keep icon */
                    .cancel-text {
                        display: none;
                    }
                    
                    /* Adjust header title alignment */
                    .page-header-title {
                        text-align: left !important;
                        font-size: max(3.5vw, 14px) !important;
                    }
                    
                    /* Tag Panels - Compact & Scaled */
                    .tag-filter-panel {
                        margin-bottom: 2vw !important;
                        border-radius: 12px !important;
                        max-width: 100% !important;
                        overflow: hidden !important;
                    }
                    .panel-header {
                        padding: 3vw 4vw !important;
                    }
                    .panel-header span:first-child {
                        font-size: max(3vw, 12px) !important;
                    }
                    .panel-header span:last-child {
                        font-size: max(2.5vw, 10px) !important;
                    }
                    .panel-content {
                        padding: 2vw 4vw 3vw !important;
                        max-width: 100% !important;
                        overflow: hidden !important;
                    }
                    .tags-grid {
                        display: grid !important;
                        grid-auto-flow: column !important;
                        overflow-x: auto !important;
                        max-width: 100% !important;
                        gap: 1.5vw !important;
                    }
                    .tags-grid button {
                        padding: 1.5vw 2.5vw !important;
                        font-size: max(2.5vw, 10px) !important;
                        border-radius: 5px !important;
                    }
                    
                    .location-grid { 
                        grid-template-columns: 1fr;
                        gap: 2vw;
                    }
                    
                    .add-more-carousel-btn {
                        padding: 3vw;
                        font-size: max(3vw, 12px);
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
        </div >
    );
};

export default CreatePost;
