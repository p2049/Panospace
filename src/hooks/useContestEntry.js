import { useState, useCallback } from 'react';
import { db, functions } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { WalletService } from '../services/WalletService';

export const useContestEntry = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Check if user has already entered this contest with this post
     */
    const checkExistingEntry = useCallback(async (postId, contestId) => {
        try {
            const q = query(
                collection(db, `contests/${contestId}/entries`),
                where('postId', '==', postId),
                where('userId', '==', currentUser.uid)
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (err) {
            console.error('Error checking existing entry:', err);
            return false;
        }
    }, [currentUser]);

    /**
     * Enter a post into a contest
     */
    const enterContest = useCallback(async (postId, contestId) => {
        if (!currentUser) {
            throw new Error('Must be logged in to enter contest');
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Get contest details
            const contestDoc = await getDoc(doc(db, 'contests', contestId));
            if (!contestDoc.exists()) {
                throw new Error('Contest not found');
            }

            const contest = contestDoc.data();

            // 2. Check if contest is still accepting entries
            if (contest.status === 'closed') {
                throw new Error('Contest is closed');
            }

            if (contest.status === 'upcoming') {
                throw new Error('Contest has not started yet');
            }

            // 3. Check if already entered
            const alreadyEntered = await checkExistingEntry(postId, contestId);
            if (alreadyEntered) {
                throw new Error('You have already entered this contest with this post');
            }

            // 4. Validate entry using Cloud Function
            const validateEntryFn = httpsCallable(functions, 'validateEntry');
            const validationResult = await validateEntryFn({ postId, contestId });

            if (!validationResult.data.valid) {
                throw new Error(validationResult.data.errors.join(', '));
            }

            // 5. Handle payment for paid contests
            if (contest.entryType === 'paid' && contest.entryFee > 0) {
                await WalletService.subtractFunds(
                    currentUser.uid,
                    contest.entryFee,
                    'contest_entry',
                    `Entry fee for ${contest.title}`,
                    contestId,
                    'contest'
                );

                // Update contest prize pool
                await doc(db, 'contests', contestId).update({
                    totalPrizePool: (contest.totalPrizePool || contest.prizePool) + contest.entryFee
                });
            }

            // 6. Get post data for entry
            const postDoc = await getDoc(doc(db, 'posts', postId));
            const post = postDoc.data();

            // 7. Create entry
            await addDoc(collection(db, `contests/${contestId}/entries`), {
                postId,
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                userPhoto: currentUser.photoURL || null,
                submittedAt: serverTimestamp(),
                isValidEntry: true,
                imageUrl: post.imageUrl || post.items?.[0]?.url || '',
                title: post.title || 'Untitled'
            });

            // 8. Update contest entry count
            const entriesSnapshot = await getDocs(collection(db, `contests/${contestId}/entries`));
            await doc(db, 'contests', contestId).update({
                entryCount: entriesSnapshot.size
            });

            setLoading(false);
            return { success: true };
        } catch (err) {
            console.error('Error entering contest:', err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    }, [currentUser, checkExistingEntry]);

    /**
     * Get user's entries for a contest
     */
    const getUserEntries = useCallback(async (contestId) => {
        if (!currentUser) return [];

        try {
            const q = query(
                collection(db, `contests/${contestId}/entries`),
                where('userId', '==', currentUser.uid)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error('Error getting user entries:', err);
            return [];
        }
    }, [currentUser]);

    return {
        enterContest,
        checkExistingEntry,
        getUserEntries,
        loading,
        error
    };
};
