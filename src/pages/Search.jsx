import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { FaSearch, FaFilter, FaTimes, FaCamera, FaImage, FaLayerGroup, FaTrophy, FaCalendar, FaUsers, FaIdCard, FaSortAmountDown, FaTh, FaList, FaCompass, FaRocket, FaUniversity } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import StarBackground from '../components/StarBackground';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../hooks/useSearch';
import { useFollowing } from '../hooks/useFollowing';
import { useBlock } from '../hooks/useBlock';
import ModernIcon from '../components/ModernIcon';
import SearchPanels from '../components/SearchPanels';
import { parseDateFromURL } from '../utils/dateHelpers';
import { SORT_OPTIONS } from '../constants/searchFilters';
import { getRecommendations } from '../utils/recommendations';
import GridPostCard from '../components/GridPostCard';
import FeedPostCard from '../components/FeedPostCard';
import UserCard from '../components/UserCard';
import GalleryCard from '../components/GalleryCard';
import CollectionCard from '../components/CollectionCard';
import ContestCard from '../components/ContestCard';
import EventCard from '../components/EventCard';
import SpaceCard from '../components/SpaceCard';
import MuseumCard from '../components/MuseumCard';


const searchReducer = (state, action) => {
    switch (action.type) {
        case 'SET_RESULTS':
            return {
                ...state,
                results: action.isLoadMore
                    ? {
                        posts: [...state.results.posts, ...action.payload.posts],
                        users: [...state.results.users, ...action.payload.users],
                        galleries: [...state.results.galleries, ...action.payload.galleries],
                        collections: [...state.results.collections, ...(action.payload.collections || [])],
                        contests: [...state.results.contests, ...(action.payload.contests || [])],
                        events: [...state.results.events, ...(action.payload.events || [])],
                        spacecards: [...state.results.spacecards, ...(action.payload.spacecards || [])],
                        museums: [...state.results.museums, ...(action.payload.museums || [])]
                    }
                    : action.payload,
                lastPostDoc: action.lastPostDoc !== undefined ? action.lastPostDoc : state.lastPostDoc,
                lastUserDoc: action.lastUserDoc !== undefined ? action.lastUserDoc : state.lastUserDoc,
                lastGalleryDoc: action.lastGalleryDoc !== undefined ? action.lastGalleryDoc : state.lastGalleryDoc,
                lastCollectionDoc: action.lastCollectionDoc !== undefined ? action.lastCollectionDoc : state.lastCollectionDoc,
                lastContestDoc: action.lastContestDoc !== undefined ? action.lastContestDoc : state.lastContestDoc,
                lastEventDoc: action.lastEventDoc !== undefined ? action.lastEventDoc : state.lastEventDoc,
                lastSpaceCardDoc: action.lastSpaceCardDoc !== undefined ? action.lastSpaceCardDoc : state.lastSpaceCardDoc,
                lastMuseumDoc: action.lastMuseumDoc !== undefined ? action.lastMuseumDoc : state.lastMuseumDoc,
                hasMorePosts: action.hasMorePosts !== undefined ? action.hasMorePosts : state.hasMorePosts,
                hasMoreUsers: action.hasMoreUsers !== undefined ? action.hasMoreUsers : state.hasMoreUsers,
                hasMoreGalleries: action.hasMoreGalleries !== undefined ? action.hasMoreGalleries : state.hasMoreGalleries,
                hasMoreCollections: action.hasMoreCollections !== undefined ? action.hasMoreCollections : state.hasMoreCollections,
                hasMoreContests: action.hasMoreContests !== undefined ? action.hasMoreContests : state.hasMoreContests,
                hasMoreEvents: action.hasMoreEvents !== undefined ? action.hasMoreEvents : state.hasMoreEvents,
                hasMoreSpaceCards: action.hasMoreSpaceCards !== undefined ? action.hasMoreSpaceCards : state.hasMoreSpaceCards,
                hasMoreMuseums: action.hasMoreMuseums !== undefined ? action.hasMoreMuseums : state.hasMoreMuseums,
            };
        case 'RESET_RESULTS':
            return {
                ...state,
                results: { posts: [], users: [], galleries: [], collections: [], museums: [], contests: [], events: [], spacecards: [] },
                lastPostDoc: null,
                lastUserDoc: null,
                lastGalleryDoc: null,
                lastCollectionDoc: null,
                lastContestDoc: null,
                lastEventDoc: null,
                lastSpaceCardDoc: null,
                lastMuseumDoc: null,
                hasMorePosts: true,
                hasMoreUsers: true,
                hasMoreGalleries: true,
                hasMoreCollections: true,
                hasMoreContests: true,
                hasMoreEvents: true,
                hasMoreSpaceCards: true,
                hasMoreMuseums: true,
            };
        default:
            return state;
    }
};

