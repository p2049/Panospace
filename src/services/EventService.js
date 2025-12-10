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
    Timestamp,
    addDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';

const EVENTS_COLLECTION = 'events_app';

export const EventService = {
    /**
     * Get active and upcoming events (for search/calendar)
     * @returns {Promise<AppEvent[]>}
     */
    async getVisibleEvents() {
        try {
            const now = Timestamp.now();
            const eventsRef = collection(db, EVENTS_COLLECTION);

            // Query for events where visibleDate <= now AND archived == false
            // Note: Firestore doesn't support inequality on different fields easily without composite indexes.
            // We'll query simple filters and refine client-side if needed, 
            // OR assuming visibleDate is the main chronological index.
            // Let's filter by archived == false primarily.

            const q = query(
                eventsRef,
                where('active', '==', true),
                orderBy('visibleDate', 'desc'), // Show newest first
                limit(50)
            );

            const snapshot = await getDocs(q);
            const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Filter client-side for visibleDate <= now if index issues prevent strict query
            return events.filter(e => e.visibleDate.toMillis() <= now.toMillis());

        } catch (error) {
            console.error("Error fetching visible events:", error);
            return [];
        }
    },

    /**
     * Get a single event by ID
     */
    async getEventById(eventId) {
        try {
            const docRef = doc(db, EVENTS_COLLECTION, eventId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error fetching event:", error);
            return null;
        }
    },

    /**
     * Fetch feed posts for a specific event
     * @param {string} eventId 
     * @param {string} sortMode 'top' | 'rising' | 'new'
     * @param {number} pageSize 
     * @returns {Promise<any[]>} List of post IDs or full post objects
     */
    async getEventFeedPosts(eventId, sortMode = 'top', pageSize = 50) {
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
            const postIds = snapshot.docs.map(d => d.data().postId);

            if (postIds.length === 0) return [];

            // Batched fetch for posts (Firestore limited to 10 'in' queries, so might need multiple or individual gets)
            // For simplicity in this demo, we'll fetch them individually or use a safe helper function.
            // Ideally: fetchByIds(postIds)

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
    async checkDailyFeature() {
        // This would be server-side logic. 
        // For now, we assume the daily event exists or we just return the 'latest' daily event found.
    }
};
