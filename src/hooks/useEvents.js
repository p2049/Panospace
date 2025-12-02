import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook for fetching events within a date range
 * @param {Date} startDate - Start date for filtering
 * @param {Date} endDate - End date for filtering
 */
export const useEvents = (startDate, endDate) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        if (!startDate || !endDate) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const eventsQuery = query(
                collection(db, 'events'),
                where('eventDate', '>=', Timestamp.fromDate(startDate)),
                where('eventDate', '<=', Timestamp.fromDate(endDate)),
                orderBy('eventDate', 'asc')
            );

            const snapshot = await getDocs(eventsQuery);
            const fetchedEvents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                eventDate: doc.data().eventDate?.toDate()
            }));

            setEvents(fetchedEvents);
            setError(null);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [startDate?.getTime(), endDate?.getTime()]);

    return { events, loading, error, refetch };
};

/**
 * Hook for fetching events by creator (Following Calendar)
 * @param {string[]} creatorIds - Array of user IDs to fetch events from
 * @param {Date} startDate - Start date for filtering
 * @param {Date} endDate - End date for filtering
 */
export const useFollowingEvents = (creatorIds, startDate, endDate) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create stable reference for creatorIds to prevent infinite loops
    // Sort and stringify to ensure same IDs in different order produce same key
    const stableCreatorIds = useMemo(() => {
        if (!creatorIds || creatorIds.length === 0) return '';
        return [...creatorIds].sort().join(',');
    }, [creatorIds?.length, ...(creatorIds || [])]);

    const refetch = async () => {
        if (!creatorIds || creatorIds.length === 0 || !startDate || !endDate) {
            setLoading(false);
            setEvents([]);
            return;
        }

        try {
            setLoading(true);

            // Firestore 'in' queries are limited to 10 items, so we batch if needed
            const batches = [];
            for (let i = 0; i < creatorIds.length; i += 10) {
                const batch = creatorIds.slice(i, i + 10);
                const eventsQuery = query(
                    collection(db, 'events'),
                    where('creatorId', 'in', batch),
                    where('eventDate', '>=', Timestamp.fromDate(startDate)),
                    where('eventDate', '<=', Timestamp.fromDate(endDate)),
                    orderBy('eventDate', 'asc')
                );
                batches.push(getDocs(eventsQuery));
            }

            const snapshots = await Promise.all(batches);
            const allEvents = [];

            snapshots.forEach(snapshot => {
                snapshot.docs.forEach(doc => {
                    allEvents.push({
                        id: doc.id,
                        ...doc.data(),
                        eventDate: doc.data().eventDate?.toDate()
                    });
                });
            });

            // Sort by date
            allEvents.sort((a, b) => a.eventDate - b.eventDate);

            setEvents(allEvents);
            setError(null);
        } catch (err) {
            console.error('Error fetching following events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stableCreatorIds, startDate?.getTime(), endDate?.getTime()]);

    return { events, loading, error, refetch };
};

/**
 * Hook for creating and managing events
 */
export const useCreateEvent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createEvent = async (eventData) => {
        try {
            setLoading(true);
            setError(null);

            const newEvent = {
                ...eventData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                eventDate: Timestamp.fromDate(eventData.eventDate)
            };

            const docRef = await addDoc(collection(db, 'events'), newEvent);

            setLoading(false);
            return { id: docRef.id, ...newEvent };
        } catch (err) {
            console.error('Error creating event:', err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const updateEvent = async (eventId, updates) => {
        try {
            setLoading(true);
            setError(null);

            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            if (updates.eventDate) {
                updateData.eventDate = Timestamp.fromDate(updates.eventDate);
            }

            await updateDoc(doc(db, 'events', eventId), updateData);

            setLoading(false);
            return true;
        } catch (err) {
            console.error('Error updating event:', err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const deleteEvent = async (eventId) => {
        try {
            setLoading(true);
            setError(null);

            await deleteDoc(doc(db, 'events', eventId));

            setLoading(false);
            return true;
        } catch (err) {
            console.error('Error deleting event:', err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    return {
        createEvent,
        updateEvent,
        deleteEvent,
        loading,
        error
    };
};

/**
 * Hook to fetch a single event by ID
 */
export const useEvent = (eventId) => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        if (!eventId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const eventDoc = await getDoc(doc(db, 'events', eventId));

            if (eventDoc.exists()) {
                setEvent({
                    id: eventDoc.id,
                    ...eventDoc.data(),
                    eventDate: eventDoc.data().eventDate?.toDate()
                });
            } else {
                setError('Event not found');
            }
        } catch (err) {
            console.error('Error fetching event:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [eventId]);

    return { event, loading, error, refetch };
};
