/**
 * FIRESTORE SEARCH PROVIDER
 * 
 * Fallback search provider using Firestore keyword search
 */

import { db } from '@/core/firebase';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    startAfter
} from 'firebase/firestore';
import { logger } from '@/core/utils/logger';

export class FirestoreProvider {
    constructor() {
        this.enabled = true;
    }

    isEnabled() {
        return this.enabled;
    }

    /**
     * Search with Firestore
     */
    async search(queryText, options = {}) {
        const {
            index = 'posts',
            filters = {},
            sort = 'recent',
            page = 0,
            hitsPerPage = 20
        } = options;

        try {
            // Tokenize search query
            const searchTerms = queryText.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);

            if (searchTerms.length === 0 && !filters.tags && !filters.parkId) {
                // No search criteria
                return this._emptyResults();
            }

            // Use longest term for Firestore query (array-contains limitation)
            const primaryTerm = searchTerms.length > 0
                ? searchTerms.reduce((a, b) => a.length > b.length ? a : b, '')
                : null;

            // Build Firestore query
            const collectionRef = collection(db, index);
            let q;

            if (filters.tags && filters.tags.length > 0) {
                // Tag-based search
                q = query(
                    collectionRef,
                    where('tags', 'array-contains-any', filters.tags.slice(0, 10)),
                    this._getSortOrder(sort),
                    limit(hitsPerPage * 2) // Fetch extra for client-side filtering
                );
            } else if (primaryTerm) {
                // Keyword search
                q = query(
                    collectionRef,
                    where('searchKeywords', 'array-contains', primaryTerm),
                    this._getSortOrder(sort),
                    limit(hitsPerPage * 2)
                );
            } else if (filters.parkId) {
                // Park filter
                q = query(
                    collectionRef,
                    where('parkId', '==', filters.parkId),
                    this._getSortOrder(sort),
                    limit(hitsPerPage * 2)
                );
            } else {
                // General query
                q = query(
                    collectionRef,
                    this._getSortOrder(sort),
                    limit(hitsPerPage)
                );
            }

            const snapshot = await getDocs(q);
            let results = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side filtering
            results = this._applyClientFilters(results, {
                searchTerms,
                filters
            });

            // Pagination
            const start = page * hitsPerPage;
            const paginatedResults = results.slice(start, start + hitsPerPage);

            return {
                hits: paginatedResults,
                nbHits: results.length,
                page,
                nbPages: Math.ceil(results.length / hitsPerPage),
                hitsPerPage,
                query: queryText
            };

        } catch (error) {
            logger.error('Firestore search error:', error);
            throw error;
        }
    }

    /**
     * Get autocomplete suggestions
     */
    async suggest(queryText, options = {}) {
        const { index = 'posts', maxSuggestions = 5 } = options;

        try {
            const searchTerms = queryText.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);
            if (searchTerms.length === 0) {
                return [];
            }

            const primaryTerm = searchTerms[0];
            const collectionRef = collection(db, index);

            const q = query(
                collectionRef,
                where('searchKeywords', 'array-contains', primaryTerm),
                orderBy('createdAt', 'desc'),
                limit(maxSuggestions)
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    text: data.title || data.name || data.displayName,
                    tags: data.tags || [],
                    type: index
                };
            });
        } catch (error) {
            logger.error('Firestore suggest error:', error);
            return [];
        }
    }

    /**
     * Get facet values (limited in Firestore)
     */
    async getFacets(index, facetName) {
        // Firestore doesn't support faceted search natively
        // This would require aggregation queries or pre-computed facets
        logger.warn('Faceted search not supported in Firestore fallback');
        return [];
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            // Try a simple query
            const testQuery = query(collection(db, 'posts'), limit(1));
            await getDocs(testQuery);

            return { status: 'ok', provider: 'firestore' };
        } catch (error) {
            return { status: 'error', provider: 'firestore', error: error.message };
        }
    }

    // ========================================================================
    // PRIVATE METHODS
    // ========================================================================

    _getSortOrder(sort) {
        switch (sort) {
            case 'recent':
                return orderBy('createdAt', 'desc');
            case 'popular':
                return orderBy('likesCount', 'desc');
            case 'trending':
                // Firestore doesn't have a trending field by default
                // Would need to be pre-computed
                return orderBy('likesCount', 'desc');
            default:
                return orderBy('createdAt', 'desc');
        }
    }

    _applyClientFilters(results, { searchTerms, filters }) {
        let filtered = results;

        // Multi-term search (AND logic)
        if (searchTerms && searchTerms.length > 1) {
            filtered = filtered.filter(item => {
                const searchableText = this._getSearchableText(item);
                return searchTerms.every(term => searchableText.includes(term));
            });
        }

        // Location filter
        if (filters.location) {
            const loc = filters.location;
            filtered = filtered.filter(item => {
                const itemLoc = item.location || {};
                return (
                    (loc.city && itemLoc.city?.toLowerCase().includes(loc.city.toLowerCase())) ||
                    (loc.state && itemLoc.state?.toLowerCase().includes(loc.state.toLowerCase())) ||
                    (loc.country && itemLoc.country?.toLowerCase().includes(loc.country.toLowerCase()))
                );
            });
        }

        // Camera filter
        if (filters.camera) {
            filtered = filtered.filter(item =>
                item.camera?.toLowerCase() === filters.camera.toLowerCase()
            );
        }

        // Film filter
        if (filters.film) {
            filtered = filtered.filter(item =>
                item.film?.toLowerCase() === filters.film.toLowerCase()
            );
        }

        // Orientation filter
        if (filters.orientation) {
            filtered = filtered.filter(item =>
                item.orientation === filters.orientation
            );
        }

        // Aspect ratio filter
        if (filters.aspectRatio) {
            filtered = filtered.filter(item =>
                item.aspectRatio === filters.aspectRatio
            );
        }

        // Safe filter
        if (filters.safe !== undefined) {
            filtered = filtered.filter(item => item.safe === filters.safe);
        }

        // Shop enabled filter
        if (filters.shopEnabled !== undefined) {
            filtered = filtered.filter(item => item.shopEnabled === filters.shopEnabled);
        }

        // Date filter
        if (filters.date) {
            const targetDate = new Date(filters.date);
            filtered = filtered.filter(item => {
                if (!item.capturedAt) return false;
                const itemDate = item.capturedAt.toDate ? item.capturedAt.toDate() : new Date(item.capturedAt);
                return (
                    itemDate.getFullYear() === targetDate.getFullYear() &&
                    itemDate.getMonth() === targetDate.getMonth() &&
                    itemDate.getDate() === targetDate.getDate()
                );
            });
        }

        // Following filter
        if (filters.followingIds && filters.followingIds.length > 0) {
            filtered = filtered.filter(item =>
                filters.followingIds.includes(item.uid)
            );
        }

        return filtered;
    }

    _getSearchableText(item) {
        return [
            item.title,
            item.name,
            item.displayName,
            item.username,
            item.authorName,
            item.bio,
            item.description,
            ...(item.tags || []),
            item.location?.city,
            item.location?.state,
            item.location?.country,
            item.parkName,
            item.camera,
            item.film
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
    }

    _emptyResults() {
        return {
            hits: [],
            nbHits: 0,
            page: 0,
            nbPages: 0,
            hitsPerPage: 0,
            query: ''
        };
    }
}

export default FirestoreProvider;
