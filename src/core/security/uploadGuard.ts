import { logger } from '@/core/utils/logger';

/**
 * TRIPWIRE: UPLOAD GUARD (DEV ONLY)
 * 
 * Passive monitor for direct Fetch calls to Firebase Storage REST API.
 * 
 * NOTE: We do NOT block requests because the Firebase SDK itself uses XHR/Fetch 
 * to communicate with these endpoints. Blocking them breaks legitimate SDK uploads.
 * 
 * This guard simply logs a warning if it detects a POST to the storage endpoint via fetch,
 * which might indicate a legacy direct-upload implementation remaining in the code.
 */

const FORBIDDEN_URL_PATTERN = /firebasestorage\.googleapis\.com\/v0\/b\/.*\/o\?name=/;

export const initializeUploadGuard = () => {
    if (typeof window === 'undefined') return;

    logger.log('🛡️ [UploadGuard] Initializing (Passive Warning Mode)...');

    // We do NOT monkeypatch XMLHttpRequest as it risks breaking the Firebase SDK.

    // Intercept Fetch only to warn
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
        let url = '';
        if (typeof input === 'string') {
            url = input;
        } else if (input instanceof Request) {
            url = input.url;
        }

        const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();

        if (method === 'POST' && FORBIDDEN_URL_PATTERN.test(url)) {
            // WARN only. Do not block.
            // It is possible this is a legitimate SDK call if the SDK uses fetch in some environments.
            // But usually SDK uses XHR. If we see a fetch here, it's worth checking.
            console.warn('⚠️ [UploadGuard] Detected POST to Firebase Storage. If this is not the SDK, verify you are using storageUploader.', url);
        }

        return originalFetch.apply(this, arguments as any);
    };
};
