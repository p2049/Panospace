/**
 * OfflineQueue - Service to queue actions when offline
 * Stores actions in localStorage for persistence across sessions
 * 
 * NOTE: Simplified version - just tracks queued actions
 * Actual retry logic to be implemented when services are available
 */

const QUEUE_KEY = 'panospace_offline_queue';

class OfflineQueueService {
    constructor() {
        this.queue = this.loadQueue();
        this.processing = false;
    }

    loadQueue() {
        try {
            const stored = localStorage.getItem(QUEUE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load offline queue:', e);
            return [];
        }
    }

    saveQueue() {
        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
        } catch (e) {
            console.error('Failed to save offline queue:', e);
        }
    }

    /**
     * Add an action to the queue
     * @param {string} type - Action type (e.g., 'like', 'save', 'upload')
     * @param {object} metadata - Additional data for display
     */
    enqueue(type, metadata = {}) {
        const queueItem = {
            id: Date.now() + Math.random(),
            type,
            metadata,
            timestamp: Date.now()
        };

        this.queue.push(queueItem);
        this.saveQueue();

        console.log(`📥 Queued ${type} action:`, metadata);
        return queueItem.id;
    }

    /**
     * Process all queued actions
     * Called when connection is restored
     */
    async processQueue() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        const queueLength = this.queue.length;
        console.log(`🔄 Processing ${queueLength} queued actions...`);

        // For now, just clear the queue
        // TODO: Implement actual retry logic when services are available
        this.queue = [];
        this.saveQueue();

        this.processing = false;
        console.log(`✅ Queue cleared (${queueLength} actions)`);

        return {
            success: queueLength,
            failed: 0,
            total: queueLength
        };
    }

    /**
     * Get current queue length
     */
    getQueueLength() {
        return this.queue.length;
    }

    /**
     * Clear the entire queue
     */
    clearQueue() {
        this.queue = [];
        this.saveQueue();
        console.log('🗑️ Queue cleared');
    }
}

// Singleton instance
export const OfflineQueue = new OfflineQueueService();

export default OfflineQueue;
