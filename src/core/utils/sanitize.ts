/**
 * Input Sanitization Utility
 * 
 * Provides robust sanitization for user-generated content to prevent XSS,
 * layout breaking, and other injection attacks while preserving legitimate content
 * like emojis and international characters.
 */

interface SanitizeOptions {
    allowNewLines?: boolean;
    maxLength?: number | null;
}

export const sanitize = (input: any, { allowNewLines = true, maxLength = null }: SanitizeOptions = {}): string => {
    // 1. Handle non-string inputs
    if (input === null || input === undefined) return '';
    if (typeof input !== 'string') return String(input);

    // 2. Strip HTML using DOMParser
    // This is the safest way to strip HTML tags without executing scripts
    // or loading external resources.
    let text = input;
    try {
        const doc = new DOMParser().parseFromString(input, 'text/html');
        text = doc.body.textContent || "";
    } catch (e) {
        // Fallback for non-browser environments (though this is a React app)
        // Simple regex fallback if DOMParser fails
        text = input.replace(/<[^>]*>/g, '');
    }

    // 3. Remove dangerous control characters
    // We keep:
    // - \x09 (Tab)
    // - \x0A (Line Feed)
    // - \x0D (Carriage Return)
    // - \x20-\x7E (Printable ASCII)
    // - \x80-\uFFFF (Unicode, including Emojis)
    // We remove:
    // - \x00-\x08 (Null, Bell, Backspace, etc.)
    // - \x0B (Vertical Tab)
    // - \x0C (Form Feed)
    // - \x0E-\x1F (Shift Out/In, Device Controls)
    // - \x7F (Delete)
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // 4. Handle Zalgo / Excessive Combining Characters
    // Normalizing to NFKC (Compatibility Decomposition, followed by Canonical Composition)
    // helps collapse compatible characters and reduces visual spoofing risks.
    text = text.normalize('NFKC');

    // 5. Handle Newlines
    if (!allowNewLines) {
        text = text.replace(/[\r\n]+/g, ' ');
    }

    // 6. Enforce Max Length (if specified)
    if (maxLength && text.length > maxLength) {
        text = text.slice(0, maxLength);
    }

    // 7. Final Trim
    return text.trim();
};

// Helper for specific fields
export const sanitizeTitle = (input: any) => sanitize(input, { allowNewLines: false, maxLength: 200 });
export const sanitizeDescription = (input: any) => sanitize(input, { allowNewLines: true, maxLength: 2000 });
export const sanitizeComment = (input: any) => sanitize(input, { allowNewLines: true, maxLength: 500 });
export const sanitizeBio = (input: any) => sanitize(input, { allowNewLines: true, maxLength: 500 });
export const sanitizeDisplayName = (input: any) => sanitize(input, { allowNewLines: false, maxLength: 50 });
export const sanitizeTag = (input: any) => sanitize(input, { allowNewLines: false, maxLength: 30 }).toLowerCase();
