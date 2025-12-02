import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useCreateCollection } from '../hooks/useCollections';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FaImage, FaTimes, FaPlus, FaLock, FaUsers, FaGlobe, FaStore, FaTag, FaUniversity, FaBook, FaClock, FaCalendar } from 'react-icons/fa';
import exifr from 'exifr';
import { PRINT_SIZES, PRINT_TIERS } from '../constants/printSizes';
import { calculateBundlePricing } from '../utils/bundlePricing';
import { RELEASE_FREQUENCIES } from '../constants/magazineConfig';
import { createMagazine, calculateNextReleaseDate } from '../services/magazineService';

const CreateCollection = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { createCollection, loading: creating } = useCreateCollection();
    const fileInputRef = useRef(null);

    // Generate stars for background animation
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

    const [creationMode, setCreationMode] = useState('collection'); // 'collection', 'gallery', 'museum', or 'magazine'
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [postToFeed, setPostToFeed] = useState(true);
    const [showInStore, setShowInStore] = useState(false);
    const [productTier, setProductTier] = useState(PRINT_TIERS.ECONOMY);
    const [defaultSizeId, setDefaultSizeId] = useState('8x10');

    // Magazine-specific state
    const [releaseFrequency, setReleaseFrequency] = useState('monthly');
    const [releaseTime, setReleaseTime] = useState('09:00');
    const [releaseDay, setReleaseDay] = useState(1);
    const [linkedGalleryId, setLinkedGalleryId] = useState('');

    const [images, setImages] = useState([]);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const filesToAdd = files.slice(0, 10 - images.length);

        const newImages = await Promise.all(
            filesToAdd.map(async (file) => {
                const preview = URL.createObjectURL(file);

                let exif = null;
                try {
                    const exifData = await exifr.parse(file);
                    if (exifData) {
                        exif = {
                            camera: exifData.Make || null,
                            lens: exifData.LensModel || null,
                            focalLength: exifData.FocalLength || null,
                            aperture: exifData.FNumber || null,
                            shutterSpeed: exifData.ExposureTime || null,
                            iso: exifData.ISO || null,
                            dateTaken: exifData.DateTimeOriginal || null
                        };
                    }
                } catch (err) {
                    console.warn('EXIF extraction failed:', err);
                }

                const img = new Image();
                img.src = preview;
                await new Promise(resolve => { img.onload = resolve; });

                return {
                    file,
                    preview,
                    exif,
                    aspectRatio: img.width / img.height,
                    width: img.width,
                    height: img.height,
                    sizeId: defaultSizeId,
                    sizeLabel: PRINT_SIZES.find(s => s.id === defaultSizeId)?.label || '8" × 10"'
                };
            })
        );

        setImages(prev => [...prev, ...newImages]);
        if (images.length === 0) setActiveImageIndex(0);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        if (activeImageIndex >= images.length - 1) {
            setActiveImageIndex(Math.max(0, images.length - 2));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('[CreateCollection] handleSubmit called');

        if (!title.trim()) {
            alert(`Please enter a ${creationMode} title`);
            return;
        }

        // Magazine mode
        if (creationMode === 'magazine') {
            try {
                setUploading(true);

                let finalCoverImageUrl = null;

                // Upload cover image if selected
                if (images.length > 0) {
                    const image = images[0];
                    const fileName = `magazines/${currentUser.uid}/${Date.now()}_cover_${image.file.name}`;
                    const storageRef = ref(storage, fileName);
                    await uploadBytes(storageRef, image.file);
                    finalCoverImageUrl = await getDownloadURL(storageRef);
                }

                // Calculate next release date
                const nextReleaseDate = calculateNextReleaseDate(releaseFrequency, releaseDay, releaseTime);

                const magazineData = {
                    ownerId: currentUser.uid,
                    ownerName: currentUser.displayName || 'Anonymous',
                    title: title.trim(),
                    description: description.trim(),
                    coverImage: finalCoverImageUrl,
                    releaseFrequency,
                    releaseTime,
                    releaseDay,
                    nextReleaseDate,
                    galleryId: linkedGalleryId || null,
                    collaborationEnabled: !!linkedGalleryId,
                    visibility
                };

                console.log('[CreateCollection] Creating magazine...');
                const newMagazine = await createMagazine(magazineData);
                console.log('[CreateCollection] Magazine created:', newMagazine.id);

                navigate(`/magazine/${newMagazine.id}`);
                return;
            } catch (err) {
                console.error('[CreateCollection] Error creating magazine:', err);
                alert(`Failed to create magazine: ${err.message}`);
            } finally {
                setUploading(false);
            }
            return;
        }

        // Museum mode
        if (creationMode === 'museum') {
            try {
                setUploading(true);

                let finalCoverImageUrl = null;

                // Upload cover image if selected
                if (images.length > 0) {
                    const image = images[0];
                    const fileName = `museums/${currentUser.uid}/${Date.now()}_cover_${image.file.name}`;
                    const storageRef = ref(storage, fileName);
                    await uploadBytes(storageRef, image.file);
                    finalCoverImageUrl = await getDownloadURL(storageRef);
                }

                const museumData = {
                    type: 'museum',
                    ownerId: currentUser.uid,
                    ownerName: currentUser.displayName || 'Anonymous',
                    title: title.trim(),
                    description: description.trim(),
                    coverImage: finalCoverImageUrl,
                    galleryIds: [], // Will be populated when galleries are added
                    profileIds: [], // Will be populated when profiles are added
                    members: [currentUser.uid], // Owner is first member
                    memberCount: 1,
                    visibility,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                console.log('[CreateCollection] Creating museum...');
                const docRef = await addDoc(collection(db, 'museums'), museumData);
                console.log('[CreateCollection] Museum created:', docRef.id);

                navigate(`/museum/${docRef.id}`);
                return;
            } catch (err) {
                console.error('[CreateCollection] Error creating museum:', err);
                alert(`Failed to create museum: ${err.message}`);
            } finally {
                setUploading(false);
            }
            return;
        }

        // Collection/Gallery mode - images required
        if (images.length === 0) {
            alert('Please add at least 1 image to your collection (max 10)');
            return;
        }

        console.log('[CreateCollection] Validation passed, starting upload...');

        try {
            setUploading(true);
            setUploadProgress(0);

            const uploadedItems = [];
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const fileName = `collections/${currentUser.uid}/${Date.now()}_${i}_${image.file.name}`;
                const storageRef = ref(storage, fileName);

                await uploadBytes(storageRef, image.file);
                const imageUrl = await getDownloadURL(storageRef);

                uploadedItems.push({
                    imageUrl,
                    exif: image.exif,
                    aspectRatio: image.aspectRatio,
                    storagePath: fileName,
                    sizeId: image.sizeId,
                    sizeLabel: image.sizeLabel
                });

                setUploadProgress(((i + 1) / images.length) * 100);
            }

            const bundlePricing = calculateBundlePricing(
                uploadedItems.map(item => ({
                    sizeId: item.sizeId,
                    sizeLabel: item.sizeLabel
                })),
                productTier
            );

            const collectionData = {
                type: creationMode, // 'collection' or 'gallery'
                ownerId: currentUser.uid,
                title: title.trim(),
                description: description.trim(),
                coverImage: uploadedItems[0].imageUrl,
                items: uploadedItems,
                postRefs: [],
                visibility,
                postToFeed,
                productTier,
                bundlePricing,
                shopSettings: {
                    showInStore,
                    productTier
                }
            };

            console.log('[CreateCollection] Creating collection...');
            const newCollection = await createCollection(collectionData);
            console.log('[CreateCollection] Collection created:', newCollection.id);

            navigate(`/collection/${newCollection.id}`);
        } catch (err) {
            console.error('[CreateCollection] Error:', err);
            alert(`Failed to create collection: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const activeImage = images[activeImageIndex];

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem', position: 'relative', overflow: 'hidden' }}>
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
            `}</style>

            <div style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                background: '#000',
                zIndex: 100
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Cancel
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {creationMode === 'gallery' ? 'Create Gallery' : 
                     creationMode === 'museum' ? 'Create Museum' : 
                     creationMode === 'magazine' ? 'Create Magazine' : 
                     'Create Collection'}
                </h1>
                <button
                    onClick={handleSubmit}
                    disabled={uploading || (creationMode !== 'museum' && creationMode !== 'magazine' && images.length === 0)}
                    style={{
                        background: uploading || (creationMode !== 'museum' && creationMode !== 'magazine' && images.length === 0) ? '#333' : '#7FFFD4',
                        color: uploading || (creationMode !== 'museum' && creationMode !== 'magazine' && images.length === 0) ? '#666' : '#000',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        cursor: uploading || (creationMode !== 'museum' && creationMode !== 'magazine' && images.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {uploading ? `${Math.round(uploadProgress)}%` : 'Create'}
                </button>
            </div>

            {/* Collection/Gallery/Museum Toggle */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem 0 2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => setCreationMode('collection')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: creationMode === 'collection' ? '#7FFFD4' : '#111',
                            border: creationMode === 'collection' ? '1px solid #7FFFD4' : '1px solid #333',
                            borderRadius: '8px',
                            color: creationMode === 'collection' ? '#000' : '#888',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        Collection
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/gallery/create')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#888',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        Gallery
                    </button>
                    <button
                        type="button"
                        onClick={() => setCreationMode('museum')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: creationMode === 'museum' ? '#7FFFD4' : '#111',
                            border: creationMode === 'museum' ? '1px solid #7FFFD4' : '1px solid #333',
                            borderRadius: '8px',
                            color: creationMode === 'museum' ? '#000' : '#888',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaUniversity /> Museum
                    </button>
                    <button
                        type="button"
                        onClick={() => setCreationMode('magazine')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: creationMode === 'magazine' ? '#7FFFD4' : '#111',
                            border: creationMode === 'magazine' ? '1px solid #7FFFD4' : '1px solid #333',
                            borderRadius: '8px',
                            color: creationMode === 'magazine' ? '#000' : '#888',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaBook /> Magazine
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div>
                        {creationMode === 'magazine' ? (
                            /* Magazine Mode - Image Upload Preview */
                            <div style={{
                                aspectRatio: '0.7727', // 8.5:11 magazine ratio
                                background: images.length > 0 ? `url(${images[0].preview})` : '#111',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                border: '2px solid #333',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                position: 'relative'
                            }}>
                                {images.length === 0 && (
                                    <>
                                        <FaBook style={{ fontSize: '4rem', color: '#7FFFD4', opacity: 0.5 }} />
                                        <div style={{ color: '#888', textAlign: 'center', fontSize: '0.9rem' }}>
                                            Magazine Preview
                                            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>8.5" × 11" Aspect Ratio</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : creationMode === 'museum' ? (
                            /* Museum Mode - Image Upload Preview */
                            <div style={{
                                aspectRatio: '3/2',
                                background: images.length > 0 ? `url(${images[0].preview})` : '#111',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                border: '2px solid #333',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                position: 'relative'
                            }}>
                                {images.length === 0 && (
                                    <>
                                        <FaUniversity style={{ fontSize: '4rem', color: '#7FFFD4', opacity: 0.5 }} />
                                        <div style={{ color: '#888', textAlign: 'center', fontSize: '0.9rem' }}>
                                            Museum Preview
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : images.length === 0 ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    aspectRatio: '3/2',
                                    background: '#111',
                                    border: '2px dashed #333',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    gap: '1rem'
                                }}
                            >
                                <FaImage style={{ fontSize: '3rem', color: '#666' }} />
                                <div style={{ color: '#888', textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        Add Images to {creationMode === 'gallery' ? 'Gallery' : 'Collection'}
                                    </div>
                                    <div style={{ fontSize: '0.9rem' }}>1-10 images required</div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{
                                    aspectRatio: activeImage?.aspectRatio || '3/2',
                                    background: '#111',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    marginBottom: '1rem'
                                }}>
                                    <img
                                        src={activeImage?.preview}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    {images.map((img, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setActiveImageIndex(index)}
                                            style={{
                                                position: 'relative',
                                                width: '80px',
                                                height: '80px',
                                                flexShrink: 0,
                                                border: activeImageIndex === index ? '2px solid #7FFFD4' : '2px solid transparent',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <img
                                                src={img.preview}
                                                alt=""
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(index);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    background: 'rgba(0,0,0,0.7)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: '#fff'
                                                }}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                    {images.length < 10 && (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                flexShrink: 0,
                                                border: '2px dashed #333',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: '#666'
                                            }}
                                        >
                                            <FaPlus />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                {creationMode === 'museum' ? 'Museum' : creationMode === 'gallery' ? 'Gallery' : 'Collection'} Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={creationMode === 'museum' ? 'e.g., Street Photography Museum' : creationMode === 'gallery' ? 'e.g., Summer 2024 Gallery' : 'e.g., Summer 2024 Collection'}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#111',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        {/* Cover Image Upload for Museums */}
                        {creationMode === 'museum' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                    Cover Image (Optional)
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#111',
                                        border: '1px dashed #333',
                                        borderRadius: '8px',
                                        color: '#888',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaImage />
                                    {images.length > 0 ? 'Change Cover Image' : 'Upload Cover Image'}
                                </div>
                                {images.length > 0 && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#7FFFD4' }}>
                                        Selected: {images[0].file.name}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Magazine-specific fields */}
                        {creationMode === 'magazine' && (
                            <>
                                {/* Cover Image Upload */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                        Cover Image (Optional)
                                    </label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#111',
                                            border: '1px dashed #333',
                                            borderRadius: '8px',
                                            color: '#888',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <FaImage />
                                        {images.length > 0 ? 'Change Cover Image' : 'Upload Cover Image'}
                                    </div>
                                    {images.length > 0 && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#7FFFD4' }}>
                                            Selected: {images[0].file.name}
                                        </div>
                                    )}
                                </div>

                                {/* Release Frequency */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                        Release Frequency *
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {RELEASE_FREQUENCIES.map(({ value, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setReleaseFrequency(value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    background: releaseFrequency === value ? 'rgba(127, 255, 212, 0.2)' : '#111',
                                                    border: releaseFrequency === value ? '1px solid #7FFFD4' : '1px solid #333',
                                                    borderRadius: '8px',
                                                    color: releaseFrequency === value ? '#7FFFD4' : '#888',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Release Day */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                        <FaCalendar style={{ marginRight: '0.5rem' }} />
                                        Release Day of Month *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={releaseDay}
                                        onChange={(e) => setReleaseDay(parseInt(e.target.value) || 1)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#111',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                        Day 1-31 (if month doesn't have this day, it will use the last day)
                                    </div>
                                </div>

                                {/* Release Time */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                        <FaClock style={{ marginRight: '0.5rem' }} />
                                        Release Time *
                                    </label>
                                    <input
                                        type="time"
                                        value={releaseTime}
                                        onChange={(e) => setReleaseTime(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#111',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                {/* Gallery Link (Optional) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                        Link to Gallery (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={linkedGalleryId}
                                        onChange={(e) => setLinkedGalleryId(e.target.value)}
                                        placeholder="Gallery ID for collaboration"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#111',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                        Link a gallery to enable collaborative submissions
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={`Describe this ${creationMode}...`}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#111',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                Visibility
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[
                                    { value: 'public', icon: FaGlobe, label: 'Public' },
                                    { value: 'followers', icon: FaUsers, label: 'Followers' },
                                    { value: 'private', icon: FaLock, label: 'Private' }
                                ].map(({ value, icon: Icon, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setVisibility(value)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            background: visibility === value ? 'rgba(127, 255, 212, 0.2)' : '#111',
                                            border: visibility === value ? '1px solid #7FFFD4' : '1px solid #333',
                                            borderRadius: '8px',
                                            color: visibility === value ? '#7FFFD4' : '#888',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <Icon /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Post to Feed - Not applicable for museums */}
                        {creationMode !== 'museum' && (
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={postToFeed}
                                        onChange={(e) => setPostToFeed(e.target.checked)}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#ccc' }}>Post to Feed</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                            Posts added to this {creationMode} will appear in the global feed
                                        </div>
                                    </div>
                                </label>
                            </div>
                        )}

                        {/* Shop Settings - Not applicable for museums */}
                        {creationMode !== 'museum' && (<>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem' }}>
                                <input
                                    type="checkbox"
                                    checked={showInStore}
                                    onChange={(e) => setShowInStore(e.target.checked)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <FaStore style={{ color: '#7FFFD4' }} />
                                <div>
                                    <div style={{ fontWeight: '600' }}>Show in Store</div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                        Make this {creationMode} available for purchase
                                    </div>
                                </div>
                            </label>

                            {showInStore && (
                                <>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                                            Print Quality
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => setProductTier(PRINT_TIERS.ECONOMY)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    background: productTier === PRINT_TIERS.ECONOMY ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                                    border: productTier === PRINT_TIERS.ECONOMY ? '1px solid #7FFFD4' : '1px solid #333',
                                                    borderRadius: '8px',
                                                    color: productTier === PRINT_TIERS.ECONOMY ? '#7FFFD4' : '#888',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                Economy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setProductTier(PRINT_TIERS.PREMIUM)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    background: productTier === PRINT_TIERS.PREMIUM ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                                    border: productTier === PRINT_TIERS.PREMIUM ? '1px solid #7FFFD4' : '1px solid #333',
                                                    borderRadius: '8px',
                                                    color: productTier === PRINT_TIERS.PREMIUM ? '#7FFFD4' : '#888',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                Premium
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                                            Default Print Size
                                        </label>
                                        <select
                                            value={defaultSizeId}
                                            onChange={(e) => {
                                                const newSizeId = e.target.value;
                                                setDefaultSizeId(newSizeId);
                                                setImages(prev => prev.map(img => ({
                                                    ...img,
                                                    sizeId: newSizeId,
                                                    sizeLabel: PRINT_SIZES.find(s => s.id === newSizeId)?.label || newSizeId
                                                })));
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: '#222',
                                                border: '1px solid #333',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {PRINT_SIZES.map(size => (
                                                <option key={size.id} value={size.id}>
                                                    {size.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {images.length > 0 && (() => {
                                        const pricing = calculateBundlePricing(
                                            images.map(img => ({
                                                sizeId: img.sizeId,
                                                sizeLabel: img.sizeLabel
                                            })),
                                            productTier
                                        );

                                        return (
                                            <div style={{
                                                padding: '1rem',
                                                background: 'rgba(127, 255, 212, 0.1)',
                                                border: '1px solid rgba(127, 255, 212, 0.3)',
                                                borderRadius: '8px',
                                                marginTop: '1rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                    <FaTag style={{ color: '#7FFFD4' }} />
                                                    <div style={{ fontWeight: 'bold', color: '#7FFFD4' }}>Bundle Pricing</div>
                                                </div>

                                                <div style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.6' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <span>If bought separately:</span>
                                                        <span style={{ fontWeight: '600' }}>${pricing.baseCollectionPrice.toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#7FFFD4' }}>
                                                        <span>Bundle discount ({pricing.bundleDiscountPercent}%):</span>
                                                        <span style={{ fontWeight: '600' }}>-${pricing.savingsAmount.toFixed(2)}</span>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        paddingTop: '0.75rem',
                                                        borderTop: '1px solid rgba(127, 255, 212, 0.3)',
                                                        fontSize: '1.1rem',
                                                        fontWeight: 'bold',
                                                        color: '#fff'
                                                    }}>
                                                        <span>Bundle Price:</span>
                                                        <span>${pricing.finalBundlePrice.toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
                                                        ✓ Pricing automatically calculated<br />
                                                        ✓ Artist & platform margins protected
                                                    </div>
                                                </div>
                                            </div>

                                        );
                                    })()}
                                </>
                            )}
                        </>)}
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: images.length > 0 ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                        border: `1px solid ${images.length > 0 ? 'rgba(127, 255, 212, 0.3)' : 'rgba(255, 68, 68, 0.3)'}`,
                        borderRadius: '8px',
                        color: images.length > 0 ? '#7FFFD4' : '#ff4444',
                        fontSize: '0.9rem'
                    }}>
                        {creationMode === 'museum' ? (
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Ready to Create Museum</div>
                                <div style={{ fontSize: '0.85rem' }}>Museums can contain galleries and profiles</div>
                            </div>
                        ) : (
                            <>
                                {images.length} / 10 images added
                                {images.length === 0 && <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Add at least 1 image to create {creationMode}</div>}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CreateCollection;
