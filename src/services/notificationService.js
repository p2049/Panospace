import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, orderBy, limit, serverTimestamp } from 'firebase/firestore';

/**
 * Create a notification
 */
export const createNotification = async (notificationData) => {
    try {
        const notificationsRef = collection(db, 'notifications');
        const notification = {
            ...notificationData,
            read: false,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(notificationsRef, notification);
        return { id: docRef.id, ...notification };
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId, limitCount = 50) => {
    try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting notifications:', error);
        throw error;
    }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId) => {
    try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            read: true
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId) => {
    try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const querySnapshot = await getDocs(q);
        const updatePromises = querySnapshot.docs.map(doc =>
            updateDoc(doc.ref, { read: true })
        );

        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error marking all as read:', error);
        throw error;
    }
};

/**
 * Magazine-specific notification helpers
 */

// Notify creator of new submission
export const notifyNewSubmission = async (creatorId, magazineTitle, submitterName, issueNumber) => {
    return createNotification({
        userId: creatorId,
        type: 'magazine_submission',
        title: 'New Magazine Submission',
        message: `${submitterName} submitted photos for ${magazineTitle} Issue #${issueNumber}`,
        actionUrl: `/magazine/${magazineTitle}/curate`,
        imageUrl: null
    });
};

// Notify contributor of approval
export const notifySubmissionApproved = async (contributorId, magazineTitle, issueNumber) => {
    return createNotification({
        userId: contributorId,
        type: 'submission_approved',
        title: 'Submission Approved!',
        message: `Your photos were approved for ${magazineTitle} Issue #${issueNumber}`,
        actionUrl: `/magazine/${magazineTitle}`,
        imageUrl: null
    });
};

// Notify contributor of rejection
export const notifySubmissionRejected = async (contributorId, magazineTitle, issueNumber) => {
    return createNotification({
        userId: contributorId,
        type: 'submission_rejected',
        title: 'Submission Not Selected',
        message: `Your submission for ${magazineTitle} Issue #${issueNumber} was not selected this time`,
        actionUrl: `/magazine/${magazineTitle}`,
        imageUrl: null
    });
};

// Notify followers of published magazine
export const notifyMagazinePublished = async (followerIds, magazineTitle, issueNumber, magazineId) => {
    const notifications = followerIds.map(followerId =>
        createNotification({
            userId: followerId,
            type: 'magazine_published',
            title: 'New Magazine Issue!',
            message: `${magazineTitle} Issue #${issueNumber} is now available`,
            actionUrl: `/magazine/${magazineId}`,
            imageUrl: null
        })
    );

    return Promise.all(notifications);
};

// Notify contributors of approaching deadline
export const notifyDeadlineApproaching = async (contributorIds, magazineTitle, issueNumber, deadline) => {
    const notifications = contributorIds.map(contributorId =>
        createNotification({
            userId: contributorId,
            type: 'magazine_deadline',
            title: 'Submission Deadline Approaching',
            message: `Deadline for ${magazineTitle} Issue #${issueNumber} is ${deadline.toLocaleDateString()}`,
            actionUrl: `/magazine/${magazineTitle}`,
            imageUrl: null
        })
    );

    return Promise.all(notifications);
};
