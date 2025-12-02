/**
 * Cloud Function for generating image thumbnails
 * Deploy this to Firebase Cloud Functions
 * 
 * This function automatically generates L0, L1, and L2 thumbnails
 * when a new image is uploaded to Firebase Storage
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sharp = require('sharp');
const path = require('path');
const os = require('os');
const fs = require('fs');

admin.initializeApp();

/**
 * Generate thumbnails when an image is uploaded to Storage
 */
exports.generateThumbnails = functions.storage.object().onFinalize(async (object) => {
    const filePath = object.name;
    const contentType = object.contentType;
    const bucket = admin.storage().bucket(object.bucket);

    // Exit if this is not an image
    if (!contentType || !contentType.startsWith('image/')) {
        console.log('Not an image, skipping');
        return null;
    }

    // Exit if this is already a thumbnail
    if (filePath.includes('/thumbnails/')) {
        console.log('Already a thumbnail, skipping');
        return null;
    }

    // Exit if not in posts directory
    if (!filePath.startsWith('posts/')) {
        console.log('Not a post image, skipping');
        return null;
    }

    const fileName = path.basename(filePath);
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const ext = path.extname(fileName);
    const fileDir = path.dirname(filePath);

    // Create thumbnails directory path
    const thumbnailsDir = `${fileDir}/thumbnails`;

    // Download the original file
    const tempFilePath = path.join(os.tmpdir(), fileName);
    await bucket.file(filePath).download({ destination: tempFilePath });

    console.log('Image downloaded to', tempFilePath);

    try {
        // Generate L0 (tiny, blurred, 60px)
        const l0Path = path.join(os.tmpdir(), `${fileNameWithoutExt}_l0${ext}`);
        await sharp(tempFilePath)
            .resize(60, 60, { fit: 'inside', withoutEnlargement: true })
            .blur(20)
            .jpeg({ quality: 50 })
            .toFile(l0Path);

        // Generate L1 (medium, 600px)
        const l1Path = path.join(os.tmpdir(), `${fileNameWithoutExt}_l1${ext}`);
        await sharp(tempFilePath)
            .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toFile(l1Path);

        // Upload thumbnails to Storage
        const l0UploadPath = `${thumbnailsDir}/${fileNameWithoutExt}_l0${ext}`;
        const l1UploadPath = `${thumbnailsDir}/${fileNameWithoutExt}_l1${ext}`;

        await Promise.all([
            bucket.upload(l0Path, {
                destination: l0UploadPath,
                metadata: {
                    contentType: 'image/jpeg',
                    metadata: {
                        thumbnailLevel: 'l0',
                        originalFile: filePath
                    }
                }
            }),
            bucket.upload(l1Path, {
                destination: l1UploadPath,
                metadata: {
                    contentType: 'image/jpeg',
                    metadata: {
                        thumbnailLevel: 'l1',
                        originalFile: filePath
                    }
                }
            })
        ]);

        console.log('Thumbnails uploaded successfully');

        // Get download URLs
        const [l0File] = await bucket.file(l0UploadPath).getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
        });
        const [l1File] = await bucket.file(l1UploadPath).getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
        });

        // Update Firestore document if this is a post image
        // Extract post ID from file path (posts/{userId}/{postId}/...)
        const pathParts = filePath.split('/');
        if (pathParts.length >= 3) {
            const postId = pathParts[2];

            // Update the post document with thumbnail URLs
            const db = admin.firestore();
            const postRef = db.collection('posts').doc(postId);
            const postDoc = await postRef.get();

            if (postDoc.exists) {
                const postData = postDoc.data();
                const images = postData.images || [];

                // Find the image that matches this file
                const imageIndex = images.findIndex(img => img.url && img.url.includes(fileName));

                if (imageIndex !== -1) {
                    images[imageIndex] = {
                        ...images[imageIndex],
                        thumbnailUrl: l0File,
                        previewUrl: l1File
                    };

                    await postRef.update({ images });
                    console.log('Updated post document with thumbnail URLs');
                }
            }
        }

        // Clean up temp files
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(l0Path);
        fs.unlinkSync(l1Path);

        return null;
    } catch (error) {
        console.error('Error generating thumbnails:', error);
        return null;
    }
});

/**
 * HTTP function to regenerate thumbnails for existing images
 * Call this to batch process existing images
 */
exports.regenerateThumbnails = functions.https.onRequest(async (req, res) => {
    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    try {
        // Get all posts
        const postsSnapshot = await db.collection('posts').get();
        const results = [];

        for (const doc of postsSnapshot.docs) {
            const postData = doc.data();
            const images = postData.images || [];

            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                if (!image.url) continue;

                // Extract file path from URL
                const urlParts = image.url.split('/o/')[1]?.split('?')[0];
                if (!urlParts) continue;

                const filePath = decodeURIComponent(urlParts);

                // Trigger thumbnail generation
                const file = bucket.file(filePath);
                const [exists] = await file.exists();

                if (exists) {
                    // This will trigger the generateThumbnails function
                    results.push({ postId: doc.id, imageIndex: i, filePath });
                }
            }
        }

        res.json({
            success: true,
            message: `Queued ${results.length} images for thumbnail generation`,
            results
        });
    } catch (error) {
        console.error('Error regenerating thumbnails:', error);
        res.status(500).json({ error: error.message });
    }
});
