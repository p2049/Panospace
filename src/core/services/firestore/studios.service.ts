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
    setDoc,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { logger } from '@/core/utils/logger';
import { generateSearchKeywords } from '@/core/utils/searchKeywords';

export interface Studio {
    id: string;
    ownerId: string;
    title: string;
    description: string;
    coverImage?: string;
    visibility: 'public' | 'unlisted' | 'private';
    createdAt: any;
    updatedAt: any;
    memberCount: number;
    searchKeywords?: string[];
}

export interface StudioMember {
    uid: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: any;
    invitedBy?: string;
}

export interface StudioItem {
    id: string;
    postId: string;
    addedBy: string;
    addedAt: any;
    orderIndex: number;
}

export const StudioService = {
    async create(data: Partial<Studio>, coverImageFile: File | null, userId: string, userProfile: any): Promise<Studio> {
        try {
            // Check Access
            const { canAccessFeature, ACCESS_FEATURES } = await import('@/core/utils/accessControl');
            if (!canAccessFeature(userProfile, ACCESS_FEATURES.CREATE_STUDIO)) {
                throw new Error("You must be a Space Creator (Ultra) or Partner to create a Studio.");
            }

            let coverImageUrl = '';
            if (coverImageFile) {
                const storageRef = ref(storage, `studios/${userId}/covers/${Date.now()}_${coverImageFile.name}`);
                await uploadBytesResumable(storageRef, coverImageFile);
                coverImageUrl = await getDownloadURL(storageRef);
            }

            const searchKeywords = [
                ...generateSearchKeywords(data.title || ''),
                ...generateSearchKeywords(data.description || ''),
                ...generateSearchKeywords(userProfile.username || userProfile.displayName || '')
            ].filter(Boolean);

            const studioData = {
                ...data,
                ownerId: userId,
                coverImage: coverImageUrl,
                memberCount: 1,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                searchKeywords
            };

            const docRef = await addDoc(collection(db, 'studios'), studioData);

            // Add owner as a member
            await setDoc(doc(db, 'studios', docRef.id, 'members', userId), {
                role: 'owner',
                joinedAt: serverTimestamp()
            });

            return { id: docRef.id, ...studioData } as Studio;
        } catch (error) {
            logger.error('Error creating studio:', error);
            throw error;
        }
    },

    async getById(id: string): Promise<Studio> {
        const docRef = doc(db, 'studios', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error('Studio not found');
        return { id: docSnap.id, ...docSnap.data() } as Studio;
    },

    async update(id: string, updates: Partial<Studio>): Promise<void> {
        const docRef = doc(db, 'studios', id);
        await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'studios', id);
        await deleteDoc(docRef);
    },

    // Members management
    async inviteMember(studioId: string, targetUid: string, invitedBy: string): Promise<void> {
        // In this model, we might want an 'invites' collection or just add to members with 'pending' role.
        // The requirement says: studios/{studioId}/members/{uid}
        // Let's use a 'pending' state or a separate invites collection. 
        // For simplicity and following the requirement exactly, we'll just add them as members with a flag if needed, 
        // but the requirement says role (owner/admin/member). 
        // I'll add a separate /invites subcollection for clarity if not specified, 
        // or just add to members with a 'pending' status.
        await setDoc(doc(db, 'studios', studioId, 'members', targetUid), {
            role: 'member',
            joinedAt: serverTimestamp(),
            invitedBy,
            status: 'pending' // custom extension
        });
    },

    async getMembers(studioId: string): Promise<StudioMember[]> {
        const membersRef = collection(db, 'studios', studioId, 'members');
        const snapshot = await getDocs(membersRef);
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as StudioMember));
    },

    async updateMemberRole(studioId: string, uid: string, role: 'admin' | 'member'): Promise<void> {
        const memberRef = doc(db, 'studios', studioId, 'members', uid);
        await updateDoc(memberRef, { role });
    },

    async removeMember(studioId: string, uid: string): Promise<void> {
        const memberRef = doc(db, 'studios', studioId, 'members', uid);
        await deleteDoc(memberRef);

        const studioRef = doc(db, 'studios', studioId);
        await updateDoc(studioRef, {
            memberCount: increment(-1),
            updatedAt: serverTimestamp()
        });
    },

    // Items management
    async addItem(studioId: string, item: Partial<StudioItem>): Promise<string> {
        const itemsRef = collection(db, 'studios', studioId, 'items');
        const docRef = await addDoc(itemsRef, {
            ...item,
            addedAt: serverTimestamp()
        });

        const studioRef = doc(db, 'studios', studioId);
        await updateDoc(studioRef, {
            updatedAt: serverTimestamp()
        });

        return docRef.id;
    },

    async getItems(studioId: string): Promise<StudioItem[]> {
        const itemsRef = collection(db, 'studios', studioId, 'items');
        const q = query(itemsRef, orderBy('orderIndex', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudioItem));
    }
};

// Legacy compatibility (if needed by other parts of the app)
export const createStudioService = () => StudioService;

// Legacy alias for backward compatibility
export const createGallery = StudioService.create;

// Alias for inviting multiple members at once
export const inviteMembers = async (studioId: string, userIds: string[], invitedBy: string): Promise<void> => {
    for (const uid of userIds) {
        await StudioService.inviteMember(studioId, uid, invitedBy);
    }
};

// ShopService stub - placeholder for shop functionality
export const ShopService = {
    async getDrafts(userId: string): Promise<any[]> {
        logger.warn('ShopService.getDrafts is a stub - implement actual shop service');
        return [];
    },
    async publishDraft(draftId: string, userId: string, confirm: boolean): Promise<void> {
        logger.warn('ShopService.publishDraft is a stub - implement actual shop service');
    },
    async deleteDraft(draftId: string, userId: string): Promise<void> {
        logger.warn('ShopService.deleteDraft is a stub - implement actual shop service');
    },
    async completeShopSetup(userId: string, data: any): Promise<void> {
        logger.warn('ShopService.completeShopSetup is a stub - implement actual shop service');
    },
    async checkShopSetup(userId: string): Promise<{ isComplete: boolean; canBypass: boolean }> {
        logger.warn('ShopService.checkShopSetup is a stub - implement actual shop service');
        return { isComplete: true, canBypass: true };
    }
};
