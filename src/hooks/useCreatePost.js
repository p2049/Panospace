// src/hooks/useCreatePost.js
import { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import exifr from 'exifr';
import { PRINT_SIZES, calculateEarnings, getValidSizesForImage } from '../utils/printfulApi';
import { formatPrice } from '../utils/helpers';

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
    const [progress, setProgress] = useState(0);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // -----------------------------------------------------------------------
    // createPost – full implementation
    // -----------------------------------------------------------------------
    const createPost = async (postData, slides) => {
        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            if (!currentUser) throw new Error('Must be logged in');

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
            const postDoc = {
                userId: currentUser.uid,
                authorId: currentUser.uid,
                username,
                profileImage: avatar,
                title: postData.title || '',
                description: postData.description || '',
                tags: postData.tags || [],
                location: postData.location || null,
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
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                likeCount: 0,
                commentCount: 0,
                addToShop: items.some((i) => i.addToShop === true),
            };

            const docRef = await addDoc(collection(db, 'posts'), postDoc);

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
                        const pricing = calculateTieredPricing(size.id, item.productTier);
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
            // 6️⃣ Navigate to home feed to show the new post
            // ---------------------------------------------------------------
            navigate('/');
            return docRef.id;
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
