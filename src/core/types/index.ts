/**
 * COMPLETE TYPE SYSTEM - PanoSpace
 * 
 * Single source of truth for all data structures
 * Increases: Code quality, maintainability, investor confidence
 */

import { Timestamp, DocumentReference } from 'firebase/firestore';

// ============================================
// USER & ACCOUNT TYPES (Foundation for Dual Accounts)
// ============================================

export type AccountType = 'artist' | 'standard';

export type ShopStatus = 'none' | 'pending' | 'verified' | 'suspended';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    username?: string;
    photoURL?: string;
    bio?: string;
    accountType: AccountType; // NEW: Support dual account types
    linkedArtistId?: string; // NEW: Link standard users to artist profiles

    // Shop & Marketplace (Authentication/Onboarding)
    dateOfBirth?: string; // ISO date: "YYYY-MM-DD"
    shopStatus?: ShopStatus;
    shopVerified?: boolean; // derive: verified only when status === "verified"
    shopLegalName?: string;
    shopCountry?: string;
    shopCity?: string;
    shopRegion?: string;
    shopPostalCode?: string;
    shopAddressLine1?: string;
    shopAddressLine2?: string;
    shopTaxIdLast4?: string | null;
    shopPayoutProvider?: 'stripe' | 'paypal' | 'none' | null;
    shopPayoutSetupCompleted?: boolean;
    shopRulesAcceptedAt?: string | null; // ISO timestamp

    // Disciplines (for artists)
    disciplines?: {
        main: string[];
        niches: Record<string, string[]>;
    };

    // Social
    followers?: string[];
    following?: string[];
    followerCount?: number;
    followingCount?: number;

    // Search
    searchKeywords: string[];

    // Metadata
    createdAt: Timestamp;
    updatedAt?: Timestamp;

    // Future: Premium features
    // Future: Premium features
    isPremium?: boolean;
    premiumUntil?: Timestamp;

    // Monetization
    isUltra?: boolean;
    isPartner?: boolean;
    partnerType?: 'city' | 'campus' | 'park';
    subscriptionStatus?: 'active' | 'canceled' | 'expired';
    subscriptionUpdatedAt?: Timestamp;
}

// ============================================
// POST & CONTENT TYPES
// ============================================

export interface ExifData {
    make?: string;
    model?: string;
    lensModel?: string;
    focalLength?: number;
    fNumber?: number;
    iso?: number;
    exposureTime?: string;
    dateTime?: string;
    // Flag to distinguish auto vs manual
    isManual?: boolean;
}

export interface PostItem {
    type: 'image' | 'text';

    // Image-specific
    url?: string;
    caption?: string;
    exif?: ExifData;
    manualExif?: ExifData; // User-entered EXIF when auto-extraction fails

    // Shop integration
    addToShop: boolean;
    printSizes?: string[]; // IDs of selected sizes
    customPrices?: Record<string, number>; // Custom prices per size

    // Monetization (Limited Editions)
    isLimitedEdition?: boolean;
    editionSize?: number;
    rarityLevel?: 'common' | 'rare' | 'ultra' | 'legendary';

    // Text-specific
    content?: string;
}

export interface Post {
    id: string;
    authorId: string;
    authorName: string;
    authorPhoto?: string;

    // Content
    title: string;
    description?: string;
    items: PostItem[]; // Multi-image support

    // Legacy (for backward compatibility)
    imageUrl?: string; // First image URL

    // Categorization
    tags: string[];
    location?: {
        city?: string;
        state?: string;
        country?: string;
    };

    // Engagement
    likeCount: number;
    commentCount?: number;
    viewCount?: number; // NEW: Track impressions
    shareCount?: number; // NEW: Track viral potential

    // Search
    searchKeywords: string[];

    // Shop
    shopLinked: boolean; // True if any item.addToShop

    // Feed placement (NEW: Algorithm support)
    feedScore?: number; // Calculated relevance score
    _score?: number; // Temporary scoring property for ranking

    // Monetization
    authorIsUltra?: boolean;
    boostLevel?: number;
    boostExpiresAt?: Timestamp;
    isBoosted?: boolean;
    boostMultiplier?: number;

    // Metadata
    createdAt: Timestamp;
    updatedAt?: Timestamp;

    // Moderation
    flagged?: boolean;
    flagReason?: string;
}

export interface PostFormData {
    title: string;
    description?: string;
    tags: string[];
    location?: {
        city?: string;
        state?: string;
        country?: string;
    };
    slides: {
        file: File;
        caption?: string;
        addToShop: boolean;
        printSizes?: string[];
        customPrices?: Record<string, number>;
    }[];
}

export interface CreatePostResult {
    post: Post;
    shopItems: ShopItem[];
}

// ============================================
// SHOP & COMMERCE TYPES
// ============================================

export interface PrintSize {
    id: string; // e.g., '8x10'
    label: string; // '8x10"'
    price: number; // Retail price in dollars
    artistEarningsCents: number; // Artist's share in cents
    platformFeeCents: number; // Platform's share in cents
    baseCostCents: number; // POD/Printful cost in cents
}

export interface Earnings {
    artistEarningsCents: number;
    platformCutCents: number;
    totalCents: number;
}

export type ShopItemKind = 'print' | 'spacecard' | 'magazine' | 'yearbook' | 'other';
export type ShopItemStatus = 'draft' | 'active' | 'archived';

