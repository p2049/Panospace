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

export interface Collection {
    id: string;
    ownerId: string;
    title: string;
    description: string;
    coverImage?: string;
    visibility: 'public' | 'unlisted' | 'private';
    createdAt: any;
    updatedAt: any;
    postCount: number;
    tags?: string[];
    allowDirectPosting: boolean;
}

export interface CollectionItem {
    id: string;
    postId?: string;
    rawContentId?: string;
    addedBy: string;
    addedAt: any;
    orderIndex: number;
}

export const CollectionService = {
    async create(data: Partial<Collection>, coverImageFile?: File): Promise<Collection> {
        try {
            let coverImageUrl = '';
            if (coverImageFile) {
                const storageRef = ref(storage, `collectionCovers/${data.ownerId}/${Date.now()}_${coverImageFile.name}`);
                await uploadBytesResumable(storageRef, coverImageFile);
                coverImageUrl = await getDownloadURL(storageRef);
            }

            const newCollection = {
                ...data,
                coverImage: coverImageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                postCount: 0,
                allowDirectPosting: data.allowDirectPosting ?? true
            };

            const docRef = await addDoc(collection(db, 'collections'), newCollection);
            return { id: docRef.id, ...newCollection } as Collection;
        } catch (error) {
            logger.error('Error creating collection:', error);
            throw error;
        }
    },

    async getById(id: string): Promise<Collection> {
        const docRef = doc(db, 'collections', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error('Collection not found');
        return { id: docSnap.id, ...docSnap.data() } as Collection;
    },

    async update(id: string, updates: Partial<Collection>): Promise<void> {
        const docRef = doc(db, 'collections', id);
        await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'collections', id);
        await deleteDoc(docRef);
        // Note: Items subcollection remains but is orphaned. 
        // In a production app, we would use a Cloud Function to clean up.
    },

    async listByOwner(ownerId: string, limitCount = 50): Promise<Collection[]> {
        const q = query(
            collection(db, 'collections'),
            where('ownerId', '==', ownerId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
    },

    // Items management
    async addItem(collectionId: string, item: Partial<CollectionItem>): Promise<string> {
        const itemsRef = collection(db, 'collections', collectionId, 'items');
        const docRef = await addDoc(itemsRef, {
            ...item,
            addedAt: serverTimestamp()
        });

        // Increment postCount
        const collRef = doc(db, 'collections', collectionId);
        await updateDoc(collRef, {
            postCount: increment(1),
            updatedAt: serverTimestamp()
        });

        return docRef.id;
    },

    async removeItem(collectionId: string, itemId: string): Promise<void> {
        const itemRef = doc(db, 'collections', collectionId, 'items', itemId);
        await deleteDoc(itemRef);

        // Decrement postCount
        const collRef = doc(db, 'collections', collectionId);
        await updateDoc(collRef, {
            postCount: increment(-1),
            updatedAt: serverTimestamp()
        });
    },

    async getItems(collectionId: string): Promise<CollectionItem[]> {
        const itemsRef = collection(db, 'collections', collectionId, 'items');
        const q = query(itemsRef, orderBy('orderIndex', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CollectionItem));
    }
};
