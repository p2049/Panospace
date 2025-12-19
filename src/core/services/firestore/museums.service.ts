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

export interface Museum {
    id: string;
    ownerId: string;
    title: string;
    description: string;
    coverImage?: string;
    visibility: 'public' | 'unlisted' | 'private';
    createdAt: any;
    updatedAt: any;
}

export interface MuseumSection {
    id: string;
    type: 'studio' | 'collection' | 'profiles';
    studioId?: string;
    collectionId?: string;
    profileIds?: string[];
    title: string;
    orderIndex: number;
}

export const MuseumService = {
    async create(data: Partial<Museum>, coverImageFile?: File): Promise<Museum> {
        try {
            let coverImageUrl = '';
            if (coverImageFile) {
                const storageRef = ref(storage, `museumCovers/${data.ownerId}/${Date.now()}_${coverImageFile.name}`);
                await uploadBytesResumable(storageRef, coverImageFile);
                coverImageUrl = await getDownloadURL(storageRef);
            }

            const newMuseum = {
                ...data,
                coverImage: coverImageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'museums'), newMuseum);
            return { id: docRef.id, ...newMuseum } as Museum;
        } catch (error) {
            logger.error('Error creating museum:', error);
            throw error;
        }
    },

    async getById(id: string): Promise<Museum> {
        const docRef = doc(db, 'museums', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error('Museum not found');
        return { id: docSnap.id, ...docSnap.data() } as Museum;
    },

    async update(id: string, updates: Partial<Museum>): Promise<void> {
        const docRef = doc(db, 'museums', id);
        await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'museums', id);
        await deleteDoc(docRef);
    },

    // Sections management
    async addSection(museumId: string, section: Partial<MuseumSection>): Promise<string> {
        const sectionsRef = collection(db, 'museums', museumId, 'sections');
        const docRef = await addDoc(sectionsRef, section);
        return docRef.id;
    },

    async updateSection(museumId: string, sectionId: string, updates: Partial<MuseumSection>): Promise<void> {
        const sectionRef = doc(db, 'museums', museumId, 'sections', sectionId);
        await updateDoc(sectionRef, updates);
    },

    async removeSection(museumId: string, sectionId: string): Promise<void> {
        const sectionRef = doc(db, 'museums', museumId, 'sections', sectionId);
        await deleteDoc(sectionRef);
    },

    async getSections(museumId: string): Promise<MuseumSection[]> {
        const sectionsRef = collection(db, 'museums', museumId, 'sections');
        const q = query(sectionsRef, orderBy('orderIndex', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MuseumSection));
    }
};
