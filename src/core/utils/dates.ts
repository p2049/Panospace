/**
 * PANOSPACE DATE UTILITIES
 * 
 * Centralized date handling and formatting.
 * Consolidates date parsing, display formatting, and calendar generation.
 */

import type { Post } from '@/types';

// Duck typing for Firestore Timestamp to avoid hard dependency on firebase SDK here if possible,
// or just import generic interface.
interface TimestampLike {
    toDate: () => Date;
}

type DateInput = string | number | Date | TimestampLike | null | undefined;

/**
 * Parse various date formats into a Date object
 */
export const parseDate = (dateValue: DateInput): Date | null => {
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
    if (typeof (dateValue as TimestampLike).toDate === 'function') {
        return (dateValue as TimestampLike).toDate();
    }

    return null;
};

/**
 * Get the derived date from a post using priority logic
 */
export const getDerivedDate = (post: Partial<Post>): Date | null => {
    if (!post) return null;

    // Priority 1: Manual EXIF date
    // Note: manualExif might not be on all Post variants in legacy data, so optional access
    if (post.manualExif?.dateTime) {
        const date = parseDate(post.manualExif.dateTime);
        if (date) return date;
    }

    // Priority 2: EXIF date
    if (post.exif?.dateTime) {
        // Standard EXIF often uses "YYYY:MM:DD HH:MM:SS" which Date() might not parse directly
        // But parseDate just uses new Date(string).
        // If EXIF data is cleaned before storage to ISO, it works.
        // Assuming post.exif.dateTime is parseable string.
        const date = parseDate(post.exif.dateTime);
        if (date) return date;
    }

    // Legacy EXIF fields?
    // In JS version: post.exif.dateTaken, post.exif.date
    // The TypeScript 'Post' interface has 'dateTime' in 'ExifData'.
    // We should support legacy fields if they exist in runtime data but aren't in strict type.
    const exifAny = post.exif as any;
    if (exifAny?.dateTaken) {
        const date = parseDate(exifAny.dateTaken);
        if (date) return date;
    }
    if (exifAny?.date) {
        const date = parseDate(exifAny.date);
        if (date) return date;
    }

    // Priority 3: Created at timestamp
    if (post.createdAt) {
        return parseDate(post.createdAt as any);
    }

    return null;
};

/**
 * Check if two dates are the same day (ignoring time)
 */
export const isSameDate = (date1: DateInput, date2: DateInput): boolean => {
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
export const formatDateForDisplay = (date: DateInput): string => {
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
export const formatDateForInput = (date: DateInput): string => {
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
export const parseDateFromURL = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return null;
    const date = new Date(dateString + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
};

export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
}

/**
 * Generate calendar days for a given month
 * Used in calendar views
 */
export const generateCalendarDays = (currentDate: Date): CalendarDay[] => {
    const days: CalendarDay[] = [];

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

/**
 * Stub for date migration utility
 * TODO: Implement actual migration logic if needed
 */
export const migrateDateFormats = async (): Promise<{ success: boolean; updated: number; skipped: number; error?: string }> => {
    console.warn('migrateDateFormats is a stub - not implemented');
    return { success: true, updated: 0, skipped: 0 };
};
