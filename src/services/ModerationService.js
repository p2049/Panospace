import { db } from '@/firebase';
import { doc, getDoc, getDocs, addDoc, updateDoc, runTransaction, collection, query, where, orderBy, limit, serverTimestamp, increment } from 'firebase/firestore';
import { MODERATION_THRESHOLDS, MODERATION_STATUS, REPORT_STATUS } from '@/core/constants/moderationConstants';

export const ModerationService = {
    /**
     * Submit a report for content
     */
    reportContent: async (targetType, targetId, reportData) => {
        try {
            const { reporterUid, reporterName, category, reason, detail } = reportData;

            // Check if user already reported this target
            const existingReport = await ModerationService.checkExistingReport(reporterUid, targetType, targetId);
            if (existingReport) {
                throw new Error('You have already reported this content');
            }

            // Create report
            return await runTransaction(db, async (transaction) => {
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
            console.error('Error submitting report:', error);
            throw error;
        }
    },

    /**
     * Check if user already reported this target
     */
    checkExistingReport: async (reporterUid, targetType, targetId) => {
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
    getReportsByTarget: async (targetType, targetId) => {
        try {
            const q = query(
                collection(db, 'reports'),
                where('targetType', '==', targetType),
                where('targetId', '==', targetId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    },

    /**
     * Get recent reports (within time window)
     */
    getRecentReports: async (targetType, targetId, hoursAgo = 24) => {
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
    updateModerationFlags: async (targetType, targetId) => {
        try {
            const targetRef = doc(db, targetType === 'post' ? 'posts' : 'users', targetId);
            const targetDoc = await getDoc(targetRef);

            if (!targetDoc.exists()) {
                throw new Error('Target not found');
            }

            const totalReports = targetDoc.data().reportCount || 0;
            const recentReports = await ModerationService.getRecentReports(targetType, targetId, 24);

            const flags = {
                isFlagged: totalReports >= MODERATION_THRESHOLDS.FLAGGED,
                hiddenFromExplore: recentReports.length >= MODERATION_THRESHOLDS.HIDE_EXPLORE,
                hiddenFromSearch: totalReports >= MODERATION_THRESHOLDS.HIDE_SEARCH,
                requiresReview: totalReports >= MODERATION_THRESHOLDS.ADMIN_REVIEW,
                lastReportAt: serverTimestamp()
            };

            // Determine moderation status
            let moderationStatus = MODERATION_STATUS.ACTIVE;
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
    checkReportThresholds: async (targetType, targetId) => {
        return await ModerationService.updateModerationFlags(targetType, targetId);
    },

    /**
     * Get all pending reports for admin review
     */
    getPendingReports: async (filters = {}) => {
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
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching pending reports:', error);
            return [];
        }
    },

    /**
     * Dismiss a report (admin action)
     */
    dismissReport: async (reportId, adminUid, notes) => {
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
    actionReport: async (reportId, adminUid, action, notes) => {
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
    notifyCreator: async (targetType, targetId, notificationType) => {
        try {
            // TODO: Implement notification system
            // For now, just log
            console.log(`Notification: ${notificationType} for ${targetType} ${targetId}`);
            return true;
        } catch (error) {
            console.error('Error notifying creator:', error);
            return false;
        }
    },

    /**
     * Content detection hooks (placeholders for future AI integration)
     */
    detectNSFW: async (imageUrl) => {
        // TODO: Integrate with Clarifai, AWS Rekognition, or similar
        // For now, return null
        return null;
    },

    detectMeme: async (imageUrl) => {
        // TODO: Heuristics for meme detection
        // - Large text overlay detection
        // - Impact font detection
        // - Common meme template matching
        return null;
    },

    detectStolenArt: async (imageUrl) => {
        // TODO: Reverse image search
        // - Google Vision API
        // - TinEye API
        // - Custom fingerprinting
        return null;
    },

    detectAIArt: async (imageUrl) => {
        // TODO: AI-generated art detection
        // - Hive Moderation API
        // - Custom model
        return null;
    }
};
