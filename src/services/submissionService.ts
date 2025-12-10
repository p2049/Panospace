import { db } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface MagazineSubmission {
    id: string;
    issueId: string;
    status: string;
    reviewedAt?: any;
    approvedImageIndices?: number[];
    [key: string]: any;
}

/**
 * Get submissions for a magazine issue
 */
export const getIssueSubmissions = async (issueId: string, status: string | null = null): Promise<MagazineSubmission[]> => {
    try {
        const submissionsRef = collection(db, 'magazineSubmissions');
        let q;

        if (status) {
            q = query(
                submissionsRef,
                where('issueId', '==', issueId),
                where('status', '==', status)
            );
        } else {
            q = query(
                submissionsRef,
                where('issueId', '==', issueId)
            );
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MagazineSubmission));
    } catch (error) {
        console.error('Error getting submissions:', error);
        throw error;
    }
};

/**
 * Update submission status
 */
export const updateSubmissionStatus = async (submissionId: string, status: string): Promise<void> => {
    try {
        const submissionRef = doc(db, 'magazineSubmissions', submissionId);
        await updateDoc(submissionRef, {
            status,
            reviewedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating submission:', error);
        throw error;
    }
};

/**
 * Approve specific images from a submission
 */
export const approveSubmissionImages = async (submissionId: string, imageIndices: number[]): Promise<void> => {
    try {
        const submissionRef = doc(db, 'magazineSubmissions', submissionId);
        await updateDoc(submissionRef, {
            approvedImageIndices: imageIndices,
            status: 'approved',
            reviewedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error approving images:', error);
        throw error;
    }
};
