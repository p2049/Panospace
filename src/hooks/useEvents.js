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
import { db } from '@/firebase';

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

            // 1. Fetch User Events (standard strict query)
            const eventsQuery = query(
                collection(db, 'events'),
                where('eventDate', '>=', Timestamp.fromDate(startDate)),
                where('eventDate', '<=', Timestamp.fromDate(endDate)),
                orderBy('eventDate', 'asc')
            );

            // 2. Fetch Global Events
            const globalQuery = query(collection(db, 'events_global'));

            // 3. Fetch App Events (Curated)
            const appEventsQuery = query(
                collection(db, 'events_app'),
                where('visibleDate', '>=', Timestamp.fromDate(startDate)),
                where('visibleDate', '<=', Timestamp.fromDate(endDate))
            );

            const [eventsSnapshot, globalSnapshotResult, appEventsResult] = await Promise.allSettled([
                getDocs(eventsQuery),
                getDocs(globalQuery),
                getDocs(appEventsQuery)
            ]);

            const fetchedEvents = [];

            // Process User Events
            if (eventsSnapshot.status === 'fulfilled') {
                eventsSnapshot.value.docs.forEach(doc => {
                    const data = doc.data();
                    fetchedEvents.push({
                        id: doc.id,
                        ...data,
                        // Ensure we have a valid JS Date object
                        eventDate: data.eventDate?.toDate ? data.eventDate.toDate() : new Date(data.eventDate)
                    });
                });
            } else {
                console.error("Error fetching user events:", eventsSnapshot.reason);
            }

            // Process App Events
            if (appEventsResult.status === 'fulfilled') {
                appEventsResult.value.docs.forEach(doc => {
                    const data = doc.data();
                    let date = data.visibleDate?.toDate ? data.visibleDate.toDate() : new Date(data.visibleDate);

                    fetchedEvents.push({
                        id: doc.id,
                        ...data,
                        title: data.name, // Map name to title for calendar
                        eventDate: date,
                        isAppEvent: true,
                        type: data.type || 'app_event',
                        icon: data.category === 'daily' ? '📅' : (data.category === 'contest' ? '🏆' : '⭐')
                    });
                });
            }

            // Process Global Events
            let globalEventsFound = false;

            if (globalSnapshotResult.status === 'fulfilled') {
                globalSnapshotResult.value.docs.forEach(doc => {
                    const data = doc.data();

                    // robust date handling: support 'date', 'dateUTC', or 'eventDate'
                    let rawDate = data.dateUTC || data.date || data.eventDate;
                    let eventDateObj = null;

                    if (rawDate) {
                        if (rawDate.toDate) eventDateObj = rawDate.toDate(); // Firestore Timestamp
                        else eventDateObj = new Date(rawDate); // String or Number
                    }

                    if (eventDateObj && !isNaN(eventDateObj.getTime())) {
                        // Filter by range (Client-Side)
                        if (eventDateObj >= startDate && eventDateObj <= endDate) {
                            fetchedEvents.push({
                                id: doc.id,
                                ...data,
                                eventDate: eventDateObj,
                                isGlobal: true,
                                type: data.type || 'global'
                            });
                            globalEventsFound = true;
                        }
                    }
                });
            } else {
                console.warn("Global events access denied (Firestore Rules). Fallback data will be used.", globalSnapshotResult.reason);
            }

            // Fallback: If DB is empty/failed, use fail-safe data so user sees calendar working
            if (!globalEventsFound) {
                const FALLBACK_MOONS = [
                    { id: 'fm-jan-25', dateUTC: '2025-01-13', title: 'Full Moon', type: 'astronomy', icon: '🌕' },
                    { id: 'fm-feb-25', dateUTC: '2025-02-12', title: 'Full Moon', type: 'astronomy', icon: '🌕' },
                    { id: 'fm-mar-25', dateUTC: '2025-03-14', title: 'Full Moon', type: 'astronomy', icon: '🌕' },
                    { id: 'fm-apr-25', dateUTC: '2025-04-13', title: 'Full Moon', type: 'astronomy', icon: '🌕' },
                    { id: 'fm-may-25', dateUTC: '2025-05-12', title: 'Full Moon', type: 'astronomy', icon: '🌕' },
                    { id: 'fm-jun-25', dateUTC: '2025-06-11', title: 'Full Moon', type: 'astronomy', icon: '🌕' },
                    { id: 'fm-jul-25', dateUTC: '2025-07-10', title: 'Full Moon', type: 'astronomy', icon: '🌕' },
                    { id: 'fm-aug-25', dateUTC: '2025-08-09', title: 'Full Moon', type: 'astronomy', icon: '🌕' },
                    { id: 'fm-sep-25', dateUTC: '2025-09-07', title: 'Full Moon', type: 'astronomy', icon: '🌕' },
                    { id: 'fm-oct-25', dateUTC: '2025-10-07', title: 'Full Moon', type: 'astronomy', icon: '🌕' },
                    { id: 'fm-nov-25', dateUTC: '2025-11-05', title: 'Full Moon', type: 'astronomy', icon: '🌕' },
                    { id: 'fm-dec-25', dateUTC: '2025-12-04', title: 'Full Moon', type: 'astronomy', icon: '🌕' }
                ];

                FALLBACK_MOONS.forEach(evt => {
                    // Ensure date is treated as Noon to avoid localized midnight shifts
                    const safeDate = new Date(evt.dateUTC + (evt.dateUTC.includes('T') ? '' : 'T12:00:00'));
                    if (safeDate >= startDate && safeDate <= endDate) {
                        fetchedEvents.push({
                            ...evt,
                            eventDate: safeDate,
                            isGlobal: true
                        });
                    }
                });
            }

            // Sort merged events
            fetchedEvents.sort((a, b) => a.eventDate - b.eventDate);

            console.log("CALENDAR EVENTS:", fetchedEvents);
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
