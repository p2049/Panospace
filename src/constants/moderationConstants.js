// Report Categories and Reasons

export const REPORT_CATEGORIES = {
    SAFETY: 'safety',
    ART_INTEGRITY: 'art_integrity',
    TAG_MISUSE: 'tag_misuse',
    MARKETPLACE_FRAUD: 'marketplace_fraud'
};

export const REPORT_REASONS = {
    // Safety & Content
    [REPORT_CATEGORIES.SAFETY]: {
        nudity: { label: 'Nudity/Sexual Content', severity: 'high' },
        violence: { label: 'Violence', severity: 'high' },
        hate: { label: 'Hate/Harassment', severity: 'high' },
        dangerous: { label: 'Dangerous/Illegal Content', severity: 'critical' }
    },

    // Art Integrity
    [REPORT_CATEGORIES.ART_INTEGRITY]: {
        stolen: { label: 'Stolen Artwork', severity: 'high' },
        reposted: { label: 'Reposted Without Credit', severity: 'medium' },
        non_original: { label: 'Non-Original Work Sold as Print', severity: 'high' },
        ai_generated: { label: 'AI-Generated Content', severity: 'medium' },
        meme_spam: { label: 'Meme/Non-Art Spam', severity: 'low' }
    },

    // Tag Misuse
    [REPORT_CATEGORIES.TAG_MISUSE]: {
        wrong_wildlife: { label: 'Wrong Wildlife/Animal Tags', severity: 'low' },
        false_film: { label: 'False Film Tags', severity: 'low' },
        wrong_location: { label: 'Wrong Park/Location Tags', severity: 'low' },
        keyword_stuffing: { label: 'Keyword Stuffing', severity: 'medium' }
    },

    // Marketplace Fraud
    [REPORT_CATEGORIES.MARKETPLACE_FRAUD]: {
        scam: { label: 'Scam Attempt', severity: 'critical' },
        fake_listing: { label: 'Fake Listing', severity: 'high' },
        misrepresented: { label: 'Misrepresented Prints/Cards', severity: 'medium' }
    }
};

export const MODERATION_THRESHOLDS = {
    FLAGGED: 1,              // Mark as flagged
    HIDE_EXPLORE: 3,         // Hide from Explore (24h window)
    HIDE_SEARCH: 5,          // Hide from search results
    ADMIN_REVIEW: 10,        // Require admin review
    AUTO_HIDE: 15            // Auto-hide from all feeds
};

export const MODERATION_STATUS = {
    ACTIVE: 'active',
    FLAGGED: 'flagged',
    HIDDEN: 'hidden',
    REMOVED: 'removed'
};

export const REPORT_STATUS = {
    PENDING: 'pending',
    REVIEWED: 'reviewed',
    DISMISSED: 'dismissed',
    ACTIONED: 'actioned'
};
