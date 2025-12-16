import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';
import { logger } from '@/core/utils/logger';

/**
 * Standardized upload response
 */
export interface UploadResult {
    downloadURL: string;
    fullPath: string;
    metadata?: any;
}

/**
 * Configuration for uploads
 */
export interface UploadConfig {
    file: File | Blob;
    path: string; // Full storage path including filename
    metadata?: any;
    onProgress?: (progress: number) => void;
}

/**
 * CANONICAL FIREBASE STORAGE UPLOADER
 * 
 * This is the ONLY authorized way to upload files to Firebase Storage.
 * It strictly uses the Firebase SDK (uploadBytesResumable) to avoid CORS issues
 * associated with direct REST API access.
 */
export const uploadFile = async ({
    file,
    path,
    metadata = {},
    onProgress
}: UploadConfig): Promise<UploadResult> => {
    // 1. Validation
    if (!file) throw new Error('No file provided for upload');
    if (!path) throw new Error('No storage path provided');
    if (!storage) throw new Error('Firebase Storage not initialized');

    // 2. Create Reference
    const storageRef = ref(storage, path);

    logger.log(`[StorageUploader] Starting upload to: ${path}`, { size: file.size, type: file.type });

    // 3. Create Upload Task (Resumable)
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // 4. Handle Progress & Completion
    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);

                // Optional: Log progress at intervals
                if (progress % 20 === 0) {
                    logger.log(`[StorageUploader] Progress: ${Math.round(progress)}%`);
                }
            },
            (error) => {
                logger.error('[StorageUploader] Upload failed:', error);

                // Enhance error message for known issues
                if (error.code === 'storage/unauthorized') {
                    reject(new Error(`Upload blocked by permissions: ${error.message}`));
                } else if (error.code === 'storage/canceled') {
                    reject(new Error('Upload canceled'));
                } else {
                    reject(error);
                }
            },
            async () => {
                // 5. Success - Get Download URL
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const fullPath = uploadTask.snapshot.ref.fullPath;

                    logger.log('[StorageUploader] Upload complete', { fullPath, downloadURL });

                    resolve({
                        downloadURL,
                        fullPath,
                        metadata: uploadTask.snapshot.metadata
                    });
                } catch (urlError) {
                    logger.error('[StorageUploader] Failed to get download URL:', urlError);
                    reject(urlError);
                }
            }
        );
    });
};

/**
 * Helper for converting existing code that expects { url }
 */
export const uploadPostImage = async (file: File, userId: string): Promise<{ url: string, storagePath: string }> => {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const path = `posts/${userId}/${fileName}`;

    const result = await uploadFile({
        file,
        path
    });

    return {
        url: result.downloadURL,
        storagePath: result.fullPath
    };
};
