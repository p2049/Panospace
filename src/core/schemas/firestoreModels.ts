import { DocumentSnapshot, Timestamp } from 'firebase/firestore';
import {
    Post,
    UserProfile,
    ShopItem,
    AppEvent,
    PostItem
} from '@/core/types';

/**
 * Normalizes a raw Firestore User Profile document into a strict UserProfile object.
 * Applies defaults and defensive checks for legacy data.
 */
export const normalizeUserProfile = (doc: DocumentSnapshot): UserProfile => {
    const data = doc.data() || {};

    // Ensure disciplines structure exists
    const disciplines = data.disciplines || { main: [], niches: {} };
    if (!disciplines.main) disciplines.main = [];
    if (!disciplines.niches) disciplines.niches = {};

    // Ensure account type
    const accountType = data.accountType || 'standard';

    return {
        id: doc.id,
        uid: doc.id,
        email: data.email || '',
        displayName: data.displayName || 'Anonymous',
        username: data.username || undefined,
        photoURL: data.photoURL || undefined,
        bio: data.bio || '',
        accountType,
        linkedArtistId: data.linkedArtistId || undefined,

        dateOfBirth: data.dateOfBirth || undefined,
        shopStatus: data.shopStatus || 'none',
        shopVerified: data.shopStatus === 'verified', // Derived

        // Shop Metadata with safe defaults
        shopLegalName: data.shopLegalName,
        shopCountry: data.shopCountry,
        shopCity: data.shopCity,
        shopRegion: data.shopRegion,
        shopPostalCode: data.shopPostalCode,
        shopAddressLine1: data.shopAddressLine1,
        shopAddressLine2: data.shopAddressLine2,
        shopTaxIdLast4: data.shopTaxIdLast4 || null,
        shopPayoutProvider: data.shopPayoutProvider || null,
        shopPayoutSetupCompleted: !!data.shopPayoutSetupCompleted,
        shopRulesAcceptedAt: data.shopRulesAcceptedAt || null,

        disciplines,

        profileTheme: data.profileTheme || { gradientId: undefined, unlockedGradients: [] },

        followers: Array.isArray(data.followers) ? data.followers : [],
        following: Array.isArray(data.following) ? data.following : [],
        followerCount: typeof data.followerCount === 'number' ? data.followerCount : (data.followers?.length || 0),
        followingCount: typeof data.followingCount === 'number' ? data.followingCount : (data.following?.length || 0),

        searchKeywords: Array.isArray(data.searchKeywords) ? data.searchKeywords : [],

        createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(), // Fallback if missing
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,

        isPremium: !!data.isPremium,
        premiumUntil: data.premiumUntil instanceof Timestamp ? data.premiumUntil : undefined,

        isUltra: !!data.isUltra,
        isPartner: !!data.isPartner,
        partnerType: data.partnerType,
        subscriptionStatus: data.subscriptionStatus,
        subscriptionUpdatedAt: data.subscriptionUpdatedAt instanceof Timestamp ? data.subscriptionUpdatedAt : undefined,
    };
};

/**
 * Normalizes a raw Firestore Post document into a strict Post object.
 * Handles migration from `imageUrl` (legacy) to `items` (array).
 */
