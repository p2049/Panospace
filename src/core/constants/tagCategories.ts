/**
 * Tag Categories Configuration
 * Master taxonomy with 9 categories
 */

import {
    ART_TYPES,
    ENVIRONMENT_TAGS,
    COLOR_TAGS,
    AESTHETIC_TAGS,
    LOCATION_TAGS,
    OBJECT_TAGS,
    TECHNIQUE_TAGS,
    PORTRAIT_TAGS,
    ANIMAL_TAGS,
    TIME_TAGS,
    WRITING_TAGS,
    ALL_TAGS,
    tagCategories,
    type TagMap
} from './tagConfig';

// Export all tag objects
export {
    ART_TYPES,
    ENVIRONMENT_TAGS,
    COLOR_TAGS,
    AESTHETIC_TAGS,
    LOCATION_TAGS,
    OBJECT_TAGS,
    TECHNIQUE_TAGS,
    PORTRAIT_TAGS,
    ANIMAL_TAGS,
    TIME_TAGS,
    WRITING_TAGS,
    ALL_TAGS,
    tagCategories
};

interface TagCategoryDefinition {
    id: string;
    label: string;
    subcategories: TagMap;
}

// TAG_CATEGORIES for Search UI (with metadata and subcategories)
export const TAG_CATEGORIES: Record<string, TagCategoryDefinition> = {
    ART_TYPES: {
        id: 'art_types',
        label: 'Art Types',
        subcategories: ART_TYPES
    },
    WRITING: {
        id: 'writing',
        label: 'Writing',
        subcategories: WRITING_TAGS
    },
    ENVIRONMENT: {
        id: 'environment',
        label: 'Environment',
        subcategories: ENVIRONMENT_TAGS
    },
    COLOR: {
        id: 'color',
        label: 'Color',
        subcategories: COLOR_TAGS
    },
    AESTHETICS: {
        id: 'aesthetics',
        label: 'Aesthetics',
        subcategories: AESTHETIC_TAGS
    },
    LOCATION: {
        id: 'location',
        label: 'Location',
        subcategories: LOCATION_TAGS
    },
    OBJECTS: {
        id: 'objects',
        label: 'Objects',
        subcategories: OBJECT_TAGS
    },
    TECHNIQUE: {
        id: 'technique',
        label: 'Technique',
        subcategories: TECHNIQUE_TAGS
    },
    PORTRAITS: {
        id: 'portraits',
        label: 'Portraits',
        subcategories: PORTRAIT_TAGS
    },
    ANIMALS: {
        id: 'animals',
        label: 'Animals',
        subcategories: ANIMAL_TAGS
    },
    TIME: {
        id: 'time',
        label: 'Time',
        subcategories: TIME_TAGS
    }
};

// Helper to determine category for a given tag string
export const getTagCategory = (tag: string): string => {
    const lowerTag = tag.toLowerCase();

    // Check each category's subcategories
    for (const [catKey, catDef] of Object.entries(TAG_CATEGORIES)) {
        for (const subcatTags of Object.values(catDef.subcategories)) {
            if (subcatTags.some(t => lowerTag === t.toLowerCase())) {
                return catKey;
            }
        }
    }

    return 'ENVIRONMENT'; // Default fallback
};
