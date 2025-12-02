// Complete Search System for Panospace
// Supports: User search, Post search, Tag search, Location search, Art type filtering
// Uses Firestore with intelligent fallback and client-side filtering

import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { FaSearch, FaUser, FaMapMarkerAlt, FaTimes, FaImage, FaTrophy, FaThList, FaThLarge, FaShoppingBag } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ART_TYPES } from '../constants/artTypes';
import { useSearch } from '../hooks/useSearch';

// Simple debounce helper (used only for reference; actual debounce is via useEffect timer)
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Reducer for batching all search state updates
const searchReducer = (state, action) => {
    switch (action.type) {
        case 'SET_RESULTS':
            return {
                ...state,
                results: action.isLoadMore
                    ? {
                        posts: [...state.results.posts, ...action.payload.posts],
                        users: [...state.results.users, ...action.payload.users]
                    }
                    : action.payload,
                lastPostDoc: action.lastPostDoc !== undefined ? action.lastPostDoc : state.lastPostDoc,
                lastUserDoc: action.lastUserDoc !== undefined ? action.lastUserDoc : state.lastUserDoc,
                hasMorePosts: action.hasMorePosts !== undefined ? action.hasMorePosts : state.hasMorePosts,
                hasMoreUsers: action.hasMoreUsers !== undefined ? action.hasMoreUsers : state.hasMoreUsers,
            };
        case 'RESET_RESULTS':
            return {
                ...state,
                results: { posts: [], users: [] },
                lastPostDoc: null,
                lastUserDoc: null,
                hasMorePosts: true,
                hasMoreUsers: true,
            };
        default:
            return state;
    }
};

const initialSearchState = {
    results: { posts: [], users: [] },
    lastPostDoc: null,
    lastUserDoc: null,
    hasMorePosts: true,
    hasMoreUsers: true,
};

