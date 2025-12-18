import { BANNED_TERMS, EXCEPTIONS } from './blacklists';

/**
 * Normalizes text for moderation analysis
 * - Lowercases
 * - Removes repeated characters (e.g. "heeeellllo" -> "helo") for fuzzy matching
 * - Removes spaces and common obfuscating characters for strict checking
 */
const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]/g, ''); // Keep only alphanumeric
};

const normalizeRepeatedChars = (text) => {
    return text.replace(/(.)\1+/g, '$1'); // "heeeellllo" -> "helo"
};

/**
 * Checks if text contains any banned terms
 * @param {string} text - The input text to check
 * @returns {object} result - { allowed: boolean, type: string|null }
 */
export const checkContent = (text) => {
    if (!text || typeof text !== 'string') return { allowed: true };

    const cleanText = text.toLowerCase();

    // 1. EXACT PHRASE CHECK (Preserves spaces)
    // Useful for multi-word phrases like "kill yourself"
    for (const phrase of BANNED_TERMS.VIOLENCE) {
        if (cleanText.includes(phrase)) {
            return { allowed: false, type: 'violence' };
        }
    }

    // 2. STRICT NORMALIZED CHECK (Removes spaces/symbols)
    // Catches "n i g g e r", "f.a.g", etc.
    const normalizedNoSpaces = normalizeText(text);

    // Check exceptions first (e.g. "therapist" contains "rapist")
    const isException = EXCEPTIONS.some(ex => normalizedNoSpaces.includes(normalizeText(ex)));
    if (isException) {
        // If it's an exception, we might still need to check strict slurs if they aren't part of the exception word
        // But for v1, simple exception pass might be risky. 
        // Better approach: if match found, check if it equals an exception or is contained in an exception?
        // Let's refine: We iterate banned terms. If normalized text contains a banned term...
    }

    // 2a. Slurs Check
    for (const slur of BANNED_TERMS.SLURS) {
        const normalizedSlur = normalizeText(slur);
        if (normalizedNoSpaces.includes(normalizedSlur)) {
            // Exception Check: Verify this hit isn't actually a safe word
            // e.g. input "Scrape the paint" -> norm "scrapethepaint" -> contains "rape"
            // This is the hard part of "remove spaces" logic. 
            // "Strict normalized check" is aggressive. 
            // Alternative: "Collapsed check" only for single word slurs?

            // Refined Logic:
            // Only perform strict no-space check on specific short slurs if they are clearly obfuscated?
            // Or rely on the "Intent Rule" - strict strict strict.
            // But "drape" -> "rape" match is a false positive.
            // We need to be careful with common substrings.

            // Filter out safe superstrings for matches
            // If match is "rape", check if the surrounding context in cleanText allows it.
            // But we stripped spaces.

            // Let's rely on standard word boundary check first, then strict check for known obfuscations.

            // Actually, for "n i g g e r" type obfuscation, checking normalizedNoSpaces is best.
            // But "drape" becomes "drape". "rape" is in "drape".
            // We need a list of exceptions that *contain* banned words.

            let isSafe = false;
            for (const exc of EXCEPTIONS) {
                const normExc = normalizeText(exc);
                // If the hit is part of an exception, ignore?
                // Complex without indices.
                // Let's skip strict no-space check for short common substrings if we can't be sure, 
                // but prioritize SLURS. Most racial slurs don't appear in common words like "rape" does.
                if (normExc.includes(normalizedSlur) && normalizedNoSpaces.includes(normExc)) {
                    // The slur is part of an exception, and the input contains the exception.
                    // e.g. Slur="rape", Exception="drape", Input="drape" -> Norm="drape"
                    // "drape" includes "rape". "drape" includes "drape".
                    // This is a rough heuristic.
                    isSafe = true;
                }
            }
            if (isSafe && BANNED_TERMS.SEXUAL_VIOLENCE.includes(slur)) continue; // Allow if it was caught by a sexual violence term that is a substring

            // For racial slurs, they are rarely inside common words (except "nig" in "night"? - "nig" is usually "nigger" or "nigga" in list)
            // "tit" in "title" - "tit" is not in our hate speech list.

            // If it's a specific racial/hate slur, block it even inside other chars unless exception list handles it.
            return { allowed: false, type: 'hate_speech' };
        }
    }

    // 2b. Sexual Violence Check (Similar strictness but careful of exceptions)
    for (const term of BANNED_TERMS.SEXUAL_VIOLENCE) {
        const normalizedTerm = normalizeText(term);
        // Special handling for "rape" as it's common in "grape", "drape"
        if (normalizedNoSpaces.includes(normalizedTerm)) {
            // Exception Check
            let isSafe = false;
            for (const exc of EXCEPTIONS) {
                const normExc = normalizeText(exc);
                if (normExc.includes(normalizedTerm) && normalizedNoSpaces.includes(normExc)) {
                    isSafe = true;
                    break;
                }
            }
            if (isSafe) continue;

            return { allowed: false, type: 'sexual_violence' };
        }
    }

    // 3. REPEATED CHARACTER COLLAPSE CHECK
    // "niiiigggeeer" -> "niger" (matches fuzzy)
    const collapsed = normalizeRepeatedChars(cleanText);
    for (const slur of BANNED_TERMS.SLURS) {
        if (collapsed.includes(slur)) return { allowed: false, type: 'hate_speech' };
    }

    return { allowed: true };
};