export const normalizePost = (doc: DocumentSnapshot): Post => {
    const data = doc.data() || {};
    const id = doc.id;

    // Normalizing Items / Slides
    let items: PostItem[] = [];
    if (Array.isArray(data.items) && data.items.length > 0) {
        items = data.items;
    } else if (Array.isArray(data.images) && data.images.length > 0) {
        // Handle "images" field (Common legacy format)
        items = data.images.map((img: any) => {
            if (typeof img === 'string') {
                return { type: 'image', url: img, addToShop: false };
            }
            return {
                ...img,
                type: img.type || 'image',
                url: img.url || img.imageUrl // Handle potential variations
            };
        });
    } else if (Array.isArray(data.slides) && data.slides.length > 0) {
        // Handle "slides" field if it exists temporarily
        items = data.slides;
    } else if (data.imageUrl) {
        // Legacy fallback: Single image post
        items = [{
            type: 'image',
            url: data.imageUrl,
            addToShop: !!data.shopLinked // If generic shop link was true, apply to item
        }];
    }

    // Normalizing Location
    const location = data.location || {};

    return {
        id,
        authorId: data.authorId || '',
        authorName: data.authorName || 'Anonymous',
        authorPhoto: data.authorPhoto || data.userPhotoUrl || undefined, // Fallback for various legacy names

        type: data.type || 'art',

        title: data.title || '',
        description: data.description || '',
        items,

        imageUrl: data.imageUrl || items[0]?.url, // Keep sync for now

        tags: Array.isArray(data.tags) ? data.tags : [],

        // Legacy/Top-level overrides
        exif: data.exif || items[0]?.exif,
        manualExif: data.manualExif || items[0]?.manualExif,

        filmMetadata: data.filmMetadata || {},
        location: {
            city: location.city,
            state: location.state,
            country: location.country
        },

        likeCount: typeof data.likeCount === 'number' ? data.likeCount : (data.likes?.length || 0),
        commentCount: typeof data.commentCount === 'number' ? data.commentCount : 0,
        viewCount: data.viewCount || 0,
        shareCount: data.shareCount || 0,
        starRatings: data.starRatings || {},

        searchKeywords: Array.isArray(data.searchKeywords) ? data.searchKeywords : [],

        shopLinked: !!data.shopLinked,

        feedScore: data.feedScore,
        _score: data._score,

        authorIsUltra: !!data.authorIsUltra,
        boostLevel: data.boostLevel,
        boostExpiresAt: data.boostExpiresAt instanceof Timestamp ? data.boostExpiresAt : undefined,
        isBoosted: !!data.isBoosted,
        boostMultiplier: data.boostMultiplier,

        createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,

        flagged: !!data.flagged,
        flagReason: data.flagReason,
    };
};

/**
 * Normalizes a raw Firestore ShopItem document.
 */
export const normalizeShopItem = (doc: DocumentSnapshot): ShopItem => {
    const data = doc.data() || {};

    return {
        id: doc.id,
        authorId: data.authorId || '',
        authorName: data.authorName || '',
        authorPhoto: data.authorPhoto,

        postRef: data.postRef || '',
        sourcePostId: data.sourcePostId || data.postRef, // Normalize to sourcePostId preference

        kind: data.kind || 'print', // Default kind
        status: data.status || 'draft', // Default status

        title: data.title || '',
        description: data.description,
        imageUrl: data.imageUrl || '',
        tags: Array.isArray(data.tags) ? data.tags : [],

        baseCostCents: data.baseCostCents || 0,
        markupCents: data.markupCents || 0,
        priceCents: data.priceCents || (data.baseCostCents || 0) + (data.markupCents || 0),
        currency: 'USD',

        printSizes: Array.isArray(data.printSizes) ? data.printSizes : [],

        available: data.available !== false, // Default true

        createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,

        viewCount: data.viewCount || 0,
        purchaseCount: data.purchaseCount || 0,
        totalRevenueCents: data.totalRevenueCents || 0,

        isLimitedEdition: !!data.isLimitedEdition,
        editionSize: data.editionSize,
        soldCount: data.soldCount || 0,
        rarityLevel: data.rarityLevel,
    };
};

/**
 * Normalizes a raw Firestore AppEvent document.
 */
export const normalizeAppEvent = (doc: DocumentSnapshot): AppEvent => {
    const data = doc.data() || {};
    const now = Timestamp.now();

    return {
        id: doc.id,
        name: data.name || data.title || 'Unnamed Event',
        tag: data.tag || '',
        category: data.category || 'special',
        type: data.type || 'special_event',
        description: data.description || '',

        // Robust date handling
        startDate: data.startDate instanceof Timestamp ? data.startDate : now,
        endDate: data.endDate instanceof Timestamp ? data.endDate : now,
        visibleDate: data.visibleDate instanceof Timestamp ? data.visibleDate : now,

        active: data.active !== false, // Default true if boolean is current
        archived: !!data.archived,

        createdAt: data.createdAt instanceof Timestamp ? data.createdAt : now,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
    };
};
