import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaCamera, FaShoppingBag, FaTag, FaUpload, FaStore } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { PRINT_TIERS } from '@/domain/shop/pricing';
import { fetchPublishedPosts } from '@/core/services/firestore/posts.service';
import { logger } from '@/core/utils/logger';
import StarBackground from '@/components/StarBackground';

const CreateShopItemModal = ({ onClose, onCreated }) => {
    const { currentUser } = useAuth();
    const [step, setStep] = useState(1); // 1: Select Post, 2: Configure Item
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Selection State
    const [selectedPost, setSelectedPost] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadPreview, setUploadPreview] = useState('');
    const fileInputRef = useRef(null);

    // Config State
    const [config, setConfig] = useState({
        title: '',
        description: '',
        productTier: PRINT_TIERS.ECONOMY,
        includeStickers: false,
        imageUrl: '',
        tags: []
    });

    // Fetch posts
    useEffect(() => {
        const loadPosts = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                // Fetch only published posts for shop items
                const posts = await fetchPublishedPosts(currentUser.uid, 50);
                setUserPosts(posts);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, [currentUser]);

    const handlePostSelect = (post) => {
        setSelectedPost(post);
        setUploadedFile(null);
        setUploadPreview('');

        // Auto-fill config
        const imgUrl = post.downloadURL || post.images?.[0]?.url;
        setConfig(prev => ({
            ...prev,
            title: post.title || 'Untitled Print',
            description: post.description || '',
            imageUrl: imgUrl,
            tags: post.tags || []
        }));
        setStep(2);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setUploadedFile(file);
            setSelectedPost(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadPreview(reader.result);
                setConfig(prev => ({
                    ...prev,
                    title: 'Untitled Print',
                    description: '',
                    imageUrl: reader.result, // Preview only
                    tags: []
                }));
                setStep(2);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!config.imageUrl || !config.title) {
            alert("Please provide an image and title.");
            return;
        }

        setLoading(true);
        try {
            let finalImageUrl = config.imageUrl;

            // Handle File Upload if needed
            if (uploadedFile) {
                const storageRef = ref(storage, `shopItems/${currentUser.uid}/${Date.now()}_${uploadedFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, uploadedFile);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed', null, reject, resolve);
                });

                finalImageUrl = await getDownloadURL(storageRef);
            }

            // Create Shop Item
            const shopItemData = {
                ownerId: currentUser.uid,
                kind: "print", // Default to print for now
                status: "draft", // Start as draft for safety
                sourcePostId: selectedPost?.id || null,
                title: config.title,
                description: config.description,
                imageUrl: finalImageUrl,
                tags: config.tags,
                productTier: config.productTier,
                includeStickers: config.includeStickers,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                available: false, // Default to false until reviewed

                // Pricing defaults (can be expanded)
                baseCostCents: 0,
                priceCents: 0,
                currency: "USD"
            };

            await addDoc(collection(db, 'shopItems'), shopItemData);

            logger.log("Shop Item Created Successfully");
            if (onCreated) onCreated();
            onClose();

        } catch (error) {
            console.error("Error creating shop item:", error);
            alert("Failed to create shop item: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
            alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem', display: 'flex'
        }}>
            <StarBackground />

            <div style={{
                background: 'rgba(26, 26, 26, 0.7)',
                backdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(127, 255, 212, 0.1)',
                borderRadius: '24px',
                width: '100%', maxWidth: '800px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                position: 'relative', zIndex: 1
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(127, 255, 212, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#fff' }}>
                        {step === 1 ? 'Select Image Source' : 'Configure Product'}
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                        width: '36px', height: '36px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

                    {/* STEP 1: SELECT POST */}
                    {step === 1 && (
                        <div>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        background: 'rgba(127, 255, 212, 0.1)', color: '#7FFFD4',
                                        border: '1px solid rgba(127, 255, 212, 0.3)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer'
                                    }}
                                >
                                    <FaUpload /> Upload New Image
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            </div>

                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem'
                            }}>
                                {userPosts.map(post => (
                                    <div key={post.id} onClick={() => handlePostSelect(post)} style={{
                                        aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                                        border: '1px solid #333', position: 'relative', transition: 'transform 0.2s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <img src={post.downloadURL || post.images?.[0]?.url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                            {userPosts.length === 0 && !loading && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                    No published posts found.
                                </div>
                            )}
                            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Loading posts...</div>}
                        </div>
                    )}

                    {/* STEP 2: CONFIGURE */}
                    {step === 2 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {/* Preview Column */}
                            <div>
                                <div style={{
                                    aspectRatio: '1', borderRadius: '12px', overflow: 'hidden',
                                    border: '1px solid #333', marginBottom: '1rem'
                                }}>
                                    <img src={config.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}>
                                    &larr; Choose different image
                                </button>
                            </div>

                            {/* Form Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Product Title</label>
                                    <input
                                        type="text"
                                        value={config.title}
                                        onChange={e => setConfig(p => ({ ...p, title: e.target.value }))}
                                        style={{ width: '100%', padding: '0.75rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Quality Tier</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                        {[
                                            { id: PRINT_TIERS.ECONOMY, label: 'Economy' },
                                            { id: PRINT_TIERS.PREMIUM, label: 'Premium' },
                                            { id: PRINT_TIERS.LIMITED, label: 'Limited' }
                                        ].map(tier => (
                                            <button
                                                key={tier.id}
                                                onClick={() => setConfig(p => ({ ...p, productTier: tier.id }))}
                                                style={{
                                                    padding: '0.75rem',
                                                    background: config.productTier === tier.id ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                                    color: config.productTier === tier.id ? '#7FFFD4' : '#888',
                                                    border: config.productTier === tier.id ? '1px solid #7FFFD4' : '1px solid #333',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {tier.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: '#222', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.includeStickers}
                                        onChange={e => setConfig(p => ({ ...p, includeStickers: e.target.checked }))}
                                        style={{ width: '18px', height: '18px', accentColor: '#7FFFD4' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: '600' }}>Include Stickers</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>Offer sticker pack with this print</div>
                                    </div>
                                </label>

                                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #333' }}>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        style={{
                                            width: '100%', padding: '1rem',
                                            background: '#7FFFD4', color: '#000',
                                            border: 'none', borderRadius: '12px',
                                            fontWeight: 'bold', fontSize: '1rem',
                                            cursor: loading ? 'wait' : 'pointer',
                                            opacity: loading ? 0.7 : 1
                                        }}
                                    >
                                        {loading ? 'Creating Draft...' : 'Create Shop Item'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateShopItemModal;
