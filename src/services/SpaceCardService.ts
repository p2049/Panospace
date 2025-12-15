import { db } from '@/firebase';
import {
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    runTransaction,
    collection,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    increment,
    Timestamp,
    type DocumentData,
    type Transaction
} from 'firebase/firestore';
import { WalletService } from './WalletService';

// Rarity tiers with metadata
// Visual styles are defined in /styles/rarity-system.css - use class names for styling
export const RARITY_TIERS = {
    Common: {
        cssClass: 'rarity-common',
        color: 'var(--brand-mint)',
        colorHex: '#7FFFD4',
        weight: 60,
        border: '2px solid var(--brand-mint)'
    },
    Rare: {
        cssClass: 'rarity-rare',
        color: 'var(--brand-blue)',
        colorHex: '#4CC9F0',
        weight: 25,
        border: '2px solid var(--brand-blue)',
        glow: true
    },
    Super: {
        cssClass: 'rarity-super',
        color: 'var(--brand-purple)',
        colorHex: '#6C5CE7',
        weight: 10,
        border: '3px solid var(--brand-purple)',
        glow: true
    },
    Ultra: {
        cssClass: 'rarity-ultra',
        color: 'var(--brand-pink)',
        colorHex: '#FF6B9D', // Solar Flare Pink
        weight: 3,
        border: '3px solid var(--brand-pink)',
        glow: true,
        animated: true
    },
    Galactic: {
        cssClass: 'rarity-galactic',
        color: 'var(--gradient-iridescent)',
        colorHex: '#e0b3ff',
        weight: 2,
        border: '4px solid transparent',
        holographic: true,
        iridescent: true,
        glow: true
    }
} as const;

// Map old rarity names to new tier names
const RARITY_NAME_NORMALIZE: Record<string, keyof typeof RARITY_TIERS> = {
    'common': 'Common',
    'Common': 'Common',
    'uncommon': 'Rare',      // Uncommon → Rare
    'Uncommon': 'Rare',
    'rare': 'Super',         // Rare → Super
    'Rare': 'Rare',          // New Rare stays Rare
    'super': 'Super',
    'Super': 'Super',
    'epic': 'Ultra',         // Epic → Ultra
    'Epic': 'Ultra',
    'ultra': 'Ultra',
    'Ultra': 'Ultra',
    'legendary': 'Galactic', // Legendary → Galactic
    'Legendary': 'Galactic',
    'mythic': 'Galactic',    // Mythic → Galactic
    'Mythic': 'Galactic',
    'galactic': 'Galactic',
    'Galactic': 'Galactic'
};

/**
 * Get rarity info with automatic normalization of old tier names
 */
export function getRarityInfo(rarity: string | undefined) {
    if (!rarity) return RARITY_TIERS.Common;
    const normalizedKey = RARITY_NAME_NORMALIZE[rarity];
    if (normalizedKey) return RARITY_TIERS[normalizedKey];
    return RARITY_TIERS.Common;
}

/**
 * Get normalized rarity tier name
 */
export function normalizeRarity(rarity: string | undefined): keyof typeof RARITY_TIERS {
    if (!rarity) return 'Common';
    return RARITY_NAME_NORMALIZE[rarity] || 'Common';
}

export type Rarity = keyof typeof RARITY_TIERS;

// Edition types
export const EDITION_TYPES = {
    UNLIMITED: 'unlimited',
    LIMITED: 'limited',
    TIMED: 'timed',
    CHALLENGE: 'challenge',
    CONTEST: 'contest'
} as const;

export type EditionType = typeof EDITION_TYPES[keyof typeof EDITION_TYPES];

// Card disciplines
export const CARD_DISCIPLINES = {
    SPORTS: 'sports',
    CARS: 'cars',
    WILDLIFE: 'wildlife',
    LANDSCAPE: 'landscape',
    URBAN: 'urban',
    PORTRAIT: 'portrait',
    ABSTRACT: 'abstract',
    OTHER: 'other'
} as const;

