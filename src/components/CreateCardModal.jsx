import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaTimes, FaImage, FaStar, FaInfoCircle, FaRocket, FaFileAlt, FaUpload, FaShoppingCart, FaCity } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { SpaceCardService, RARITY_TIERS, EDITION_TYPES, CARD_DISCIPLINES, CARD_STYLES } from '@/services/SpaceCardService';
import { fetchPublishedPosts, fetchDrafts } from '@/core/services/firestore/posts.service';
import { storage, db } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
    CARD_CATEGORIES,
    getCategoryTags,
    getAutoRarity,
    getAllParks,
    getTagLabel
} from '@/core/constants/officialCardCategories';
import { CITY_THEMES } from '@/core/constants/cityThemes';
import { CityCardFrame } from './CityCardFrame';
import StarBackground from './StarBackground';
import { logger } from '@/core/utils/logger';
import '@/styles/rarity-system.css';

const CreateCardModal = ({ onClose, onCreated }) => {
    const { currentUser } = useAuth();
    const [step, setStep] = useState(1); // 1: Select Image, 2: Card Details, 3: Preview
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Generate stars for background animation
    // const stars = useMemo(() => { ... }); // Removed in favor of StarBackground component

    // Step 1 State: Image Selection
    const [activeTab, setActiveTab] = useState('published'); // 'published' | 'drafts' | 'upload'
    const [selectedPost, setSelectedPost] = useState(null);
    const [frontImage, setFrontImage] = useState('');
    const [backImage, setBackImage] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadPreview, setUploadPreview] = useState('');
    const [postToFeed, setPostToFeed] = useState(false);
    const fileInputRef = useRef(null);

    // Image positioning state
    const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 }); // percentage
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Step 2 State: Card Details
    const [cardType, setCardType] = useState('official'); // 'official' | 'custom'
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discipline, setDiscipline] = useState(CARD_DISCIPLINES.OTHER);

    // Official Card State
    const [officialCategory, setOfficialCategory] = useState(CARD_CATEGORIES.ANIMALS);
    const [selectedTag, setSelectedTag] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTags, setFilteredTags] = useState([]);

    // Custom Card State
    const [customTag, setCustomTag] = useState('');
    const [rarity, setRarity] = useState('Common'); // For custom cards or auto-set for official

    // Common Details
    const [editionType, setEditionType] = useState(EDITION_TYPES.UNLIMITED);
    const [editionSize, setEditionSize] = useState(100);
    const [cardStyle, setCardStyle] = useState(CARD_STYLES.CLASSIC);

    const [cardLayout, setCardLayout] = useState('bordered'); // 'fullbleed' | 'bordered'
    const [cityThemeId, setCityThemeId] = useState(null); // Default null (no city theme)
    // const [basePrice, setBasePrice] = useState(10); // Removed Selling Fields for now
    const [addToShopDraft, setAddToShopDraft] = useState(false); // NEW: Shop Draft Toggle

    // Fetch posts when tab changes
    useEffect(() => {
        const loadPosts = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                let posts = [];
                if (activeTab === 'published') {
                    posts = await fetchPublishedPosts(currentUser.uid, 50);
                } else {
                    posts = await fetchDrafts(currentUser.uid);
                }
                setUserPosts(posts);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, [currentUser, activeTab]);

    // Initialize tags list
    useEffect(() => {
        if (officialCategory === CARD_CATEGORIES.NATIONAL_PARKS || officialCategory === CARD_CATEGORIES.STATE_PARKS) {
            setFilteredTags(getAllParks());
        } else {
            // For other categories, initialize with all tags
            setFilteredTags(getCategoryTags(officialCategory));
        }
    }, [officialCategory]);

    // Filter tags when searching
    useEffect(() => {
        if (officialCategory === CARD_CATEGORIES.NATIONAL_PARKS || officialCategory === CARD_CATEGORIES.STATE_PARKS) {
            // Park filtering logic (objects)
            let filtered = getAllParks();

            // Filter by type first
            if (officialCategory === CARD_CATEGORIES.NATIONAL_PARKS) {
                filtered = filtered.filter(p => p.type === 'national');
            } else {
                filtered = filtered.filter(p => p.type === 'state');
            }

            // Then filter by search term if present
            if (searchTerm) {
                filtered = filtered.filter(p =>
                    p.label.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setFilteredTags(filtered);
        } else {
            // Standard category filtering logic (strings)
            let tags = getCategoryTags(officialCategory);

            if (searchTerm) {
                tags = tags.filter(tag =>
                    tag.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setFilteredTags(tags);
        }
    }, [searchTerm, officialCategory]);

    // Auto-Rarity Logic
    useEffect(() => {
        if (cardType === 'official' && selectedTag) {
            const autoRarity = getAutoRarity(officialCategory, selectedTag);
            if (autoRarity) {
                // getAutoRarity now returns properly formatted tier names
                setRarity(autoRarity);
            }
        }
    }, [cardType, officialCategory, selectedTag]);

    const handlePostSelect = (post) => {
        setSelectedPost(post);
        setFrontImage(post.downloadURL || post.items?.[0]?.url || post.images?.[0]?.url);
        setUploadedFile(null);
        setUploadPreview('');
        // Reset image position to center
        setImagePosition({ x: 50, y: 50 });
        // Auto-fill title if empty
        if (!title) setTitle(post.title || '');
        if (!description) setDescription(post.description || '');
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setUploadedFile(file);
            setSelectedPost(null);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadPreview(reader.result);
                setFrontImage(reader.result);
                // Reset image position to center
                setImagePosition({ x: 50, y: 50 });
                // Default to posting to feed
                setPostToFeed(true);
            };
            reader.readAsDataURL(file);
        }
    };

    // Image positioning handlers
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setImagePosition(prev => ({
            x: Math.max(0, Math.min(100, prev.x + (deltaX / 3))),
            y: Math.max(0, Math.min(100, prev.y + (deltaY / 3)))
        }));

        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleCreate = async () => {
        if (!frontImage || !title) {
            alert('Please provide at least a front image and title');
            return;
        }

        if (cardType === 'official' && !selectedTag) {
            alert('Please select a category and tag for the official card');
            return;
        }

        setLoading(true);
        try {
            let finalFrontImage = frontImage;
            let postId = null;

            // Upload file if user uploaded one
            if (uploadedFile) {
                const storageRef = ref(
                    storage,
                    `spacecards/${currentUser.uid}/${Date.now()}_${uploadedFile.name}`
                );
                const uploadTask = uploadBytesResumable(storageRef, uploadedFile);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        null,
                        (error) => reject(error),
                        () => resolve()
                    );
                });

                finalFrontImage = await getDownloadURL(storageRef);

                // Create post if requested
                if (postToFeed) {
                    const postDoc = {
                        userId: currentUser.uid,
                        uid: currentUser.uid, // Keep for legacy compatibility
                        username: currentUser.displayName || currentUser.email,
                        userAvatar: currentUser.photoURL || '',
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        status: 'published', // Required field
                        caption: title,
                        imageUrls: [finalFrontImage],
                        thumbnailUrls: [finalFrontImage],
                        tags: cardType === 'official' ? [selectedTag] : [customTag].filter(Boolean),
                        locationName: '',
                        lat: null,
                        lng: null,
                        likesCount: 0,
                        commentsCount: 0,
                        artType: 'photography',
                        category: 'general',
                        safe: true,
                        shopEnabled: false,
                        hasSlides: false,
                        hasItems: true,
                        hasImages: true,
                        showInProfile: true,
                        title,
                        description: description || '',
                        images: [{
                            url: finalFrontImage,
                            caption: title,
                            exif: null
                        }]
                    };

                    const postRef = await addDoc(collection(db, 'posts'), postDoc);
                    postId = postRef.id;
                }
            }

            const cardData = {
                creatorUid: currentUser.uid,
                creatorName: currentUser.displayName || currentUser.email,
                frontImage: finalFrontImage,
                backImage,
                title,
                description,
                discipline,
                rarity,
                editionType,
                editionSize: editionType === EDITION_TYPES.LIMITED ? editionSize : null,
                linkedPostId: postId || selectedPost?.id || null,
                cardStyle,
                cardLayout, // 'fullbleed' | 'bordered'
                cityThemeId: cardLayout === 'bordered' ? cityThemeId : null,
                basePrice: 0, // Force 0 or remove entirely if schema allows. We are removing selling fields.
                // New Fields
                cardType,
                subjectTag: cardType === 'official' ? selectedTag : customTag,
                isOfficial: cardType === 'official',
                imagePosition // Pass the crop position
            };

            const newCard = await SpaceCardService.createCard(cardData);

            // 2.2 Create Shop Draft if requested
            if (addToShopDraft) {
                try {
                    const shopItemData = {
                        ownerId: currentUser.uid,
                        kind: "spacecard",
                        status: "draft",
                        sourcePostId: newCard.id, // Link to the newly created SpaceCard ID
                        postRef: newCard.id, // Legacy compatibility
                        title: title || "Untitled Space Card",
                        description: description || "",
                        imageUrl: finalFrontImage,
                        tags: cardType === 'official' ? [selectedTag] : [customTag].filter(Boolean),
                        baseCostCents: 0,
                        markupCents: 0,
                        priceCents: 0,
                        currency: "USD",
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        available: false
                    };

                    // Add to 'shopItems' collection
                    await addDoc(collection(db, 'shopItems'), shopItemData);
                    logger.log("Shop Item Draft Created for SpaceCard:", newCard.id);

                } catch (shopError) {
                    logger.error("Error creating shop draft:", shopError);
                    // Don't block the main success flow, just log it
                }
            }

            alert(`Card "${title}" created successfully!`);
            if (onCreated) onCreated(newCard);
            onClose();
        } catch (error) {
            console.error('Error creating card:', error);
            alert('Failed to create card: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
        }}>
            {/* Animated Stars Background */}
            <StarBackground />

            <div style={{
                background: 'rgba(26, 26, 26, 0.7)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(127, 255, 212, 0.1)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Header & Tabs Unified */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '1px solid rgba(127, 255, 212, 0.1)'
                }}>
                    {/* Top Bar: Title & Close */}
                    <div style={{
                        padding: '1.5rem 1.5rem 0.5rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Create SpaceCard</h2>
                        <button onClick={onClose} style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}>
                            <FaTimes />
                        </button>
                    </div>

                    {/* Step Indicator (Tabs) - Centered */}
                    <div style={{
                        display: 'flex',
                        padding: '0.5rem 1.5rem 1.5rem 1.5rem',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {['Select Image', 'Card Details', 'Preview'].map((label, idx) => (
                            <div key={idx} style={{
                                flex: '0 1 auto',
                                minWidth: '120px',
                                textAlign: 'center',
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                background: step === idx + 1
                                    ? 'rgba(127, 255, 212, 0.15)'
                                    : 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: step === idx + 1 ? 'blur(10px)' : 'none',
                                color: step === idx + 1 ? '#7FFFD4' : '#888',
                                fontWeight: step === idx + 1 ? '600' : '400',
                                border: step === idx + 1
                                    ? '1px solid rgba(127, 255, 212, 0.3)'
                                    : '1px solid rgba(255, 255, 255, 0.05)',
                                transition: 'all 0.3s ease',
                                boxShadow: step === idx + 1
                                    ? '0 4px 12px rgba(127, 255, 212, 0.2)'
                                    : 'none',
                                cursor: 'default'
                            }}>
                                {idx + 1}. {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {/* Step 1: Select Image */}
                    {step === 1 && (
                        <div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <button
                                    onClick={() => setActiveTab('published')}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: activeTab === 'published' ? '#7FFFD4' : '#222',
                                        color: activeTab === 'published' ? '#000' : '#888',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaRocket /> Published Posts
                                </button>
                                <button
                                    onClick={() => setActiveTab('drafts')}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: activeTab === 'drafts' ? '#7FFFD4' : '#222',
                                        color: activeTab === 'drafts' ? '#000' : '#888',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaFileAlt /> Drafts
                                </button>
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: activeTab === 'upload' ? '#7FFFD4' : '#222',
                                        color: activeTab === 'upload' ? '#000' : '#888',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaUpload /> Upload Image
                                </button>
                            </div>


                            {activeTab !== 'upload' ? (
                                <>
                                    <h3 style={{ marginTop: 0 }}>Select an image from your {activeTab}</h3>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                        gap: '1rem'
                                    }}>
                                        {userPosts.map(post => (
                                            <div
                                                key={post.id}
                                                onClick={() => handlePostSelect(post)}
                                                style={{
                                                    aspectRatio: '1',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    border: selectedPost?.id === post.id ? '3px solid #7FFFD4' : '1px solid #333',
                                                    position: 'relative'
                                                }}
                                            >
                                                <img
                                                    src={post.downloadURL || post.items?.[0]?.url || post.images?.[0]?.url}
                                                    alt={post.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                {selectedPost?.id === post.id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '0.5rem',
                                                        right: '0.5rem',
                                                        background: '#7FFFD4',
                                                        color: '#000',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold'
                                                    }}>✓</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {userPosts.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                            <FaImage size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                            <div>No {activeTab} found.</div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <h3 style={{ marginTop: 0 }}>Upload an Image</h3>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            border: '2px dashed #444',
                                            borderRadius: '12px',
                                            padding: '3rem',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            background: uploadPreview ? 'transparent' : '#1a1a1a',
                                            transition: 'all 0.2s',
                                            position: 'relative',
                                            minHeight: '300px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {uploadPreview ? (
                                            <img
                                                src={uploadPreview}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '400px',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        ) : (
                                            <div>
                                                <FaUpload size={48} style={{ marginBottom: '1rem', color: '#7FFFD4' }} />
                                                <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                                    Click to upload an image
                                                </div>
                                                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                                    JPG, PNG, or GIF
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Post to Feed Checkbox */}
                                    {uploadedFile && (
                                        <div style={{
                                            marginTop: '1.5rem',
                                            padding: '1rem',
                                            background: '#222',
                                            borderRadius: '8px',
                                            border: '1px solid #333'
                                        }}>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                cursor: 'pointer'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={postToFeed}
                                                    onChange={(e) => setPostToFeed(e.target.checked)}
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        cursor: 'pointer',
                                                        accentColor: '#7FFFD4'
                                                    }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                                        Post to Feed
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                                        Also create a post on your profile with this image
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Crop Preview - Show when image is selected */}
                            {(selectedPost || uploadedFile) && frontImage && (
                                <div style={{ marginTop: '2rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '1rem'
                                    }}>
                                        <h3 style={{ margin: 0 }}>Position Your Image</h3>
                                        <button
                                            onClick={() => setImagePosition({ x: 50, y: 50 })}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(127, 255, 212, 0.1)',
                                                border: '1px solid rgba(127, 255, 212, 0.3)',
                                                borderRadius: '8px',
                                                color: '#7FFFD4',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(127, 255, 212, 0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(127, 255, 212, 0.1)';
                                            }}
                                        >
                                            Reset Position
                                        </button>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        gap: '2rem',
                                        alignItems: 'flex-start',
                                        flexWrap: 'wrap'
                                    }}>
                                        {/* Crop Box */}
                                        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                                            <div
                                                onMouseDown={handleMouseDown}
                                                onMouseMove={handleMouseMove}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={handleMouseUp}
                                                onTouchStart={(e) => {
                                                    const touch = e.touches[0];
                                                    handleMouseDown({
                                                        preventDefault: () => e.preventDefault(),
                                                        clientX: touch.clientX,
                                                        clientY: touch.clientY
                                                    });
                                                }}
                                                onTouchMove={(e) => {
                                                    const touch = e.touches[0];
                                                    handleMouseMove({
                                                        preventDefault: () => e.preventDefault(),
                                                        clientX: touch.clientX,
                                                        clientY: touch.clientY
                                                    });
                                                }}
                                                onTouchEnd={handleMouseUp}
                                                style={{
                                                    position: 'relative',
                                                    aspectRatio: '2/3',
                                                    maxWidth: '400px',
                                                    margin: '0 auto',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    border: '2px solid #7FFFD4',
                                                    boxShadow: '0 0 20px rgba(127, 255, 212, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
                                                    cursor: isDragging ? 'grabbing' : 'grab',
                                                    userSelect: 'none',
                                                    WebkitUserSelect: 'none',
                                                    background: '#000'
                                                }}
                                            >
                                                {/* Image */}
                                                <img
                                                    src={frontImage}
                                                    alt="Crop preview"
                                                    draggable={false}
                                                    style={{
                                                        position: 'absolute',
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        objectPosition: `${imagePosition.x}% ${imagePosition.y}% `,
                                                        pointerEvents: 'none',
                                                        transition: isDragging ? 'none' : 'object-position 0.1s ease-out'
                                                    }}
                                                />

                                                {/* Grid Overlay */}
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: `
    linear - gradient(to right, rgba(127, 255, 212, 0.1) 1px, transparent 1px),
        linear - gradient(to bottom, rgba(127, 255, 212, 0.1) 1px, transparent 1px)
            `,
                                                    backgroundSize: '33.33% 33.33%',
                                                    pointerEvents: 'none',
                                                    opacity: 0.5
                                                }} />

                                                {/* Center Crosshair */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    transform: 'translate(-50%, -50%)',
                                                    pointerEvents: 'none'
                                                }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: 0,
                                                        right: 0,
                                                        height: '1px',
                                                        background: 'rgba(127, 255, 212, 0.5)'
                                                    }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: '50%',
                                                        top: 0,
                                                        bottom: 0,
                                                        width: '1px',
                                                        background: 'rgba(127, 255, 212, 0.5)'
                                                    }} />
                                                </div>
                                            </div>

                                            <div style={{
                                                marginTop: '1rem',
                                                padding: '0.75rem',
                                                background: 'rgba(127, 255, 212, 0.05)',
                                                border: '1px solid rgba(127, 255, 212, 0.2)',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                color: '#aaa',
                                                textAlign: 'center'
                                            }}>
                                                <strong style={{ color: '#7FFFD4' }}>💡 Tip:</strong> Drag the image to reposition it within the card frame
                                            </div>
                                        </div>

                                        {/* Info Panel */}
                                        <div style={{
                                            flex: '1 1 250px',
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            padding: '1.5rem',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 1rem 0',
                                                color: '#7FFFD4',
                                                fontSize: '1rem'
                                            }}>
                                                Card Preview
                                            </h4>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.75rem',
                                                fontSize: '0.9rem',
                                                color: '#ccc'
                                            }}>
                                                <div>
                                                    <strong>Aspect Ratio:</strong> 2:3 (Card Standard)
                                                </div>
                                                <div>
                                                    <strong>Position:</strong> {Math.round(imagePosition.x)}%, {Math.round(imagePosition.y)}%
                                                </div>
                                                <div style={{
                                                    marginTop: '0.5rem',
                                                    padding: '0.75rem',
                                                    background: 'rgba(127, 255, 212, 0.05)',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    lineHeight: '1.5'
                                                }}>
                                                    The area shown in the crop box is what will appear on your Space Card. Drag to adjust the framing.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Card Details */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Card Type Selector */}
                            <div style={{ background: '#222', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600' }}>Card Type</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => setCardType('official')}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: cardType === 'official' ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                                            border: cardType === 'official' ? '1px solid #7FFFD4' : '1px solid #444',
                                            borderRadius: '8px',
                                            color: cardType === 'official' ? '#7FFFD4' : '#888',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Official Card (Auto-Rarity)
                                    </button>
                                    <button
                                        onClick={() => setCardType('custom')}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: cardType === 'custom' ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                                            border: cardType === 'custom' ? '1px solid #7FFFD4' : '1px solid #444',
                                            borderRadius: '8px',
                                            color: cardType === 'custom' ? '#7FFFD4' : '#888',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Custom Card
                                    </button>
                                </div>
                            </div>

                            {/* Official Card UI */}
                            {cardType === 'official' && (
                                <div style={{ background: '#222', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600' }}>Official Category</label>
                                    <select
                                        value={officialCategory}
                                        onChange={(e) => {
                                            setOfficialCategory(e.target.value);
                                            setSelectedTag('');
                                            setSearchTerm('');
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#1a1a1a',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '1rem',
                                            marginBottom: '1.5rem'
                                        }}
                                    >
                                        <option value={CARD_CATEGORIES.ANIMALS}>Animals</option>
                                        <option value={CARD_CATEGORIES.BUGS}>Bugs & Insects</option>
                                        <option value={CARD_CATEGORIES.TERRAIN}>Terrain / Landforms</option>
                                        <option value={CARD_CATEGORIES.NATIONAL_PARKS}>National Parks</option>
                                        <option value={CARD_CATEGORIES.STATE_PARKS}>State Parks</option>
                                    </select>

                                    {/* Tag Selection UI */}
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                        Select {officialCategory === CARD_CATEGORIES.ANIMALS ? 'Animal' :
                                            officialCategory === CARD_CATEGORIES.BUGS ? 'Bug/Insect' :
                                                officialCategory === CARD_CATEGORIES.TERRAIN ? 'Terrain' : 'Park'}
                                    </label>

                                    {/* Search Input - Now available for ALL categories */}
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={`Search for ${officialCategory === CARD_CATEGORIES.ANIMALS ? 'an animal' :
                                            officialCategory === CARD_CATEGORIES.BUGS ? 'a bug' :
                                                officialCategory === CARD_CATEGORIES.TERRAIN ? 'terrain' : 'a park'}...`}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#1a1a1a',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            marginBottom: '1rem'
                                        }}
                                    />

                                    {/* Horizontal Scrolling Tag List - Unified for ALL categories */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateRows: 'repeat(3, min-content)', // 3 rows as requested
                                        gridAutoFlow: 'column',
                                        gridAutoColumns: 'max-content',
                                        gap: '0.5rem',
                                        overflowX: 'auto', // Horizontal scroll
                                        overflowY: 'hidden',
                                        paddingBottom: '0.75rem', // Space for scrollbar
                                        marginBottom: '0.5rem',
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#7FFFD4 #222',
                                        height: 'auto',
                                        maxHeight: '160px' // Approximate height for 3 rows + scrollbar
                                    }}>
                                        {filteredTags.map(tagItem => {
                                            // Handle both string tags (Animals/Bugs/Terrain) and object tags (Parks)
                                            const isObject = typeof tagItem === 'object';
                                            const key = isObject ? tagItem.key : tagItem;
                                            const label = isObject ? tagItem.label : getTagLabel(officialCategory, tagItem);

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => {
                                                        setSelectedTag(key);
                                                        if (isObject) setSearchTerm(label);
                                                    }}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '20px',
                                                        background: selectedTag === key ? '#7FFFD4' : '#333',
                                                        color: selectedTag === key ? '#000' : '#ccc',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        flex: '0 0 auto', // Prevent shrinking
                                                        whiteSpace: 'nowrap', // Keep text on one line
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    {/* Add icons for parks if applicable */}
                                                    {isObject && (
                                                        <span style={{ fontSize: '0.8rem' }}>
                                                            {tagItem.type === 'national' ? '🏔️' : '🌲'}
                                                        </span>
                                                    )}
                                                    {label}
                                                </button>
                                            );
                                        })}
                                        {filteredTags.length === 0 && (
                                            <div style={{ width: '100%', padding: '1rem', color: '#666', textAlign: 'center' }}>
                                                No matches found
                                            </div>
                                        )}
                                    </div>

                                    {selectedTag && (
                                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(127, 255, 212, 0.05)', borderRadius: '8px', border: '1px solid rgba(127, 255, 212, 0.2)' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#888' }}>Auto-Assigned Rarity</div>
                                            <div className={`rarity-text-${rarity?.toLowerCase() || 'common'}`} style={{ fontWeight: 'bold' }}>{rarity}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Custom Card UI */}
                            {cardType === 'custom' && (
                                <div style={{ background: '#222', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Custom Tag</label>
                                        <input
                                            type="text"
                                            value={customTag}
                                            onChange={(e) => setCustomTag(e.target.value)}
                                            placeholder="Enter a tag (e.g., 'Street Art', 'Portrait')"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: '#1a1a1a',
                                                border: '1px solid #444',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                            Select Rarity <FaStar className={`rarity-glow-${rarity?.toLowerCase() || 'common'}`} style={{ marginLeft: '0.5rem' }} />
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                            {Object.keys(RARITY_TIERS).map(rarityTier => (
                                                <button
                                                    key={rarityTier}
                                                    onClick={() => setRarity(rarityTier)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        background: rarity === rarityTier ? (RARITY_TIERS[rarityTier].colorHex || RARITY_TIERS[rarityTier].color) : '#1a1a1a',
                                                        color: rarity === rarityTier ? '#000' : (RARITY_TIERS[rarityTier].colorHex || RARITY_TIERS[rarityTier].color),
                                                        border: `2px solid ${RARITY_TIERS[rarityTier].colorHex || RARITY_TIERS[rarityTier].color}`,
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {rarityTier}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Common Fields */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Card Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter card title"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#222',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your card"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#222',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Discipline</label>
                                    <select
                                        value={discipline}
                                        onChange={(e) => setDiscipline(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#222',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {Object.values(CARD_DISCIPLINES).map(disc => (
                                            <option key={disc} value={disc}>{disc}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Card Style</label>
                                    <select
                                        value={cardStyle}
                                        onChange={(e) => setCardStyle(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#222',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {Object.values(CARD_STYLES).map(style => (
                                            <option key={style} value={style}>{style}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Card Layout Toggle */}
                            <div style={{ marginTop: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>Card Layout</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {/* Fullbleed Option */}
                                    <button
                                        type="button"
                                        onClick={() => setCardLayout('fullbleed')}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: cardLayout === 'fullbleed' ? 'rgba(127, 255, 212, 0.15)' : '#1a1a1a',
                                            border: cardLayout === 'fullbleed' ? '2px solid var(--brand-mint)' : '1px solid #333',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {/* Fullbleed Preview Icon */}
                                        <div style={{
                                            width: '50px',
                                            height: '70px',
                                            background: 'linear-gradient(135deg, #333, #555)',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid #666'
                                        }}>
                                            <FaImage style={{ color: '#888', fontSize: '1.2rem' }} />
                                        </div>
                                        <span style={{
                                            color: cardLayout === 'fullbleed' ? 'var(--brand-mint)' : '#888',
                                            fontSize: '0.85rem',
                                            fontWeight: cardLayout === 'fullbleed' ? '600' : '400'
                                        }}>Fullbleed</span>
                                        <span style={{ color: '#666', fontSize: '0.7rem' }}>Edge-to-edge image</span>
                                    </button>

                                    {/* Bordered Option */}
                                    <button
                                        type="button"
                                        onClick={() => setCardLayout('bordered')}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: cardLayout === 'bordered' ? 'rgba(127, 255, 212, 0.15)' : '#1a1a1a',
                                            border: cardLayout === 'bordered' ? '2px solid var(--brand-mint)' : '1px solid #333',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {/* Bordered Preview Icon */}
                                        <div style={{
                                            width: '50px',
                                            height: '70px',
                                            background: '#222',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden',
                                            border: '2px solid #666'
                                        }}>
                                            {/* Landscape image area */}
                                            <div style={{
                                                flex: '0 0 55%',
                                                background: 'linear-gradient(135deg, #333, #555)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <FaImage style={{ color: '#888', fontSize: '0.8rem' }} />
                                            </div>
                                            {/* Info area */}
                                            <div style={{
                                                flex: 1,
                                                background: 'linear-gradient(180deg, #444, #333)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                padding: '2px',
                                                gap: '1px'
                                            }}>
                                                <div style={{ height: '3px', background: '#555', borderRadius: '1px' }}></div>
                                                <div style={{ height: '2px', background: '#555', width: '60%', borderRadius: '1px' }}></div>
                                            </div>
                                        </div>
                                        <span style={{
                                            color: cardLayout === 'bordered' ? 'var(--brand-mint)' : '#888',
                                            fontSize: '0.85rem',
                                            fontWeight: cardLayout === 'bordered' ? '600' : '400'
                                        }}>Bordered</span>
                                        <span style={{ color: '#666', fontSize: '0.7rem' }}>Pokémon-style layout</span>
                                    </button>

                                </div>
                            </div>

                            {/* City Theme Selection - Custom & Bordered Only */}
                            {cardType === 'custom' && cardLayout === 'bordered' && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: '#1a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: '8px'
                                }}>
                                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600' }}>City Background (Optional)</label>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                        gap: '0.75rem',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        paddingRight: '0.5rem'
                                    }}>
                                        {/* Standard / None Option */}
                                        <button
                                            type="button"
                                            onClick={() => setCityThemeId(null)}
                                            style={{
                                                padding: '0.75rem',
                                                background: cityThemeId === null ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                                border: cityThemeId === null ? '1px solid var(--brand-mint)' : '1px solid #444',
                                                borderRadius: '8px',
                                                color: cityThemeId === null ? '#fff' : '#aaa',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                textAlign: 'center'
                                            }}
                                        >
                                            Standard (None)
                                        </button>

                                        {Object.entries(CITY_THEMES).map(([id, theme]) => (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => setCityThemeId(id)}
                                                style={{
                                                    padding: '0.75rem',
                                                    background: cityThemeId === id ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                                    border: cityThemeId === id ? '1px solid var(--brand-mint)' : '1px solid #444',
                                                    borderRadius: '8px',
                                                    color: cityThemeId === id ? '#fff' : '#aaa',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {theme.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Edition Type</label>
                                <select
                                    value={editionType}
                                    onChange={(e) => setEditionType(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#222',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value={EDITION_TYPES.UNLIMITED}>Unlimited (Not Tradable)</option>
                                    <option value={EDITION_TYPES.LIMITED}>Limited Edition (Tradable)</option>
                                    <option value={EDITION_TYPES.TIMED}>Timed Edition (Tradable)</option>
                                    <option value={EDITION_TYPES.CHALLENGE}>Challenge Reward</option>
                                    <option value={EDITION_TYPES.CONTEST}>Contest Prize</option>
                                </select>

                                {/* Copyright Warning for Tradable Items */}
                                {(editionType === EDITION_TYPES.LIMITED || editionType === EDITION_TYPES.TIMED) && (
                                    <div style={{
                                        marginTop: '0.75rem',
                                        padding: '0.75rem',
                                        background: 'rgba(255, 165, 0, 0.1)',
                                        border: '1px solid rgba(255, 165, 0, 0.3)',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        color: '#ffb84d',
                                        lineHeight: '1.4'
                                    }}>
                                        ⚠️ <strong>Copyright Notice:</strong> By listing this item, you certify that you own all rights to this content. Unauthorized sale of copyrighted material is prohibited.
                                    </div>
                                )}
                            </div>

                            {editionType === EDITION_TYPES.LIMITED && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Edition Size</label>
                                    <input
                                        type="number"
                                        value={editionSize}
                                        onChange={(e) => setEditionSize(parseInt(e.target.value))}
                                        min="1"
                                        max="10000"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#222',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            )}

                            <div>
                                {/* SHOP INTEGRATION TOGGLE */}
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    background: '#222',
                                    borderRadius: '8px',
                                    border: '1px solid #333'
                                }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        cursor: 'pointer'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={addToShopDraft}
                                            onChange={(e) => setAddToShopDraft(e.target.checked)}
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                cursor: 'pointer',
                                                accentColor: '#7FFFD4'
                                            }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#fff' }}>
                                                Add to Shop as Draft
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                                Create a draft listing in your shop to sell this card later.
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === 3 && (
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <h3>Card Preview</h3>

                                {/* Fullbleed Layout */}
                                {cardLayout === 'fullbleed' && (
                                    <div
                                        className={`${RARITY_TIERS[rarity]?.cssClass || 'rarity-common'}`}
                                        style={{
                                            aspectRatio: '2/3',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            boxShadow: RARITY_TIERS[rarity]?.glow ? `0 0 20px ${RARITY_TIERS[rarity].colorHex}40` : 'none',
                                            background: '#000'
                                        }}
                                    >
                                        <img src={frontImage} alt={title} style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: `${imagePosition.x}% ${imagePosition.y}%`
                                        }} />
                                    </div>
                                )}

                                {/* Bordered Layout - Pokémon Style (Standard) */}
                                {cardLayout === 'bordered' && !cityThemeId && (
                                    <div
                                        className={`${RARITY_TIERS[rarity]?.cssClass || 'rarity-common'}`}
                                        style={{
                                            aspectRatio: '2/3',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            boxShadow: RARITY_TIERS[rarity]?.glow ? `0 0 25px ${RARITY_TIERS[rarity].colorHex}50` : 'none',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            // Rarity-matched gradient background
                                            background: rarity === 'Galactic'
                                                ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                                                : rarity === 'Ultra'
                                                    ? `linear-gradient(180deg, #1a0a12 0%, #2d1420 50%, rgba(255, 107, 157, 0.15) 100%)`
                                                    : rarity === 'Super'
                                                        ? `linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 50%, rgba(108, 92, 231, 0.15) 100%)`
                                                        : rarity === 'Rare'
                                                            ? `linear-gradient(180deg, #0a1a1a 0%, #0d2530 50%, rgba(76, 201, 240, 0.15) 100%)`
                                                            : `linear-gradient(180deg, #0a1a15 0%, #0d2520 50%, rgba(127, 255, 212, 0.1) 100%)`
                                        }}
                                    >
                                        {/* Landscape Image Area - Top 55% with film strip crop */}
                                        <div style={{
                                            flex: '0 0 55%',
                                            position: 'relative',
                                            margin: '8px 8px 0 8px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: `2px solid ${RARITY_TIERS[rarity]?.colorHex || '#7FFFD4'}30`
                                        }}>
                                            <img
                                                src={frontImage}
                                                alt={title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    objectPosition: `${imagePosition.x}% ${imagePosition.y}%`
                                                }}
                                            />
                                        </div>

                                        {/* Card Info Panel - Bottom */}
                                        <div style={{
                                            flex: 1,
                                            padding: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px'
                                        }}>
                                            {/* Title */}
                                            <div style={{
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                color: '#fff',
                                                fontFamily: 'var(--font-family-heading)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.03em',
                                                lineHeight: 1.2,
                                                textShadow: `0 2px 4px rgba(0,0,0,0.5)`
                                            }}>
                                                {title || 'Card Title'}
                                            </div>

                                            {/* Tag / Subject */}
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'rgba(255,255,255,0.7)',
                                                fontWeight: '500'
                                            }}>
                                                {cardType === 'official' ? getTagLabel(officialCategory, selectedTag) : customTag}
                                            </div>

                                            {/* Description */}
                                            {description && (
                                                <div style={{
                                                    fontSize: '0.65rem',
                                                    color: 'rgba(255,255,255,0.8)',
                                                    marginTop: '2px',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    lineHeight: 1.3,
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                                }}>
                                                    {description}
                                                </div>
                                            )}

                                            {/* Rarity Badge */}
                                            <div style={{
                                                marginTop: 'auto',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span
                                                    className={`rarity-text-${rarity?.toLowerCase() || 'common'}`}
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}
                                                >
                                                    <FaStar style={{ marginRight: '4px', fontSize: '0.7rem' }} />
                                                    {rarity}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    color: 'rgba(255,255,255,0.5)',
                                                    fontWeight: '500'
                                                }}>
                                                    {discipline}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* City Layout - Bordered with Theme */}
                                {cardLayout === 'bordered' && cityThemeId && (
                                    <div
                                        className={`${RARITY_TIERS[rarity]?.cssClass || 'rarity-common'}`}
                                        style={{
                                            aspectRatio: '2/3',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            boxShadow: RARITY_TIERS[rarity]?.glow ? `0 0 25px ${RARITY_TIERS[rarity].colorHex}50` : 'none',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative'
                                        }}
                                    >
                                        <CityCardFrame
                                            themeId={cityThemeId}
                                            width="100%"
                                            height="100%"
                                            style={{ position: 'absolute', inset: 0 }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                                {/* Image Area - Top (Standard) */}
                                                <div style={{
                                                    flex: '0 0 55%',
                                                    position: 'relative',
                                                    margin: '8px 8px 0 8px', // Margin at top
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    border: `2px solid ${RARITY_TIERS[rarity]?.colorHex || '#7FFFD4'}30`
                                                }}>
                                                    <img src={frontImage} alt={title} style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        objectPosition: `${imagePosition.x}% ${imagePosition.y}%`
                                                    }} />
                                                </div>

                                                {/* Card Info Panel - Bottom (Standard) */}
                                                <div style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px'
                                                }}>
                                                    {/* Title */}
                                                    <div style={{
                                                        fontSize: '1rem',
                                                        fontWeight: '700',
                                                        color: '#fff',
                                                        fontFamily: 'var(--font-family-heading)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.03em',
                                                        lineHeight: 1.2,
                                                        textShadow: `0 2px 4px rgba(0,0,0,0.5)`
                                                    }}>
                                                        {title || 'Card Title'}
                                                    </div>

                                                    {/* Tag / Subject */}
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: 'rgba(255,255,255,0.7)',
                                                        fontWeight: '500'
                                                    }}>
                                                        {cardType === 'official' ? getTagLabel(officialCategory, selectedTag) : customTag}
                                                    </div>

                                                    {/* Description */}
                                                    {description && (
                                                        <div style={{
                                                            fontSize: '0.65rem',
                                                            color: 'rgba(255,255,255,0.8)',
                                                            marginTop: '2px',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: 1.3,
                                                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                                        }}>
                                                            {description}
                                                        </div>
                                                    )}

                                                    {/* Rarity Badge */}
                                                    <div style={{
                                                        marginTop: 'auto',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <span
                                                            className={`rarity-text-${rarity?.toLowerCase() || 'common'}`}
                                                            style={{
                                                                fontSize: '0.8rem',
                                                                fontWeight: '700',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.05em'
                                                            }}
                                                        >
                                                            <FaStar style={{ marginRight: '4px', fontSize: '0.7rem' }} />
                                                            {rarity}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            color: 'rgba(255,255,255,0.5)',
                                                            fontWeight: '500'
                                                        }}>
                                                            {discipline}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CityCardFrame>
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3>Card Details</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#ccc' }}>
                                    <div><strong>Title:</strong> {title}</div>
                                    <div><strong>Type:</strong> {cardType === 'official' ? 'Official' : 'Custom'}</div>
                                    <div><strong>Tag:</strong> {cardType === 'official' ? getTagLabel(officialCategory, selectedTag) : customTag}</div>
                                    <div><strong>Discipline:</strong> {discipline}</div>
                                    <div><strong>Rarity:</strong> <span className={`rarity-text-${rarity?.toLowerCase() || 'common'}`}>{rarity}</span></div>
                                    <div><strong>Layout:</strong> {cardLayout === 'bordered' ? (cityThemeId ? `Bordered (City: ${CITY_THEMES[cityThemeId]?.name})` : 'Bordered (Standard)') : 'Fullbleed'}</div>
                                    <div><strong>Edition:</strong> {editionType === EDITION_TYPES.LIMITED ? `Limited (${editionSize})` : editionType}</div>
                                    {/* <div><strong>Price:</strong> ${basePrice.toFixed(2)}</div> */}
                                    {description && <div><strong>Description:</strong> {description}</div>}
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        background: 'rgba(127, 255, 212, 0.1)',
                                        border: '1px solid #7FFFD4',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem'
                                    }}>
                                        <FaInfoCircle style={{ marginRight: '0.5rem' }} />
                                        You will receive a permanent Creator Edition (0/0) that cannot be sold.
                                    </div>

                                    {uploadedFile && postToFeed && (
                                        <div style={{
                                            marginTop: '0.5rem',
                                            padding: '1rem',
                                            background: 'rgba(127, 255, 212, 0.1)',
                                            border: '1px solid #7FFFD4',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <FaRocket style={{ marginRight: '0.5rem' }} />
                                            A new post will also be created on your feed.
                                        </div>
                                    )}

                                    {addToShopDraft && (
                                        <div style={{
                                            marginTop: '0.5rem',
                                            padding: '1rem',
                                            background: 'rgba(127, 255, 212, 0.1)',
                                            border: '1px solid #7FFFD4',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <FaShoppingCart style={{ marginRight: '0.5rem' }} />
                                            A draft item will be added to your shop.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem'
                }}>
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#333',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Back
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !selectedPost && !uploadedFile}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: (step === 1 && !selectedPost && !uploadedFile) ? '#333' : '#7FFFD4',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#000',
                                cursor: (step === 1 && !selectedPost && !uploadedFile) ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                opacity: (step === 1 && !selectedPost && !uploadedFile) ? 0.5 : 1
                            }}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: loading ? '#333' : '#7FFFD4',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#000',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Card'}
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
};

export default CreateCardModal;
