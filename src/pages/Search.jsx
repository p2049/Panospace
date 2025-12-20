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
import SearchResults from '@/components/search/SearchResults';
import { convertSearchInput } from '@/utils/convertSearchInput';
import { filterVisiblePosts, filterVisibleItems, filterVisibleUsers } from '@/core/utils/filterHelpers';
import { useFeedStore } from '@/core/store/useFeedStore';



const mergeUnique = (existing = [], incoming = []) => {
    const existingIds = new Set(existing.map(i => i.id));
    return [...existing, ...incoming.filter(i => !existingIds.has(i.id))];
};

const searchReducer = (state, action) => {
    switch (action.type) {
        case 'SET_RESULTS':
            // If NOT loading more (i.e., new search), replace results.
            // If loading more, append and deduplicate.
            const isLoadMore = action.isLoadMore;

            return {
                ...state,
                results: {
                    posts: isLoadMore
                        ? mergeUnique(state.results?.posts, action.payload.posts)
                        : (action.payload.posts || []),
                    users: isLoadMore
                        ? mergeUnique(state.results?.users, action.payload.users)
                        : (action.payload.users || []),
                    studios: isLoadMore
                        ? mergeUnique(state.results?.studios, action.payload.studios)
                        : (action.payload.studios || []),
                    collections: isLoadMore
                        ? mergeUnique(state.results?.collections, action.payload.collections)
                        : (action.payload.collections || []),
                    contests: isLoadMore
                        ? mergeUnique(state.results?.contests, action.payload.contests)
                        : (action.payload.contests || []),
                    events: isLoadMore
                        ? mergeUnique(state.results?.events, action.payload.events)
                        : (action.payload.events || []),
                    spacecards: isLoadMore
                        ? mergeUnique(state.results?.spacecards, action.payload.spacecards)
                        : (action.payload.spacecards || []),
                    museums: isLoadMore
                        ? mergeUnique(state.results?.museums, action.payload.museums)
                        : (action.payload.museums || []),
                    text: isLoadMore
                        ? mergeUnique(state.results?.text, action.payload.text)
                        : (action.payload.text || [])
                } || state.results,
                lastPostDoc: action.lastPostDoc !== undefined ? action.lastPostDoc : state.lastPostDoc,
                lastUserDoc: action.lastUserDoc !== undefined ? action.lastUserDoc : state.lastUserDoc,
                lastStudioDoc: action.lastStudioDoc !== undefined ? action.lastStudioDoc : state.lastStudioDoc,
                lastCollectionDoc: action.lastCollectionDoc !== undefined ? action.lastCollectionDoc : state.lastCollectionDoc,
                lastContestDoc: action.lastContestDoc !== undefined ? action.lastContestDoc : state.lastContestDoc,
                lastEventDoc: action.lastEventDoc !== undefined ? action.lastEventDoc : state.lastEventDoc,
                lastSpaceCardDoc: action.lastSpaceCardDoc !== undefined ? action.lastSpaceCardDoc : state.lastSpaceCardDoc,
                lastMuseumDoc: action.lastMuseumDoc !== undefined ? action.lastMuseumDoc : state.lastMuseumDoc,
                lastTextDoc: action.lastTextDoc !== undefined ? action.lastTextDoc : state.lastTextDoc,
                hasMorePosts: action.hasMorePosts !== undefined ? action.hasMorePosts : state.hasMorePosts,
                hasMoreUsers: action.hasMoreUsers !== undefined ? action.hasMoreUsers : state.hasMoreUsers,
                hasMoreStudios: action.hasMoreStudios !== undefined ? action.hasMoreStudios : state.hasMoreStudios,
                hasMoreCollections: action.hasMoreCollections !== undefined ? action.hasMoreCollections : state.hasMoreCollections,
                hasMoreContests: action.hasMoreContests !== undefined ? action.hasMoreContests : state.hasMoreContests,
                hasMoreEvents: action.hasMoreEvents !== undefined ? action.hasMoreEvents : state.hasMoreEvents,
                hasMoreSpaceCards: action.hasMoreSpaceCards !== undefined ? action.hasMoreSpaceCards : state.hasMoreSpaceCards,
                hasMoreMuseums: action.hasMoreMuseums !== undefined ? action.hasMoreMuseums : state.hasMoreMuseums,
                hasMoreText: action.hasMoreText !== undefined ? action.hasMoreText : state.hasMoreText,
            };
        case 'RESET_RESULTS':
            return {
                ...state,
                results: { posts: [], users: [], studios: [], collections: [], museums: [], contests: [], events: [], spacecards: [], text: [] },
                lastPostDoc: null,
                lastUserDoc: null,
                lastStudioDoc: null,
                lastCollectionDoc: null,
                lastContestDoc: null,
                lastEventDoc: null,
                lastSpaceCardDoc: null,
                lastMuseumDoc: null,
                lastTextDoc: null,
                hasMorePosts: true,
                hasMoreUsers: true,
                hasMoreStudios: true,
                hasMoreCollections: true,
                hasMoreContests: true,
                hasMoreEvents: true,
                hasMoreSpaceCards: true,
                hasMoreMuseums: true,
                hasMoreText: true,
            };
        default:
            return state;
    }
};

