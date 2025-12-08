import { db } from '@/firebase';
import { doc, getDoc, getDocs, addDoc, updateDoc, runTransaction, collection, query, where, orderBy, limit, serverTimestamp, increment } from 'firebase/firestore';
import { WalletService } from './WalletService';

// Rarity tiers with metadata
export const RARITY_TIERS = {
    Common: { color: '#9E9E9E', weight: 60, border: '2px solid #9E9E9E' },
    Uncommon: { color: '#4CAF50', weight: 25, border: '2px solid #4CAF50' },
    Rare: { color: '#2196F3', weight: 10, border: '2px solid #2196F3' },
    Epic: { color: '#9C27B0', weight: 3, border: '3px solid #9C27B0' },
    Legendary: { color: '#FFD700', weight: 1.5, border: '3px solid #FFD700', glow: true },
    Mythic: { color: '#FF00FF', weight: 0.5, border: '4px solid #FF00FF', holographic: true, iridescent: true }
};

// Edition types
export const EDITION_TYPES = {
    UNLIMITED: 'unlimited',
    LIMITED: 'limited',
    TIMED: 'timed',
    CHALLENGE: 'challenge',
    CONTEST: 'contest'
};

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
};

// Card styles
export const CARD_STYLES = {
    SPORTS: 'sports',
    CAR: 'car',
    WILDLIFE: 'wildlife',
    CLASSIC: 'classic',
    MODERN: 'modern'
};

export const SpaceCardService = {
    /**
     * Create a new SpaceCard
     * Automatically creates a creator copy (Edition 0/0)
     */
    createCard: async (cardData) => {
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
                imagePosition
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
                editionSize: editionType === EDITION_TYPES.LIMITED ? editionSize : null,
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

            return { id: cardRef.id, ...cardDoc };
        } catch (error) {
            console.error('Error creating card:', error);
            throw error;
        }
    },

    /**
     * Mint a new edition of a card (primary sale)
     */
    mintCard: async (cardId, buyerId, buyerName) => {
        try {
            return await runTransaction(db, async (transaction) => {
                const cardRef = doc(db, 'spaceCards', cardId);
                const cardDoc = await transaction.get(cardRef);

                if (!cardDoc.exists()) {
                    throw new Error('Card not found');
                }

                const cardData = cardDoc.data();

                // Check if minting is allowed
                if (cardData.editionType === EDITION_TYPES.LIMITED) {
                    if (cardData.mintedCount >= cardData.editionSize) {
                        throw new Error('All editions have been minted');
                    }
                } else if (cardData.editionType === EDITION_TYPES.TIMED) {
                    if (cardData.expiresAt && new Date() > cardData.expiresAt.toDate()) {
                        throw new Error('Timed edition has expired');
                    }
                    if (cardData.mintedCount >= cardData.maxMints) {
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
    getCard: async (cardId) => {
        try {
            const cardDoc = await getDoc(doc(db, 'spaceCards', cardId));
            if (cardDoc.exists()) {
                return { id: cardDoc.id, ...cardDoc.data() };
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
    getCardsByCreator: async (creatorUid) => {
        try {
            const q = query(
                collection(db, 'spaceCards'),
                where('creatorUid', '==', creatorUid),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching creator cards:', error);
            return [];
        }
    },

    /**
     * Get cards owned by a user
     */
    getOwnedCards: async (ownerId) => {
        try {
            const q = query(
                collection(db, 'spaceCardOwnership'),
                where('ownerId', '==', ownerId),
                orderBy('acquiredAt', 'desc')
            );
            const querySnapshot = await getDocs(q);

            // Fetch full card details for each ownership
            const ownerships = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    listCardForSale: async (ownershipId, salePrice) => {
        try {
            const ownershipRef = doc(db, 'spaceCardOwnership', ownershipId);
            const ownershipDoc = await getDoc(ownershipRef);

            if (!ownershipDoc.exists()) {
                throw new Error('Ownership record not found');
            }

            const ownershipData = ownershipDoc.data();

            // Check if card is tradable
            const card = await SpaceCardService.getCard(ownershipData.cardId);
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
            const cardDoc = await getDoc(cardRef);
            const currentFloor = cardDoc.data().stats.floorPrice;

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
    purchaseCard: async (ownershipId, buyerId, buyerName) => {
        try {
            return await runTransaction(db, async (transaction) => {
                const ownershipRef = doc(db, 'spaceCardOwnership', ownershipId);
                const ownershipDoc = await transaction.get(ownershipRef);

                if (!ownershipDoc.exists()) {
                    throw new Error('Card not found');
                }

                const ownershipData = ownershipDoc.data();

                if (!ownershipData.forSale) {
                    throw new Error('Card is not for sale');
                }

                // Get card details for creator royalty
                const cardRef = doc(db, 'spaceCards', ownershipData.cardId);
                const cardDoc = await transaction.get(cardRef);
                const cardData = cardDoc.data();

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
    getMarketplace: async (filters = {}) => {
        try {
            let q = collection(db, 'spaceCardOwnership');
            const constraints = [where('forSale', '==', true)];

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

            q = query(q, ...constraints);
            const querySnapshot = await getDocs(q);

            // Fetch full card details
            const listings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const cardsWithListings = await Promise.all(
                listings.map(async (listing) => {
                    const card = await SpaceCardService.getCard(listing.cardId);

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
    unlistCard: async (ownershipId) => {
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
    getUserSpaceCards: async (userId) => {
        try {
            const q = query(
                collection(db, 'user_spacecards'),
                where('userId', '==', userId),
                orderBy('acquiredAt', 'desc')
            );
            const querySnapshot = await getDocs(q);

            // Fetch full card details
            const userCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const cardsWithDetails = await Promise.all(
                userCards.map(async (userCard) => {
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
    addToUserCollection: async (userId, spacecardId, method = 'purchase') => {
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
