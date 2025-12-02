import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCreatePost } from '../hooks/useCreatePost';
import { FaImage, FaTimes, FaPlus, FaDollarSign, FaTag, FaCamera, FaStore, FaInfoCircle } from 'react-icons/fa';
import { PRINT_SIZES, calculateEarnings, PRINT_TIERS } from '../utils/printfulApi';

import ManualExifForm from '../components/ManualExifForm';
import { formatPrice } from '../utils/helpers';

const CATEGORY_TAGS = [
    'Landscape', 'Portrait', 'Wildlife', 'Street', 'Macro',
    'Nature', 'Urban', 'Film', 'Black & White', 'Minimalism',
    'Architecture', 'Long Exposure'
];

const CreatePost = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { createPost, loading, error, progress } = useCreatePost();
    const fileInputRef = useRef(null);
    const submittingRef = useRef(false);

    // Global Post State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [location, setLocation] = useState({ city: '', state: '', country: '' });

    // Slides State
    const [slides, setSlides] = useState([]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    // Manual EXIF state
    const [showManualExif, setShowManualExif] = useState({});

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newSlides = files.map(file => ({
            type: 'image',
            file,
            preview: URL.createObjectURL(file),
            caption: '',
            addToShop: false,
            productTier: PRINT_TIERS.ECONOMY,
            includeStickers: false,
            // Print sizes removed - will be configured in Shop management UI
            exif: null, // Will be populated during upload
            manualExif: null // For user-entered EXIF
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

        // Remove manual EXIF form if open
        const newShowManualExif = { ...showManualExif };
        delete newShowManualExif[index];
        setShowManualExif(newShowManualExif);

        // Adjust active index
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

    // Handle manual EXIF save
    const handleManualExifSave = (index, exifData) => {
        updateSlide(index, { manualExif: exifData });
        setShowManualExif(prev => ({ ...prev, [index]: false }));
    };

    // Handle tag input
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim().replace(/^#/, '');
            if (tag && !tags.includes(tag) && tags.length < 20) {
                setTags([...tags, tag]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Handle form submission
    const handleSubmit = async () => {
        // Prevent double-submission
        if (submittingRef.current || loading) return;
        submittingRef.current = true;

        // Title is optional now
        // if (!title.trim()) return alert("Title is required");
        if (slides.length === 0) {
            submittingRef.current = false;
            return alert("Add at least one image");
        }

        try {
            await createPost({
                title,
                // description removed per request
                tags,
                location
            }, slides);

            // Force navigation to feed
            navigate('/');
        } catch (err) {
            console.error('Error creating post:', err);
            alert(`Error creating post: ${err.message}`);
            submittingRef.current = false;
        }
    };

    const activeSlide = slides[activeSlideIndex];
    const hasExif = activeSlide?.exif || activeSlide?.manualExif;


    return (
        <div className="create-post-container">
            {/* Header */}
            <div className="create-post-header">
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
            </div>

            {/* Progress Bar */}
            {loading && (
                <div style={{ width: '100%', height: '4px', background: '#333' }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'var(--ice-mint)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            )}

            <div className="create-post-layout">
                {/* LEFT COLUMN: Image Preview List */}
                <div className="preview-column">
                    {/* LEFT COLUMN: Vertical Full-Size Gallery */}
                    {slides.length === 0 ? (
                        <div className="empty-state" onClick={() => fileInputRef.current?.click()}>
                            <FaImage size={48} />
                            <p>Click to select images</p>
                            <span>Up to 10 images</span>
                        </div>
                    ) : (
                        <>
                            <p className="field-hint" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
                                {slides.length > 1 ? 'Scroll to view all images' : 'Tap image to add more'}
                            </p>

                            <div className="full-gallery-list">
                                {slides.map((slide, idx) => (
                                    <div
                                        key={idx}
                                        className={`gallery-item ${idx === activeSlideIndex ? 'active' : ''}`}
                                        onClick={() => setActiveSlideIndex(idx)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`View image ${idx + 1}`}
                                    >
                                        <img
                                            src={slide.preview}
                                            alt={`Slide ${idx + 1}`}
                                            loading="lazy"
                                        />

                                        {/* Overlays */}
                                        <div className="gallery-item-overlay">
                                            {/* Top Right: Remove */}
                                            <button
                                                className="slide-remove-btn"
                                                onClick={(e) => removeSlide(idx, e)}
                                                title="Remove image"
                                            >
                                                <FaTimes />
                                            </button>

                                            {/* Bottom Bar: Shop & EXIF */}
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
                                                    <span className="exif-badge" title="EXIF Data Available">
                                                        <FaCamera />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add More Button at bottom of list */}
                                <button
                                    className="add-more-row-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <FaPlus /> Add Another Photo
                                </button>
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

                {/* RIGHT COLUMN: Form Panel */}
                <div className="form-column">
                    {/* Global Post Settings */}
                    <div className="form-section">
                        <h3>Post Details</h3>

                        <div className="form-field">
                            <label>Title</label>
                            <input
                                type="text"
                                placeholder="Give your post a title (optional)..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        {/* Shop Toggle - MOVED HERE (ABOVE TAGS) */}
                        {activeSlide && (
                            <div className="shop-toggle-section" style={{ marginTop: '0', marginBottom: '1.5rem' }}>
                                <label className="shop-toggle-main">
                                    <input
                                        type="checkbox"
                                        checked={activeSlide.addToShop}
                                        onChange={(e) => updateSlide(activeSlideIndex, { addToShop: e.target.checked })}
                                    />
                                    <span><FaStore /> Sell this image as print</span>
                                </label>
                            </div>
                        )}

                        <div className="form-field">
                            <label><FaTag /> Categories & Tags</label>

                            <div className="category-selector">
                                <p className="field-hint">Select categories that describe your work:</p>
                                <div className="category-chips">
                                    {CATEGORY_TAGS.map(category => (
                                        <button
                                            key={category}
                                            type="button"
                                            className={`category-chip ${tags.includes(category) ? 'active' : ''}`}
                                            onClick={() => {
                                                if (tags.includes(category)) {
                                                    setTags(tags.filter(t => t !== category));
                                                } else {
                                                    if (tags.length < 10 && !tags.includes(category)) {
                                                        setTags([...tags, category]);
                                                    }
                                                }
                                            }}
                                            aria-pressed={tags.includes(category)}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="tags-input-container">
                                <p className="field-hint">Add custom tags (press Enter):</p>
                                <div className="tags-list">
                                    {tags.filter(t => !CATEGORY_TAGS.includes(t)).map(tag => (
                                        <span key={tag} className="tag">
                                            #{tag}
                                            <button onClick={() => removeTag(tag)}><FaTimes /></button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. nikon, 35mm, sunset..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Location</label>
                            <div className="location-grid">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={location.city}
                                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                                    className="form-input"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={location.state}
                                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                                    className="form-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={location.country}
                                    onChange={(e) => setLocation({ ...location, country: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Per-Image Settings (when image selected) */}
                    {activeSlide && (
                        <>
                            <div className="form-section">
                                <h3>Image #{activeSlideIndex + 1} Settings</h3>

                                <div className="form-field">
                                    <label>Image Caption</label>
                                    <input
                                        type="text"
                                        placeholder="Caption for this image..."
                                        value={activeSlide.caption}
                                        onChange={(e) => updateSlide(activeSlideIndex, { caption: e.target.value })}
                                        className="form-input"
                                    />
                                </div>

                                {/* EXIF Section */}
                                <div className="exif-section">
                                    <div className="exif-header">
                                        <span><FaCamera /> Camera Data (EXIF)</span>
                                        {!hasExif && (
                                            <button
                                                type="button"
                                                onClick={() => setShowManualExif(prev => ({ ...prev, [activeSlideIndex]: true }))}
                                                className="btn-add-exif"
                                            >
                                                <FaPlus /> Add Manually
                                            </button>
                                        )}
                                        {hasExif && (
                                            <button
                                                type="button"
                                                onClick={() => setShowManualExif(prev => ({ ...prev, [activeSlideIndex]: true }))}
                                                className="btn-edit-exif"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    {hasExif && !showManualExif[activeSlideIndex] && (
                                        <div className="exif-display">
                                            {(activeSlide.exif?.make || activeSlide.manualExif?.make) && (
                                                <div>Camera: {activeSlide.exif?.make || activeSlide.manualExif?.make} {activeSlide.exif?.model || activeSlide.manualExif?.model}</div>
                                            )}
                                        </div>
                                    )}

                                    {showManualExif[activeSlideIndex] && (
                                        <ManualExifForm
                                            existingExif={activeSlide.manualExif || activeSlide.exif}
                                            onSave={(exifData) => handleManualExifSave(activeSlideIndex, exifData)}
                                            onCancel={() => setShowManualExif(prev => ({ ...prev, [activeSlideIndex]: false }))}
                                        />
                                    )}
                                </div>

                                {activeSlide.addToShop && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#111', border: '1px solid #333', borderRadius: '8px' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: '#7FFFD4', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Shop Configuration</h4>

                                        {/* Tier Selection */}
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>Print Quality Tier</label>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => updateSlide(activeSlideIndex, { productTier: PRINT_TIERS.ECONOMY })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.8rem',
                                                        background: activeSlide.productTier === PRINT_TIERS.ECONOMY ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                                        color: activeSlide.productTier === PRINT_TIERS.ECONOMY ? '#7FFFD4' : '#888',
                                                        border: activeSlide.productTier === PRINT_TIERS.ECONOMY ? '1px solid #7FFFD4' : '1px solid #333',
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
                                                    onClick={() => updateSlide(activeSlideIndex, { productTier: PRINT_TIERS.PREMIUM })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.8rem',
                                                        background: activeSlide.productTier === PRINT_TIERS.PREMIUM ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                                        color: activeSlide.productTier === PRINT_TIERS.PREMIUM ? '#7FFFD4' : '#888',
                                                        border: activeSlide.productTier === PRINT_TIERS.PREMIUM ? '1px solid #7FFFD4' : '1px solid #333',
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
                                                {activeSlide.productTier === PRINT_TIERS.ECONOMY
                                                    ? "Affordable, lightweight, great for casual buyers. Lower base cost, fast delivery."
                                                    : "Museum-grade quality, archival materials, deep color range. Best for collectors."}
                                            </p>
                                        </div>

                                        {/* Sticker Toggle */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                                            <input
                                                type="checkbox"
                                                checked={activeSlide.includeStickers || false}
                                                onChange={(e) => updateSlide(activeSlideIndex, { includeStickers: e.target.checked })}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Include Stickers?</div>
                                                <div style={{ fontSize: '0.75rem', color: '#666' }}>Add 3x3" and 4x4" stickers if profitable.</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="error-message">
                            <FaInfoCircle /> {error}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                /* Global Box Sizing for this component */
                .create-post-container * {
                    box-sizing: border-box;
                }

                .create-post-container {
                    min-height: 100dvh;
                    background: var(--black);
                    color: #fff;
                    padding-bottom: 80px;
                    display: flex;
                    flex-direction: column;
                    overflow-x: hidden; /* Prevent horizontal scroll on body */
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
                    height: 70px; /* Fixed height for header */
                }

                .create-post-header h2 {
                    font-size: 1.2rem;
                    letter-spacing: 1px;
                    font-weight: 600;
                    margin: 0;
                }

                .header-btn,
                .header-btn-primary {
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    border: none;
                    white-space: nowrap;
                }

                .header-btn {
                    background: transparent;
                    color: var(--slate);
                }

                .header-btn:hover {
                    color: #fff;
                }

                .header-btn-primary {
                    background: var(--ice-mint);
                    color: var(--black);
                }

                .header-btn-primary:hover:not(:disabled) {
                    box-shadow: 0 0 20px rgba(127, 255, 212, 0.3);
                }

                .header-btn-primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .create-post-layout {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                    width: 100%;
                }

                .preview-column {
                    position: sticky;
                    top: 90px; /* Below header */
                    height: calc(100dvh - 110px);
                    overflow-y: auto;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .main-preview-box {
                    width: 100%;
                    aspect-ratio: 1; /* Square main preview */
                    background: var(--graphite);
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    flex-shrink: 0;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                }

                .main-preview-box:hover {
                    border-color: var(--ice-mint);
                }

                .main-preview-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s;
                    font-size: 2rem;
                    color: #fff;
                }

                .main-preview-box:hover .main-preview-overlay {
                    opacity: 1;
                }

                .main-preview-box img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .preview-list {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }

                .slide-preview {
                    aspect-ratio: 1;
                    background: var(--graphite);
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    position: relative;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                    width: 100%;
                }

                .slide-preview.active {
                    border-color: var(--ice-mint);
                    box-shadow: 0 0 20px rgba(127, 255, 212, 0.2);
                }

                .slide-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .slide-preview-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 0.8rem;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .shop-toggle-small {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.8rem;
                    color: #fff;
                    cursor: pointer;
                }

                .shop-toggle-small input {
                    cursor: pointer;
                }

                .exif-badge {
                    background: var(--ice-mint);
                    color: var(--black);
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    display: flex;
                    align-items: center;
                }

                .slide-remove-btn {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    background: rgba(0, 0, 0, 0.7);
                    border: none;
                    color: #fff;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .slide-preview:hover .slide-remove-btn {
                    opacity: 1;
                }

                .add-more-btn {
                    aspect-ratio: 1;
                    background: rgba(127, 255, 212, 0.1);
                    border: 2px dashed var(--ice-mint);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    color: var(--ice-mint);
                    transition: all 0.2s;
                    width: 100%;
                }

                .add-more-btn:hover {
                    background: rgba(127, 255, 212, 0.2);
                }

                .empty-state {
                    grid-column: 1 / -1;
                    padding: 3rem;
                    text-align: center;
                    color: var(--slate);
                    cursor: pointer;
                    border: 2px dashed rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                }

                .empty-state:hover {
                    border-color: var(--ice-mint);
                    color: var(--ice-mint);
                }

                .form-column {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    min-width: 0;
                }

                .form-section {
                    background: var(--graphite);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.5rem;
                }

                .form-section h3 {
                    margin-bottom: 1.5rem;
                    color: var(--ice-mint);
                    font-size: 1.1rem;
                    margin-top: 0;
                }

                .form-field {
                    margin-bottom: 1.5rem;
                }

                .form-field label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--slate);
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .form-input,
                .form-textarea {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 0.75rem;
                    color: #fff;
                    font-size: 0.95rem;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }

                .form-input:focus,
                .form-textarea:focus {
                    outline: none;
                    border-color: var(--ice-mint);
                }

                .tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                }

                .tag {
                    background: rgba(127, 255, 212, 0.2);
                    color: var(--ice-mint);
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .tag button {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    padding: 0;
                }

                .location-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.75rem;
                }

                .exif-section {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .exif-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .btn-add-exif,
                .btn-edit-exif {
                    background: rgba(127, 255, 212, 0.1);
                    border: 1px solid var(--ice-mint);
                    color: var(--ice-mint);
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    transition: all 0.2s;
                }

                .btn-add-exif:hover,
                .btn-edit-exif:hover {
                    background: rgba(127, 255, 212, 0.2);
                }

                .exif-display {
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    color: var(--slate);
                }

                .shop-toggle-section {
                    margin: 1.5rem 0;
                }

                .shop-toggle-main {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    padding: 1rem;
                    background: rgba(127, 255, 212, 0.05);
                    border: 1px solid rgba(127, 255, 212, 0.2);
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .shop-toggle-main:hover {
                    background: rgba(127, 255, 212, 0.1);
                }

                .shop-toggle-main input {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }

                .category-selector {
                    margin-bottom: 1rem;
                }

                .field-hint {
                    color: var(--slate);
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                }

                .category-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .category-chip {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }

                .category-chip:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .category-chip.active {
                    background: var(--ice-mint);
                    color: var(--black);
                    border-color: var(--ice-mint);
                    font-weight: 600;
                }

                .tags-input-container {
                    margin-top: 1rem;
                }

                .tags-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }

                .error-message {
                    background: rgba(255, 77, 77, 0.1);
                    border: 1px solid rgba(255, 77, 77, 0.3);
                    color: #ff6b6b;
                    padding: 1rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                /* RESPONSIVE BREAKPOINTS */
                @media (max-width: 900px) {
                    .create-post-layout {
                        display: grid;
                        grid-template-columns: 45% 55%;
                        gap: 1rem;
                        padding: 0.5rem;
                        height: calc(100dvh - 60px);
                        overflow: hidden;
                    }

                    .preview-column {
                        height: 100%;
                        overflow-y: auto;
                        padding: 0.5rem;
                        border-right: none;
                        border-bottom: none;
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .form-column {
                        height: 100%;
                        overflow-y: auto;
                        padding: 0.5rem;
                        padding-bottom: 4rem;
                    }

                    .form-section {
                        padding: 1rem;
                    }

                    .create-post-header {
                        padding: 0.5rem 1rem;
                        height: 60px;
                    }

                    .create-post-header h2 {
                        font-size: 1rem;
                    }

                    .header-btn, .header-btn-primary {
                        padding: 0.4rem 0.8rem;
                        font-size: 0.8rem;
                    }
                }

                @media (max-width: 600px) {
                    .location-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* Custom Scrollbars */
                .preview-column::-webkit-scrollbar,
                .form-column::-webkit-scrollbar {
                    width: 6px;
                }
                .preview-column::-webkit-scrollbar-track,
                .form-column::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }
                .preview-column::-webkit-scrollbar-thumb,
                .form-column::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                }

                /* NEW LEFT COLUMN STYLES */
                .full-gallery-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    padding-bottom: 2rem;
                }

                .gallery-item {
                    width: 100%;
                    aspect-ratio: 1;
                    background: var(--graphite);
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .gallery-item.active {
                    border-color: var(--ice-mint);
                    box-shadow: 0 0 20px rgba(127, 255, 212, 0.15);
                }

                .gallery-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    display: block;
                }

                .gallery-item-overlay {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .gallery-item-overlay button,
                .gallery-item-overlay input,
                .gallery-item-overlay label {
                    pointer-events: auto;
                }

                .slide-remove-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.6);
                    border: none;
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                    z-index: 10;
                }

                .slide-remove-btn:hover {
                    background: rgba(255, 77, 77, 0.8);
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

                .add-more-row-btn {
                    width: 100%;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px dashed rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    color: var(--slate);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }

                .add-more-row-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    border-color: var(--ice-mint);
                }
            `}</style>
        </div>
    );
};

export default CreatePost;
