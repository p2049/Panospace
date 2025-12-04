/**
 * PANOSPACE SEARCH - MAIN EXPORT
 * 
 * Unified search interface for the entire application
 */

export { getSearchService } from './SearchService';
export { AlgoliaProvider } from './providers/AlgoliaProvider';
export { FirestoreProvider } from './providers/FirestoreProvider';
export { CacheProvider } from './providers/CacheProvider';
export {
    SEARCH_STRATEGY,
    SEARCH_INDICES,
    CACHE_CONFIG,
    SYNC_CONFIG,
    SEARCH_METRICS,
    MIGRATION_PLAN,
    COST_ESTIMATION
} from './architecture';

// Convenience exports
import { getSearchService } from './SearchService';

/**
 * Quick search function
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export const search = async (query, options = {}) => {
    const service = getSearchService();
    return await service.search(query, options);
};

/**
 * Get autocomplete suggestions
 */
export const suggest = async (query, options = {}) => {
    const service = getSearchService();
    return await service.suggest(query, options);
};

/**
 * Get facets for filtering
 */
export const getFacets = async (index, facetName, query = '') => {
    const service = getSearchService();
    return await service.getFacets(index, facetName, query);
};

/**
 * Get search health status
 */
export const getSearchHealth = async () => {
    const service = getSearchService();
    return await service.healthCheck();
};

/**
 * Get search metrics
 */
export const getSearchMetrics = () => {
    const service = getSearchService();
    return service.getMetrics();
};

export default {
    search,
    suggest,
    getFacets,
    getSearchHealth,
    getSearchMetrics,
    getSearchService
};
