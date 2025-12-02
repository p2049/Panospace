import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCreatePost } from '../hooks/useCreatePost';
import { useCollections } from '../hooks/useCollections';
import { FaImage, FaTimes, FaPlus, FaStore, FaInfoCircle, FaCamera, FaMagic, FaLayerGroup, FaSmile, FaStar } from 'react-icons/fa';
import { PRINT_SIZES, PRINT_TIERS } from '../utils/printfulApi';
import ManualExifForm from '../components/ManualExifForm';
import TagFilterPanel from '../components/TagFilterPanel';
import { TAG_CATEGORIES, getTagCategory } from '../constants/tagCategories';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FILM_STOCKS, FILM_FORMATS, COMMON_FILM_ISOS } from '../constants/filmStocks';
import { SpaceCardService, RARITY_TIERS, EDITION_TYPES } from '../services/SpaceCardService';


const CreatePost = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { createPost, loading, error, progress } = useCreatePost();
    const { collections } = useCollections(currentUser?.uid);
    const [selectedCollectionId, setSelectedCollectionId] = useState('');
    const fileInputRef = useRef(null);
    const submittingRef = useRef(false);

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
        if (submittingRef.current || loading) return;
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
            // Get collection's postToFeed setting if a collection is selected
            const selectedCollection = selectedCollectionId
                ? collections.find(c => c.id === selectedCollectionId)
                : null;

            // Apply shared title logic
            const processedSlides = shareTitleAcrossImages
                ? slides.map(slide => ({ ...slide, title: title }))
                : slides;

            await createPost({
                title,
                tags,
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
                            basePrice: spaceCardData.price,
                            soundTag: null,
                            isAudioCard: false
                        };

                        await SpaceCardService.createCard(cardData);
                        console.log("SpaceCard created successfully");
                    }
                } catch (cardError) {
                    console.error("Error creating SpaceCard:", cardError);
                    alert("Post created, but SpaceCard creation failed: " + cardError.message);
                }
            }

            alert('Post created successfully!');
            navigate('/');
        } catch (err) {
            console.error('Error creating post:', err);
            alert('Failed to create post. Please try again.');
        } finally {
            submittingRef.current = false;
        }
    };

    const activeSlide = slides[activeSlideIndex];
    const hasExif = activeSlide?.exif || activeSlide?.manualExif;

    return (
        <div className="create-post-container">
            {/* Header */}
            <div className="create-post-header" style={{ marginTop: '60px' }}>
                <button onClick={() => navigate(-1)} className="header-btn">
                    <FaTimes /> Cancel
                </button>
                <h2>CREATE POST</h2>
                <button
                    onClick={handleSubmit}
                    disabled={loading || slides.length === 0}
                    className="header-btn-primary"
                >
                    {loading ? `Uploading ${progress}%` : 'Publish'}
                </button>
            </div >

            {/* Progress Bar */}
            {
                loading && (
                    <div style={{ width: '100%', height: '4px', background: '#333' }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: 'var(--ice-mint)',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                )
            }

            <div className="create-post-layout">
                {/* LEFT COLUMN: Images, Previews, Tags */}
                <div className="left-column">
                    {/* 1. Image Carousel */}
                    {slides.length === 0 ? (
                        <div className="empty-state" onClick={() => fileInputRef.current?.click()}>
                            <FaImage size={48} />
                            <p>Click to select images</p>
                            <span>Up to 10 images</span>
                        </div>
                    ) : (
                        <div className="carousel-container">
                            <div
                                className="carousel-track"
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                                style={{
                                    transform: `translateX(-${activeSlideIndex * 100}%)`,
                                    transition: 'transform 0.3s ease-out'
                                }}
                            >
                                {slides.map((slide, idx) => (
                                    <div key={idx} className="carousel-slide">
                                        <img src={slide.preview} alt={`Slide ${idx + 1}`} />


                                        <div className="carousel-overlay">
                                            <button
                                                className="slide-remove-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeSlide(idx, e);
                                                }}
                                            >
                                                <FaTimes />
                                            </button>

                                            <div className="overlay-bottom-bar">
                                                <label className="shop-toggle-small" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={slide.addToShop}
                                                        onChange={(e) => updateSlide(idx, { addToShop: e.target.checked })}
                                                    />
                                                    <FaStore /> Shop
                                                </label>
                                                {(slide.exif || slide.manualExif) && (
                                                    <span className="exif-badge"><FaCamera /></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Thumbnail Scrollbar with Reorder Controls */}
                            {slides.length > 1 && (
                                <div className="thumbnail-scrollbar">
                                    {slides.map((slide, idx) => (
                                        <div
                                            key={idx}
                                            className={`thumbnail ${idx === activeSlideIndex ? 'active' : ''}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, idx)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, idx)}
                                            onClick={() => setActiveSlideIndex(idx)}
                                            style={{ position: 'relative', cursor: 'grab' }}
                                        >
                                            <img src={slide.preview} alt={`Thumbnail ${idx + 1}`} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            {idx === activeSlideIndex && (
                                                <div className="thumbnail-indicator" />
                                            )}
                                            {/* Reorder arrows */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '2px',
                                                right: '2px',
                                                display: 'flex',
                                                gap: '2px',
                                                opacity: 0.8
                                            }}>
                                                {idx > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveSlide(idx, 'left');
                                                        }}
                                                        style={{
                                                            background: 'rgba(0,0,0,0.7)',
                                                            border: 'none',
                                                            borderRadius: '3px',
                                                            color: '#7FFFD4',
                                                            width: '18px',
                                                            height: '18px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            fontSize: '10px'
                                                        }}
                                                        title="Move left"
                                                    >
                                                        ←
                                                    </button>
                                                )}
                                                {idx < slides.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveSlide(idx, 'right');
                                                        }}
                                                        style={{
                                                            background: 'rgba(0,0,0,0.7)',
                                                            border: 'none',
                                                            borderRadius: '3px',
                                                            color: '#7FFFD4',
                                                            width: '18px',
                                                            height: '18px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            fontSize: '10px'
                                                        }}
                                                        title="Move right"
                                                    >
                                                        →
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add More Button */}
                            <button
                                className="add-more-carousel-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FaPlus /> Add Another Photo
                            </button>
                        </div>
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
                    <div className="form-section" style={{ marginTop: '1.5rem' }}>
                        <h3>Tags & Categories</h3>
                        <p className="field-hint" style={{ marginBottom: '1rem' }}>
                            Select tags to help people find your work.
                        </p>

                        <div className="tags-container">
                            {Object.values(TAG_CATEGORIES).map(category => (
                                <TagFilterPanel
                                    key={category.id}
                                    category={category}
                                    selectedTags={tags}
                                    onTagToggle={handleTagToggle}
                                    isExpanded={expandedCategories[category.id]}
                                    onToggleExpand={() => toggleCategory(category.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Post Details & Settings */}
                <div className="right-column">
                    <div className="form-section" style={{ padding: '0.75rem' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Write a title..."
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
                                    background: 'transparent'
                                }}
                            />
                        </div>

                        {/* Share Title Toggle */}
                        <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#aaa' }}>
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
                                Share title across all images
                            </label>
                        </div>

                        <div className="location-grid" style={{ gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="City"
                                value={location.city}
                                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                                className="form-input"
                                style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                            />
                            <input
                                type="text"
                                placeholder="State"
                                value={location.state}
                                onChange={(e) => setLocation({ ...location, state: e.target.value })}
                                className="form-input"
                                style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                            />
                            <input
                                type="text"
                                placeholder="Country"
                                value={location.country}
                                onChange={(e) => setLocation({ ...location, country: e.target.value })}
                                className="form-input"
                                style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    {/* Collection Selection - Compact */}
                    <div className="form-section" style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                                <FaLayerGroup style={{ marginRight: '0.5rem', color: '#7FFFD4' }} />
                                Collection
                            </h3>
                            {selectedCollectionId && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={showInProfile}
                                        onChange={(e) => setShowInProfile(e.target.checked)}
                                        style={{ width: '14px', height: '14px' }}
                                    />
                                    Also show in profile
                                </label>
                            )}
                        </div>

                        <select
                            value={selectedCollectionId}
                            onChange={(e) => setSelectedCollectionId(e.target.value)}
                            className="form-input"
                            style={{ width: '100%', padding: '0.4rem', fontSize: '0.9rem' }}
                        >
                            <option value="">Select a collection (optional)...</option>
                            {collections.map(collection => (
                                <option key={collection.id} value={collection.id}>
                                    {collection.title}
                                </option>
                            ))}
                        </select>



                        {selectedCollectionId && (() => {
                            const selectedCollection = collections.find(c => c.id === selectedCollectionId);
                            return selectedCollection ? (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>📌 {selectedCollection.title}</span>
                                    <span style={{ color: '#444' }}>|</span>
                                    <span>{selectedCollection.postToFeed ? 'Visible in Feed' : 'Hidden from Feed'}</span>
                                </div>
                            ) : null;
                        })()}
                    </div>

                    {/* Film Control Center */}
                    <div className="form-section">
                        {/* Master Toggle */}
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: filmMetadata.isFilm ? '1rem' : 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaMagic style={{ color: '#7FFFD4' }} />
                                <span style={{ fontWeight: '600', fontSize: '1rem' }}>Film Photography</span>
                            </div>
                            <div style={{ position: 'relative', width: '40px', height: '20px' }}>
                                <input
                                    type="checkbox"
                                    checked={filmMetadata.isFilm}
                                    onChange={(e) => setFilmMetadata({ ...filmMetadata, isFilm: e.target.checked })}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    background: filmMetadata.isFilm ? '#7FFFD4' : '#333',
                                    borderRadius: '20px', transition: '0.3s'
                                }}></div>
                                <div style={{
                                    position: 'absolute', top: '2px', left: filmMetadata.isFilm ? '22px' : '2px',
                                    width: '16px', height: '16px', background: '#fff',
                                    borderRadius: '50%', transition: '0.3s'
                                }}></div>
                            </div>
                        </label>

                        {filmMetadata.isFilm && (
                            <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                                {/* Metadata Row - Compact */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <select
                                        value={filmMetadata.stock}
                                        onChange={(e) => setFilmMetadata({ ...filmMetadata, stock: e.target.value })}
                                        className="form-input"
                                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                    >
                                        <option value="">Stock...</option>
                                        {FILM_STOCKS.map(stock => <option key={stock} value={stock}>{stock}</option>)}
                                    </select>
                                    <select
                                        value={filmMetadata.format}
                                        onChange={(e) => setFilmMetadata({ ...filmMetadata, format: e.target.value })}
                                        className="form-input"
                                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                    >
                                        <option value="">Format...</option>
                                        {FILM_FORMATS.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
                                    </select>
                                    <select
                                        value={filmMetadata.iso}
                                        onChange={(e) => setFilmMetadata({ ...filmMetadata, iso: e.target.value })}
                                        className="form-input"
                                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                    >
                                        <option value="">ISO...</option>
                                        {COMMON_FILM_ISOS.map(iso => <option key={iso} value={iso}>{iso}</option>)}
                                    </select>
                                </div>

                                {/* Secondary Metadata Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Camera (e.g. Canon AE-1)"
                                        value={filmMetadata.cameraOverride}
                                        onChange={(e) => setFilmMetadata({ ...filmMetadata, cameraOverride: e.target.value })}
                                        className="form-input"
                                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Lens (e.g. 50mm f/1.8)"
                                        value={filmMetadata.lensOverride}
                                        onChange={(e) => setFilmMetadata({ ...filmMetadata, lensOverride: e.target.value })}
                                        className="form-input"
                                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                    />
                                </div>

                                {/* Visuals Subsection */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '0.5rem' }}>
                                        Visuals
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        {/* Date Stamp Toggle */}
                                        <div style={{ flex: 1, minWidth: '140px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={enableQuartzDate}
                                                    onChange={(e) => setEnableQuartzDate(e.target.checked)}
                                                    style={{ width: '16px', height: '16px' }}
                                                />
                                                Quartz Date Stamp
                                            </label>

                                            {enableQuartzDate && (
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <input
                                                        type="text"
                                                        value={quartzDateString}
                                                        onChange={(e) => setQuartzDateString(e.target.value)}
                                                        className="form-input"
                                                        placeholder="D M 'Y"
                                                        style={{ padding: '0.3rem', fontSize: '0.8rem', width: '100%', marginBottom: '0.5rem' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#888' }}>Color:</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setQuartzColor('#7FFFD4')}
                                                            style={{
                                                                width: '28px',
                                                                height: '28px',
                                                                background: '#7FFFD4',
                                                                border: quartzColor === '#7FFFD4' ? '2px solid #fff' : '1px solid #333',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                boxShadow: quartzColor === '#7FFFD4' ? '0 0 8px #7FFFD4' : 'none'
                                                            }}
                                                            title="PanoSpace Green"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setQuartzColor('#FF4500')}
                                                            style={{
                                                                width: '28px',
                                                                height: '28px',
                                                                background: '#FF4500',
                                                                border: quartzColor === '#FF4500' ? '2px solid #fff' : '1px solid #333',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                boxShadow: quartzColor === '#FF4500' ? '0 0 8px #FF4500' : 'none'
                                                            }}
                                                            title="Film Orange"
                                                        />
                                                        <input
                                                            type="color"
                                                            value={quartzColor}
                                                            onChange={(e) => setQuartzColor(e.target.value)}
                                                            style={{
                                                                width: '28px',
                                                                height: '28px',
                                                                border: '1px solid #333',
                                                                borderRadius: '4px',
                                                                background: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Custom Color"
                                                        />
                                                    </div>
                                                    <div style={{ marginTop: '0.5rem' }}>
                                                        <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Date Format:</label>
                                                        <select
                                                            value={quartzDateFormat}
                                                            onChange={(e) => {
                                                                const newFormat = e.target.value;
                                                                setQuartzDateFormat(newFormat);
                                                                // Auto-update the text string based on format
                                                                const today = new Date();
                                                                const d = String(today.getDate()).padStart(2, '0');
                                                                const m = String(today.getMonth() + 1).padStart(2, '0');
                                                                const y = String(today.getFullYear()).slice(2);

                                                                let newText = '';
                                                                if (newFormat === 'YY.MM.DD') newText = `${y}.${m}.${d}`;
                                                                else if (newFormat === 'MM.DD.YY') newText = `${m}.${d}.${y}`;
                                                                else if (newFormat === 'DD.MM.YY') newText = `${d}.${m}.${y}`;
                                                                else if (newFormat === "DD MM 'YY") newText = `${today.getDate()} ${today.getMonth() + 1} '${y}`;
                                                                else if (newFormat === "MM DD 'YY") newText = `${today.getMonth() + 1} ${today.getDate()} '${y}`;
                                                                else if (newFormat === "YY MM DD") newText = `${y} ${m} ${d}`;

                                                                setQuartzDateString(newText);
                                                            }}
                                                            className="form-input"
                                                            style={{ padding: '0.3rem', fontSize: '0.8rem', width: '100%' }}
                                                        >
                                                            <option value="MM DD 'YY">MM DD 'YY (US Classic - Default)</option>
                                                            <option value="YY.MM.DD">YY.MM.DD</option>
                                                            <option value="MM.DD.YY">MM.DD.YY (US)</option>
                                                            <option value="DD.MM.YY">DD.MM.YY (EU)</option>
                                                            <option value="DD MM 'YY">DD MM 'YY (Classic)</option>
                                                            <option value="YY MM DD">YY MM DD (Classic)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Film Border Toggle */}
                                        <div style={{ flex: 1, minWidth: '140px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={enableSprocketOverlay}
                                                    onChange={(e) => setEnableSprocketOverlay(e.target.checked)}
                                                    style={{ width: '16px', height: '16px' }}
                                                />
                                                Film Strip Border
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rating System Toggle */}
                    <div className="form-section" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Rating System</span>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>
                                {enableRatings ? 'Users can rate 1-5 stars' : 'Standard like button'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setEnableRatings(false)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    border: !enableRatings ? '1px solid #7FFFD4' : '1px solid #333',
                                    background: !enableRatings ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                                    color: !enableRatings ? '#7FFFD4' : '#666',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <FaSmile size={16} /> Smiley
                            </button>
                            <button
                                type="button"
                                onClick={() => setEnableRatings(true)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    border: enableRatings ? '1px solid #7FFFD4' : '1px solid #333',
                                    background: enableRatings ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                                    color: enableRatings ? '#7FFFD4' : '#666',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <FaStar size={16} /> 5-Star
                            </button>
                        </div>
                    </div>


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
                            <div className="exif-section">
                                <div className="exif-header">
                                    <span><FaCamera /> Camera Data</span>
                                    <button
                                        className="btn-edit-exif"
                                        onClick={() => setShowManualExif(prev => ({ ...prev, [activeSlideIndex]: true }))}
                                    >
                                        {hasExif ? 'Edit Data' : 'Add Data'}
                                    </button>
                                </div>

                                {hasExif && !showManualExif[activeSlideIndex] && (
                                    <div className="exif-display">
                                        {(activeSlide.exif?.make || activeSlide.manualExif?.make) && (
                                            <div>{activeSlide.exif?.make || activeSlide.manualExif?.make} {activeSlide.exif?.model || activeSlide.manualExif?.model}</div>
                                        )}
                                    </div>
                                )}

                                {showManualExif[activeSlideIndex] && (
                                    <ManualExifForm
                                        existingExif={activeSlide.manualExif || activeSlide.exif}
                                        onSave={handleManualExifSave}
                                        onCancel={() => setShowManualExif(prev => ({ ...prev, [activeSlideIndex]: false }))}
                                    />
                                )}
                            </div>



                            // ... existing code ...

                            {/* Shop Configuration */}
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#111', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ color: '#7FFFD4', margin: 0 }}>Shop Configuration</h4>
                                    <button
                                        type="button"
                                        onClick={handleAddAllToShop}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #7FFFD4',
                                            color: '#7FFFD4',
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {slides.every(s => s.addToShop) ? 'Remove All from Shop' : 'Add All to Shop'}
                                    </button>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={activeSlide.addToShop}
                                        onChange={(e) => updateSlide(activeSlideIndex, { addToShop: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    Sell this image
                                </label>

                                {/* Copyright Warning for Shop Items */}
                                {activeSlide.addToShop && (
                                    <div style={{
                                        marginBottom: '1rem',
                                        padding: '0.75rem',
                                        background: 'rgba(127, 255, 212, 0.1)',
                                        border: '1px solid rgba(127, 255, 212, 0.3)',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        color: '#7FFFD4',
                                        lineHeight: '1.4'
                                    }}>
                                        ℹ️ <strong>Shop Draft:</strong> This will create a shop draft. Visit your Shop Drafts page to publish it after confirming copyright ownership.
                                    </div>
                                )}

                                {activeSlide.addToShop && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => updateSlide(activeSlideIndex, { productTier: PRINT_TIERS.ECONOMY })}
                                            style={{
                                                padding: '0.5rem',
                                                background: activeSlide.productTier === PRINT_TIERS.ECONOMY ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                                color: activeSlide.productTier === PRINT_TIERS.ECONOMY ? '#7FFFD4' : '#888',
                                                border: activeSlide.productTier === PRINT_TIERS.ECONOMY ? '1px solid #7FFFD4' : '1px solid #333',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Economy
                                        </button>
                                        <button
                                            onClick={() => updateSlide(activeSlideIndex, { productTier: PRINT_TIERS.PREMIUM })}
                                            style={{
                                                padding: '0.5rem',
                                                background: activeSlide.productTier === PRINT_TIERS.PREMIUM ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                                color: activeSlide.productTier === PRINT_TIERS.PREMIUM ? '#7FFFD4' : '#888',
                                                border: activeSlide.productTier === PRINT_TIERS.PREMIUM ? '1px solid #7FFFD4' : '1px solid #333',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Premium
                                        </button>
                                        <button
                                            onClick={() => updateSlide(activeSlideIndex, { productTier: PRINT_TIERS.LIMITED })}
                                            style={{
                                                padding: '0.5rem',
                                                background: activeSlide.productTier === PRINT_TIERS.LIMITED ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                                color: activeSlide.productTier === PRINT_TIERS.LIMITED ? '#7FFFD4' : '#888',
                                                border: activeSlide.productTier === PRINT_TIERS.LIMITED ? '1px solid #7FFFD4' : '1px solid #333',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Limited
                                        </button>
                                        <button
                                            onClick={() => updateSlide(activeSlideIndex, { includeStickers: !activeSlide.includeStickers })}
                                            style={{
                                                padding: '0.5rem',
                                                background: activeSlide.includeStickers ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                                color: activeSlide.includeStickers ? '#7FFFD4' : '#888',
                                                border: activeSlide.includeStickers ? '1px solid #7FFFD4' : '1px solid #333',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            + Stickers
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
                {stars.map((star) => (
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
                ))}
            </div>

            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
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
                    overflow: hidden;
                }
                .create-post-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 2rem;
                    background: var(--graphite);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    height: 70px;
                }
                .create-post-header h2 { font-size: 1.2rem; font-weight: 700; margin: 0; fontFamily: var(--font-family-heading); letter-spacing: 0.05em; text-transform: uppercase; }
                .header-btn, .header-btn-primary {
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: none;
                }
                .header-btn { background: transparent; color: var(--slate); }
                .header-btn-primary { background: var(--ice-mint); color: var(--black); }
                .header-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

                .create-post-layout {
                    display: grid;
                    grid-template-columns: 400px 1fr; /* Left (Images/Tags) fixed, Right (Details) flexible */
                    gap: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                    width: 100%;
                    height: calc(100dvh - 70px);
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                }

                .left-column {
                    height: 100%;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding-right: 0.5rem; /* Space for scrollbar */
                }

                .right-column {
                    height: 100%;
                    overflow-y: auto;
                    padding-right: 0.5rem; /* Space for scrollbar */
                }

                .form-section {
                    background: var(--graphite);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    position: relative;
                    z-index: 1;
                }
                .form-section h3 { margin-top: 0; color: var(--ice-mint); font-size: 1.1rem; margin-bottom: 1.5rem; }
                
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
                }

                .sound-result-item {
                    padding: 0.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .sound-result-item:hover { background: #333; }

                .form-field { margin-bottom: 1.5rem; }
                .form-field label { display: block; margin-bottom: 0.5rem; color: var(--slate); font-size: 0.9rem; }
                .form-input {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 0.75rem;
                    color: #fff;
                }
                .location-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }

                /* Carousel Styles */
                .carousel-container {
                    width: 100%;
                    position: relative;
                    z-index: 1;
                    background: var(--black);
                }

                .carousel-track {
                    display: flex;
                    width: 100%;
                }

                .carousel-slide {
                    min-width: 100%;
                    aspect-ratio: 1;
                    background: var(--graphite);
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                }

                .carousel-slide img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    user-select: none;
                    -webkit-user-drag: none;
                }

                .carousel-overlay {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }
                .carousel-overlay button, .carousel-overlay label { pointer-events: auto; }

                .carousel-dots {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 1rem 0;
                }

                .carousel-dots .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    transition: all 0.2s;
                }

                .carousel-dots .dot.active {
                    background: var(--ice-mint);
                    width: 24px;
                    border-radius: 4px;
                }

                .thumbnail-scrollbar {
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    padding: 0.5rem 0;
                    margin: 0.5rem 0;
                }

                .thumbnail-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }

                .thumbnail-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }

                .thumbnail-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(127, 255, 212, 0.6);
                    border-radius: 4px;
                }

                .thumbnail-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(127, 255, 212, 0.8);
                }

                .thumbnail {
                    min-width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    position: relative;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.2s;
                }

                .thumbnail:hover {
                    border-color: var(--ice-mint);
                    transform: scale(1.05);
                }

                .thumbnail.active {
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }

                .slide-remove-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.6);
                    border: none;
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .overlay-bottom-bar {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.9));
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .shop-toggle-small { display: flex; align-items: center; gap: 0.5rem; color: #fff; cursor: pointer; font-size: 0.8rem; }
                .exif-badge { background: var(--ice-mint); color: #000; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; }
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .empty-state {
                    padding: 3rem;
                    text-align: center;
                    color: var(--slate);
                    border: 2px dashed rgba(255,255,255,0.2);
                    border-radius: 12px;
                    cursor: pointer;
                }

                /* Film UI Overlays */
                .sprocket-overlay {
                    position: absolute;
                    inset: 0;
                    /* Sprockets on TOP and BOTTOM */
                    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><pattern id="sprocket" x="0" y="0" width="10" height="100" patternUnits="userSpaceOnUse"><rect x="2" y="0" width="6" height="4" fill="rgba(0,0,0,0.85)"/><rect x="2" y="96" width="6" height="4" fill="rgba(0,0,0,0.85)"/></pattern></defs><rect width="100" height="100" fill="url(%23sprocket)"/></svg>');
                    background-size: 100% 100%;
                    background-repeat: no-repeat;
                    pointer-events: none;
                    z-index: 5;
                }

                .quartz-date-stamp {
                    position: absolute;
                    bottom: 12px;
                    right: 12px;
                    font-family: 'Courier New', 'Courier', monospace;
                    font-size: 16px;
                    font-weight: bold;
                    letter-spacing: 2px;
                    text-shadow: 
                        0 0 4px rgba(0,0,0,0.9),
                        1px 1px 2px rgba(0,0,0,0.8);
                    pointer-events: none;
                    z-index: 6;
                    padding: 4px 6px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 2px;
                }

                /* Scrollbars */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }

                @media (max-width: 768px) {
                    .create-post-header {
                        padding: 1rem;
                    }
                    .create-post-layout {
                        grid-template-columns: 1fr;
                        height: auto;
                        overflow: visible;
                        padding: 1rem;
                        gap: 1rem;
                    }
                    .left-column, .right-column {
                        height: auto;
                        overflow: visible;
                        padding-right: 0;
                    }
                    .location-grid {
                        grid-template-columns: 1fr;
                    }
                    .carousel-slide {
                        aspect-ratio: 4/3;
                    }
                }
                
                /* Tablet breakpoint */
                @media (min-width: 769px) and (max-width: 1024px) {
                    .create-post-layout {
                        grid-template-columns: 350px 1fr;
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div >
    );
};

export default CreatePost;