const Search = () => {
    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'posts', 'users'
    const [selectedArtTypes, setSelectedArtTypes] = useState([]);
    const [locationFilter, setLocationFilter] = useState('');
    const [showShopOnly, setShowShopOnly] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'feed'

    // Search results state via reducer
    const [searchState, dispatch] = useReducer(searchReducer, initialSearchState);
    const { results, lastPostDoc, lastUserDoc, hasMorePosts, hasMoreUsers } = searchState;

    const { searchUsers, searchPosts, loading } = useSearch();

    // Track component mount status and search request ID
    const isMountedRef = useRef(true);
    const searchRequestId = useRef(0);

    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    /** Core search function – performs user and/or post queries */
    const performSearch = useCallback(async (isLoadMore = false) => {
        if (!isMountedRef.current) return;

        // Increment request ID to invalidate previous requests
        const currentRequestId = ++searchRequestId.current;

        try {
            let postData = [];
            let userData = [];
            let newLastPostDoc = lastPostDoc;
            let newLastUserDoc = lastUserDoc;
            let newHasMorePosts = hasMorePosts;
            let newHasMoreUsers = hasMoreUsers;

            // Users
            if (activeTab === 'all' || activeTab === 'users') {
                const { data, lastDoc } = await searchUsers(searchTerm, isLoadMore ? lastUserDoc : null);
                if (!isMountedRef.current || searchRequestId.current !== currentRequestId) return;
                userData = data;
                if (data.length > 0) {
                    newLastUserDoc = lastDoc;
                    newHasMoreUsers = true;
                } else if (!isLoadMore) {
                    newHasMoreUsers = false;
                }
            }

            // Posts
            if (activeTab === 'all' || activeTab === 'posts') {
                const { data, lastDoc } = await searchPosts(
                    searchTerm,
                    { artTypes: selectedArtTypes, location: locationFilter },
                    isLoadMore ? lastPostDoc : null
                );
                if (!isMountedRef.current || searchRequestId.current !== currentRequestId) return;
                postData = data;
                if (data.length > 0) {
                    newLastPostDoc = lastDoc;
                    newHasMorePosts = true;
                } else if (!isLoadMore) {
                    newHasMorePosts = false;
                }
            }

            if (isMountedRef.current && searchRequestId.current === currentRequestId) {
                dispatch({
                    type: 'SET_RESULTS',
                    payload: { posts: postData, users: userData },
                    isLoadMore,
                    lastPostDoc: newLastPostDoc,
                    lastUserDoc: newLastUserDoc,
                    hasMorePosts: newHasMorePosts,
                    hasMoreUsers: newHasMoreUsers,
                });
            }
        } catch (err) {
            console.error('Search error:', err);
        }
    }, [activeTab, searchTerm, selectedArtTypes, locationFilter, searchUsers, searchPosts, lastPostDoc, lastUserDoc, hasMorePosts, hasMoreUsers]);

    // Debounced search – runs after 400ms of inactivity
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isMountedRef.current) {
                performSearch(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedArtTypes, locationFilter, activeTab, performSearch]);

    // Toggle art type filter
    const toggleArtType = (type) => {
        setSelectedArtTypes(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            }
            return [...prev, type];
        });
    };

    // Clear all filters and results
    const clearFilters = () => {
        setSearchTerm('');
        setLocationFilter('');
        setSelectedArtTypes([]);
        setShowShopOnly(false);
        dispatch({ type: 'RESET_RESULTS' });
    };

    // Tab button component
    const TabButton = ({ id, label, icon, count }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                flex: 1,
                padding: '0.6rem',
                background: activeTab === id ? '#fff' : 'rgba(255,255,255,0.05)',
                color: activeTab === id ? '#000' : '#aaa',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
            }}
        >
            {icon} {label}
            {count > 0 && (
                <span style={{
                    fontSize: '0.7rem',
                    background: activeTab === id ? '#000' : '#333',
                    color: activeTab === id ? '#fff' : '#888',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    minWidth: '18px',
                    textAlign: 'center',
                }}>{count}</span>
            )}
        </button>
    );

    // Filter posts based on Shop Only toggle
    const filteredPosts = showShopOnly
        ? results.posts.filter(p => p.shopLinked || p.addToShop)
        : results.posts;

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#000', color: '#fff', overflow: 'hidden' }}>
            {/* LEFT SIDEBAR */}
            <div style={{ width: '320px', flexShrink: 0, background: '#0a0a0a', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '600', letterSpacing: '1px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaSearch size={18} /> SEARCH
                    </h2>

                    {/* Contest Button */}
                    <button
                        onClick={() => navigate('/contest')}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <FaTrophy size={18} />
                        Photo of the Month
                    </button>

                    {/* Search input */}
                    <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', borderRadius: '12px', padding: '0.8rem', border: '1px solid #333', marginBottom: '1rem' }}>
                        <FaSearch color="#666" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            aria-label="Search posts and users"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '0.8rem', width: '100%', fontSize: '0.95rem', outline: 'none' }}
                        />
                        {searchTerm && (
                            <FaTimes
                                onClick={() => setSearchTerm('')}
                                role="button"
                                tabIndex={0}
                                aria-label="Clear search"
                                onKeyDown={e => e.key === 'Enter' && setSearchTerm('')}
                                style={{ cursor: 'pointer', color: '#666' }}
                            />
                        )}
                    </div>
                    {/* Location filter */}
                    <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', borderRadius: '12px', padding: '0.8rem', border: '1px solid #333', marginBottom: '1.5rem' }}>
                        <FaMapMarkerAlt color="#666" size={14} />
                        <input
                            type="text"
                            placeholder="Location (City, Country)"
                            aria-label="Filter by location"
                            value={locationFilter}
                            onChange={e => setLocationFilter(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '0.8rem', width: '100%', fontSize: '0.95rem', outline: 'none' }}
                        />
                    </div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <TabButton id="all" label="All" icon={<FaSearch />} count={filteredPosts.length + results.users.length} />
                        <TabButton id="posts" label="Posts" icon={<FaImage />} count={filteredPosts.length} />
                        <TabButton id="users" label="Artists" icon={<FaUser />} count={results.users.length} />
                    </div>
                    {/* Art type filters */}
                    {(activeTab === 'all' || activeTab === 'posts') && (
                        <div>
                            <label style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem', display: 'block' }}>Filter by Art Type</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {ART_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => toggleArtType(type)}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '15px',
                                            border: selectedArtTypes.includes(type) ? '1px solid #fff' : '1px solid #333',
                                            background: selectedArtTypes.includes(type) ? '#fff' : 'transparent',
                                            color: selectedArtTypes.includes(type) ? '#000' : '#888',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            transition: 'all 0.2s',
                                        }}
                                    >{type}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Clear filters button */}
                    {(searchTerm || locationFilter || selectedArtTypes.length > 0 || showShopOnly) && (
                        <button
                            onClick={clearFilters}
                            style={{
                                marginTop: '1.5rem',
                                padding: '0.6rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid #333',
                                color: '#aaa',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                width: '100%',
                            }}
                        >Clear Filters</button>
                    )}
                </div>
            </div>
            {/* RIGHT PANEL – Results View */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>

                {/* Top Controls: Shop Filter & View Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #222' }}>
                    {/* Shop Filter Switch */}
                    <div
                        onClick={() => setShowShopOnly(!showShopOnly)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', userSelect: 'none' }}
                    >
                        <div style={{
                            width: '40px', height: '20px', background: showShopOnly ? '#7FFFD4' : '#333',
                            borderRadius: '20px', position: 'relative', transition: 'background 0.2s'
                        }}>
                            <div style={{
                                width: '16px', height: '16px', background: '#fff', borderRadius: '50%',
                                position: 'absolute', top: '2px', left: showShopOnly ? '22px' : '2px', transition: 'left 0.2s'
                            }} />
                        </div>
                        <span style={{ fontSize: '0.9rem', color: showShopOnly ? '#7FFFD4' : '#aaa', fontWeight: showShopOnly ? '600' : '400' }}>
                            Available in Shop
                        </span>
                    </div>

                    {/* View Mode Toggle */}
                    <div style={{ display: 'flex', background: '#111', borderRadius: '8px', padding: '2px' }}>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '0.5rem 0.8rem',
                                background: viewMode === 'list' ? '#333' : 'transparent',
                                color: viewMode === 'list' ? '#fff' : '#666',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <FaThList /> List
                        </button>
                        <button
                            onClick={() => setViewMode('feed')}
                            style={{
                                padding: '0.5rem 0.8rem',
                                background: viewMode === 'feed' ? '#333' : 'transparent',
                                color: viewMode === 'feed' ? '#fff' : '#666',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <FaThLarge /> Feed
                        </button>
                    </div>
                </div>

                {/* Render posts */}
                <div style={{
                    display: viewMode === 'feed' ? 'grid' : 'flex',
                    flexDirection: viewMode === 'feed' ? 'row' : 'column',
                    gridTemplateColumns: viewMode === 'feed' ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'none',
                    gap: '1rem'
                }}>
                    {filteredPosts.map(post => (
                        <div
                            key={post.id}
                            onClick={() => navigate(`/post/${post.id}`)}
                            style={{
                                marginBottom: viewMode === 'list' ? '1rem' : '0',
                                padding: viewMode === 'list' ? '0.8rem' : '0',
                                background: '#111',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                border: '1px solid #222',
                                transition: 'transform 0.2s',
                                ...(viewMode === 'feed' ? { aspectRatio: '1/1' } : {})
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {viewMode === 'feed' ? (
                                // Feed View Card
                                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    {post.images?.[0]?.url || post.imageUrl ? (
                                        <img src={post.images?.[0]?.url || post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>No Image</div>
                                    )}
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '1rem', color: '#fff' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{post.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>by {post.authorName}</p>
                                    </div>
                                    {(post.shopLinked || post.addToShop) && (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', color: '#7FFFD4', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FaShoppingBag /> Shop
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // List View Card
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', background: '#222', flexShrink: 0 }}>
                                        {post.images?.[0]?.url || post.imageUrl ? (
                                            <img src={post.images?.[0]?.url || post.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaImage color="#333" /></div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1rem', margin: '0 0 0.2rem 0' }}>{post.title}</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>by {post.authorName}</p>
                                    </div>
                                    {(post.shopLinked || post.addToShop) && (
                                        <span style={{ color: '#7FFFD4', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <FaShoppingBag />
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Render users */}
                {results.users.map(user => (
                    <div
                        key={user.id}
                        onClick={() => navigate(`/profile/${user.id}`)}
                        style={{ marginBottom: '1rem', padding: '0.8rem', background: '#111', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                            {user.photoURL ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaUser />}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: '600' }}>{user.displayName}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>@{user.username || 'user'}</p>
                        </div>
                    </div>
                ))}

                {/* No results message */}
                {filteredPosts.length === 0 && results.users.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                        <p>No results found.</p>
                        {showShopOnly && <p style={{ fontSize: '0.8rem' }}>Try turning off the Shop filter.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
