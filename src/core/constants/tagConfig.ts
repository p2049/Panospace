/**
 * MASTER TAG TAXONOMY FOR PANOSPACE
 * FINAL PERFECTED TAG SYSTEM
 * CATEGORY → SUBCATEGORY → TAG
 * NO AI ART ALLOWED
 */

export type TagMap = Record<string, string[]>;

// ============================================================================
// 1. ART TYPES
// ============================================================================
export const ART_TYPES: TagMap = {
    Photography: [
        'macro', 'micro', 'drone', 'aerial', 'film', 'analog', 'polaroid', 'black-and-white',
        'hdr', 'long-exposure', 'slow-shutter', 'time-lapse', 'astrophotography',
        'night-photography', 'infrared', 'ultraviolet', 'underwater', 'wildlife-photography',
        'street', 'documentary', 'editorial', 'fashion-photography', 'commercial',
        'product-photo', 'architecture-photo', 'real-estate', 'automotive', 'fine-art-photo',
        'experimental-photo', 'mobile-photography', 'landscape-photo', 'portrait-photo',
        'event-photo', 'wedding-photo', 'sports-photo'
    ],
    Drawing: [
        'sketch', 'graphite', 'ink', 'micron-pen', 'charcoal', 'contour-drawing', 'stippling',
        'hatching', 'cross-hatching', 'illustration', 'figure-drawing', 'comic-style',
        'storyboard', 'portrait-drawing', 'urban-sketching'
    ],
    Painting: [
        'watercolor', 'gouache', 'acrylic', 'oil-painting', 'plein-air', 'mural', 'impasto',
        'abstract-painting', 'realistic-painting', 'surreal-painting', 'portrait-painting',
        'landscape-painting'
    ],
    Design: [
        'graphic-design', 'typography', 'poster-design', 'branding', 'album-art', 'logo-design',
        'book-cover', 'editorial-layout', 'digital-collage', 'mixed-media', 'minimalist-design',
        'geometric-design'
    ],
    'Crafts / Handmade': [
        'printmaking', 'lino-print', 'woodcut', 'ceramics', 'pottery', 'sculpture', 'clay-art',
        'resin-art', 'handmade-paper', 'textile-art'
    ]
};

// ============================================================================
// 2. ENVIRONMENT (Nature & Landscape)
// ============================================================================
export const ENVIRONMENT_TAGS: TagMap = {
    Landforms: [
        'mountain', 'hill', 'valley', 'canyon', 'cliffs', 'plateau', 'desert', 'dunes',
        'tundra', 'rainforest', 'forest', 'jungle', 'meadow', 'grassland', 'wetland',
        'swamp', 'bog', 'volcanic', 'glacier', 'alpine'
    ],
    Water: [
        'ocean', 'sea', 'beach', 'coastline', 'lake', 'river', 'waterfall', 'stream',
        'lagoon', 'bay', 'fjord', 'reef', 'tidepools', 'icebergs'
    ],
    Weather: [
        'clear-sky', 'cloudy', 'fog', 'mist', 'haze', 'smoke', 'dust', 'rain', 'drizzle',
        'storm', 'thunderstorm', 'lightning', 'snow', 'blizzard', 'frost', 'hail', 'windy',
        'sandstorm'
    ],
    'Sky / Atmosphere': [
        'sunrise', 'sunset', 'golden-hour', 'blue-hour', 'twilight', 'dusk', 'night-sky',
        'moon', 'stars', 'milky-way', 'aurora', 'rainbow', 'dramatic-clouds'
    ],
    'Climate Zones': [
        'tropical', 'temperate', 'arctic', 'desert-climate', 'monsoon', 'rainforest-climate'
    ],
    Perspective: [
        'aerial-view', 'drone-view', 'panoramic', 'wide-angle', 'telephoto', 'ground-view',
        'lookout', 'underwater-view', 'cave-interior', 'forest-path'
    ]
};

// ============================================================================
// 3. COLOR
// ============================================================================
export const COLOR_TAGS: TagMap = {
    'Basic Colors': [
        'red', 'orange', 'yellow', 'green', 'blue', 'teal', 'cyan', 'purple', 'pink',
        'magenta', 'brown', 'black', 'white', 'gray'
    ],
    'Aesthetic Palettes': [
        'pastel', 'neon', 'vibrant', 'muted', 'warm-tones', 'cool-tones', 'monochrome',
        'earth-tones', 'jewel-tones'
    ],
    'Lighting Color': [
        'golden-hour', 'blue-hour', 'tungsten', 'fluorescent', 'natural-light', 'neon-light',
        'candlelight'
    ]
};

// ============================================================================
// 4. AESTHETICS
// ============================================================================
export const AESTHETIC_TAGS: TagMap = {
    'Era / Style': [
        'vintage', 'retro', 'y2k', 'grunge', 'cyberpunk', 'vaporwave', 'synthwave',
        'lomography'
    ],
    'Mood Aesthetics': [
        'cinematic', 'dreamy', 'moody', 'ethereal', 'cozy', 'whimsical', 'dramatic',
        'soft', 'crisp', 'dark-academia', 'light-academia'
    ],
    'Textural Aesthetics': [
        'grainy', 'glossy', 'matte', 'textured', 'foggy', 'smoky', 'bokeh-heavy',
        'abstract', 'surreal'
    ]
};

