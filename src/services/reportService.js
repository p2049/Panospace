import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Submit a report for a post
 * @param {string} postId 
 * @param {string} reporterId 
 * @param {string} reason 
 */
export const submitPostReport = async (postId, reporterId, reason = 'General Report') => {
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
 * @param {string} userId 
 * @param {string} reporterId 
 * @param {string} reason 
 */
export const submitProfileReport = async (userId, reporterId, reason = 'General Report') => {
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
