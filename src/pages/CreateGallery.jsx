import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createGallery } from '../services/galleryService';
import { FaImage, FaTags, FaMapMarkerAlt, FaLock, FaGlobe, FaArrowLeft } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getUserTier, USER_TIERS } from '../services/monetizationService';
import PaywallModal from '../components/monetization/PaywallModal';
import '../styles/create-gallery.css';
import StarBackground from '../components/StarBackground';

const POPULAR_TAGS = [
    'landscape', 'portrait', 'street', 'nature', 'urban', 'film',
    'digital', 'black-and-white', 'color', 'architecture', 'wildlife',
    'macro', 'night', 'sunset', 'travel', 'documentary'
];

const CreateStudio = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { showError, showSuccess, showWarning } = useToast();
    const [userProfile, setUserProfile] = useState(null);
    const [fetchingProfile, setFetchingProfile] = useState(true);
    const [userTier, setUserTier] = useState(null);
    const fileInputRef = useRef(null);

    // Fetch user profile and tier
    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) return;
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserProfile(userDoc.data());
                }
                const tier = await getUserTier(currentUser.uid);
                setUserTier(tier);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setFetchingProfile(false);
            }
        };
        fetchProfile();
    }, [currentUser]);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [contentType, setContentType] = useState('both');
    const [requiredTags, setRequiredTags] = useState([]);
    const [customTag, setCustomTag] = useState('');
    const [requiredLocations, setRequiredLocations] = useState([]);
    const [locationInput, setLocationInput] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [moderationEnabled, setModerationEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    if (fetchingProfile) {
        return <div className="loading-spinner">Loading profile...</div>;
    }

    // Check if user is Ultra-tier Space Creator
    if (userTier !== USER_TIERS.ULTRA && userTier !== USER_TIERS.PARTNER) {
        return (
            <>
                <PaywallModal
                    featureName="Studios"
                    onClose={() => navigate(-1)}
                />
            </>
        );
    }

    const handleCoverImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTagToggle = (tag) => {
        setRequiredTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleAddCustomTag = () => {
        if (customTag.trim() && !requiredTags.includes(customTag.trim())) {
            setRequiredTags(prev => [...prev, customTag.trim()]);
            setCustomTag('');
        }
    };

    const handleAddLocation = () => {
        if (locationInput.trim() && !requiredLocations.includes(locationInput.trim())) {
            setRequiredLocations(prev => [...prev, locationInput.trim()]);
            setLocationInput('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Starting studio creation...');

        if (!title.trim()) {
            showError('Please enter a studio title');
            return;
        }

        if (!currentUser || !userProfile) {
            console.error('Missing user data:', { currentUser, userProfile });
            showError('User data missing. Please try refreshing the page.');
            return;
        }

        setLoading(true);

        try {
            const studioData = {
                title: title.trim(),
                description: description.trim(),
                contentType,
                requiredTags,
                requiredLocations,
                isPublic,
                moderationEnabled
            };

            console.log('Sending studio data:', studioData);

            const studio = await createGallery(
                studioData,
                coverImage,
                currentUser.uid,
                userProfile
            );

            console.log('Studio created successfully:', studio);

            if (studio && studio.id) {
                console.log('Navigating to:', `/gallery/${studio.id}`);
                navigate(`/gallery/${studio.id}`);
            } else {
                console.error('Studio created but no ID returned:', studio);
                showWarning('Studio created but ID missing. Check console.');
            }
        } catch (error) {
            console.error('Error creating studio:', error);
            showError(`Failed to create studio: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="create-gallery-container" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Animated Stars Background */}
            {/* Animated Stars Background */}
            <StarBackground />

            <div className="create-gallery-header" style={{ position: 'relative', zIndex: 1 }}>
                <button onClick={() => navigate(-1)} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h1>Create Studio</h1>
                <p className="subtitle">Create a collaborative space for sharing content</p>
            </div>

            <form onSubmit={handleSubmit} className="create-gallery-form">
                {/* Cover Image */}
                <div className="form-section">
                    <h3><FaImage /> Cover Image</h3>
                    <div
                        className="cover-upload-area"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            backgroundImage: coverImagePreview ? `url(${coverImagePreview})` : 'none'
                        }}
                    >
                        {!coverImagePreview && (
                            <div className="upload-placeholder">
                                <FaImage size={48} />
                                <p>Click to upload cover image</p>
                                <span>Recommended: 1200x400px</span>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageSelect}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Basic Info */}
                <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="form-field">
                        <label>Studio Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                    <h3>Basic Information</h3>
                        <div className="form-field">
                            <label>Studio Title *</label>
                            maxLength={100}
                            required
                        />
                        </div>
                        <div className="form-field">
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what this studio is about..."
                                rows={4}
                                maxLength={500}
                            />
                        </div>
                    </div>

                    {/* Content Type */}
                    <div className="form-section">
                        <h3>Content Type</h3>
                        <p className="field-hint">What can members add to this studio?</p>
                        <div className="content-type-options">
                            <label className={`content-type-option ${contentType === 'posts' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    value="posts"
                                    checked={contentType === 'posts'}
                                    onChange={(e) => setContentType(e.target.value)}
                                />
                                <div>
                                    <strong>Posts Only</strong>
                                    <span>Individual photos and images</span>
                                </div>
                            </label>
                            <label className={`content-type-option ${contentType === 'collections' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    value="collections"
                                    checked={contentType === 'collections'}
                                    onChange={(e) => setContentType(e.target.value)}
                                />
                                <div>
                                    <strong>Collections Only</strong>
                                    <span>Curated collections of posts</span>
                                </div>
                            </label>
                            <label className={`content-type-option ${contentType === 'both' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    value="both"
                                    checked={contentType === 'both'}
                                    onChange={(e) => setContentType(e.target.value)}
                                />
                                <div>
                                    <strong>Both</strong>
                                    <span>Posts and collections</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Required Tags */}
                    <div className="form-section">
                        <h3><FaTags /> Studio Tags (Optional)</h3>
                        <p className="field-hint">Tags help users discover your studio through search</p>

                        <div className="tag-selector">
                            {POPULAR_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`tag-btn ${requiredTags.includes(tag) ? 'active' : ''}`}
                                    onClick={() => handleTagToggle(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        <div className="custom-tag-input">
                            <input
                                type="text"
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                placeholder="Add custom tag..."
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                            />
                            <button type="button" onClick={handleAddCustomTag}>Add</button>
                        </div>

                        {requiredTags.length > 0 && (
                            <div className="selected-tags">
                                <strong>Studio tags:</strong>
                                {requiredTags.map(tag => (
                                    <span key={tag} className="selected-tag">
                                        {tag}
                                        <button type="button" onClick={() => handleTagToggle(tag)}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Required Locations */}
                    <div className="form-section">
                        <h3><FaMapMarkerAlt /> Location Focus (Optional)</h3>
                        <p className="field-hint">Specify locations this studio focuses on</p>

                        <div className="location-input">
                            <input
                                type="text"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                placeholder="e.g., New York, Tokyo, Paris..."
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                            />
                            <button type="button" onClick={handleAddLocation}>Add</button>
                        </div>

                        {requiredLocations.length > 0 && (
                            <div className="selected-locations">
                                {requiredLocations.map(loc => (
                                    <span key={loc} className="selected-location">
                                        {loc}
                                        <button
                                            type="button"
                                            onClick={() => setRequiredLocations(prev => prev.filter(l => l !== loc))}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <div className="form-section">
                        <h3>Studio Settings</h3>

                        <label className="toggle-option">
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            <div>
                                <strong>{isPublic ? <FaGlobe /> : <FaLock />} {isPublic ? 'Public' : 'Private'}</strong>
                                <span>{isPublic ? 'Anyone can view this studio' : 'Only members can view'}</span>
                            </div>
                        </label>

                        <label className="toggle-option">
                            <input
                                type="checkbox"
                                checked={moderationEnabled}
                                onChange={(e) => setModerationEnabled(e.target.checked)}
                            />
                            <div>
                                <strong>Require Approval</strong>
                                <span>You must approve content before it appears</span>
                            </div>
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="form-actions">
                        <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="create-btn">
                            {loading ? 'Creating...' : 'Create Studio'}
                        </button>
                    </div>
            </form>
        </div>
    );
};

export default CreateStudio;
