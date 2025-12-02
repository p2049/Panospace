/**
 * Date helper utilities for Search by Date feature
 */

/**
 * Get the derived date from a post using priority logic:
 * 1. manualExif.dateShot (user-provided)
 * 2. exif.date or exif.dateTaken (from EXIF data)
 * 3. createdAt (fallback)
 * 
 * @param {Object} post - The post object
 * @returns {Date|null} - The derived date or null if no valid date found
 */
export const getDerivedDate = (post) => {
    if (!post) return null;

    // Priority 1: Manual EXIF date
    if (post.manualExif?.dateShot) {
        const date = parseDate(post.manualExif.dateShot);
        if (date) return date;
    }

    // Priority 2: EXIF date
    if (post.exif?.dateTaken) {
        const date = parseDate(post.exif.dateTaken);
        if (date) return date;
    }
    if (post.exif?.date) {
        const date = parseDate(post.exif.date);
        if (date) return date;
    }

    // Priority 3: Created at timestamp
    if (post.createdAt) {
        // Firestore timestamp
        if (post.createdAt.toDate) {
            return post.createdAt.toDate();
        }
        // Already a Date object
        if (post.createdAt instanceof Date) {
            return post.createdAt;
        }
        // String or number
        const date = parseDate(post.createdAt);
        if (date) return date;
    }

    return null;
};

/**
 * Parse various date formats into a Date object
 * @param {string|number|Date} dateValue - The date value to parse
 * @returns {Date|null} - Parsed date or null if invalid
 */
const parseDate = (dateValue) => {
    if (!dateValue) return null;

    if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? null : dateValue;
    }

    if (typeof dateValue === 'number') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
    }

    if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
    }

    return null;
};

/**
 * Check if two dates are the same day (ignoring time)
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} - True if same day
 */
export const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;

    const d1 = parseDate(date1);
    const d2 = parseDate(date2);

    if (!d1 || !d2) return false;

    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

/**
 * Format a date for display
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date string (e.g., "Jan 15, 2024")
 */
export const formatDateForDisplay = (date) => {
    const d = parseDate(date);
    if (!d) return '';

    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format a date for input value (YYYY-MM-DD)
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDateForInput = (date) => {
    const d = parseDate(date);
    if (!d) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Parse date from URL param (YYYY-MM-DD format)
 * @param {string} dateString - Date string from URL
 * @returns {Date|null} - Parsed date or null
 */
export const parseDateFromURL = (dateString) => {
    if (!dateString) return null;

    // Validate YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return null;

    const date = new Date(dateString + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
};
