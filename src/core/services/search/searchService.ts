/**
 * SEARCH SERVICE (Unified)
 * 
 * Centralized search interface aggregating Algolia, Firestore, and Edge Cache.
 * Migrated from: src/core/services/firestore/search.service.ts
 */

import { SEARCH_STRATEGY, CACHE_CONFIG } from './searchConfig';
import { AlgoliaProvider } from './providers/AlgoliaProvider';
import { FirestoreProvider } from './providers/FirestoreProvider';
import { CacheProvider } from './providers/CacheProvider';

class SearchService {
    algolia: any;
    firestore: any;
    cache: any;
    strategy: any;
    fallbackEnabled: boolean;
    cacheEnabled: boolean;
    metrics: any;

    constructor() {
        this.algolia = new AlgoliaProvider();
        this.firestore = new FirestoreProvider();
        this.cache = new CacheProvider(CACHE_CONFIG.HOT_QUERIES);

        this.strategy = SEARCH_STRATEGY.PRIMARY;
        this.fallbackEnabled = true;
        this.cacheEnabled = true;

        // Metrics
        this.metrics = {
            totalSearches: 0,
            cacheHits: 0,
            algoliaSearches: 0,
            firestoreSearches: 0,
            avgQueryTime: 0,
            errors: []
        };
    }

    /**
     * Universal search method
     */
    async search(queryStr: string, options: any = {}) {
        const startTime = Date.now();
        this.metrics.totalSearches++;

        const {
            index = 'posts',
            filters = {},
            sort = 'relevance',
            page = 0,
            hitsPerPage = 20,
            facets = [],
            userId = null
        } = options;

        try {
            // 1. Check cache first
            if (this.cacheEnabled) {
                const cacheKey = this._generateCacheKey(queryStr, options);
                const cached = await this.cache.get(cacheKey);

                if (cached) {
                    this.metrics.cacheHits++;
                    return {
                        ...cached,
                        source: 'cache',
                        queryTime: Date.now() - startTime
                    };
                }
            }

            // 2. Try Algolia (primary)
            if (this.strategy === 'algolia' && this.algolia.isEnabled()) {
                try {
                    const results = await this.algolia.search(queryStr, {
                        index,
                        filters,
                        sort,
                        page,
                        hitsPerPage,
                        facets
                    });

                    this.metrics.algoliaSearches++;

                    // Cache successful results
                    if (this.cacheEnabled && results.hits.length > 0) {
                        const cacheKey = this._generateCacheKey(queryStr, options);
                        await this.cache.set(cacheKey, results);
                    }

                    // Track user search history
                    if (userId) {
                        await this._trackSearchHistory(userId, queryStr, results.hits.length);
                    }

                    return {
                        ...results,
                        source: 'algolia',
                        queryTime: Date.now() - startTime
                    };
                } catch (error: any) {
                    console.error('Algolia search failed:', error);
                    this.metrics.errors.push({
                        provider: 'algolia',
                        error: error.message,
                        timestamp: Date.now()
                    });

                    // Fall through to Firestore
                    if (!this.fallbackEnabled) {
                        throw error;
                    }
                }
            }

            // 3. Fallback to Firestore
            const results = await this.firestore.search(queryStr, {
                index,
                filters,
                sort,
                page,
                hitsPerPage
            });

            this.metrics.firestoreSearches++;

            return {
                ...results,
                source: 'firestore',
                queryTime: Date.now() - startTime
            };

        } catch (error: any) {
            console.error('Search failed:', error);
            this.metrics.errors.push({
                provider: 'all',
                error: error.message,
                timestamp: Date.now()
            });

            return {
                hits: [],
                nbHits: 0,
                page: 0,
                nbPages: 0,
                source: 'error',
                error: error.message,
                queryTime: Date.now() - startTime
            };
        } finally {
            // Update average query time
            const queryTime = Date.now() - startTime;
            this.metrics.avgQueryTime =
                (this.metrics.avgQueryTime * (this.metrics.totalSearches - 1) + queryTime) /
                this.metrics.totalSearches;
        }
    }

    /**
     * Search with autocomplete suggestions
     */
    async suggest(queryStr: string, options: any = {}) {
        const { index = 'posts', maxSuggestions = 5 } = options;

        if (this.algolia.isEnabled()) {
            return await this.algolia.suggest(queryStr, { index, maxSuggestions });
        }

        return await this.firestore.suggest(queryStr, { index, maxSuggestions });
    }

