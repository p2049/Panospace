/**
 * PANOSPACE SEARCH ARCHITECTURE
 * 
 * Scalable search microservice design for 100k+ users
 * 
 * CURRENT STATE:
 * - Firestore keyword prefix search (array-contains)
 * - Client-side filtering
 * - Optional Algolia bridge
 * - Scattered logic across useSearch, filters, helpers
 * 
 * PROBLEMS AT SCALE:
 * - Firestore array-contains limited to 1 field
 * - No fuzzy matching
 * - No relevance scoring
 * - Client-side filtering doesn't scale
 * - No caching layer
 * - Inconsistent search quality
 * 
 * SOLUTION: Hybrid Architecture
 * - Primary: Algolia (instant, typo-tolerant, faceted)
 * - Fallback: Firestore (basic keyword)
 * - Cache: Redis/Memory (hot queries)
 * - Sync: Cloud Functions (real-time indexing)
 */

// ============================================================================
// ARCHITECTURE DECISION
// ============================================================================

/**
 * RECOMMENDED: Algolia + Firestore Hybrid
 * 
 * WHY ALGOLIA:
 * ✅ Built for search (not a database hack)
 * ✅ Instant results (<10ms)
 * ✅ Typo tolerance out of the box
 * ✅ Faceted search (filters)
 * ✅ Geo-search built-in
 * ✅ 10k records free tier
 * ✅ $1/1000 records after (reasonable)
 * ✅ Scales to billions
 * 
 * WHY NOT ELASTICSEARCH:
 * ❌ Complex setup/maintenance
 * ❌ Requires dedicated server
 * ❌ Expensive at scale
 * ❌ Overkill for image platform
 * 
 * WHY NOT SUPABASE PGVECTOR:
 * ❌ Requires full Supabase migration
 * ❌ Better for semantic/AI search
 * ❌ Not optimized for text search
 * ❌ Adds another database
 * 
 * WHY KEEP FIRESTORE:
 * ✅ Already have the data
 * ✅ Free fallback
 * ✅ Works offline
 * ✅ Good for exact matches
 */

export const SEARCH_STRATEGY = {
    PRIMARY: 'algolia',      // Fast, typo-tolerant, faceted
    FALLBACK: 'firestore',   // Free, exact matches
    CACHE: 'memory',         // Hot queries (top 1000)
    SYNC: 'cloud-functions'  // Real-time indexing
};

// ============================================================================
// SEARCH INDICES
// ============================================================================

export const SEARCH_INDICES = {
    // Posts index - primary search
    POSTS: {
        name: 'posts',
        searchableAttributes: [
            'title',
            'tags',
            'authorName',
            'location.city',
            'location.state',
            'location.country',
            'parkName',
            'camera',
            'film'
        ],
        attributesForFaceting: [
            'tags',
            'location.country',
            'location.state',
            'parkId',
            'camera',
            'film',
            'orientation',
            'aspectRatio',
            'safe',
            'shopEnabled'
        ],
        customRanking: [
            'desc(likesCount)',
            'desc(commentsCount)',
            'desc(createdAt)'
        ],
        replicas: [
            'posts_trending',    // Sort by trending score
            'posts_recent',      // Sort by createdAt
            'posts_popular'      // Sort by likesCount
        ]
    },

    // Users index
    USERS: {
        name: 'users',
        searchableAttributes: [
            'displayName',
            'username',
            'bio',
            'artTypes',
            'location.city',
            'location.state'
        ],
        attributesForFaceting: [
            'accountType',
            'verified',
            'artTypes'
        ],
        customRanking: [
            'desc(followersCount)',
            'desc(postsCount)'
        ]
    },

    // Galleries index
    GALLERIES: {
        name: 'galleries',
        searchableAttributes: [
            'name',
            'description',
            'ownerName',
            'tags'
        ],
        attributesForFaceting: [
            'tags',
            'visibility'
        ],
        customRanking: [
            'desc(postsCount)',
            'desc(createdAt)'
        ]
    },

    // Collections index
    COLLECTIONS: {
        name: 'collections',
        searchableAttributes: [
            'title',
            'description',
            'creatorName',
            'tags'
        ],
        attributesForFaceting: [
            'tags',
            'productTier'
        ],
        customRanking: [
            'desc(itemCount)',
            'desc(createdAt)'
        ]
    },

    // SpaceCards index
    SPACECARDS: {
        name: 'spacecards',
        searchableAttributes: [
            'name',
            'tags',
            'category',
            'creatorName'
        ],
        attributesForFaceting: [
            'category',
            'rarity',
            'tags'
        ],
        customRanking: [
            'desc(rarity)',
            'desc(createdAt)'
        ]
    }
};

