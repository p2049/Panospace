import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaUniversity, FaUser, FaImage, FaPlus, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCreateCollection } from '../hooks/useCollections';
import { useSearch } from '../hooks/useSearch';
import { getUserTier, USER_TIERS } from '../services/monetizationService';
import { useToast } from '../context/ToastContext';

const CreateMuseumModal = ({ isOpen, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const { createCollection, loading, error } = useCreateCollection();
    const { searchUsers, searchGalleries } = useSearch();
    const { showError } = useToast();

    const [userTier, setUserTier] = useState(null);
    const [fetchingTier, setFetchingTier] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        coverImage: '',
        visibility: 'public',
        galleryIds: [],
        profileIds: []
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('galleries'); // 'galleries' or 'profiles'
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]); // Array of full objects for display

    // Fetch user tier
    useEffect(() => {
        const fetchTier = async () => {
            if (!currentUser) {
                setFetchingTier(false);
                return;
            }
            try {
                const tier = await getUserTier(currentUser.uid);
                setUserTier(tier);
            } catch (err) {
                console.error('Error fetching user tier:', err);
            } finally {
                setFetchingTier(false);
            }
        };
        fetchTier();
    }, [currentUser]);

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                title: '',
                description: '',
                coverImage: '',
                visibility: 'public',
                galleryIds: [],
                profileIds: []
            });
            setSearchQuery('');
            setSearchResults([]);
            setSelectedItems([]);
        }
    }, [isOpen]);

    // Handle search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                try {
                    let results;
                    if (searchType === 'galleries') {
                        results = await searchGalleries(searchQuery);
                    } else {
                        results = await searchUsers(searchQuery);
                    }
                    setSearchResults(results.data || []);
                } catch (err) {
                    console.error('Search error:', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, searchType, searchGalleries, searchUsers]);

    const handleAddItem = (item) => {
        const isGallery = searchType === 'galleries';
        const idField = isGallery ? 'galleryIds' : 'profileIds';

        if (formData[idField].includes(item.id)) return;

        setFormData(prev => ({
            ...prev,
            [idField]: [...prev[idField], item.id]
        }));

        setSelectedItems(prev => [...prev, { ...item, type: searchType }]);
    };

    const handleRemoveItem = (itemId, type) => {
        const idField = type === 'galleries' ? 'galleryIds' : 'profileIds';

        setFormData(prev => ({
            ...prev,
            [idField]: prev[idField].filter(id => id !== itemId)
        }));

        setSelectedItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        // Check if user is Ultra-tier Space Creator
        if (userTier !== USER_TIERS.ULTRA && userTier !== USER_TIERS.PARTNER) {
            showError('Museums are exclusive to Space Creator members. Please upgrade to continue.');
            onClose();
            return;
        }

        try {
            const museumData = {
                ...formData,
                type: 'museum',
                ownerId: currentUser.uid,
                ownerUsername: currentUser.displayName,
                items: [], // Museums don't hold individual posts directly in 'items' usually, but we keep structure
                postRefs: []
            };

            const newMuseum = await createCollection(museumData);
            if (onSuccess) onSuccess(newMuseum);
            onClose();
        } catch (err) {
            console.error('Failed to create museum:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: '#111',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #333'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaUniversity style={{ color: '#7FFFD4' }} /> Create Museum
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}>
                        <FaTimes />
                    </button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Left: Details Form */}
                    <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', borderRight: '1px solid #333' }}>
                        <form id="museum-form" onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                    placeholder="Museum Name"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                    rows={4}
                                    placeholder="Describe your museum..."
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>Cover Image URL</label>
                                <input
                                    type="text"
                                    value={formData.coverImage}
                                    onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                    placeholder="https://..."
                                />
                            </div>
                        </form>
                    </div>

                    {/* Right: Content Selection */}
                    <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Curate Content</h3>

                        {/* Search Type Toggle */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button
                                onClick={() => setSearchType('galleries')}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: searchType === 'galleries' ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                    color: searchType === 'galleries' ? '#7FFFD4' : '#888',
                                    border: '1px solid',
                                    borderColor: searchType === 'galleries' ? '#7FFFD4' : '#333',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <FaImage /> Studios
                            </button>
                            <button
                                onClick={() => setSearchType('profiles')}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: searchType === 'profiles' ? 'rgba(127, 255, 212, 0.2)' : '#222',
                                    color: searchType === 'profiles' ? '#7FFFD4' : '#888',
                                    border: '1px solid',
                                    borderColor: searchType === 'profiles' ? '#7FFFD4' : '#333',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <FaUser /> Profiles
                            </button>
                        </div>

                        {/* Search Input */}
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={`Search ${searchType === 'galleries' ? 'studios' : searchType}...`}
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', background: '#222', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                        </div>

                        {/* Search Results */}
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', border: '1px solid #333', borderRadius: '8px', padding: '0.5rem' }}>
                            {isSearching ? (
                                <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>Searching...</div>
                            ) : searchResults.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {searchResults.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleAddItem(item)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.5rem',
                                                background: '#1a1a1a',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                border: '1px solid transparent',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.borderColor = '#7FFFD4'}
                                            onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                                        >
                                            <img
                                                src={item.coverImage || item.photoURL || 'https://via.placeholder.com/40'}
                                                alt=""
                                                style={{ width: '40px', height: '40px', borderRadius: searchType === 'profiles' ? '50%' : '4px', objectFit: 'cover' }}
                                            />
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ color: '#fff', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.title || item.displayName}
                                                </div>
                                                <div style={{ color: '#666', fontSize: '0.8rem' }}>
                                                    {searchType === 'galleries' ? `${item.postCount || 0} posts` : `@${item.username || 'user'}`}
                                                </div>
                                            </div>
                                            <FaPlus style={{ marginLeft: 'auto', color: '#7FFFD4' }} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                                    {searchQuery ? 'No results found' : 'Start typing to search'}
                                </div>
                            )}
                        </div>

                        {/* Selected Items */}
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <h4 style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Selected Content ({selectedItems.length})</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {selectedItems.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.5rem',
                                        background: 'rgba(127, 255, 212, 0.1)',
                                        border: '1px solid rgba(127, 255, 212, 0.3)',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        color: '#7FFFD4'
                                    }}>
                                        {item.type === 'profiles' && <FaUser size={10} />}
                                        {item.type === 'galleries' && <FaImage size={10} />}
                                        <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.title || item.displayName}
                                        </span>
                                        <FaTimes
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleRemoveItem(item.id, item.type)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="museum-form"
                        disabled={loading}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#7FFFD4',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#000',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Museum'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateMuseumModal;
