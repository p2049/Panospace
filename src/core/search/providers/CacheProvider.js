/**
 * CACHE PROVIDER
 * 
 * In-memory cache for hot search queries
 */

export class CacheProvider {
    constructor(config = {}) {
        this.maxSize = config.maxSize || 1000;
        this.ttl = config.ttl || 300; // 5 minutes default
        this.cache = new Map();
        this.accessCount = new Map();
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Get value from cache
     */
    async get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            this.misses++;
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.accessCount.delete(key);
            this.misses++;
            return null;
        }

        // Update access count
        this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
        this.hits++;

        return entry.value;
    }

    /**
     * Set value in cache
     */
    async set(key, value, customTtl = null) {
        // Evict if at capacity
        if (this.cache.size >= this.maxSize) {
            this._evictLRU();
        }

        const ttlMs = (customTtl || this.ttl) * 1000;

        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
            createdAt: Date.now()
        });

        this.accessCount.set(key, 1);
    }

    /**
     * Delete value from cache
     */
    async delete(key) {
        this.cache.delete(key);
        this.accessCount.delete(key);
    }

    /**
     * Clear entire cache
     */
    async clear() {
        this.cache.clear();
        this.accessCount.clear();
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? ((this.hits / total) * 100).toFixed(2) + '%' : '0%',
            utilization: ((this.cache.size / this.maxSize) * 100).toFixed(2) + '%'
        };
    }

    /**
     * Health check
     */
    healthCheck() {
        return {
            status: 'ok',
            provider: 'cache',
            stats: this.getStats()
        };
    }

    // ========================================================================
    // PRIVATE METHODS
    // ========================================================================

    /**
     * Evict least recently used entry
     */
    _evictLRU() {
        let lruKey = null;
        let lruCount = Infinity;

        // Find least accessed key
        for (const [key, count] of this.accessCount.entries()) {
            if (count < lruCount) {
                lruCount = count;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.cache.delete(lruKey);
            this.accessCount.delete(lruKey);
        }
    }

    /**
     * Clean up expired entries
     */
    _cleanupExpired() {
        const now = Date.now();
        const keysToDelete = [];

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            this.cache.delete(key);
            this.accessCount.delete(key);
        });

        return keysToDelete.length;
    }
}

export default CacheProvider;
