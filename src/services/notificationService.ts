import { db } from '@/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    orderBy,
    limit,
    serverTimestamp,
    type Timestamp
} from 'firebase/firestore';
import { logger } from '@/core/utils/logger';

export interface NotificationInput {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    imageUrl?: string | null;
    actorId?: string;    // ID of the user who performed the action
    actorName?: string;  // Name of the user who performed the action
}

export interface Notification extends NotificationInput {
    id: string;
    read: boolean;
    createdAt: Timestamp;
}

/**
 * Create a notification
 */
export const createNotification = async (notificationData: NotificationInput): Promise<Notification> => {
    try {
        const notificationsRef = collection(db, 'notifications');
        const notification = {
            ...notificationData,
            read: false,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(notificationsRef, notification);
        return { id: docRef.id, ...notification } as unknown as Notification;
    } catch (error) {
        logger.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId: string, limitCount: number = 50): Promise<Notification[]> => {
    try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    } catch (error) {
        logger.error('Error getting notifications:', error);
        throw error;
    }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
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
        logger.error('Error getting unread count:', error);
        return 0;
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            read: true
        });
    } catch (error) {
        logger.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
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
        logger.error('Error marking all as read:', error);
        throw error;
    }
};

/**
 * Interaction Notification Helpers
 */

// Notify user when someone follows them
export const notifyUserFollowed = async (targetUserId: string, followerId: string, followerName: string): Promise<Notification> => {
    return createNotification({
        userId: targetUserId,
        type: 'user_followed',
        title: 'New Space Added',
        message: `${followerName} added you to their space`,
        actionUrl: `/profile/${followerId}`,
        actorId: followerId,
        actorName: followerName
    });
};

// Notify user when someone rates their post (Stars)
export const notifyPostRated = async (postAuthorId: string, postId: string, raterId: string, raterName: string, rating: number): Promise<Notification | null> => {
    if (postAuthorId === raterId) return null; // Don't notify self

    return createNotification({
        userId: postAuthorId,
        type: 'post_rated',
        title: 'New Rating',
        message: `${raterName} rated your post ${rating} stars`,
        actionUrl: `/post/${postId}`,
        actorId: raterId,
        actorName: raterName
    });
};

// Notify user when someone likes their post (Smiley)
export const notifyPostLiked = async (postAuthorId: string, postId: string, likerId: string, likerName: string): Promise<Notification | null> => {
    if (postAuthorId === likerId) return null; // Don't notify self

    return createNotification({
        userId: postAuthorId,
        type: 'post_liked',
        title: 'New Interaction',
        message: `${likerName} liked your post`,
        actionUrl: `/post/${postId}`,
        actorId: likerId,
        actorName: likerName
    });
};


/**
 * Magazine-specific notification helpers
 */

// Notify creator of new submission
export const notifyNewSubmission = async (creatorId: string, magazineTitle: string, submitterName: string, issueNumber: number | string): Promise<Notification> => {
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
export const notifySubmissionApproved = async (contributorId: string, magazineTitle: string, issueNumber: number | string): Promise<Notification> => {
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
export const notifySubmissionRejected = async (contributorId: string, magazineTitle: string, issueNumber: number | string): Promise<Notification> => {
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
export const notifyMagazinePublished = async (followerIds: string[], magazineTitle: string, issueNumber: number | string, magazineId: string): Promise<Notification[]> => {
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
export const notifyDeadlineApproaching = async (contributorIds: string[], magazineTitle: string, issueNumber: number | string, deadline: Date): Promise<Notification[]> => {
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
