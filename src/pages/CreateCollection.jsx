import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useCreateCollection } from '../hooks/useCollections';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import exifr from 'exifr';
import { getPrintifyProducts, PRINT_TIERS, calculateBundlePricing } from '../utils/printifyPricing';
const PRINT_SIZES = getPrintifyProducts();

import { createMagazine, calculateNextReleaseDate } from '../services/magazineService';
import ImageUploadPanel from '../components/create-collection/ImageUploadPanel';
import MagazineModePanel from '../components/create-collection/MagazineModePanel';
import MuseumModePanel from '../components/create-collection/MuseumModePanel';
import CollectionModePanel from '../components/create-collection/CollectionModePanel';
import StudioModePanel from '../components/create-collection/GalleryModePanel';
import PageHeader from '../components/PageHeader';
import PSButton from '../components/PSButton';
import ModeSelector from '../components/create-collection/ModeSelector';
import CollectionFields from '../components/create-collection/CollectionFields';
import SubmitBar from '../components/create-collection/SubmitBar';


const CreateCollection = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { showError, showSuccess } = useToast();
    const { createCollection, loading: creating } = useCreateCollection();
    const fileInputRef = useRef(null);

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
            showError(`Please enter a ${creationMode} title`);
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
                showError(`Failed to create magazine: ${err.message}`);
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
                showError(`Failed to create museum: ${err.message}`);
            } finally {
                setUploading(false);
            }
            return;
        }

        // Collection/Gallery mode - images required
        if (images.length === 0) {
            showError('Please add at least 1 image to your collection (max 10)');
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
            showError(`Failed to create collection: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const activeImage = images[activeImageIndex];

    return (
        <div className="ps-page-overflow">
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

            <PageHeader
                title={
                    creationMode === 'gallery' ? 'Create Studio' :
                        creationMode === 'museum' ? 'Create Museum' :
                            creationMode === 'magazine' ? 'Create Magazine' :
                                'Create Collection'
                }
                leftAction={
                    <PSButton
                        variant="ghost"
                        size="md"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </PSButton>
                }
                rightAction={
                    <PSButton
                        variant="mint"
                        size="md"
                        disabled={uploading || (creationMode !== 'museum' && creationMode !== 'magazine' && images.length === 0)}
                        onClick={handleSubmit}
                    >
                        {uploading ? `${Math.round(uploadProgress)}%` : 'Create'}
                    </PSButton>
                }
                showProgress={uploading}
                progress={uploadProgress}
            />


            <ModeSelector
                creationMode={creationMode}
                setCreationMode={setCreationMode}
            />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div>
                        <ImageUploadPanel
                            images={images}
                            activeImageIndex={activeImageIndex}
                            setActiveImageIndex={setActiveImageIndex}
                            removeImage={removeImage}
                            handleFileSelect={handleFileSelect}
                            fileInputRef={fileInputRef}
                            creationMode={creationMode}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <CollectionFields
                            creationMode={creationMode}
                            title={title}
                            setTitle={setTitle}
                        />

                        {creationMode === 'magazine' && (
                            <MagazineModePanel
                                images={images}
                                fileInputRef={fileInputRef}
                                releaseFrequency={releaseFrequency}
                                setReleaseFrequency={setReleaseFrequency}
                                releaseDay={releaseDay}
                                setReleaseDay={setReleaseDay}
                                releaseTime={releaseTime}
                                setReleaseTime={setReleaseTime}
                                linkedGalleryId={linkedGalleryId}
                                setLinkedGalleryId={setLinkedGalleryId}
                                description={description}
                                setDescription={setDescription}
                                visibility={visibility}
                                setVisibility={setVisibility}
                            />
                        )}

                        {creationMode === 'museum' && (
                            <MuseumModePanel
                                images={images}
                                fileInputRef={fileInputRef}
                                description={description}
                                setDescription={setDescription}
                                visibility={visibility}
                                setVisibility={setVisibility}
                            />
                        )}

                        {creationMode === 'collection' && (
                            <CollectionModePanel
                                description={description}
                                setDescription={setDescription}
                                visibility={visibility}
                                setVisibility={setVisibility}
                                postToFeed={postToFeed}
                                setPostToFeed={setPostToFeed}
                                showInStore={showInStore}
                                setShowInStore={setShowInStore}
                                productTier={productTier}
                                setProductTier={setProductTier}
                                defaultSizeId={defaultSizeId}
                                setDefaultSizeId={setDefaultSizeId}
                                images={images}
                                setImages={setImages}
                                creationMode={creationMode}
                            />
                        )}

                        {creationMode === 'gallery' && (
                            <StudioModePanel
                                description={description}
                                setDescription={setDescription}
                                visibility={visibility}
                                setVisibility={setVisibility}
                                postToFeed={postToFeed}
                                setPostToFeed={setPostToFeed}
                                showInStore={showInStore}
                                setShowInStore={setShowInStore}
                                productTier={productTier}
                                setProductTier={setProductTier}
                                defaultSizeId={defaultSizeId}
                                setDefaultSizeId={setDefaultSizeId}
                                images={images}
                                setImages={setImages}
                                creationMode={creationMode}
                            />
                        )}
                    </div>

                    <SubmitBar
                        creationMode={creationMode}
                        images={images}
                    />
                </div>
            </div>
        </div >
    );
};

export default CreateCollection;
