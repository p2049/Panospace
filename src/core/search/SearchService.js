/**
 * PANOSPACE SEARCH SERVICE
 * 
 * Unified search interface with automatic provider selection
 * Supports: Algolia (primary), Firestore (fallback), Cache (performance)
 */

import { SEARCH_STRATEGY, CACHE_CONFIG } from './architecture';
import { AlgoliaProvider } from './providers/AlgoliaProvider';
import { FirestoreProvider } from './providers/FirestoreProvider';
import { CacheProvider } from './providers/CacheProvider';

class SearchService {
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
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Search results
     */
    async search(query, options = {}) {
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
                const cacheKey = this._generateCacheKey(query, options);
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
                    const results = await this.algolia.search(query, {
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
                        const cacheKey = this._generateCacheKey(query, options);
                        await this.cache.set(cacheKey, results);
                    }

                    // Track user search history
                    if (userId) {
                        await this._trackSearchHistory(userId, query, results.hits.length);
                    }

                    return {
                        ...results,
                        source: 'algolia',
                        queryTime: Date.now() - startTime
                    };
                } catch (error) {
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
            const results = await this.firestore.search(query, {
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

        } catch (error) {
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
    async suggest(query, options = {}) {
        const { index = 'posts', maxSuggestions = 5 } = options;

        if (this.algolia.isEnabled()) {
            return await this.algolia.suggest(query, { index, maxSuggestions });
        }

        return await this.firestore.suggest(query, { index, maxSuggestions });
    }

    /**
     * Get facet values for filters
     */
    async getFacets(index = 'posts', facetName, query = '') {
        if (this.algolia.isEnabled()) {
            return await this.algolia.getFacets(index, facetName, query);
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

        // Calculate from search history
        // This would typically be done server-side
        const trending = await this._calculateTrendingSearches(limit);

        await this.cache.set(cacheKey, trending, CACHE_CONFIG.TRENDING_SEARCHES.ttl);

        return trending;
    }

    /**
     * Get user search history
     */
    async getUserSearchHistory(userId, limit = 20) {
        const cacheKey = `user_history_${userId}`;
        return await this.cache.get(cacheKey) || [];
    }

    /**
     * Clear user search history
     */
    async clearUserSearchHistory(userId) {
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

    _generateCacheKey(query, options) {
        const normalized = query.toLowerCase().trim();
        const filterKey = JSON.stringify(options.filters || {});
        const sortKey = options.sort || 'relevance';
        const pageKey = options.page || 0;

        return `search:${options.index}:${normalized}:${filterKey}:${sortKey}:${pageKey}`;
    }

    async _trackSearchHistory(userId, query, resultCount) {
        const cacheKey = `user_history_${userId}`;
        const history = await this.cache.get(cacheKey) || [];

        history.unshift({
            query,
            resultCount,
            timestamp: Date.now()
        });

        // Keep only last N searches
        const trimmed = history.slice(0, CACHE_CONFIG.USER_HISTORY.maxSize);

        await this.cache.set(cacheKey, trimmed, CACHE_CONFIG.USER_HISTORY.ttl);
    }

    async _calculateTrendingSearches(limit) {
        // This would typically aggregate from analytics
        // For now, return placeholder
        return [];
    }
}

// Singleton instance
let searchServiceInstance = null;

export const getSearchService = () => {
    if (!searchServiceInstance) {
        searchServiceInstance = new SearchService();
    }
    return searchServiceInstance;
};

export default SearchService;