// ============================================================================
// 5. LOCATION
// ============================================================================
export const LOCATION_TAGS: TagMap = {
    Urban: [
        'cityscape', 'skyline', 'downtown', 'street', 'alley', 'rooftop', 'subway',
        'parking-garage', 'crosswalk'
    ],
    Rural: [
        'countryside', 'farmland', 'barn', 'dirt-road', 'ranch', 'small-town'
    ],
    Interior: [
        'studio', 'living-room', 'bedroom', 'kitchen', 'cafe', 'restaurant', 'museum',
        'gallery'
    ],
    Exterior: [
        'park', 'plaza', 'garden', 'greenhouse', 'courtyard'
    ],
    'Transit / Movement': [
        'airport', 'train-station', 'bus-stop', 'highway', 'bridge', 'harbor', 'marina'
    ]
};

// ============================================================================
// 6. OBJECTS
// ============================================================================
export const OBJECT_TAGS: TagMap = {
    Vehicles: [
        'car', 'supercar', 'classic-car', 'motorcycle', 'racecar', 'drift-car', 'off-road',
        'boat', 'yacht', 'airplane', 'helicopter', 'train'
    ],
    'Everyday Items': [
        'watch', 'jewelry', 'phone', 'camera', 'laptop', 'guitar', 'violin', 'shoes',
        'book', 'flowers'
    ],
    Products: [
        'cosmetics', 'perfume', 'sneakers', 'drink', 'coffee', 'tea', 'tech-device',
        'packaging'
    ]
};

// ============================================================================
// 7. TECHNIQUE
// ============================================================================
export const TECHNIQUE_TAGS: TagMap = {
    'Focus / Lens Types': [
        'macro', 'micro', 'wide-angle', 'ultra-wide', 'telephoto', 'fisheye',
        'shallow-depth', 'deep-focus', 'focus-stack', 'manual-focus'
    ],
    Exposure: [
        'long-exposure', 'motion-blur', 'freeze-motion', 'hdr', 'light-painting',
        'time-blend', 'night-exposure'
    ],
    Composition: [
        'rule-of-thirds', 'leading-lines', 'symmetry', 'patterns', 'negative-space',
        'reflections', 'silhouettes', 'framing-elements'
    ],
    'Stylistic / Advanced': [
        'tilt-shift', 'infrared-photo', 'ultraviolet-photo', 'selective-color',
        'double-exposure', 'grain'
    ]
};

// ============================================================================
// 8. PORTRAITS
// ============================================================================
export const PORTRAIT_TAGS: TagMap = {
    'Portrait Types': [
        'portrait', 'self-portrait', 'candid', 'editorial', 'fashion-portrait',
        'lifestyle', 'documentary-portrait'
    ],
    Lighting: [
        'soft-light', 'hard-light', 'natural-light', 'backlit', 'rim-light', 'silhouette',
        'neon-light', 'window-light'
    ],
    Subjects: [
        'model', 'couple', 'family', 'child', 'newborn', 'senior', 'athlete'
    ],
    Framing: [
        'headshot', 'half-body', 'full-body', 'close-up', 'profile-view'
    ]
};

// ============================================================================
// 9. ANIMALS
// ============================================================================
export const ANIMAL_TAGS: TagMap = {
    Mammals: [
        'lion', 'tiger', 'cheetah', 'leopard', 'jaguar', 'wolf', 'fox', 'elephant',
        'giraffe', 'zebra', 'buffalo', 'bison', 'moose', 'elk', 'deer', 'bear', 'rhino', 'hippo'
    ],
    'Marine Mammals': [
        'whale', 'dolphin', 'orca', 'seal', 'sea-lion', 'walrus', 'manatee'
    ],
    Birds: [
        'eagle', 'hawk', 'falcon', 'owl', 'vulture', 'duck', 'goose', 'swan', 'heron',
        'crane', 'pelican', 'parrot', 'macaw', 'flamingo', 'hummingbird', 'puffin'
    ],
    Reptiles: [
        'snake', 'lizard', 'gecko', 'turtle', 'crocodile', 'alligator'
    ],
    Amphibians: [
        'frog', 'toad', 'salamander'
    ],
    'Marine Life': [
        'shark', 'stingray', 'manta-ray', 'eel', 'octopus', 'squid', 'jellyfish',
        'starfish', 'coral', 'crab', 'lobster', 'sea-urchin'
    ]
};

