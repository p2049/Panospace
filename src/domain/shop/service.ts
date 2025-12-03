/**
 * Shop Domain Service
 * 
 * Handles shop item creation, pricing, and earnings calculations.
 */

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { ShopItem, Post, PostItem, PrintSize, Earnings } from '../../types';
import { PRINT_SIZES } from '../../utils/printPricing';
import { calculateEarnings } from './pricing';

const SHOP_ITEMS_COLLECTION = 'shopItems';

/**
 * Create shop items from a post's selected images
 */
export async function createShopItemsFromPost(
    post: Post,
    selectedItems: PostItem[],
    authorIsUltra: boolean = false
): Promise<ShopItem[]> {
    const shopItems: ShopItem[] = [];

    for (const item of selectedItems) {
        if (item.type !== 'image' || !item.addToShop || !item.url) {
            continue;
        }

        // Build print sizes with pricing
        const printSizes: PrintSize[] = PRINT_SIZES
            .filter(size => item.printSizes?.includes(size.id))
            .map(size => {
                const customPrice = item.customPrices?.[size.id];
                const price = customPrice !== undefined ? Number(customPrice) : size.price;
                const earnings = calculateEarnings(price, size.id, authorIsUltra);

                return {
                    id: size.id,
                    label: size.label,
                    price: price,
                    artistEarningsCents: earnings.artistEarningsCents,
                    platformFeeCents: earnings.platformCutCents,
                    baseCostCents: size.baseCostCents,
                };
            });

        if (printSizes.length === 0) {
            console.warn('No print sizes selected for shop item, skipping');
            continue;
        }

        // Create shop item document
        const shopItemData = {
            authorId: post.authorId,
            authorName: post.authorName,
            postRef: post.id,
            imageUrl: item.url,
            title: post.title,
            description: post.description,
            tags: post.tags,
            printSizes,
            createdAt: serverTimestamp(),

            // Monetization
            isLimitedEdition: item.isLimitedEdition || false,
            editionSize: item.editionSize || 0,
            rarityLevel: item.rarityLevel || 'common',
            soldCount: 0
        };

        const docRef = await addDoc(collection(db, SHOP_ITEMS_COLLECTION), shopItemData);

        shopItems.push({
            ...shopItemData,
            id: docRef.id,
            createdAt: Timestamp.now(),
        } as ShopItem);
    }

    return shopItems;
}

/**
 * Get a single shop item by ID
 */
export async function getShopItemById(shopItemId: string): Promise<ShopItem | null> {
    const docRef = doc(db, SHOP_ITEMS_COLLECTION, shopItemId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return {
        id: docSnap.id,
        ...docSnap.data(),
    } as ShopItem;
}

/**
 * Get shop items for a specific post
 */
export async function getShopItemsByPost(postId: string): Promise<ShopItem[]> {
    const q = query(
        collection(db, SHOP_ITEMS_COLLECTION),
        where('postRef', '==', postId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as ShopItem[];
}

/**
 * Get shop items by author
 */
export async function getShopItemsByAuthor(
    authorId: string,
    limitCount: number = 20
): Promise<ShopItem[]> {
    const q = query(
        collection(db, SHOP_ITEMS_COLLECTION),
        where('authorId', '==', authorId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as ShopItem[];
}

/**
 * Get minimum price for a shop item
 */
export function getMinPrice(shopItem: ShopItem): number {
    if (!shopItem.printSizes || shopItem.printSizes.length === 0) {
        return 0;
    }

    const prices = shopItem.printSizes.map(size => Number(size.price) || 0);
    return Math.min(...prices);
}

/**
 * Validate shop item has required data
 */
export function isValidShopItem(shopItem: ShopItem): boolean {
    return !!(
        shopItem.imageUrl &&
        shopItem.printSizes &&
        shopItem.printSizes.length > 0 &&
        shopItem.printSizes.every(size =>
            size.price > 0 &&
            size.artistEarningsCents > 0
        )
    );
}
