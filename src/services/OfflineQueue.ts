/**
 * OfflineQueue - Service to queue actions when offline
 * Stores actions in localStorage for persistence across sessions
 * 
 * NOTE: Simplified version - just tracks queued actions
 * Actual retry logic to be implemented when services are available
 */

import { logger } from '@/core/utils/logger';

const QUEUE_KEY = 'panospace_offline_queue';

export interface QueueItem {
    id: number;
    type: string;
    metadata: any;
    timestamp: number;
}

export interface ProcessResult {
    success: number;
    failed: number;
    total: number;
}

class OfflineQueueService {
    private queue: QueueItem[];
    private processing: boolean;

    constructor() {
        this.queue = this.loadQueue();
        this.processing = false;
    }

    private loadQueue(): QueueItem[] {
        try {
            const stored = localStorage.getItem(QUEUE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            logger.error('Failed to load offline queue:', e);
            return [];
        }
    }

    private saveQueue(): void {
        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
        } catch (e) {
            logger.error('Failed to save offline queue:', e);
        }
    }

    /**
     * Add an action to the queue
     * @param type - Action type (e.g., 'like', 'save', 'upload')
     * @param metadata - Additional data for display
     */
    enqueue(type: string, metadata: any = {}): number {
        const queueItem: QueueItem = {
            id: Date.now() + Math.random(),
            type,
            metadata,
            timestamp: Date.now()
        };

        this.queue.push(queueItem);
        this.saveQueue();

        logger.log(`📥 Queued ${type} action:`, metadata);
        return queueItem.id;
    }

    /**
     * Process all queued actions
     * Called when connection is restored
     */
    async processQueue(): Promise<ProcessResult | void> {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        const queueLength = this.queue.length;
        logger.log(`🔄 Processing ${queueLength} queued actions...`);

        // For now, just clear the queue
        // TODO: Implement actual retry logic when services are available
        this.queue = [];
        this.saveQueue();

        this.processing = false;
        logger.log(`✅ Queue cleared (${queueLength} actions)`);

        return {
            success: queueLength,
            failed: 0,
            total: queueLength
        };
    }

    /**
     * Get current queue length
     */
    getQueueLength(): number {
        return this.queue.length;
    }

    /**
     * Clear the entire queue
     */
    clearQueue(): void {
        this.queue = [];
        this.saveQueue();
        logger.log('🗑️ Queue cleared');
    }
}

// Singleton instance
export const OfflineQueue = new OfflineQueueService();

export default OfflineQueue;
