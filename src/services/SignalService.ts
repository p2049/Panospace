
import { db } from '@/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    getCountFromServer,
    limit,
    Timestamp
} from 'firebase/firestore';
import exifr from 'exifr'; // Assuming exifr is available as seen in package.json
import { logger } from '@/core/utils/logger';

export const SignalService = {
    /**
     * Generates a unique Signal Tag: #Signal[Count]-[Username]
     */
    async generateSignatureTag(userId: string, username: string) {
        if (!userId || !username) throw new Error("User required for signature tag");

        // Clean username
        const cleanUser = username.replace(/[^a-zA-Z0-9]/g, '');

        try {
            // Get count of user's existing signals to increment
            // This is an estimation. For strict uniqueness we might rely on Doc ID, 
            // but the requirement asks for a readable tag.
            const q = query(
                collection(db, 'posts'),
                where('createdBy', '==', userId),
                where('isSignal', '==', true)
            );
            const snapshot = await getCountFromServer(q);
            const count = snapshot.data().count + 1;

            return `Signal${count}-${cleanUser}`;
        } catch (error) {
            console.error("Error generating signal tag:", error);
            // Fallback unique tag
            return `Signal${Date.now().toString(36)}-${cleanUser}`;
        }
    },

    /**
     * Validates an image file against contest requirements using EXIF data.
     * @param {File} file 
     * @param {Object} requirements { filmOnly: boolean, camera: string, etc }
     */
    async validateSubmission(file: File, requirements: any) {
        if (!requirements || Object.keys(requirements).length === 0) return { valid: true };

        try {
            // Parse EXIF
            const exif = await exifr.parse(file);
            if (!exif) {
                // If film only is required and no EXIF, it *might* be a scan, but usually scans have no camera data.
                // However, digital photos usually HAVE camera data.
                // Strict validation: if digitalOnly is required and no exif -> fail?
                // Let's implement loose logic for now.
                return { valid: true, warning: "No EXIF data found. Requirements could not be strictly verified." };
            }

            const make = exif.Make || '';
            const model = exif.Model || '';

            // Check Camera
            if (requirements.camera && !`${make} ${model}`.toLowerCase().includes(requirements.camera.toLowerCase())) {
                return { valid: false, error: `Signal Mismatch: Camera requires ${requirements.camera}` };
            }

            // Check Film Only (Mock logic: Digital usually has 'Make' populated with Sony/Canon/Nikon)
            // Real film validation is hard on digital scans without specific metadata.
            // We'll trust the user or check for known digital signatures if 'filmOnly' is set.

            return { valid: true };

        } catch (error) {
            console.error("EXIF Validation Error:", error);
            return { valid: false, error: "Could not parse image metadata." };
        }
    }
};
