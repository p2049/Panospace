/**
 * PANOSPACE DATE UTILITIES
 * 
 * Centralized date handling and formatting.
 * Consolidates date parsing, display formatting, and calendar generation.
 */

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

    // Firestore Timestamp fallback (duck typing)
    if (dateValue && typeof dateValue.toDate === 'function') {
        return dateValue.toDate();
    }

    return null;
};

export { parseDate };

/**
 * Get the derived date from a post using priority logic
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
        return parseDate(post.createdAt);
    }

    return null;
};

/**
 * Check if two dates are the same day (ignoring time)
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
 * Format a date for display (e.g., "Jan 15, 2024")
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
 */
export const parseDateFromURL = (dateString) => {
    if (!dateString) return null;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return null;
    const date = new Date(dateString + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
};

/**
 * Generate calendar days for a given month
 * Used in calendar views
 */
export const generateCalendarDays = (currentDate) => {
    const days = [];

    // Get month boundaries
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const firstDayOfMonth = monthStart.getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Previous month days to fill the first week
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        days.push({
            date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i),
            isCurrentMonth: false
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
            isCurrentMonth: true
        });
    }

    // Next month days to fill grid (6 rows * 7 days = 42 total cells)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
            isCurrentMonth: false
        });
    }

    return days;
};