// Card styles
export const CARD_STYLES = {
    SPORTS: 'sports',
    CAR: 'car',
    WILDLIFE: 'wildlife',
    CLASSIC: 'classic',
    MODERN: 'modern'
} as const;

export interface SpaceCardInput {
    creatorUid: string;
    creatorName: string;
    frontImage: string;
    backImage?: string;
    title: string;
    description?: string;
    discipline?: string;
    rarity: string;
    editionType: string;
    editionSize?: number;
    linkedPostId?: string;
    linkedPhotoDexEntryId?: string;
    cardStyle?: string;
    basePrice?: number;
    cardType?: string;
    subjectTag?: string;
    isOfficial?: boolean;
    isAudioCard?: boolean;
    audioUrl?: string;
    soundTag?: string;
    imagePosition?: { x: number; y: number };
    cardLayout?: 'fullbleed' | 'bordered';
    cityThemeId?: string;
}

export interface SpaceCard {
    id: string;
    creatorUid: string;
    creatorName: string;
    images: {
        front: string;
        back: string | null;
        position: { x: number; y: number };
    };
    title: string;
    description: string;
    discipline: string;
    rarity: string;
    editionType: string;
    editionSize: number | null;
    mintedCount: number;
    maxMints: number | null;
    expiresAt: Timestamp | null;
    linkedPostId: string | null;
    linkedPhotoDexEntryId: string | null;
    cardStyle: string;
    basePrice: number;
    cardType: string;
    subjectTag: string | null;
    isOfficial: boolean;
    isAudioCard: boolean;
    audioUrl: string | null;
    soundTag: string | null;
    cardLayout: 'fullbleed' | 'bordered';
    cityThemeId?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    stats: {
        totalMinted: number;
        totalOwners: number;
        floorPrice: number;
        lastSalePrice: number;
    };
    [key: string]: any;
}

export interface SpaceCardOwnership {
    id: string;
    cardId: string;
    ownerId: string;
    ownerName: string;
    editionNumber: number;
    isCreatorCopy: boolean;
    acquiredFrom: 'creator' | 'primary' | 'resale';
    acquiredAt: Timestamp;
    purchasePrice: number;
    forSale: boolean;
    salePrice: number;
    listedAt: Timestamp | null;
}

