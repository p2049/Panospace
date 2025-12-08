/**
 * Safe Utility Helpers
 * 
 * Defensive functions for common operations to prevent runtime errors.
 */

/**
 * Safely format a price value
 * Handles undefined, null, strings, and numbers
 */
export function formatPrice(price: number | string | undefined | null): string {
    const numPrice = Number(price || 0);
    if (isNaN(numPrice)) return '$0.00';
    return `$${numPrice.toFixed(2)}`;
}

/**
 * Format price without dollar sign (for input fields)
 */
export function formatPriceInput(price: number | string | undefined | null): string {
    const numPrice = Number(price || 0);
    if (isNaN(numPrice)) return '0.00';
    return numPrice.toFixed(2);
}

/**
 * Safely get nested property
 */
export function getNestedValue<T>(obj: any, path: string, defaultValue: T): T {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current == null || typeof current !== 'object') {
            return defaultValue;
        }
        current = current[key];
    }

    return current !== undefined ? current : defaultValue;
}

/**
 * Safely parse JSON
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
    try {
        return JSON.parse(json);
    } catch {
        return defaultValue;
    }
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Safe array access
 */
export function safeArrayAccess<T>(arr: T[] | undefined | null, index: number, defaultValue: T): T {
    if (!arr || index < 0 || index >= arr.length) {
        return defaultValue;
    }
    return arr[index] as T;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate EXIF field
 */
export function validateExifField(field: string, value: any): boolean {
    if (!value) return true; // Empty is valid (optional)

    switch (field) {
        case 'focalLength':
            return !isNaN(value) && value > 0 && value <= 2000;
        case 'fNumber':
            return !isNaN(value) && value >= 0.7 && value <= 64;
        case 'iso':
            return !isNaN(value) && value >= 50 && value <= 409600;
        case 'exposureTime':
            return typeof value === 'string' && value.length > 0;
        default:
            return true;
    }
}
