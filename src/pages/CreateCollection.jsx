import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useCreateCollection } from '../hooks/useCollections';
import { FaImage, FaTimes, FaPlus, FaLock, FaUsers, FaGlobe, FaStore, FaTag } from 'react-icons/fa';
import exifr from 'exifr';
import { PRINT_SIZES, PRINT_TIERS } from '../constants/printSizes';
import { calculateBundlePricing } from '../utils/bundlePricing';

const CreateCollection = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { createCollection, loading: creating } = useCreateCollection();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [showInStore, setShowInStore] = useState(false);
    const [productTier, setProductTier] = useState(PRINT_TIERS.ECONOMY);
    const [defaultSizeId, setDefaultSizeId] = useState('8x10');

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
            alert('Please enter a collection title');
            return;
        }

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
                ownerId: currentUser.uid,
                title: title.trim(),
                description: description.trim(),
                coverImage: uploadedItems[0].imageUrl,
                items: uploadedItems,
                postRefs: [],
                visibility,
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
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '6rem' }}>
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
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Create Collection</h1>
                <button
                    onClick={handleSubmit}
                    disabled={uploading || images.length === 0}
                    style={{
                        background: uploading || images.length === 0 ? '#333' : '#7FFFD4',
                        color: uploading || images.length === 0 ? '#666' : '#000',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        cursor: uploading || images.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    {uploading ? `${Math.round(uploadProgress)}%` : 'Create'}
                </button>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div>
                        {images.length === 0 ? (
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
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Add Images to Collection</div>
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
                                Collection Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Summer 2024 Collection"
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

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontWeight: '600' }}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe this collection..."
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

                        <div style={{ padding: '1rem', background: '#111', border: '1px solid #333', borderRadius: '8px' }}>
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
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Make this collection available for purchase</div>
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
                        </div>

                        <div style={{
                            padding: '1rem',
                            background: images.length > 0 ? 'rgba(127, 255, 212, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                            border: `1px solid ${images.length > 0 ? 'rgba(127, 255, 212, 0.3)' : 'rgba(255, 68, 68, 0.3)'}`,
                            borderRadius: '8px',
                            color: images.length > 0 ? '#7FFFD4' : '#ff4444',
                            fontSize: '0.9rem'
                        }}>
                            {images.length} / 10 images added
                            {images.length === 0 && <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Add at least 1 image to create collection</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCollection;