// ============================================================================
// CACHING STRATEGY
// ============================================================================

export const CACHE_CONFIG = {
    // Hot query cache (in-memory)
    HOT_QUERIES: {
        maxSize: 1000,           // Top 1000 queries
        ttl: 300,                // 5 minutes
        refreshThreshold: 0.8    // Refresh at 80% TTL
    },

    // User search history
    USER_HISTORY: {
        maxSize: 50,             // Last 50 searches per user
        ttl: 86400               // 24 hours
    },

    // Popular searches
    TRENDING_SEARCHES: {
        maxSize: 100,            // Top 100 trending
        ttl: 3600,               // 1 hour
        updateInterval: 300      // Update every 5 min
    }
};

// ============================================================================
// SYNC STRATEGY
// ============================================================================

export const SYNC_CONFIG = {
    // Real-time sync via Cloud Functions
    triggers: [
        'posts.onCreate',
        'posts.onUpdate',
        'posts.onDelete',
        'users.onCreate',
        'users.onUpdate',
        'galleries.onCreate',
        'galleries.onUpdate',
        'collections.onCreate',
        'collections.onUpdate'
    ],

    // Batch sync for bulk operations
    batchSize: 100,
    batchInterval: 60000,  // 1 minute

    // Retry strategy
    maxRetries: 3,
    retryDelay: 1000,      // 1 second
    backoffMultiplier: 2
};

// ============================================================================
// SEARCH QUALITY METRICS
// ============================================================================

export const SEARCH_METRICS = {
    // Track search performance
    tracking: {
        queryTime: true,
        resultCount: true,
        clickThrough: true,
        zeroResults: true,
        refinements: true
    },

    // Quality thresholds
    thresholds: {
        maxQueryTime: 100,      // 100ms
        minResultCount: 1,
        targetCTR: 0.3          // 30% click-through
    }
};

// ============================================================================
// MIGRATION PLAN
// ============================================================================

export const MIGRATION_PLAN = {
    // Phase 1: Setup (Week 1)
    phase1: {
        tasks: [
            'Create Algolia account',
            'Configure indices',
            'Set up Cloud Functions',
            'Create sync service'
        ],
        deliverable: 'Algolia configured, syncing new data'
    },

    // Phase 2: Backfill (Week 2)
    phase2: {
        tasks: [
            'Export existing Firestore data',
            'Batch upload to Algolia',
            'Verify data integrity',
            'Test search quality'
        ],
        deliverable: 'All existing data in Algolia'
    },

    // Phase 3: Integration (Week 3)
    phase3: {
        tasks: [
            'Create SearchService abstraction',
            'Implement caching layer',
            'Update UI components',
            'Add analytics'
        ],
        deliverable: 'Search service integrated'
    },

    // Phase 4: Rollout (Week 4)
    phase4: {
        tasks: [
            'A/B test Algolia vs Firestore',
            'Monitor performance',
            'Optimize relevance',
            'Full rollout'
        ],
        deliverable: 'Algolia live for all users'
    }
};

// ============================================================================
// COST ESTIMATION
// ============================================================================

export const COST_ESTIMATION = {
    // Algolia pricing (as of 2024)
    algolia: {
        free: {
            records: 10000,
            searches: 10000,
            cost: 0
        },
        growth: {
            records: 100000,
            searches: 100000,
            cost: 1,  // $1 per 1000 records
            searchCost: 0.50  // $0.50 per 1000 searches
        },
        estimate: {
            users: 100000,
            postsPerUser: 10,
            totalRecords: 1000000,
            monthlyCost: 1000  // ~$1000/month at 1M records
        }
    },

    // Firestore (current)
    firestore: {
        reads: {
            perSearch: 50,     // Average reads per search
            cost: 0.06         // $0.06 per 100k reads
        },
        estimate: {
            searches: 1000000,  // 1M searches/month
            reads: 50000000,    // 50M reads
            monthlyCost: 30     // ~$30/month
        }
    },

    // Hybrid approach
    hybrid: {
        algolia: 1000,
        firestore: 10,  // Reduced (fallback only)
        total: 1010,
        savings: 'Algolia expensive but worth it for UX'
    }
};

export default {
    SEARCH_STRATEGY,
    SEARCH_INDICES,
    CACHE_CONFIG,
    SYNC_CONFIG,
    SEARCH_METRICS,
    MIGRATION_PLAN,
    COST_ESTIMATION
};
