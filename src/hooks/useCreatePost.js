// src/hooks/useCreatePost.js
import { useState, useRef } from 'react';
import { db, storage } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, setDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PRINT_PRODUCTS, STICKER_PRODUCTS, calculateEarnings, calculateTieredPricing, calculateStickerPricing, getValidSizesForImage } from '@/domain/shop/pricing';
import { extractExifData } from '@/core/utils/exif';
import { formatPrice } from '@/core/utils/helpers';
import { AccountTypeService } from '@/core/services/firestore/users.service';
import { generateSearchKeywords } from '@/core/utils/searchKeywords';
import { extractDominantColor } from '@/core/utils/colors';
import { generateAllThumbnails, generateThumbnail } from '@/core/utils/thumbnailGenerator';
import { sanitizeTitle, sanitizeDescription, sanitizeTag } from '@/core/utils/sanitize';
import { logger } from '@/core/utils/logger';
import { getMaxImageSize, getMaxImageSizeMB, formatFileSizeMB, validateImageSize } from '@/core/constants/imageLimits';
import { invalidateProfileCache } from '@/hooks/useProfile';

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

    // Helper: Parse Firebase Storage error code for user-friendly message
    const getStorageErrorMessage = (error, slideIndex) => {
        const code = error.code || '';
        const message = error.message || '';

        // Firebase Storage error codes
        if (code === 'storage/unauthorized' || code === 'storage/unauthenticated') {
            // This means storage rules blocked the upload - likely size limit, content type, or path issue
            return `Image ${slideIndex + 1} upload blocked by storage rules. Check: file size (<10MB), file type (images only), or try logging out and back in.`;
        }
        if (code === 'storage/quota-exceeded') {
            return `Image ${slideIndex + 1} upload failed: Storage quota exceeded. Please contact support.`;
        }
        if (code === 'storage/canceled') {
            return `Image ${slideIndex + 1} upload was canceled. Please try again.`;
        }
        if (code === 'storage/retry-limit-exceeded') {
            return `Image ${slideIndex + 1} upload failed after multiple retries. Please check your connection.`;
        }
        if (code === 'storage/invalid-checksum') {
            return `Image ${slideIndex + 1} was corrupted during upload. Please try again.`;
        }
        if (code === 'storage/object-not-found') {
            return `Image ${slideIndex + 1} upload verification failed. Please try again.`;
        }
        if (code === 'storage/unknown') {
            return `Image ${slideIndex + 1} upload failed due to an unknown error. Please try again.`;
        }

        // Network errors
        if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch') || message.includes('ERR_NETWORK')) {
            return `Image ${slideIndex + 1} upload failed: Network error. Please check your connection.`;
        }

        // Timeout
        if (message.includes('timeout') || message.includes('Timeout')) {
            return `Image ${slideIndex + 1} upload timed out. Please try again with a smaller image or better connection.`;
        }

        // File too large (caught by rules)
        if (message.includes('size') || message.includes('too large') || code.includes('size')) {
            return `Image ${slideIndex + 1} is too large. Maximum size is 10MB.`;
        }

        // Invalid file type
        if (message.includes('content-type') || message.includes('contentType')) {
            return `Image ${slideIndex + 1} has an invalid file type. Only images are allowed.`;
        }

        // Generic fallback with actual error
        return `Image ${slideIndex + 1} upload failed: ${message || 'Unknown error'}`;
    };

    // Helper: Upload with Retry
    // Helper: Upload with Retry (Delegates to Canonical Uploader)
    const uploadWithRetry = async (storageRef, file, metadata = {}, retries = 3) => {
        const { uploadFile } = await import('@/services/storageUploader');

        // We pass the full path string because the new uploader expects a path, not a ref
        const fullPath = storageRef.fullPath;

        try {
            const result = await uploadFile({
                file,
                path: fullPath,
                metadata
            });
            return result.downloadURL;
        } catch (error) {
            console.error("[useCreatePost] Upload failed via canonical uploader:", error);
            throw error;
        }
    };

    // -----------------------------------------------------------------------
    // createPost – full implementation
    // status: 'published' (default) | 'draft'
    // -----------------------------------------------------------------------
    const createPost = async (postData, slides, status = 'published') => {
        // Create Post Started
        // Slides count, Post data...

        setLoading(true);
        setError(null);
        setProgress(0);
        // Loading state set

        try {
            if (!currentUser) {
                logger.error('❌ No current user!');
                throw new Error('Must be logged in');
            }
            // User authenticated

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
                    const data = userDoc.data();
                    authorName = data.username || data.displayName;
                }
            } catch (e) {
                logger.warn('Could not fetch user profile for name', e);
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
                logger.warn('Could not fetch user profile for Ultra check', e);
            }

            // Get user's account type for feed filtering
            let authorAccountType = 'art'; // Default
            try {
                authorAccountType = await AccountTypeService.getAccountType(currentUser.uid);
            } catch (e) {
                logger.warn('Could not fetch account type, using default', e);
            }

            // ---------------------------------------------------------------
            // 1️⃣ Upload images & collect metadata (Sequential Processing)
            // ---------------------------------------------------------------
            const totalSlides = slides.length;
            const processedItems = [];

            // Process slides sequentially to prevent memory/network overload
            for (let i = 0; i < totalSlides; i++) {
                const slide = slides[i];
                // Processing slide...

                // Update progress at start of each slide
                const baseProgress = (i / totalSlides) * 100;
                setProgress(Math.round(baseProgress));

                if (slide.type === 'image' || slide.type === 'stack') {
                    try {
                        // PRE-UPLOAD VALIDATION: Check file meets tier-based size limits BEFORE upload
                        // isUltra was fetched earlier - use it to determine tier limit
                        const sizeValidation = validateImageSize(slide.file.size, isUltra);

                        if (!sizeValidation.isValid) {
                            const tierName = isUltra ? 'Premium' : 'Free';
                            throw new Error(
                                `Image ${i + 1} is too large (${sizeValidation.actualMB}). ` +
                                `${tierName} accounts allow up to ${sizeValidation.limitMB}MB per image.`
                            );
                        }

                        // Validate content type
                        const fileType = slide.file.type || '';
                        if (!fileType.startsWith('image/')) {
                            logger.warn(`[Upload] Image ${i + 1} has unusual type: ${fileType}, will set explicitly`);
                        }

                        let stackImageUrls = [];

                        // 0. If STACK, upload individual component images first
                        if (slide.type === 'stack' && slide.items && slide.items.length > 0) {
                            setProgress(Math.round(baseProgress + (1 / totalSlides) * 10));

                            // Validate and upload each stack item
                            for (let j = 0; j < slide.items.length; j++) {
                                const itemFile = slide.items[j];

                                // PRE-VALIDATION for stack items too (same tier limits)
                                const itemValidation = validateImageSize(itemFile.size, isUltra);
                                if (!itemValidation.isValid) {
                                    const tierName = isUltra ? 'Premium' : 'Free';
                                    throw new Error(
                                        `Stack image ${j + 1} in slide ${i + 1} is too large (${itemValidation.actualMB}). ` +
                                        `${tierName} limit: ${itemValidation.limitMB}MB.`
                                    );
                                }

                                const itemRef = ref(storage, `posts/${currentUser.uid}/stack_${Date.now()}_${j}_${itemFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);

                                // Set content type explicitly for storage rules
                                const itemContentType = itemFile.type?.startsWith('image/') ? itemFile.type : 'image/jpeg';
                                const itemUrl = await uploadWithRetry(itemRef, itemFile, { contentType: itemContentType });
                                stackImageUrls.push(itemUrl);
                            }
                        }

                        // Generating thumbnails...
                        setProgress(Math.round(baseProgress + (1 / totalSlides) * 10)); // +10% for thumbnail gen

                        // 1. Generate Thumbnails Client-Side (For the main file - collage or single)
                        let l0, l1, l2;
                        try {
                            // GENERATE OPTIMIZED DISPLAY VERSION (L2)
                            // Max 3840px, 92% quality, no blur
                            const displayBlob = await generateThumbnail(slide.file, 3840, 0.92, false);

                            const thumbs = await generateAllThumbnails(slide.file);
                            l0 = thumbs.l0;
                            l1 = thumbs.l1;
                            l2 = displayBlob; // Use optimized blob for display, not original file
                            // Thumbnails generated
                        } catch (genError) {
                            logger.warn(`  ⚠️ Thumbnail/Opt generation failed for slide ${i + 1}, using original:`, genError);
                            l0 = slide.file;
                            l1 = slide.file;
                            l2 = slide.file;
                        }

                        // 2. Define Paths - CRITICAL: All paths must be under posts_display/{uid}/
                        const timestamp = Date.now();
                        const safeFilename = slide.file.name.replace(/[^a-zA-Z0-9.]/g, '_');
                        const baseFilename = `${timestamp}_${i}_${safeFilename}`;

                        // CRITICAL: Validate UID before generating paths
                        const uid = currentUser.uid;
                        if (!uid || typeof uid !== 'string' || uid.length === 0) {
                            throw new Error('Invalid user ID - please log in again');
                        }

                        // All display paths follow pattern: posts_display/{uid}/{filename}
                        const basePath = `posts_display/${uid}`;
                        const l2Path = `${basePath}/${baseFilename}`;
                        const l1Path = `${basePath}/thumbnails/${baseFilename}_l1.jpg`;
                        const l0Path = `${basePath}/thumbnails/${baseFilename}_l0.jpg`;

                        // DEBUG: Log paths for troubleshooting
                        logger.log(`[Upload] Image ${i + 1} paths:`, {
                            uid,
                            l2Path,
                            l1Path,
                            l0Path,
                            fileType: slide.file.type,
                            fileSize: slide.file.size
                        });

                        const l2Ref = ref(storage, l2Path);
                        const l1Ref = ref(storage, l1Path);
                        const l0Ref = ref(storage, l0Path);

                        // 3. Upload All Versions with fallback
                        // Uploading original (Display)...
                        setProgress(Math.round(baseProgress + (1 / totalSlides) * 20)); // +20% for upload start

                        // CRITICAL: Set content type explicitly to pass storage rules validation
                        const getContentType = (file) => {
                            if (file.type && file.type.startsWith('image/')) return file.type;
                            // Fallback based on extension
                            const ext = (file.name || '').split('.').pop()?.toLowerCase();
                            const typeMap = { 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'webp': 'image/webp', 'heic': 'image/heic', 'heif': 'image/heif' };
                            return typeMap[ext] || 'image/jpeg';
                        };

                        const originalContentType = getContentType(slide.file); // Use original file to guess type if blob misses it
                        const displayMetadata = { contentType: 'image/jpeg' }; // Display L2 is always JPEG/WebP from canvas
                        const thumbnailMetadata = { contentType: 'image/jpeg' }; // Thumbnails are always JPEG

                        logger.log(`[Upload] Image ${i + 1} metadata:`, { originalContentType, l2Type: l2.type || 'none' });

                        // We upload L2 (Display) first
                        const urlL2 = await uploadWithRetry(l2Ref, l2, displayMetadata);
                        logger.log(`[Upload] Image ${i + 1} display version uploaded successfully`);
                        // Original uploaded
                        setProgress(Math.round(baseProgress + (1 / totalSlides) * 50)); // +50% after main upload

                        // Upload thumbnails with fallback to original (L2) if generation failed
                        let urlL1 = urlL2;
                        let urlL0 = urlL2;

                        try {
                            // Uploading thumbnails...
                            [urlL1, urlL0] = await Promise.all([
                                uploadWithRetry(l1Ref, l1, thumbnailMetadata),
                                uploadWithRetry(l0Ref, l0, thumbnailMetadata)
                            ]);
                            // Thumbnails uploaded
                            setProgress(Math.round(baseProgress + (1 / totalSlides) * 70)); // +70% after thumbnails
                        } catch (thumbError) {
                            logger.warn('Thumbnail upload failed, using display version:', thumbError);
                            // Fallback already set above
                        }

                        // --- PRINT MASTER UPLOAD (If Shop Enabled) ---
                        let masterUrl = null;
                        let masterPath = null;
                        if (slide.addToShop) {
                            try {
                                logger.log(`[Upload] Uploading Print Master for Image ${i + 1}...`);
                                const ext = (slide.file.name || '').split('.').pop()?.toLowerCase() || 'jpg';
                                const masterRefPath = `prints_master/${uid}/${baseFilename}_master.${ext}`;
                                const masterRef = ref(storage, masterRefPath);

                                // Upload original FULL resolution file
                                masterUrl = await uploadWithRetry(masterRef, slide.file, {
                                    customMetadata: {
                                        originalName: slide.file.name,
                                        uploadedBy: uid,
                                        createdAt: new Date().toISOString()
                                    },
                                    contentType: originalContentType
                                });
                                masterPath = masterRefPath;
                                logger.log(`[Upload] Print Master uploaded: ${masterPath}`);
                            } catch (masterErr) {
                                logger.error(`[Upload] Failed to upload Print Master:`, masterErr);
                                throw new Error(`Failed to upload high-res master for shop item: ${masterErr.message}`);
                            }
                        }

                        // 4. Get Dimensions
                        // Getting dimensions...
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
                            // Dimensions retrieved
                        } catch (e) {
                            logger.warn('Failed to get image dimensions', e);
                        }

                        // 5. EXIF - Enhanced with retry
                        // Extracting EXIF...
                        let extractedExif = null;

                        // Only attempt EXIF extraction for JPEG/TIFF
                        const isExifSupported = slide.file.type === 'image/jpeg' ||
                            slide.file.type === 'image/jpg' ||
                            slide.file.type === 'image/tiff';

                        if (!isExifSupported || slide.type === 'stack') {
                            // Skipping EXIF for stacks or unsupported
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
                                // No EXIF found
                            }
                        }

                        const finalExif = slide.manualExif || extractedExif;
                        // EXIF done

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
                        // Extracting dominant color...
                        let dominantColor = null;
                        try {
                            // Add timeout for color extraction (3 seconds)
                            const colorPromise = extractDominantColor(urlL1 || urlL2);
                            const colorTimeout = new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Color extraction timeout')), 3000)
                            );
                            const colorData = await Promise.race([colorPromise, colorTimeout]);
                            dominantColor = colorData.hex;
                            // Color extracted
                        } catch (e) {
                            logger.warn('Failed to extract dominant color', e);
                        }

                        processedItems.push({
                            type: slide.type, // 'image' or 'stack'
                            url: urlL2,
                            thumbnailUrl: urlL1 || urlL2, // Use L1 as thumbnail
                            tinyUrl: urlL0 || urlL1 || urlL2, // Use L0 as tiny placeholder
                            caption: slide.caption || '',
                            exif: finalExif ? JSON.parse(JSON.stringify(finalExif)) : null,
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
                            price: slide.price || 0,

                            // Stack Metadata
                            isStack: slide.type === 'stack',
                            stackLayout: slide.type === 'stack' ? slide.layout : null,
                            stackImages: slide.type === 'stack' ? stackImageUrls : null,

                            // Master File (for Shop)
                            masterUrl: masterUrl,
                            masterPath: masterPath
                        });

                    } catch (uploadError) {
                        logger.error(`Failed to process slide ${i}:`, uploadError.code || 'no-code', uploadError);

                        // Use the new error message parser
                        const userMessage = getStorageErrorMessage(uploadError, i);
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
                .filter((i) => i.type === 'image' || i.type === 'stack')
                .map((i) => i.url);

            const thumbnailUrls = processedItems
                .filter((i) => i.type === 'image' || i.type === 'stack')
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
                uiOverlays: postData.uiOverlays ? JSON.parse(JSON.stringify(postData.uiOverlays)) : null,
                filmInfo: postData.filmMetadata?.isFilm ? {
                    filmStock: postData.filmMetadata.stock || '',
                    camera: postData.filmMetadata.cameraOverride || '',
                    lens: postData.filmMetadata.lensOverride || '',
                    iso: postData.filmMetadata.iso || '',
                    format: postData.filmMetadata.format || '',
                    scanner: postData.filmMetadata.scanner || '',
                    notes: postData.filmMetadata.lab || ''
                } : null,
                flipbookSettings: postData.flipbookSettings || null,
                layoutSettings: postData.layoutSettings || null,
                panoStackSettings: postData.panoStackSettings || null,
                location: postData.location || null,
                images: processedItems
                    .filter((i) => i.type === 'image' || i.type === 'stack')
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
                        // Stack Metadata
                        isStack: i.isStack || false,
                        stackLayout: i.stackLayout || null,
                        stackImages: i.stackImages || null
                    })),
                searchKeywords,
                likeCount: 0,
                commentCount: 0,
                addToShop: processedItems.some((i) => i.addToShop === true),
                moderationStatus: 'active',
                status: status,
                type: postData.type || 'art', // Unified type field (art/social)
                postType: postData.postType || 'image', // 'image' or 'text'
                atmosphereBackground: postData.atmosphereBackground || 'black',
                gradientColor: postData.gradientColor || null,
                // Text Post Fields
                body: postData.body || null,
                writerTheme: postData.writerTheme || null,
                linkedPostIds: postData.linkedPostIds || [],
            };

            // [PROD_DEBUG] Enhanced Logging around Firestore Write
            logger.log('[PROD_DEBUG] Attempting addDoc in /posts for User:', currentUser.uid);

            let docRef;
            try {
                docRef = await addDoc(collection(db, 'posts'), postDoc);
                logger.log('[PROD_DEBUG] Post created successfully. ID:', docRef.id);
            } catch (fsErr) {
                logger.error('[PROD_DEBUG] Firestore Write FAILED:', fsErr);
                logger.error('[PROD_DEBUG] Error Code:', fsErr.code);
                logger.error('[PROD_DEBUG] Error Message:', fsErr.message);
                if (fsErr.code === 'permission-denied') {
                    logger.error('[PROD_DEBUG] CRITICAL: Permission Denied. Check Firestore Rules for /posts.');
                }
                throw fsErr;
            }

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
                logger.error('❌ Post verification failed! Rolling back...', verificationError);
                await deleteDoc(doc(db, 'posts', docRef.id));
                throw new Error('Post creation failed: Image verification failed. Please try again.');
            }

            // ---------------------------------------------------------------
            // 4️⃣ Create shop items for images flagged for sale
            // ---------------------------------------------------------------
            const shopPromises = processedItems
                .filter((i) => i.type === 'image' && i.addToShop)
                .map(async (item) => {
                    // Using static imports instead of broken dynamic import
                    // const { calculateTieredPricing, calculateStickerPricing, PRINT_SIZES, STICKER_SIZES } = await import('../utils/printifyPricing');

                    let printSizesConfig = PRINT_PRODUCTS.filter((size) =>
                        item.printSizes.includes(size.id)
                    ).map((size) => {
                        const pricing = calculateTieredPricing(size.id, item.productTier, isUltra);
                        if (!pricing) return null;
                        return {
                            id: size.id,
                            label: size.label,
                            price: pricing.finalPrice, // FIX: Use raw number, not formatted string
                            artistEarningsCents: Math.round(pricing.artistProfit * 100),
                            platformFeeCents: Math.round(pricing.platformProfit * 100),
                        };
                    }).filter(Boolean);

                    if (item.includeStickers) {
                        STICKER_PRODUCTS.forEach(sticker => {
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
                        isSoldOut: false,
                        resaleAllowed: item.isLimitedEdition || false,

                        // Internal Master Reference (Restricted Access)
                        masterUrl: item.masterUrl || null,
                        masterPath: item.masterPath || null,
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
                    logger.error('Failed to add post to collection:', collectionError);
                }
            }

            // ---------------------------------------------------------------
            // 7️⃣ Invalidate profile cache and navigate to home feed
            // ---------------------------------------------------------------
            invalidateProfileCache(currentUser.uid);
            navigate('/');
            return {
                postId: docRef.id,
                imageUrls,
                thumbnailUrls
            };
        } catch (err) {
            logger.error('Create post failed:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return { createPost, loading, error, progress };
};
