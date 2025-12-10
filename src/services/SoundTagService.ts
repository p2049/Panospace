import { db } from '@/firebase';
import { doc, getDoc, getDocs, addDoc, collection, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { SpaceCardService } from './SpaceCardService';

export interface SoundTag {
    id?: string;
    artistId: string;
    title: string;
    audioUrl: string;
    price: number;
    requiresLicenseCard: boolean;
    requiredCardId?: string | null;
    editionSize?: number | null;
    collaborators: string[];
    metadata: Record<string, any>;
    createdAt?: any;
    updatedAt?: any;
    stats?: {
        totalLicenses: number;
        totalRevenue: number;
    };
    [key: string]: any;
}

export const SoundTagService = {
    /**
     * Create a new SoundTag
     */
    createSoundTag: async (soundTagData: Partial<SoundTag>): Promise<SoundTag> => {
        try {
            const {
                artistId,
                title,
                audioUrl,
                price,
                requiresLicenseCard,
                requiredCardId,
                editionSize,
                collaborators,
                metadata
            } = soundTagData;

            if (!artistId || !title || !audioUrl) {
                throw new Error('Missing required SoundTag fields');
            }

            const soundTagDoc: Omit<SoundTag, 'id'> = {
                artistId,
                title,
                audioUrl,
                price: price || 0,
                requiresLicenseCard: requiresLicenseCard || false,
                requiredCardId: requiredCardId || null,
                editionSize: editionSize || null,
                collaborators: collaborators || [],
                metadata: metadata || {},
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                stats: {
                    totalLicenses: 0,
                    totalRevenue: 0
                }
            };

            const docRef = await addDoc(collection(db, 'soundtags'), soundTagDoc);
            return { id: docRef.id, ...soundTagDoc } as SoundTag;
        } catch (error) {
            console.error('Error creating SoundTag:', error);
            throw error;
        }
    },

    /**
     * Get SoundTag by ID
     */
    getSoundTag: async (soundTagId: string): Promise<SoundTag | null> => {
        try {
            const docRef = doc(db, 'soundtags', soundTagId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as SoundTag;
            }
            return null;
        } catch (error) {
            console.error('Error getting SoundTag:', error);
            throw error;
        }
    },

    /**
     * Get SoundTags created by an artist
     */
    getUserSoundTags: async (artistId: string): Promise<SoundTag[]> => {
        try {
            const q = query(
                collection(db, 'soundtags'),
                where('artistId', '==', artistId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SoundTag));
        } catch (error) {
            console.error('Error fetching user SoundTags:', error);
            return [];
        }
    },

    /**
     * Check if user has license for a SoundTag
     * (Checks if they own the required SpaceCard if applicable)
     */
    checkLicense: async (userId: string, soundTagId: string): Promise<{ authorized: boolean; error?: string; requiredCardId?: string; soundTag?: SoundTag }> => {
        try {
            const soundTag = await SoundTagService.getSoundTag(soundTagId);
            if (!soundTag) return { authorized: false, error: 'Tag not found' };

            if (!soundTag.requiresLicenseCard) {
                return { authorized: true, soundTag };
            }

            if (soundTag.requiredCardId) {
                const userCards = await SpaceCardService.getUserSpaceCards(userId);
                // Casting to any because UserSpaceCard type might be loose or generic
                const hasCard = userCards.some((card: any) => card.id === soundTag.requiredCardId || card.spacecardId === soundTag.requiredCardId);
                return {
                    authorized: hasCard,
                    requiredCardId: soundTag.requiredCardId,
                    soundTag
                };
            }

            return { authorized: true, soundTag };
        } catch (error: any) {
            console.error('Error checking license:', error);
            return { authorized: false, error: error.message };
        }
    },

    /**
     * Acquire license for a SoundTag
     * (Placeholder for future purchase logic, currently just adds to user collection if free/unlocked)
     */
    licenseSoundTag: async (userId: string, soundTagId: string): Promise<boolean> => {
        try {
            const result = await SoundTagService.checkLicense(userId, soundTagId);
            if (!result.authorized) {
                throw new Error('User does not meet requirements to license this SoundTag');
            }

            // In future, this would create a license record in a 'user_licenses' collection
            // For now, we return success
            return true;
        } catch (error) {
            console.error('Error licensing SoundTag:', error);
            throw error;
        }
    }
};