const initialSearchState = {
    results: { posts: [], users: [], galleries: [], collections: [], museums: [], contests: [], events: [], spacecards: [] },
    lastPostDoc: null,
    lastUserDoc: null,
    lastGalleryDoc: null,
    lastCollectionDoc: null,
    lastContestDoc: null,
    lastEventDoc: null,
    lastSpaceCardDoc: null,
    hasMorePosts: true,
    hasMoreUsers: true,
    hasMoreGalleries: true,
    hasMoreCollections: true,
    hasMoreContests: true,
    hasMoreEvents: true,
    hasMoreEvents: true,
    hasMoreSpaceCards: true,
    hasMoreMuseums: true,
};

const Search = () => {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedPark, setSelectedPark] = useState(null);
    const [selectedDate, setSelectedDate] = useState(() => {
        // Initialize from URL param if present
        const dateParam = searchParams.get('date');
        return dateParam ? parseDateFromURL(dateParam) : null;
    });
    const [selectedMuseum, setSelectedMuseum] = useState(null);

    // Fetch museum if museumId param exists
    useEffect(() => {
        const museumId = searchParams.get('museumId');
        if (museumId) {
            const fetchMuseum = async () => {
                try {
                    const docRef = doc(db, 'museums', museumId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setSelectedMuseum({ id: docSnap.id, ...docSnap.data() });
                        // Optionally switch to 'posts' or 'galleries' if not already
                        if (currentMode === 'museums') setCurrentMode('posts');
                    }
                } catch (err) {
                    console.error("Error fetching museum filter:", err);
                }
            };
            fetchMuseum();
        } else {
            setSelectedMuseum(null);
        }
    }, [searchParams]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [selectedFilm, setSelectedFilm] = useState(null);
    const [selectedOrientation, setSelectedOrientation] = useState(null);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'feed'
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [isExploreMode, setIsExploreMode] = useState(true);
    const [error, setError] = useState(null);

    // Mode Switcher State
    const [currentMode, setCurrentMode] = useState('posts'); // 'posts' | 'galleries' | 'collections' | 'museums' | 'contests' | 'events' | 'users' | 'spacecards'
    const [followingOnly, setFollowingOnly] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        // Set initial value on mount
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const lastScrollY = useRef(0);

    const handleScroll = (e) => {
        const currentScrollY = e.target.scrollTop;
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            setHeaderVisible(false);
        } else {
            setHeaderVisible(true);
        }
        lastScrollY.current = currentScrollY;
    };

    const [searchState, dispatch] = useReducer(searchReducer, initialSearchState);
    const { results, lastPostDoc, lastUserDoc, lastGalleryDoc, lastCollectionDoc, lastMuseumDoc, lastContestDoc, lastEventDoc, lastSpaceCardDoc, hasMorePosts, hasMoreUsers, hasMoreGalleries, hasMoreCollections, hasMoreMuseums, hasMoreContests, hasMoreEvents, hasMoreSpaceCards } = searchState;

    const { searchUsers, searchPosts, searchGalleries, searchCollections, searchContests, searchEvents, searchSpaceCards, loading } = useSearch();
    const { followingList, fetchFollowing } = useFollowing(currentUser?.uid);
    const { blockedUsers } = useBlock();

    const isMountedRef = useRef(true);
    const isLoadingRef = useRef(false);
    const searchRequestId = useRef(0);
    const currentSearchTermRef = useRef(searchTerm);
    const currentSelectedTagsRef = useRef(selectedTags);
    const currentSelectedParkRef = useRef(selectedPark);
    const currentSelectedDateRef = useRef(selectedDate);
    const currentSelectedCameraRef = useRef(selectedCamera);
    const currentSelectedFilmRef = useRef(selectedFilm);
    const currentSelectedOrientationRef = useRef(selectedOrientation);
    const currentSelectedAspectRatioRef = useRef(selectedAspectRatio);
    const currentSortByRef = useRef(sortBy);
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Check if we're in Explore mode (no filters applied and in posts mode without Following)
    useEffect(() => {
        const hasFilters = searchTerm || selectedTags.length > 0 || selectedPark || selectedDate ||
            selectedCamera || selectedFilm || selectedOrientation || selectedAspectRatio || selectedMuseum;
        setIsExploreMode(!hasFilters && !followingOnly && currentMode === 'posts');
    }, [searchTerm, selectedTags, selectedPark, selectedDate, selectedCamera, selectedFilm, selectedOrientation, selectedAspectRatio, followingOnly, currentMode, selectedMuseum]);

    // Load personalized recommendations for Explore mode
    useEffect(() => {
        const loadRecommendations = async () => {
            if (currentUser && isExploreMode) {
                const filters = await getRecommendations(currentUser.uid);
                setRecommendations(filters);
            }
        };
        loadRecommendations();
    }, [currentUser, isExploreMode]);

    // Trigger search when mode or followingOnly changes
    useEffect(() => {
        dispatch({ type: 'RESET_RESULTS' });
        performSearch();
    }, [currentMode, followingOnly]);

    const performSearch = useCallback(async (isLoadMore = false) => {
        if (!isMountedRef.current) return;

        // Prevent concurrent searches
        if (isLoadingRef.current && !isLoadMore) return;

        const currentRequestId = ++searchRequestId.current;

        // Only set searching to true if this is a new search (not a callback recreation)
        if (!isLoadMore) {
            isLoadingRef.current = true;
            setIsSearching(true);
            setHasSearched(true);
            setError(null);
        }

        try {
            // Use refs to get current search params
            const term = currentSearchTermRef.current;
            const tags = currentSelectedTagsRef.current;
            const parkId = currentSelectedParkRef.current;
            const date = currentSelectedDateRef.current;

            // Check if we're in Explore mode (no filters)
            const hasFilters = term || tags.length > 0 || parkId || date ||
                currentSelectedCameraRef.current || currentSelectedFilmRef.current ||
                currentSelectedOrientationRef.current || currentSelectedAspectRatioRef.current || selectedMuseum;

            // If Explore mode and we have recommendations, use them
            let exploreTags = [];
            let exploreSort = currentSortByRef.current;
            if (!hasFilters && recommendations && currentMode === 'posts') {
                if (recommendations.tags && recommendations.tags.length > 0) {
                    exploreTags = recommendations.tags;
                }
            }

            // Mode-based search
            let resultData = [];
            let newLastDoc = null;
            let hasMore = true;

            switch (currentMode) {
                case 'posts': {
                    let searchAuthorIds = followingOnly ? followingList : [];

                    if (selectedMuseum) {
                        const museumMemberIds = selectedMuseum.members || [];
                        if (followingOnly) {
                            // Intersection
                            searchAuthorIds = searchAuthorIds.filter(id => museumMemberIds.includes(id));
                        } else {
                            searchAuthorIds = museumMemberIds;
                        }
                    }

                    const { data, lastDoc } = await searchPosts(
                        term,
                        {
                            tags: hasFilters ? tags : exploreTags,
                            parkId: parkId,
                            selectedDate: date,
                            camera: currentSelectedCameraRef.current,
                            film: currentSelectedFilmRef.current,
                            orientation: currentSelectedOrientationRef.current,
                            aspectRatio: currentSelectedAspectRatioRef.current,
                            sort: hasFilters ? currentSortByRef.current : exploreSort,
                            authorIds: searchAuthorIds
                        },
                        isLoadMore ? lastPostDoc : null
                    );
                    // Filter blocked users
                    resultData = data.filter(post => !blockedUsers.has(post.authorId) && !blockedUsers.has(post.userId));
                    newLastDoc = lastDoc;
                    hasMore = data.length > 0;
                    break;
                }

                case 'users': {
                    const { data, lastDoc } = await searchUsers(
                        term,
                        { userIds: selectedMuseum ? (selectedMuseum.members || []) : [] },
                        isLoadMore ? lastUserDoc : null
                    );
                    // Filter blocked users
                    resultData = data.filter(user => !blockedUsers.has(user.id));
                    newLastDoc = lastDoc;
                    hasMore = data.length > 0;
                    break;
                }

                case 'galleries': {
                    const { data, lastDoc } = await searchGalleries(
                        term,
                        {
                            tags: tags,
                            galleryIds: selectedMuseum ? (selectedMuseum.galleryIds || []) : []
                        },
                        isLoadMore ? lastGalleryDoc : null
                    );
                    // Filter blocked users
                    resultData = data.filter(gallery => !blockedUsers.has(gallery.ownerId));
                    newLastDoc = lastDoc;
                    hasMore = data.length > 0;

                    // Apply Following filter
                    if (followingOnly && followingList.length > 0) {
                        resultData = resultData.filter(gallery => followingList.includes(gallery.ownerId));
                    }
                    break;
                }

                case 'collections': {
                    const { data, lastDoc } = await searchCollections(
                        term,
                        { tags: tags },
                        isLoadMore ? lastCollectionDoc : null
                    );
                    // Filter blocked users
                    resultData = data.filter(collection => !blockedUsers.has(collection.ownerId));
                    newLastDoc = lastDoc;
                    hasMore = data.length > 0;

                    if (followingOnly && followingList.length > 0) {
                        resultData = resultData.filter(collection => followingList.includes(collection.ownerId));
                    }
                    break;
                }

                case 'museums': {
                    const { data, lastDoc } = await searchCollections(
                        term,
                        { tags: tags },
                        isLoadMore ? lastMuseumDoc : null
                    );

                    // Filter for museums
                    resultData = data.filter(item => item.type === 'museum' && !blockedUsers.has(item.ownerId));
                    newLastDoc = lastDoc;
                    hasMore = data.length > 0;

                    if (followingOnly && followingList.length > 0) {
                        resultData = resultData.filter(item => followingList.includes(item.ownerId));
                    }
                    break;
                }

                case 'contests': {
                    const { data, lastDoc } = await searchContests(
                        term,
                        { tags: tags, status: 'active' },
                        isLoadMore ? lastContestDoc : null
                    );
                    // Filter blocked users (assuming hostId or ownerId exists)
                    resultData = data.filter(contest => !blockedUsers.has(contest.hostId) && !blockedUsers.has(contest.ownerId));
                    newLastDoc = lastDoc;
                    hasMore = data.length > 0;
                    break;
                }

                case 'events': {
                    const { data, lastDoc } = await searchEvents(
                        term,
                        { status: 'upcoming' },
                        isLoadMore ? lastEventDoc : null
                    );
                    // Filter blocked users
                    resultData = data.filter(event => !blockedUsers.has(event.hostId) && !blockedUsers.has(event.ownerId));
                    newLastDoc = lastDoc;
                    hasMore = data.length > 0;
                    break;
                }

                case 'spacecards': {
                    const { data, lastDoc } = await searchSpaceCards(
                        term,
                        { tags: tags },
                        isLoadMore ? lastSpaceCardDoc : null
                    );
                    // Filter blocked users
                    resultData = data.filter(card => !blockedUsers.has(card.ownerId));
                    newLastDoc = lastDoc;
                    hasMore = data.length > 0;
                    break;
                }

                default:
                    break;
            }

            if (!isMountedRef.current || searchRequestId.current !== currentRequestId) return;

            // Build payload based on current mode
            const payload = {
                posts: currentMode === 'posts' ? resultData : [],
                users: currentMode === 'users' ? resultData : [],
                galleries: currentMode === 'galleries' ? resultData : [],
                collections: currentMode === 'collections' ? resultData : [],
                contests: currentMode === 'contests' ? resultData : [],
                events: currentMode === 'events' ? resultData : [],
                spacecards: currentMode === 'spacecards' ? resultData : [],
                museums: currentMode === 'museums' ? resultData : []
            };

            dispatch({
                type: 'SET_RESULTS',
                payload,
                isLoadMore,
                lastPostDoc: currentMode === 'posts' ? newLastDoc : lastPostDoc,
                lastUserDoc: currentMode === 'users' ? newLastDoc : lastUserDoc,
                lastGalleryDoc: currentMode === 'galleries' ? newLastDoc : lastGalleryDoc,
                lastCollectionDoc: currentMode === 'collections' ? newLastDoc : lastCollectionDoc,
                lastContestDoc: currentMode === 'contests' ? newLastDoc : lastContestDoc,
                lastEventDoc: currentMode === 'events' ? newLastDoc : lastEventDoc,
                lastSpaceCardDoc: currentMode === 'spacecards' ? newLastDoc : lastSpaceCardDoc,
                hasMorePosts: currentMode === 'posts' ? hasMore : hasMorePosts,
                hasMoreUsers: currentMode === 'users' ? hasMore : hasMoreUsers,
                hasMoreGalleries: currentMode === 'galleries' ? hasMore : hasMoreGalleries,
                hasMoreCollections: currentMode === 'collections' ? hasMore : hasMoreCollections,
                hasMoreContests: currentMode === 'contests' ? hasMore : hasMoreContests,
                hasMoreEvents: currentMode === 'events' ? hasMore : hasMoreEvents,
                hasMoreSpaceCards: currentMode === 'spacecards' ? hasMore : hasMoreSpaceCards,
                hasMoreMuseums: currentMode === 'museums' ? hasMore : hasMoreMuseums,
                lastMuseumDoc: currentMode === 'museums' ? newLastDoc : lastMuseumDoc,
            });
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to perform search. Please try again.');
        } finally {
            if (isMountedRef.current) {
                setIsSearching(false);
            }
            isLoadingRef.current = false;
        }
    }
    }, [currentMode, followingOnly, followingList, searchUsers, searchPosts, searchGalleries, searchCollections, searchContests, searchEvents, searchSpaceCards, lastPostDoc, lastUserDoc, lastGalleryDoc, lastCollectionDoc, lastMuseumDoc, lastContestDoc, lastEventDoc, lastSpaceCardDoc, hasMorePosts, hasMoreUsers, hasMoreGalleries, hasMoreCollections, hasMoreMuseums, hasMoreContests, hasMoreEvents, hasMoreSpaceCards, recommendations, blockedUsers, selectedMuseum]);

