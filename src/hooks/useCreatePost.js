// src/hooks/useCreatePost.js
import { useState, useRef } from 'react';
import { db, storage } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, setDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PRINT_SIZES, calculateEarnings, getValidSizesForImage } from '@/core/utils/pricing';
import { extractExifData } from '@/core/utils/exif';
import { formatPrice } from '@/core/utils/helpers';
import { AccountTypeService } from '@/core/services/firestore/users.service';
import { generateSearchKeywords } from '@/core/utils/searchKeywords';
import { extractDominantColor } from '@/core/utils/colors';
import { generateAllThumbnails } from '@/core/utils/thumbnailGenerator';
import { sanitizeTitle, sanitizeDescription, sanitizeTag } from '@/core/utils/sanitize';

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

    // Helper: Upload with Retry
    const uploadWithRetry = async (storageRef, file, metadata = {}, retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const uploadTask = uploadBytesResumable(storageRef, file, metadata);

                // Add timeout protection (60 seconds per upload)
                const uploadPromise = new Promise((resolve, reject) => {
                    uploadTask.on('state_changed', null, reject, resolve);
                });

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Upload timeout - please check your connection')), 60000)
                );

                await Promise.race([uploadPromise, timeoutPromise]);
                return await getDownloadURL(storageRef);
            } catch (err) {
                console.warn(`Upload attempt ${i + 1} failed:`, err);
                if (i === retries - 1) throw err;
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i))); // Exponential backoff
            }
        }
    };

    // -----------------------------------------------------------------------
    // createPost – full implementation
    // status: 'published' (default) | 'draft'
    // -----------------------------------------------------------------------
    const createPost = async (postData, slides, status = 'published') => {
        console.log('🚀 CREATE POST STARTED');
        console.log('📊 Slides count:', slides.length);
        console.log('📝 Post data:', postData);

        setLoading(true);
        setError(null);
        setProgress(0);
        console.log('✅ Loading state set to true, progress set to 0');

        try {
            if (!currentUser) {
                console.error('❌ No current user!');
                throw new Error('Must be logged in');
            }
            console.log('✅ User authenticated:', currentUser.uid);

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
            // 1️⃣ Upload images & collect metadata (Sequential Processing)
            // ---------------------------------------------------------------
            const totalSlides = slides.length;
            const processedItems = [];

            // Process slides sequentially to prevent memory/network overload
            for (let i = 0; i < totalSlides; i++) {
                const slide = slides[i];
                console.log(`🖼️ Processing slide ${i + 1}/${totalSlides}...`);

                // Update progress at start of each slide
                const baseProgress = (i / totalSlides) * 100;
                setProgress(Math.round(baseProgress));

                if (slide.type === 'image') {
                    try {
                        console.log(`  📸 Generating thumbnails for slide ${i + 1}...`);
                        setProgress(Math.round(baseProgress + (1 / totalSlides) * 10)); // +10% for thumbnail gen

                        // 1. Generate Thumbnails Client-Side
                        let l0, l1, l2;
                        try {
                            const thumbs = await generateAllThumbnails(slide.file);
                            l0 = thumbs.l0;
                            l1 = thumbs.l1;
                            l2 = thumbs.l2;
                            console.log(`  ✅ Thumbnails generated for slide ${i + 1}`);
                        } catch (genError) {
                            console.warn(`  ⚠️ Thumbnail generation failed for slide ${i + 1}, using original:`, genError);
                            l0 = slide.file;
                            l1 = slide.file;
                            l2 = slide.file;
                        }

                        // 2. Define Paths
                        const timestamp = Date.now();
                        const baseFilename = `${timestamp}_${i}_${slide.file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

                        const l2Ref = ref(storage, `posts/${currentUser.uid}/${baseFilename}`);
                        const l1Ref = ref(storage, `posts/${currentUser.uid}/thumbnails/${baseFilename}_l1.jpg`);
                        const l0Ref = ref(storage, `posts/${currentUser.uid}/thumbnails/${baseFilename}_l0.jpg`);

                        // 3. Upload All Versions with fallback
                        console.log(`  ⬆️ Uploading original image ${i + 1}...`);
                        setProgress(Math.round(baseProgress + (1 / totalSlides) * 20)); // +20% for upload start

                        // We upload L2 (Original) first to ensure we have the main asset
                        const urlL2 = await uploadWithRetry(l2Ref, l2);
                        console.log(`  ✅ Original uploaded for slide ${i + 1}`);
                        setProgress(Math.round(baseProgress + (1 / totalSlides) * 50)); // +50% after main upload

                        // Upload thumbnails with fallback to original if generation failed
                        let urlL1 = urlL2; // Fallback
                        let urlL0 = urlL2; // Fallback

                        try {
                            console.log(`  ⬆️ Uploading thumbnails for slide ${i + 1}...`);
                            [urlL1, urlL0] = await Promise.all([
                                uploadWithRetry(l1Ref, l1),
                                uploadWithRetry(l0Ref, l0)
                            ]);
                            console.log(`  ✅ Thumbnails uploaded for slide ${i + 1}`);
                            setProgress(Math.round(baseProgress + (1 / totalSlides) * 70)); // +70% after thumbnails
                        } catch (thumbError) {
                            console.warn('Thumbnail upload failed, using original:', thumbError);
                            // Fallback already set above
                        }

                        // 4. Get Dimensions
                        console.log(`  📐 Getting dimensions for slide ${i + 1}...`);
                        let width = null;
                        let height = null;
                        try {
                            const img = new Image();
                            img.src = urlL2;
                            await new Promise((resolve, reject) => {
                                img.onload = resolve;
                                img.onerror = reject;
                            });
                            width = img.naturalWidth;
                            height = img.naturalHeight;
                            console.log(`  ✅ Dimensions: ${width}x${height}`);
                        } catch (e) {
                            console.warn('Failed to get image dimensions', e);
                        }

                        // 5. EXIF - Enhanced with retry
                        console.log(`  📷 Extracting EXIF for slide ${i + 1}...`);
                        let extractedExif = null;

                        // Only attempt EXIF extraction for JPEG/TIFF
                        const isExifSupported = slide.file.type === 'image/jpeg' ||
                            slide.file.type === 'image/jpg' ||
                            slide.file.type === 'image/tiff';

                        if (!isExifSupported) {
                            console.log('  ⏭️ Skipping EXIF for non-JPEG/TIFF file');
                        } else {
                            try {
                                // ONE SHOT ONLY - 300ms timeout
                                // If it takes longer than 300ms, it likely doesn't have EXIF or is too big to parse quickly.
                                const exifPromise = extractExifData(slide.file);
                                const timeoutPromise = new Promise((_, reject) =>
                                    setTimeout(() => reject(new Error('EXIF timeout')), 300)
                                );

                                extractedExif = await Promise.race([exifPromise, timeoutPromise]);
                            } catch (e) {
                                // Silently fail or log debug only - don't stop, don't retry
                                console.log('  ⏭️ No EXIF data found or extraction timed out (skipping)');
                            }
                        }

                        const finalExif = slide.manualExif || extractedExif;
                        console.log(`  ✅ EXIF extracted for slide ${i + 1}`);

                        // 6. Print Sizes
                        const validSizes = getValidSizesForImage(width, height);
                        const imgRatio = width && height ? width / height : 1.5;
                        const bestFitSizes = validSizes.filter(s => {
                            const sizeRatio = s.ratio;
                            const matchLandscape = Math.abs(sizeRatio - imgRatio) < 0.08;
                            const matchPortrait = Math.abs((1 / sizeRatio) - imgRatio) < 0.08;
                            return matchLandscape || matchPortrait;
                        });
                        const printSizeIds = bestFitSizes.map((s) => s.id);

                        // 7. Dominant Color
                        console.log(`  🎨 Extracting color for slide ${i + 1}...`);
                        let dominantColor = null;
                        try {
                            // Add timeout for color extraction (3 seconds)
                            const colorPromise = extractDominantColor(urlL1 || urlL2);
                            const colorTimeout = new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Color extraction timeout')), 3000)
                            );
                            const colorData = await Promise.race([colorPromise, colorTimeout]);
                            dominantColor = colorData.hex;
                            console.log(`  ✅ Color extracted: ${dominantColor}`);
                        } catch (e) {
                            console.warn('Failed to extract dominant color', e);
                        }

                        processedItems.push({
                            type: 'image',
                            url: urlL2,
                            thumbnailUrl: urlL1 || urlL2, // Use L1 as thumbnail
                            tinyUrl: urlL0 || urlL1 || urlL2, // Use L0 as tiny placeholder
                            caption: slide.caption || '',
                            exif: finalExif || null,
                            addToShop: slide.addToShop || false,
                            productTier: slide.productTier || 'economy',
                            includeStickers: slide.includeStickers || false,
                            printSizes: printSizeIds,
                            customPrices: {},
                            width,
                            height,
                            aspectRatio: imgRatio,
                            allowCropped: slide.allowCropped || false,
                            dominantColor,
                            isLimitedEdition: slide.isLimitedEdition || false,
                            editionSize: slide.editionSize || 10,
                            price: slide.price || 0
                        });

                    } catch (uploadError) {
                        console.error(`Failed to process slide ${i}:`, uploadError);
                        // Provide detailed error message
                        const errorMsg = uploadError.message || 'Unknown error';
                        const isNetworkError = errorMsg.includes('network') || errorMsg.includes('fetch');
                        const isStorageError = errorMsg.includes('storage') || errorMsg.includes('quota');

                        let userMessage = `Failed to upload image ${i + 1}.`;
                        if (isNetworkError) {
                            userMessage += ' Network error detected. Please check your connection and try again.';
                        } else if (isStorageError) {
                            userMessage += ' Storage error. You may have reached your storage limit.';
                        } else {
                            userMessage += ` Error: ${errorMsg}`;
                        }

                        throw new Error(userMessage);
                    }
                } else {
                    // Text slide
                    processedItems.push({
                        type: 'text',
                        content: slide.content,
                        caption: slide.caption || '',
                    });
                }

                // Update progress
                setProgress(Math.round(((i + 1) / totalSlides) * 100));
            }

            // ---------------------------------------------------------------
            // 2️⃣ Build search keywords (title, tags, username)
            // ---------------------------------------------------------------
            // Sanitize tags
            const sanitizedTags = (postData.tags || [])
                .map(t => sanitizeTag(t))
                .filter(t => t.length > 0);

            const uniqueTags = [...new Set(sanitizedTags)];

            const searchKeywords = [
                ...generateSearchKeywords(postData.title || ''),
                ...uniqueTags,
                ...generateSearchKeywords(username),
            ].filter((k) => k.length > 0);

            // ---------------------------------------------------------------
            // 3️⃣ Create main post document
            // ---------------------------------------------------------------
            const imageUrls = processedItems
                .filter((i) => i.type === 'image')
                .map((i) => i.url);

            const thumbnailUrls = processedItems
                .filter((i) => i.type === 'image')
                .map((i) => i.thumbnailUrl);

            const locationName = postData.location ?
                [postData.location.city, postData.location.state, postData.location.country]
                    .filter(Boolean)
                    .join(', ') : '';

            const postDoc = {
                uid: currentUser.uid,
                username,
                userAvatar: avatar,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                caption: postData.title || '',
                imageUrls,
                thumbnailUrls,
                tags: uniqueTags,
                locationName,
                lat: postData.location?.lat || null,
                lng: postData.location?.lng || null,
                likesCount: 0,
                commentsCount: 0,
                artType: postData.artType || 'photography',
                category: postData.category || 'general',
                contestTag: postData.contestTag || '',
                safe: true,
                shopEnabled: processedItems.some((i) => i.addToShop === true),
                shopProducts: processedItems.some((i) => i.addToShop === true) ?
                    processedItems.filter((i) => i.addToShop).map((i) => ({
                        url: i.url,
                        tier: i.productTier,
                        sizes: i.printSizes
                    })) : [],
                hasSlides: processedItems.length > 1,
                hasItems: processedItems.length > 0,
                hasImages: imageUrls.length > 0,
                dominantColor: processedItems.find(i => i.dominantColor)?.dominantColor || null,
                authorAccountType,
                collectionId: postData.collectionId || null,
                collectionPostToFeed: postData.collectionPostToFeed ?? null,
                showInProfile: postData.showInProfile !== undefined ? postData.showInProfile : true,
                userId: currentUser.uid,
                authorId: currentUser.uid,
                profileImage: avatar,
                title: sanitizeTitle(postData.title || ''),
                description: sanitizeDescription(postData.description || ''),
                colorTags: postData.colorTags || [],
                moodTags: postData.moodTags || [],
                seasonalTags: postData.seasonalTags || [],
                timeOfDayTags: postData.timeOfDayTags || [],
                filmMetadata: postData.filmMetadata || null,
                enableRatings: postData.enableRatings || false,
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
                postType: postData.postType || 'standard',
                flipbookSettings: postData.flipbookSettings || null,
                layoutSettings: postData.layoutSettings || null,
                panoStackSettings: postData.panoStackSettings || null,
                location: postData.location || null,
                images: processedItems
                    .filter((i) => i.type === 'image')
                    .map((i) => ({
                        url: i.url,
                        thumbnailUrl: i.thumbnailUrl,
                        tinyUrl: i.tinyUrl,
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
                addToShop: processedItems.some((i) => i.addToShop === true),
                moderationStatus: 'active',
                status: status,
                type: postData.type || 'art', // Unified type field
            };

            const docRef = await addDoc(collection(db, 'posts'), postDoc);

            // ---------------------------------------------------------------
            // 🚨 FAIL-SAFE: Verify images exist in storage immediately
            // ---------------------------------------------------------------
            try {
                const verificationPromises = imageUrls.map(async (url) => {
                    try {
                        const urlObj = new URL(url);
                        const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
                        if (!pathMatch) throw new Error('Invalid URL format');
                        const storagePath = decodeURIComponent(pathMatch[1]);
                        const storageRef = ref(storage, storagePath);
                        await getDownloadURL(storageRef);
                    } catch (e) {
                        throw new Error(`Image verification failed for ${url}: ${e.message}`);
                    }
                });
                await Promise.all(verificationPromises);
            } catch (verificationError) {
                console.error('❌ Post verification failed! Rolling back...', verificationError);
                await deleteDoc(doc(db, 'posts', docRef.id));
                throw new Error('Post creation failed: Image verification failed. Please try again.');
            }

            // ---------------------------------------------------------------
            // 4️⃣ Create shop items for images flagged for sale
            // ---------------------------------------------------------------
            const shopPromises = processedItems
                .filter((i) => i.type === 'image' && i.addToShop)
                .map(async (item) => {
                    const { calculateTieredPricing, calculateStickerPricing, PRINT_SIZES, STICKER_SIZES } = await import('../utils/printifyPricing');

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

                    if (item.includeStickers) {
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
                        thumbnailUrl: item.thumbnailUrl,
                        printSizes: printSizesConfig,
                        productTier: item.productTier || 'economy',
                        includeStickers: item.includeStickers || false,
                        width: item.width,
                        height: item.height,
                        aspectRatio: item.aspectRatio,
                        exif: item.exif,
                        available: false,
                        status: 'draft',
                        createdAt: serverTimestamp(),
                        tags: uniqueTags,
                        searchKeywords,
                        isLimitedEdition: item.isLimitedEdition || false,
                        editionSize: item.isLimitedEdition ? (item.editionSize || 10) : null,
                        price: item.price || 0,
                        soldCount: 0,
                        isSoldOut: false,
                        resaleAllowed: item.isLimitedEdition || false,
                    };

                    await addDoc(collection(db, 'shopItems'), shopItemDoc);
                });

            await Promise.all(shopPromises);

            // ---------------------------------------------------------------
            // 5️⃣ Increment user post count
            // ---------------------------------------------------------------
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
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
                const currentCount = (userSnap.data()?.postCount || 0) + 1;
                await updateDoc(userRef, { postCount: currentCount });
            }

            // ---------------------------------------------------------------
            // 6️⃣ Add to Collection (if selected)
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
                }
            }

            // ---------------------------------------------------------------
            // 7️⃣ Navigate to home feed
            // ---------------------------------------------------------------
            navigate('/');
            return {
                postId: docRef.id,
                imageUrls,
                thumbnailUrls
            };
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