const initialSearchState = {
    results: { posts: [], users: [], studios: [], collections: [], museums: [], contests: [], events: [], spacecards: [], text: [] },
    lastPostDoc: null,
    lastUserDoc: null,
    lastStudioDoc: null,
    lastCollectionDoc: null,
    lastContestDoc: null,
    lastEventDoc: null,
    lastSpaceCardDoc: null,
    lastTextDoc: null,
    hasMorePosts: true,
    hasMoreUsers: true,
    hasMoreStudios: true,
    hasMoreCollections: true,
    hasMoreContests: true,
    hasMoreEvents: true,

    hasMoreSpaceCards: true,
    hasMoreMuseums: true,
    hasMoreText: true,
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
    const {
        searchDefault,
        currentFeed: searchMode,
        switchToFeed: setSearchMode,
        followingOnly,
        setFollowingOnly
    } = useFeedStore();
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [selectedFilm, setSelectedFilm] = useState(null);
    const [selectedOrientation, setSelectedOrientation] = useState(null);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    // const [searchMode, setSearchMode] = useState(searchDefault || 'social'); // Phase 3: Search Mode State ('art' | 'social')
    const [isMarketplaceMode, setIsMarketplaceMode] = useState(false); // NEW: Marketplace Toggle


    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'feed'
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [isExploreMode, setIsExploreMode] = useState(true);
    const [error, setError] = useState(null);
    const [fallbackResults, setFallbackResults] = useState([]);

    // Mode Switcher State
    const [currentMode, setCurrentMode] = useState(() => {
        const mode = searchParams.get('mode');
        return mode === 'galleries' ? 'studios' : (mode || 'posts');
    }); // 'posts' | 'studios' | 'collections' | 'museums' | 'contests' | 'events' | 'users' | 'spacecards'
    // const [followingOnly, setFollowingOnly] = useState(false);
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
    const { results, lastPostDoc, lastUserDoc, lastStudioDoc, lastCollectionDoc, lastMuseumDoc, lastContestDoc, lastEventDoc, lastSpaceCardDoc, lastTextDoc, hasMorePosts, hasMoreUsers, hasMoreStudios, hasMoreCollections, hasMoreMuseums, hasMoreContests, hasMoreEvents, hasMoreSpaceCards, hasMoreText } = searchState;

    const { searchUsers, searchPosts, searchShopItems, searchStudios, searchCollections, searchContests, searchEvents, searchSpaceCards, loading } = useSearch();
    const { followingList } = useFollowing(currentUser?.uid);
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
    }, [currentMode, followingOnly, searchMode, selectedMuseum, isMarketplaceMode]);

    // Auto-switch View Mode based on currentMode
    useEffect(() => {
        if (currentMode === 'text') {
            setViewMode('feed'); // List View
        } else if (currentMode === 'posts') {
            setViewMode('grid');
        }
    }, [currentMode]);

    // Reset filters when switching away from posts (Fix filter state bugs)
    useEffect(() => {
        if (currentMode !== 'posts' && currentMode !== 'text') {
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
            isMarketplaceMode
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
                currentMode === 'text';

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
                        if (followingOnly && followingList.length === 0) {
                            resultData = [];
                            newLastDoc = null;
                            hasMore = false;
                        } else {
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
                                    postType: 'image', // Handle text mode
                                    type: searchMode // Link search state to backend type filter
                                },
                                isLoadMore ? (currentMode === 'text' ? lastTextDoc : lastPostDoc) : null
                            );
                            // Filter blocked users
                            resultData = data.filter(post => !blockedUsers.has(post.authorId) && !blockedUsers.has(post.userId));
                            newLastDoc = lastDoc;
                            hasMore = data.length > 0;
                        }
                    }
                    break;
                }

                case 'text': {
                    if (followingOnly && followingList.length === 0) {
                        resultData = [];
                        newLastDoc = null;
                        hasMore = false;
                    } else {
                        let searchAuthorIds = followingOnly ? followingList : [];

                        const { data, lastDoc } = await searchPosts(
                            term,
                            {
                                tags: hasFilters ? tags : exploreTags,
                                sort: hasFilters ? currentSortByRef.current : exploreSort,
                                authorIds: searchAuthorIds,
                                postType: 'text',
                                type: 'social' // Text posts are always social type
                            },
                            isLoadMore ? lastTextDoc : null
                        );
                        resultData = data.filter(post => !blockedUsers.has(post.authorId) && !blockedUsers.has(post.userId));
                        newLastDoc = lastDoc;
                        hasMore = data.length > 0;
                    }
                    break;
                }

                case 'users': {
                    let searchUserIds = [];
                    if (selectedMuseum) {
                        const museumMemberIds = selectedMuseum.members || [];
                        if (followingOnly) {
                            // Intersection
                            searchUserIds = followingList.filter(id => museumMemberIds.includes(id));
                            if (searchUserIds.length === 0) searchUserIds = ['NONE']; // Ensure no results if intersection is empty
                        } else {
                            searchUserIds = museumMemberIds;
                        }
                    } else if (followingOnly) {
                        searchUserIds = followingList.length > 0 ? followingList : ['NONE'];
                    }

                    const { data, lastDoc } = await searchUsers(
                        term,
                        { userIds: searchUserIds },
                        isLoadMore ? lastUserDoc : null
                    );
                    // Filter blocked users
                    resultData = data.filter(user => !blockedUsers.has(user.id));

                    newLastDoc = lastDoc;
                    hasMore = data.length > 0;
                    break;
                }

                case 'studios': {
                    const { data, lastDoc } = await searchStudios(
                        term,
                        {
                            tags: tags,
                            studioIds: selectedMuseum ? (selectedMuseum.galleryIds || []) : []
                        },
                        isLoadMore ? lastStudioDoc : null
                    );
                    // Filter blocked users
                    resultData = data.filter(studio => !blockedUsers.has(studio.ownerId));
                    newLastDoc = lastDoc;
                    hasMore = data.length > 0;

                    // Apply Following filter (Added)
                    if (followingOnly) {
                        if (followingList.length > 0) {
                            resultData = resultData.filter(studio => followingList.includes(studio.ownerId));
                        } else {
                            resultData = [];
                        }
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

                    // Apply Following filter (Added)
                    if (followingOnly) {
                        if (followingList.length > 0) {
                            resultData = resultData.filter(collection => followingList.includes(collection.ownerId));
                        } else {
                            resultData = [];
                        }
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

                    // Apply Following filter (Added)
                    if (followingOnly) {
                        if (followingList.length > 0) {
                            resultData = resultData.filter(item => followingList.includes(item.ownerId));
                        } else {
                            resultData = [];
                        }
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

                    // Apply Following filter (Added)
                    if (followingOnly) {
                        if (followingList.length > 0) {
                            resultData = resultData.filter(contest => followingList.includes(contest.hostId) || followingList.includes(contest.ownerId));
                        } else {
                            resultData = [];
                        }
                    }

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

                    // Apply Following filter (Added)
                    if (followingOnly) {
                        if (followingList.length > 0) {
                            resultData = resultData.filter(event => followingList.includes(event.hostId) || followingList.includes(event.ownerId));
                        } else {
                            resultData = [];
                        }
                    }

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

                    // Apply Following filter (Added)
                    if (followingOnly) {
                        if (followingList.length > 0) {
                            resultData = resultData.filter(card => followingList.includes(card.ownerId));
                        } else {
                            resultData = [];
                        }
                    }

                    newLastDoc = lastDoc;
                    hasMore = data.length > 0;
                    break;
                }

                default:
                    break;
            }

            if (!isMountedRef.current || searchRequestId.current !== currentRequestId) return;

            // FALLBACK LOGIC: If no results found for a user query (not load more), fetch generic trending/explore content
            if (resultData.length === 0 && !isLoadMore && currentMode === 'posts') {
                try {
                    // Quick fetch for trending/recent (empty query, no tags)
                    const { data: fallbackData } = await searchPosts('', {
                        sort: 'trending',
                        type: searchMode // Keep art/social context
                    });
                    // Filter blocked
                    const cleanFallback = fallbackData.filter(p => !blockedUsers.has(p.authorId));
                    setFallbackResults(cleanFallback.slice(0, 4)); // Keep it concise
                } catch (e) {
                    console.warn('Failed to load fallback content', e);
                }
            } else if (!isLoadMore) {
                // Clear fallback if we found results or are loading more
                setFallbackResults([]);
            }

            // Build payload based on current mode
            const payload = {
                posts: currentMode === 'posts' ? resultData : [],
                users: currentMode === 'users' ? resultData : [],
                studios: currentMode === 'studios' ? resultData : [],
                collections: currentMode === 'collections' ? resultData : [],
                contests: currentMode === 'contests' ? resultData : [],
                events: currentMode === 'events' ? resultData : [],
                spacecards: currentMode === 'spacecards' ? resultData : [],
                museums: currentMode === 'museums' ? resultData : [],
                text: currentMode === 'text' ? resultData : []
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
                    studios: [...prevResults.studios, ...payload.studios],
                    collections: [...prevResults.collections, ...payload.collections],
                    contests: [...prevResults.contests, ...payload.contests],
                    events: [...prevResults.events, ...payload.events],
                    spacecards: [...prevResults.spacecards, ...payload.spacecards],
                    museums: [...prevResults.museums, ...payload.museums],
                    text: [...prevResults.text, ...payload.text]
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
                    lastPostDoc: currentMode === 'posts' ? newLastDoc : (isLoadMore ? lastPostDoc : null),
                    lastUserDoc: currentMode === 'users' ? newLastDoc : (isLoadMore ? lastUserDoc : null),
                    lastStudioDoc: (currentMode === 'studios' || currentMode === 'galleries') ? newLastDoc : (isLoadMore ? lastStudioDoc : null),
                    lastCollectionDoc: currentMode === 'collections' ? newLastDoc : (isLoadMore ? lastCollectionDoc : null),
                    lastContestDoc: currentMode === 'contests' ? newLastDoc : (isLoadMore ? lastContestDoc : null),
                    lastEventDoc: currentMode === 'events' ? newLastDoc : (isLoadMore ? lastEventDoc : null),
                    lastSpaceCardDoc: currentMode === 'spacecards' ? newLastDoc : (isLoadMore ? lastSpaceCardDoc : null),
                    lastMuseumDoc: currentMode === 'museums' ? newLastDoc : (isLoadMore ? lastMuseumDoc : null),
                    lastTextDoc: currentMode === 'text' ? newLastDoc : (isLoadMore ? lastTextDoc : null),
                },
                hasMoreFlags: {
                    hasMorePosts: currentMode === 'posts' ? hasMore : (isLoadMore ? (hasMorePosts ?? true) : true),
                    hasMoreUsers: currentMode === 'users' ? hasMore : (isLoadMore ? (hasMoreUsers ?? true) : true),
                    hasMoreStudios: (currentMode === 'studios' || currentMode === 'galleries') ? hasMore : (isLoadMore ? (hasMoreStudios ?? true) : true),
                    hasMoreCollections: currentMode === 'collections' ? hasMore : (isLoadMore ? (hasMoreCollections ?? true) : true),
                    hasMoreContests: currentMode === 'contests' ? hasMore : (isLoadMore ? (hasMoreContests ?? true) : true),
                    hasMoreEvents: currentMode === 'events' ? hasMore : (isLoadMore ? (hasMoreEvents ?? true) : true),
                    hasMoreSpaceCards: currentMode === 'spacecards' ? hasMore : (isLoadMore ? (hasMoreSpaceCards ?? true) : true),
                    hasMoreMuseums: currentMode === 'museums' ? hasMore : (isLoadMore ? (hasMoreMuseums ?? true) : true),
                    hasMoreText: currentMode === 'text' ? hasMore : (isLoadMore ? (hasMoreText ?? true) : true),
                }
            };

            dispatch({
                type: 'SET_RESULTS',
                payload,
                isLoadMore,
                lastPostDoc: currentMode === 'posts' ? newLastDoc : lastPostDoc,
                lastUserDoc: currentMode === 'users' ? newLastDoc : lastUserDoc,
                lastStudioDoc: currentMode === 'studios' ? newLastDoc : lastStudioDoc,
                lastCollectionDoc: currentMode === 'collections' ? newLastDoc : lastCollectionDoc,
                lastContestDoc: currentMode === 'contests' ? newLastDoc : lastContestDoc,
                lastEventDoc: currentMode === 'events' ? newLastDoc : lastEventDoc,
                lastSpaceCardDoc: currentMode === 'spacecards' ? newLastDoc : lastSpaceCardDoc,
                hasMorePosts: currentMode === 'posts' ? hasMore : hasMorePosts,
                hasMoreUsers: currentMode === 'users' ? hasMore : hasMoreUsers,
                hasMoreStudios: currentMode === 'studios' ? hasMore : hasMoreStudios,
                hasMoreCollections: currentMode === 'collections' ? hasMore : hasMoreCollections,
                hasMoreContests: currentMode === 'contests' ? hasMore : hasMoreContests,
                hasMoreEvents: currentMode === 'events' ? hasMore : hasMoreEvents,
                hasMoreSpaceCards: currentMode === 'spacecards' ? hasMore : hasMoreSpaceCards,
                hasMoreMuseums: currentMode === 'museums' ? hasMore : hasMoreMuseums,
                hasMoreText: currentMode === 'text' ? hasMore : hasMoreText,
                lastMuseumDoc: currentMode === 'museums' ? newLastDoc : lastMuseumDoc,
                lastTextDoc: currentMode === 'text' ? newLastDoc : lastTextDoc,
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
    }, [currentMode, followingOnly, followingList, searchUsers, searchPosts, searchShopItems, searchStudios, searchCollections, searchContests, searchEvents, searchSpaceCards, lastPostDoc, lastUserDoc, lastStudioDoc, lastCollectionDoc, lastMuseumDoc, lastContestDoc, lastEventDoc, lastSpaceCardDoc, lastTextDoc, hasMorePosts, hasMoreUsers, hasMoreStudios, hasMoreCollections, hasMoreMuseums, hasMoreContests, hasMoreEvents, hasMoreSpaceCards, hasMoreText, recommendations, blockedUsers, selectedMuseum, searchMode, isMarketplaceMode]);

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

                // Determine current mode state
                const currentHasMore =
                    currentMode === 'posts' ? hasMorePosts :
                        currentMode === 'text' ? hasMoreText :
                            currentMode === 'users' ? hasMoreUsers :
                                currentMode === 'studios' ? hasMoreStudios :
                                    currentMode === 'collections' ? hasMoreCollections :
                                        currentMode === 'museums' ? hasMoreMuseums :
                                            currentMode === 'contests' ? hasMoreContests :
                                                currentMode === 'events' ? hasMoreEvents :
                                                    currentMode === 'spacecards' ? hasMoreSpaceCards : false;

                const currentResultsCount =
                    currentMode === 'posts' ? (results?.posts?.length || 0) :
                        currentMode === 'text' ? (results?.text?.length || 0) :
                            currentMode === 'users' ? (results?.users?.length || 0) :
                                (currentMode === 'studios' || currentMode === 'galleries') ? (results?.studios?.length || 0) :
                                    currentMode === 'collections' ? (results?.collections?.length || 0) :
                                        currentMode === 'museums' ? (results?.museums?.length || 0) :
                                            currentMode === 'contests' ? (results?.contests?.length || 0) :
                                                currentMode === 'events' ? (results?.events?.length || 0) :
                                                    currentMode === 'spacecards' ? (results?.spacecards?.length || 0) : 0;

                // Prefetch if near bottom, not already loading, and has more results
                if (scrollPosition >= threshold && !loading && currentHasMore && currentResultsCount > 0) {
                    performSearch(true); // Load more
                }
            }, 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (prefetchTimer) clearTimeout(prefetchTimer);
        };
    }, [loading, hasMorePosts, hasMoreText, hasMoreUsers, hasMoreStudios, hasMoreCollections, hasMoreMuseums, hasMoreContests, hasMoreEvents, hasMoreSpaceCards, results, currentMode, performSearch]);

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
                currentMode === 'posts' ? (results?.posts?.length || 0) :
                    currentMode === 'users' ? (results?.users?.length || 0) :
                        (currentMode === 'studios' || currentMode === 'galleries') ? (results?.studios?.length || 0) :
                            currentMode === 'collections' ? (results?.collections?.length || 0) :
                                currentMode === 'contests' ? (results?.contests?.length || 0) :
                                    currentMode === 'events' ? (results?.events?.length || 0) :
                                        currentMode === 'spacecards' ? (results?.spacecards?.length || 0) :
                                            currentMode === 'museums' ? (results?.museums?.length || 0) :
                                                currentMode === 'text' ? (results?.text?.length || 0) : 0
            }
            currentMode={currentMode}
            isMobileFiltersOpen={isMobileFiltersOpen}
            onMobileFilterToggle={setIsMobileFiltersOpen}
            isMobile={isMobile}
            onScroll={handleScroll}
            isMarketplaceMode={isMarketplaceMode} // NEW: Pass to Panels
            onMarketplaceToggle={setIsMarketplaceMode} // NEW: Pass to Panels
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
                fallbackResults={fallbackResults}
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