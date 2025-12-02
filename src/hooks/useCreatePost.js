// src/hooks/useCreatePost.js
import { useState, useRef } from 'react'; // 🔐 Added useRef for rate limiting
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, setDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import exifr from 'exifr';
import { PRINT_SIZES, calculateEarnings, getValidSizesForImage } from '../utils/printfulApi';
import { formatPrice } from '../utils/helpers';
import { PhotoDexService } from '../services/PhotoDexService';
import { AccountTypeService } from '../services/AccountTypeService';

// ---------------------------------------------------------------------------
// Helper: extract EXIF from a File
// ---------------------------------------------------------------------------
const extractExif = async (file) => {
    try {
        const data = await exifr.parse(file, [
            'Make',
            'Model',
            'LensModel',
            'FocalLength',
            'FNumber',
            'ISO',
            'ExposureTime',
            'DateTimeOriginal',
        ]);
        if (!data) return null;
        return {
            make: data.Make,
            model: data.Model,
            lens: data.LensModel,
            focalLength: data.FocalLength ? `${data.FocalLength}mm` : null,
            aperture: data.FNumber,
            iso: data.ISO,
            shutterSpeed: data.ExposureTime,
            date: data.DateTimeOriginal ? new Date(data.DateTimeOriginal).toLocaleDateString() : null,
        };
    } catch (err) {
        console.warn('EXIF extraction failed', err);
        return null;
    }
};

