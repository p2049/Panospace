/**
 * Event Validation Utilities
 * Validates post submissions against event requirements
 */

import { getDerivedDate } from './dates';
import type { Post } from '@/types';

// Extended Post type for validation logic
interface ValidationPost extends Partial<Post> {
    manualExif?: any;
    filmMetadata?: {
        stock?: string;
        format?: string;
        cameraOverride?: string;
        lensOverride?: string;
        isFilm?: boolean;
    };
    exif?: any;
    parkId?: string;
}

interface EventRequirements {
    park?: string;
    city?: string;
    filmStock?: string;
    filmFormat?: string;
    camera?: string;
    lens?: string;
    location?: string;
}

interface PanospaceEvent {
    requirements?: EventRequirements;
    filmRequired?: boolean;
    digitalOnly?: boolean;
    shotDateRequired?: boolean;
    aestheticTagsRequired?: string[];
    startTime: string | number | Date;
    expiresAt: string | number | Date;
    eventType: string;
    isTimedDrop?: boolean;
    dropTime?: string | number | Date;
    allowSubmissionsBeforeStart?: boolean;
    allowSubmissionsAfterEnd?: boolean;
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validates a post against event requirements
 */
export function validateSubmission(post: ValidationPost, event: PanospaceEvent): ValidationResult {
    const errors: string[] = [];

    if (!event.requirements && !event.filmRequired && !event.digitalOnly && !event.shotDateRequired) {
        return { valid: true, errors: [] };
    }

    // Check requirements
    if (event.requirements) {
        const { park, city, filmStock, filmFormat, camera, lens, location } = event.requirements;

        // Park requirement
        if (park && post.parkId !== park) {
            errors.push(`Park must be: ${park}`);
        }

        // City requirement
        if (city && post.location?.city?.toLowerCase() !== city.toLowerCase()) {
            errors.push(`City must be: ${city}`);
        }

        // Film stock requirement
        if (filmStock && post.filmMetadata?.stock?.toLowerCase() !== filmStock.toLowerCase()) {
            errors.push(`Film stock must be: ${filmStock}`);
        }

        // Film format requirement
        if (filmFormat && post.filmMetadata?.format?.toLowerCase() !== filmFormat.toLowerCase()) {
            errors.push(`Film format must be: ${filmFormat}`);
        }

        // Camera requirement
        if (camera) {
            const postCamera = post.exif?.make || post.manualExif?.make || post.filmMetadata?.cameraOverride || '';
            if (!postCamera.toLowerCase().includes(camera.toLowerCase())) {
                errors.push(`Camera must include: ${camera}`);
            }
        }

        // Lens requirement
        if (lens) {
            const postLens = post.exif?.lensModel || post.manualExif?.lensModel || post.filmMetadata?.lensOverride || '';
            if (!postLens.toLowerCase().includes(lens.toLowerCase())) {
                errors.push(`Lens must include: ${lens}`);
            }
        }

        // Location requirement
        if (location) {
            const postLocation = `${post.location?.city || ''} ${post.location?.state || ''} ${post.location?.country || ''}`.toLowerCase();
            if (!postLocation.includes(location.toLowerCase())) {
                errors.push(`Location must include: ${location}`);
            }
        }
    }

    // Check constraints
    if (event.filmRequired && !post.filmMetadata?.isFilm) {
        errors.push('Film photography required');
    }

    if (event.digitalOnly && post.filmMetadata?.isFilm) {
        errors.push('Digital photography only');
    }

    if (event.shotDateRequired) {
        const derivedDate = getDerivedDate(post as any);
        if (!derivedDate) {
            errors.push('Shot date required');
        }
    }

    // Check aesthetic tags
    if (event.aestheticTagsRequired && event.aestheticTagsRequired.length > 0) {
        const postTags = (post.tags || []).map(t => t.toLowerCase());
        const missingTags = event.aestheticTagsRequired.filter(
            tag => !postTags.includes(tag.toLowerCase())
        );
        if (missingTags.length > 0) {
            errors.push(`Missing required tags: ${missingTags.join(', ')}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export type EventStatus = 'upcoming' | 'open' | 'closed';

/**
 * Get event status based on timing
 */
export function getEventStatus(event: PanospaceEvent): EventStatus {
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.expiresAt);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'open';
    return 'closed';
}

/**
 * Check if submissions should be visible (for timed drops)
 */
export function shouldShowSubmissions(event: PanospaceEvent): boolean {
    if (event.eventType !== 'timed-drop' && !event.isTimedDrop) {
        return true;
    }

    const now = new Date();
    const dropTime = event.dropTime ? new Date(event.dropTime) : new Date(event.startTime);

    // Show submissions if drop time has passed
    return now >= dropTime;
}

interface SubmitPermission {
    canSubmit: boolean;
    reason: string;
}

/**
 * Check if user can submit to event
 */
export function canSubmitToEvent(event: PanospaceEvent): SubmitPermission {
    const status = getEventStatus(event);

    if (status === 'upcoming' && !event.allowSubmissionsBeforeStart) {
        return { canSubmit: false, reason: 'Event has not started yet' };
    }

    if (status === 'closed' && !event.allowSubmissionsAfterEnd) {
        return { canSubmit: false, reason: 'Event has ended' };
    }

    if (status === 'open' || event.allowSubmissionsBeforeStart || event.allowSubmissionsAfterEnd) {
        return { canSubmit: true, reason: '' };
    }

    return { canSubmit: false, reason: 'Submissions not allowed at this time' };
}