// ============================================================================
// 10. TIME
// ============================================================================
export const TIME_TAGS: TagMap = {
    'Time of Day': [
        'sunrise', 'morning', 'noon', 'afternoon', 'golden-hour', 'sunset', 'twilight',
        'blue-hour', 'night'
    ],
    Seasons: [
        'winter', 'spring', 'summer', 'autumn', 'fall-colors'
    ],
    'Lighting Conditions': [
        'natural-light', 'low-light', 'high-contrast', 'soft-light', 'harsh-light', 'backlit'
    ]
};

// ============================================================================
// HELPER FUNCTIONS TO FLATTEN SUBCATEGORIES
// ============================================================================

const flattenTags = (tagObject: TagMap): string[] => {
    return Object.values(tagObject).flat();
};

// Flattened arrays for backwards compatibility
export const ART_TYPES_FLAT = flattenTags(ART_TYPES);
export const ENVIRONMENT_TAGS_FLAT = flattenTags(ENVIRONMENT_TAGS);
export const COLOR_TAGS_FLAT = flattenTags(COLOR_TAGS);
export const AESTHETIC_TAGS_FLAT = flattenTags(AESTHETIC_TAGS);
export const LOCATION_TAGS_FLAT = flattenTags(LOCATION_TAGS);
export const OBJECT_TAGS_FLAT = flattenTags(OBJECT_TAGS);
export const TECHNIQUE_TAGS_FLAT = flattenTags(TECHNIQUE_TAGS);
export const PORTRAIT_TAGS_FLAT = flattenTags(PORTRAIT_TAGS);
export const ANIMAL_TAGS_FLAT = flattenTags(ANIMAL_TAGS);
export const TIME_TAGS_FLAT = flattenTags(TIME_TAGS);

// Legacy exports (mapped to new structure)
export const aestheticTags = AESTHETIC_TAGS_FLAT;
export const styleTags = [...ART_TYPES_FLAT, ...ENVIRONMENT_TAGS_FLAT, ...LOCATION_TAGS_FLAT]; // Rough mapping
export const subjectTags = [...ANIMAL_TAGS_FLAT, ...OBJECT_TAGS_FLAT];
export const natureTypeTags = ENVIRONMENT_TAGS_FLAT;
export const locationTags = LOCATION_TAGS_FLAT;
export const technicalTags = TECHNIQUE_TAGS_FLAT;
export const gearTags = OBJECT_TAGS['Everyday Items']; // Approximation
export const eventTags = TIME_TAGS_FLAT; // Approximation
export const filmTags = TECHNIQUE_TAGS_FLAT; // Approximation

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getAllDefaultTags = (): string[] => {
    return [
        ...ART_TYPES_FLAT,
        ...ENVIRONMENT_TAGS_FLAT,
        ...COLOR_TAGS_FLAT,
        ...AESTHETIC_TAGS_FLAT,
        ...LOCATION_TAGS_FLAT,
        ...OBJECT_TAGS_FLAT,
        ...TECHNIQUE_TAGS_FLAT,
        ...PORTRAIT_TAGS_FLAT,
        ...ANIMAL_TAGS_FLAT,
        ...TIME_TAGS_FLAT
    ];
};

export const getTagsByCategory = (category: string): string[] => {
    const categoryMap: Record<string, string[]> = {
        'art_types': ART_TYPES_FLAT,
        'environment': ENVIRONMENT_TAGS_FLAT,
        'color': COLOR_TAGS_FLAT,
        'aesthetic': AESTHETIC_TAGS_FLAT,
        'aesthetics': AESTHETIC_TAGS_FLAT,
        'location': LOCATION_TAGS_FLAT,
        'objects': OBJECT_TAGS_FLAT,
        'technique': TECHNIQUE_TAGS_FLAT,
        'portraits': PORTRAIT_TAGS_FLAT,
        'portrait': PORTRAIT_TAGS_FLAT,
        'animals': ANIMAL_TAGS_FLAT,
        'time': TIME_TAGS_FLAT
    };

    return categoryMap[category] || [];
};

export const tagCategories = {
    art_types: ART_TYPES,
    environment: ENVIRONMENT_TAGS,
    color: COLOR_TAGS,
    aesthetic: AESTHETIC_TAGS,
    location: LOCATION_TAGS,
    objects: OBJECT_TAGS,
    technique: TECHNIQUE_TAGS,
    portraits: PORTRAIT_TAGS,
    animals: ANIMAL_TAGS,
    time: TIME_TAGS
};

export const ALL_TAGS = getAllDefaultTags();

// ============================================================================
// ANIMAL KEYWORDS (for PanoVerse and search)
// ============================================================================
export const ANIMAL_KEYWORDS = ANIMAL_TAGS_FLAT;

// ============================================================================
// PANODEX CATEGORIES
// ============================================================================
export const PANODEX_CATEGORIES = {
    LOCATION: 'location',
    CHALLENGE: 'challenge',
    AUDIO: 'audio',
    LANDMARK: 'landmark',
    STYLE: 'style'
} as const;

export const PANODEX_UNLOCK_TYPES = {
    VISIT: 'visit',
    PHOTO: 'photo',
    AUDIO: 'audio',
    CHALLENGE: 'challenge'
} as const;
