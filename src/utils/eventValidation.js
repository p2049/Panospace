/**
 * Event Validation Utilities
 * Validates post submissions against event requirements
 */

import { getDerivedDate } from './dateHelpers';

/**
 * Validates a post against event requirements
 * @param {Object} post - The post to validate
 * @param {Object} event - The event with requirements
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateSubmission(post, event) {
    const errors = [];

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
        const derivedDate = getDerivedDate(post);
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

/**
 * Get event status based on timing
 * @param {Object} event - The event
 * @returns {string} - 'upcoming' | 'open' | 'closed'
 */
export function getEventStatus(event) {
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.expiresAt);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'open';
    return 'closed';
}

/**
 * Check if submissions should be visible (for timed drops)
 * @param {Object} event - The event
 * @returns {boolean}
 */
export function shouldShowSubmissions(event) {
    if (event.eventType !== 'timed-drop' && !event.isTimedDrop) {
        return true;
    }

    const status = getEventStatus(event);
    const now = new Date();
    const dropTime = event.dropTime ? new Date(event.dropTime) : new Date(event.startTime);

    // Show submissions if drop time has passed
    return now >= dropTime;
}

/**
 * Check if user can submit to event
 * @param {Object} event - The event
 * @returns {Object} - { canSubmit: boolean, reason: string }
 */
export function canSubmitToEvent(event) {
    const status = getEventStatus(event);
    const now = new Date();

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
