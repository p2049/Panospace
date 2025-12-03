/**
 * Default Tag Library for Panospace
 * Re-exports from centralized tagConfig.js for backwards compatibility
 */

export {
    aestheticTags,
    styleTags,
    subjectTags,
    natureTypeTags,
    locationTags,
    technicalTags,
    gearTags,
    eventTags,
    filmTags,
    getAllDefaultTags,
    getTagsByCategory
} from '../constants/tagConfig';

// For backwards compatibility - export with uppercase names as well
export {
    AESTHETIC_TAGS,
    STYLE_TAGS,
    SUBJECT_TAGS,
    NATURE_TYPE_TAGS,
    LOCATION_TAGS,
    TECHNICAL_TAGS,
    GEAR_TAGS,
    EVENT_TAGS,
    FILM_TAGS
} from '../constants/tagConfig';
