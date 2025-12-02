// PhotoDex Subject Database
// Expandable database of subjects that can earn badges

export const PHOTODEX_TYPES = {
    ANIMAL: 'animal',
    BIRD: 'bird',
    INSECT: 'insect',
    PLANT: 'plant',
    LANDSCAPE: 'landscape',
    CELESTIAL: 'celestial',
    PARK: 'park',
    EVENT: 'event'
};

export const PHOTODEX_SUBJECTS = {
    // Mammals
    white_tailed_deer: {
        name: 'White-tailed Deer',
        type: PHOTODEX_TYPES.ANIMAL,
        rarity: 5,
        category: 'mammals',
        description: 'Common North American deer species'
    },
    red_fox: {
        name: 'Red Fox',
        type: PHOTODEX_TYPES.ANIMAL,
        rarity: 6,
        category: 'mammals',
        description: 'Clever canine with distinctive red coat'
    },
    black_bear: {
        name: 'Black Bear',
        type: PHOTODEX_TYPES.ANIMAL,
        rarity: 7,
        category: 'mammals',
        description: 'North American bear species'
    },
    gray_wolf: {
        name: 'Gray Wolf',
        type: PHOTODEX_TYPES.ANIMAL,
        rarity: 8,
        category: 'mammals',
        description: 'Apex predator and pack hunter'
    },
    mountain_lion: {
        name: 'Mountain Lion',
        type: PHOTODEX_TYPES.ANIMAL,
        rarity: 9,
        category: 'mammals',
        description: 'Elusive big cat of the Americas'
    },

    // Birds
    bald_eagle: {
        name: 'Bald Eagle',
        type: PHOTODEX_TYPES.BIRD,
        rarity: 7,
        category: 'birds_of_prey',
        description: 'Iconic American raptor'
    },
    red_tailed_hawk: {
        name: 'Red-tailed Hawk',
        type: PHOTODEX_TYPES.BIRD,
        rarity: 5,
        category: 'birds_of_prey',
        description: 'Common North American hawk'
    },
    great_blue_heron: {
        name: 'Great Blue Heron',
        type: PHOTODEX_TYPES.BIRD,
        rarity: 6,
        category: 'wading_birds',
        description: 'Large wading bird'
    },
    snowy_owl: {
        name: 'Snowy Owl',
        type: PHOTODEX_TYPES.BIRD,
        rarity: 8,
        category: 'owls',
        description: 'Arctic owl with white plumage'
    },

    // National Parks
    yosemite_np: {
        name: 'Yosemite National Park',
        type: PHOTODEX_TYPES.PARK,
        rarity: 6,
        category: 'national_parks',
        description: 'Iconic California park with granite cliffs'
    },
    yellowstone_np: {
        name: 'Yellowstone National Park',
        type: PHOTODEX_TYPES.PARK,
        rarity: 6,
        category: 'national_parks',
        description: 'First national park, known for geysers'
    },
    grand_canyon_np: {
        name: 'Grand Canyon National Park',
        type: PHOTODEX_TYPES.PARK,
        rarity: 6,
        category: 'national_parks',
        description: 'Massive canyon carved by Colorado River'
    },
    zion_np: {
        name: 'Zion National Park',
        type: PHOTODEX_TYPES.PARK,
        rarity: 7,
        category: 'national_parks',
        description: 'Utah park with red rock canyons'
    },

    // Celestial Events
    aurora_borealis: {
        name: 'Aurora Borealis',
        type: PHOTODEX_TYPES.CELESTIAL,
        rarity: 9,
        category: 'phenomena',
        description: 'Northern Lights display'
    },
    milky_way: {
        name: 'Milky Way',
        type: PHOTODEX_TYPES.CELESTIAL,
        rarity: 7,
        category: 'sky',
        description: 'Our home galaxy visible at night'
    },
    total_solar_eclipse: {
        name: 'Total Solar Eclipse',
        type: PHOTODEX_TYPES.CELESTIAL,
        rarity: 10,
        category: 'phenomena',
        description: 'Rare alignment of sun, moon, and Earth'
    },
    meteor_shower: {
        name: 'Meteor Shower',
        type: PHOTODEX_TYPES.CELESTIAL,
        rarity: 6,
        category: 'phenomena',
        description: 'Streaks of light from space debris'
    },

    // Landscapes
    mountain_peak: {
        name: 'Mountain Peak',
        type: PHOTODEX_TYPES.LANDSCAPE,
        rarity: 5,
        category: 'mountains',
        description: 'Summit of a mountain'
    },
    waterfall: {
        name: 'Waterfall',
        type: PHOTODEX_TYPES.LANDSCAPE,
        rarity: 5,
        category: 'water',
        description: 'Cascading water feature'
    },
    desert_landscape: {
        name: 'Desert Landscape',
        type: PHOTODEX_TYPES.LANDSCAPE,
        rarity: 4,
        category: 'desert',
        description: 'Arid terrain with unique beauty'
    },

    // Plants
    wildflower_meadow: {
        name: 'Wildflower Meadow',
        type: PHOTODEX_TYPES.PLANT,
        rarity: 5,
        category: 'flowers',
        description: 'Field of blooming wildflowers'
    },
    giant_sequoia: {
        name: 'Giant Sequoia',
        type: PHOTODEX_TYPES.PLANT,
        rarity: 7,
        category: 'trees',
        description: 'Massive ancient tree species'
    },
    cherry_blossom: {
        name: 'Cherry Blossom',
        type: PHOTODEX_TYPES.PLANT,
        rarity: 6,
        category: 'flowers',
        description: 'Delicate pink spring flowers'
    }
};

// Normalize subject key (convert to lowercase, replace spaces with underscores)
export function normalizeSubjectKey(subject) {
    return subject.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

// Get subject by normalized key
export function getSubject(key) {
    const normalized = normalizeSubjectKey(key);
    return PHOTODEX_SUBJECTS[normalized];
}

// Get all subjects by type
export function getSubjectsByType(type) {
    return Object.entries(PHOTODEX_SUBJECTS)
        .filter(([_, subject]) => subject.type === type)
        .map(([key, subject]) => ({ key, ...subject }));
}

// Get all subjects by category
export function getSubjectsByCategory(category) {
    return Object.entries(PHOTODEX_SUBJECTS)
        .filter(([_, subject]) => subject.category === category)
        .map(([key, subject]) => ({ key, ...subject }));
}

// Reward milestones
export const REWARD_MILESTONES = {
    1000: {
        type: 'boost_token',
        value: 1,
        description: 'Post Boost Token',
        icon: '🚀'
    },
    5000: {
        type: 'print_discount',
        value: 0.10,
        description: '10% Print Discount',
        icon: '🎟️'
    },
    10000: {
        type: 'premium_trial',
        value: 7,
        description: '7 Days Premium Trial',
        icon: '⭐'
    },
    25000: {
        type: 'print_discount',
        value: 0.25,
        description: '25% Print Discount',
        icon: '🎫'
    },
    50000: {
        type: 'custom',
        value: 'legendary_badge',
        description: 'Legendary Collector Badge',
        icon: '👑'
    }
};
