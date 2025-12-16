import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSearch, SEARCH_CACHE } from '@/hooks/useSearch';
import { useFollowing } from '@/hooks/useFollowing';
import { useBlock } from '@/hooks/useBlock';
import { getRecommendations } from '@/core/utils/recommendations';
import MarketLayoutWrapper from '@/components/marketplace/MarketLayoutWrapper';
import MarketHeader from '@/components/marketplace/MarketHeader';
import MarketResults from '@/components/marketplace/MarketResults';
import { convertSearchInput } from '@/utils/convertSearchInput';

// Simplified Reducer for Market
const searchReducer = (state, action) => {
    switch (action.type) {
        case 'SET_RESULTS':
            return {
                ...state,
                results: action.isLoadMore
                    ? {
                        posts: [...state.results.posts, ...action.payload.posts], // Store shop items in 'posts' array for compatibility
                    }
                    : action.payload,
                lastDoc: action.lastDoc !== undefined ? action.lastDoc : state.lastDoc,
                hasMore: action.hasMore !== undefined ? action.hasMore : state.hasMore,
            };
        case 'RESET_RESULTS':
            return {
                ...state,
                results: { posts: [] },
                lastDoc: null,
                hasMore: true,
            };
        default:
            return state;
    }
};

const initialSearchState = {
    results: { posts: [] },
    lastDoc: null,
    hasMore: true,
};

