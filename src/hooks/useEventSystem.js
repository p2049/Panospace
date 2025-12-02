import { useState, useEffect } from 'react';
import { useCountdown } from './useCountdown';
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    addDoc,
    doc,
    serverTimestamp,
    orderBy,
    Timestamp,
    limit,
    updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export const useEventSystem = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check if an exact tag set already exists on any active event
    const checkTagSetAvailability = async (tagArray) => {
        const now = new Date();

        try {
            // Get all active events
            const q = query(
                collection(db, 'events'),
                where('expiresAt', '>', Timestamp.fromDate(now))
            );
            const snapshot = await getDocs(q);

            // Normalize the input tag array for comparison
            const normalizedInput = tagArray.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, '')).sort();

            // Check if any active event has the exact same tag set
            for (const doc of snapshot.docs) {
                const eventTags = doc.data().requiredTags || [];
                const normalizedEventTags = eventTags.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, '')).sort();

                // Compare arrays
                if (normalizedInput.length === normalizedEventTags.length &&
                    normalizedInput.every((tag, index) => tag === normalizedEventTags[index])) {
                    return false; // Exact match found, not available
                }
            }

            return true; // No exact match, available
        } catch (err) {
            console.error("Error checking tag set availability:", err);
            return false; // Assume not available on error to be safe
        }
    };

    // Generate a unique tag set by appending numbers if needed
    const generateUniqueTagSet = async (baseTagArray) => {
        // Normalize base tags
        let tags = baseTagArray.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(t => t);
        if (tags.length === 0) tags = ['event'];

        let isAvailable = await checkTagSetAvailability(tags);
        if (isAvailable) return tags;

        // If exact set exists, append number to the first tag
        let counter = 2;
        while (true) {
            const modifiedTags = [...tags];
            modifiedTags[0] = `${tags[0]}${counter}`;

            isAvailable = await checkTagSetAvailability(modifiedTags);
            if (isAvailable) return modifiedTags;

            counter++;
            // Safety break
            if (counter > 100) throw new Error("Could not generate unique tag set");
        }
    };

    // Create a new event
    const createEvent = async (eventData, user) => {
        setLoading(true);
        setError(null);
        try {
            const newEvent = {
                ...eventData,
                createdBy: user.uid,
                creatorName: user.displayName || 'Anonymous',
                creatorPhoto: user.photoURL || null,
                createdAt: serverTimestamp(),
                // Ensure dates are Timestamps
                startTime: Timestamp.fromDate(new Date(eventData.startTime)),
                expiresAt: Timestamp.fromDate(new Date(eventData.expiresAt)),
                dropTime: eventData.isTimedDrop ? Timestamp.fromDate(new Date(eventData.dropTime)) : null,
                isExpired: false,
                participantCount: 0,
                requiredTags: eventData.requiredTags || []
            };

            const docRef = await addDoc(collection(db, 'events'), newEvent);
            setLoading(false);
            return { id: docRef.id, ...newEvent };
        } catch (err) {
            console.error("Error creating event:", err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    // Submit a post to an event
    const submitToEvent = async (eventId, post, user) => {
        setLoading(true);
        setError(null);
        try {
            // Check if already submitted
            const q = query(
                collection(db, 'eventSubmissions'),
                where('eventId', '==', eventId),
                where('createdBy', '==', user.uid),
                where('postId', '==', post.id)
            );
            const existing = await getDocs(q);
            if (!existing.empty) {
                throw new Error("You have already submitted this post to this event.");
            }

            const submission = {
                eventId,
                postId: post.id,
                postImage: post.imageUrl || post.images?.[0]?.url,
                createdBy: user.uid,
                creatorName: user.displayName || 'Anonymous',
                creatorPhoto: user.photoURL || null,
                submittedAt: serverTimestamp(),
                visible: true
            };

            await addDoc(collection(db, 'eventSubmissions'), submission);
            setLoading(false);
            return true;
        } catch (err) {
            console.error("Error submitting to event:", err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    return { createEvent, submitToEvent, checkTagSetAvailability, generateUniqueTagSet, loading, error };
};

export const useEvent = (eventId) => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!eventId) return;

        const fetchEvent = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'events', eventId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    let data = { id: docSnap.id, ...docSnap.data() };

                    // Check expiration
                    if (!data.isExpired && data.expiresAt) {
                        const now = new Date();
                        const expires = data.expiresAt.toDate();
                        if (now > expires) {
                            data.isExpired = true;
                            // Lazy update
                            try {
                                await updateDoc(docRef, { isExpired: true });
                            } catch (e) {
                                console.error("Failed to update expiration status:", e);
                            }
                        }
                    }

                    setEvent(data);
                } else {
                    setError("Event not found");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

    return { event, loading, error };
};

export const useEventSubmissions = (eventId, isTimedDrop, dropTime) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const { isExpired } = useCountdown(isTimedDrop ? dropTime : null);
    const isRevealed = !isTimedDrop || !dropTime || isExpired;

    useEffect(() => {
        if (!eventId) return;

        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'eventSubmissions'),
                    where('eventId', '==', eventId),
                    orderBy('submittedAt', 'desc'),
                    limit(50)
                );

                const snapshot = await getDocs(q);
                const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSubmissions(subs);
            } catch (err) {
                console.error("Error fetching submissions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [eventId, isTimedDrop, dropTime]);

    return { submissions, loading, isRevealed };
};