export const SpaceCardService = {
    /**
     * Create a new SpaceCard
     * Automatically creates a creator copy (Edition 0/0)
     */
    createCard: async (cardData: SpaceCardInput): Promise<SpaceCard> => {
        try {
            const {
                creatorUid,
                creatorName,
                frontImage,
                backImage,
                title,
                description,
                discipline,
                rarity,
                editionType,
                editionSize,
                linkedPostId,
                linkedPhotoDexEntryId,
                cardStyle,
                basePrice,
                cardType,
                subjectTag,
                isOfficial,
                isAudioCard,
                audioUrl,
                soundTag,
                imagePosition,
                cardLayout,
                cityThemeId
            } = cardData;

            // Validate required fields
            if (!creatorUid || !creatorName || !frontImage || !title || !rarity || !editionType) {
                throw new Error('Missing required card fields');
            }

            // Create card document
            const cardDoc = {
                creatorUid,
                creatorName,
                images: {
                    front: frontImage,
                    back: backImage || null,
                    position: imagePosition || { x: 50, y: 50 }
                },
                title,
                description: description || '',
                discipline: discipline || CARD_DISCIPLINES.OTHER,
                rarity,
                editionType,
                editionSize: editionType === EDITION_TYPES.LIMITED ? (editionSize || 0) : null,
                mintedCount: 0,
                maxMints: editionType === EDITION_TYPES.TIMED ? (editionSize || 1000) : null,
                expiresAt: null, // Set when creating timed edition
                linkedPostId: linkedPostId || null,
                linkedPhotoDexEntryId: linkedPhotoDexEntryId || null,
                cardStyle: cardStyle || CARD_STYLES.CLASSIC,
                basePrice: basePrice || 0,
                cardType: cardType || 'custom',
                subjectTag: subjectTag || null,
                isOfficial: isOfficial || false,
                isAudioCard: isAudioCard || false,
                audioUrl: audioUrl || null,
                soundTag: soundTag || null,
                cardLayout: cardLayout || 'bordered', // 'fullbleed' | 'bordered'
                cityThemeId: cityThemeId || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                stats: {
                    totalMinted: 0,
                    totalOwners: 0,
                    floorPrice: basePrice || 0,
                    lastSalePrice: 0
                }
            };

            // Add card to collection
            const cardRef = await addDoc(collection(db, 'spaceCards'), cardDoc);

            // Create creator copy (Edition 0/0)
            const creatorCopyDoc = {
                cardId: cardRef.id,
                ownerId: creatorUid,
                ownerName: creatorName,
                editionNumber: 0,
                isCreatorCopy: true,
                acquiredFrom: 'creator',
                acquiredAt: serverTimestamp(),
                purchasePrice: 0,
                forSale: false,
                salePrice: 0,
                listedAt: null
            };

            await addDoc(collection(db, 'spaceCardOwnership'), creatorCopyDoc);

            return { id: cardRef.id, ...cardDoc } as unknown as SpaceCard;
        } catch (error) {
            console.error('Error creating card:', error);
            throw error;
        }
    },

    /**
     * Mint a new edition of a card (primary sale)
     */
    mintCard: async (cardId: string, buyerId: string, buyerName: string): Promise<{ ownershipId: string; editionNumber: number }> => {
        try {
            return await runTransaction(db, async (transaction) => {
                const cardRef = doc(db, 'spaceCards', cardId);
                const cardDoc = await transaction.get(cardRef);

                if (!cardDoc.exists()) {
                    throw new Error('Card not found');
                }

                const cardData = cardDoc.data() as SpaceCard;

                // Check if minting is allowed
                if (cardData.editionType === EDITION_TYPES.LIMITED) {
                    if (cardData.editionSize !== null && cardData.mintedCount >= cardData.editionSize) {
                        throw new Error('All editions have been minted');
                    }
                } else if (cardData.editionType === EDITION_TYPES.TIMED) {
                    if (cardData.expiresAt && new Date() > cardData.expiresAt.toDate()) {
                        throw new Error('Timed edition has expired');
                    }
                    if (cardData.maxMints !== null && cardData.mintedCount >= cardData.maxMints) {
                        throw new Error('Maximum mints reached');
                    }
                }

                // Calculate edition number
                const editionNumber = cardData.mintedCount + 1;

                // Process payment
                await WalletService.processPrimaryPurchase(
                    buyerId,
                    cardData.creatorUid,
                    cardId,
                    'spaceCard',
                    cardData.basePrice,
                    cardData.title
                );

                // Update card stats
                transaction.update(cardRef, {
                    mintedCount: increment(1),
                    'stats.totalMinted': increment(1),
                    'stats.totalOwners': increment(1),
                    'stats.lastSalePrice': cardData.basePrice,
                    updatedAt: serverTimestamp()
                });

                // Create ownership record
                const ownershipDoc = {
                    cardId,
                    ownerId: buyerId,
                    ownerName: buyerName,
                    editionNumber,
                    isCreatorCopy: false,
                    acquiredFrom: 'primary',
                    acquiredAt: serverTimestamp(),
                    purchasePrice: cardData.basePrice,
                    forSale: false,
                    salePrice: 0,
                    listedAt: null
                };

                const ownershipRef = doc(collection(db, 'spaceCardOwnership'));
                transaction.set(ownershipRef, ownershipDoc);

                return { ownershipId: ownershipRef.id, editionNumber };
            });
        } catch (error) {
            console.error('Error minting card:', error);
            throw error;
        }
    },

    /**
     * Get card details by ID
     */
    getCard: async (cardId: string): Promise<SpaceCard | null> => {
        try {
            const cardDoc = await getDoc(doc(db, 'spaceCards', cardId));
            if (cardDoc.exists()) {
                return { id: cardDoc.id, ...cardDoc.data() } as SpaceCard;
            }
            return null;
        } catch (error) {
            console.error('Error fetching card:', error);
            throw error;
        }
    },

    /**
     * Get cards created by a user
     */
    getCardsByCreator: async (creatorUid: string): Promise<SpaceCard[]> => {
        try {
            const q = query(
                collection(db, 'spaceCards'),
                where('creatorUid', '==', creatorUid),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SpaceCard));
        } catch (error) {
            console.error('Error fetching creator cards:', error);
            return [];
        }
    },

    /**
     * Get cards owned by a user
     */
    getOwnedCards: async (ownerId: string): Promise<any[]> => {
        try {
            const q = query(
                collection(db, 'spaceCardOwnership'),
                where('ownerId', '==', ownerId),
                orderBy('acquiredAt', 'desc')
            );
            const querySnapshot = await getDocs(q);

            // Fetch full card details for each ownership
            const ownerships = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SpaceCardOwnership));
            const cardsWithOwnership = await Promise.all(
                ownerships.map(async (ownership) => {
                    const card = await SpaceCardService.getCard(ownership.cardId);
                    return { ...card, ownership };
                })
            );

            return cardsWithOwnership;
        } catch (error) {
            console.error('Error fetching owned cards:', error);
            return [];
        }
    },

    /**
     * List a card for sale on the marketplace
     */
    listCardForSale: async (ownershipId: string, salePrice: number): Promise<boolean> => {
        try {
            const ownershipRef = doc(db, 'spaceCardOwnership', ownershipId);
            const ownershipDoc = await getDoc(ownershipRef);

            if (!ownershipDoc.exists()) {
                throw new Error('Ownership record not found');
            }

            const ownershipData = ownershipDoc.data() as SpaceCardOwnership;

            // Check if card is tradable
            const card = await SpaceCardService.getCard(ownershipData.cardId);
            if (!card) throw new Error('Card details not found');

            if (card.editionType === EDITION_TYPES.UNLIMITED) {
                throw new Error('Unlimited edition cards cannot be sold');
            }

            if (ownershipData.isCreatorCopy) {
                throw new Error('Creator copies cannot be sold');
            }

            await updateDoc(ownershipRef, {
                forSale: true,
                salePrice,
                listedAt: serverTimestamp()
            });

            // Update card floor price if this is lower
            const cardRef = doc(db, 'spaceCards', ownershipData.cardId);
            const stats = card.stats;
            const currentFloor = stats?.floorPrice;

            if (!currentFloor || salePrice < currentFloor) {
                await updateDoc(cardRef, {
                    'stats.floorPrice': salePrice
                });
            }

            return true;
        } catch (error) {
            console.error('Error listing card:', error);
            throw error;
        }
    },

    /**
     * Purchase a card from the marketplace (resale)
     */
    purchaseCard: async (ownershipId: string, buyerId: string, buyerName: string): Promise<boolean> => {
        try {
            return await runTransaction(db, async (transaction) => {
                const ownershipRef = doc(db, 'spaceCardOwnership', ownershipId);
                const ownershipDoc = await transaction.get(ownershipRef);

                if (!ownershipDoc.exists()) {
                    throw new Error('Card not found');
                }

                const ownershipData = ownershipDoc.data() as SpaceCardOwnership;

                if (!ownershipData.forSale) {
                    throw new Error('Card is not for sale');
                }

                // Get card details for creator royalty
                const cardRef = doc(db, 'spaceCards', ownershipData.cardId);
                const cardDoc = await transaction.get(cardRef);
                const cardData = cardDoc.data() as SpaceCard;

                // Process resale payment (platform fee + creator royalty)
                await WalletService.processResale(
                    buyerId,
                    ownershipData.ownerId,
                    cardData.creatorUid,
                    ownershipData.cardId,
                    'spaceCard',
                    ownershipData.salePrice,
                    cardData.title
                );

                // Update ownership
                transaction.update(ownershipRef, {
                    ownerId: buyerId,
                    ownerName: buyerName,
                    acquiredFrom: 'resale',
                    acquiredAt: serverTimestamp(),
                    purchasePrice: ownershipData.salePrice,
                    forSale: false,
                    salePrice: 0,
                    listedAt: null
                });

                // Update card stats
                transaction.update(cardRef, {
                    'stats.lastSalePrice': ownershipData.salePrice,
                    updatedAt: serverTimestamp()
                });

                return true;
            });
        } catch (error) {
            console.error('Error purchasing card:', error);
            throw error;
        }
    },

    /**
     * Get marketplace listings with filters
     */
    getMarketplace: async (filters: { minPrice?: number; maxPrice?: number; sortBy?: string; rarity?: string; discipline?: string; editionType?: string } = {}): Promise<any[]> => {
        try {
            let q: any = collection(db, 'spaceCardOwnership');
            const constraints: any[] = [where('forSale', '==', true)];

            // Add filters
            if (filters.minPrice !== undefined) {
                constraints.push(where('salePrice', '>=', filters.minPrice));
            }
            if (filters.maxPrice !== undefined) {
                constraints.push(where('salePrice', '<=', filters.maxPrice));
            }

            // Apply ordering
            if (filters.sortBy === 'price_asc') {
                constraints.push(orderBy('salePrice', 'asc'));
            } else if (filters.sortBy === 'price_desc') {
                constraints.push(orderBy('salePrice', 'desc'));
            } else {
                constraints.push(orderBy('listedAt', 'desc'));
            }

            constraints.push(limit(50));

            q = query(q, ...(constraints as any[]));
            const querySnapshot = await getDocs(q);

            // Fetch full card details
            const listings = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as SpaceCardOwnership));
            const cardsWithListings = await Promise.all(
                listings.map(async (listing) => {
                    const card = await SpaceCardService.getCard(listing.cardId);
                    if (!card) return null;

                    // Apply additional filters that can't be done in Firestore
                    if (filters.rarity && card.rarity !== filters.rarity) return null;
                    if (filters.discipline && card.discipline !== filters.discipline) return null;
                    if (filters.editionType && card.editionType !== filters.editionType) return null;

                    return { ...card, listing };
                })
            );

            return cardsWithListings.filter(card => card !== null);
        } catch (error) {
            console.error('Error fetching marketplace:', error);
            return [];
        }
    },

    /**
     * Unlist a card from the marketplace
     */
    unlistCard: async (ownershipId: string): Promise<boolean> => {
        try {
            const ownershipRef = doc(db, 'spaceCardOwnership', ownershipId);
            await updateDoc(ownershipRef, {
                forSale: false,
                salePrice: 0,
                listedAt: null
            });
            return true;
        } catch (error) {
            console.error('Error unlisting card:', error);
            throw error;
        }
    },

    /**
     * Get user's spacecards from the new user_spacecards collection
     */
    getUserSpaceCards: async (userId: string): Promise<any[]> => {
        try {
            const q = query(
                collection(db, 'user_spacecards'),
                where('userId', '==', userId),
                orderBy('acquiredAt', 'desc')
            );
            const querySnapshot = await getDocs(q);

            // Fetch full card details
            const userCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
            const cardsWithDetails = await Promise.all(
                userCards.map(async (userCard: any) => {
                    const card = await SpaceCardService.getCard(userCard.spacecardId);
                    return { ...card, userCardEntry: userCard };
                })
            );

            return cardsWithDetails;
        } catch (error) {
            console.error('Error fetching user spacecards:', error);
            return [];
        }
    },

    /**
     * Add a card to user's collection (user_spacecards)
     */
    addToUserCollection: async (userId: string, spacecardId: string, method: string = 'purchase'): Promise<boolean> => {
        try {
            await addDoc(collection(db, 'user_spacecards'), {
                userId,
                spacecardId,
                method,
                acquiredAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error adding to user collection:', error);
            throw error;
        }
    }
};