// ---------------------------------------------------------------------------
// Hook: useCreatePost
// ---------------------------------------------------------------------------
export const useCreatePost = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🔐 SECURITY: Rate limiting - prevent spam posting
    const lastPostTime = useRef(0);
    const MIN_POST_INTERVAL = 30000; // 30 seconds between posts
    const [progress, setProgress] = useState(0);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // -----------------------------------------------------------------------
    // createPost – full implementation
    // status: 'published' (default) | 'draft'
    // -----------------------------------------------------------------------
    const createPost = async (postData, slides, status = 'published') => {
        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            if (!currentUser) throw new Error('Must be logged in');

            // 🔐 SECURITY: Enforce rate limiting
            const now = Date.now();
            if (now - lastPostTime.current < MIN_POST_INTERVAL) {
                const waitTime = Math.ceil((MIN_POST_INTERVAL - (now - lastPostTime.current)) / 1000);
                throw new Error(`Please wait ${waitTime} seconds before posting again`);
            }
            lastPostTime.current = now;

            // ---------------------------------------------------------------
            // 0️⃣ Author information (fallbacks) - ALWAYS fetch from Firestore first
            // ---------------------------------------------------------------
            let authorName = null;

            // Try Firestore first (most reliable source)
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    authorName = userDoc.data().displayName;
                }
            } catch (e) {
                console.warn('Could not fetch user profile for name', e);
            }

            // Fallback to Firebase Auth if Firestore failed
            if (!authorName) {
                authorName = currentUser.displayName;
            }

            // Final fallback
            if (!authorName) {
                authorName = currentUser.email?.split('@')[0] || 'Unknown Author';
            }

            const username = authorName;
            const avatar = currentUser.photoURL || '';

            // Check if user is Ultra
            let isUltra = false;
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    isUltra = userDoc.data().isUltra || false;
                }
            } catch (e) {
                console.warn('Could not fetch user profile for Ultra check', e);
            }

            // Get user's account type for feed filtering
            let authorAccountType = 'art'; // Default
            try {
                authorAccountType = await AccountTypeService.getAccountType(currentUser.uid);
            } catch (e) {
                console.warn('Could not fetch account type, using default', e);
            }

            // ---------------------------------------------------------------
            // 1️⃣ Upload images & collect metadata
            // ---------------------------------------------------------------
            const totalSlides = slides.length;
            let completedSlides = 0;

            const items = await Promise.all(
                slides.map(async (slide, index) => {
                    if (slide.type === 'image') {
                        // Upload to Firebase Storage
                        const storageRef = ref(
                            storage,
                            `posts/${currentUser.uid}/${Date.now()}_${index}_${slide.file.name}`
                        );

                        // Use uploadBytesResumable for progress tracking
                        const uploadTask = uploadBytesResumable(storageRef, slide.file);

                        await new Promise((resolve, reject) => {
                            uploadTask.on('state_changed',
                                (snapshot) => {
                                    // Calculate individual file progress if needed
                                },
                                (error) => reject(error),
                                () => resolve()
                            );
                        });

                        const url = await getDownloadURL(storageRef);

                        // Update progress
                        completedSlides++;
                        setProgress(Math.round((completedSlides / totalSlides) * 100));

                        // Get image dimensions
                        let width = null;
                        let height = null;
                        try {
                            const img = new Image();
                            img.src = url;
                            await new Promise((resolve, reject) => {
                                img.onload = resolve;
                                img.onerror = reject;
                            });
                            width = img.naturalWidth;
                            height = img.naturalHeight;
                        } catch (e) {
                            console.warn('Failed to get image dimensions', e);
                        }

                        // EXIF (manual overrides allowed)
                        let extractedExif = null;
                        try {
                            extractedExif = await extractExif(slide.file);
                        } catch (e) {
                            console.warn('EXIF extraction failed', e);
                        }
                        const finalExif = slide.manualExif || extractedExif;

                        // Determine valid print sizes based on aspect ratio
                        // FIX: Only auto-select sizes that match the aspect ratio closely (< 0.08 diff)
                        const validSizes = getValidSizesForImage(width, height);
                        const imgRatio = width && height ? width / height : 1.5;

                        // Filter for best fit
                        const bestFitSizes = validSizes.filter(s => {
                            const sizeRatio = s.ratio;
                            // Check direct match (landscape)
                            const matchLandscape = Math.abs(sizeRatio - imgRatio) < 0.08;
                            // Check inverse match (portrait)
                            const matchPortrait = Math.abs((1 / sizeRatio) - imgRatio) < 0.08;
                            return matchLandscape || matchPortrait;
                        });

                        const printSizeIds = bestFitSizes.map((s) => s.id);

                        return {
                            type: 'image',
                            url,
                            caption: slide.caption || '',
                            exif: finalExif || null,
                            addToShop: slide.addToShop || false,
                            productTier: slide.productTier || 'economy',
                            includeStickers: slide.includeStickers || false,
                            // Store only the IDs of sizes that fit the image
                            printSizes: printSizeIds,
                            customPrices: {},
                            width,
                            height,
                            aspectRatio: imgRatio,
                            allowCropped: slide.allowCropped || false,
                            // Limited Edition Fields
                            isLimitedEdition: slide.isLimitedEdition || false,
                            editionSize: slide.editionSize || 10,
                            price: slide.price || 0
                        };
                    }
                    // Text slide fallback
                    completedSlides++;
                    setProgress(Math.round((completedSlides / totalSlides) * 100));
                    return {
                        type: 'text',
                        content: slide.content,
                        caption: slide.caption || '',
                    };
                })
            );

            // ---------------------------------------------------------------
            // 2️⃣ Build search keywords (title, tags, username)
            // ---------------------------------------------------------------
            const searchKeywords = [
                ...(postData.title || '').toLowerCase().split(' '),
                ...(postData.tags || []).map((t) => t.toLowerCase()),
                username.toLowerCase(),
            ].filter((k) => k.length > 0);

            // ---------------------------------------------------------------
            // 3️⃣ Create main post document
            // ---------------------------------------------------------------
            // Extract image URLs and create thumbnails array
            const imageUrls = items
                .filter((i) => i.type === 'image')
                .map((i) => i.url);

            const thumbnailUrls = imageUrls; // For now, use same URLs as thumbnails

            // Extract location data
            const locationName = postData.location ?
                [postData.location.city, postData.location.state, postData.location.country]
                    .filter(Boolean)
                    .join(', ') : '';

            const postDoc = {
                // ✅ REQUIRED FIELDS (New Schema)
                uid: currentUser.uid,
                username,
                userAvatar: avatar,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                caption: postData.title || '',
                imageUrls,
                thumbnailUrls,
                tags: postData.tags || [],
                locationName,
                lat: postData.location?.lat || null,
                lng: postData.location?.lng || null,
                likesCount: 0,
                commentsCount: 0,
                artType: postData.artType || 'photography',
                category: postData.category || 'general',
                contestTag: postData.contestTag || '',
                safe: true,
                shopEnabled: items.some((i) => i.addToShop === true),
                shopProducts: items.some((i) => i.addToShop === true) ?
                    items.filter((i) => i.addToShop).map((i) => ({
                        url: i.url,
                        tier: i.productTier,
                        sizes: i.printSizes
                    })) : [],
                hasSlides: items.length > 1,
                hasItems: items.length > 0,
                hasImages: imageUrls.length > 0,

                // Account Type (for dual feed system)
                authorAccountType, // 'art' or 'social'

                // Collections System
                collectionId: postData.collectionId || null,
                collectionPostToFeed: postData.collectionPostToFeed ?? null, // Denormalized for performance
                showInProfile: postData.showInProfile !== undefined ? postData.showInProfile : true,

                // LEGACY FIELDS (Keep for backwards compatibility)
                userId: currentUser.uid,
                authorId: currentUser.uid,
                profileImage: avatar,
                title: postData.title || '',
                description: postData.description || '',

                // Aesthetic Metadata
                colorTags: postData.colorTags || [],
                moodTags: postData.moodTags || [],
                seasonalTags: postData.seasonalTags || [],
                timeOfDayTags: postData.timeOfDayTags || [],

                // Film Metadata (Unified)
                filmMetadata: postData.filmMetadata || null,
                enableRatings: postData.enableRatings || false,

                // UI Overlays (Quartz Date, Borders)
                uiOverlays: postData.uiOverlays || null,
                filmInfo: postData.filmMetadata?.isFilm ? {
                    filmStock: postData.filmMetadata.stock,
                    camera: postData.filmMetadata.cameraOverride,
                    lens: postData.filmMetadata.lensOverride,
                    iso: postData.filmMetadata.iso,
                    format: postData.filmMetadata.format,
                    scanner: postData.filmMetadata.scanner,
                    notes: postData.filmMetadata.lab
                } : null,

                // Post Type Settings
                postType: postData.postType || 'standard',
                flipbookSettings: postData.flipbookSettings || null,
                layoutSettings: postData.layoutSettings || null,
                panoStackSettings: postData.panoStackSettings || null,
                location: postData.location || null,

                // UI Overlays (Film Sprockets, Quartz Date, etc.)
                uiOverlays: postData.uiOverlays || null,

                // Detailed images array (legacy)
                images: items
                    .filter((i) => i.type === 'image')
                    .map((i) => ({
                        url: i.url,
                        caption: i.caption || '',
                        addToShop: i.addToShop || false,
                        productTier: i.productTier || 'economy',
                        includeStickers: i.includeStickers || false,
                        printSizes: i.printSizes || [],
                        customPrices: i.customPrices || {},
                        exif: i.exif || null,
                        width: i.width || null,
                        height: i.height || null,
                        aspectRatio: i.aspectRatio || null,
                        allowCropped: i.allowCropped || false,
                    })),

                searchKeywords,
                likeCount: 0,
                commentCount: 0,
                addToShop: items.some((i) => i.addToShop === true),
                moderationStatus: 'active',
                status: status,
            };

            const docRef = await addDoc(collection(db, 'posts'), postDoc);

            // ---------------------------------------------------------------
            // 🚨 FAIL-SAFE: Verify images exist in storage immediately
            // ---------------------------------------------------------------
            try {
                const imageUrls = items.filter(i => i.type === 'image').map(i => i.url);
                const verificationPromises = imageUrls.map(async (url) => {
                    try {
                        // We can't easily use fetch() due to CORS on some storage buckets, 
                        // but we can use getMetadata from firebase/storage to check existence.
                        // However, we already have the URL. Let's try to fetch it with a HEAD request if possible, 
                        // or just rely on the fact that we just got the downloadURL.
                        // A more robust check is to re-get the download URL or metadata.

                        // Let's parse the URL to get the ref again
                        const urlObj = new URL(url);
                        const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
                        if (!pathMatch) throw new Error('Invalid URL format');

                        const storagePath = decodeURIComponent(pathMatch[1]);
                        const storageRef = ref(storage, storagePath);
                        await getDownloadURL(storageRef); // This throws if file is missing
                    } catch (e) {
                        throw new Error(`Image verification failed for ${url}: ${e.message}`);
                    }
                });

                await Promise.all(verificationPromises);
            } catch (verificationError) {
                console.error('❌ Post verification failed! Rolling back...', verificationError);
                // Delete the ghost post
                await deleteDoc(doc(db, 'posts', docRef.id));
                throw new Error('Post creation failed: Image verification failed. Please try again.');
            }

            // ---------------------------------------------------------------
            // 4️⃣ Create shop items for images flagged for sale
            // ---------------------------------------------------------------
            const shopPromises = items
                .filter((i) => i.type === 'image' && i.addToShop)
                .map(async (item) => {
                    // Import dynamically to avoid circular dependency issues if any, 
                    // though usually top-level import is fine. 
                    // We use the imported calculateTieredPricing from top of file.
                    // But we need to make sure we imported it. 
                    // (Assuming top-level import was updated in previous step or we rely on existing imports)
                    // Wait, I need to update the imports in this file too!

                    const { calculateTieredPricing, calculateStickerPricing, PRINT_SIZES } = await import('../utils/printfulApi');

                    let printSizesConfig = PRINT_SIZES.filter((size) =>
                        item.printSizes.includes(size.id)
                    ).map((size) => {
                        const pricing = calculateTieredPricing(size.id, item.productTier, isUltra);
                        if (!pricing) return null;

                        return {
                            id: size.id,
                            label: size.label,
                            price: Number(formatPrice(pricing.finalPrice)),
                            artistEarningsCents: Math.round(pricing.artistProfit * 100),
                            platformFeeCents: Math.round(pricing.platformProfit * 100),
                        };
                    }).filter(Boolean);

                    // Add stickers if enabled
                    if (item.includeStickers) {
                        // Import STICKER_SIZES
                        const { STICKER_SIZES } = await import('../utils/printfulApi');
                        STICKER_SIZES.forEach(sticker => {
                            const pricing = calculateStickerPricing(sticker.id);
                            if (pricing) {
                                printSizesConfig.push({
                                    id: sticker.id,
                                    label: sticker.label,
                                    price: Number(formatPrice(pricing.finalPrice)),
                                    artistEarningsCents: Math.round(pricing.artistProfit * 100),
                                    platformFeeCents: Math.round(pricing.platformProfit * 100),
                                    isSticker: true
                                });
                            }
                        });
                    }

                    const shopItemDoc = {
                        userId: currentUser.uid,
                        authorId: currentUser.uid,
                        authorName,
                        postRef: docRef,
                        portfolioPostId: docRef.id,
                        title: postData.title || 'Untitled',
                        imageUrl: item.url,
                        printSizes: printSizesConfig,
                        productTier: item.productTier || 'economy',
                        includeStickers: item.includeStickers || false,
                        width: item.width,
                        height: item.height,
                        aspectRatio: item.aspectRatio,
                        exif: item.exif,
                        available: false, // Default to false (draft mode) until user configures it
                        status: 'draft',
                        createdAt: serverTimestamp(),
                        tags: postData.tags || [],
                        searchKeywords,
                        // Limited Edition Fields
                        isLimitedEdition: item.isLimitedEdition || false,
                        editionSize: item.isLimitedEdition ? (item.editionSize || 10) : null,
                        price: item.price || 0, // Store base price for reference if needed
                        soldCount: 0,
                        isSoldOut: false,
                        resaleAllowed: item.isLimitedEdition || false, // Allow resale for limited editions
                    };

                    await addDoc(collection(db, 'shopItems'), shopItemDoc);
                });

            await Promise.all(shopPromises);

            // ---------------------------------------------------------------
            // 5️⃣ Increment user post count (Safety Check Added)
            // ---------------------------------------------------------------
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Create user doc if missing
                await setDoc(userRef, {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || 'Unknown Author',
                    photoURL: currentUser.photoURL || '',
                    createdAt: serverTimestamp(),
                    postCount: 1,
                    followerCount: 0,
                    followingCount: 0,
                    bio: ''
                });
            } else {
                // Update existing doc
                const currentCount = (userSnap.data()?.postCount || 0) + 1;
                await updateDoc(userRef, { postCount: currentCount });
            }

            // ---------------------------------------------------------------
            // 6️⃣ Check for PhotoDex badges
            // ---------------------------------------------------------------
            let photoDexResult = { newBadges: [], bonusXP: 0 };
            try {
                photoDexResult = await PhotoDexService.checkAndAwardBadge(
                    currentUser.uid,
                    currentUser.displayName || currentUser.email,
                    docRef.id,
                    postDoc
                );
            } catch (photoDexError) {
                console.error('PhotoDex check failed:', photoDexError);
                // Don't fail the post creation if PhotoDex fails
            }

            // ---------------------------------------------------------------
            // 7️⃣ Add to Collection (if selected)
            // ---------------------------------------------------------------
            if (postData.collectionId) {
                try {
                    const collectionRef = doc(db, 'collections', postData.collectionId);
                    await updateDoc(collectionRef, {
                        postRefs: arrayUnion(docRef.id),
                        updatedAt: serverTimestamp()
                    });
                } catch (collectionError) {
                    console.error('Failed to add post to collection:', collectionError);
                    // Don't fail the post creation, just log the error
                }
            }

            // ---------------------------------------------------------------
            // 7️⃣ Navigate to home feed to show the new post
            // ---------------------------------------------------------------
            navigate('/');
            return { postId: docRef.id, photoDexResult };
        } catch (err) {
            console.error('Create post failed:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return { createPost, loading, error, progress };
};
