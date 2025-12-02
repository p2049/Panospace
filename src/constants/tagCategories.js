import { aestheticTags, styleTags, subjectTags, locationTags, natureTypeTags, technicalTags, gearTags, eventTags, filmTags } from '../data/defaultTags';

// Export individual tag arrays for direct use
export { aestheticTags, styleTags, subjectTags, locationTags, natureTypeTags, technicalTags, gearTags, eventTags, filmTags };

// Tag categories object mapping
export const tagCategories = {
    aesthetic: aestheticTags,
    style: styleTags,
    subject: subjectTags,
    location: locationTags,
    nature: natureTypeTags,
    technical: technicalTags,
    gear: gearTags,
    events: eventTags,
    film: filmTags
};

// All tags combined
export const ALL_TAGS = [
    ...aestheticTags,
    ...styleTags,
    ...subjectTags,
    ...locationTags,
    ...natureTypeTags,
    ...technicalTags,
    ...gearTags,
    ...eventTags,
    ...filmTags
];

// TAG_CATEGORIES for Search UI (with metadata)
export const TAG_CATEGORIES = {
    TECHNICAL: {
        id: 'technical',
        label: 'Technical & Gear',
        description: 'Camera, lens, film stock, settings',
        examples: [...technicalTags, ...gearTags]
    },
    EVENT: {
        id: 'event',
        label: 'Contests & Events',
        description: 'Time-based tags, holidays, seasons',
        examples: eventTags
    },
    AESTHETIC: {
        id: 'aesthetic',
        label: 'Aesthetic',
        description: 'Visual style and mood',
        examples: aestheticTags
    },
    NATURE_TYPE: {
        id: 'nature_type',
        label: 'Nature Types',
        description: 'Natural environments and elements',
        examples: natureTypeTags
    },
    SUBJECT: {
        id: 'subject',
        label: 'Subject',
        description: 'What is in the photo',
        examples: subjectTags
    },
    LOCATION: {
        id: 'location',
        label: 'Location',
        description: 'Places, regions, cities',
        examples: locationTags
    },
    STYLE: {
        id: 'style',
        label: 'Style',
        description: 'Photography techniques and genres',
        examples: styleTags
    },
    FILM: {
        id: 'film',
        label: 'Film',
        description: 'Film stock and format tags',
        examples: filmTags
    }
};

// Helper to determine category for a given tag string
export const getTagCategory = (tag) => {
    const lowerTag = tag.toLowerCase();

    // Check explicit lists first
    for (const [catKey, catDef] of Object.entries(TAG_CATEGORIES)) {
        if (catDef.examples.some(ex => lowerTag.includes(ex.toLowerCase()))) {
            return catKey;
        }
    }

    // Heuristics
    if (lowerTag.startsWith('iso') || lowerTag.match(/f\d/) || lowerTag.endsWith('mm')) return 'TECHNICAL';
    if (lowerTag.includes('contest') || lowerTag.includes('challenge')) return 'EVENT';
    if (lowerTag.includes('film') || lowerTag.includes('35mm') || lowerTag.includes('kodak') || lowerTag.includes('portra')) return 'FILM';
    if (lowerTag.includes('202') || lowerTag.includes('july') || lowerTag.includes('summer')) return 'EVENT';

    return 'STYLE'; // Default fallback
};
