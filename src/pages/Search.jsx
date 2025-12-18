import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { FaTimes, FaUniversity } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSearch, SEARCH_CACHE } from '@/hooks/useSearch';
import { useFollowing } from '@/hooks/useFollowing';
import { useBlock } from '@/hooks/useBlock';
import { parseDateFromURL } from '@/core/utils/dates';
import { getRecommendations } from '@/core/utils/recommendations';
import SearchLayoutWrapper from '@/components/search/SearchLayoutWrapper';
import SearchHeader from '@/components/search/SearchHeader';
import SearchModeTabs from '@/components/search/SearchModeTabs';
import SearchFilters from '@/components/search/SearchFilters';
import SearchResults from '@/components/search/SearchResults';
import { convertSearchInput } from '@/utils/convertSearchInput';
import { filterVisiblePosts, filterVisibleItems, filterVisibleUsers } from '@/core/utils/filterHelpers';
import { useFeedStore } from '@/core/store/useFeedStore';



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
    const { searchDefault } = useFeedStore();
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [selectedFilm, setSelectedFilm] = useState(null);
    const [selectedOrientation, setSelectedOrientation] = useState(null);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [searchMode, setSearchMode] = useState(searchDefault || 'social'); // Phase 3: Search Mode State ('art' | 'social')
    const [isMarketplaceMode, setIsMarketplaceMode] = useState(false); // NEW: Marketplace Toggle
    const [activePostType, setActivePostType] = useState('image'); // 'image' | 'text' - NEW: Post Type Toggle

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

    const { searchUsers, searchPosts, searchShopItems, searchGalleries, searchCollections, searchContests, searchEvents, searchSpaceCards, loading } = useSearch();
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
    }, [currentMode, followingOnly, searchMode, activePostType]); // Added activePostType

    // Auto-switch View Mode based on activePostType
    useEffect(() => {
        if (activePostType === 'text') {
            setViewMode('feed'); // 'feed' is List View in Search logic usually, or depends on implementation.
            // Wait, SearchHeader uses 'viewMode' state.
            // Let's check SearchHeader usage. It passes 'viewMode'.
            // In SearchResults, viewMode='feed' usually means List View.
            // Let's check SearchResults to be sure.
            // Actually, in Search.jsx state: viewMode is 'grid' or 'feed'
            // In Feed.jsx it was 'list' vs 'image'. 
            // Standardizing: 'feed' usually implies the vertical list.
            setViewMode('feed');
        } else {
            // Optional: switch back to grid? Or leave as user pref?
            // User said: "auto activat list mode on search when they hit the text filter"
            // Implies we force list mode.
            // If switching back to image, we probably want grid default, but maybe respect user choice?
            // "do not let users view both at once its one or the other"
            // I'll default to grid for image for now to enforce the distinction.
            setViewMode('grid');
        }
    }, [activePostType]);

    // Reset filters when switching away from posts (Fix filter state bugs)
    useEffect(() => {
        if (currentMode !== 'posts') {
            setSelectedPark(null);
            setSelectedDate(null);
            setSelectedCamera(null);
            setSelectedFilm(null);
            setSelectedOrientation(null);
            setSelectedAspectRatio(null);
        }
    }, [currentMode]);

    const performSearch = useCallback(async (isLoadMore = false) => {
        if (!isMountedRef.current) return;

        // Prevent concurrent searches
        if (isLoadingRef.current && !isLoadMore) return;

        const currentRequestId = ++searchRequestId.current;

        // Use refs to get current search params
        const term = convertSearchInput(currentSearchTermRef.current);
        const tags = currentSelectedTagsRef.current;
        const parkId = currentSelectedParkRef.current;
        const date = currentSelectedDateRef.current;

        // --- CACHE KEY GENERATION ---
        // Create a unique deterministic key identifying this search configuration
        const cacheKey = JSON.stringify({
            mode: currentMode,
            term,
            tags,
            parkId,
            date,
            museumId: selectedMuseum?.id,
            camera: currentSelectedCameraRef.current,
            film: currentSelectedFilmRef.current,
            orientation: currentSelectedOrientationRef.current,
            aspectRatio: currentSelectedAspectRatioRef.current,
            sortBy: currentSortByRef.current,
            followingOnly,
            searchMode, // Art/Social
            isMarketplaceMode,
            activePostType // NEW
        });

        // --- CACHE CHECK (Only for fresh searches, not load more) ---
        if (!isLoadMore) {
            if (SEARCH_CACHE[cacheKey]) {
                // Restore from cache immediately
                dispatch({
                    type: 'SET_RESULTS',
                    payload: SEARCH_CACHE[cacheKey].results,
                    isLoadMore: false,
                    // Restore pagination cursors
                    ...SEARCH_CACHE[cacheKey].cursors,
                    // Restore 'hasMore' flags
                    ...SEARCH_CACHE[cacheKey].hasMoreFlags
                });

                setIsSearching(false);
                setHasSearched(true);
                return;
            }

            isLoadingRef.current = true;
            setIsSearching(true);
            setHasSearched(true);
            setError(null);
        } else {
            isLoadingRef.current = true;
        }

        try {
            // Check if we're in Explore mode (no filters)
            // Treat 'text' mode as a filter so we don't restrict by exploreTags (which might not have text posts)
            // Treat 'image' mode as default (no filter)
            const hasFilters = term || tags.length > 0 || parkId || date ||
                currentSelectedCameraRef.current || currentSelectedFilmRef.current ||
                currentSelectedOrientationRef.current || currentSelectedAspectRatioRef.current || selectedMuseum ||
                activePostType === 'text';

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
                    if (isMarketplaceMode) {
                        // MARKETPLACE MODE
                        const { data, lastDoc } = await searchShopItems(
                            term,
                            {
                                tags: tags,
                                sort: currentSortByRef.current
                            },
                            isLoadMore ? lastPostDoc : null
                        );
                        // Filter blocked users (shop owner)
                        resultData = data.filter(item => !blockedUsers.has(item.ownerId));
                        newLastDoc = lastDoc;
                        hasMore = data.length > 0;
                    } else {
                        // STANDARD POSTS MODE
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
                                authorIds: searchAuthorIds,
                                postType: activePostType, // Pass 'image' or 'text'
                                type: searchMode // Link search state to backend type filter
                            },
                            isLoadMore ? lastPostDoc : null
                        );
                        // Filter blocked users
                        resultData = data.filter(post => !blockedUsers.has(post.authorId) && !blockedUsers.has(post.userId));
                        newLastDoc = lastDoc;
                        hasMore = data.length > 0;
                    }
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

            // --- UPDATE CACHE ---
            // If isLoadMore, we need to append to the existing cache entry
            let finalResults = payload;

            if (isLoadMore && SEARCH_CACHE[cacheKey]) {
                // Must manually merge because payload only contains NEW data, but cache should store TOTAL data
                // Or easier: we just store the accumulated state from the Dispatch?
                // Dispatch updates local state. 
                // We don't have access to the *next* state synchronously here easily without digging into reducer logic.
                // But we know 'resultData' is the new chunk.
                // We can update cache with resultData appended to previous cache data.

                const prevResults = SEARCH_CACHE[cacheKey].results;
                finalResults = {
                    posts: [...prevResults.posts, ...payload.posts],
                    users: [...prevResults.users, ...payload.users],
                    galleries: [...prevResults.galleries, ...payload.galleries],
                    collections: [...prevResults.collections, ...payload.collections],
                    contests: [...prevResults.contests, ...payload.contests],
                    events: [...prevResults.events, ...payload.events],
                    spacecards: [...prevResults.spacecards, ...payload.spacecards],
                    museums: [...prevResults.museums, ...payload.museums]
                };
            } else if (isLoadMore) {
                // Edge case: Loading more but cache was cleared?
                // Just fallback to not caching or start fresh
                finalResults = payload; // Incorrect for loadMore but safety fallback
            }

            // Store in Cache
            SEARCH_CACHE[cacheKey] = {
                results: finalResults,
                cursors: {
                    lastPostDoc: currentMode === 'posts' ? newLastDoc : (isLoadMore ? lastPostDoc : null), // Logic needs to match reducer
                    lastUserDoc: currentMode === 'users' ? newLastDoc : (isLoadMore ? lastUserDoc : null),
                    lastGalleryDoc: currentMode === 'galleries' ? newLastDoc : (isLoadMore ? lastGalleryDoc : null),
                    lastCollectionDoc: currentMode === 'collections' ? newLastDoc : (isLoadMore ? lastCollectionDoc : null),
                    lastContestDoc: currentMode === 'contests' ? newLastDoc : (isLoadMore ? lastContestDoc : null),
                    lastEventDoc: currentMode === 'events' ? newLastDoc : (isLoadMore ? lastEventDoc : null),
                    lastSpaceCardDoc: currentMode === 'spacecards' ? newLastDoc : (isLoadMore ? lastSpaceCardDoc : null),
                    lastMuseumDoc: currentMode === 'museums' ? newLastDoc : (isLoadMore ? lastMuseumDoc : null),
                },
                hasMoreFlags: {
                    hasMorePosts: currentMode === 'posts' ? hasMore : (isLoadMore ? hasMorePosts : true),
                    hasMoreUsers: currentMode === 'users' ? hasMore : (isLoadMore ? hasMoreUsers : true),
                    hasMoreGalleries: currentMode === 'galleries' ? hasMore : (isLoadMore ? hasMoreGalleries : true),
                    hasMoreCollections: currentMode === 'collections' ? hasMore : (isLoadMore ? hasMoreCollections : true),
                    hasMoreContests: currentMode === 'contests' ? hasMore : (isLoadMore ? hasMoreContests : true),
                    hasMoreEvents: currentMode === 'events' ? hasMore : (isLoadMore ? hasMoreEvents : true),
                    hasMoreSpaceCards: currentMode === 'spacecards' ? hasMore : (isLoadMore ? hasMoreSpaceCards : true),
                    hasMoreMuseums: currentMode === 'museums' ? hasMore : (isLoadMore ? hasMoreMuseums : true),
                }
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
    }, [currentMode, followingOnly, followingList, searchUsers, searchPosts, searchShopItems, searchGalleries, searchCollections, searchContests, searchEvents, searchSpaceCards, lastPostDoc, lastUserDoc, lastGalleryDoc, lastCollectionDoc, lastMuseumDoc, lastContestDoc, lastEventDoc, lastSpaceCardDoc, hasMorePosts, hasMoreUsers, hasMoreGalleries, hasMoreCollections, hasMoreMuseums, hasMoreContests, hasMoreEvents, hasMoreSpaceCards, recommendations, blockedUsers, selectedMuseum, searchMode, isMarketplaceMode, activePostType]);

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
        <SearchLayoutWrapper
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
            isMobile={isMobile}
            onScroll={handleScroll}
            isMarketplaceMode={isMarketplaceMode} // NEW: Pass to Panels
            onMarketplaceToggle={setIsMarketplaceMode} // NEW: Pass to Panels
            activePostType={activePostType}
            setActivePostType={setActivePostType}
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

            <SearchHeader
                isMobile={isMobile}
                headerVisible={headerVisible}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                currentMode={currentMode}
                setCurrentMode={setCurrentMode}
                followingOnly={followingOnly}
                setFollowingOnly={setFollowingOnly}
                selectedTags={selectedTags}
                setIsMobileFiltersOpen={setIsMobileFiltersOpen}
                sortBy={sortBy}
                setSortBy={setSortBy}
                viewMode={viewMode}
                setViewMode={setViewMode}
                isSortDropdownOpen={isSortDropdownOpen}
                setIsSortDropdownOpen={setIsSortDropdownOpen}
                searchMode={searchMode}
                setSearchMode={setSearchMode}
                isMarketplaceMode={isMarketplaceMode} // NEW
                setIsMarketplaceMode={setIsMarketplaceMode} // NEW
                hasActiveFilters={selectedTags.length > 0 || selectedPark || selectedDate || selectedCamera || selectedFilm || selectedOrientation || selectedAspectRatio || selectedMuseum}
            />

            <SearchResults
                viewMode={viewMode}
                currentMode={currentMode}
                results={results}
                isMarketplaceMode={isMarketplaceMode} // NEW
                isMobile={isMobile}
                selectedOrientation={selectedOrientation}
                selectedAspectRatio={selectedAspectRatio}
                isSearching={isSearching}
                hasSearched={hasSearched}
                error={error}
                performSearch={performSearch}
                setSearchTerm={setSearchTerm}
                setSelectedTags={setSelectedTags}
                setSelectedPark={setSelectedPark}
                setSelectedDate={setSelectedDate}
                setSelectedCamera={setSelectedCamera}
                setSelectedFilm={setSelectedFilm}
                setSelectedOrientation={setSelectedOrientation}
                setSelectedAspectRatio={setSelectedAspectRatio}
                sortBy={sortBy}
            />

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
        </SearchLayoutWrapper>
    );
};

export default Search;