const CardMarketplace = () => {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    // Market Specific Filters
    const [shopCategory, setShopCategory] = useState('print');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);
    const [followingOnly, setFollowingOnly] = useState(false);

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);

    // Header Visibility
    const [headerVisible, setHeaderVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const lastScrollY = useRef(0);

    const [searchState, dispatch] = useReducer(searchReducer, initialSearchState);
    const { results, lastDoc, hasMore } = searchState;

    const { searchShopItems, loading } = useSearch();
    const { followingList } = useFollowing(currentUser?.uid);
    const { blockedUsers } = useBlock();

    const isMountedRef = useRef(true);
    const isLoadingRef = useRef(false);
    const searchRequestId = useRef(0);

    // Refs for current state to use in async calls
    const currentSearchTermRef = useRef(searchTerm);
    const currentShopCategoryRef = useRef(shopCategory);
    const currentSelectedTagsRef = useRef(selectedTags);
    const currentSelectedSizeRef = useRef(selectedSize);
    const currentSelectedTypeRef = useRef(selectedType);
    const currentSortByRef = useRef(sortBy);

    // Mobile check
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < 10) setHeaderVisible(true);
            else if (currentScrollY > lastScrollY.current && currentScrollY > 100) setHeaderVisible(false);
            else if (currentScrollY < lastScrollY.current) setHeaderVisible(true);
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Update Refs
    useEffect(() => {
        currentSearchTermRef.current = searchTerm;
        currentShopCategoryRef.current = shopCategory;
        currentSelectedTagsRef.current = selectedTags;
        currentSelectedSizeRef.current = selectedSize;
        currentSelectedTypeRef.current = selectedType;
        currentSortByRef.current = sortBy;
    }, [searchTerm, shopCategory, selectedTags, selectedSize, selectedType, sortBy]);

    // Cleanup
    useEffect(() => {
        return () => { isMountedRef.current = false; };
    }, []);

    // Perform Search
    const performSearch = useCallback(async (isLoadMore = false) => {
        if (!isMountedRef.current) return;
        if (isLoadingRef.current && !isLoadMore) return;

        const currentRequestId = ++searchRequestId.current;
        const term = convertSearchInput(currentSearchTermRef.current);
        const tags = currentSelectedTagsRef.current; // Array

        // Cache Key (Market Specific)
        const cacheKey = JSON.stringify({
            mode: 'market',
            term,
            category: currentShopCategoryRef.current,
            tags,
            size: currentSelectedSizeRef.current,
            type: currentSelectedTypeRef.current,
            sortBy: currentSortByRef.current,
            followingOnly
        });

        // Cache Check
        if (!isLoadMore && SEARCH_CACHE[cacheKey]) {
            dispatch({
                type: 'SET_RESULTS',
                payload: SEARCH_CACHE[cacheKey].results,
                isLoadMore: false,
                lastDoc: SEARCH_CACHE[cacheKey].lastDoc,
                hasMore: SEARCH_CACHE[cacheKey].hasMore
            });
            setIsSearching(false);
            setHasSearched(true);
            return;
        }

        if (!isLoadMore) {
            setIsSearching(true);
            setHasSearched(true);
            setError(null);
        }
        isLoadingRef.current = true;

        try {
            // AUTHOR IDS for "Added" filter
            let searchAuthorIds = [];
            if (followingOnly && followingList.length > 0) {
                searchAuthorIds = followingList;
            }

            const { data, lastDoc: newLastDoc } = await searchShopItems(
                term,
                {
                    shopCategory: currentShopCategoryRef.current,
                    tags,
                    sort: currentSortByRef.current,
                    size: currentSelectedSizeRef.current,
                    type: currentSelectedTypeRef.current,
                    authorIds: searchAuthorIds
                },
                isLoadMore ? lastDoc : null
            );

            // Filter blocked users
            const resultData = data.filter(item => !blockedUsers.has(item.ownerId));

            if (!isMountedRef.current || searchRequestId.current !== currentRequestId) return;

            const payload = { posts: resultData }; // Reuse 'posts' key for SearchResults compatibility
            const hasMoreData = resultData.length > 0;

            // Update Cache (Simplistic)
            let finalResults = payload;
            if (isLoadMore && SEARCH_CACHE[cacheKey]) {
                finalResults = { posts: [...SEARCH_CACHE[cacheKey].results.posts, ...payload.posts] };
            }
            SEARCH_CACHE[cacheKey] = {
                results: finalResults,
                lastDoc: newLastDoc,
                hasMore: hasMoreData
            };

            dispatch({
                type: 'SET_RESULTS',
                payload,
                isLoadMore,
                lastDoc: newLastDoc,
                hasMore: hasMoreData
            });

        } catch (err) {
            console.error('Market search error:', err);
            setError('Failed to load market items.');
        } finally {
            if (isMountedRef.current) setIsSearching(false);
            isLoadingRef.current = false;
        }

    }, [searchShopItems, followingOnly, followingList, blockedUsers, lastDoc]);

    // Trigger Search on Filter Change
    useEffect(() => {
        // Debounce search term changes
        const timer = setTimeout(() => {
            dispatch({ type: 'RESET_RESULTS' });
            performSearch(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, shopCategory, selectedTags, selectedSize, selectedType, sortBy, followingOnly]);


    // Infinite Scroll
    useEffect(() => {
        let prefetchTimer = null;
        const handleScroll = () => {
            if (prefetchTimer) clearTimeout(prefetchTimer);
            prefetchTimer = setTimeout(() => {
                const scrollPosition = window.innerHeight + window.scrollY;
                const documentHeight = document.documentElement.scrollHeight;
                if (scrollPosition >= documentHeight - 800 && !loading && hasMore && results.posts.length > 0) {
                    performSearch(true);
                }
            }, 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (prefetchTimer) clearTimeout(prefetchTimer);
        };
    }, [loading, hasMore, results.posts.length, performSearch]);

    const handleTagToggle = (tag) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setShopCategory('print');
        setSelectedTags([]);
        setSelectedSize('');
        setSelectedType('');
        setSortBy('newest');
        setFollowingOnly(false);
        dispatch({ type: 'RESET_RESULTS' });
    };

    return (
        <MarketLayoutWrapper
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearAll={clearAllFilters}
            resultsCount={results.posts.length}
            isMobileFiltersOpen={isMobileFiltersOpen}
            onMobileFilterToggle={setIsMobileFiltersOpen}
            isMobile={isMobile}
            isStandalone={true}
        >
            <MarketHeader
                isMobile={isMobile}
                headerVisible={headerVisible}
                isStandalone={true}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                currentMode="posts"
                setCurrentMode={() => { }}
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

                searchMode="art"
                setSearchMode={() => { }}

                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                shopCategory={shopCategory}
                setShopCategory={setShopCategory}

                hasActiveFilters={searchTerm || selectedTags.length > 0 || selectedSize || selectedType}
            />
            <MarketResults
                viewMode={viewMode}
                currentMode="posts"
                results={results}
                isMobile={isMobile}
                isSearching={isSearching}
                hasSearched={hasSearched}
                error={error}
                performSearch={performSearch}
                setSearchTerm={setSearchTerm}
            />
        </MarketLayoutWrapper>
    );
};

export default CardMarketplace;
