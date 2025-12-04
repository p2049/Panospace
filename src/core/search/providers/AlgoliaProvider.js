/**
 * ALGOLIA SEARCH PROVIDER
 * 
 * Primary search provider with instant, typo-tolerant search
 */

import algoliasearch from 'algoliasearch/lite';
import { SEARCH_INDICES } from '../architecture';

export class AlgoliaProvider {
    constructor() {
        this.appId = import.meta.env.VITE_ALGOLIA_APP_ID || '';
        this.searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY || '';
        this.client = null;
        this.indices = {};
        this.enabled = false;

        this._initialize();
    }

    _initialize() {
        if (!this.appId || !this.searchKey) {
            console.warn('Algolia credentials not configured');
            return;
        }

        try {
            this.client = algoliasearch(this.appId, this.searchKey);

            // Initialize indices
            Object.keys(SEARCH_INDICES).forEach(key => {
                const config = SEARCH_INDICES[key];
                this.indices[config.name] = this.client.initIndex(config.name);
            });

            this.enabled = true;
            console.log('✅ Algolia search provider initialized');
        } catch (error) {
            console.error('Failed to initialize Algolia:', error);
            this.enabled = false;
        }
    }

    isEnabled() {
        return this.enabled;
    }

    /**
     * Search with Algolia
     */
    async search(query, options = {}) {
        if (!this.enabled) {
            throw new Error('Algolia not enabled');
        }

        const {
            index = 'posts',
            filters = {},
            sort = 'relevance',
            page = 0,
            hitsPerPage = 20,
            facets = []
        } = options;

        const algoliaIndex = this.indices[index];
        if (!algoliaIndex) {
            throw new Error(`Index ${index} not found`);
        }

        try {
            // Build filter string
            const filterString = this._buildFilterString(filters);

            // Build search params
            const searchParams = {
                page,
                hitsPerPage,
                attributesToRetrieve: ['*'],
                attributesToHighlight: ['title', 'tags', 'authorName']
            };

            if (filterString) {
                searchParams.filters = filterString;
            }

            if (facets.length > 0) {
                searchParams.facets = facets;
            }

            // Handle sorting
            if (sort !== 'relevance') {
                const replicaIndex = this._getReplicaIndex(index, sort);
                if (replicaIndex) {
                    const results = await replicaIndex.search(query, searchParams);
                    return this._formatResults(results);
                }
            }

            // Default search
            const results = await algoliaIndex.search(query, searchParams);
            return this._formatResults(results);

        } catch (error) {
            console.error('Algolia search error:', error);
            throw error;
        }
    }

    /**
     * Get autocomplete suggestions
     */
    async suggest(query, options = {}) {
        if (!this.enabled) {
            return [];
        }

        const { index = 'posts', maxSuggestions = 5 } = options;
        const algoliaIndex = this.indices[index];

        if (!algoliaIndex) {
            return [];
        }

        try {
            const { hits } = await algoliaIndex.search(query, {
                hitsPerPage: maxSuggestions,
                attributesToRetrieve: ['title', 'tags', 'authorName'],
                typoTolerance: true
            });

            return hits.map(hit => ({
                text: hit.title || hit.authorName || hit.name,
                tags: hit.tags || [],
                type: index
            }));
        } catch (error) {
            console.error('Algolia suggest error:', error);
            return [];
        }
    }

    /**
     * Get facet values
     */
    async getFacets(index, facetName, query = '') {
        if (!this.enabled) {
            return [];
        }

        const algoliaIndex = this.indices[index];
        if (!algoliaIndex) {
            return [];
        }

        try {
            const { facets } = await algoliaIndex.search(query, {
                facets: [facetName],
                hitsPerPage: 0
            });

            if (!facets || !facets[facetName]) {
                return [];
            }

            return Object.entries(facets[facetName])
                .map(([value, count]) => ({ value, count }))
                .sort((a, b) => b.count - a.count);
        } catch (error) {
            console.error('Algolia facets error:', error);
            return [];
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        if (!this.enabled) {
            return { status: 'disabled', message: 'Algolia not configured' };
        }

        try {
            // Try a simple search
            const testIndex = this.indices.posts;
            await testIndex.search('', { hitsPerPage: 1 });

            return { status: 'ok', provider: 'algolia' };
        } catch (error) {
            return { status: 'error', provider: 'algolia', error: error.message };
        }
    }

    // ========================================================================
    // PRIVATE METHODS
    // ========================================================================

    _buildFilterString(filters) {
        const conditions = [];

        // Tags filter
        if (filters.tags && filters.tags.length > 0) {
            const tagConditions = filters.tags.map(tag => `tags:"${tag}"`);
            conditions.push(`(${tagConditions.join(' OR ')})`);
        }

        // Location filter
        if (filters.location) {
            const loc = filters.location;
            const locConditions = [];
            if (loc.city) locConditions.push(`location.city:"${loc.city}"`);
            if (loc.state) locConditions.push(`location.state:"${loc.state}"`);
            if (loc.country) locConditions.push(`location.country:"${loc.country}"`);
            if (locConditions.length > 0) {
                conditions.push(`(${locConditions.join(' OR ')})`);
            }
        }

        // Park filter
        if (filters.parkId) {
            conditions.push(`parkId:"${filters.parkId}"`);
        }

        // Camera filter
        if (filters.camera) {
            conditions.push(`camera:"${filters.camera}"`);
        }

        // Film filter
        if (filters.film) {
            conditions.push(`film:"${filters.film}"`);
        }

        // Orientation filter
        if (filters.orientation) {
            conditions.push(`orientation:"${filters.orientation}"`);
        }

        // Aspect ratio filter
        if (filters.aspectRatio) {
            conditions.push(`aspectRatio:"${filters.aspectRatio}"`);
        }

        // Safe filter
        if (filters.safe !== undefined) {
            conditions.push(`safe:${filters.safe}`);
        }

        // Shop enabled filter
        if (filters.shopEnabled !== undefined) {
            conditions.push(`shopEnabled:${filters.shopEnabled}`);
        }

        // Date filter
        if (filters.date) {
            const timestamp = new Date(filters.date).getTime();
            conditions.push(`capturedAt:${timestamp}`);
        }

        // Following filter (requires user IDs)
        if (filters.followingIds && filters.followingIds.length > 0) {
            const userConditions = filters.followingIds.map(id => `uid:"${id}"`);
            conditions.push(`(${userConditions.join(' OR ')})`);
        }

        return conditions.join(' AND ');
    }

    _getReplicaIndex(indexName, sort) {
        const config = Object.values(SEARCH_INDICES).find(c => c.name === indexName);
        if (!config || !config.replicas) {
            return null;
        }

        const replicaName = `${indexName}_${sort}`;
        if (config.replicas.includes(replicaName)) {
            return this.client.initIndex(replicaName);
        }

        return null;
    }

    _formatResults(results) {
        return {
            hits: results.hits.map(hit => ({
                id: hit.objectID,
                ...hit,
                _highlightResult: hit._highlightResult
            })),
            nbHits: results.nbHits,
            page: results.page,
            nbPages: results.nbPages,
            hitsPerPage: results.hitsPerPage,
            facets: results.facets || {},
            query: results.query,
            processingTimeMS: results.processingTimeMS
        };
    }
}

export default AlgoliaProvider;
