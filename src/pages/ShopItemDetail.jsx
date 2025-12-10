import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { FaArrowLeft, FaTag, FaInfoCircle, FaEdit, FaSave, FaCheck, FaTimes } from 'react-icons/fa';
import CheckoutButton from '@/components/CheckoutButton';
import {
    getPrintifyProducts,
    PRINT_TIERS,
    STICKER_PRODUCTS,
    calculatePrintifyEarnings,
    getValidSizesForImage,
    getRetailPrice,
    calculateTieredPricing
} from '@/core/utils/pricing';

import { formatPrice } from '@/core/utils/helpers';
import { isFeatureEnabled } from '@/config/featureFlags';

const PRINT_SIZES = getPrintifyProducts();

const ShopItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth(); // Added userProfile for check

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // View Mode State
    const [selectedSize, setSelectedSize] = useState(null);

    // Edit Mode State
    const [editDescription, setEditDescription] = useState('');
    const [enabledSizes, setEnabledSizes] = useState({}); // { sizeId: boolean }
    const [productTier, setProductTier] = useState(PRINT_TIERS.ECONOMY);
    const [includeStickers, setIncludeStickers] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Toggle for owners to edit active items
    const [previewSizeId, setPreviewSizeId] = useState(null); // For crop preview in edit mode
    // New Feature States
    const [showAdvanced, setShowAdvanced] = useState(false); // 5. Batch Editor Toggle
    const [showWallPreview, setShowWallPreview] = useState(false); // 4. "Preview on Wall" Modal State
    const [activeSlide, setActiveSlide] = useState(0); // Slider State
    const [showVerificationBlocker, setShowVerificationBlocker] = useState(false); // New blocker modal

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const docRef = doc(db, 'shopItems', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() };
                    setItem(data);

                    // Initialize View State
                    if (data.printSizes && data.printSizes.length > 0) {
                        setSelectedSize(data.printSizes[0].id);
                    }

                    // Initialize Edit State
                    setEditDescription(data.description || '');
                    setProductTier(data.productTier || PRINT_TIERS.ECONOMY);
                    setIncludeStickers(data.includeStickers || false);

                    const initialEnabled = {};

                    // Pre-fill from existing configured sizes
                    if (data.printSizes) {
                        data.printSizes.forEach(s => {
                            if (s.tier !== 'sticker') {
                                initialEnabled[s.id] = true;
                            }
                        });
                    }

                    setEnabledSizes(initialEnabled);

                } else {
                    setError("Item not found");
                }
            } catch (err) {
                console.error("Error fetching shop item:", err);
                setError("Failed to load item");
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id]);

    // Helper to determine potential sizes
    const getPotentialSizes = () => {
        if (item.width && item.height) {
            return getValidSizesForImage(item.width, item.height);
        }
        // Fallback: Return ALL sizes if dimensions are missing so user isn't locked out
        return PRINT_SIZES;
    };

    const handleSave = async (publish = false) => {
        setSaving(true);
        try {
            // Use the same source of truth for potential sizes
            const potentialSizes = getPotentialSizes();

            const newPrintSizes = potentialSizes
                .filter(size => enabledSizes[size.id])
                .map(size => {
                    const retailPrice = getRetailPrice(size.id, productTier);
                    const pricing = calculatePrintifyEarnings(retailPrice, size.id);
                    return {
                        id: size.id,
                        label: size.label,
                        price: Number(retailPrice.toFixed(2)),
                        artistEarningsCents: Math.round(pricing.artistEarnings * 100),
                        platformFeeCents: Math.round(pricing.platformEarnings * 100),
                        tier: productTier
                    };
                });

            // Add stickers if enabled and profitable
            if (includeStickers) {
                STICKER_PRODUCTS.forEach(sticker => {
                    const retailPrice = sticker.price;
                    const pricing = calculatePrintifyEarnings(retailPrice, sticker.id);

                    if (pricing) {
                        newPrintSizes.push({
                            id: sticker.id,
                            label: sticker.label,
                            price: Number(retailPrice.toFixed(2)),
                            artistEarningsCents: Math.round(pricing.artistEarnings * 100),
                            platformFeeCents: Math.round(pricing.platformEarnings * 100),
                            tier: 'sticker'
                        });
                    }
                });
            }

            if (publish && newPrintSizes.length === 0) {
                alert("You must enable at least one print size to publish.");
                setSaving(false);
                return;
            }

            const updateData = {
                description: editDescription,
                printSizes: newPrintSizes,
                productTier,
                includeStickers,
                updatedAt: serverTimestamp()
            };

            if (publish) {
                // 4.1 Check Verification Status
                if (!userProfile?.shopVerified) {
                    setShowVerificationBlocker(true);
                    setSaving(false);
                    return;
                }
                updateData.available = true;
                updateData.status = 'active';
            }

            await updateDoc(doc(db, 'shopItems', id), updateData);

            // Refresh local state
            setItem(prev => ({ ...prev, ...updateData }));

            // Exit edit mode if we were editing an active item
            if (isEditing) setIsEditing(false);

            if (publish) navigate('/profile/me'); // Redirect to profile on publish

        } catch (err) {
            console.error("Error updating item:", err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    if (error) return <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{error}</div>;
    if (!item) return null;

    const isOwner = currentUser?.uid === item.userId;
    const isDraft = !item.available;

    // 🔒 ACCESS CONTROL: Prevent others from viewing drafts
    if (isDraft && !isOwner) {
        return (
            <div style={{
                height: '100vh',
                background: '#000',
                color: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{ fontSize: '3rem' }}>🔒</div>
                <h2>Not Available</h2>
                <p style={{ color: '#888' }}>This shop item hasn't been published yet.</p>
                <button
                    onClick={() => navigate('/shop')}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginTop: '1rem'
                    }}
                >
                    Back to Shop
                </button>
            </div>
        );
    }

    // Show editor if it's a draft OR if the owner explicitly requested to edit
    const showEditor = (isOwner && isDraft) || (isOwner && isEditing);

    // -------------------------------------------------------------------------
    // RENDER: EDITOR MODE
    // -------------------------------------------------------------------------
    if (showEditor) {
        const potentialSizes = getPotentialSizes();

        // Calculate preview aspect ratio
        let previewRatio = item.aspectRatio || 1.5;
        let previewLabel = "Original Image";

        if (previewSizeId) {
            const sizeDef = PRINT_SIZES.find(s => s.id === previewSizeId);
            if (sizeDef) {
                const isPortrait = (item.width && item.height && item.height > item.width) || (item.aspectRatio && item.aspectRatio < 1);
                previewRatio = isPortrait ? (1 / sizeDef.ratio) : sizeDef.ratio;
                previewLabel = `Preview: ${sizeDef.label} Crop`;
            }
        }

        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '2rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <button
                        onClick={() => isEditing ? setIsEditing(false) : navigate(-1)}
                        style={{ background: 'transparent', border: 'none', color: '#888', marginBottom: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaArrowLeft /> {isEditing ? 'Cancel Edit' : 'Back'}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{isEditing ? 'Edit Shop Item' : 'Configure Shop Item'}</h1>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                style={{ padding: '0.8rem 1.5rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save Draft')}
                            </button>

                            {/* Only show Publish button if it's a draft */}
                            {isDraft && (
                                <button
                                    onClick={() => handleSave(true)}
                                    disabled={saving}
                                    style={{ padding: '0.8rem 1.5rem', background: '#7FFFD4', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    {saving ? 'Publishing...' : 'Publish to Shop'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        {/* Left Col: Image Preview */}
                        <div>
                            <div style={{
                                position: 'relative', // For overlay
                                background: '#111',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '1px solid #222',
                                marginBottom: '1rem',
                                // ALWAYS show original aspect ratio container
                                aspectRatio: `${item.aspectRatio || 1.5}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    loading="lazy"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain', // Ensure full image is visible
                                        display: 'block'
                                    }}
                                />

                                {/* 1. LIVE MARGIN GUIDES (Mask) */}
                                {(() => {
                                    const originalRatio = item.aspectRatio || 1.5;
                                    // Determine crop dimensions as percentage of container
                                    let widthPercent = 100;
                                    let heightPercent = 100;

                                    if (previewRatio > originalRatio) {
                                        // Target is wider/shorter than original -> Limit Height
                                        heightPercent = (originalRatio / previewRatio) * 100;
                                    } else {
                                        // Target is taller/narrower than original -> Limit Width
                                        widthPercent = (previewRatio / originalRatio) * 100;
                                    }

                                    return (
                                        <>
                                            {/* The "Safe Zone" Box */}
                                            <div style={{
                                                position: 'absolute',
                                                width: `${widthPercent}%`,
                                                height: `${heightPercent}%`,
                                                border: '2px dashed #7FFFD4',
                                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)', // Darken everything OUTSIDE this box
                                                pointerEvents: 'none',
                                                zIndex: 10
                                            }} />

                                            {/* Label */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '10px',
                                                right: '10px',
                                                background: '#7FFFD4',
                                                color: '#000',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                zIndex: 11
                                            }}>
                                                PRINT AREA
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            <div style={{ color: '#7FFFD4', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                {previewLabel}
                            </div>
                            <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                Original Ratio: {(item.aspectRatio || 1.5).toFixed(2)} → Print Ratio: {previewRatio.toFixed(2)}
                            </div>
                        </div>

                        {/* Right Col: Configuration */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* Description */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#ccc' }}>Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Describe this print..."
                                    style={{ width: '100%', padding: '1rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', minHeight: '100px', resize: 'vertical' }}
                                />
                            </div>

                            {/* Tier Selection */}
                            <div style={{ padding: '1rem', background: '#111', border: '1px solid #333', borderRadius: '8px' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', color: '#ccc' }}>Print Quality Tier</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setProductTier(PRINT_TIERS.ECONOMY)}
                                        style={{
                                            flex: 1,
                                            padding: '0.8rem',
                                            background: productTier === PRINT_TIERS.ECONOMY ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                            color: productTier === PRINT_TIERS.ECONOMY ? '#7FFFD4' : '#888',
                                            border: productTier === PRINT_TIERS.ECONOMY ? '1px solid #7FFFD4' : '1px solid #333',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span>🪙</span> Economy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProductTier(PRINT_TIERS.PREMIUM)}
                                        style={{
                                            flex: 1,
                                            padding: '0.8rem',
                                            background: productTier === PRINT_TIERS.PREMIUM ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                            color: productTier === PRINT_TIERS.PREMIUM ? '#7FFFD4' : '#888',
                                            border: productTier === PRINT_TIERS.PREMIUM ? '1px solid #7FFFD4' : '1px solid #333',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span>💎</span> Premium
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.8rem', lineHeight: '1.4' }}>
                                    {productTier === PRINT_TIERS.ECONOMY
                                        ? "Affordable, lightweight, great for casual buyers. Lower base cost, fast delivery."
                                        : "Museum-grade quality, archival materials, deep color range. Best for collectors."}
                                </p>
                            </div>

                            {/* Sticker Toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', background: '#111', borderRadius: '8px', border: '1px solid #333' }}>
                                <input
                                    type="checkbox"
                                    checked={includeStickers}
                                    onChange={(e) => setIncludeStickers(e.target.checked)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Include Stickers?</div>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Automatically add 3x3" and 4x4" stickers if profitable.</div>
                                </div>
                            </div>

                            {/* Size & Pricing */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ fontWeight: 'bold', color: '#ccc' }}>Available Sizes & Pricing</label>

                                    {/* 5. Batch Switcher Toggle */}
                                    <button
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        style={{ fontSize: '0.8rem', color: '#7FFFD4', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                                    </button>
                                </div>

                                {showAdvanced && (
                                    <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#222', borderRadius: '4px', display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={() => {
                                                const newEnabled = {};
                                                potentialSizes.forEach(s => newEnabled[s.id] = true);
                                                setEnabledSizes(newEnabled);
                                            }}
                                            style={{ fontSize: '0.8rem', color: '#fff', background: '#333', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={() => setEnabledSizes({})}
                                            style={{ fontSize: '0.8rem', color: '#fff', background: '#333', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                )}

                                <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                                    Select sizes to offer. Click to preview cropping.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {potentialSizes.map(size => {
                                        const isEnabled = enabledSizes[size.id] || false;
                                        const pricing = calculateTieredPricing(size.id, productTier);
                                        const isPreviewing = previewSizeId === size.id;

                                        return (
                                            <div
                                                key={size.id}
                                                onClick={() => setPreviewSizeId(size.id)}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    background: isPreviewing ? '#1a1a1a' : '#111',
                                                    padding: '1rem',
                                                    borderRadius: '8px',
                                                    border: isEnabled ? '1px solid #7FFFD4' : (isPreviewing ? '1px solid #555' : '1px solid #333'),
                                                    opacity: isEnabled ? 1 : 0.8,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: isEnabled ? '0.8rem' : '0' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isEnabled}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            setEnabledSizes(prev => ({ ...prev, [size.id]: e.target.checked }));
                                                            setPreviewSizeId(size.id); // Also preview when toggling
                                                        }}
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                    />
                                                    <div style={{ width: '80px', fontWeight: 'bold' }}>{size.label}</div>

                                                    {!isEnabled && <span style={{ fontSize: '0.8rem', color: '#666' }}>Click to enable</span>}
                                                </div>

                                                {isEnabled && pricing && (
                                                    <div style={{
                                                        background: 'rgba(0,0,0,0.3)',
                                                        padding: '0.8rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85rem',
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: '#ccc' }}>Buyer Price:</span>
                                                            <span style={{ fontWeight: 'bold', color: '#fff' }}>${pricing.finalPrice.toFixed(2)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: '#888' }}>Base Cost:</span>
                                                            <span style={{ color: '#888' }}>${pricing.baseCost.toFixed(2)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '0.3rem', marginTop: '0.3rem', gridColumn: '1 / -1' }}>
                                                            <span style={{ color: '#aaa' }}>Total Profit:</span>
                                                            <span style={{ color: '#fff' }}>${(pricing.finalPrice - pricing.baseCost).toFixed(2)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: '#7FFFD4' }}>Creator ({(pricing.artistShare * 100).toFixed(0)}%):</span>
                                                            <span style={{ color: '#7FFFD4', fontWeight: 'bold' }}>${pricing.artistProfit.toFixed(2)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: '#aaa' }}>Platform:</span>
                                                            <span style={{ color: '#aaa' }}>{(100 - pricing.artistShare * 100).toFixed(0)}%</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: VIEW MODE (Public / Active)
    // -------------------------------------------------------------------------
    const currentSizeConfig = (item.printSizes || []).find(s => s.id === selectedSize);

    // Price Fallback Logic: If saved price is 0 or missing, look up default from PRINT_SIZES
    let currentPrice = currentSizeConfig ? Number(currentSizeConfig.price || 0) : 0;
    if (currentPrice === 0 && selectedSize) {
        const defaultSize = PRINT_SIZES.find(s => s.id === selectedSize);
        if (defaultSize) currentPrice = defaultSize.price;
    }

    const hasSizes = item.printSizes && item.printSizes.length > 0;

    // Crop / Aspect Ratio Logic
    const sizeDef = PRINT_SIZES.find(s => s.id === selectedSize);
    // Default to image's own ratio if no size selected, or 1.5 if unknown
    let targetRatio = item.aspectRatio || 1.5;

    if (sizeDef) {
        // If image is portrait, invert the print ratio (e.g. 1.5 becomes 0.666)
        // We check dimensions if available, otherwise assume landscape ratio from PRINT_SIZES unless aspect ratio < 1
        const isPortrait = (item.width && item.height && item.height > item.width) || (item.aspectRatio && item.aspectRatio < 1);
        targetRatio = isPortrait ? (1 / sizeDef.ratio) : sizeDef.ratio;
    }

    // Warning for heavy cropping
    let showCropWarning = false;
    if (item.aspectRatio && sizeDef) {
        const ratioDiff = Math.abs(item.aspectRatio - targetRatio);
        if (ratioDiff > 0.15) {
            showCropWarning = true;
        }
    }

    // Helper to get dimensions from ID (e.g., '12x18' -> {w: 12, h: 18})
    const getPrintDimensions = (sizeId) => {
        if (!sizeId) return { w: 24, h: 36 }; // Default to a large size for visual impact
        const parts = sizeId.split('x').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { w: parts[0], h: parts[1] };
        }
        return { w: 24, h: 36 };
    };

    // Calculate dynamic style based on selected size
    const currentDims = getPrintDimensions(selectedSize);

    const mockups = [
        { id: 0, type: 'original', label: 'Original' },
        {
            id: 1,
            type: 'mockup',
            label: 'In Context 1',
            bg: '/assets/andrew-neel-DLD5LvnFblU-unsplash.jpg',
            wallWidthInches: 180, // Approx 15ft visible width (Back-calculated from 7ft ladder reference)
            baseTop: '25%', // Raised as requested
            baseLeft: '50%'
        },
        {
            id: 2,
            type: 'mockup',
            label: 'In Context 2',
            bg: '/assets/andrej-lisakov-3A4XZUopCJA-unsplash.jpg',
            wallWidthInches: 80, // Adjusted to 80 inches (approx 6.5ft) to accurately scale up art relative to the lamp
            baseTop: '35%',
            baseLeft: '50%'
        }
    ];

    // Helper to generate style for active slide
    const getMockupStyle = (slideId) => {
        const config = mockups.find(m => m.id === slideId);
        if (!config || config.type !== 'mockup') return {};

        const isLandscape = (item.width && item.height && item.width > item.height) || (item.aspectRatio && item.aspectRatio > 1);

        // If image is landscape, the larger dimension is the width.
        // If portrait, the smaller dimension is the width.
        const printWidth = isLandscape ? Math.max(currentDims.w, currentDims.h) : Math.min(currentDims.w, currentDims.h);

        const widthPercent = (printWidth / config.wallWidthInches) * 100;

        // Safety clamp: Lowered min to 1% to allow small sizes (4x6) to scale linearly without being artificially inflated
        const safeWidth = Math.max(1, Math.min(90, widthPercent));

        return {
            top: config.baseTop,
            left: config.baseLeft,
            width: `${safeWidth}%`,
            transform: 'translate(-50%, -20%)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        };
    };

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <FaArrowLeft /> Back
                </button>

                {isOwner && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {item.isLimitedEdition && isFeatureEnabled('SPACECARDS_TRADING') && (
                            <button
                                onClick={() => alert("Resale feature coming soon!")} // Placeholder for Resale Modal
                                style={{
                                    background: 'rgba(255, 215, 0, 0.1)',
                                    color: '#FFD700',
                                    border: '1px solid rgba(255, 215, 0, 0.3)',
                                    padding: '0.8rem 1.2rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                <FaTag /> Resell Item
                            </button>
                        )}
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                background: '#333',
                                color: '#fff',
                                border: 'none',
                                padding: '0.8rem 1.2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: 'bold'
                            }}
                        >
                            <FaEdit /> Edit Item
                        </button>
                    </div>
                )}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '3rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Image Carousel Col */}
                <div>
                    <div style={{
                        background: '#111',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #222',
                        // Use mockup ratio (usually landscape) or targetRatio for original
                        aspectRatio: activeSlide === 0 ? `${targetRatio}` : '1.5',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        marginBottom: '1rem'
                    }}>
                        {activeSlide === 0 ? (
                            // Slide 0: Original Art
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center'
                                }}
                            />
                        ) : (
                            // Mockup Slides
                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                {/* Background Room */}
                                <img
                                    src={mockups[activeSlide].bg}
                                    alt="Room Mockup"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {/* Overlay Art */}
                                <div style={{
                                    position: 'absolute',
                                    ...getMockupStyle(activeSlide)
                                }}>
                                    <div style={{
                                        // Maintain the ART's aspect ratio within the placement box
                                        aspectRatio: `${item.aspectRatio || 1.5}`,
                                        width: '100%',
                                        background: '#000',
                                        // Optional: Add matting or frame here
                                        border: '1px solid rgba(255,255,255,0.8)'
                                    }}>
                                        <img
                                            src={item.imageUrl}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Slide Navigation Arrows (Optional, let's stick to thumbnails below for now) */}
                    </div>

                    {/* Thumbnails */}
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {mockups.map((slide) => (
                            <button
                                key={slide.id}
                                onClick={() => setActiveSlide(slide.id)}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '8px',
                                    border: activeSlide === slide.id ? '2px solid #7FFFD4' : '2px solid transparent',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    padding: 0,
                                    background: '#222'
                                }}
                            >
                                {slide.type === 'original' ? (
                                    <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <img src={slide.bg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>


                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{item.title}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#888' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaTag /> Fine Art Print
                        </div>
                        {item.productTier === PRINT_TIERS.PREMIUM && (
                            <div style={{
                                background: 'rgba(127, 255, 212, 0.1)',
                                color: '#7FFFD4',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                border: '1px solid rgba(127, 255, 212, 0.3)'
                            }}>
                                PREMIUM QUALITY
                            </div>
                        )}
                        {item.isLimitedEdition && (
                            <div style={{
                                background: 'rgba(255, 215, 0, 0.1)',
                                color: '#FFD700',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                border: '1px solid rgba(255, 215, 0, 0.3)'
                            }}>
                                LIMITED EDITION {item.editionSize ? `(1 of ${item.editionSize})` : ''}
                            </div>
                        )}
                    </div>

                    {item.isLimitedEdition && item.soldCount >= item.editionSize && (
                        <div style={{
                            background: 'rgba(255, 0, 0, 0.1)',
                            color: '#FF4444',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            border: '1px solid rgba(255, 0, 0, 0.3)'
                        }}>
                            SOLD OUT
                        </div>
                    )}

                    <div style={{ height: '1px', background: '#222', width: '100%' }} />

                    {item.description && (
                        <p style={{ color: '#ccc', lineHeight: '1.6' }}>{item.description}</p>
                    )}

                    <div>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#7FFFD4' }}>Select Size</h3>
                        {!hasSizes ? (
                            <div style={{ color: '#888', fontStyle: 'italic' }}>No print sizes configured for this item.</div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {item.printSizes.map(size => {
                                    // Price display in button: use fallback if needed
                                    let btnPrice = Number(size.price || 0);
                                    if (btnPrice === 0) {
                                        const def = PRINT_SIZES.find(s => s.id === size.id);
                                        if (def) btnPrice = def.price;
                                    }

                                    return (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedSize(size.id)}
                                            style={{
                                                padding: '1rem 1.5rem',
                                                background: selectedSize === size.id ? '#7FFFD4' : 'transparent',
                                                color: selectedSize === size.id ? '#000' : '#fff',
                                                border: `1px solid ${selectedSize === size.id ? '#7FFFD4' : '#333'}`,
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                minWidth: '100px'
                                            }}
                                        >
                                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{size.label}</span>
                                            <span style={{ fontSize: '0.9rem', opacity: selectedSize === size.id ? 1 : 0.7 }}>
                                                ${btnPrice.toFixed(2)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                            ${currentPrice.toFixed(2)}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Includes secure shipping & handling
                        </div>
                        {showCropWarning && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.8rem',
                                background: 'rgba(255, 165, 0, 0.15)',
                                border: '1px solid rgba(255, 165, 0, 0.4)',
                                borderRadius: '8px',
                                color: '#ffcc00',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'start',
                                gap: '0.5rem'
                            }}>
                                <FaInfoCircle style={{ marginTop: '3px', flexShrink: 0 }} />
                                <span>
                                    <strong>Heads up:</strong> This print size has a different aspect ratio than your image. Some cropping will occur.
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        <CheckoutButton
                            post={item}
                            selectedSize={selectedSize}
                            buttonStyle={{
                                width: '100%',
                                padding: '1.2rem',
                                background: '#7FFFD4',
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        />


                    </div>

                    {/* Preview on Wall Modal (Placeholder) */}


                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(127, 255, 212, 0.05)',
                        border: '1px solid rgba(127, 255, 212, 0.2)',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        color: '#888'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#7FFFD4' }}>
                            <FaInfoCircle /> Quality Guarantee
                        </div>
                        {item.productTier === PRINT_TIERS.PREMIUM
                            ? "Museum-grade quality, archival materials, deep color range. Best for collectors."
                            : "Affordable, lightweight, great for casual buyers. Lower base cost, fast delivery."}
                    </div>
                </div>
            </div>

            {/* 4.1 Verification Blocker Modal */}
            {showVerificationBlocker && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        background: '#1a1a1a',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid #333',
                        maxWidth: '400px',
                        textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
                        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Set Up Your Shop</h2>
                        <p style={{ color: '#ccc', marginBottom: '2rem', lineHeight: '1.5' }}>
                            You can create drafts, but you need to verify your details and set up your shop before you can publish items for sale.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <button
                                onClick={() => navigate('/shop/setup')}
                                style={{
                                    padding: '0.8rem',
                                    background: '#7FFFD4',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                Set Up Shop <FaArrowLeft style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <button
                                onClick={() => setShowVerificationBlocker(false)}
                                style={{
                                    padding: '0.8rem',
                                    background: 'transparent',
                                    color: '#888',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Keep in Drafts
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ShopItemDetail;
