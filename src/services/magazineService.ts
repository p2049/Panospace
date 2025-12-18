import { db } from '@/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp, orderBy, limit, DocumentData } from 'firebase/firestore';
import { logger } from '@/core/utils/logger';

export interface Magazine {
    id: string;
    type: 'magazine';
    title?: string;
    description?: string;
    coverImage?: string;
    ownerId: string;
    galleryId?: string;
    issueCount: number;
    visibility: 'public' | 'private';
    releaseFrequency?: 'monthly' | 'bi-monthly' | string;
    releaseDay?: number;
    releaseTime?: string;
    createdAt?: any;
    updatedAt?: any;
    [key: string]: any;
}

export interface MagazineIssue {
    id: string;
    magazineId: string;
    title?: string;
    issueNumber: number;
    status: 'draft' | 'queued' | 'published';
    createdAt?: any;
    publishedAt?: any;
    updatedAt?: any;
    [key: string]: any;
}

/**
 * Create a new magazine
 */
export const createMagazine = async (magazineData: Partial<Magazine>): Promise<Magazine> => {
    try {
        const magazineRef = collection(db, 'magazines');

        const newMagazine = {
            ...magazineData,
            type: 'magazine',
            issueCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(magazineRef, newMagazine);
        return { id: docRef.id, ...newMagazine } as Magazine;
    } catch (error) {
        logger.error('Error creating magazine:', error);
        throw error;
    }
};

/**
 * Get a magazine by ID
 */
export const getMagazine = async (magazineId: string): Promise<Magazine> => {
    try {
        const magazineRef = doc(db, 'magazines', magazineId);
        const magazineSnap = await getDoc(magazineRef);

        if (magazineSnap.exists()) {
            return { id: magazineSnap.id, ...magazineSnap.data() } as Magazine;
        } else {
            throw new Error('Magazine not found');
        }
    } catch (error) {
        logger.error('Error getting magazine:', error);
        throw error;
    }
};

/**
 * Update a magazine
 */
export const updateMagazine = async (magazineId: string, updates: Partial<Magazine>): Promise<void> => {
    try {
        const magazineRef = doc(db, 'magazines', magazineId);
        await updateDoc(magazineRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        logger.error('Error updating magazine:', error);
        throw error;
    }
};

/**
 * Delete a magazine
 */
export const deleteMagazine = async (magazineId: string): Promise<void> => {
    try {
        const magazineRef = doc(db, 'magazines', magazineId);
        await deleteDoc(magazineRef);
    } catch (error) {
        logger.error('Error deleting magazine:', error);
        throw error;
    }
};

/**
 * Get magazines by owner
 */
export const getMagazinesByOwner = async (ownerId: string): Promise<Magazine[]> => {
    try {
        const magazinesRef = collection(db, 'magazines');
        const q = query(
            magazinesRef,
            where('ownerId', '==', ownerId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Magazine));
    } catch (error) {
        logger.error('Error getting magazines by owner:', error);
        throw error;
    }
};

/**
 * Get magazines by gallery
 */
export const getMagazinesByGallery = async (galleryId: string): Promise<Magazine[]> => {
    try {
        const magazinesRef = collection(db, 'magazines');
        const q = query(
            magazinesRef,
            where('galleryId', '==', galleryId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Magazine));
    } catch (error) {
        logger.error('Error getting magazines by gallery:', error);
        throw error;
    }
};

/**
 * Calculate next release date based on frequency
 */
export const calculateNextReleaseDate = (releaseFrequency: string, releaseDay: number, releaseTime: string): Date => {
    const now = new Date();
    const parts = releaseTime.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;

    let nextDate = new Date();

    if (releaseFrequency === 'monthly') {
        // For monthly, use the specified day of the month
        nextDate.setDate(releaseDay);
        nextDate.setHours(hours, minutes, 0, 0);

        // If the date has passed this month, move to next month
        if (nextDate <= now) {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
    } else if (releaseFrequency === 'bi-monthly') {
        // For bi-monthly, use the specified day but add 2 months
        nextDate.setHours(hours, minutes, 0, 0);

        // If the date has passed this month, move to next period (2 months)
        if (nextDate <= now) {
            nextDate.setMonth(nextDate.getMonth() + 2);
        }
    }

    return nextDate;
};

/**
 * Search magazines
 */
export const searchMagazines = async (searchTerm: string | null = null, lastDoc: any = null, limitCount: number = 20): Promise<{ data: Magazine[], lastDoc: any }> => {
    try {
        const magazinesRef = collection(db, 'magazines');
        let q;

        if (searchTerm) {
            // Search by title (case-insensitive search would require additional indexing)
            q = query(
                magazinesRef,
                where('visibility', '==', 'public'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        } else {
            q = query(
                magazinesRef,
                where('visibility', '==', 'public'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }

        const querySnapshot = await getDocs(q);
        const magazines = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Magazine));
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        return {
            data: magazines,
            lastDoc: lastVisible
        };
    } catch (error) {
        logger.error('Error searching magazines:', error);
        throw error;
    }
};

/**
 * Get issues for a magazine
 */
export const getMagazineIssues = async (magazineId: string, status: string | null = null): Promise<MagazineIssue[]> => {
    try {
        const issuesRef = collection(db, 'magazineIssues');
        let q;

        if (status) {
            q = query(
                issuesRef,
                where('magazineId', '==', magazineId),
                where('status', '==', status),
                orderBy('issueNumber', 'desc')
            );
        } else {
            q = query(
                issuesRef,
                where('magazineId', '==', magazineId),
                orderBy('issueNumber', 'desc')
            );
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MagazineIssue));
    } catch (error) {
        logger.error('Error getting magazine issues:', error);
        throw error;
    }
};

/**
 * Get a single issue by ID
 */
export const getMagazineIssue = async (issueId: string): Promise<MagazineIssue> => {
    try {
        const issueRef = doc(db, 'magazineIssues', issueId);
        const issueSnap = await getDoc(issueRef);

        if (issueSnap.exists()) {
            return { id: issueSnap.id, ...issueSnap.data() } as MagazineIssue;
        } else {
            throw new Error('Issue not found');
        }
    } catch (error) {
        logger.error('Error getting issue:', error);
        throw error;
    }
};

/**
 * Publish a queued issue
 */
export const publishIssue = async (issueId: string): Promise<MagazineIssue> => {
    try {
        const issueRef = doc(db, 'magazineIssues', issueId);
        const issueSnap = await getDoc(issueRef);

        if (!issueSnap.exists()) {
            throw new Error('Issue not found');
        }

        const issue = issueSnap.data();

        // Update issue status
        await updateDoc(issueRef, {
            status: 'published',
            publishedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Update magazine issue count
        const magazineRef = doc(db, 'magazines', issue.magazineId);
        await updateDoc(magazineRef, {
            issueCount: (issue.issueNumber || 1),
            updatedAt: serverTimestamp()
        });

        return { id: issueId, ...issue, status: 'published' } as MagazineIssue;
    } catch (error) {
        logger.error('Error publishing issue:', error);
        throw error;
    }
};

/**
 * Delete an issue
 */
export const deleteIssue = async (issueId: string): Promise<void> => {
    try {
        const issueRef = doc(db, 'magazineIssues', issueId);
        await deleteDoc(issueRef);
    } catch (error) {
        logger.error('Error deleting issue:', error);
        throw error;
    }
};
