import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { validateSubmission } from '@/core/utils/eventValidation';
import { getDerivedDate } from '@/core/utils/dates';

export const useEventSubmissions = (eventId) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch submissions for an event
    const fetchSubmissions = async () => {
        if (!eventId) return;

        setLoading(true);
        setError(null);

        try {
            const submissionsRef = collection(db, 'events', eventId, 'submissions');
            const q = query(submissionsRef, orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);

            const subs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setSubmissions(subs);
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Submit a post to an event
    const submitPost = async (post, event, user) => {
        if (!post || !event || !user) {
            throw new Error('Missing required data');
        }

        // Validate submission
        const validation = validateSubmission(post, event);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        try {
            const submissionsRef = collection(db, 'events', event.id, 'submissions');

            const submissionData = {
                postId: post.id,
                userId: user.uid,
                userDisplayName: user.displayName || 'Anonymous',
                userPhotoURL: user.photoURL || null,
                timestamp: Timestamp.now(),
                derivedDate: getDerivedDate(post) || null,
                metadataSnapshot: {
                    exif: post.exif || null,
                    manualExif: post.manualExif || null,
                    filmMetadata: post.filmMetadata || null,
                    location: post.location || null,
                    park: post.parkId ? { parkId: post.parkId, parkName: post.parkName } : null,
                    tags: post.tags || []
                },
                validationStatus: 'approved',
                validationErrors: []
            };

            const docRef = await addDoc(submissionsRef, submissionData);
            return { id: docRef.id, ...submissionData };
        } catch (err) {
            console.error('Error submitting post:', err);
            throw err;
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchSubmissions();
        }
    }, [eventId]);

    return {
        submissions,
        loading,
        error,
        submitPost,
        refetch: fetchSubmissions
    };
};