// Update refs when search params change
useEffect(() => {
    currentSearchTermRef.current = searchTerm;
    currentSelectedTagsRef.current = selectedTags;
    currentSelectedParkRef.current = selectedPark;
    currentSelectedDateRef.current = selectedDate;
    currentSelectedCameraRef.current = selectedCamera;
    currentSelectedFilmRef.current = selectedFilm;
    currentSelectedOrientationRef.current = selectedOrientation;
    currentSelectedAspectRatioRef.current = selectedAspectRatio;
    currentSortByRef.current = sortBy;
}, [searchTerm, selectedTags, selectedPark, selectedDate, selectedCamera, selectedFilm, selectedOrientation, selectedAspectRatio, sortBy]);

// Debounced search effect - does NOT depend on performSearch to avoid loop
useEffect(() => {
    const timer = setTimeout(() => {
        if (isMountedRef.current) {
            performSearch(false);
        }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchTerm, selectedTags, selectedPark, selectedDate, selectedCamera, selectedFilm, selectedOrientation, selectedAspectRatio, sortBy]);

// Prefetching: Load more when user scrolls near bottom
useEffect(() => {
    let prefetchTimer = null;
    const handleScroll = () => {
        // Debounce scroll events
        if (prefetchTimer) clearTimeout(prefetchTimer);

        prefetchTimer = setTimeout(() => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const documentHeight = document.documentElement.scrollHeight;
            const threshold = documentHeight - 800; // Trigger 800px before bottom

            // Prefetch if near bottom, not already loading, and has more posts
            if (scrollPosition >= threshold && !loading && hasMorePosts && results.posts.length > 0) {
                performSearch(true); // Load more
            }
        }, 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
        if (prefetchTimer) clearTimeout(prefetchTimer);
    };
}, [loading, hasMorePosts, results.posts.length, performSearch]);

// Hide header on scroll
useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < 10) {
            setHeaderVisible(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            // Scrolling down & past threshold
            setHeaderVisible(false);
        } else if (currentScrollY < lastScrollY.current) {
            // Scrolling up
            setHeaderVisible(true);
        }

        lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
}, []);

