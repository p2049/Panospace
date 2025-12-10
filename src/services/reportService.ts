import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Submit a report for a post
 */
export const submitPostReport = async (postId: string, reporterId: string, reason: string = 'General Report'): Promise<boolean> => {
    try {
        await addDoc(collection(db, 'reports'), {
            type: 'post',
            targetId: postId,
            reporterId,
            reason,
            timestamp: serverTimestamp(),
            status: 'pending'
        });
        return true;
    } catch (error) {
        console.error('Error submitting post report:', error);
        throw error;
    }
};

/**
 * Submit a report for a user profile
 */
export const submitProfileReport = async (userId: string, reporterId: string, reason: string = 'General Report'): Promise<boolean> => {
    try {
        await addDoc(collection(db, 'reports'), {
            type: 'profile',
            targetId: userId,
            reporterId,
            reason,
            timestamp: serverTimestamp(),
            status: 'pending'
        });
        return true;
    } catch (error) {
        console.error('Error submitting profile report:', error);
        throw error;
    }
};
