export const BANNED_TERMS = {
    // --------------------------------------------------------------------------
    // 1. HATE SPEECH & SLURS (STRICT BLOCK)
    // Protected groups: Race, Ethnicity, Religion, Orientation, Gender, Ability
    // --------------------------------------------------------------------------
    SLURS: [
        // Racial/Ethnic
        'nigger', 'nigga', 'n1gger', 'nigg3r', 'n1gg3r', 'nigg4', 'negro', 'kike', 'kyke', 'chink',
        'spic', 'wetback', 'beaner', 'gook', 'raghead', 'towelhead', 'camel jockey',
        'coon', 'jigaboo', 'sambo', 'paki', 'coolie',

        // Antisemitic
        'yid', 'heeb', 'hymie',

        // LGBTQ+
        'faggot', 'fag', 'f@g', 'dyke', 'tranny', 'shemale', 'sodomite', 'batty boy',

        // Ableist (Strict slurs only)
        'retard', 'retarded', 'mongoloid', 'spaz',

        // Hate symbols/phrases
        'white power', 'heil hitler', 'sieg heil', 'kkk', 'ku klux klan'
    ],

    // --------------------------------------------------------------------------
    // 2. DIRECTED VIOLENCE (STRICT BLOCK)
    // Threats, encouragement of harm, death wishes
    // --------------------------------------------------------------------------
    VIOLENCE: [
        'kill you', 'die faggot', 'die nigger', 'kill yourself', 'kys',
        'slit your throat', 'slit your wrists', 'hope you die',
        'rape you', 'shoot you', 'murder you', 'beat you to death',
        'hang yourself', 'drink bleach', 'take your own life'
    ],

    // --------------------------------------------------------------------------
    // 3. SEXUAL VIOLENCE & EXTREME CONTENT
    // Non-consensual sexual content refs
    // --------------------------------------------------------------------------
    SEXUAL_VIOLENCE: [
        'rape', 'rapist', 'raped', 'molest', 'molester', 'molested',
        'touch kids', 'pedophile', 'pedo', 'child porn', 'cp',
        'non-con', 'forced sex', 'gang bang', 'gangbang' // Context dependent but safer to block in v1
    ]
};

// --------------------------------------------------------------------------
// EXCEPTIONS (ALLOW LIST)
// Words that might be false positives if used in medical/clinical context,
// but for v1 we are strict. This list is for future fine-tuning.
// --------------------------------------------------------------------------
export const EXCEPTIONS = [
    'therapist', // Contains 'rapist'
    'drape',     // Contains 'rape'
    'grape',     // Contains 'rape'
    'scrape',    // Contains 'rape'
    'trapezoid', // Contains 'rape'
    'analytical',// Contains 'anal'
    'assassin',  // Contains 'ass'
    'pass',      // Contains 'ass'
    'glass',     // Contains 'ass'
    'class',     // Contains 'ass'
    'snigger'    // Contains valid word often confused with slur
];