const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
        if (prev.includes(tag)) {
            return prev.filter(t => t !== tag);
        }
        return [...prev, tag];
    });
};

const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedPark(null);
    setSelectedDate(null);
    setSelectedCamera(null);
    setSelectedFilm(null);
    setSelectedOrientation(null);
    setSelectedAspectRatio(null);
    setSortBy('newest');
    // Clear museum filter by removing param
    if (selectedMuseum) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('museumId');
        navigate({ search: newParams.toString() });
    }
    dispatch({ type: 'RESET_RESULTS' });
};

return (
    <SearchPanels
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        selectedPark={selectedPark}
        onParkSelect={setSelectedPark}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
        selectedFilm={selectedFilm}
        onFilmSelect={setSelectedFilm}
        selectedOrientation={selectedOrientation}
        onOrientationSelect={setSelectedOrientation}
        selectedAspectRatio={selectedAspectRatio}
        onAspectRatioSelect={setSelectedAspectRatio}
        onClearAll={clearAllFilters}
        resultsCount={
            currentMode === 'posts' ? results.posts.length :
                currentMode === 'users' ? results.users.length :
                    currentMode === 'galleries' ? results.galleries.length :
                        currentMode === 'collections' ? results.collections.length :
                            currentMode === 'contests' ? results.contests.length :
                                currentMode === 'events' ? results.events.length :
                                    currentMode === 'spacecards' ? results.spacecards.length :
                                        currentMode === 'museums' ? results.museums.length : 0
        }
        currentMode={currentMode}
        isMobileFiltersOpen={isMobileFiltersOpen}
        onMobileFilterToggle={setIsMobileFiltersOpen}
        onScroll={handleScroll}
    >
        onScroll={handleScroll}
        >
        {/* Active Museum Filter Indicator */}
        {selectedMuseum && (
            <div style={{
                background: 'rgba(127, 255, 212, 0.1)',
                borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
                padding: '0.75rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#7FFFD4',
                fontSize: '0.9rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaUniversity />
                    <span>Filtering by: <strong>{selectedMuseum.title}</strong></span>
                </div>
                <button
                    onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('museumId');
                        navigate({ search: newParams.toString() });
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#7FFFD4',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        opacity: 0.8
                    }}
                >
                    <FaTimes /> Clear
                </button>
            </div>
        )}

        {/* Search Header with Space Theme */}
        <div className="search-header" style={{
            padding: isMobile ? '0.5rem 0.8rem 0.5rem 0.8rem' : '1rem 2rem 0.5rem 2rem',
            borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
            background: '#000',
            position: 'sticky',
            top: 0,
            height: 'auto',
            zIndex: 50,
            WebkitTransform: 'translateZ(0)',
            overflow: 'visible',
            transition: 'transform 0.3s ease',
            transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)'
        }}>
            {/* Animated Stars Background - Optimized for Performance */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 0
            }}>
                {[...Array(isMobile ? 15 : 50)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: Math.random() * 2 + 1 + 'px',
                            height: Math.random() * 2 + 1 + 'px',
                            background: '#7FFFD4',
                            borderRadius: '50%',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            opacity: Math.random() * 0.5 + 0.3,
                            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                            boxShadow: `0 0 ${Math.random() * 3 + 2}px rgba(127, 255, 212, 0.8)`,
                            willChange: 'opacity'
                        }}
                    />
                ))}
            </div>

            {/* Content Layer */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Panospace Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginBottom: isMobile ? '0.2rem' : '1rem',
                    justifyContent: isMobile ? 'space-between' : 'flex-start'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {/* Custom Green Planet with Ring Logo */}
                        <svg
                            width="40"
                            height="40"
                            viewBox="-5 -5 34 34"
                            onClick={() => navigate('/')}
                            style={{
                                flexShrink: 0,
                                filter: 'drop-shadow(0 0 8px rgba(127, 255, 212, 0.4))',
                                cursor: 'pointer',
                                overflow: 'visible'
                            }}
                            title="Go to Feed"
                        >
                            <defs>
                                <radialGradient id="planetGradient" cx="40%" cy="40%">
                                    <stop offset="0%" style={{ stopColor: '#7FFFD4', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#00CED1', stopOpacity: 1 }} />
                                </radialGradient>
                                <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Ring behind planet */}
                            <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.4" transform="rotate(-20 12 12)" />

                            {/* Planet circle with glow */}
                            <circle cx="12" cy="12" r="7" fill="url(#planetGradient)" opacity="0.95" filter="url(#planetGlow)" />

                            {/* Ring in front of planet */}
                            <ellipse cx="12" cy="12" rx="14" ry="4" fill="none" stroke="#7FFFD4" strokeWidth="1.5" opacity="0.6" transform="rotate(-20 12 12)"
                                strokeDasharray="0,8,20,100" />

                            {/* Subtle glow */}
                            <circle cx="12" cy="12" r="7" fill="none" stroke="#7FFFD4" strokeWidth="0.5" opacity="0.3" />
                        </svg>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', whiteSpace: 'nowrap' }}>
                            <h1 style={{
                                color: '#fff',
                                fontSize: '1.1rem',
                                fontWeight: '900',
                                textShadow: '0 2px 8px rgba(127, 255, 212, 0.4)',
                                cursor: 'pointer',
                                fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', monospace",
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                background: 'linear-gradient(135deg, #7FFFD4, #00CED1)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                margin: 0
                            }} onClick={() => navigate('/')}>
                                PANOSPACE
                            </h1>
                            <span
                                onClick={() => isMobile && setIsMobileFiltersOpen(true)}
                                style={{
                                    fontSize: '0.95rem',
                                    fontWeight: '800',
                                    fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', monospace",
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #7FFFD4 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    filter: 'drop-shadow(0 0 8px rgba(127, 255, 212, 0.3))',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}>EXPLORE {isMobile && selectedTags.length > 0 && <span style={{ fontSize: '0.8em', verticalAlign: 'top', color: '#7FFFD4', WebkitTextFillColor: '#7FFFD4' }}>•</span>}</span>
                        </div>
                    </div>
                </div>


                {/* Mode Switcher */}
                <div className="search-mode-switcher" style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: isMobile ? '0' : '1rem',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    {[
                        { key: 'posts', icon: FaCamera, label: 'Posts' },
                        { key: 'galleries', icon: FaImage, label: 'Galleries' },
                        { key: 'collections', icon: FaLayerGroup, label: 'Collections' },
                        { key: 'museums', icon: FaUniversity, label: 'Museums' },
                        { key: 'contests', icon: FaTrophy, label: 'Contests' },
                        { key: 'events', icon: FaCalendar, label: 'Events' },
                        { key: 'users', icon: FaUsers, label: 'Users' },
                        { key: 'spacecards', icon: FaIdCard, label: 'SpaceCards' }
                    ].map(mode => (
                        <button
                            key={mode.key}
                            onClick={() => setCurrentMode(mode.key)}
                            style={{
                                padding: isMobile ? '0.3rem 0.6rem' : '0.4rem 1rem',
                                background: currentMode === mode.key ? 'rgba(127, 255, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                color: currentMode === mode.key ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.6)',
                                border: currentMode === mode.key ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: currentMode === mode.key ? '700' : '500',
                                fontSize: isMobile ? '0.75rem' : '0.85rem',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontFamily: 'var(--font-family-heading)',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                boxShadow: currentMode === mode.key ? '0 0 15px rgba(127, 255, 212, 0.2), inset 0 0 10px rgba(127, 255, 212, 0.05)' : 'none',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                                if (currentMode !== mode.key) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.currentTarget.style.color = '#fff';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentMode !== mode.key) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                                }
                            }}
                        >
                            <span><ModernIcon icon={mode.icon} size={14} glow={currentMode === mode.key} /></span>
                            {(!isMobile) && <span>{mode.label}</span>}
                        </button>
                    ))}
                </div>

                {/* Desktop Search Bar (Hidden on Mobile) */}
                {(!isMobile) && (
                    <div className="search-bar-container" style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '0',
                        position: 'relative',
                        zIndex: 10
                    }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <FaSearch style={{
                                position: 'absolute',
                                left: '1.2rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--ice-mint)',
                                fontSize: '1rem',
                                opacity: 0.8,
                                filter: 'drop-shadow(0 0 5px rgba(127, 255, 212, 0.5))'
                            }} />
                            <input
                                type="text"
                                placeholder={`Search for ${currentMode}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 1rem 0.5rem 3.2rem',
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    border: '1px solid rgba(127, 255, 212, 0.3)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    fontFamily: 'var(--font-family-mono)',
                                    letterSpacing: '0.02em',
                                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(127, 255, 212, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--ice-mint)';
                                    e.target.style.boxShadow = '0 0 25px rgba(127, 255, 212, 0.15), inset 0 0 15px rgba(127, 255, 212, 0.1)';
                                    e.target.style.background = 'rgba(0, 0, 0, 0.8)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(127, 255, 212, 0.3)';
                                    e.target.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(127, 255, 212, 0.05)';
                                    e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                                }}
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            {/* Following Toggle */}
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.6rem 1.2rem',
                                background: followingOnly ? 'rgba(127, 255, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                border: followingOnly ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                whiteSpace: 'nowrap',
                                height: '100%',
                                boxShadow: followingOnly ? '0 0 15px rgba(127, 255, 212, 0.15)' : 'none',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={followingOnly}
                                    onChange={(e) => setFollowingOnly(e.target.checked)}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        border: '2px solid #7FFFD4',
                                        borderRadius: '3px',
                                        background: followingOnly ? '#7FFFD4' : '#000',
                                        position: 'relative',
                                        transition: 'all 0.2s'
                                    }}
                                />
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: followingOnly ? '700' : '500',
                                    color: followingOnly ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.7)',
                                    fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}>
                                    Following Only
                                </span>
                            </label>
                            {/* Sort Dropdown - Custom Implementation */}
                            <div ref={sortDropdownRef} style={{ position: 'relative', marginRight: '0.5rem' }}>
                                <button
                                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                    style={{
                                        padding: '0.6rem 1rem 0.6rem 1rem',
                                        background: isSortDropdownOpen ? 'rgba(127, 255, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                        border: isSortDropdownOpen ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '8px',
                                        color: isSortDropdownOpen ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.9)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        fontFamily: "'Rajdhani', sans-serif",
                                        fontWeight: '600',
                                        letterSpacing: '0.05em',
                                        transition: 'all 0.3s ease',
                                        backdropFilter: 'blur(10px)',
                                        textTransform: 'uppercase',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        minWidth: '140px',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <span>{SORT_OPTIONS.find(opt => opt.id === sortBy)?.label || 'Sort By'}</span>
                                    <FaSortAmountDown style={{ fontSize: '0.8rem', opacity: 0.8 }} />
                                </button>

                                {/* Dropdown Menu */}
                                {isSortDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 0.5rem)',
                                        right: 0,
                                        width: '180px',
                                        background: '#000',
                                        border: '1px solid var(--ice-mint)',
                                        borderRadius: '12px',
                                        boxShadow: '0 0 20px rgba(127, 255, 212, 0.2), 0 10px 30px rgba(0,0,0,0.8)',
                                        zIndex: 100,
                                        overflow: 'hidden',
                                        animation: 'fadeIn 0.2s ease-out'
                                    }}>
                                        {SORT_OPTIONS.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => {
                                                    setSortBy(opt.id);
                                                    setIsSortDropdownOpen(false);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '0.8rem 1rem',
                                                    background: sortBy === opt.id ? 'rgba(127, 255, 212, 0.1)' : 'transparent',
                                                    border: 'none',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                                    color: sortBy === opt.id ? 'var(--ice-mint)' : '#fff',
                                                    fontSize: '0.85rem',
                                                    fontFamily: "'Rajdhani', sans-serif",
                                                    fontWeight: sortBy === opt.id ? '600' : '500',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (sortBy !== opt.id) {
                                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                        e.currentTarget.style.color = 'var(--ice-mint)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (sortBy !== opt.id) {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = '#fff';
                                                    }
                                                }}
                                            >
                                                {opt.label}
                                                {sortBy === opt.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ice-mint)', boxShadow: '0 0 5px var(--ice-mint)' }} />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    padding: '0.6rem',
                                    background: viewMode === 'grid' ? 'rgba(127, 255, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                    border: viewMode === 'grid' ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '8px',
                                    color: viewMode === 'grid' ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.6)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: viewMode === 'grid' ? '0 0 15px rgba(127, 255, 212, 0.2)' : 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                <FaTh />
                            </button>
                            <button
                                onClick={() => setViewMode('feed')}
                                style={{
                                    padding: '0.6rem',
                                    background: viewMode === 'feed' ? 'rgba(127, 255, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                    border: viewMode === 'feed' ? '1px solid var(--ice-mint)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '8px',
                                    color: viewMode === 'feed' ? 'var(--ice-mint)' : 'rgba(255, 255, 255, 0.6)',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                <FaList />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Results Area */}
        <div style={{ padding: '1.5rem 1.5rem 1.5rem 1.5rem' }}>
            {viewMode === 'grid' ? (
                <div
                    key={`${currentMode}-${results[currentMode]?.length || 0}-${sortBy}`}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile
                            ? 'repeat(auto-fill, minmax(140px, 1fr))'
                            : 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: isMobile ? '0.75rem' : '1rem',
                        animation: 'fadeIn 0.4s ease-out forwards',
                        opacity: 0
                    }}
                >
                    <style>{`
    @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
    }
    `}</style>
                    {currentMode === 'posts' && results.posts.map(post => (
                        <GridPostCard
                            key={post.id}
                            post={post}
                            contextPosts={results.posts}
                            selectedOrientation={selectedOrientation}
                            selectedAspectRatio={selectedAspectRatio}
                        />
                    ))}
                    {currentMode === 'users' && results.users.map(user => (
                        <UserCard key={user.id} user={user} />
                    ))}
                    {currentMode === 'galleries' && results.galleries.map(gallery => (
                        <GalleryCard key={gallery.id} gallery={gallery} />
                    ))}
                    {currentMode === 'collections' && results.collections.map(collection => (
                        <CollectionCard key={collection.id} collection={collection} />
                    ))}
                    {currentMode === 'contests' && results.contests.map(contest => (
                        <ContestCard key={contest.id} contest={contest} />
                    ))}
                    {currentMode === 'events' && results.events.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                    {currentMode === 'spacecards' && results.spacecards.map(card => (
                        <SpaceCard key={card.id} card={card} />
                    ))}
                </div>
            ) : (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {currentMode === 'posts' && results.posts.map(post => (
                        <div key={post.id} style={{ marginBottom: '1rem' }}>
                            <FeedPostCard post={post} />
                        </div>
                    ))}
                    {/* Add other modes for feed view if needed */}
                </div>
            )}
        </div>

        {/* No Results State */}
        {
            !isSearching && !error && (
                currentMode === 'posts' ? results.posts.length === 0 :
                    currentMode === 'users' ? results.users.length === 0 :
                        currentMode === 'galleries' ? results.galleries.length === 0 :
                            currentMode === 'collections' ? results.collections.length === 0 :
                                currentMode === 'contests' ? results.contests.length === 0 :
                                    currentMode === 'events' ? results.events.length === 0 :
                                        currentMode === 'spacecards' ? results.spacecards.length === 0 : true
            ) && hasSearched && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100dvh', // Use dvh for better mobile support
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle at 50% 50%, #0b0b0b 0%, #000000 100%)',
                    padding: '0 1.5rem', // Add side padding for mobile
                    textAlign: 'center' // Ensure text is centered
                }}>
                    {/* Star Background */}
                    <StarBackground />

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', width: '100%' }}>
                        <h2 style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', // Responsive font size
                            fontWeight: '700',
                            letterSpacing: '0.05em',
                            color: '#7FFFD4',
                            textShadow: '0 0 10px rgba(127, 255, 212, 0.5)',
                            marginBottom: '0.5rem'
                        }}>
                            Lost in Space
                        </h2>
                        <p style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: 'clamp(1rem, 3vw, 1.2rem)', // Responsive font size
                            fontWeight: '500',
                            letterSpacing: '0.03em',
                            color: 'rgba(255, 255, 255, 0.6)',
                            marginBottom: '1.5rem',
                            lineHeight: '1.5'
                        }}>
                            No results found for {currentMode}. Try adjusting your filters.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedTags([]);
                                setSelectedPark(null);
                                setSelectedDate(null);
                                setSelectedCamera(null);
                                setSelectedFilm(null);
                                setSelectedOrientation(null);
                                setSelectedAspectRatio(null);
                            }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(127, 255, 212, 0.1)',
                                color: '#7FFFD4',
                                border: '1px solid #7FFFD4',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(127, 255, 212, 0.2)',
                                transition: 'all 0.2s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backdropFilter: 'blur(5px)',
                                margin: '0 auto'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.background = 'rgba(127, 255, 212, 0.2)';
                                e.currentTarget.style.boxShadow = '0 0 30px rgba(127, 255, 212, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.background = 'rgba(127, 255, 212, 0.1)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(127, 255, 212, 0.2)';
                            }}
                        >
                            <FaRocket />
                            Explore PanoSpace
                        </button>
                    </div>
                </div>
            )
        }
        {
            !isSearching && error && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#ff6b6b' }}>
                    <p style={{ marginBottom: '1rem' }}>{error}</p>
                    <button onClick={() => performSearch(false)} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Retry Search
                    </button>
                </div>
            )
        }

        {/* Loading Indicator */}
        {
            isSearching && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(127, 255, 212, 0.1)',
                        borderTop: '3px solid var(--ice-mint)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem auto'
                    }} />
                    <p>Searching...</p>
                    <style>{`
    @keyframes spin {
        0 % { transform: rotate(0deg); }
        100 % { transform: rotate(360deg); }
    }

    /* Mobile Landscape Optimization */
    @media(orientation: landscape) and(max - height: 500px) {
                            .search - header {
    padding: 0.25rem 1rem!important;
}
                            .search - mode - switcher {
    margin - bottom: 0.25rem!important;
}
                            .search - mode - switcher button {
    padding: 0.3rem 0.6rem!important;
    font - size: 0.8rem!important;
}
                            .search - bar - container {
    margin - bottom: 0.25rem!important;
    flex - direction: row!important;
    align - items: center!important;
}
                            .search - bar - container input {
    padding: 0.4rem 1rem 0.4rem 2.5rem!important;
    font - size: 0.85rem!important;
}
                            .search - bar - container label {
    padding: 0.4rem 0.8rem!important;
}
                        }
`}</style>
                </div>
            )
        }

        {/* Twinkle Animation CSS */}
        <style>{`
@keyframes twinkle {
    0 %, 100 % {
        opacity: 0.3;
        transform: scale(1);
    }
    50 % {
        opacity: 1;
        transform: scale(1.2);
    }
}
`}</style>
    </SearchPanels >
);
};

export default Search;
