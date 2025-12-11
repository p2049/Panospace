import { db } from '@/firebase';
import {
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    deleteDoc,
    runTransaction,
    collection,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    increment,
    Timestamp,
    updateDoc,
    type DocumentData,
    type Transaction
} from 'firebase/firestore';

import { MODERATION_THRESHOLDS, MODERATION_STATUS, REPORT_STATUS } from '@/core/constants/moderationConstants';
import { logger } from '@/core/utils/logger';

export interface ReportInput {
    reporterUid: string;
    reporterName: string;
    category: string;
    reason: string;
    detail?: string;
}

export interface Report extends ReportInput {
    id: string;
    targetType: 'post' | 'user';
    targetId: string;
    createdAt: Timestamp;
    status: string;
    reviewedBy: string | null;
    reviewedAt: Timestamp | null;
    reviewNotes: string;
}

export interface ModerationFlags {
    isFlagged: boolean;
    hiddenFromExplore: boolean;
    hiddenFromSearch: boolean;
    requiresReview: boolean;
    lastReportAt: any; // Timestamp or FieldValue
}

export const ModerationService = {
    /**
     * Submit a report for content
     */
    reportContent: async (targetType: 'post' | 'user', targetId: string, reportData: ReportInput): Promise<string> => {
        try {
            const { reporterUid, reporterName, category, reason, detail } = reportData;

            // Check if user already reported this target
            const existingReport = await ModerationService.checkExistingReport(reporterUid, targetType, targetId);
            if (existingReport) {
                throw new Error('You have already reported this content');
            }

            // Create report
            return await runTransaction(db, async (transaction: Transaction) => {
                const reportRef = doc(collection(db, 'reports'));
                const targetRef = doc(db, targetType === 'post' ? 'posts' : 'users', targetId);

                // Add report
                transaction.set(reportRef, {
                    targetType,
                    targetId,
                    reporterUid,
                    reporterName,
                    category,
                    reason,
                    detail: detail || '',
                    createdAt: serverTimestamp(),
                    status: REPORT_STATUS.PENDING,
                    reviewedBy: null,
                    reviewedAt: null,
                    reviewNotes: ''
                });

                // Increment report count on target
                transaction.update(targetRef, {
                    reportCount: increment(1),
                    'reportFlags.lastReportAt': serverTimestamp()
                });

                return reportRef.id;
            });
        } catch (error) {
            logger.error('Error submitting report:', error);
            throw error;
        }
    },

    /**
     * Check if user already reported this target
     */
    checkExistingReport: async (reporterUid: string, targetType: string, targetId: string): Promise<boolean> => {
        try {
            const q = query(
                collection(db, 'reports'),
                where('reporterUid', '==', reporterUid),
                where('targetType', '==', targetType),
                where('targetId', '==', targetId),
                limit(1)
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking existing report:', error);
            return false;
        }
    },

    /**
     * Get all reports for a target
     */
    getReportsByTarget: async (targetType: string, targetId: string): Promise<Report[]> => {
        try {
            const q = query(
                collection(db, 'reports'),
                where('targetType', '==', targetType),
                where('targetId', '==', targetId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    },

    /**
     * Get recent reports (within time window)
     */
    getRecentReports: async (targetType: string, targetId: string, hoursAgo: number = 24): Promise<Report[]> => {
        try {
            const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
            const reports = await ModerationService.getReportsByTarget(targetType, targetId);

            return reports.filter(report => {
                const reportTime = report.createdAt?.toDate();
                return reportTime && reportTime > cutoffTime;
            });
        } catch (error) {
            console.error('Error fetching recent reports:', error);
            return [];
        }
    },

    /**
     * Update moderation flags based on thresholds
     */
    updateModerationFlags: async (targetType: 'post' | 'user', targetId: string): Promise<{ flags: ModerationFlags; moderationStatus: string }> => {
        try {
            const targetRef = doc(db, targetType === 'post' ? 'posts' : 'users', targetId);
            const targetDoc = await getDoc(targetRef);

            if (!targetDoc.exists()) {
                throw new Error('Target not found');
            }

            const totalReports = targetDoc.data()?.reportCount || 0;
            const recentReports = await ModerationService.getRecentReports(targetType, targetId, 24);

            const flags: ModerationFlags = {
                isFlagged: totalReports >= MODERATION_THRESHOLDS.FLAGGED,
                hiddenFromExplore: recentReports.length >= MODERATION_THRESHOLDS.HIDE_EXPLORE,
                hiddenFromSearch: totalReports >= MODERATION_THRESHOLDS.HIDE_SEARCH,
                requiresReview: totalReports >= MODERATION_THRESHOLDS.ADMIN_REVIEW,
                lastReportAt: serverTimestamp()
            };

            // Determine moderation status
            let moderationStatus: string = MODERATION_STATUS.ACTIVE;
            if (totalReports >= MODERATION_THRESHOLDS.AUTO_HIDE) {
                moderationStatus = MODERATION_STATUS.HIDDEN;
            } else if (flags.requiresReview) {
                moderationStatus = MODERATION_STATUS.FLAGGED;
            }

            await updateDoc(targetRef, {
                reportFlags: flags,
                moderationStatus
            });

            // Notify creator if threshold crossed
            if (totalReports === MODERATION_THRESHOLDS.ADMIN_REVIEW) {
                await ModerationService.notifyCreator(targetType, targetId, 'review_required');
            }

            return { flags, moderationStatus };
        } catch (error) {
            console.error('Error updating moderation flags:', error);
            throw error;
        }
    },

    /**
     * Check thresholds after report submission
     */
    checkReportThresholds: async (targetType: 'post' | 'user', targetId: string) => {
        return await ModerationService.updateModerationFlags(targetType, targetId);
    },

    /**
     * Get all pending reports for admin review
     */
    getPendingReports: async (filters: { category?: string } = {}): Promise<Report[]> => {
        try {
            let q = query(
                collection(db, 'reports'),
                where('status', '==', REPORT_STATUS.PENDING),
                orderBy('createdAt', 'desc')
            );

            if (filters.category) {
                q = query(
                    collection(db, 'reports'),
                    where('status', '==', REPORT_STATUS.PENDING),
                    where('category', '==', filters.category),
                    orderBy('createdAt', 'desc')
                );
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
        } catch (error) {
            console.error('Error fetching pending reports:', error);
            return [];
        }
    },

    /**
     * Dismiss a report (admin action)
     */
    dismissReport: async (reportId: string, adminUid: string, notes?: string): Promise<boolean> => {
        try {
            const reportRef = doc(db, 'reports', reportId);
            await updateDoc(reportRef, {
                status: REPORT_STATUS.DISMISSED,
                reviewedBy: adminUid,
                reviewedAt: serverTimestamp(),
                reviewNotes: notes || 'Report dismissed'
            });
            return true;
        } catch (error) {
            console.error('Error dismissing report:', error);
            return false;
        }
    },

    /**
     * Take action on a report (admin action)
     */
    actionReport: async (reportId: string, adminUid: string, action: 'remove' | 'hide' | 'clear', notes?: string): Promise<boolean> => {
        try {
            const reportRef = doc(db, 'reports', reportId);
            const reportDoc = await getDoc(reportRef);

            if (!reportDoc.exists()) {
                throw new Error('Report not found');
            }

            const reportData = reportDoc.data();
            const targetRef = doc(db, reportData.targetType === 'post' ? 'posts' : 'users', reportData.targetId);

            return await runTransaction(db, async (transaction) => {
                // Update report status
                transaction.update(reportRef, {
                    status: REPORT_STATUS.ACTIONED,
                    reviewedBy: adminUid,
                    reviewedAt: serverTimestamp(),
                    reviewNotes: notes || `Action taken: ${action}`
                });

                // Apply action to target
                if (action === 'remove') {
                    transaction.update(targetRef, {
                        moderationStatus: MODERATION_STATUS.REMOVED,
                        'reportFlags.requiresReview': false
                    });
                } else if (action === 'hide') {
                    transaction.update(targetRef, {
                        moderationStatus: MODERATION_STATUS.HIDDEN,
                        'reportFlags.hiddenFromExplore': true,
                        'reportFlags.hiddenFromSearch': true
                    });
                } else if (action === 'clear') {
                    transaction.update(targetRef, {
                        reportCount: 0,
                        moderationStatus: MODERATION_STATUS.ACTIVE,
                        reportFlags: {
                            isFlagged: false,
                            hiddenFromExplore: false,
                            hiddenFromSearch: false,
                            requiresReview: false,
                            lastReportAt: null
                        }
                    });
                }

                return true;
            });
        } catch (error) {
            console.error('Error actioning report:', error);
            return false;
        }
    },

    /**
     * Notify creator about moderation action
     */
    notifyCreator: async (targetType: string, targetId: string, notificationType: string): Promise<boolean> => {
        try {
            // TODO: Implement notification system
            // For now, just log
            logger.log(`Notification: ${notificationType} for ${targetType} ${targetId}`);
            return true;
        } catch (error) {
            logger.error('Error notifying creator:', error);
            return false;
        }
    },

    /**
     * Content detection hooks (placeholders for future AI integration)
     */
    detectNSFW: async (imageUrl: string): Promise<any> => {
        // TODO: Integrate with Clarifai, AWS Rekognition, or similar
        // For now, return null
        return null;
    },

    detectMeme: async (imageUrl: string): Promise<any> => {
        // TODO: Heuristics for meme detection
        // - Large text overlay detection
        // - Impact font detection
        // - Common meme template matching
        return null;
    },

    detectStolenArt: async (imageUrl: string): Promise<any> => {
        // TODO: Reverse image search
        // - Google Vision API
        // - TinEye API
        // - Custom fingerprinting
        return null;
    },

    detectAIArt: async (imageUrl: string): Promise<any> => {
        // TODO: AI-generated art detection
        // - Hive Moderation API
        // - Custom model
        return null;
    },

    // ==========================================
    // USER BLOCKING & MUTING
    // ==========================================

    /**
     * Block a user - their content will be hidden and they cannot interact with you
     */
    blockUser: async (blockerId: string, blockedUserId: string): Promise<void> => {
        // TODO: Implement user blocking
        // - Add to user's blockedUsers subcollection
        // - Optionally notify the blocked user (app discretion)
        // - Remove any existing follows between users
        const blockerRef = doc(db, 'users', blockerId, 'blockedUsers', blockedUserId);
        await setDoc(blockerRef, {
            blockedAt: serverTimestamp(),
            userId: blockedUserId
        });
        logger.log(`User ${blockerId} blocked user ${blockedUserId}`);
    },

    /**
     * Unblock a previously blocked user
     */
    unblockUser: async (blockerId: string, blockedUserId: string): Promise<void> => {
        // TODO: Implement user unblocking
        const blockerRef = doc(db, 'users', blockerId, 'blockedUsers', blockedUserId);
        await deleteDoc(blockerRef);
        logger.log(`User ${blockerId} unblocked user ${blockedUserId}`);
    },

    /**
     * Get list of users blocked by a specific user
     */
    getBlockedUsers: async (userId: string): Promise<string[]> => {
        // TODO: Implement fetching blocked users list
        const blockedRef = collection(db, 'users', userId, 'blockedUsers');
        const snapshot = await getDocs(blockedRef);
        return snapshot.docs.map(doc => doc.id);
    },

    /**
     * Check if a user is blocked
     */
    isUserBlocked: async (blockerId: string, targetUserId: string): Promise<boolean> => {
        const blockerRef = doc(db, 'users', blockerId, 'blockedUsers', targetUserId);
        const snapshot = await getDoc(blockerRef);
        return snapshot.exists();
    },

    /**
     * Mute a user - hide their content from your feed without blocking
     */
    muteUser: async (muterId: string, mutedUserId: string): Promise<void> => {
        // TODO: Implement user muting
        // - Add to user's mutedUsers subcollection
        // - Content from muted users filtered in feed queries
        const muterRef = doc(db, 'users', muterId, 'mutedUsers', mutedUserId);
        await setDoc(muterRef, {
            mutedAt: serverTimestamp(),
            userId: mutedUserId
        });
        logger.log(`User ${muterId} muted user ${mutedUserId}`);
    },

    /**
     * Unmute a previously muted user
     */
    unmuteUser: async (muterId: string, mutedUserId: string): Promise<void> => {
        // TODO: Implement user unmuting
        const muterRef = doc(db, 'users', muterId, 'mutedUsers', mutedUserId);
        await deleteDoc(muterRef);
        logger.log(`User ${muterId} unmuted user ${mutedUserId}`);
    },

    /**
     * Get list of users muted by a specific user
     */
    getMutedUsers: async (userId: string): Promise<string[]> => {
        // TODO: Implement fetching muted users list
        const mutedRef = collection(db, 'users', userId, 'mutedUsers');
        const snapshot = await getDocs(mutedRef);
        return snapshot.docs.map(doc => doc.id);
    },

    // ==========================================
    // APPEALS
    // ==========================================

    /**
     * Submit an appeal for a moderation action
     */
    appealReport: async (
        reportId: string,
        userId: string,
        reason: string
    ): Promise<string> => {
        // TODO: Implement appeal submission
        // - Create appeal document linked to original report
        // - Notify moderation team
        // - Track appeal status
        const appealsRef = collection(db, 'moderationAppeals');
        const appealDoc = await addDoc(appealsRef, {
            reportId,
            appealedBy: userId,
            reason,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        logger.log(`Appeal submitted for report ${reportId} by user ${userId}`);
        return appealDoc.id;
    },

    /**
     * Get appeals for a specific report
     */
    getAppealsForReport: async (reportId: string): Promise<any[]> => {
        const appealsRef = collection(db, 'moderationAppeals');
        const q = query(appealsRef, where('reportId', '==', reportId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Process an appeal (admin action)
     */
    processAppeal: async (
        appealId: string,
        decision: 'approved' | 'rejected',
        moderatorId: string,
        notes?: string
    ): Promise<void> => {
        // TODO: Implement appeal processing
        // - Update appeal status
        // - If approved, reverse the original moderation action
        // - Notify the user of the decision
        const appealRef = doc(db, 'moderationAppeals', appealId);
        await updateDoc(appealRef, {
            status: decision,
            processedBy: moderatorId,
            processedAt: serverTimestamp(),
            notes: notes || null,
            updatedAt: serverTimestamp()
        });
        logger.log(`Appeal ${appealId} ${decision} by moderator ${moderatorId}`);
    }
};