    // COMPATIBILITY: Legacy method name alias
    async getSearchSuggestions(queryStr: string, maxSuggestions = 5) {
        return this.suggest(queryStr, { maxSuggestions });
    }

    // COMPATIBILITY: Legacy method alias
    async searchPosts(queryStr: string, filters = {}, maxResults = 20) {
        const results = await this.search(queryStr, {
            filters,
            hitsPerPage: maxResults
        });
        // Legacy format expected just an array of IDs usually, but let's return hits 
        // Adapters will handle the difference if needed, or we map it:
        return results.hits.map((h: any) => h.id || h.objectID);
    }

    isAlgoliaEnabled() {
        return this.algolia.isEnabled();
    }

    /**
     * Get facet values for filters
     */
    async getFacets(index = 'posts', facetName: string, queryStr = '') {
        if (this.algolia.isEnabled()) {
            return await this.algolia.getFacets(index, facetName, queryStr);
        }

        return await this.firestore.getFacets(index, facetName);
    }

    /**
     * Get trending searches
     */
    async getTrendingSearches(limit = 10) {
        const cacheKey = 'trending_searches';
        const cached = await this.cache.get(cacheKey);

        if (cached) {
            return cached;
        }

        const trending = await this._calculateTrendingSearches(limit);
        await this.cache.set(cacheKey, trending, CACHE_CONFIG.TRENDING_SEARCHES.ttl);

        return trending;
    }

    /**
     * Get user search history
     */
    async getUserSearchHistory(userId: string, limit = 20) {
        const cacheKey = `user_history_${userId}`;
        return await this.cache.get(cacheKey) || [];
    }

    /**
     * Clear user search history
     */
    async clearUserSearchHistory(userId: string) {
        const cacheKey = `user_history_${userId}`;
        await this.cache.delete(cacheKey);
    }

    /**
     * Get search metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            cacheHitRate: this.metrics.totalSearches > 0
                ? (this.metrics.cacheHits / this.metrics.totalSearches * 100).toFixed(2) + '%'
                : '0%',
            algoliaUsage: this.metrics.totalSearches > 0
                ? (this.metrics.algoliaSearches / this.metrics.totalSearches * 100).toFixed(2) + '%'
                : '0%',
            firestoreUsage: this.metrics.totalSearches > 0
                ? (this.metrics.firestoreSearches / this.metrics.totalSearches * 100).toFixed(2) + '%'
                : '0%'
        };
    }

    /**
     * Health check
     */
    async healthCheck() {
        const health = {
            algolia: await this.algolia.healthCheck(),
            firestore: await this.firestore.healthCheck(),
            cache: this.cache.healthCheck(),
            metrics: this.getMetrics()
        };

        return {
            status: health.algolia.status === 'ok' || health.firestore.status === 'ok' ? 'ok' : 'degraded',
            providers: health
        };
    }

    // ========================================================================
    // PRIVATE METHODS
    // ========================================================================

    _generateCacheKey(queryStr: string, options: any) {
        const normalized = queryStr.toLowerCase().trim();
        const filterKey = JSON.stringify(options.filters || {});
        const sortKey = options.sort || 'relevance';
        const pageKey = options.page || 0;

        return `search:${options.index}:${normalized}:${filterKey}:${sortKey}:${pageKey}`;
    }

    async _trackSearchHistory(userId: string, queryStr: string, resultCount: number) {
        const cacheKey = `user_history_${userId}`;
        const history = await this.cache.get(cacheKey) || [];

        history.unshift({
            query: queryStr,
            resultCount,
            timestamp: Date.now()
        });

        const trimmed = history.slice(0, CACHE_CONFIG.USER_HISTORY.maxSize);
        await this.cache.set(cacheKey, trimmed, CACHE_CONFIG.USER_HISTORY.ttl);
    }

    async _calculateTrendingSearches(limit: number) {
        return [];
    }
}

// Singleton instance
let searchServiceInstance: SearchService | null = null;

export const getSearchService = () => {
    if (!searchServiceInstance) {
        searchServiceInstance = new SearchService();
    }
    return searchServiceInstance;
};

// Default export for legacy compat
export default {
    searchPosts: (q: string, f: any, m: any) => getSearchService().searchPosts(q, f, m),
    isAlgoliaEnabled: () => getSearchService().isAlgoliaEnabled(),
    getSearchSuggestions: (q: string, m: any) => getSearchService().getSearchSuggestions(q, m),
    // Expose the raw service too
    service: getSearchService()
};
