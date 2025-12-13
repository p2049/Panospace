import { db } from '@/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    limit,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import type { AppEvent, AppEventFeedItem } from '@/core/types';
import { normalizeAppEvent } from '@/core/schemas/firestoreModels';

const EVENTS_COLLECTION = 'events';

export const EventService = {
    /**
     * Get active and upcoming events (for search/calendar)
     */
    async getVisibleEvents(): Promise<AppEvent[]> {
        try {
            const now = Timestamp.now();
            const eventsRef = collection(db, EVENTS_COLLECTION);

            // Query for events where active == true ordered by visibleDate
            // Filter specific conditions client-side due to Firestore compound query limitations
            const q = query(
                eventsRef,
                where('active', '==', true),
                orderBy('visibleDate', 'desc'), // Show newest first
                limit(50)
            );

            const snapshot = await getDocs(q);
            // Use normalizeAppEvent to ensure contract compliance
            const events = snapshot.docs.map(normalizeAppEvent);

            // Filter client-side for visibleDate <= now
            return events.filter(e => e.visibleDate.toMillis() <= now.toMillis());

        } catch (error) {
            console.error("Error fetching visible events:", error);
            return [];
        }
    },

    /**
     * Get a single event by ID
     */
    async getEventById(eventId: string): Promise<AppEvent | null> {
        try {
            const docRef = doc(db, EVENTS_COLLECTION, eventId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return normalizeAppEvent(docSnap);
            }
            return null;
        } catch (error) {
            console.error("Error fetching event:", error);
            return null;
        }
    },

    /**
     * Fetch feed posts for a specific event
     * @param eventId 
     * @param sortMode 'top' | 'rising' | 'new'
     * @param pageSize 
     * @returns List of post IDs
     */
    async getEventFeedPosts(eventId: string, sortMode: 'top' | 'rising' | 'new' = 'top', pageSize: number = 50): Promise<string[]> {
        try {
            const feedRef = collection(db, EVENTS_COLLECTION, eventId, 'feedPosts');
            let q;

            if (sortMode === 'new') {
                q = query(feedRef, orderBy('createdAt', 'desc'), limit(pageSize));
            } else if (sortMode === 'top') {
                // Assuming 'score' field exists
                q = query(feedRef, orderBy('score', 'desc'), limit(pageSize));
            } else {
                // Rising: assume recency or calculated score
                q = query(feedRef, orderBy('score', 'desc'), limit(pageSize)); // Placeholder for rising logic
            }

            const snapshot = await getDocs(q);

            // We have IDs, now we need to fetch the actual posts (or the feed item might contain basic data)
            // It's better to fetch the full posts from the 'posts' collection using IDs
            const postIds = snapshot.docs.map(d => (d.data() as AppEventFeedItem).postId);

            if (postIds.length === 0) return [];

            return postIds;

        } catch (error) {
            console.error("Error fetching event feed posts:", error);
            return [];
        }
    },

    /**
     * Check for today's Daily Feature and creating it if needed (Simulation)
     * Real implementation would be a Cloud Function.
     */
    async checkDailyFeature(): Promise<void> {
        // This would be server-side logic. 
        // For now, we assume the daily event exists or we just return the 'latest' daily event found.
        return Promise.resolve();
    }
};
