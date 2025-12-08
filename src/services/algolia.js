// Algolia Search Integration for PanoSpace
// Provides client-side search functionality with fallback to Firestore

import algoliasearch from 'algoliasearch/lite';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

// Algolia configuration (set these in .env)
const ALGOLIA_APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID || '';
const ALGOLIA_SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY || ''; // Use search-only API key
const ALGOLIA_INDEX_NAME = 'posts';

let algoliaClient = null;
let algoliaIndex = null;
let algoliaEnabled = false;

// Initialize Algolia if credentials are provided
if (ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY) {
    try {
        algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
        algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);
        algoliaEnabled = true;
        console.log('Algolia search enabled');
    } catch (error) {
        console.error('Failed to initialize Algolia:', error);
        algoliaEnabled = false;
    }
} else {
    console.warn('Algolia not configured - using Firestore fallback for search');
}

/**
 * Search posts using Algolia or Firestore fallback
 * @param {string} searchQuery - Text to search for
 * @param {Object} filters - Additional filters (location, tags, etc.)
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} - Array of post IDs matching the search
 */
export const searchPosts = async (searchQuery, filters = {}, maxResults = 20) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
        return [];
    }

    // Use Algolia if available
    if (algoliaEnabled && algoliaIndex) {
        return await searchWithAlgolia(searchQuery, filters, maxResults);
    }

    // Fallback to Firestore keyword search
    return await searchWithFirestore(searchQuery, filters, maxResults);
};

/**
 * Search using Algolia (fuzzy, full-text search)
 */
const searchWithAlgolia = async (searchQuery, filters, maxResults) => {
    try {
        const searchFilters = [];

        // Add location filter if provided
        if (filters.location) {
            searchFilters.push(
                `location.city:"${filters.location}" OR location.state:"${filters.location}" OR location.country:"${filters.location}"`
            );
        }

        // Add tags filter if provided
        if (filters.tags && filters.tags.length > 0) {
            const tagFilters = filters.tags.map(tag => `tags:"${tag}"`).join(' OR ');
            searchFilters.push(`(${tagFilters})`);
        }

        const searchParams = {
            hitsPerPage: maxResults,
            attributesToRetrieve: ['objectID', 'postId'],
        };

        if (searchFilters.length > 0) {
            searchParams.filters = searchFilters.join(' AND ');
        }

        const { hits } = await algoliaIndex.search(searchQuery, searchParams);

        // Return post IDs
        return hits.map(hit => hit.postId || hit.objectID);
    } catch (error) {
        console.error('Algolia search error:', error);
        // Fallback to Firestore if Algolia fails
        return await searchWithFirestore(searchQuery, filters, maxResults);
    }
};

/**
 * Search using Firestore (keyword-based search with client-side filtering)
 */
const searchWithFirestore = async (searchQuery, filters, maxResults) => {
    try {
        // Generate search keywords from query
        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);

        if (searchTerms.length === 0) {
            return [];
        }

        // Use the longest term for Firestore query
        const primaryTerm = searchTerms.reduce((a, b) => a.length > b.length ? a : b, '');

        // Query Firestore
        const postsQuery = query(
            collection(db, 'posts'),
            where('searchKeywords', 'array-contains', primaryTerm),
            orderBy('createdAt', 'desc'),
            limit(maxResults * 2) // Fetch more for client-side filtering
        );

        const snapshot = await getDocs(postsQuery);
        let posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side filtering for multi-term AND logic
        if (searchTerms.length > 1) {
            posts = posts.filter(post => {
                const searchableText = [
                    post.title,
                    post.authorName,
                    ...(post.tags || []),
                    post.location?.city,
                    post.location?.state,
                    post.location?.country
                ].filter(Boolean).join(' ').toLowerCase();

                return searchTerms.every(term => searchableText.includes(term));
            });
        }

        // Apply location filter
        if (filters.location) {
            const locTerm = filters.location.toLowerCase();
            posts = posts.filter(post =>
                (post.location?.city?.toLowerCase() || '').includes(locTerm) ||
                (post.location?.state?.toLowerCase() || '').includes(locTerm) ||
                (post.location?.country?.toLowerCase() || '').includes(locTerm)
            );
        }

        // Apply tags filter
        if (filters.tags && filters.tags.length > 0) {
            posts = posts.filter(post =>
                filters.tags.some(tag =>
                    post.tags?.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
                )
            );
        }

        // Return post IDs
        return posts.slice(0, maxResults).map(post => post.id);
    } catch (error) {
        console.error('Firestore search error:', error);
        return [];
    }
};

/**
 * Check if Algolia is enabled
 */
export const isAlgoliaEnabled = () => algoliaEnabled;

/**
 * Get search suggestions (for autocomplete)
 */
export const getSearchSuggestions = async (searchQuery, maxSuggestions = 5) => {
    if (!algoliaEnabled || !algoliaIndex) {
        return [];
    }

    try {
        const { hits } = await algoliaIndex.search(searchQuery, {
            hitsPerPage: maxSuggestions,
            attributesToRetrieve: ['title', 'tags', 'authorName'],
        });

        return hits.map(hit => ({
            title: hit.title,
            tags: hit.tags || [],
            author: hit.authorName
        }));
    } catch (error) {
        console.error('Error getting search suggestions:', error);
        return [];
    }
};

export default {
    searchPosts,
    isAlgoliaEnabled,
    getSearchSuggestions
};