export interface ShopItem {
    id: string;
    authorId: string;
    authorName: string;
    authorPhoto?: string;

    // Link to source post
    postRef: string; // Post ID (Legacy/Primary link)
    sourcePostId?: string; // Link back to the post / space card (New standard)
    postRefDoc?: DocumentReference; // Optional Firestore reference

    // Content
    kind: ShopItemKind;
    status: ShopItemStatus; // "draft" vs "active" is critical
    title: string;
    description?: string;
    imageUrl: string;
    tags: string[];

    // Pricing (Base/Default)
    baseCostCents: number;  // internal cost (from Printify/Printful or your catalog)
    markupCents: number;    // artist markup
    priceCents: number;     // = baseCostCents + markupCents (derived/store for performance)
    currency: "USD";

    // Variants & Pricing
    printSizes: PrintSize[];

    // Visibility
    available: boolean;

    // Metadata
    createdAt: Timestamp;
    updatedAt?: Timestamp;

    // Analytics (NEW: Track shop performance)
    viewCount?: number;
    purchaseCount?: number;
    totalRevenueCents?: number;

    // Monetization
    isLimitedEdition?: boolean;
    editionSize?: number;
    soldCount?: number;
    rarityLevel?: 'common' | 'rare' | 'ultra' | 'legendary';
}

// ============================================
// ORDER & PAYMENT TYPES
// ============================================

export type OrderStatus =
    | 'pending'
    | 'paid'
    | 'fulfillment_requested'
    | 'fulfillment_in_progress'
    | 'shipped'
    | 'delivered'
    | 'canceled'
    | 'refunded'
    | 'failed';

export interface Order {
    id: string;

    // Parties
    userId: string; // Buyer
    authorId: string; // Artist/seller
    shopItemId: string;

    // Product details
    sizeId: string;
    imageUrl: string;
    title?: string;

    // Pricing breakdown
    stripeTotalCents: number; // Total charged
    baseCostCents: number; // POD cost
    profitCents: number; // Total - base cost
    artistEarningsCents: number; // Artist's share
    platformCutCents: number; // Platform's share

    // Payment
    stripeSessionId: string;
    stripePaymentIntentId?: string;

    // Fulfillment
    status: OrderStatus;
    printfulOrderId?: number;
    trackingNumber?: string;
    carrier?: string;
    shippingAddress?: ShippingAddress;

    // Timestamps
    createdAt: Timestamp;
    paidAt?: Timestamp;
    shippedAt?: Timestamp;
    deliveredAt?: Timestamp;

    // Error handling
    errorMessage?: string;
    retryCount?: number;
}

export interface ShippingAddress {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
    phone?: string;
}

// ============================================
// ANALYTICS & GROWTH TYPES (NEW)
// ============================================

export interface AnalyticsEvent {
    id: string;
    userId?: string;
    sessionId: string;
    eventType:
    | 'page_view'
    | 'signup'
    | 'login'
    | 'post_create'
    | 'post_view'
    | 'post_share'
    | 'shop_view'
    | 'shop_item_view'
    | 'checkout_start'
    | 'purchase_complete'
    | 'follow'
    | 'like';
    eventData?: Record<string, any>;
    timestamp: Timestamp;

    // Attribution
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}

export interface ShareMetadata {
    postId?: string;
    userId?: string;
    shopItemId?: string;
    shareUrl: string;
    sharedBy: string;
    sharedAt: Timestamp;
    platform?: 'facebook' | 'twitter' | 'instagram' | 'link' | 'email';
}

// ============================================
// SEARCH & DISCOVERY TYPES
// ============================================

export interface SearchFilters {
    query?: string;
    tags?: string[];
    location?: {
        city?: string;
        state?: string;
        country?: string;
    };
    priceMin?: number;
    priceMax?: number;
    sizes?: string[];
    accountType?: AccountType;
}

export interface SearchResult<T> {
    items: T[];
    hasMore: boolean;
    lastVisible?: any; // Firestore cursor
    total?: number;
}

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

export interface PrintSizeConfig {
    id: string;
    label: string;
    defaultPrice: number;
    baseCostCents: number;
    dimensions: {
        width: number;
        height: number;
        unit: 'inches';
    };
}

export interface PlatformConfig {
    artistCutPercentage: number; // 0.60 = 60%
    platformCutPercentage: number; // 0.40 = 40%
    stripeFeePercentage: number; // 0.029 = 2.9%
    stripeFeeFixedCents: number; // 30 = $0.30
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    pageSize: number;
    totalPages?: number;
    hasMore: boolean;
}

// ============================================
// APP EVENTS & CURATED CONTENT
// ============================================

export type AppEventCategory = "weekly" | "daily" | "contest" | "seasonal" | "special";
export type AppEventType = "style_of_week" | "daily_feature" | "contest" | "special_event";

export interface AppEvent {
    id: string;
    name: string;
    tag: string; // e.g., "filmnoirweek" (no hash)
    category: AppEventCategory;
    type: AppEventType;
    description: string;

    // Dates
    startDate: Timestamp;
    endDate: Timestamp;
    visibleDate: Timestamp; // When it appears in calendar/search

    // Status
    active: boolean;   // True when effectively "live"
    archived: boolean; // True when moved to archive

    // Metadata
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface AppEventFeedItem {
    postId: string;
    createdAt: Timestamp;
    score?: number; // Optional precomputed score for sorting
}
