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
    // 1. Validation & Auth Readiness Check
    if (!file) throw new Error('No file provided for upload');
    if (!path) throw new Error('No storage path provided');
    if (!storage) throw new Error('Firebase Storage not initialized');

    // Use synchronous check to prevent race conditions during auth initialization
    const { auth } = await import('@/firebase');
    const user = auth.currentUser;

    if (!user) {
        console.error('[StorageUploader] Blocked upload attempt - No authenticated user found.');
        throw new Error('Upload blocked: Authentication is not ready or user is logged out.');
    }

    // 2. Create Reference
    const storageRef = ref(storage, path);

    // --- RUNTIME VALIDATION (DEBUG ONLY) ---
    console.log(`[StorageUploader] Starting upload:`, {
        uid: user.uid,
        path: path,
        bucket: storage.app.options.storageBucket,
        fullRefPath: storageRef.fullPath
    });
    // ---------------------------------------



    // 3. Create Upload Task (Resumable)
    // Auto-inject contentType if missing to prevent CORS issues
    const finalMetadata = {
        contentType: file.type,
        ...metadata,
    };

    const uploadTask = uploadBytesResumable(storageRef, file, finalMetadata);

    // 4. Handle Progress & Completion
    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);

                // Optional: Log progress at intervals

            },
            (error) => {


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



                    resolve({
                        downloadURL,
                        fullPath,
                        metadata: uploadTask.snapshot.metadata
                    });
                } catch (urlError) {

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
