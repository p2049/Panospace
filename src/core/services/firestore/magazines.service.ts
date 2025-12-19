import { db, storage } from '@/firebase';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    increment,
    setDoc
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { logger } from '@/core/utils/logger';

export interface Magazine {
    id: string;
    ownerType: "user" | "studio";
    ownerId: string;
    title: string;
    description: string;
    coverImage?: string;
    visibility: 'public' | 'unlisted' | 'private';
    releaseFrequency: 'monthly' | 'bi-monthly' | string;
    nextReleaseDate: any;
    issueCount: number;
    collaborationEnabled: boolean;
    createdAt: any;
    updatedAt: any;
}

export interface MagazineIssue {
    id: string;
    magazineId: string;
    issueNumber: number;
    status: 'draft' | 'queued' | 'published';
    scheduledPublishDate?: any;
    publishedAt?: any;
    createdAt: any;
    updatedAt: any;
    slides?: any[]; // For older logic compatibility
}

export interface MagazinePage {
    id: string;
    pageIndex: number;
    layoutType: string;
    contentBlocks: any[];
    createdAt: any;
}

export const MagazineService = {
    async create(data: Partial<Magazine>, coverImageFile?: File): Promise<Magazine> {
        try {
            // Check Access if creating as a User
            if (data.ownerType === 'user') {
                if (!data.ownerId) throw new Error("Owner ID is required");
                const userRef = doc(db, 'users', data.ownerId);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.exists() ? userSnap.data() : { uid: data.ownerId };

                const { canAccessFeature, ACCESS_FEATURES } = await import('@/core/utils/accessControl');
                if (!canAccessFeature(userData, ACCESS_FEATURES.CREATE_MAGAZINE)) {
                    throw new Error("You must be a Space Creator (Ultra) or Partner to publish Magazines.");
                }
            }
            // If Studio, we assume Studio owner/admin logic covers checks or Studio creation was the gate.

            let coverImageUrl = '';
            if (coverImageFile) {
                const storageRef = ref(storage, `magazineCovers/${data.ownerType}/${data.ownerId}/${Date.now()}_${coverImageFile.name}`);
                await uploadBytesResumable(storageRef, coverImageFile);
                coverImageUrl = await getDownloadURL(storageRef);
            }

            const newMagazine = {
                ...data,
                coverImage: coverImageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'magazines'), newMagazine);
            return { id: docRef.id, ...newMagazine } as Magazine;
        } catch (error) {
            logger.error('Error creating magazine:', error);
            throw error;
        }
    },

    async getById(id: string): Promise<Magazine> {
        const docRef = doc(db, 'magazines', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error('Magazine not found');
        return { id: docSnap.id, ...docSnap.data() } as Magazine;
    },

    async update(id: string, updates: Partial<Magazine>): Promise<void> {
        const docRef = doc(db, 'magazines', id);
        await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'magazines', id);
        await deleteDoc(docRef);
    },

    // Issues management
    async addIssue(magazineId: string, issue: Partial<MagazineIssue>): Promise<string> {
        const issuesRef = collection(db, 'magazines', magazineId, 'issues');
        const docRef = await addDoc(issuesRef, {
            ...issue,
            magazineId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Update publication issue count
        await updateDoc(doc(db, 'magazines', magazineId), {
            issueCount: increment(1),
            updatedAt: serverTimestamp()
        });

        return docRef.id;
    },

    async getIssues(magazineId: string, status?: string): Promise<MagazineIssue[]> {
        const issuesRef = collection(db, 'magazines', magazineId, 'issues');
        let q = query(issuesRef, orderBy('issueNumber', 'desc'));
        if (status) {
            q = query(issuesRef, where('status', '==', status), orderBy('issueNumber', 'desc'));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MagazineIssue));
    },

    // Pages management (under Issue)
    async addPage(magazineId: string, issueId: string, page: Partial<MagazinePage>): Promise<string> {
        const pagesRef = collection(db, 'magazines', magazineId, 'issues', issueId, 'pages');
        const docRef = await addDoc(pagesRef, {
            ...page,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    },

    async getPages(magazineId: string, issueId: string): Promise<MagazinePage[]> {
        const pagesRef = collection(db, 'magazines', magazineId, 'issues', issueId, 'pages');
        const q = query(pagesRef, orderBy('pageIndex', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MagazinePage));
    },

    async listByOwner(ownerId: string, ownerType: string = 'user'): Promise<Magazine[]> {
        const q = query(
            collection(db, 'magazines'),
            where('ownerId', '==', ownerId),
            where('ownerType', '==', ownerType),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Magazine));
    }
};
